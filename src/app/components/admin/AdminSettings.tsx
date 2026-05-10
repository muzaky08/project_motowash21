import UserSettings from "../user/UserSettings";

export default function AdminSettings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Pengaturan Admin</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola profil admin, foto profil, dan informasi kontak akun.
        </p>
      </div>
      <UserSettings hideTitle />
    </div>
  );
}
