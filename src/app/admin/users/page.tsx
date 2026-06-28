"use client";
// app/admin/users/page.tsx
// User Approval Page at /admin/users
// Admins can approve or reject pending user registrations

import { useEffect, useState } from "react";
import api, { buildApiUrl } from "@/lib/api";

type UserStatus = "pending" | "approved" | "rejected";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  requestedAt: string;
  status: UserStatus;
  avatar: string; // initials
};

// Mock pending users — replace with: const users = await fetch("/api/admin/users")
const INITIAL_USERS: User[] = [
  { id: "1", name: "Sarah Ahmed",    email: "sarah@company.io",   role: "Designer",          requestedAt: "2026-06-14", status: "pending",  avatar: "SA" },
  { id: "2", name: "James Liu",      email: "james@company.io",   role: "Backend Engineer",  requestedAt: "2026-06-13", status: "pending",  avatar: "JL" },
  { id: "3", name: "Priya Sharma",   email: "priya@company.io",   role: "Product Manager",   requestedAt: "2026-06-12", status: "approved", avatar: "PS" },
  { id: "4", name: "Omar Farooq",    email: "omar@company.io",    role: "DevOps",            requestedAt: "2026-06-11", status: "rejected", avatar: "OF" },
  { id: "5", name: "Lena Müller",    email: "lena@company.io",    role: "Data Analyst",      requestedAt: "2026-06-10", status: "pending",  avatar: "LM" },
  { id: "6", name: "Carlos Vega",    email: "carlos@company.io",  role: "Frontend Engineer", requestedAt: "2026-06-09", status: "pending",  avatar: "CV" },
];

const statusStyles: Record<UserStatus, string> = {
  pending:  "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-500",
};

export default function AdminUsersPage() {
  const [users,  setUsers]  = useState<User[]>(INITIAL_USERS);
  const [filter, setFilter] = useState<UserStatus | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await api.get(buildApiUrl("/admin/pending-users"));
        const payload = res.data as Array<{
          id: string;
          full_name: string;
          email: string;
          created_at?: string;
        }>;

        const mapped = payload.map((user) => ({
          id: user.id,
          name: user.full_name || user.email,
          email: user.email,
          role: "Member",
          requestedAt: user.created_at || new Date().toISOString(),
          status: "pending" as UserStatus,
          avatar: (user.full_name || user.email).split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
        }));
        setUsers(mapped);
      } catch (error) {
        console.error("Failed to load pending users", error);
      }
    };

    loadUsers();
  }, []);

  async function setStatus(id: string, status: UserStatus) {
    try {
      if (status === "approved") {
        await api.patch(buildApiUrl(`/admin/approve/${id}`));
      } else if (status === "rejected") {
        await api.patch(buildApiUrl(`/admin/users/${id}`), { status: "rejected" });
      } else {
        await api.patch(buildApiUrl(`/admin/users/${id}`), { status: "pending" });
      }
    } catch (error) {
      console.error("Failed to update user status", error);
      return;
    }

    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
  }

  async function approveAll() {
    const pendingUsers = users.filter((u) => u.status === "pending");
    try {
      await Promise.all(pendingUsers.map((u) => api.patch(buildApiUrl(`/admin/approve/${u.id}`))));
    } catch (error) {
      console.error("Failed to approve pending users", error);
      return;
    }

    setUsers((prev) => prev.map((u) => (u.status === "pending" ? { ...u, status: "approved" } : u)));
  }

  // Filtered list
  const visible = users.filter((u) => {
    const matchesFilter = filter === "all" || u.status === filter;
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all:      users.length,
    pending:  users.filter((u) => u.status === "pending").length,
    approved: users.filter((u) => u.status === "approved").length,
    rejected: users.filter((u) => u.status === "rejected").length,
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">User Approvals</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {counts.pending} pending · {counts.approved} approved · {counts.rejected} rejected
            </p>
          </div>
          {counts.pending > 0 && (
            <button
              onClick={approveAll}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ✓ Approve all pending ({counts.pending})
            </button>
          )}
        </div>

        {/* Filter tabs + search */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 mb-5 flex flex-wrap items-center gap-3">
          {/* Status filter tabs */}
          <div className="flex gap-1">
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
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

          {/* Search */}
          <div className="relative ml-auto">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
            />
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">User</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Role</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Requested</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  {/* User */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-4 text-gray-600">{user.role}</td>

                  {/* Requested date */}
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {new Date(user.requestedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>

                  {/* Status badge */}
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusStyles[user.status]}`}>
                      {user.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex gap-2 justify-end">
                      {user.status !== "approved" && (
                        <button
                          onClick={() => setStatus(user.id, "approved")}
                          className="text-xs bg-green-50 border border-green-200 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          ✓ Approve
                        </button>
                      )}
                      {user.status !== "rejected" && (
                        <button
                          onClick={() => setStatus(user.id, "rejected")}
                          className="text-xs bg-red-50 border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          ✕ Reject
                        </button>
                      )}
                      {user.status === "approved" && (
                        <button
                          onClick={() => setStatus(user.id, "pending")}
                          className="text-xs border border-gray-200 text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 text-sm py-12">
                    No users match your filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}
