"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const NAV_LINKS = [
  { href: "/chat", label: "Chat" },
  { href: "/documents", label: "Documents" },
  { href: "/todos", label: "Todos" },
  { href: "/queues", label: "Queues" },
];

const AUTH_PATHS = ["/login", "/register"];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) return null;

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cixio-dark border-b border-cixio-navy/40 px-4 py-2 flex items-center justify-between shadow-lg">
      {/* Brand */}
      <div className="flex items-center gap-6">
        <Link href="/chat" className="flex items-center gap-2.5 flex-shrink-0">
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
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {user && (
          <div 
            className="hidden sm:flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            onClick={() => router.push("/profile")}
          >
            <div className="w-7 h-7 rounded-full bg-cixio-blue flex items-center justify-center text-white text-xs font-bold overflow-hidden border border-white/10">
              {user.avatar_url ? (
                <img 
                  src={`http://localhost:8000/api/v1/auth/avatar/${user.id}`}
                  alt={user.full_name || "Profile"} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If image fails to load, hide it so the fallback can be shown/handled
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                user.full_name?.charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-sm text-cixio-light/80">{user.full_name}</span>
          </div>
        )}
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