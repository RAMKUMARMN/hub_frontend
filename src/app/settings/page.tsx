"use client";

import { useState } from "react";
import { Bell, Monitor, Shield, UserCog } from "lucide-react";

const initialToggles = {
  emailDigest: true,
  productUpdates: false,
  taskReminders: true,
  compactMode: false,
  highContrast: false,
  sessionAlerts: true,
};

type ToggleKey = keyof typeof initialToggles;

type ToggleRow = {
  key: ToggleKey;
  label: string;
  description: string;
};

const notificationRows: ToggleRow[] = [
  {
    key: "emailDigest",
    label: "Weekly email digest",
    description: "Summary of chats, documents, and todo progress.",
  },
  {
    key: "taskReminders",
    label: "Task reminders",
    description: "Gentle nudges for items due soon.",
  },
  {
    key: "productUpdates",
    label: "Product updates",
    description: "Occasional notes about new workspace improvements.",
  },
];

const appearanceRows: ToggleRow[] = [
  {
    key: "compactMode",
    label: "Compact mode",
    description: "Reduce spacing in dense work areas.",
  },
  {
    key: "highContrast",
    label: "Higher contrast",
    description: "Use stronger borders and clearer text contrast.",
  },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? "bg-cixio-blue" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [toggles, setToggles] = useState(initialToggles);

  const updateToggle = (key: ToggleKey) => {
    setToggles((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <main className="min-h-screen bg-cixio-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="mb-6 rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cixio-muted">
            Settings
          </p>
          <h1 className="mt-2 text-3xl font-bold text-cixio-dark">
            Workspace preferences
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Manage account preferences, notifications, and display choices for the frontend experience.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-lg border border-cixio-light bg-white p-4 shadow-sm">
            <nav className="space-y-1 text-sm font-medium text-gray-600">
              <a href="#account" className="flex items-center gap-2 rounded-md bg-cixio-light px-3 py-2 text-cixio-dark">
                <UserCog size={16} aria-hidden="true" />
                Account
              </a>
              <a href="#notifications" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-50">
                <Bell size={16} aria-hidden="true" />
                Notifications
              </a>
              <a href="#appearance" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-50">
                <Monitor size={16} aria-hidden="true" />
                Appearance
              </a>
              <a href="#security" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-50">
                <Shield size={16} aria-hidden="true" />
                Security
              </a>
            </nav>
          </aside>

          <div className="space-y-6">
            <section id="account" className="rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-cixio-dark">Account</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Workspace name</span>
                  <input className="input-cixio mt-1.5" value="CixioHub TKM" readOnly />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Default role</span>
                  <select className="input-cixio mt-1.5" defaultValue="member">
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Primary contact</span>
                  <input className="input-cixio mt-1.5" value="workspace@cixiohub.test" readOnly />
                </label>
              </div>
            </section>

            <section id="notifications" className="rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-cixio-dark">Notifications</h2>
              <div className="mt-4 divide-y divide-cixio-light">
                {notificationRows.map((row) => (
                  <div key={row.key} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{row.label}</p>
                      <p className="mt-1 text-sm text-gray-500">{row.description}</p>
                    </div>
                    <Toggle checked={toggles[row.key]} onChange={() => updateToggle(row.key)} />
                  </div>
                ))}
              </div>
            </section>

            <section id="appearance" className="rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-cixio-dark">Appearance</h2>
              <div className="mt-4 divide-y divide-cixio-light">
                {appearanceRows.map((row) => (
                  <div key={row.key} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{row.label}</p>
                      <p className="mt-1 text-sm text-gray-500">{row.description}</p>
                    </div>
                    <Toggle checked={toggles[row.key]} onChange={() => updateToggle(row.key)} />
                  </div>
                ))}
              </div>
            </section>

            <section id="security" className="rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-cixio-dark">Security</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Session alerts are enabled for new browser sign-ins.
                  </p>
                </div>
                <Toggle
                  checked={toggles.sessionAlerts}
                  onChange={() => updateToggle("sessionAlerts")}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
