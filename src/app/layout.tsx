import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import NavBar from "@/components/NavBar";
import { TasksProvider } from "@/store/tasksContext";

export const metadata: Metadata = {
  title: "CixioHub — AI Platform for TKM",
  description: "AI-powered chat platform for TKM students",
  icons: {
    icon: "/cixio-icon.svg",
    apple: "/cixio-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning is required here — next-themes sets the class
    // on <html> before React hydrates, which would otherwise cause a mismatch warning
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-cixio-bg dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            <Providers>
              <TasksProvider>
                <NavBar />
                <div className="pt-14">{children}</div>
              </TasksProvider>
            </Providers>
      </body>
    </html>
  );
}
