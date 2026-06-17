"use client";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Activity,
  Building2,
  Camera,
  CheckCircle2,
  Globe,
  Key,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Trash2,
  UserCog,
  UserRound,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types";

// ---------------------------------------------------------------------------
// Types & fallback
// ---------------------------------------------------------------------------

const fallbackUser: User = {
  id: "mock-admin-1",
  email: "example@cixiohub.test",
  full_name: "abc",
  phone: "+91 98765 43210",
  avatar_url: null,
  is_admin: true,
  created_at: "2026-01-12T09:00:00.000Z",
};

type AdminProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
  timezone: string;
  bio: string;
};

const buildForm = (user: User): AdminProfileForm => ({
  fullName: user.full_name,
  email: user.email,
  phone: user.phone ?? "",
  role: "Super Admin",
  department: "Platform Operations",
  location: "Kerala, India",
  timezone: "Asia/Kolkata (IST, UTC+5:30)",
  bio: "Responsible for platform governance, access control, and workspace configuration across all CixioHub tenants.",
});

// ---------------------------------------------------------------------------
// Stat card component
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-cixio-light bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-cixio-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-cixio-dark">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminProfilePage() {
  const storeUser = useAuthStore((state) => state.user);
  const profileUser = storeUser ?? fallbackUser;

  const [form, setForm] = useState<AdminProfileForm>(() => buildForm(profileUser));
  const [saved, setSaved] = useState(false);
  const [dangerConfirm, setDangerConfirm] = useState(false);

  useEffect(() => {
    setForm(buildForm(profileUser));
    setSaved(false);
  }, [profileUser]);

  const initials = useMemo(
    () =>
      form.fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "AD",
    [form.fullName]
  );

  const joinedDate = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(profileUser.created_at));

  const updateField = (field: keyof AdminProfileForm, value: string) => {
    setForm((c) => ({ ...c, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <main className="min-h-screen bg-cixio-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ── Hero / identity card ── */}
        <section className="rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cixio-muted">
            Admin · Profile
          </p>

          <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-cixio-dark text-2xl font-bold text-white shadow-sm">
                {initials}
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-cixio-blue text-white shadow-sm transition hover:bg-cixio-hover"
                  aria-label="Update avatar"
                >
                  <Camera size={16} aria-hidden="true" />
                </button>
              </div>

              {/* Name + meta */}
              <div>
                <h1 className="text-3xl font-bold text-cixio-dark">{form.fullName}</h1>
                <p className="mt-1 text-sm text-gray-500">{form.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-md bg-cixio-light px-2.5 py-1 text-xs font-semibold text-cixio-dark">
                    Joined {joinedDate}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    <Shield size={12} aria-hidden="true" />
                    Super Admin
                  </span>
                </div>
              </div>
            </div>

            {/* Verified badge */}
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck size={16} aria-hidden="true" />
                Verified workspace account
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Workspaces managed" value="14" sub="across 3 regions" />
          <StatCard label="Active members" value="382" sub="in your tenant" />
          <StatCard label="Pending approvals" value="7" sub="action required" />
          <StatCard label="Last sign-in" value="Today" sub="9:41 AM IST" />
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">

          {/* Sidebar */}
          <aside className="space-y-4">

            {/* User info */}
            <section className="rounded-lg border border-cixio-light bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-cixio-dark">User info</h2>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 text-cixio-blue" size={18} aria-hidden="true" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-500">{form.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 text-cixio-blue" size={18} aria-hidden="true" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-500">{form.phone || "Not added"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 text-cixio-blue" size={18} aria-hidden="true" />
                  <div>
                    <p className="font-medium text-gray-900">Department</p>
                    <p className="text-gray-500">{form.department}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 text-cixio-blue" size={18} aria-hidden="true" />
                  <div>
                    <p className="font-medium text-gray-900">Timezone</p>
                    <p className="text-gray-500">{form.timezone}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Access */}
            <section className="rounded-lg border border-cixio-light bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-cixio-dark">Access</h2>
              <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-white p-2 text-amber-600 shadow-sm">
                    <UserCog size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{form.role}</p>
                    <p className="text-sm text-gray-500">Workspace role</p>
                  </div>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                {["Manage all members", "Configure workspace", "View audit logs", "Manage billing"].map(
                  (permission) => (
                    <li key={permission} className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500" aria-hidden="true" />
                      {permission}
                    </li>
                  )
                )}
              </ul>
            </section>

            {/* Security */}
            <section className="rounded-lg border border-cixio-light bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-cixio-dark">Security</h2>
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg border border-cixio-light px-4 py-3 text-sm font-semibold text-cixio-dark transition hover:bg-cixio-light"
                >
                  <Key size={16} className="text-cixio-blue" aria-hidden="true" />
                  Change password
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg border border-cixio-light px-4 py-3 text-sm font-semibold text-cixio-dark transition hover:bg-cixio-light"
                >
                  <Activity size={16} className="text-cixio-blue" aria-hidden="true" />
                  View login activity
                </button>
              </div>
            </section>
          </aside>

          {/* Main form */}
          <div className="space-y-6">
            <section className="rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-cixio-dark">Profile details</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Edit visible account information for this admin workspace.
                  </p>
                </div>
                {saved && (
                  <span className="inline-flex w-fit items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    <CheckCircle2 size={16} aria-hidden="true" />
                    Saved
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Full name</span>
                    <input
                      className="input-cixio mt-1.5"
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Email</span>
                    <input
                      className="input-cixio mt-1.5"
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Phone</span>
                    <input
                      className="input-cixio mt-1.5"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Role</span>
                    <select
                      className="input-cixio mt-1.5"
                      value={form.role}
                      onChange={(e) => updateField("role", e.target.value)}
                    >
                      <option>Super Admin</option>
                      <option>Admin</option>
                      <option>Member</option>
                      <option>Viewer</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Department</span>
                    <input
                      className="input-cixio mt-1.5"
                      value={form.department}
                      onChange={(e) => updateField("department", e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Location</span>
                    <input
                      className="input-cixio mt-1.5"
                      value={form.location}
                      onChange={(e) => updateField("location", e.target.value)}
                    />
                  </label>
                </div>

                {/* Bio – admin-specific */}
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Bio</span>
                  <textarea
                    className="input-cixio mt-1.5 min-h-[80px] resize-y"
                    value={form.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                  />
                </label>

                {/* Avatar upload */}
                <div className="rounded-lg border border-dashed border-cixio-muted/40 bg-cixio-light/40 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-cixio-dark">Avatar</p>
                      <p className="mt-1 text-sm text-gray-500">PNG or JPG, square image preferred.</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex w-fit items-center gap-2 rounded-md border border-cixio-blue px-4 py-2 text-sm font-semibold text-cixio-blue transition hover:bg-cixio-light"
                    >
                      <Camera size={16} aria-hidden="true" />
                      Choose image
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="btn-cixio">
                    Save profile
                  </button>
                </div>
              </form>
            </section>


          </div>
        </div>
      </div>
    </main>
  );
}