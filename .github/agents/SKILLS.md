---
name: frontend-agent-skills
description: Skills for the `hub_frontend` assistant: Next.js App Router pages, Tailwind CSS components, TanStack Query and Zustand data integration, GitHub Actions CI workflows, and accessible frontend patterns. The coordinator routes requests to single-task agents.
---

# Frontend Agent — Skills Catalog

This document describes the skills, inputs/outputs, tools, safety constraints, and example prompts the `frontend-agent` supports for the `hub_frontend` repository.

**Purpose**
- Provide a compact, discoverable list of the agent's actionable capabilities so maintainers can quickly know what to ask and what to expect.

**Quick summary**
- **Primary domain:** Next.js 14 App Router web application (React components, Tailwind CSS styling with custom `cixio-*` brand tokens, TanStack Query, Zustand, Axios).
- **Primary outputs:** repository patches/diffs, new pages and components, TanStack Query hooks, Zustand stores, CI workflow files, and PR-ready descriptions.
- **Primary safety posture:** Prepare and validate code changes; never autonomously deploy to production or modify live environments without explicit maintainer confirmation.

## Capabilities

### Pages (handled by `frontend-pages` agent)
- Create or update Next.js App Router pages in `src/app/`
- Existing routes: `(auth)/login/`, `(auth)/register/`, `chat/`, `chat/[sessionId]/`, `documents/`, `todos/`, `poll/`, `queues/`
- Server/client component split, metadata
- Page-level forms with React Hook Form and Zod
- Custom utility CSS classes (`btn-cixio`, `card-cixio`, `input-cixio`)

### Components (handled by `frontend-components` agent)
- Create or update reusable UI components in `src/components/`
- Currently only `NavBar.tsx` exists — new components to be created per domain
- Tailwind CSS styling with `cixio-*` brand tokens
- Component props, TypeScript interfaces, accessibility
- `cn()` utility from `@/lib/utils` for conditional class merging
- Note: shadcn/ui is NOT used — components are built with plain Tailwind CSS

### Data Integration (handled by `frontend-data` agent)
- TanStack React Query hooks (useQuery, useMutation)
- Zustand stores in `src/store/` with optional `persist` middleware
- Axios instance in `src/lib/api.ts` with JWT interceptor and token refresh
- TypeScript API types in `src/types/index.ts`

### CI/CD Workflows (handled by `frontend-ci` agent)
- Generate GitHub Actions workflows for lint, typecheck, build
- Dependency caching (npm) and Next.js build cache
- Docker multi-stage build workflow
- No CI workflows currently exist — agent creates them from scratch

### Infrastructure Skills (reusable guides in `.agents/skills/`)
- `nextjs-page-setup` — App Router page creation with actual route listings
- `shadcn-ui-component` — Reusable component patterns and brand tokens (no shadcn/ui)
- `api-integration-pattern` — TanStack Query hooks, Zustand stores, Axios
- `frontend-ci-workflow` — GitHub Actions CI/CD workflow template
- `react-form-setup` — React Hook Form with Zod validation schemas

## Inputs the agent expects (ask if missing)
- `route` — URL path for the page (e.g., `/settings`, `/chat`)
- `component_name` — name of the component to create or modify
- `endpoint` — API endpoint to integrate with (e.g., `GET /api/v1/notifications`)
- `package_manager` — `npm` or `pnpm` (prefer `npm` if `package-lock.json` is present)

## Outputs the agent produces
- New or modified page files in `src/app/<route>/`
- New or modified component files in `src/components/`
- TanStack Query hooks and Zustand stores in `src/store/`
- Workflow YAML files in `.github/workflows/`
- README / docs snippets describing required environment variables
- PR-ready changelog/summary and verification checklist
- Patches (diffs) applied with agent tools when given explicit permission

## Tools the agent uses
- Repository editing tools for making focused edits
- File search and read tools to inspect repo layout and find relevant files
- Progress tracking tools to manage multi-step tasks

## Safety, boundaries, and policies

- Never request or accept raw secrets in chat messages. Instead, ask for secret *names* (e.g., `NEXT_PUBLIC_API_URL`) and instruct maintainers to set them in GitHub Secrets.
- Never deploy to production without an explicit confirmation token.
- No automatic PR merging or repo-level approvals — draft and explain only.

## Confirmation and escalation rules
- Low-risk edits (formatting, docs, styling changes): apply patches after a single maintainer approval.
- Medium-risk edits (new components, page additions, store changes): require explicit approval before applying.
- High-risk edits (changes to authentication flow, API integration, or deployment configuration): require typed confirmation and a second acknowledgment.

## Example prompts (how to ask the agent)

### Pages
- "Create a Settings page at `src/app/settings/page.tsx` with a profile form."
- "Add a loading skeleton to the chat page at `src/app/chat/loading.tsx`."

### Components
- "Create a `NotificationBell` component with unread badge and dropdown list."
- "Add a dark mode toggle to the navbar using Zustand for state."

### Data Integration
- "Create a `useNotifications` TanStack Query hook that polls every 30 seconds."
- "Add a Zustand store for theme state with light/dark toggle."

### CI Workflows
- "Create a `frontend-ci.yml` workflow that runs lint, typecheck, build on push and PR."

## Agent Architecture

The coordinator (`frontend-agent`) routes to single-task agents:

| Agent | Responsibility |
|---|---|
| `frontend-pages` | Next.js App Router pages and layouts |
| `frontend-components` | Reusable UI components |
| `frontend-data` | API hooks, Zustand stores, Axios config |
| `frontend-ci` | GitHub Actions CI workflows |
| `frontend-code-reviewer` | Code review before merge |

## How progress is reported
- Each agent breaks tasks into steps and reports current/completed steps

## Where to find configuration
- Agent configs: `/.github/agents/*.agent.md`
- Prompts: `/.github/prompts/*.prompt.md`
- Skills: `/.agents/skills/*/SKILL.md`
- Hooks: `/.github/hooks/*.json`
- General guidelines: `/.github/copilot-instructions.md`

## Maintenance notes
- Keep `SKILLS.md` aligned with individual agent files and prompts
- When adding a new skill, create `/.agents/skills/<name>/SKILL.md` and update this catalog
- When adding a new single-task agent, create the agent file, prompt file, and register it in the coordinator's handoffs
