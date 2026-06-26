let socket: WebSocket | null = null;

export function connectWebSocket(
  userId: string,
  onMessage?: (data: any) => void
) {
  console.log("CONNECT FUNCTION CALLED");
  console.log("User:", userId);

  if (socket) {
    socket.close();
  }

  socket = new WebSocket(`ws://localhost:8000/ws/${userId}`);

  socket.onopen = () => {
    console.log("✅ WebSocket connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    console.log("📩 Notification:", data);

    onMessage?.(data);
  };

  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  socket.onclose = () => {
    console.log("❌ WebSocket disconnected");
  };

  return () => {
    socket?.close();
    socket = null;
  };
}