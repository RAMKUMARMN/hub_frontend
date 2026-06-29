---
mode: agent
agent: frontend-data
name: frontend-data-prompt
description: "Prompt for the frontend-data agent. Configures API client, creates TanStack Query hooks, and sets up Zustand stores for state management."
---

### Requirements

1. **Axios Client:** All API calls go through the shared Axios instance in `src/lib/api.ts`. It has a JWT auth interceptor — add request/response interceptors as needed.
2. **React Query Hooks:** Place query hooks in `src/hooks/queries/`. Export named hooks like `useNotifications`, `useUsers`, `useCreateTodo`. Follow TanStack Query v5 patterns (object syntax).
3. **Zustand Stores:** Place stores in `src/hooks/stores/`. Use the existing pattern with `create()` and optional `persist` middleware. Keep stores flat and focused.
4. **TypeScript Interfaces:** Define API response types in `src/lib/types/` or co-locate with the hook file. Use `interface` for object types.

### Constraints

- All API calls use the Axios instance — never raw `fetch`
- Sensitive data (auth tokens, user secrets) must not appear in query keys or logs
- Use `staleTime` and `gcTime` (formerly `cacheTime`) for cache control
- For mutations, provide `onSuccess`/`onError` callbacks that integrate with existing toast/notification patterns

### Success Criteria

- Query hook returns correct data with proper TypeScript types
- Mutations invalidate related queries on success
- Zustand store updates trigger re-renders in subscribed components
- Loading and error states are exposed by the hook
- Axios interceptor handles 401 by redirecting to login

### Usage Template

```
Create a [query | mutation | store] for [domain]:
- Endpoint: [HTTP method + URL]
- Response type: [TypeScript interface]
- [Optional] Polling interval: [seconds]
- [Optional] Store state: [shape of the store]
- [Optional] Cache invalidation: [queries to refetch on mutation success]
Show the diff and wait for my confirmation before applying.
```

### Chat Example

```
User: Create a useNotifications query hook.
- Fetches from GET /api/v1/notifications
- Returns: { notifications: Notification[], unreadCount: number }
- Polls every 30 seconds
- TypeScript interface for Notification
```

Agent (expected):
- Creates hooks/queries/useNotifications.ts with typed return
- Creates the Notification interface
- Shows the diff and waits for confirmation before applying
