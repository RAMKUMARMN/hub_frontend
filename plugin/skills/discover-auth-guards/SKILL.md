---
name: discover-auth-guards
description: Trace client-side route protection, middleware, and UI-level RBAC.
---

# Discover Auth Guards

Analyze how the application prevents unauthenticated access.

## Focus Areas
- Next.js Middleware (`middleware.ts`)
- Protected layout components
- UI-level Role-Based Access Control (hiding admin buttons)

## Goals
- Verify the UX flow for unauthenticated users.
- Document how specific components check user roles.

## Output
Return:
- Route protection matrix
- UI RBAC logic map

## Workflow
1. Route the hub folder agent to plugin/skills for this specific skill folder.
2. Invoke `findFeature` and `findFeatureImplementation` specifically targeting "auth guards", "middleware", or "protected routes".
3. Return the route protection flow.
