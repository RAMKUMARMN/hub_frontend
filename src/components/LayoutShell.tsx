"use client";

import { usePathname } from "next/navigation";

const AUTH_PATHS = ["/auth/login", "/auth/register", "/login", "/register"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  return <div className={isAuthPage ? "" : "pt-14"}>{children}</div>;
}
