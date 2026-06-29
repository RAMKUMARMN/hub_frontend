---
mode: agent
agent: frontend-pages
name: frontend-pages-prompt
description: "Prompt for the frontend-pages agent. Creates or updates Next.js App Router pages, layouts, loading states, error boundaries, and not-found states."
---

### Requirements

1. **Page Structure:** Use the App Router convention: `page.tsx` for the page, `layout.tsx` for shared layout, `loading.tsx` for loading UI, `error.tsx` for error boundaries.
2. **Server/Client Split:** Default to server components. Use `"use client"` only when necessary (hooks, event handlers, browser APIs).
3. **Metadata:** Export `metadata` or `generateMetadata` from page/layout files for SEO.
4. **Routing:** Follow existing route group conventions. Use `(auth)`, `(dashboard)` etc. for route organization.
5. **Forms:** Use React Hook Form with Zod validation schemas for form pages. Co-locate schemas with the page.

### Constraints

- Next.js 14 App Router — no Pages Router patterns
- TypeScript for all files
- Use the shared Axios instance from `src/lib/api.ts` for data fetching
- Use existing shadcn/ui primitives from `src/components/ui/` — do not modify them
- Styling via Tailwind CSS with brand tokens

### Success Criteria

- Page renders without errors in dev mode (`npm run dev`)
- All type checks pass (`tsc --noEmit`)
- Loading state displays during data fetch
- Error boundary catches and displays errors gracefully
- Page is responsive and accessible (keyboard nav, screen reader)

### Usage Template

```
Create a new page at `src/app/[route]/page.tsx` with:
- Route: [the URL path]
- Type: [server component | client component]
- Features: [what the page displays and what user can do]
- Data: [API endpoints to fetch, if any]
- [Optional] Loading state: [description of loading UI]
- [Optional] Error state: [description of error UI]
Show the diff and wait for my confirmation before applying.
```

### Chat Example

```
User: Create a Settings page at src/app/settings/page.tsx.
- Form fields: Display Name, Email, Notification Preferences (checkboxes)
- Use React Hook Form with Zod validation
- Fetch from GET /api/v1/users/me, submit to PUT /api/v1/users/me
- Use the shared Axios instance
```

Agent (expected):
- Creates page.tsx with form, loading.tsx with skeleton, error.tsx
- Shows the diff and waits for confirmation before applying
