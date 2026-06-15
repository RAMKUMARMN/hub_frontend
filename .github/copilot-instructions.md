---
applyTo: "**/*.ts,**/*.tsx"
---
# Project coding standards for TypeScript and React

Apply the [general coding guidelines](./general-coding.instructions.md) to all code.

## TypeScript Guidelines
- Use TypeScript for all new code
- Follow functional programming principles where possible
- Use interfaces for data structures and type definitions
- Prefer immutable data (const, readonly)
- Use optional chaining (?.) and nullish coalescing (??) operators
- Use explicit return types for functions and components
- Avoid `any` — use `unknown` and narrow with type guards

## React Guidelines
- Use functional components with hooks
- Follow the React hooks rules (no conditional hooks)
- Keep components small and focused — extract reusable logic into custom hooks
- Use `src/components/ui/` for shadcn/ui primitives (do not modify directly)
- Place feature components in domain directories (`chat/`, `todos/`, `admin/`)
- Use Tailwind CSS with project brand tokens (cixio-blue, navy, dark, etc.)

## API & State Guidelines
- All API calls go through the shared Axios instance in `src/lib/api.ts`
- Use Zustand for client-side state and TanStack React Query for server state
- Forms use React Hook Form with Zod validation schemas
- Environment variables prefixed with `NEXT_PUBLIC_` — never hardcode secrets
