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
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { chatService } from "../../../services/api";
import { getSocket } from "../../../services/socket";

const ADMIN_ID = "admin-uuid-1";

export default function UserChat({
  onMessagesRead,
  standalone = false,
}: {
  onMessagesRead: () => void;
  standalone?: boolean;
}) {
  const { user: currentUser, token } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [roomOpen, setRoomOpen] = useState(false);
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
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => undefined);
    }
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
      toast.info("Pesan baru dari admin");
      if (!roomOpen && document.hidden && "Notification" in window && Notification.permission === "granted") {
        new Notification("Pesan baru GARASI.21", { body: message.message });
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

  const closeRoom = () => {
    setRoomOpen(false);
    setMessages([]);
    setNewMessage("");
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
    return new Date(value).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff7a00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      className={`${standalone ? "max-w-4xl h-[calc(100vh-7rem)]" : "max-w-4xl h-[650px]"} mx-auto overflow-hidden rounded-xl border border-border bg-card shadow-2xl`}
    >
      {!roomOpen ? (
        <div className="flex h-full flex-col bg-card">
          <div className="border-b border-border bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Chat</h2>
              <button className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="Menu chat">
                <MoreVertical size={22} />
              </button>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari chat"
                className="w-full rounded-full border border-border bg-muted px-12 py-3 text-sm text-foreground outline-none focus:border-[#ff7a00]"
              />
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  filter === "all" ? "bg-[#ff7a00] text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  filter === "unread" ? "bg-[#ff7a00] text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                Belum dibaca
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {visibleConversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
                <UserIcon size={44} />
                <p>Belum ada chat yang cocok.</p>
              </div>
            ) : (
              visibleConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={openRoom}
                  className="flex w-full items-center gap-3 border-b border-border/60 px-4 py-4 text-left transition-colors hover:bg-muted/70 sm:px-6"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ff7a00] text-lg font-bold text-white">
                    A
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-bold text-foreground">{conversation.name}</p>
                      <span
                        className={`shrink-0 text-xs ${
                          conversation.unread_count > 0 ? "font-bold text-green-500" : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(conversation.last_message_at)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="truncate text-sm text-muted-foreground">
                        {isAdminTyping ? "sedang mengetik..." : conversation.last_message}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1.5 text-[11px] font-bold text-white">
                          {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col bg-[#efeae2] dark:bg-[#0b141a]">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={closeRoom}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                aria-label="Kembali ke daftar chat"
              >
                <ArrowLeft size={22} />
              </button>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff7a00] text-lg font-bold text-white">
                A
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-foreground">Admin GARASI.21</h2>
                <p className="flex items-center gap-1 text-[10px] font-semibold text-green-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {isAdminTyping ? "sedang mengetik..." : "online"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Video size={20} className="opacity-50" />
              <Phone size={18} className="opacity-50" />
              <MoreVertical size={20} />
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat p-4">
            <div className="mb-4 flex justify-center">
              <span className="rounded-md bg-muted/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm">
                Hari Ini
              </span>
            </div>

            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground opacity-70">
                  <UserIcon size={48} />
                  <p className="text-sm">Mulai percakapan dengan admin</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === currentUser?.id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-1.5 shadow-sm ${
                          isMine
                            ? "rounded-tr-none bg-[#d9fdd3] text-[#111b21] dark:bg-[#005c4b] dark:text-[#e9edef]"
                            : "rounded-tl-none bg-white text-[#111b21] dark:bg-[#202c33] dark:text-[#e9edef]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                        <div className="mt-0.5 flex items-center justify-end gap-1">
                          <span className="text-[9px] opacity-60">{formatTime(msg.created_at)}</span>
                          {isMine && <span className="text-xs text-[#53bdeb]">✓✓</span>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <div className="sticky bottom-0 flex items-center gap-2 border-t border-border/50 bg-card p-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              <button className="rounded-full p-2 hover:bg-muted" type="button">
                <Smile size={23} />
              </button>
              <button className="rounded-full p-2 hover:bg-muted" type="button">
                <Paperclip size={21} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={sendMessage} className="flex flex-1 gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder="Ketik pesan"
                className="flex-1 rounded-full border-none bg-muted px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className={`rounded-full p-2.5 transition-all ${
                  newMessage.trim() ? "bg-[#ff7a00] text-white shadow-lg" : "text-muted-foreground opacity-50"
                }`}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
