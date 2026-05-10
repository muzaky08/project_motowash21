import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import AdminChat from "../../components/admin/AdminChat";
import Logo from "../../components/Logo";

export default function AdminChatPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Logo variant="full" size="sm" />
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-muted text-foreground hover:bg-muted/80"
          >
            <ArrowLeft size={18} />
            Dashboard Admin
          </button>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <AdminChat standalone />
      </main>
    </div>
  );
}
