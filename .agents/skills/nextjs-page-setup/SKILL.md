---
name: nextjs-page-setup
description: Create a new Next.js App Router page with routes, layouts, loading states, error boundaries, and metadata. Follow the project's conventions for server/client split and data fetching.
metadata:
  model: models/gemini-3.1-pro-preview
  last_modified: Mon, 29 Jun 2026 00:00:00 GMT
---

# Next.js App Router Page Setup

## Contents
- [File Structure](#file-structure)
- [Server vs Client Components](#server-vs-client-components)
- [Layout Patterns](#layout-patterns)
- [Loading & Error States](#loading--error-states)
- [Metadata & SEO](#metadata--seo)
- [Verification](#verification)

## File Structure

```
src/app/
├── layout.tsx                  # Root layout (html, body, fonts)
├── page.tsx                    # Home page
├── loading.tsx                 # Root loading state
├── error.tsx                   # Root error boundary
├── (auth)/                     # Route group — no path segment
│   ├── login/
│   │   ├── page.tsx
│   │   └── login-form.tsx      # Client component
│   └── register/
│       └── page.tsx
├── (dashboard)/
│   ├── layout.tsx              # Dashboard layout with sidebar
│   ├── page.tsx                # Dashboard home
│   ├── settings/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   └── admin/
│       └── page.tsx
└── api/                        # API routes (if needed)
    └── ...
```

## Server vs Client Components

| Criteria | Server Component | Client Component |
|---|---|---|
| Data fetching | Direct `async` component, fetch | TanStack Query in `useEffect` |
| Interactivity | None | useState, event handlers |
| Hooks | None | All React hooks |
| Browser APIs | None | localStorage, window, etc. |
| `"use client"` | Not needed | Required at top of file |

Default to server components. Move to client only when interactivity is needed. Keep client components as leaf nodes in the tree.

## Layout Patterns

### Root layout (`src/app/layout.tsx`)

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hub Frontend',
  description: 'Hub frontend application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

### Nested layout (`src/app/(dashboard)/layout.tsx`)

```tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
```

## Loading & Error States

### Loading (`loading.tsx`)

```tsx
export default function SettingsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-64 bg-muted rounded" />
    </div>
  )
}
```

### Error (`error.tsx`)

```tsx
'use client'

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

## Metadata & SEO

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account settings and preferences',
}
```

For dynamic metadata, use `generateMetadata`:

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await fetchUser(params.id)
  return { title: `${user.name} — Settings` }
}
```

## Verification

1. `npm run dev` — page renders without errors in development
2. `tsc --noEmit` — TypeScript types are correct
3. `npm run build` — production build succeeds
4. Navigate to the route in the browser
5. Test loading state with slow network (DevTools → Network → Slow 3G)
6. Test error state with incorrect data
