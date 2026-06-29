---
name: frontend-ci-workflow
description: Create a GitHub Actions CI workflow for frontend linting, type checking, building, and testing with dependency caching and optional notifications.
metadata:
  model: models/gemini-3.1-pro-preview
  last_modified: Mon, 29 Jun 2026 00:00:00 GMT
---

# Frontend CI Workflow

## Contents
- [Workflow Layout](#workflow-layout)
- [Triggers](#triggers)
- [Jobs](#jobs)
- [Dependency Caching](#dependency-caching)
- [Next.js Build Cache](#nextjs-build-cache)
- [Notifications](#notifications)
- [Required Secrets](#required-secrets)

## Workflow Layout

```
.github/workflows/
└── frontend-ci.yml
```

## Triggers

```yaml
name: Frontend CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:
```

## Jobs

### Core jobs

| Job | Command | Purpose |
|---|---|---|
| `lint` | `npm run lint` | ESLint check |
| `typecheck` | `tsc --noEmit` | TypeScript type checking |
| `build` | `npm run build` | Next.js production build |
| `test` (optional) | `npm run test` | Unit/integration tests |

### Example workflow

```yaml
name: Frontend CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: tsc --noEmit

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Cache Next.js build
        uses: actions/cache@v4
        with:
          path: .next/cache
          key: next-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
          restore-keys: next-${{ runner.os }}-
      - run: npm ci
      - run: npm run build
```

## Dependency Caching

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'   # or 'pnpm' for pnpm
```

The `cache` parameter auto-caches `~/.npm`, `node_modules`, and `pnpm-lock.yaml` hash key.

## Next.js Build Cache

Next.js produces a `.next/cache` directory that can be cached across CI runs:

```yaml
- name: Cache Next.js build
  uses: actions/cache@v4
  with:
    path: .next/cache
    key: next-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
    restore-keys: next-${{ runner.os }}-
```

## Notifications

Post to Slack on failure:

```yaml
- name: Notify Slack
  if: failure()
  uses: rtCamp/action-slack-notify@v2
  env:
    SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK_URL }}
    SLACK_TITLE: 'Frontend CI Failed'
    SLACK_MESSAGE: '${{ github.repository }} — ${{ github.workflow }} on ${{ github.ref_name }}'
```

## Required Secrets

| Secret | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `SLACK_WEBHOOK_URL` | Slack webhook for failure notifications (optional) |
