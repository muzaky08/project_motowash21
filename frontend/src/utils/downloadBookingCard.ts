import QRCode from 'qrcode';

export async function downloadBookingCard(bookingData: {
  cardCode: string;
  customerName?: string;
  phone?: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
}) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 860;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Helper: draw rounded rectangle
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  // Helper: rounded top only
  function roundRectTop(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function drawFittedText(text: string, x: number, y: number, maxWidth: number, font: string) {
    ctx.font = font;
    let value = text || '-';
    if (ctx.measureText(value).width <= maxWidth) {
      ctx.fillText(value, x, y);
      return;
    }

    while (value.length > 1 && ctx.measureText(`${value}...`).width > maxWidth) {
      value = value.slice(0, -1);
    }
    ctx.fillText(`${value}...`, x, y);
  }

  // --- DRAW CARD BACKGROUND ---
  ctx.fillStyle = '#1a1a1a';
  roundRect(ctx, 0, 0, 600, 860, 24);
  ctx.fill();

  // --- DRAW ORANGE HEADER ---
  ctx.fillStyle = '#c25508ff';
  roundRectTop(ctx, 0, 0, 600, 110, 24);
  ctx.fill();

  // Header text "GARASI.21"
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('GARASI.21', 35, 65);
  ctx.font = 'bold 14px Arial';
  ctx.fillText('MOTOWASH', 35, 88);

  // "E-TICKET CARD" badge on right
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  roundRect(ctx, 420, 45, 145, 36, 10);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('E-TICKET CARD', 492, 68);

  // --- GENERATE AND DRAW QR CODE ---
  const qrDataURL = await QRCode.toDataURL(bookingData.cardCode, {
    width: 200,
    margin: 2,
    color: { dark: '#ffffff', light: '#262626' }
  });
  const qrImg = new Image();
  await new Promise(resolve => { qrImg.onload = resolve; qrImg.src = qrDataURL; });

  // QR background box
  ctx.fillStyle = '#262626';
  roundRect(ctx, 190, 140, 220, 220, 20);
  ctx.fill();
  ctx.drawImage(qrImg, 200, 150, 200, 200);

  // --- BOOKING CODE ---
  ctx.textAlign = 'center';
  ctx.fillStyle = '#9ca3af';
  ctx.font = '12px Arial';
  ctx.fillText('BOOKING CODE', 300, 395);

  ctx.fillStyle = '#ea6404ff';
  ctx.font = 'bold 32px Courier New';
  ctx.fillText(bookingData.cardCode, 300, 435);

  // Divider line
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 465);
  ctx.lineTo(560, 465);
  ctx.stroke();

  // --- INFO ROWS ---
  // Row 1: Layanan + Status
  ctx.textAlign = 'left';
  ctx.fillStyle = '#9ca3af';
  ctx.font = 'bold 12px Arial';
  ctx.fillText('LAYANAN', 40, 505);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial';
  ctx.fillText(bookingData.serviceName, 40, 535);

  // Status badge
  const statusColor = bookingData.status === 'validated' ? '#22c55e' :
    bookingData.status === 'expired' ? '#6b7280' : '#f97316';
  const statusLabel = bookingData.status === 'validated' ? 'TERVALIDASI' :
    bookingData.status === 'expired' ? 'KEDALUWARSA' : 'MENUNGGU';

  ctx.fillStyle = statusColor + '33'; // Semi-transparent
  roundRect(ctx, 420, 495, 140, 32, 16);
  ctx.fill();
  ctx.fillStyle = statusColor;
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(statusLabel, 490, 516);

  // Row 2: Customer
  ctx.textAlign = 'left';
  ctx.fillStyle = '#9ca3af';
  ctx.font = 'bold 12px Arial';
  ctx.fillText('NAMA', 40, 585);
  ctx.fillStyle = '#ffffff';
  drawFittedText(bookingData.customerName || '-', 40, 615, 320, 'bold 18px Arial');

  ctx.fillStyle = '#9ca3af';
  ctx.font = 'bold 12px Arial';
  ctx.fillText('NO. TELPON', 420, 585);
  ctx.fillStyle = '#ffffff';
  drawFittedText(bookingData.phone || '-', 420, 615, 140, 'bold 18px Arial');

  // Row 3: Tanggal + Waktu
  ctx.fillStyle = '#9ca3af';
  ctx.font = 'bold 12px Arial';
  ctx.fillText('TANGGAL', 40, 665);
  ctx.fillStyle = '#ffffff';
  drawFittedText(bookingData.date, 40, 695, 180, 'bold 18px Arial');

  ctx.fillStyle = '#9ca3af';
  ctx.font = 'bold 12px Arial';
  ctx.fillText('WAKTU', 420, 665);
  ctx.fillStyle = '#ffffff';
  drawFittedText(bookingData.time, 420, 695, 140, 'bold 18px Arial');

  // --- BOTTOM NOTE ---
  ctx.fillStyle = '#262626';
  roundRect(ctx, 40, 760, 520, 50, 12);
  ctx.fill();
  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('OK', 60, 792);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '14px Arial';
  ctx.fillText('Tunjukkan kartu kepada admin saat tiba di lokasi', 95, 790);

  // --- DOWNLOAD ---
  const dataURL = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.download = `GARASI21-${bookingData.cardCode}.png`;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
