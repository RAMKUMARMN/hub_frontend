"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/store/authStore";
import { connectWebSocket } from "@/lib/websocket";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user?.id) return;

    const socket = connectWebSocket(user.id, (data) => {
      console.log("Received:", data);
    });

    return () => socket.close();
  }, [user?.id]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}