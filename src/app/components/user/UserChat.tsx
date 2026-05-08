import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User as UserIcon, MoreVertical, Phone, Video, Paperclip, Smile } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { chatService } from "../../../services/api";

const ADMIN_ID = "admin-uuid-1";

export default function UserChat({
  onMessagesRead,
}: {
  onMessagesRead: () => void;
}) {
  const { user: currentUser, token } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    onMessagesRead();

    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!token) return;
    try {
      const data = await chatService.getMessages(ADMIN_ID, token);
      const newMessages = data.messages || [];
      if (newMessages.length > messages.length) {
         onMessagesRead();
      }
      setMessages(newMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !token) return;

    try {
      await chatService.sendMessage({
        receiver_id: ADMIN_ID,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff7a00] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl h-[650px] flex flex-col overflow-hidden shadow-2xl relative">
      {/* Header - WhatsApp Style */}
      <div className="p-3 bg-muted border-b border-border flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ff7a00] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner">
            A
          </div>
          <div>
            <h2 className="font-bold text-foreground text-sm">Admin GARASI.21</h2>
            <p className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <Video size={20} className="cursor-not-allowed opacity-50" />
          <Phone size={18} className="cursor-not-allowed opacity-50" />
          <MoreVertical size={20} className="cursor-pointer" />
        </div>
      </div>

      {/* Messages Area - WhatsApp Pattern Background */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#efeae2] dark:bg-[#0b141a] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        <div className="flex justify-center mb-4">
          <span className="bg-muted/80 dark:bg-[#182229] text-muted-foreground text-[10px] px-2 py-1 rounded-md shadow-sm uppercase font-bold tracking-wider">
            Hari Ini
          </span>
        </div>

        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2 opacity-50">
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
                    className={`max-w-[85%] px-3 py-1.5 rounded-lg shadow-sm relative ${
                      isMine
                        ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none"
                        : "bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span className="text-[9px] opacity-60">
                        {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
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
            })
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - WhatsApp Style */}
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
            className={`p-2.5 rounded-full transition-all ${
              newMessage.trim() 
                ? "bg-[#ff7a00] text-white shadow-lg scale-110" 
                : "text-muted-foreground opacity-50"
            }`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      {/* Mobile Floating Backdrop for encrypt label */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="bg-white/50 dark:bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] uppercase tracking-tighter text-muted-foreground/60 font-bold flex items-center gap-1">
          <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.655 1.438 5.161L2.031 22l4.977-1.378A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.477 0-2.871-.351-4.102-.973l-.294-.148-3.044.843.857-2.955-.164-.271A7.954 7.954 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
          </svg>
          Pesan Terenkripsi
        </div>
      </div>
    </div>
  );
}
