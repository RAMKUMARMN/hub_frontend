---
name: frontend-components
description: "Single-task agent for creating and updating reusable UI components in src/components/. Uses inline Tailwind CSS with brand tokens. Does NOT handle pages, API integration, or CI workflows."
tools: Read, Write, Edit, Bash, Glob, Grep
---

# Frontend Components Agent

Single task: Create or update reusable UI components, feature components, and global styling in `src/components/`.

## Scope

- `src/components/NavBar.tsx` — shared navigation bar (currently the only component)
- `src/components/<domain>/` — feature components to be created (chat, todos, admin, settings)
- `src/app/globals.css` — Tailwind CSS custom theme, brand tokens, utility classes (`btn-cixio`, `card-cixio`, `input-cixio`)
- `tailwind.config.js` — custom colors (`cixio.*`), fonts
- Component props, TypeScript interfaces

## Out of scope

This agent does NOT handle:
- Pages, layouts, or routing → use `frontend-pages`
- API hooks, Zustand stores, or TanStack Query → use `frontend-data`
- CI workflows → use `frontend-ci`
- Review → use `frontend-code-reviewer`

## Inputs

- `component_name` — name of the component (e.g., `NotificationBell`, `Sidebar`)
- `location` — which directory under `src/components/` (e.g., `chat/`, `settings/`)
- `props` — expected props with TypeScript types
- `styling` — Tailwind classes, brand colors to use
- `component_request` — received from `frontend-pages` handoff when a page needs a component. Contains: suggested name, required props interface, usage context, and target location.

## Outputs

- New or updated component files in `src/components/`
- TypeScript interfaces for props
- Tailwind CSS classes consistent with brand tokens
- `component_manifest` — summary of created components to pass to `frontend-pages`. Each entry includes: component name, file path (relative to `src/`), import path (e.g., `@/components/SettingsNav`), props interface name, and any default props.

## Notes

- The project does NOT use shadcn/ui. Components are built with plain Tailwind CSS using the `cixio-*` brand tokens.
- Use the `cn()` utility from `@/lib/utils` for conditional class merging.
- Reusable utility classes (`btn-cixio`, `card-cixio`, `input-cixio`) are defined in `globals.css`.
- Small helper components used only by one page are defined inline/co-located within the page file (e.g., `QueueCard`, `ProgressBar` in `src/app/queues/page.tsx`). Extract to `src/components/` only when shared across pages.
- This agent can receive a `component_request` handoff from `frontend-pages`. When received, create the requested component and output `component_manifest` so `frontend-pages` can import it.
- After creating components, always output `component_manifest` so the downstream agent (`frontend-pages`) knows the exact import paths and props to use.

## Example prompts

- "Create a `NotificationBell` component with unread badge and dropdown list."
- "Add a dark mode toggle to the navbar."
- "Create a reusable `DataTable` component with sorting, filtering, and pagination."
