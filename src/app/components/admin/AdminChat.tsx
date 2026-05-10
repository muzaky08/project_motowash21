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
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { chatService, userService } from "../../../services/api";
import { getSocket } from "../../../services/socket";

export default function AdminChat({ standalone = false }: { standalone?: boolean }) {
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
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => undefined);
    }
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
      toast.info(message.sender?.name ? `Pesan baru dari ${message.sender.name}` : "Pesan baru dari user");
      if (!isActiveRoom && document.hidden && "Notification" in window && Notification.permission === "granted") {
        new Notification("Pesan baru dari user", { body: message.message });
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

  const openRoom = (user: any) => {
    setSelectedUser(user);
    setSearchQuery("");
  };

  const closeRoom = () => {
    setSelectedUser(null);
    setMessages([]);
    setNewMessage("");
    loadUsers();
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
    return new Date(value).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const renderAvatar = (person: any, size = "h-12 w-12") => {
    if (person?.avatar_url) {
      return <img src={person.avatar_url} alt={person.name} className={`${size} rounded-full object-cover`} />;
    }
    return (
      <div className={`${size} flex items-center justify-center rounded-full bg-[#ff7a00] text-lg font-bold text-white`}>
        {(person?.name || "U").charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div
      className={`${standalone ? "h-[calc(100vh-7rem)]" : "h-[700px]"} mx-auto max-w-5xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl`}
    >
      {!selectedUser ? (
        <div className="flex h-full flex-col bg-card">
          <div className="border-b border-border bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {renderAvatar(currentUser, "h-11 w-11")}
                <div>
                  <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Chat Admin</h2>
                  <p className="text-xs text-muted-foreground">Kelola percakapan pelanggan</p>
                </div>
              </div>
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
                placeholder="Cari pelanggan atau pesan"
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
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground"
              >
                <Archive size={16} />
                Arsip
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-muted-foreground">Memuat chat...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
                <User size={44} />
                <p>Belum ada percakapan pelanggan.</p>
              </div>
            ) : (
              filteredUsers.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openRoom(item)}
                  className="flex w-full items-center gap-3 border-b border-border/60 px-4 py-4 text-left transition-colors hover:bg-muted/70 sm:px-6"
                >
                  <div className="relative shrink-0">
                    {renderAvatar(item)}
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-bold text-foreground">{item.name}</p>
                      <span
                        className={`shrink-0 text-xs ${
                          Number(item.unread_count || 0) > 0 ? "font-bold text-green-500" : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(item.last_message_at)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="truncate text-sm text-muted-foreground">
                        {typingUserId === item.id ? "sedang mengetik..." : item.last_message || item.email || "Klik untuk membuka percakapan"}
                      </p>
                      {Number(item.unread_count || 0) > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1.5 text-[11px] font-bold text-white">
                          {Number(item.unread_count) > 99 ? "99+" : item.unread_count}
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
              {renderAvatar(selectedUser, "h-10 w-10")}
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-foreground">{selectedUser.name}</h3>
                <p className="text-[10px] font-semibold text-green-500">
                  {typingUserId === selectedUser.id ? "sedang mengetik..." : "online"}
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
                  <User size={48} />
                  <p className="text-sm">Belum ada pesan dengan pelanggan ini</p>
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
