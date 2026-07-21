# Frontend Skill — Hub Frontend (Next.js + TypeScript + Tailwind)

Purpose
- A single reference skill that standardizes prompt engineering for building, extending, and reviewing the frontend in this repository.
- Use these prompts and templates when asking an assistant to scaffold features, implement pages/components, or perform reviews.

Project context (use when prompting)
- Stack: Next.js (app router), TypeScript, Tailwind CSS, PostCSS.
- Source root: `src/app` with routes for `chat`, `documents`, `poll`, `queues`, `todos`, auth pages under `(auth)`.
- Components folder: `src/components`; libs: `src/lib`; store: `src/store`; types in `src/types`.

How to use this skill
- Start with a System persona (assistant role) then give the User prompt from templates below.
- Include constraints: file paths, repository patterns, TypeScript, testing requirement, and Tailwind tokens.
- Use iterative mode: ask for a plan first, then request code in small patches, and finally run the review checklist.

Prompts — general templates

- System (role) template:

  You are an expert frontend engineer and pair-programmer familiar with Next.js (app router), TypeScript, Tailwind CSS, and the repository layout. Provide concise code edits as unified diffs or file patches, explain reasoning briefly, and follow the project's existing patterns.

- User: Feature scaffolding (example):

  "Plan and implement a new page at /products that lists items from a `/api/products` endpoint. Use server components where appropriate, create a client-side search input that filters results, add type definitions, and update navigation. Keep styles consistent with Tailwind in `globals.css` and the existing `NavBar` component. Return a patch with new and modified files only."

- User: Component implementation (example):

  "Create a reusable `ProductCard` component in `src/components` using TypeScript props, Tailwind for styling, and unit-test examples. Show the component file and a usage example in `/products/page.tsx`."

- User: Small focused refactor:

  "Refactor `src/store/authStore.ts` to improve type-safety and separate session logic into `src/lib/session.ts`. Provide patches and explain migration steps." 

Task-specific prompt snippets
- Pages & routing: specify whether to use server or client components; include data-fetch strategy (fetch vs. SWR/React Query) and caching policy.
- Styling: request Tailwind utility classes; include design constraints (spacing scale, color tokens from `tailwind.config.js`).
- State: prefer centralized store in `src/store` for auth and cross-page state; recommend local state for ephemeral UI.
- API integration: include types for responses in `src/types` and centralized API helpers in `src/lib/api.ts`.
- Auth flows: reference `(auth)/login/page.tsx` and `(auth)/register/page.tsx` for consistency.

Prompt patterns for quality & safety
- Ask for a short plan first (3–6 steps) before code.
- Request diffs or patches only — avoid full-file rewrites unless necessary.
- Require TypeScript types and minimal tests for new logic.
- Ask for accessibility checks (keyboard nav, ARIA roles) and performance considerations for large lists (pagination or virtualization).

Examples — starting prompts
- "Plan a `/documents` feature to add document upload, preview, and listing. Provide a plan, file patches, and tests for upload validation."
- "Improve `NavBar.tsx` to show user status from `authStore` and add a responsive mobile menu. Provide patches and update CSS if needed."

Review checklist (ask assistant to run after changes)
- Functional: feature works end-to-end with provided types and API contracts.
- Code style: TypeScript types, consistent Tailwind usage, no unused imports.
- Tests: unit tests for logic and simple component tests where applicable.
- Accessibility: semantic tags, ARIA where necessary, keyboard focus states.
- Performance: avoid unnecessary client bundles; server components preferred for data-heavy pages.

Prompt templates — iterate & refine
- Round 1 (Plan): "Provide a short implementation plan (3–6 steps) for X. Mention affected files and risks."
- Round 2 (Implement): "Apply step 1: give a patch for the files listed. Keep changes minimal and compile-ready."
- Round 3 (Review & Tests): "Run the review checklist on the implemented changes. Add tests and small fixes." 

Assistant persona hints
- Be concise; present only files/patches unless asked for a longer explanation.
- When returning patches, include file paths relative to project root.
- If asked to generate large features, recommend a multi-PR approach and show split-by-commit suggestions.

Repository-aware constraints to include in prompts
- Use path `src/app` for new pages, `src/components` for shared UI, `src/lib` for helpers, and `src/store` for global state.
- Keep API helpers in `src/lib/api.ts` and types in `src/types/index.ts`.
- Align styles with `tailwind.config.js` tokens and `globals.css`.

Maintenance & collaboration
- Provide a suggested PR description and checklist when creating sizable changes.
- Offer commit message templates, e.g., `feat(frontend): add products page with server-side fetch`.

Start prompt examples (copy-paste-ready)
- "You are an expert frontend engineer. Plan a feature to add a `/products` page that lists items from `/api/products`, include types, and show a minimal UI. Provide a 4-step plan and list of files to change."
- "You are an expert frontend engineer. Implement step 1 from the above plan and return patches only."
