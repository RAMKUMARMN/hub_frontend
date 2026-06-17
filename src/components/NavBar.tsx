"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "Chat" },
  { href: "/documents", label: "Documents" },
  { href: "/todos", label: "Todos" },
  { href: "/queues", label: "Queues" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

const AUTH_PATHS = ["/login", "/register"];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) return null;

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cixio-dark border-b border-cixio-navy/40 px-4 py-2 flex items-center justify-between shadow-lg">
      {/* Brand */}
      <div className="flex min-w-0 items-center gap-4 lg:gap-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
          <Image
            src="/cixio-logo-white.png"
            alt="Cixio"
            width={120}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* Nav links */}
        <div className="hidden max-w-[58vw] gap-1 overflow-x-auto md:flex">
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
        </div>
      </div>


      {/* Right side */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-cixio-blue flex items-center justify-center text-white text-xs font-bold">
              {user.full_name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-cixio-light/80">{user.full_name}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-sm text-cixio-light/70 hover:text-white font-medium border border-white/20 rounded-md px-3 py-1.5 hover:bg-white/10 transition"
        >
          <LogOut size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Sign out</span>
        </button>


      </div>
    </nav>
  );
}
