---
name: discover-frontend-architecture
description: Map high-level repository structure, monorepo boundaries, and global configurations.
---

# Discover Frontend Architecture

Analyze the foundational blueprint of the frontend repository.

## Focus Areas
- App directory structures (Next.js `src/app/`)
- Global configuration files (`tailwind.config.ts`, `next.config.js`, `tsconfig.json`)
- Environment variable schemas (`.env.example`)

## Goals
- Establish the baseline framework versions and build tools.
- Identify entry points for Web vs. Mobile codebases.

## Output
Return:
- High-level directory tree map
- Global configuration summary

## Workflow
1. Route the hub folder agent to plugin/skills for this specific skill folder.
2. Invoke the native `discoverFrontendArchitecture` tool to map the root structures.
3. Invoke the `discoverEnvironmentConfig` tool to parse environment rules.
4. Return the architectural blueprint.
