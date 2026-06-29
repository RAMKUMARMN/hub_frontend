---
mode: agent
agent: frontend-planner
name: frontend-planner-prompt
description: "Prompt for the frontend-planner agent. Generates structured implementation plans for new pages, components, data integration, or refactoring."
---

### Requirements

1. **Explore the codebase** to understand current file structure, existing components, and code patterns.
2. **Produce a numbered step-by-step plan** covering each file change required.
3. **Identify dependencies** between steps (e.g., create types before hooks, hooks before page).
4. **Risk assessment** — flag breaking changes, performance concerns, or accessibility regressions.
5. **Validation plan** — list `tsc --noEmit`, `npm run lint`, `npm run build` commands for each stage.

### Constraints

- Do not implement code — output the plan only
- Reference specific file paths relative to repo root
- Follow the existing conventions (server/client split, component patterns, state management choices)

### Output Format

```
## Implementation Plan: [Title]

### Step 1: [File path]
Action: create | modify | delete
Details: [what to add/change]

### Step 2: ...
...

### Risk Assessment
- [Critical/Medium/Low] risks identified
- [Specific items]

### Validation Checklist
- [ ] `tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
```

### Usage Template

```
Plan the implementation of [describe task]. 
Consider [constraints or special requirements].
```

### Chat Example

```
User: Plan the implementation of a notification system.
- Bell icon in the header (existing component)
- Dropdown list of recent notifications
- Unread count badge
- Poll every 30 seconds
- Mark as read on click
- Follow existing patterns (TanStack Query, Zustand, shadcn/ui)
```

Agent (expected):
- Explores src/components/, src/hooks/, src/app/ for existing patterns
- Produces a step-by-step plan listing files to create, modify, and the dependencies between them
- Does not write any code
