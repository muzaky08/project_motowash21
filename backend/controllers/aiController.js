const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("../db/db");
const { v4: uuidv4 } = require("uuid");
const { getIO } = require("../socket");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

const SYSTEM_INSTRUCTION = `
Kamu adalah "Garasi AI", Asisten Virtual Cerdas dan Modern untuk bengkel "Garasi.21 Motowash".
Tugas utamamu adalah menjawab pertanyaan pelanggan secara LANGSUNG, SPESIFIK, namun TETAP INTERAKTIF dan RAMAH.

INFORMASI LENGKAP (KNOWLEDGE BASE):
1. Kategori Ukuran Motor:
   - M: Matic, Bebek
   - L: Sport 150-250cc
   - XL: Sport >250cc, Moge

2. Layanan & Harga Lengkap:
   - Regular Wash (Cuci salju, kaki-kaki, semir ban): M=18rb | L=20rb | XL=25rb
   - Wash and Wax (Tambah wax body & dressing body kasar): M=25rb | L=30rb | XL=35rb
   - Premium Wash (Tambah pembersih kerak mesin): M=55rb | L=65rb | XL=75rb
   - Wash and Polish (Tambah poles body 3 step): M=185rb | L=200rb | XL=250rb
   - Detailing (Cuci luar dalam detail, degreasing mesin): M=285rb | L=300rb | XL=350rb

3. Jam Operasional: Buka setiap hari mulai pukul 08:00 WIB hingga 18:00 WIB.

4. Lokasi & Google Maps: 
   - Alamat: Kota Serang, Banten (GARASI.21 MOTOWASH)
   - Link Google Maps: https://maps.app.goo.gl/THMMayGHMDBc9JfW8

5. Poin & Voucher Gratis: 
   - Setiap selesai mencuci motor, pelanggan otomatis mendapatkan poin.
   - Kumpulkan 10 poin, lalu tukarkan dengan "Voucher Cuci Gratis" di menu Voucher di website ini!

ATURAN SANGAT KETAT (CRITICAL GUIDELINES):
1. Jawab HANYA apa yang ditanyakan. Jangan membacakan semua menu layanan dan harga sekaligus kecuali diminta khusus.
2. Jika pelanggan bertanya "Daftar Layanan" atau layanan apa saja yang ada, sebutkan saja nama layanannya dalam bentuk bullet points TANPA DETAIL HARGA:
   - Regular Wash
   - Wash and Wax
   - Premium Wash
   - Wash and Polish
   - Detailing
   Lalu katakan: "Silakan pilih atau tanyakan detail layanan mana yang Kakak inginkan untuk info harga dan pengerjaannya! 😊"
3. Jika pelanggan bertanya detail salah satu layanan (misal: "Detail Regular Wash"), jelaskan spesifik layanannya dan harganya (sebutkan harga untuk ukuran M, L, dan XL). Lalu di baris paling bawah, WAJIB tutup dengan kalimat: "Langsung gas ke bengkel hari ini, Kak? Kami buka sampai pukul 18:00 WIB ya! 😊" (JANGAN tanya tipe/ukuran motor lagi).
4. Tampilkan kesan cerdas, modern, tanggap, dan profesional. Gunakan sapaan "Kak".
5. Jika ditanya lokasi, sertakan Link Google Maps di atas agar mudah diklik. JANGAN bungkus link Google Maps dengan asteris/bold.
6. Gunakan formatting (bold dengan **teks**) agar kalimat penting mudah dibaca, kecuali untuk link.
7. Jawab sesingkat mungkin tapi sangat jelas (to the point).
`;

exports.handleAIResponse = async (userMessage, userId) => {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    console.warn("GOOGLE_GEMINI_API_KEY is not set. AI response disabled.");
    return;
  }

  try {
    // 1. Check if user has AI enabled
    const [userRows] = await db.execute("SELECT ai_enabled FROM users WHERE id = ?", [userId]);
    if (userRows[0] && !userRows[0].ai_enabled) return;

    // 2. Prepare Gemini Model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: SYSTEM_INSTRUCTION
    });

    // 3. Get Chat History (last 10 messages) to provide context
    const [historyRows] = await db.execute(
      `SELECT message, sender_id FROM messages 
       WHERE (sender_id = ? AND receiver_id = 'admin-uuid-1') 
       OR (sender_id = 'admin-uuid-1' AND receiver_id = ?) 
       ORDER BY created_at DESC LIMIT 10`,
      [userId, userId]
    );

    const chronologicalRows = historyRows.reverse();
    
    // Remove the current message from history if it's already in the DB
    if (chronologicalRows.length > 0 && 
        chronologicalRows[chronologicalRows.length - 1].sender_id === userId &&
        chronologicalRows[chronologicalRows.length - 1].message === userMessage) {
        chronologicalRows.pop();
    }

    // Build context string safely without worrying about strict role alternation
    let chatContext = "";
    if (chronologicalRows.length > 0) {
      chatContext = "Riwayat Obrolan Sebelumnya:\n";
      for (const row of chronologicalRows) {
        const sender = row.sender_id === userId ? "Pelanggan" : "Kamu (Garasi AI)";
        chatContext += `${sender}: ${row.message}\n`;
      }
      chatContext += "\n";
    }

    const finalPrompt = `${chatContext}Pelanggan: ${userMessage}\n\nBerikan balasan untuk pesan Pelanggan yang terakhir di atas sesuai KNOWLEDGE BASE dan GUIDELINES.`;

    // 4. Generate Content
    const result = await model.generateContent(finalPrompt);
    const aiResponseText = result.response.text();

    // 5. Save AI Message to DB
    const id = uuidv4();
    const created_at = new Date();
    const adminId = 'admin-uuid-1'; // Acting as admin

    await db.execute(
      'INSERT INTO messages (id, sender_id, receiver_id, message, is_ai) VALUES (?, ?, ?, ?, ?)',
      [id, adminId, userId, aiResponseText, true]
    );

    // 6. Broadcast via Socket.IO
    const payload = {
      id,
      sender_id: adminId,
      receiver_id: userId,
      message: aiResponseText,
      is_read: false,
      is_ai: true,
      created_at,
      sender: {
        id: adminId,
        name: "Admin GARASI.21 (AI)",
        role: "admin",
        avatar_url: null
      }
    };

    const io = getIO();
    if (io) {
      io.to(userId).emit('message:new', payload);
      // Also notify admin panel so they can see the AI's response
      io.to(adminId).emit('message:sent', payload);
    }

  } catch (error) {
    console.error("Error generating AI response:", error.message);
    
    // Kirim pesan error fallback ke pengguna
    const adminId = 'admin-uuid-1';
    const fallbackMsg = "Maaf Kak, saat ini sistem Garasi AI sedang sedikit sibuk (melebihi batas API). Mohon tunggu 1 menit lagi atau silakan klik 'Hubungi Admin Manusia' ya Kak! 🙏";
    
    const fallbackPayload = {
      id: uuidv4(),
      sender_id: adminId,
      receiver_id: userId,
      message: fallbackMsg,
      is_read: false,
      is_ai: true,
      created_at: new Date(),
      sender: {
        id: adminId,
        name: "Admin GARASI.21 (AI)",
        role: "admin",
        avatar_url: null
      }
    };

    const io = getIO();
    if (io) {
      io.to(userId).emit('message:new', fallbackPayload);
      io.to(adminId).emit('message:sent', fallbackPayload);
    }
  }
};
