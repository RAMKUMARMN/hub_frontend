---
name: Final Hook
description: "Combined project hooks: session tracker, auto-save drafts, and auth wrapper for Hub Frontend."
tags: ['hooks', 'session', 'drafts', 'auth']
---

# Final Hook — Combined Hooks for Hub Frontend

This final hook package bundles useful hooks tailored to this repository:

- `useSessionTracker` — track Copilot sessions, log prompts, and send best-effort session logs to `/api/copilot/session-log`.
- `useAutoSaveDraft` — localStorage-backed auto-save with optional server persistence via the existing API (`/api/v1/drafts` via `src/lib/api.ts`).
- `useAuth` — small wrapper around the repository's `useAuthStore` (located in `src/store/authStore.ts`).

Files added
- `src/hooks/useFinalHooks.ts` — TypeScript implementations of the hooks above.
- `samples/hooks/final-hook.md` — this documentation.

How to use

1. Import the hooks where needed:

```tsx
import { useSessionTracker, useAutoSaveDraft, useAuth } from "@/hooks/useFinalHooks";
```

2. Track sessions in editor-like components or assistant integrations:

```tsx
const { startSession, logPrompt, endSession } = useSessionTracker();

useEffect(() => {
  startSession();
  return () => {
    endSession();
  };
}, []);
```

3. Auto-save drafts for document editor pages:

```tsx
const [doc, setDoc] = useState({ title: '', body: '' });
useAutoSaveDraft('doc:drafts:123', doc, 2000);
```

4. Use `useAuth` to access or clear authentication:

```tsx
const { user, logout } = useAuth();
```

Server endpoints
- The hooks post session logs to `/api/copilot/session-log` (best-effort using `navigator.sendBeacon`). Add a server route to accept these logs if you want persistent storage.
- The auto-save hook uses `api.post('/drafts', { key, value })`. Ensure your backend exposes `POST /api/v1/drafts` or adapt the hook's save URL.

Security & privacy
- The `useSessionTracker` may log user prompts. Add explicit user consent in UI before logging or set `SKIP_LOGGING=true` in env to disable.
- Add `logs/` to `.gitignore` if implementing server-side session logs.

Customizations
- Adjust `useAutoSaveDraft` to batch multiple drafts or change the API path.
- Extend `useSessionTracker` to include additional metadata like current route (`window.location.pathname`) or active file.

---

Generated: `samples/hooks/final-hook.md`
