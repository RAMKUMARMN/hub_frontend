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
├── layout.tsx                  # Root layout (html, body, Providers, NavBar)
├── page.tsx                    # Home page (redirect → /chat)
├── globals.css                 # Tailwind imports, brand CSS vars, utility classes
├── providers.tsx               # TanStack QueryClientProvider
├── (auth)/                     # Route group — no path segment
│   ├── login/
│   │   └── page.tsx            # Login form (inline — no separate component)
│   └── register/
│       └── page.tsx            # Registration form (inline)
├── chat/
│   ├── page.tsx                # Chat index (redirect to latest session)
│   └── [sessionId]/
│       └── page.tsx            # Chat session with SSE streaming
├── documents/
│   └── page.tsx                # Document upload and management
├── todos/
│   └── page.tsx                # Todo list with CRUD
├── poll/
│   └── page.tsx                # Internship pulse check poll
└── queues/
    └── page.tsx                # Queue monitoring dashboard
```

## Server vs Client Components

| Criteria | Server Component | Client Component |
|---|---|---|
| Data fetching | Direct `async` component, fetch | TanStack Query |
| Interactivity | None | useState, event handlers |
| Hooks | None | All React hooks |
| Browser APIs | None | localStorage, window, etc. |
| `"use client"` | Not needed | Required at top of file |

Default to server components. Move to client only when interactivity is needed.

## Layout Patterns

### Root layout (`src/app/layout.tsx`)

```tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "CixioHub — AI Platform for TKM",
  description: "AI-powered chat platform for TKM students",
  icons: { icon: "/cixio-icon.svg", apple: "/cixio-icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cixio-bg">
        <Providers>
          <NavBar />
          <div className="pt-14">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
```

### Providers (`src/app/providers.tsx`)

```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

## Loading & Error States

### Loading (`loading.tsx`)

```tsx
export default function PageLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )
}
```

### Error (`error.tsx`)

```tsx
'use client'

export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-gray-500">{error.message}</p>
      <button onClick={() => reset()} className="btn-cixio">Try again</button>
    </div>
  )
}
```

## Metadata & SEO

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
}
```

## Brand Tokens

Use these Tailwind CSS brand tokens for all styling:

| Token | CSS Variable | Usage |
|---|---|---|
| `cixio-blue` | `--cixio-blue` | Primary actions, links, active states |
| `cixio-navy` | `--cixio-navy` | Headers, navigation, secondary elements |
| `cixio-dark` | `--cixio-dark` | Text, icons on light backgrounds |
| `cixio-light` | `--cixio-light` | Backgrounds, cards |
| `cixio-bg` | `--cixio-bg` | Page background |
| `cixio-hover` | `--cixio-hover` | Hover state backgrounds |
| `cixio-muted` | `--cixio-muted` | Secondary text, disabled states, borders |

Utility classes available in `globals.css`: `btn-cixio`, `card-cixio`, `input-cixio`.

## Verification

1. `npm run dev` — page renders without errors in development
2. `tsc --noEmit` — TypeScript types are correct
3. `npm run build` — production build succeeds
4. Navigate to the route in the browser
