"use client";

import { useState } from "react";
import {
  Bell,
  Building2,
  CheckCircle2,
  Globe,
  Key,
  Link2,
  Monitor,
  Shield,
  ShieldAlert,
  Trash2,
  UserCog,
  Users,
  Webhook,
  Zap,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Toggle
// ---------------------------------------------------------------------------

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
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
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

// ---------------------------------------------------------------------------
// Reusable toggle row
// ---------------------------------------------------------------------------

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="mt-0.5 text-sm text-gray-500">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const initialToggles = {
  // Workspace
  openInvites: false,
  guestAccess: true,
  // Notifications (admin)
  memberJoined: true,
  pendingApprovals: true,
  billingAlerts: true,
  systemAlerts: true,
  // Security
  enforceMfa: false,
  sessionAlerts: true,
  ipAllowlist: false,
  ssoOnly: false,
  // Integrations
  webhooksEnabled: true,
  apiAccess: true,
};

type ToggleKey = keyof typeof initialToggles;

// Nav sections
type Section = "workspace" | "members" | "notifications" | "appearance" | "security" | "integrations" | "danger";

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "workspace",     label: "Workspace",     icon: <Building2 size={16} /> },
  { id: "members",       label: "Members",        icon: <Users size={16} /> },
  { id: "notifications", label: "Notifications",  icon: <Bell size={16} /> },
  { id: "appearance",    label: "Appearance",     icon: <Monitor size={16} /> },
  { id: "security",      label: "Security",       icon: <Shield size={16} /> },
  { id: "integrations",  label: "Integrations",   icon: <Zap size={16} /> },
  { id: "danger",        label: "Danger zone",    icon: <ShieldAlert size={16} /> },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminSettingsPage() {
  const [toggles, setToggles] = useState(initialToggles);
  const [active, setActive] = useState<Section>("workspace");
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Workspace form state
  const [workspace, setWorkspace] = useState({
    name: "CixioHub TKM",
    slug: "cixiohub-tkm",
    contact: "workspace@cixiohub.test",
    timezone: "Asia/Kolkata (IST, UTC+5:30)",
    language: "English (India)",
    defaultRole: "member",
  });

  // Password policy
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: "10",
    expiry: "90",
    sessionTimeout: "30",
  });

  const flip = (key: ToggleKey) =>
    setToggles((c) => ({ ...c, [key]: !c[key] }));

  const handleSave = () => setSaved(true);

  return (
    <main className="min-h-screen bg-cixio-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* ── Hero ── */}
        <section className="mb-6 rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cixio-muted">
            Admin · Settings
          </p>
          <h1 className="mt-2 text-3xl font-bold text-cixio-dark">
            Workspace settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Configure workspace behaviour, access control, security policies, and integrations for all members.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">

          {/* ── Sidebar nav ── */}
          <aside className="rounded-lg border border-cixio-light bg-white p-4 shadow-sm self-start">
            <nav className="space-y-1 text-sm font-medium text-gray-600">
              {navItems.map(({ id, label, icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setActive(id); setSaved(false); setDeleteConfirm(false); }}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition ${
                    active === id
                      ? "bg-cixio-light text-cixio-dark font-semibold"
                      : "hover:bg-gray-50"
                  } ${id === "danger" ? "mt-4 text-red-600 hover:bg-red-50" : ""}`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Content panels ── */}
          <div className="space-y-6">

            {/* Saved banner */}
            {saved && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={16} aria-hidden="true" />
                Changes saved successfully.
              </div>
            )}

            {/* ── WORKSPACE ── */}
            {active === "workspace" && (
              <section className="rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-cixio-dark">Workspace</h2>
                <p className="mt-1 text-sm text-gray-500">General details visible to all workspace members.</p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Workspace name</span>
                    <input
                      className="input-cixio mt-1.5"
                      value={workspace.name}
                      onChange={(e) => setWorkspace((c) => ({ ...c, name: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Workspace slug</span>
                    <input
                      className="input-cixio mt-1.5"
                      value={workspace.slug}
                      onChange={(e) => setWorkspace((c) => ({ ...c, slug: e.target.value }))}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-semibold text-gray-700">Primary contact email</span>
                    <input
                      className="input-cixio mt-1.5"
                      type="email"
                      value={workspace.contact}
                      onChange={(e) => setWorkspace((c) => ({ ...c, contact: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Default member role</span>
                    <select
                      className="input-cixio mt-1.5"
                      value={workspace.defaultRole}
                      onChange={(e) => setWorkspace((c) => ({ ...c, defaultRole: e.target.value }))}
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Timezone</span>
                    <input
                      className="input-cixio mt-1.5"
                      value={workspace.timezone}
                      onChange={(e) => setWorkspace((c) => ({ ...c, timezone: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Language</span>
                    <select
                      className="input-cixio mt-1.5"
                      value={workspace.language}
                      onChange={(e) => setWorkspace((c) => ({ ...c, language: e.target.value }))}
                    >
                      <option>English (India)</option>
                      <option>English (US)</option>
                      <option>Malayalam</option>
                    </select>
                  </label>
                </div>

                <div className="mt-5 flex justify-end">
                  <button type="button" onClick={handleSave} className="btn-cixio">Save changes</button>
                </div>
              </section>
            )}

            {/* ── MEMBERS ── */}
            {active === "members" && (
              <section className="rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-cixio-dark">Members</h2>
                <p className="mt-1 text-sm text-gray-500">Control how people join and what they can do by default.</p>

                <div className="mt-4 divide-y divide-cixio-light">
                  <ToggleRow
                    label="Open invites"
                    description="Any member can invite others without admin approval."
                    checked={toggles.openInvites}
                    onChange={() => flip("openInvites")}
                  />
                  <ToggleRow
                    label="Guest access"
                    description="Allow external guests with limited read-only access."
                    checked={toggles.guestAccess}
                    onChange={() => flip("guestAccess")}
                  />
                </div>

                <div className="mt-5 rounded-lg border border-cixio-light bg-cixio-light/40 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-cixio-dark">Active members</p>
                      <p className="mt-0.5 text-sm text-gray-500">382 of 500 seats used</p>
                    </div>
                    <div className="w-40">
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div className="h-2 rounded-full bg-cixio-blue" style={{ width: "76%" }} />
                      </div>
                      <p className="mt-1 text-right text-xs text-gray-400">76% capacity</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button type="button" onClick={handleSave} className="btn-cixio">Save changes</button>
                </div>
              </section>
            )}

            {/* ── NOTIFICATIONS ── */}
            {active === "notifications" && (
              <section className="rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-cixio-dark">Notifications</h2>
                <p className="mt-1 text-sm text-gray-500">Choose which admin events trigger alerts.</p>

                <div className="mt-4 divide-y divide-cixio-light">
                  <ToggleRow
                    label="New member joined"
                    description="Alert when someone joins the workspace."
                    checked={toggles.memberJoined}
                    onChange={() => flip("memberJoined")}
                  />
                  <ToggleRow
                    label="Pending approvals"
                    description="Notify when invite requests are waiting for approval."
                    checked={toggles.pendingApprovals}
                    onChange={() => flip("pendingApprovals")}
                  />
                  <ToggleRow
                    label="Billing alerts"
                    description="Seat limits, failed payments, and plan changes."
                    checked={toggles.billingAlerts}
                    onChange={() => flip("billingAlerts")}
                  />
                  <ToggleRow
                    label="System alerts"
                    description="Downtime, degraded performance, and critical errors."
                    checked={toggles.systemAlerts}
                    onChange={() => flip("systemAlerts")}
                  />
                </div>
              </section>
            )}

            {/* ── APPEARANCE ── */}
            {active === "appearance" && (
              <section className="rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-cixio-dark">Appearance</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Display preferences applied across the admin panel.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Theme</span>
                    <select className="input-cixio mt-1.5" defaultValue="light">
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System default</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Density</span>
                    <select className="input-cixio mt-1.5" defaultValue="comfortable">
                      <option value="comfortable">Comfortable</option>
                      <option value="compact">Compact</option>
                    </select>
                  </label>
                </div>

                <div className="mt-5 flex justify-end">
                  <button type="button" onClick={handleSave} className="btn-cixio">Save changes</button>
                </div>
              </section>
            )}

            {/* ── SECURITY ── */}
            {active === "security" && (
              <div className="space-y-6">
                <section className="rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-cixio-dark">Security policies</h2>
                  <p className="mt-1 text-sm text-gray-500">Enforce authentication and access rules for all members.</p>

                  <div className="mt-4 divide-y divide-cixio-light">
                    <ToggleRow
                      label="Enforce MFA for all members"
                      description="Members must set up two-factor authentication to log in."
                      checked={toggles.enforceMfa}
                      onChange={() => flip("enforceMfa")}
                    />
                    <ToggleRow
                      label="Session alerts"
                      description="Notify admins of new browser sign-ins."
                      checked={toggles.sessionAlerts}
                      onChange={() => flip("sessionAlerts")}
                    />
                    <ToggleRow
                      label="IP allowlist"
                      description="Restrict access to approved IP ranges only."
                      checked={toggles.ipAllowlist}
                      onChange={() => flip("ipAllowlist")}
                    />
                    <ToggleRow
                      label="SSO-only login"
                      description="Disable password login; require SSO for all members."
                      checked={toggles.ssoOnly}
                      onChange={() => flip("ssoOnly")}
                    />
                  </div>
                </section>

                <section className="rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-cixio-dark">Password policy</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <label className="block">
                      <span className="text-sm font-semibold text-gray-700">Min. length</span>
                      <input
                        className="input-cixio mt-1.5"
                        type="number"
                        min={8}
                        value={passwordPolicy.minLength}
                        onChange={(e) => setPasswordPolicy((c) => ({ ...c, minLength: e.target.value }))}
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-gray-700">Expiry (days)</span>
                      <input
                        className="input-cixio mt-1.5"
                        type="number"
                        min={0}
                        value={passwordPolicy.expiry}
                        onChange={(e) => setPasswordPolicy((c) => ({ ...c, expiry: e.target.value }))}
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-gray-700">Session timeout (min)</span>
                      <input
                        className="input-cixio mt-1.5"
                        type="number"
                        min={5}
                        value={passwordPolicy.sessionTimeout}
                        onChange={(e) => setPasswordPolicy((c) => ({ ...c, sessionTimeout: e.target.value }))}
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <button type="button" onClick={handleSave} className="btn-cixio">Save changes</button>
                  </div>
                </section>

                <section className="rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-cixio-dark">API keys</h2>
                  <p className="mt-1 text-sm text-gray-500">Manage keys used for programmatic workspace access.</p>
                  <div className="mt-4 overflow-hidden rounded-lg border border-cixio-light">
                    {[
                      { name: "Production key", created: "12 Jan 2026", last: "Today" },
                      { name: "CI/CD integration", created: "03 Mar 2026", last: "Yesterday" },
                    ].map((k) => (
                      <div key={k.name} className="flex items-center justify-between gap-4 border-b border-cixio-light px-4 py-3 last:border-0">
                        <div className="flex items-center gap-3">
                          <Key size={16} className="text-cixio-blue shrink-0" aria-hidden="true" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{k.name}</p>
                            <p className="text-xs text-gray-400">Created {k.created} · Last used {k.last}</p>
                          </div>
                        </div>
                        <button type="button" className="text-xs font-semibold text-red-500 hover:underline">
                          Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-md border border-cixio-blue px-4 py-2 text-sm font-semibold text-cixio-blue transition hover:bg-cixio-light"
                    >
                      <Key size={14} aria-hidden="true" />
                      Generate new key
                    </button>
                  </div>
                </section>
              </div>
            )}

            {/* ── INTEGRATIONS ── */}
            {active === "integrations" && (
              <div className="space-y-6">
                <section className="rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-cixio-dark">Integrations</h2>
                  <p className="mt-1 text-sm text-gray-500">Control third-party connections and automation hooks.</p>

                  <div className="mt-4 divide-y divide-cixio-light">
                    <ToggleRow
                      label="Webhooks"
                      description="Send workspace events to external services via HTTP."
                      checked={toggles.webhooksEnabled}
                      onChange={() => flip("webhooksEnabled")}
                    />
                    <ToggleRow
                      label="API access"
                      description="Allow programmatic access using API keys."
                      checked={toggles.apiAccess}
                      onChange={() => flip("apiAccess")}
                    />
                  </div>
                </section>

                <section className="rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-cixio-dark">Webhook endpoints</h2>
                  <div className="mt-4 overflow-hidden rounded-lg border border-cixio-light">
                    {[
                      { url: "https://hooks.example.com/cixio", events: "member.joined, task.completed", status: "Active" },
                      { url: "https://ci.internal/webhook", events: "workspace.updated", status: "Paused" },
                    ].map((w) => (
                      <div key={w.url} className="flex flex-col gap-1 border-b border-cixio-light px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <Webhook size={16} className="mt-0.5 text-cixio-blue shrink-0" aria-hidden="true" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 break-all">{w.url}</p>
                            <p className="text-xs text-gray-400">{w.events}</p>
                          </div>
                        </div>
                        <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${
                          w.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {w.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-md border border-cixio-blue px-4 py-2 text-sm font-semibold text-cixio-blue transition hover:bg-cixio-light"
                    >
                      <Link2 size={14} aria-hidden="true" />
                      Add endpoint
                    </button>
                  </div>
                </section>
              </div>
            )}

            {/* ── DANGER ZONE ── */}
            {active === "danger" && (
              <section className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-red-600">Danger zone</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Irreversible workspace-level actions. These cannot be undone.
                </p>

                <div className="mt-5 space-y-4">
                  {/* Transfer ownership */}
                  <div className="flex flex-col gap-3 rounded-lg border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Transfer ownership</p>
                      <p className="text-sm text-gray-500">Hand over super-admin rights to another member.</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex w-fit items-center gap-2 rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <UserCog size={16} aria-hidden="true" />
                      Transfer
                    </button>
                  </div>

                  {/* Purge members */}
                  <div className="flex flex-col gap-3 rounded-lg border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Remove all guests</p>
                      <p className="text-sm text-gray-500">Revoke access for every guest account in this workspace.</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex w-fit items-center gap-2 rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <Users size={16} aria-hidden="true" />
                      Remove guests
                    </button>
                  </div>

                  {/* Delete workspace */}
                  <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Delete workspace</p>
                      <p className="text-sm text-gray-500">
                        Permanently delete CixioHub TKM and all its data. There is no recovery.
                      </p>
                    </div>
                    {deleteConfirm ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(false)}
                          className="rounded-md px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-red-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                          Confirm delete
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(true)}
                        className="inline-flex w-fit items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                        Delete workspace
                      </button>
                    )}
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}