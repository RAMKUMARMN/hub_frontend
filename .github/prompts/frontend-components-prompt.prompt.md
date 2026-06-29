---
mode: agent
agent: frontend-components
name: frontend-components-prompt
description: "Prompt for the frontend-components agent. Creates or updates reusable UI components using shadcn/ui primitives, Tailwind CSS, and TypeScript."
---

### Requirements

1. **Component Structure:** Place feature components in domain directories (`chat/`, `todos/`, `admin/`, `settings/`). Use `src/components/ui/` for shadcn/ui primitives.
2. **Props Interface:** Export a TypeScript interface for all component props. Use `interface` not `type` for consistency.
3. **Styling:** Use Tailwind CSS with brand tokens (`cixio-blue`, `navy`, `dark`, `light`, `bg`, `hover`, `muted`). Avoid inline styles.
4. **Accessibility:** Semantic HTML, ARIA labels where needed, keyboard navigation support.
5. **State:** Use Zustand for shared client state. Use TanStack Query for server state. Do not use raw `useState` for cross-component state.

### Constraints

- TypeScript — all components must have typed props
- Do not modify existing shadcn/ui primitives in `src/components/ui/`
- Follow existing component patterns in the codebase for consistency
- Use `cn()` utility from `shadcn/ui` for conditional class merging

### Success Criteria

- Component renders without errors
- Props are properly typed with sensible defaults
- Component is accessible (keyboard navigable, screen reader friendly)
- Styling uses brand tokens correctly
- Works in both light and dark mode

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
- Uses shadcn/ui Popover
- Uses TanStack Query hook for fetching notifications
- Zustand store for unread count state
```

Agent (expected):
- Creates NotificationBell.tsx with props interface
- Uses cn() for class merging, brand tokens for colors
- Shows the diff and waits for confirmation before applying
