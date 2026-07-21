---
applyTo: "**/*.ts,**/*.tsx"
---

# Project coding standards for TypeScript and React

## TypeScript Guidelines
- Use TypeScript for all new code
- Use interfaces for data structures and type definitions
- Prefer immutable data (const, readonly)
- Use optional chaining (?.) and nullish coalescing (??) operators
- Use explicit return types for functions and components
- Avoid `any` — use `unknown` and narrow with type guards

## React Guidelines
- Use functional components with hooks
- Follow the React hooks rules (no conditional hooks)
- Keep components small and focused — extract reusable logic into custom hooks
- Place feature components in domain directories (`chat/`, `todos/`)
- Use Tailwind CSS with project brand tokens (`cixio-blue`, `cixio-navy`, `cixio-dark`, `cixio-light`, `cixio-bg`, `cixio-hover`, `cixio-muted`)
- No shadcn/ui — use plain Tailwind CSS with utility classes (`btn-cixio`, `card-cixio`, `input-cixio`)
- Use `cn()` utility from `@/lib/utils` for conditional class merging

## API & State Guidelines
- All API calls go through the shared Axios instance in `src/lib/api.ts`
- Use Zustand for client-side state (stores in `src/store/`)
- Use TanStack React Query for server state
- Types are defined in `src/types/index.ts`
- Forms use React Hook Form with Zod validation schemas
- Environment variables prefixed with `NEXT_PUBLIC_` — never hardcode secrets

## Agent Guidelines

This repository uses the following agents:

| Agent | File | Purpose |
|---|---|---|
| `frontend-agent` | `.github/agents/frontend-agent.agent.md` | Coordinator — routes to single-task agents |
| `frontend-pages` | `.github/agents/frontend-pages.agent.md` | Next.js App Router pages and layouts |
| `frontend-components` | `.github/agents/frontend-components.agent.md` | Reusable UI components |
| `frontend-data` | `.github/agents/frontend-data.agent.md` | API hooks, Zustand stores, Axios config |
| `frontend-ci` | `.github/agents/frontend-ci.agent.md` | GitHub Actions CI/CD workflows |
| `frontend-code-reviewer` | `.github/agents/frontend-code-reviewer.agent.md` | Code review before merge |

Prompts are in `.github/prompts/` and skills in `.agents/skills/`.

When asking for help, prefix your request with the agent name:
- "@frontend-pages Create a Settings page at src/app/settings/page.tsx"
- "@frontend-components Create a NotificationBell component"
- "@frontend-data Create a useNotifications query hook"
