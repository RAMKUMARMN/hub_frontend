---
name: frontend-agent-skills
description: Skills for the `hub_frontend` assistant: Next.js 14 page and component development, TypeScript type checking, Tailwind CSS styling, Zustand/TanStack Query state management, and safe frontend maintenance. The agent helps maintainers set up and manage the frontend application in the repository, with a strong emphasis on safety and human oversight for production-impacting changes.
---
# Frontend Agent — Skills Catalog

This document describes the skills, inputs/outputs, tools, safety constraints, and example prompts the `frontend-agent` (see `frontend-agent.agent.md`) supports for the `hub_frontend` repository.

**Purpose**
- Provide a compact, discoverable list of the agent's actionable capabilities so maintainers can quickly know what to ask and what to expect.

**Quick summary**
- **Primary domain:** Next.js 14 web application (App Router, React components, API integration, Tailwind CSS styling).
- **Primary outputs:** repository patches/diffs, GitHub Actions workflow files, CI job templates, README snippets, and PR-ready descriptions.
- **Primary safety posture:** Prepare and validate code changes; never autonomously deploy to production or modify live environments without explicit maintainer confirmation.

## Capabilities

- Generate or update GitHub Actions workflows to run `npm run lint`, `tsc --noEmit`, `npm run build`.
- Create new pages and components following existing patterns (shadcn/ui, Tailwind CSS, Zustand stores, TanStack Query hooks).
- Configure environment variables and API client setup (Axios instance with JWT interceptor).
- Produce repository patches via `apply_patch` (small, focused edits) and provide diffs for review before applying.
- Run static checks in CI: `next lint`, `tsc --noEmit`, optional bundle analysis.
- Draft PR descriptions, risk notes, and post-deployment verification checklists.
- Create a safe deployment workflow template guarded by typed confirmation.

## Inputs the agent expects (ask if missing)
- `component_name` -- the name of the component or page to create or modify.
- `api_endpoint` -- the backend API endpoint to integrate with.
- `package_manager` -- `npm` or `pnpm` (prefer `pnpm` if `pnpm-lock.yaml` is present).
- `secret_names` -- repo secret names for `NEXT_PUBLIC_API_URL`, `SLACK_WEBHOOK_URL`, etc.
- `notification` config -- repo secret name for `SLACK_WEBHOOK_URL` or `NOTIFICATION_EMAIL`.

## Outputs the agent produces
- New or modified workflow YAML files in `/.github/workflows/` (e.g., `frontend-ci.yml`).
- New TypeScript/React files (pages, components, hooks, stores) or patches to existing ones.
- README/docs snippets describing required secrets and how to run the application.
- PR-ready changelog/summary and verification checklist.
- Patches (diffs) applied with `apply_patch` when given explicit permission.

## Tools the agent uses
- `apply_patch` -- create or update repo files (used only after human confirmation for impactful changes).
- `read_file`, `file_search`, `grep_search` -- inspect repo layout and find components or config files.
- `manage_todo_list` -- track multi-step tasks and report progress back to the maintainer.
- `run_in_terminal` -- only if explicitly requested; otherwise the agent outputs commands for maintainers to run locally or in CI.

## Safety, boundaries, and policies

- Never request or accept raw secrets in chat messages. Instead, the agent asks for secret *names* (e.g., `NEXT_PUBLIC_API_URL`) and instructs maintainers to set them in GitHub Secrets.
- Never deploy to production without an explicit confirmation token (maintainer must provide this token before the agent takes any action that would deploy or modify production configurations).
- No automatic PR merging or repo-level approvals -- the agent drafts, explains, and optionally creates patches/PRs after explicit permission.

## Confirmation and escalation rules
- Low-risk edits (formatting, docs, styling changes): agent may apply patches after a single maintainer approval.
- Medium-risk edits (new components, page additions, store changes): require an explicit approval message before applying patches.
- High-risk edits (changes that modify authentication flow, API integration, or deployment configuration): require typed confirmation and a second acknowledgment.

## Example prompts (how to ask the agent)
- "Create a `frontend-ci.yml` workflow that runs `npm run lint`, `tsc --noEmit`, and `npm run build` on push and PR; post results to Slack via `SLACK_WEBHOOK_URL`."
- "Add a dark mode toggle to the sidebar using Zustand for state -- show me the patch before applying."
- "Create a new Notifications page with a list of recent notifications fetched from the API; follow existing component patterns."

## Typical workflows the agent supports

1. Discovery: scan repo for `src/app/*`, `src/components/*`, `src/lib/*`, and existing config files.
2. Draft: create a draft component or page with types, styles, and API integration.
3. Review: produce a PR description, risk summary, and required environment variables docs.
4. Apply (human-gated): upon confirmation, the agent can apply small patches or add CI steps.

## Error handling & troubleshooting behavior
- If `tsc --noEmit` or `npm run lint` fails, the agent returns a concise diagnostics summary and suggests fixes.
- If `npm run build` shows module resolution or compilation errors, the agent highlights them, explains likely causes, and recommends fixes.

## How progress is reported
- The agent uses `manage_todo_list` to break tasks into steps (discover -> draft -> patch -> verify) and will report the current step and completed steps in chat messages.

## Where to find the agent's configuration and prompts
- Agent behavior is documented in `/.github/agents/frontend-agent.agent.md` and the repository prompt lives at `/.github/prompts/frontend-prompt.prompt.md`.

## Maintenance notes
- Keep this skills file aligned with `frontend-agent.agent.md` and `frontend-prompt.prompt.md` -- update all three when adding new capabilities (for example, support for a new testing framework or a different state management library).
