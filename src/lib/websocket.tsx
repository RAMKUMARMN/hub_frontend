import { toast } from "react-hot-toast";

let socket: WebSocket | null = null;

export function connectWebSocket(
  userId: string,
  onMessage?: (data: any) => void
) {
  console.log("CONNECT FUNCTION CALLED");
  console.log("User:", userId);

  // Close any previous connection
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

    // Show popup notification
    toast.custom(() => (
      <div className="bg-white border-l-4 border-blue-600 rounded-lg shadow-lg p-4 w-80">
        <h3 className="font-semibold text-blue-700">
          🔔 {data.title}
        </h3>

        <p className="text-sm text-gray-600 mt-2">
          {data.message}
        </p>
      </div>
    ));

    // Call callback only if provided
    if (onMessage) {
      onMessage(data);
    }
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