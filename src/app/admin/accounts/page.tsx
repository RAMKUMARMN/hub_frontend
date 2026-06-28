"use client";
// app/admin/accounts/page.tsx
// Manage Accounts page at /admin/accounts
// Full account details: view, edit role, suspend, delete

import { useEffect, useState } from "react";
import api, { buildApiUrl } from "@/lib/api";

type Role    = "Admin" | "Engineer" | "Designer" | "Manager" | "Analyst" | "DevOps" | "Member";
type AcctStatus = "active" | "suspended" | "inactive";

type Account = {
  id:        string;
  name:      string;
  email:     string;
  role:      Role;
  status:    AcctStatus;
  joined:    string;
  lastSeen:  string;
  tasks:     number;
  notes:     number;
  storage:   string; // e.g. "240 MB"
  avatar:    string; // initials
};

const ACCOUNTS: Account[] = [
  { id:"1", name:"Alex Johnson",  email:"alex@smarthub.io",    role:"Admin",    status:"active",    joined:"2025-01-10", lastSeen:"Today",      tasks:42, notes:18, storage:"1.2 GB", avatar:"AJ" },
  { id:"2", name:"Sarah Ahmed",   email:"sarah@smarthub.io",   role:"Designer", status:"active",    joined:"2025-03-22", lastSeen:"2 hours ago", tasks:17, notes:9,  storage:"340 MB", avatar:"SA" },
  { id:"3", name:"James Liu",     email:"james@smarthub.io",   role:"Engineer", status:"active",    joined:"2025-04-01", lastSeen:"Yesterday",   tasks:31, notes:5,  storage:"780 MB", avatar:"JL" },
  { id:"4", name:"Priya Sharma",  email:"priya@smarthub.io",   role:"Manager",  status:"active",    joined:"2025-05-15", lastSeen:"3 days ago",  tasks:24, notes:22, storage:"510 MB", avatar:"PS" },
  { id:"5", name:"Omar Farooq",   email:"omar@smarthub.io",    role:"DevOps",   status:"suspended", joined:"2025-06-01", lastSeen:"1 week ago",  tasks:8,  notes:2,  storage:"120 MB", avatar:"OF" },
  { id:"6", name:"Lena Müller",   email:"lena@smarthub.io",    role:"Analyst",  status:"inactive",  joined:"2025-02-18", lastSeen:"1 month ago", tasks:5,  notes:3,  storage:"90 MB",  avatar:"LM" },
];

const statusStyles: Record<AcctStatus, string> = {
  active:    "bg-green-100 text-green-700",
  suspended: "bg-yellow-100 text-yellow-700",
  inactive:  "bg-gray-100 text-gray-500",
};

const ROLES: Role[] = ["Admin","Engineer","Designer","Manager","Analyst","DevOps","Member"];

export default function ManageAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(ACCOUNTS);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<AcctStatus | "all">("all");
  const [selected, setSelected] = useState<Account | null>(null); // detail drawer

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const res = await api.get(buildApiUrl("/admin/users"));
        const users = res.data as Array<{
          id: string;
          full_name: string;
          email: string;
          avatar_url?: string | null;
          is_admin?: boolean;
          created_at?: string;
        }>;

        const mapped: Account[] = users.map((user) => ({
          id: user.id,
          name: user.full_name || user.email,
          email: user.email,
          role: (user.is_admin ? "Admin" : "Member") as Role,
          status: "active" as AcctStatus,
          joined: user.created_at ? new Date(user.created_at).toISOString().slice(0, 10) : "",
          lastSeen: "Recently updated",
          tasks: 0,
          notes: 0,
          storage: "—",
          avatar: (user.full_name || user.email).split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
        }));

        setAccounts(mapped);
      } catch (error) {
        console.error("Failed to load accounts", error);
      }
    };

    loadAccounts();
  }, []);

  async function updateAccount(id: string, patch: Partial<Account>) {
    try {
      const body: Record<string, unknown> = {};
      if (patch.status) {
        body.status = patch.status;
        body.is_active = patch.status === "active";
      }
      if (patch.role === "Admin") {
        body.is_admin = true;
      } else if (patch.role === "Member") {
        body.is_admin = false;
      }
      await api.patch(buildApiUrl(`/admin/users/${id}`), body);
    } catch (error) {
      console.error("Failed to update account", error);
      return;
    }

    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, ...patch } : prev);
  }

  async function deleteAccount(id: string) {
    if (!confirm("Permanently delete this account?")) return;
    try {
      await api.delete(buildApiUrl(`/admin/users/${id}`));
    } catch (error) {
      console.error("Failed to delete account", error);
      return;
    }

    setAccounts((prev) => prev.filter((a) => a.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  const visible = accounts.filter((a) => {
    const matchFilter = filter === "all" || a.status === filter;
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    all:       accounts.length,
    active:    accounts.filter((a) => a.status === "active").length,
    suspended: accounts.filter((a) => a.status === "suspended").length,
    inactive:  accounts.filter((a) => a.status === "inactive").length,
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Manage Accounts</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {counts.active} active · {counts.suspended} suspended · {counts.inactive} inactive
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: "Total accounts", value: counts.all,       color: "text-blue-600"   },
            { label: "Active",         value: counts.active,    color: "text-green-600"  },
            { label: "Suspended",      value: counts.suspended, color: "text-yellow-600" },
            { label: "Inactive",       value: counts.inactive,  color: "text-gray-500"   },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-5">

          {/* ── Left: table ── */}
          <div className="flex-1">
            {/* Filter + search bar */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
              <div className="flex gap-1">
                {(["all","active","suspended","inactive"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-colors ${
                      filter === f
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {f} ({counts[f]})
                  </button>
                ))}
              </div>
              <div className="relative ml-auto">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">User</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Last seen</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((acct) => (
                    <tr
                      key={acct.id}
                      onClick={() => setSelected(acct)}
                      className={`border-b border-gray-50 last:border-0 cursor-pointer transition-colors ${
                        selected?.id === acct.id ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                            {acct.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{acct.name}</p>
                            <p className="text-xs text-gray-400">{acct.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{acct.role}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[acct.status]}`}>
                          {acct.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">{acct.lastSeen}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                          {acct.status === "active" ? (
                            <button
                              onClick={() => updateAccount(acct.id, { status: "suspended" })}
                              className="text-xs border border-yellow-200 text-yellow-600 px-2.5 py-1 rounded-lg hover:bg-yellow-50 transition-colors"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => updateAccount(acct.id, { status: "active" })}
                              className="text-xs border border-green-200 text-green-600 px-2.5 py-1 rounded-lg hover:bg-green-50 transition-colors"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => deleteAccount(acct.id)}
                            className="text-xs border border-red-200 text-red-400 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visible.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-400 text-sm py-12">
                        No accounts match your filter
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Right: detail drawer ── */}
          {selected && (
            <aside className="w-64 shrink-0">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-6">
                {/* Close */}
                <button
                  onClick={() => setSelected(null)}
                  className="float-right text-gray-300 hover:text-gray-500 text-sm"
                >
                  ✕
                </button>

                {/* Avatar */}
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-xl font-semibold flex items-center justify-center mx-auto mb-2">
                    {selected.avatar}
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{selected.name}</p>
                  <p className="text-xs text-gray-400">{selected.email}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: "Tasks",   value: selected.tasks   },
                    { label: "Notes",   value: selected.notes   },
                    { label: "Storage", value: selected.storage },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                      <p className="text-xs font-semibold text-gray-700">{s.value}</p>
                      <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Meta */}
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div className="flex justify-between">
                    <span>Joined</span>
                    <span className="text-gray-700">
                      {new Date(selected.joined).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last seen</span>
                    <span className="text-gray-700">{selected.lastSeen}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className={`font-medium capitalize ${
                      selected.status === "active" ? "text-green-600" :
                      selected.status === "suspended" ? "text-yellow-600" : "text-gray-400"
                    }`}>
                      {selected.status}
                    </span>
                  </div>
                </div>

                {/* Role editor */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                  <select
                    value={selected.role}
                    onChange={(e) => updateAccount(selected.id, { role: e.target.value as Role })}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>

                {/* Quick actions */}
                <div className="space-y-2">
                  {selected.status === "active" ? (
                    <button
                      onClick={() => updateAccount(selected.id, { status: "suspended" })}
                      className="w-full text-xs border border-yellow-200 text-yellow-600 py-2 rounded-lg hover:bg-yellow-50 transition-colors"
                    >
                      Suspend account
                    </button>
                  ) : (
                    <button
                      onClick={() => updateAccount(selected.id, { status: "active" })}
                      className="w-full text-xs border border-green-200 text-green-600 py-2 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      Activate account
                    </button>
                  )}
                  <button
                    onClick={() => deleteAccount(selected.id)}
                    className="w-full text-xs border border-red-200 text-red-400 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete account
                  </button>
                </div>
              </div>
            </aside>
          )}

        </div>
      </div>
    </main>
  );
}
