import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Search, User, MoreVertical, Phone, Video, Paperclip, Smile, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { chatService, userService } from "../../../services/api";

export default function AdminChat() {
  const { user: currentUser, token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUsers();
  }, [token]);

  useEffect(() => {
    if (selectedUser) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUser, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUsers = async () => {
    if (!token) return;
    try {
      const data = await userService.getAllUsers(token);
      // Filter out current admin and show only users
      setUsers(data.filter((u: any) => u.id !== currentUser?.id));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!token || !selectedUser) return;
    try {
      const data = await chatService.getMessages(selectedUser.id, token);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !token || !selectedUser) return;

    try {
      await chatService.sendMessage({
        receiver_id: selectedUser.id,
        message: newMessage,
      }, token);

      setNewMessage("");
      loadMessages();
    } catch (error: any) {
      toast.error("Gagal mengirim pesan");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-card border border-border rounded-xl h-[700px] flex overflow-hidden shadow-2xl">
      {/* Sidebar - User List */}
      <div className="w-full md:w-80 border-r border-border flex flex-col bg-muted/30">
        {/* Sidebar Header */}
        <div className="p-4 bg-muted/50 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#ff7a00] flex items-center justify-center text-white font-bold">
              {currentUser?.name?.charAt(0)}
            </div>
            <h2 className="font-bold text-foreground">Obrolan</h2>
          </div>
          <button className="p-2 hover:bg-muted rounded-full text-muted-foreground">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Cari atau mulai obrolan baru"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-input-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#ff7a00]"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Memuat...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">Tidak ada pengguna</div>
          ) : (
            filteredUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-muted transition-colors border-b border-border/50 ${selectedUser?.id === u.id ? "bg-muted" : ""
                  }`}
              >
                <div className="relative">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt={u.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {u.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></div>
                </div>
                <div className="flex-1 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-foreground text-sm truncate">{u.name}</h3>
                    <span className="text-[10px] text-muted-foreground">12:30</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    Klik untuk melihat percakapan
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#efeae2] dark:bg-[#0b141a] relative">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-3 bg-muted border-b border-border flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {selectedUser.avatar_url ? (
                  <img src={selectedUser.avatar_url} alt={selectedUser.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {selectedUser.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-foreground text-sm">{selectedUser.name}</h3>
                  <p className="text-[10px] text-green-500 font-semibold">online</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <Video size={20} className="cursor-not-allowed opacity-50" />
                <Phone size={18} className="cursor-not-allowed opacity-50" />
                <MoreVertical size={20} className="cursor-pointer" />
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-90">
              <div className="flex justify-center mb-4">
                <span className="bg-muted/80 text-muted-foreground text-[10px] px-2 py-1 rounded-md shadow-sm uppercase font-bold tracking-wider">
                  Hari Ini
                </span>
              </div>

              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isMine = msg.sender_id === currentUser?.id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-1.5 rounded-lg shadow-sm relative group ${isMine
                            ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none"
                            : "bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none"
                          }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[9px] opacity-60">
                            {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && (
                            <span className="text-[#53bdeb]">
                              <svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor">
                                <path d="M15.01 3.316l-.478-.372a.365.365 0 00-.51.063L8.666 9.88a.32.32 0 01-.484.032l-.358-.325a.32.32 0 00-.484.032l-.378.48a.418.418 0 00.036.54l1.32 1.267a.32.32 0 00.484-.034l6.272-8.048a.366.366 0 00-.064-.512zm-4.1 0l-.478-.372a.365.365 0 00-.51.063L5.066 9.88a.32.32 0 01-.484.032L1.332 7.027a.366.366 0 00-.511.064l-.44.556a.418.418 0 00.067.545l4.315 3.513a.32.32 0 00.484-.034l6.271-8.048a.366.366 0 00-.063-.512z"></path>
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-2 bg-muted flex items-center gap-2 sticky bottom-0 border-t border-border/50">
              <div className="flex items-center gap-1 text-muted-foreground">
                <button className="p-2 hover:bg-muted-foreground/10 rounded-full transition-colors">
                  <Smile size={24} />
                </button>
                <button className="p-2 hover:bg-muted-foreground/10 rounded-full transition-colors">
                  <Paperclip size={22} className="rotate-45" />
                </button>
              </div>
              <form onSubmit={sendMessage} className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan"
                  className="flex-1 bg-background dark:bg-[#2a3942] border-none rounded-lg px-4 py-2.5 text-sm focus:outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`p-2.5 rounded-full transition-all ${newMessage.trim()
                      ? "bg-[#ff7a00] text-white shadow-lg"
                      : "text-muted-foreground"
                    }`}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <MessageCircle size={48} className="text-muted-foreground opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">WhatsApp untuk Admin Motowash</h3>
            <p className="text-muted-foreground max-w-sm text-sm">
              Pilih pengguna dari daftar di sebelah kiri untuk memulai percakapan atau melihat riwayat chat.
            </p>
            <div className="mt-12 flex items-center gap-2 text-xs text-muted-foreground/50 uppercase tracking-widest font-bold">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="opacity-30">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.655 1.438 5.161L2.031 22l4.977-1.378A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.477 0-2.871-.351-4.102-.973l-.294-.148-3.044.843.857-2.955-.164-.271A7.954 7.954 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
              </svg>
              Terenkripsi secara End-to-End
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
