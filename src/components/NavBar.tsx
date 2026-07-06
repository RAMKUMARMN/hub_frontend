"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat",      label: "Chat"      },
  { href: "/documents", label: "Documents" },
  { href: "/todos",     label: "Todos"     },
  { href: "/calendar",  label: "Calendar"  },
  { href: "/queues",    label: "Queues"    },
  { href: "/settings",  label: "Settings"  },
];

// Admin links shown separately on the right (only if user is admin)
const ADMIN_LINKS = [
  { href: "/admin/users",      label: "Users"    },
  { href: "/admin/csv-upload", label: "CSV"      },
  { href: "/admin/accounts",   label: "Accounts" },
];

// Paths where the navbar should be hidden (auth pages)
const AUTH_PATHS = ["/auth/login", "/auth/register", "/login", "/register"];

export default function NavBar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = usePathname();
  const router   = useRouter();
  const { user, clearAuth } = useAuthStore();

  // Hide navbar on auth pages or until client-side mounting is complete
  if (!mounted || AUTH_PATHS.some((p) => pathname.startsWith(p))) return null;

  const handleLogout = () => {
    clearAuth();
    router.push("/auth/login");
  };

  // Check if user is admin — adjust this to match your actual auth store shape
  const isAdmin = user?.role === "admin" || user?.is_admin === true;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cixio-dark border-b border-cixio-navy/40 px-4 py-2 flex items-center justify-between shadow-lg">

      {/* ── Left: logo + nav links ── */}
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
          <img
            src="/cixio-logo-white.png"
            alt="Cixio"
            className="h-8 object-contain"
          />
        </Link>

        {/* Main nav links */}
        <div className="hidden sm:flex gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-all duration-150 ${
                pathname.startsWith(link.href)
                  ? "bg-cixio-blue text-white shadow-sm"
                  : "text-cixio-light/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Admin links — only shown to admins */}
          {isAdmin && (
            <>
              {/* Divider */}
              <span className="w-px bg-white/10 mx-1" />
              {ADMIN_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium px-3 py-1.5 rounded-md transition-all duration-150 ${
                    pathname.startsWith(link.href)
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-yellow-300/80 hover:text-yellow-200 hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Right: profile avatar + settings + sign out ── */}
      <div className="flex items-center gap-3">

        {/* Profile link with avatar */}
        {user && (
          <Link
            href="/profile"
            className={`hidden sm:flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-150 ${
              pathname.startsWith("/profile")
                ? "bg-white/10"
                : "hover:bg-white/10"
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-cixio-blue flex items-center justify-center text-white text-xs font-bold">
              {user.full_name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-cixio-light/80">{user.full_name}</span>
          </Link>
        )}

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="text-sm text-cixio-light/60 hover:text-white font-medium border border-white/20 rounded-md px-3 py-1.5 hover:bg-white/10 transition"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}