import AvatarUpload from "@/components/settings/AvatarUpload";
import ThemeToggle from "@/components/settings/ThemeToggle";

export default function SettingsPage() {
  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-lg font-medium mb-1">Profile & settings</h1>
      <p className="text-sm text-gray-500 mb-6">Manage your account details and app preferences</p>

      <section className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl p-5 mb-4">
        <h2 className="text-sm font-medium mb-4">Profile picture</h2>
        <AvatarUpload userInitials="AX" />
      </section>

      <section className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl p-5 mb-4">
        <h2 className="text-sm font-medium mb-4">Appearance</h2>
        <ThemeToggle />
      </section>
    </main>
  );
}