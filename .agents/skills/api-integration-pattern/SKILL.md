---
name: api-integration-pattern
description: Set up TanStack React Query hooks, Zustand stores, and Axios configuration for API integration. Follow the project's data fetching and state management conventions.
metadata:
  model: models/gemini-3.1-pro-preview
  last_modified: Mon, 29 Jun 2026 00:00:00 GMT
---

# API Integration Patterns

## Contents
- [Axios Client](#axios-client)
- [TanStack Query Hooks](#tanstack-query-hooks)
- [Zustand Stores](#zustand-stores)
- [Cache Invalidation](#cache-invalidation)
- [Error Handling](#error-handling)
- [Verification](#verification)

## Axios Client (`src/lib/api.ts`)

The shared Axios instance is pre-configured with:
- Base URL from `NEXT_PUBLIC_API_URL` + `/api/v1`
- JWT auth interceptor (reads token from Zustand store)
- 401 handling with automatic token refresh
- JSON content type

```tsx
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token } = res.data;
          useAuthStore.getState().clearAuth();
          // Token refresh flow — update header and retry
          original.headers.Authorization = `Bearer ${access_token}`;
          return api(original);
        } catch {
          useAuthStore.getState().clearAuth();
          window.location.href = "/login";
        }
      } else {
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

## TanStack Query Hooks

Use TanStack Query v5 object syntax. Hooks are co-located with pages or in dedicated files:

```tsx
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Notification } from '@/types'

interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
}

export function useNotifications() {
  return useQuery<NotificationsResponse>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications')
      return data
    },
    refetchInterval: 30_000,
    staleTime: 10_000,
  })
}
```

### Mutation hooks

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await api.patch(`/notifications/${notificationId}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
```

## Zustand Stores

Place in `src/store/`. Use the existing pattern:

```tsx
// src/store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  accessToken: string | null
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        set({ user, accessToken });
      },
      clearAuth: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        set({ user: null, accessToken: null });
      },
    }),
    { name: "auth-storage", partialize: (s) => ({ user: s.user }) }
  )
)
```

## Cache Invalidation

| Strategy | When to use |
|---|---|
| `invalidateQueries` | After mutation success — refetch related data |
| `setQueryData` | Optimistic updates — update cache before server responds |
| `removeQueries` | When data is no longer needed |

## Error Handling

All query hooks expose error state automatically:

```tsx
const { data, isLoading, error } = useNotifications()

if (isLoading) return <p className="text-gray-400">Loading...</p>
if (error) return <p className="text-red-500">Error: {(error as Error).message}</p>
```

For mutations, handle errors in the component:

```tsx
const mutation = useMarkNotificationRead()

const handleClick = async (id: string) => {
  try {
    await mutation.mutateAsync(id)
  } catch (err) {
    console.error('Failed to mark notification as read')
  }
}
```

## Verification

1. Hook returns correct data shape with TypeScript types
2. Query refetches on the specified interval
3. Mutation invalidates related queries on success
4. Error state surfaces correctly in the component
5. Axios interceptor handles 401 by attempting token refresh, then redirecting to login
6. Store persists to localStorage (if `persist` middleware is used)
