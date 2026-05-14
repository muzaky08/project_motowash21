import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Archive,
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  User,
  Video,
  MessageSquare,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { chatService, userService, getAvatarUrl } from "../../../services/api";
import { getSocket } from "../../../services/socket";
import Logo from "../Logo";

export default function AdminChat({ 
  standalone = false,
  onBack,
}: { 
  standalone?: boolean;
  onBack?: () => void;
}) {
  const { user: currentUser, token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, [token]);

  useEffect(() => {
    if (!selectedUser) return;
    loadMessages();
  }, [selectedUser, token]);

  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);

    const updateConversation = (message: any, partnerId: string, unreadDelta = 0) => {
      setUsers((prev) => {
        const previous = prev.find((item) => item.id === partnerId);
        const others = prev.filter((item) => item.id !== partnerId);
        const next = {
          ...(previous || message.sender || {}),
          id: partnerId,
          name: previous?.name || message.sender?.name || "User",
          email: previous?.email || message.sender?.email || "",
          avatar_url: previous?.avatar_url || message.sender?.avatar_url,
          last_message: message.message,
          last_message_at: message.created_at || new Date().toISOString(),
          unread_count: Math.max(0, Number(previous?.unread_count || 0) + unreadDelta),
        };
        return [next, ...others];
      });
    };

    const handleNewMessage = (message: any) => {
      if (message.receiver_id !== currentUser?.id) return;
      const isActiveRoom = selectedUser?.id === message.sender_id;
      updateConversation(message, message.sender_id, isActiveRoom ? 0 : 1);
      if (isActiveRoom) {
        setMessages((prev) => (prev.some((item) => item.id === message.id) ? prev : [...prev, message]));
      }
    };

    const handleSent = (message: any) => {
      if (message.sender_id !== currentUser?.id) return;
      updateConversation(message, message.receiver_id, 0);
      if (selectedUser?.id === message.receiver_id) {
        setMessages((prev) => (prev.some((item) => item.id === message.id) ? prev : [...prev, message]));
      }
    };

    const handleTypingStart = ({ userId }: { userId: string }) => setTypingUserId(userId);
    const handleTypingStop = ({ userId }: { userId: string }) => {
      setTypingUserId((current) => (current === userId ? null : current));
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
  }, [token, currentUser?.id, selectedUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadUsers = async () => {
    if (!token) return;
    try {
      const conversations = await chatService.getConversations(token);
      if (conversations.length > 0) {
        setUsers(conversations.filter((item: any) => item.id !== currentUser?.id));
      } else {
        const data = await userService.getAllUsers(token);
        setUsers(data.filter((item: any) => item.id !== currentUser?.id && item.role === "user"));
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!token || !selectedUser) return;
    try {
      const data = await chatService.getMessages(selectedUser.id, token);
      setMessages(data.messages || []);
      setUsers((prev) =>
        prev.map((item) => (item.id === selectedUser.id ? { ...item, unread_count: 0 } : item)),
      );
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !token || !selectedUser) return;

    try {
      await chatService.sendMessage({ receiver_id: selectedUser.id, message: newMessage.trim() }, token);
      setNewMessage("");
    } catch {
      toast.error("Gagal mengirim pesan");
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    if (!token || !selectedUser) return;

    const socket = getSocket(token);
    socket.emit("typing:start", { receiverId: selectedUser.id });
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      socket.emit("typing:stop", { receiverId: selectedUser.id });
    }, 800);
  };

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const items = users.filter(
      (item) =>
        (item.name || "").toLowerCase().includes(query) ||
        (item.email || "").toLowerCase().includes(query) ||
        (item.last_message || "").toLowerCase().includes(query),
    );
    return filter === "unread" ? items.filter((item) => Number(item.unread_count || 0) > 0) : items;
  }, [filter, searchQuery, users]);

  const formatTime = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const renderAvatar = (person: any, size = "w-12 h-12") => {
    const avatarSrc = getAvatarUrl(person?.avatar_url);
    if (avatarSrc) {
      return <img src={avatarSrc} alt={person.name} className={`${size} rounded-full object-cover border border-border/50`} />;
    }
    return (
      <div className={`${size} flex items-center justify-center rounded-full bg-gradient-to-br from-[#ff7a00] to-[#ff9d42] text-white font-bold text-lg shadow-sm`}>
        {(person?.name || "U").charAt(0).toUpperCase()}
      </div>
    );
  };

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
      {/* Sidebar - Customer List */}
      <div className={`
        ${selectedUser ? 'hidden sm:flex' : 'flex'} 
        flex-col w-full sm:w-[350px] border-r border-border bg-card z-20
      `}>
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(standalone && onBack) && (
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors" aria-label="Kembali ke Dashboard">
                  <ArrowLeft size={20} className="text-foreground" />
                </button>
              )}
              <h2 className="text-xl font-black text-foreground">Percakapan</h2>
            </div>
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
              placeholder="Cari pelanggan atau pesan"
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
          {filteredUsers.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground mt-10">
                <User size={40} className="mb-2 opacity-20" />
                <p className="text-xs">Tidak ada pelanggan ditemukan</p>
             </div>
          ) : filteredUsers.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedUser(item)}
              className={`
                w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-border/40
                ${selectedUser?.id === item.id ? 'bg-[#ff7a00]/5 border-r-4 border-r-[#ff7a00]' : 'hover:bg-muted/50'}
              `}
            >
              <div className="relative flex-shrink-0">
                {renderAvatar(item)}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-bold text-sm text-foreground truncate">{item.name}</p>
                  <span className={`text-[10px] whitespace-nowrap ${Number(item.unread_count || 0) > 0 ? 'text-green-500 font-bold' : 'text-muted-foreground'}`}>
                    {formatTime(item.last_message_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs truncate ${Number(item.unread_count || 0) > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                    {typingUserId === item.id ? (
                      <span className="text-green-500 font-bold animate-pulse italic">sedang mengetik...</span>
                    ) : (
                      item.last_message || item.email
                    )}
                  </p>
                  {Number(item.unread_count || 0) > 0 && (
                    <div className="bg-green-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {item.unread_count > 99 ? '99+' : item.unread_count}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`
        ${selectedUser ? 'flex' : 'hidden sm:flex'} 
        flex-1 flex-col bg-[#efeae2] dark:bg-[#0b141a] relative
      `}>
        {!selectedUser ? (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-card">
            <div className="w-64 h-64 mb-8 opacity-20">
              <Logo variant="full" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">Panel Admin GARASI.21</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Pilih salah satu pelanggan di sisi kiri untuk mulai membalas pesan. 
              Pastikan memberikan layanan terbaik dan cepat tanggap.
            </p>
            <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
              <Archive size={14} />
              Pesan terintegrasi dengan sistem pusat
            </div>
          </div>
        ) : (
          // Active Chat Room
          <>
            {/* Room Header */}
            <div className="h-16 px-4 flex items-center justify-between bg-card border-b border-border z-10 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => setSelectedUser(null)} 
                  className="sm:hidden p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
                >
                  <ArrowLeft size={20} className="text-foreground" />
                </button>
                {renderAvatar(selectedUser, "w-10 h-10")}
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-foreground truncate">{selectedUser.name}</h3>
                  <p className="text-[10px] text-green-500 font-bold">
                    {typingUserId === selectedUser.id ? 'sedang mengetik...' : 'online'}
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
                          ? msg.is_ai 
                            ? "bg-[#e1f5fe] dark:bg-[#01579b] rounded-tr-none text-[#111b21] dark:text-[#e9edef] border-r-4 border-blue-500"
                            : "bg-[#d9fdd3] dark:bg-[#005c4b] rounded-tr-none text-[#111b21] dark:text-[#e9edef]" 
                          : "bg-white dark:bg-[#202c33] rounded-tl-none text-[#111b21] dark:text-[#e9edef]"
                        }
                      `}>
                        {isMine && !!msg.is_ai && (
                          <div className="flex items-center justify-end gap-1.5 mb-1 text-[10px] font-bold text-blue-600 dark:text-blue-300 uppercase tracking-wider">
                            <span>Garasi AI</span>
                            <Bot size={12} />
                          </div>
                        )}
                        {renderMessage(msg.message)}
                        <div className="flex items-center justify-end gap-1 opacity-50">
                          <span className="text-[9px]">{formatTime(msg.created_at)}</span>
                          {isMine && <span className="text-[10px] text-[#53bdeb] font-bold">✓✓</span>}
                        </div>
                        {/* Message Tail */}
                        <div className={`
                          absolute top-0 w-3 h-3
                          ${isMine 
                            ? msg.is_ai
                              ? "right-[-6px] bg-[#e1f5fe] dark:bg-[#01579b] [clip-path:polygon(0_0,0_100%,100%_0)]"
                              : "right-[-6px] bg-[#d9fdd3] dark:bg-[#005c4b] [clip-path:polygon(0_0,0_100%,100%_0)]" 
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
