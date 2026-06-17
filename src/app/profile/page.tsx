"use client";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Building2,
  Camera,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types";

const fallbackUser: User = {
  id: "mock-user-1",
  email: "vaishnav@cixiohub.test",
  full_name: "Vaishnav Menon",
  phone: "+91 98765 43210",
  avatar_url: null,
  is_admin: true,
  created_at: "2026-01-12T09:00:00.000Z",
};

type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
};

const buildProfileForm = (user: User): ProfileForm => ({
  fullName: user.full_name,
  email: user.email,
  phone: user.phone ?? "",
  role: user.is_admin ? "Admin" : "Member",
  department: user.is_admin ? "Platform operations" : "Student workspace",
  location: "Kerala, India",
});

export default function ProfilePage() {
  const storeUser = useAuthStore((state) => state.user);
  const profileUser = storeUser ?? fallbackUser;
  const [form, setForm] = useState<ProfileForm>(() => buildProfileForm(profileUser));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(buildProfileForm(profileUser));
    setSaved(false);
  }, [profileUser]);

  const initials = useMemo(
    () =>
      form.fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "CU",
    [form.fullName]
  );

  const joinedDate = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(profileUser.created_at));

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <main className="min-h-screen bg-cixio-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="mb-6 rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cixio-muted">
            Profile
          </p>
          <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
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
              <div>
                <h1 className="text-3xl font-bold text-cixio-dark">{form.fullName}</h1>
                <p className="mt-1 text-sm text-gray-500">{form.email}</p>
                <p className="mt-2 inline-flex rounded-md bg-cixio-light px-2.5 py-1 text-xs font-semibold text-cixio-dark">
                  Joined {joinedDate}
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck size={16} aria-hidden="true" />
                Verified workspace account
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
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
              </div>
            </section>

            <section className="rounded-lg border border-cixio-light bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-cixio-dark">Access</h2>
              <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-white p-2 text-cixio-blue shadow-sm">
                    <UserRound size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{form.role}</p>
                    <p className="text-sm text-gray-500">Workspace role</p>
                  </div>
                </div>
              </div>
            </section>
          </aside>

          <section className="rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-cixio-dark">Profile details</h2>
                <p className="mt-1 text-sm text-gray-500">Edit the visible account information for this workspace.</p>
              </div>
              {saved ? (
                <span className="inline-flex w-fit items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Saved
                </span>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Full name</span>
                  <input
                    className="input-cixio mt-1.5"
                    value={form.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Email</span>
                  <input
                    className="input-cixio mt-1.5"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Phone</span>
                  <input
                    className="input-cixio mt-1.5"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Role</span>
                  <select
                    className="input-cixio mt-1.5"
                    value={form.role}
                    onChange={(event) => updateField("role", event.target.value)}
                  >
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
                    onChange={(event) => updateField("department", event.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Location</span>
                  <input
                    className="input-cixio mt-1.5"
                    value={form.location}
                    onChange={(event) => updateField("location", event.target.value)}
                  />
                </label>
              </div>

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
    </main>
  );
}

