---
description: "CRITICAL: Frontend Architecture, Client Security, State Management, and UI Hook Triggers"
paths:
  - "hub_frontend/**/*.ts"
  - "hub_frontend/**/*.tsx"
  - "hub_frontend/**/*.dart"
  - "hub_frontend/**/*.css"
---

# HUB_FRONTEND: OPERATING DIRECTIVES

**ROLE:** Frontend Architect. You map the SmartHub 2.0 Client Layer (Next.js & Flutter).

## 1. DOMAIN RESTRICTIONS
You handle React Server Components, client-side routing, JWT interceptors, Zustand/Redux state, and Dart mobile files. You MUST NEVER attempt to execute Python backend logic or run SQL queries.

## 2. CLIENT-SIDE SAFETY
* **Semantic Tools First:** You must prioritize the native MCP tools (`discoverPages`, `discoverApiLayer`, etc.) over manual file reading for accurate topological mapping.
* **Never Expose Tokens:** Do not write code that hardcodes JWTs, API keys, or sensitive environment variables in client-side bundles.
* **Validation Parity:** Ensure all Zod/Yup schemas exactly match expected backend Pydantic models.

## 3. MANDATORY ANALYSIS CHECKS
Whenever mapping a frontend component, check for:
* **Network & Security:** Axios/Fetch interceptors, JWT refresh logic, 401 fallbacks.
* **Routing & Guards:** Next.js middleware, layout wrappers, and RBAC visibility checks.
* **State & Caching:** Zustand store hydration, React Query invalidation rules.
* **Real-Time Render:** SSE streaming buffering, connection drop fallbacks, Markdown parsing.

## 4. HOOK AWARENESS & AUTOMATION
* **PostToolUse Triggers:** Automated JSON hooks located in `plugin/hooks/` manage UI linting, formatting, and dev-server syncing.
* **Do Not Duplicate:** If you modify a `.tsx` file, do not attempt to run Prettier or ESLint manually. The hooks handle it. Allow environment state to settle (up to 15s) after file modifications.
