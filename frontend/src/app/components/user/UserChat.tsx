import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  User as UserIcon,
  Video,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { chatService, userService } from "../../../services/api";
import { getSocket } from "../../../services/socket";
import Logo from "../Logo";
import { Bot, Headset } from "lucide-react";

const ADMIN_ID = "admin-uuid-1";

export default function UserChat({
  onMessagesRead,
  standalone = false,
  onBack,
}: {
  onMessagesRead: () => void;
  standalone?: boolean;
  onBack?: () => void;
}) {
  const { user: currentUser, token } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [roomOpen, setRoomOpen] = useState(standalone ? true : false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const adminConversation = useMemo(() => {
    const existing = conversations.find((conversation) => conversation.id === ADMIN_ID);
    return {
      id: ADMIN_ID,
      name: "Admin GARASI.21",
      avatar_url: existing?.avatar_url,
      last_message: existing?.last_message || "Klik untuk membuka chat admin",
      last_message_at: existing?.last_message_at,
      unread_count: Number(existing?.unread_count || 0),
      is_online: true,
    };
  }, [conversations]);

  const visibleConversations = useMemo(() => {
    const items = [adminConversation].filter((conversation) =>
      conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conversation.last_message || "").toLowerCase().includes(searchQuery.toLowerCase()),
    );
    return filter === "unread" ? items.filter((conversation) => conversation.unread_count > 0) : items;
  }, [adminConversation, filter, searchQuery]);

  useEffect(() => {
    loadConversations();
  }, [token]);

  useEffect(() => {
    if (!token || !roomOpen) return;
    loadMessages();
  }, [token, roomOpen]);

  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);

    const syncConversation = (message: any, unreadDelta = 0) => {
      setConversations((prev) => {
        const others = prev.filter((conversation) => conversation.id !== ADMIN_ID);
        const previous = prev.find((conversation) => conversation.id === ADMIN_ID);
        return [
          {
            ...(previous || {}),
            id: ADMIN_ID,
            name: "Admin GARASI.21",
            last_message: message.message,
            last_message_at: message.created_at || new Date().toISOString(),
            unread_count: Math.max(0, Number(previous?.unread_count || 0) + unreadDelta),
          },
          ...others,
        ];
      });
    };

    const handleNewMessage = (message: any) => {
      if (message.sender_id !== ADMIN_ID || message.receiver_id !== currentUser?.id) return;
      syncConversation(message, roomOpen ? 0 : 1);
      if (roomOpen) {
        setMessages((prev) => (prev.some((item) => item.id === message.id) ? prev : [...prev, message]));
        onMessagesRead();
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === ADMIN_ID ? { ...conversation, unread_count: 0 } : conversation,
          ),
        );
      }
    };

    const handleSent = (message: any) => {
      if (message.sender_id !== currentUser?.id || message.receiver_id !== ADMIN_ID) return;
      syncConversation(message, 0);
      if (roomOpen) {
        setMessages((prev) => (prev.some((item) => item.id === message.id) ? prev : [...prev, message]));
      }
    };

    const handleTypingStart = ({ userId }: { userId: string }) => {
      if (userId === ADMIN_ID) setIsAdminTyping(true);
    };

    const handleTypingStop = ({ userId }: { userId: string }) => {
      if (userId === ADMIN_ID) setIsAdminTyping(false);
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:sent", handleSent);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:sent", handleSent);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [token, currentUser?.id, roomOpen, onMessagesRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    if (!token) return;
    try {
      const data = await chatService.getConversations(token);
      setConversations(data || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!token) return;
    try {
      const data = await chatService.getMessages(ADMIN_ID, token);
      setMessages(data.messages || []);
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === ADMIN_ID ? { ...conversation, unread_count: 0 } : conversation,
        ),
      );
      onMessagesRead();
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const openRoom = () => {
    setRoomOpen(true);
    setSearchQuery("");
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !token) return;

    try {
      await chatService.sendMessage({ receiver_id: ADMIN_ID, message: newMessage.trim() }, token);
      setNewMessage("");
    } catch {
      toast.error("Gagal mengirim pesan");
    }
  };

  const handleContactAdmin = async () => {
    if (!token) return;
    try {
      await userService.updateAIConfig(false, token);
      await chatService.sendMessage({ 
        receiver_id: ADMIN_ID, 
        message: "Saya ingin berbicara dengan Admin/CS manusia." 
      }, token);
      toast.success("AI dimatikan. Admin akan segera membalas.");
    } catch {
      toast.error("Gagal menghubungi admin");
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    if (!token) return;

    const socket = getSocket(token);
    socket.emit("typing:start", { receiverId: ADMIN_ID });
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      socket.emit("typing:stop", { receiverId: ADMIN_ID });
    }, 800);
  };

  const formatTime = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const sendQuickReply = async (text: string) => {
    if (!token) return;
    try {
      // Re-enable AI temporarily if they click a predefined quick reply
      await userService.updateAIConfig(true, token);
      await chatService.sendMessage({ receiver_id: ADMIN_ID, message: text }, token);
    } catch {
      toast.error("Gagal mengirim pesan otomatis");
    }
  };

  const QUICK_REPLIES = [
    "Daftar Layanan",
    "Detail Regular Wash",
    "Detail Wash & Wax",
    "Detail Premium Wash",
    "Detail Detailing",
    "Dimana lokasi Garasi.21?",
    "Bagaimana cara dapat voucher gratis?"
  ];

  const renderMessage = (text: string) => {
    if (!text) return null;
    const escapeHTML = (str: string) => str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  
    let html = escapeHTML(text);
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    html = html.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline break-all" style="word-break: break-all;">$1</a>');
  
    return <div className="text-xs sm:text-sm leading-relaxed mb-1 whitespace-pre-wrap break-words" style={{ wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: html }} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ff7a00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={`bg-card overflow-hidden flex transition-all duration-300 ${standalone ? 'h-full w-full' : 'border border-border rounded-2xl shadow-2xl h-[calc(100vh-12rem)] min-h-[500px] max-w-6xl mx-auto'}`}>
      {/* Sidebar - Conversation List */}
      {!standalone && (
        <div className={`
          ${roomOpen ? 'hidden sm:flex' : 'flex'} 
          flex-col w-full sm:w-[350px] border-r border-border bg-card z-20
        `}>
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-foreground">Obrolan</h2>
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-muted rounded-full transition-colors">
                <MessageSquare size={20} className="text-muted-foreground" />
              </button>
              <button className="p-2 hover:bg-muted rounded-full transition-colors">
                <MoreVertical size={20} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#ff7a00] transition-colors" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari atau mulai obrolan baru"
              className="w-full bg-muted border-none rounded-xl py-2.5 pl-10 pr-4 text-xs text-foreground outline-none focus:ring-2 focus:ring-[#ff7a00]/30 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                filter === "all" ? "bg-[#ff7a00] text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                filter === "unread" ? "bg-[#ff7a00] text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Belum dibaca
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {visibleConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={openRoom}
              className={`
                w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-border/40
                ${roomOpen ? 'bg-[#ff7a00]/5 border-r-4 border-r-[#ff7a00]' : 'hover:bg-muted/50'}
              `}
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff7a00] to-[#ff9d42] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  A
                </div>
                {conversation.is_online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-bold text-sm text-foreground truncate">{conversation.name}</p>
                  <span className={`text-[10px] whitespace-nowrap ${conversation.unread_count > 0 ? 'text-green-500 font-bold' : 'text-muted-foreground'}`}>
                    {formatTime(conversation.last_message_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs truncate ${conversation.unread_count > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                    {isAdminTyping ? (
                      <span className="text-green-500 font-bold animate-pulse italic">sedang mengetik...</span>
                    ) : (
                      conversation.last_message
                    )}
                  </p>
                  {conversation.unread_count > 0 && (
                    <div className="bg-green-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Main Chat Area */}
      <div className={`
        ${(roomOpen || standalone) ? 'flex' : 'hidden sm:flex'} 
        flex-1 flex-col bg-[#efeae2] dark:bg-[#0b141a] relative min-w-0
      `}>
        {(!roomOpen && !standalone) ? (
          // Empty State - WhatsApp style
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-card">
            <div className="w-64 h-64 mb-8 opacity-20">
              <Logo variant="full" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">WhatsApp Web untuk Garasi.21</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Kirim dan terima pesan ke admin secara real-time. 
              Gunakan fitur chat untuk menanyakan layanan atau konfirmasi booking.
            </p>
            <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Terenkripsi secara End-to-End
            </div>
          </div>
        ) : (
          // Active Chat Room
          <>
            {/* Room Header */}
            <div className="h-16 px-4 flex items-center justify-between bg-card border-b border-border z-10 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                {(standalone && onBack) ? (
                  <button 
                    onClick={onBack} 
                    className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <ArrowLeft size={20} className="text-foreground" />
                  </button>
                ) : !standalone && (
                  <button 
                    onClick={() => setRoomOpen(false)} 
                    className="sm:hidden p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <ArrowLeft size={20} className="text-foreground" />
                  </button>
                )}
                <div className="w-10 h-10 rounded-full bg-[#ff7a00] flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                  A
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-foreground truncate">Admin GARASI.21</h3>
                  <p className="text-[10px] text-green-500 font-bold">
                    {isAdminTyping ? 'sedang mengetik...' : 'online'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-muted rounded-full transition-colors opacity-60">
                  <Video size={18} />
                </button>
                <button className="p-2 hover:bg-muted rounded-full transition-colors opacity-60">
                  <Phone size={18} />
                </button>
                <button className="p-2 hover:bg-muted rounded-full transition-colors">
                  <Search size={18} />
                </button>
                <button className="p-2 hover:bg-muted rounded-full transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat dark:opacity-90">
              <div className="flex justify-center mb-6">
                <span className="bg-muted/80 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-muted-foreground uppercase tracking-widest shadow-sm">
                  Hari Ini
                </span>
              </div>

              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isMine = msg.sender_id === currentUser?.id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`
                        max-w-[80%] px-3 py-2 rounded-xl shadow-md relative
                        ${isMine 
                          ? "bg-[#d9fdd3] dark:bg-[#005c4b] rounded-tr-none text-[#111b21] dark:text-[#e9edef]" 
                          : msg.is_ai 
                            ? "bg-[#e1f5fe] dark:bg-[#01579b] rounded-tl-none text-[#111b21] dark:text-[#e9edef] border-l-4 border-blue-500"
                            : "bg-white dark:bg-[#202c33] rounded-tl-none text-[#111b21] dark:text-[#e9edef]"
                        }
                      `}>
                        {!!msg.is_ai && (
                          <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-blue-600 dark:text-blue-300 uppercase tracking-wider">
                            <Bot size={12} />
                            <span>Garasi AI</span>
                          </div>
                        )}
                        {renderMessage(msg.message)}
                        <div className="flex items-center justify-end gap-1 opacity-50">
                          <span className="text-[9px]">{formatTime(msg.created_at)}</span>
                          {isMine && <span className="text-[10px] text-[#53bdeb] font-bold">✓✓</span>}
                        </div>
                        {/* AI Action Button */}
                        {!!msg.is_ai && (
                          <button 
                            onClick={handleContactAdmin}
                            className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/30 rounded-lg text-[10px] font-bold text-foreground transition-all border border-border/50"
                          >
                            <Headset size={12} />
                            Hubungi Admin Manusia
                          </button>
                        )}
                        {/* Message Tail */}
                        <div className={`
                          absolute top-0 w-3 h-3
                          ${isMine 
                            ? "right-[-6px] bg-[#d9fdd3] dark:bg-[#005c4b] [clip-path:polygon(0_0,0_100%,100%_0)]" 
                            : msg.is_ai
                              ? "left-[-6px] bg-[#e1f5fe] dark:bg-[#01579b] [clip-path:polygon(100%_0,100%_100%,0_0)]"
                              : "left-[-6px] bg-white dark:bg-[#202c33] [clip-path:polygon(100%_0,100%_100%,0_0)]"
                          }
                        `} />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="bg-card w-full min-w-0 flex-shrink-0 px-4 pt-3 pb-2 overflow-x-auto no-scrollbar flex items-center gap-2 border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              {QUICK_REPLIES.map((text, i) => (
                <button
                  key={i}
                  onClick={() => sendQuickReply(text)}
                  className="whitespace-nowrap px-4 py-2 bg-muted text-xs font-bold text-muted-foreground rounded-full hover:bg-[#ff7a00]/10 hover:text-[#ff7a00] hover:border-[#ff7a00]/30 border border-border/50 transition-all shadow-sm flex items-center gap-1.5"
                >
                  <MessageSquare size={12} />
                  {text}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-card border-t border-border flex items-center gap-2">
              <div className="flex items-center">
                <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                  <Smile size={24} />
                </button>
                <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                  <Paperclip size={22} className="rotate-45" />
                </button>
              </div>
              <form onSubmit={sendMessage} className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder="Ketik pesan"
                  className="flex-1 bg-muted border-none rounded-xl py-2.5 px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-[#ff7a00]/30 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`
                    p-2.5 rounded-full transition-all flex-shrink-0
                    ${newMessage.trim() 
                      ? "bg-[#ff7a00] text-white shadow-[0_4px_12px_rgba(255,122,0,0.3)] hover:scale-105" 
                      : "bg-muted text-muted-foreground opacity-50"
                    }
                  `}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
