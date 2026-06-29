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
- Base URL from `NEXT_PUBLIC_API_URL`
- JWT auth interceptor (reads token from localStorage)
- 401 handling (redirect to login)
- JSON content type

```tsx
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

## TanStack Query Hooks

Place in `src/hooks/queries/`. Use TanStack Query v5 object syntax:

```tsx
// src/hooks/queries/useNotifications.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Notification } from '@/lib/types'

interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
}

export function useNotifications() {
  return useQuery<NotificationsResponse>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/notifications')
      return data
    },
    refetchInterval: 30_000, // poll every 30 seconds
    staleTime: 10_000,
  })
}
```

### Mutation hooks

```tsx
// src/hooks/queries/useMarkNotificationRead.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await api.patch(`/api/v1/notifications/${notificationId}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
```

## Zustand Stores

Place in `src/hooks/stores/`. Use the existing pattern:

```tsx
// src/hooks/stores/useThemeStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-storage' }
  )
)
```

## Cache Invalidation

| Strategy | When to use |
|---|---|
| `invalidateQueries` | After mutation success — refetch related data |
| `setQueryData` | Optimistic updates — update cache before server responds |
| `removeQueries` | When data is no longer needed (e.g., navigation away) |

## Error Handling

All query hooks expose error state automatically:

```tsx
const { data, isLoading, error } = useNotifications()

if (isLoading) return <Skeleton />
if (error) return <ErrorMessage message={(error as Error).message} />
```

For mutations, handle errors in the component:

```tsx
const mutation = useMarkNotificationRead()

const handleClick = async (id: string) => {
  try {
    await mutation.mutateAsync(id)
  } catch (err) {
    toast.error('Failed to mark notification as read')
  }
}
```

## Verification

1. Hook returns correct data shape with TypeScript types
2. Query refetches on the specified interval
3. Mutation invalidates related queries on success
4. Error state surfaces correctly in the component
5. Axios interceptor handles 401 by redirecting to login
6. Store persists to localStorage (if `persist` middleware is used)
