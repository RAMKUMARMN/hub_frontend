---
mode: agent
agent: frontend-ci
name: frontend-ci-prompt
description: "Prompt for the frontend-ci agent. Creates and updates GitHub Actions CI workflows for frontend linting, type checking, building, and testing."
---

### Requirements

1. **Workflow Triggers:** Push to `main`, pull requests, and `workflow_dispatch` with optional environment input.
2. **Jobs:** `lint` (`npm run lint`), `typecheck` (`tsc --noEmit`), `build` (`npm run build`). Optionally include `test` and `bundle-analysis`.
3. **Caching:** npm dependency caching and Next.js build cache (`.next/cache`).
4. **Node Version:** Use Node.js 20 (LTS). Support configurable version via input.
5. **Environment Variables:** Set `NEXT_PUBLIC_API_URL` and other public env vars from GitHub Secrets.
6. **Notifications:** Optional Slack notification on failure via `SLACK_WEBHOOK_URL`.

### Constraints

- GitHub Actions syntax — no third-party CI platforms
- Use `actions/setup-node@v4` for Node.js setup
- Use `actions/cache@v4` for dependency and build caching
- Secrets referenced as `${{ secrets.SECRET_NAME }}` — never hardcode values
- No CI workflows currently exist — create from scratch

### Success Criteria

- Workflow runs without syntax errors on push
- All three core jobs (lint, typecheck, build) pass
- Cache is restored and saved correctly
- Notifications fire on failure if configured

### Usage Template

```
Create/update a frontend CI workflow with:
- Package manager: [npm | pnpm]
- Node version: [version]
- Jobs: [lint, typecheck, build, test, bundle-analysis]
- [Optional] Slack notifications via [secret name]
Show the diff and wait for my confirmation before applying.
```

### Chat Example

```
User: Create a frontend-ci.yml workflow for lint, typecheck, build.
- Use npm
- Node 20
- Cache dependencies and Next.js build
- Slack notifications on failure via SLACK_WEBHOOK_URL
```

Agent (expected):
- Scans repo for existing workflows and package.json
- Drafts frontend-ci.yml with requested jobs and caching
- Shows the diff and waits for confirmation before applying
