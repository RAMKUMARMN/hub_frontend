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
  const [dateFormat,    setDateFormat]    = useState("MM/DD/YYYY");
  const [autoSave,      setAutoSave]      = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleLogout() {
    if (!confirm("Log out of CixioHub?")) return;
    // Clear auth tokens and redirect to login
    clearAuth();
    // await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "profile",     label: "Profile",     icon: "👤" },
    { id: "preferences", label: "Preferences", icon: "⚙️" },
    { id: "account",     label: "Account",     icon: "🔐" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
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
                      ? "bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}

              {/* Logout button at the bottom of sidebar */}
              <div className="border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">Full name</label>
                      <input
                        type="text"
                        disabled
                        value={user?.full_name || ""}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">Contact support to change your name</p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        disabled
                        value={user?.email || ""}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                      <input
                        type="text"
                        disabled
                        value={user?.is_admin ? "Administrator" : "User"}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">Theme</label>
                  <ThemeToggle />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date format</label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                {/* Toggles */}
                {[
                  { key: "autoSave",         label: "Auto-save",         desc: "Automatically save notes and documents", value: autoSave,         set: setAutoSave         },
                  { key: "sidebarCollapsed", label: "Collapse sidebar",  desc: "Start with sidebar collapsed on load",   value: sidebarCollapsed, set: setSidebarCollapsed },
                ].map(({ key, label, desc, value, set }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-t border-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => set((v: boolean) => !v)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${value ? "bg-blue-600" : "bg-gray-200"}`}
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
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-800 mb-1">Export your data</h2>
                  <p className="text-xs text-gray-400 mb-4">Download all your notes, tasks, and documents as a ZIP file.</p>
                  <button className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
                    📦 Export data
                  </button>
                </div>

                {/* Security */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-800 mb-1">Security</h2>
                  <p className="text-xs text-gray-400 mb-4">Manage your password and security settings.</p>
                  <button className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
                    🔒 Change password
                  </button>
                </div>

                {/* Logout */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-800 mb-1">Log out</h2>
                  <p className="text-xs text-gray-400 mb-4">You will be redirected to the login page.</p>
                  <button
                    onClick={handleLogout}
                    className="text-sm bg-red-50 border border-red-200 text-red-500 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    🚪 Log out of CixioHub
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
