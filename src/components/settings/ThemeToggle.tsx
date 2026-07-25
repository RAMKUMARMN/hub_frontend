"use client"; // needs browser APIs (localStorage, matchMedia) — must be a Client Component

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Why we need this: on the server, Next.js has no idea what theme the user
  // prefers (no access to their browser/localStorage). So `theme` is
  // `undefined` until the component mounts in the browser. If we render
  // anything theme-dependent before that, server and client HTML won't
  // match → React throws a hydration error. Waiting for `mounted` sidesteps it.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render an invisible placeholder of the same size so layout doesn't jump
    return <div className="h-[60px]" />;
  }

  const options = [
    { value: "light", label: "Light", icon: "☀️" },
    { value: "dark", label: "Dark", icon: "🌙" },
    { value: "system", label: "System", icon: "🖥️" },
  ];

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs transition
            ${
              theme === opt.value
                ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-500"
                : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
            }`}
        >
          <span className="text-base">{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}