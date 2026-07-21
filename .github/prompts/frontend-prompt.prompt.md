---
mode: agent
agent: frontend-agent
name: frontend-agent-prompt
description: "Coordinator prompt for the hub_frontend repository. Routes requests to the appropriate single-task agent based on the task domain."
---

This coordinator does NOT implement tasks directly. It identifies the task type and hands off:

| Task type | Agent | Prompt file |
|---|---|---|
| Create/update a page or layout in `src/app/` | `frontend-pages` | `frontend-pages-prompt.prompt.md` |
| Create/update a UI component in `src/components/` | `frontend-components` | `frontend-components-prompt.prompt.md` |
| Set up API calls, TanStack Query hooks, or Zustand stores | `frontend-data` | `frontend-data-prompt.prompt.md` |
| Create/update CI workflows | `frontend-ci` | `frontend-ci-prompt.prompt.md` |
| Review code before merge | `frontend-code-reviewer` | `frontend-code-reviewer-prompt.prompt.md` |

If the request spans multiple domains, ask the user to break it into single-task prompts.
