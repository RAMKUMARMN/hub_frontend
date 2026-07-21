# Main Frontend Skill — Hub Frontend (Project-specific Prompting)

Purpose
- Centralized skill to help craft high-quality prompts for working on the frontend of this repository.
- Use this as the primary prompt-engineering reference when asking the assistant to implement, refactor, review, or document frontend work.

**Repository snapshot (for prompts)**
- Framework: Next.js (app router), TypeScript, Tailwind CSS.
- Key paths and entry points:
  - [src/app](src/app) — routes and pages (app router)
  - [src/components/NavBar.tsx](src/components/NavBar.tsx) — main navigation
  - [src/app/layout.tsx](src/app/layout.tsx) and [src/app/globals.css](src/app/globals.css) — global layout and styles
  - [src/lib/api.ts](src/lib/api.ts) — API helpers
  - [src/lib/utils.ts](src/lib/utils.ts) — shared utilities
  - [src/store/authStore.ts](src/store/authStore.ts) — auth/store patterns
  - [src/types/index.ts](src/types/index.ts) — shared TypeScript interfaces
  - Auth routes: [src/app/(auth)/login/page.tsx](src/app/(auth)/login/page.tsx), [src/app/(auth)/register/page.tsx](src/app/(auth)/register/page.tsx)
  - Feature pages: [src/app/documents/page.tsx](src/app/documents/page.tsx), [src/app/todos/page.tsx](src/app/todos/page.tsx), [src/app/queues/page.tsx](src/app/queues/page.tsx), [src/app/chat/page.tsx](src/app/chat/page.tsx)

**How to use this skill**
- Start with a System persona that includes these constraints: Next.js app-router, TypeScript, Tailwind, file paths above, and a requirement for minimal, testable diffs.
- Ask for a short plan (3–6 steps) before implementation.
- Request changes as unified diffs/patches and small incremental PR-style updates.
- Require TypeScript types in `src/types/index.ts` for any shared shape, and minimal tests for logic changes when feasible.

**System persona (example)**
You are an expert frontend engineer and pair programmer familiar with Next.js (app router), TypeScript, Tailwind, and this repo layout. Provide concise file patches, add or modify only necessary files, include TypeScript types in [src/types/index.ts](src/types/index.ts) when appropriate, and keep edits minimal and testable.

**Common prompt templates**
- Scaffold feature (example):
  - User: "Plan and implement a `/documents` feature with listing and upload. Use server components for initial data, add a client upload component, add types to [src/types/index.ts](src/types/index.ts), and update [src/components/NavBar.tsx](src/components/NavBar.tsx) to link the page. Return a plan, then patches."

- Create component (example):
  - User: "Create `DocumentCard` in [src/components](src/components) with typed props, Tailwind styling, and a simple usage example in an existing page. Return only patches."

- Refactor (example):
  - User: "Extract helpers from [src/store/authStore.ts](src/store/authStore.ts) into [src/lib/session.ts](src/lib/session.ts), add types, update imports, and provide a migration note."

- Bugfix & tests (example):
  - User: "Investigate failing behavior in [src/app/chat/[sessionId]/page.tsx](src/app/chat/[sessionId]/page.tsx). Propose a fix, provide patches, and add a unit/integration test for the core logic."

**Prompt constraints & guidelines (project-specific)**
- Pages vs components: explicitly state server vs client. Prefer server components for initial data loads and server fetches, client components for interactive UI (search, uploads, websockets).
- Data fetching: use server fetch or the helpers in [src/lib/api.ts](src/lib/api.ts) for SSR/server data. For cached client interactivity, suggest SWR/React Query only if added as a dependency.
- Types: share interfaces and DTOs in [src/types/index.ts](src/types/index.ts). Keep API response shapes typed.
- Styling: use Tailwind classes and variables from `tailwind.config.js`.
- State: prefer `src/store` for cross-page state; keep ephemeral UI state local to components.
- Accessibility: require ARIA where applicable and keyboard support for interactive widgets.

**Quality checklist to request from the assistant**
- Provide a 3–6 step plan before coding.
- Return unified diffs/patches for changed files only.
- Include TypeScript types for new shared shapes.
- Add minimal tests for logic/new code where feasible.
- Verify accessibility basics and performance considerations for large lists.

**Iterative prompt pattern (recommended)**
- Round 1 — Plan: "Provide an implementation plan and list files to change."
- Round 2 — Implement: "Apply step 1 and return patches only (unified diffs)."
- Round 3 — Review: "Run the quality checklist on the implemented changes and add tests/fixes."

**Helpful quick snippets (copy-paste)**
- Plan request: "Provide a 3–6 step plan to implement X and list the files to change in this repo." 
- Patch request: "Apply step 1: return unified diffs for the files listed. Keep changes minimal and include types/tests."
- Review request: "Run the quality checklist and list remaining [ASK USER] items."

**Examples adapted to this repo**
- "Create `/todos` improvements: add server-side pagination in [src/app/todos/page.tsx](src/app/todos/page.tsx), add `TodoItem` component to [src/components], and type the API in [src/types/index.ts](src/types/index.ts). Provide plan and patches."

---

Generated by assistant: `samples/skills/frontend-main-skill.md`
