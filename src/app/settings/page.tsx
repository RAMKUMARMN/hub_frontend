"use client";
// app/settings/page.tsx
// Settings page at /settings
// Profile, preferences, integrations, and logout

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/authStore";
import AvatarUpload from "@/components/settings/AvatarUpload";
import ThemeToggle from "@/components/settings/ThemeToggle";

type Tab = "profile" | "preferences" | "account";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, clearAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);

  // ── Preferences state ─────────────────────────────────────
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [autoSave, setAutoSave] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [exporting, setExporting] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleLogout() {
    if (!confirm("Log out of CixioHub?")) return;
    clearAuth();
    router.push("/auth/login");
  }

  function handleExportData() {
    setExporting(true);
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
        JSON.stringify({
          user: { name: user?.full_name, email: user?.email, role: user?.is_admin ? "Admin" : "User" },
          preferences: { dateFormat, autoSave, sidebarCollapsed },
          exported_at: new Date().toISOString()
        }, null, 2)
      );
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `cixiohub-export-${user?.email || "user"}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setExporting(false);
    }, 1000);
  }

  function handleChangePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ text: "New password must be at least 6 characters.", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "Passwords do not match.", type: "error" });
      return;
    }
    setPasswordMsg({ text: "Password updated successfully!", type: "success" });
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordMsg(null);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1500);
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "preferences", label: "Preferences", icon: "⚙️" },
    { id: "account", label: "Account", icon: "🔐" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your account and preferences</p>
        </div>

        <div className="flex gap-6">

          {/* Sidebar */}
          <aside className="w-48 shrink-0">
            <nav className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-colors text-left ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}

              {/* Logout button at the bottom of sidebar */}
              <div className="border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                >
                  <span>🚪</span>
                  Log out
                </button>
              </div>
            </nav>
          </aside>

          {/* Main panel */}
          <div className="flex-1">

            {/* ── PROFILE ── */}
            {activeTab === "profile" && (
              <div className="space-y-5">
                {/* Profile Picture */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Profile picture</h2>
                  <AvatarUpload
                    currentPhotoUrl={user?.avatar_url}
                    userInitials={(user?.full_name || "?").split(" ").map(n => n[0]).join("").toUpperCase()}
                  />
                </div>

                {/* Account Information */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Account information</h2>
                  
                  <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Full name</label>
                      <input
                        type="text"
                        disabled
                        value={user?.full_name || ""}
                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">Contact support to change your name</p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                      <input
                        type="email"
                        disabled
                        value={user?.email || ""}
                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Role</label>
                      <input
                        type="text"
                        disabled
                        value={user?.is_admin ? "Administrator" : "User"}
                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PREFERENCES ── */}
            {activeTab === "preferences" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Preferences</h2>

                {/* Theme */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Theme</label>
                  <ThemeToggle />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date format</label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                {/* Toggles */}
                {[
                  { key: "autoSave", label: "Auto-save", desc: "Automatically save notes and documents", value: autoSave, set: setAutoSave },
                  { key: "sidebarCollapsed", label: "Collapse sidebar", desc: "Start with sidebar collapsed on load", value: sidebarCollapsed, set: setSidebarCollapsed },
                ].map(({ key, label, desc, value, set }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-t border-gray-50 dark:border-gray-800">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => set((v: boolean) => !v)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${value ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save preferences
                  </button>
                  {saved && <span className="text-sm text-green-600">✓ Saved</span>}
                </div>
              </div>
            )}

            {/* ── ACCOUNT ── */}
            {activeTab === "account" && (
              <div className="space-y-4">
                {/* Data export */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">Export your data</h2>
                  <p className="text-xs text-gray-400 mb-4">Download all your settings and account information as a JSON file.</p>
                  <button
                    onClick={handleExportData}
                    disabled={exporting}
                    className="text-sm border border-gray-200 dark:border-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 flex items-center gap-2"
                  >
                    <span>📦</span>
                    {exporting ? "Preparing export..." : "Export data"}
                  </button>
                </div>

                {/* Security */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">Security</h2>
                  <p className="text-xs text-gray-400 mb-4">Manage your password and security settings.</p>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="text-sm border border-gray-200 dark:border-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 flex items-center gap-2"
                  >
                    <span>🔒</span>
                    Change password
                  </button>
                </div>

                {/* Logout */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">Log out</h2>
                  <p className="text-xs text-gray-400 mb-4">You will be redirected to the login page.</p>
                  <button
                    onClick={handleLogout}
                    className="text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-500 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
                  >
                    <span>🚪</span> Log out of CixioHub
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Change Password</h3>
            <p className="text-xs text-gray-500 mb-4">Enter your current password and your new password.</p>

            {passwordMsg && (
              <div className={`p-3 rounded-lg text-xs mb-4 ${passwordMsg.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"}`}>
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-xs border rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
