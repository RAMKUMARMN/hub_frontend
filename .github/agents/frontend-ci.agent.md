---
name: frontend-ci
description: "Single-task agent for creating and updating GitHub Actions CI workflows for frontend linting, type checking, building, and testing. Does NOT handle pages, components, or API integration."
---

# Frontend CI Agent

Single task: Create or update GitHub Actions workflow files in `.github/workflows/` for frontend CI/CD.

## Scope

- `.github/workflows/frontend-ci.yml` — lint, typecheck, build, test pipeline
- `.github/workflows/deploy.yml` — preview/production deployment
- Dependency caching (npm, pnpm, Next.js build cache)
- Environment variable and secrets configuration
- Docker multi-stage build workflow

## Out of scope

This agent does NOT handle:
- Page components → use `frontend-pages`
- UI components → use `frontend-components`
- API integration or state → use `frontend-data`
- Planning or review → use `frontend-planner` or `frontend-code-reviewer`

## Inputs

- `package_manager` — `npm` or `pnpm`
- `node_version` — Node.js version (default `20`)
- `extra_jobs` — optional jobs like bundle analysis, a11y audit
- `deploy_target` — platform for deployment (Vercel, Docker)

## Outputs

- New or updated `.github/workflows/*.yml` files
- README snippet listing required GitHub Secrets
- PR-ready summary with a verification checklist

## Example prompts

- "Create a `frontend-ci.yml` workflow that runs lint, typecheck, and build on push and PR. Use pnpm and Node 20."
- "Add a bundle analysis job to the existing frontend CI workflow."
- "Create a Docker multi-stage build workflow for production deployment."
