import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function LogoutConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
}: LogoutConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">Konfirmasi Logout</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Anda yakin ingin keluar dari aplikasi? Anda akan perlu login kembali untuk mengakses panel.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 justify-end">
          <AlertDialogCancel 
            onClick={onCancel}
            className="bg-muted text-foreground hover:bg-muted/80 border-border"
          >
            Tidak
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? "Keluar..." : "Ya, Logout"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
