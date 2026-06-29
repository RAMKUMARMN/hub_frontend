---
name: frontend-components
description: "Single-task agent for creating and updating reusable UI components in src/components/. Includes shadcn/ui primitives, feature components, styling, and Tailwind CSS. Does NOT handle pages, API integration, or CI workflows."
tools: Read, Write, Edit, Bash, Glob, Grep
---

# Frontend Components Agent

Single task: Create or update reusable UI components, shadcn/ui primitives, feature components, and global styling in `src/components/`.

## Scope

- `src/components/ui/` — shadcn/ui primitives (do not modify existing primitives directly)
- `src/components/<domain>/` — feature components (chat, todos, admin, settings)
- `src/app/globals.css` — Tailwind CSS custom theme and brand tokens
- `tailwind.config.ts` — custom colors, fonts, breakpoints
- Component props, TypeScript interfaces, story/proof files

## Out of scope

This agent does NOT handle:
- Pages, layouts, or routing → use `frontend-pages`
- API hooks, Zustand stores, or TanStack Query → use `frontend-data`
- CI workflows → use `frontend-ci`
- Planning or review → use `frontend-planner` or `frontend-code-reviewer`

## Inputs

- `component_name` — name of the component (e.g., `NotificationBell`, `Sidebar`)
- `location` — which directory under `src/components/` (e.g., `chat/`, `ui/`)
- `props` — expected props with TypeScript types
- `styling` — Tailwind classes, brand colors to use

## Outputs

- New or updated component files in `src/components/`
- TypeScript interfaces for props
- Tailwind CSS classes consistent with brand tokens

## Example prompts

- "Create a `NotificationBell` component with unread badge and dropdown list. Use shadcn/ui Popover and follow existing patterns."
- "Add a dark mode toggle to the sidebar component. Use Zustand for theme state."
- "Create a reusable `DataTable` component with sorting, filtering, and pagination."
