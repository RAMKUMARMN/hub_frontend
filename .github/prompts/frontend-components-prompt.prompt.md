---
mode: agent
agent: frontend-components
name: frontend-components-prompt
description: "Prompt for the frontend-components agent. Creates or updates reusable UI components using Tailwind CSS, TypeScript, and brand tokens."
---

### Requirements

1. **Component Structure:** Place feature components in domain directories (`chat/`, `todos/`, `settings/`). Currently only `NavBar.tsx` exists in `src/components/`.
2. **Props Interface:** Export a TypeScript interface for all component props. Use `interface` not `type` for consistency.
3. **Styling:** Use Tailwind CSS with brand tokens (`cixio-blue`, `cixio-navy`, `cixio-dark`, `cixio-light`, `cixio-bg`, `cixio-hover`, `cixio-muted`). Avoid inline styles.
4. **Accessibility:** Semantic HTML, ARIA labels where needed, keyboard navigation support.
5. **State:** Use Zustand for shared client state. Use TanStack Query for server state.

### Constraints

- TypeScript — all components must have typed props
- No shadcn/ui — the project does not use `@radix-ui/*` or shadcn primitives
- Follow existing component patterns (NavBar.tsx) for consistency
- Use `cn()` utility from `@/lib/utils` for conditional class merging
- Use existing utility classes (`btn-cixio`, `card-cixio`, `input-cixio`) where applicable

### Success Criteria

- Component renders without errors
- Props are properly typed with sensible defaults
- Component is accessible (keyboard navigable, screen reader friendly)
- Styling uses brand tokens correctly
- `tsc --noEmit` passes

### Usage Template

```
Create a [component name] component in [directory]:
- Props: [list with types]
- Features: [what the component renders and handles]
- Styling: [Tailwind classes and brand tokens]
- [Optional] State: [Zustand store or TanStack Query hook]
Show the diff and wait for my confirmation before applying.
```

### Chat Example

```
User: Create a NotificationBell component in src/components/chat/.
- Shows unread count badge on a bell icon
- Dropdown list of recent notifications on click
- Uses TanStack Query hook for fetching notifications
- Zustand store for unread count state
```

Agent (expected):
- Creates NotificationBell.tsx with props interface
- Uses cn() for class merging, brand tokens for colors
- Shows the diff and waits for confirmation before applying
