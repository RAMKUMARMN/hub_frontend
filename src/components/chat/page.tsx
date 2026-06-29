import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import NewChatButton from "@/components/chat/newchatbutton";

async function getLatestSessionId(): Promise<string | null> {
  try {
    const token = (await cookies()).get("access_token")?.value;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/sessions`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });

    if (!res.ok) return null;

    const sessions = await res.json();
    if (!sessions || sessions.length === 0) return null;

    // Sessions are ordered by last update per the spec — take the first
    return sessions[0].id;
  } catch {
    // backend not running, or network error — no fake fallback
    return null;
  }
}

export default async function ChatIndexPage() {
  const latestId = await getLatestSessionId();

  if (latestId) {
    redirect(`/chat/${latestId}`);
  }

  // No sessions exist yet (or backend is down) — show a real empty state,
  // NOT a redirect to a fake "default" id
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <p className="text-sm text-gray-500 mb-3">No conversations yet</p>
      <NewChatButton />
    </div>
  );
}