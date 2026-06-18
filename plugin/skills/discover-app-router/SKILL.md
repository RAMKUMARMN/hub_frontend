---
name: discover-app-router
description: Map the Next.js App Router directory, layout nesting, dynamic routes, and route groups.
---

# Discover App Router Paths

Analyze the Next.js `src/app/` directory to map client-side navigation.

## Focus Areas
- Root layouts and providers (`app/layout.tsx`, `app/providers.tsx`)
- Route groups (e.g., `(auth)/login`)
- Dynamic route segments (e.g., `chat/[sessionId]`)

## Goals
- Map the complete user journey and navigation tree.
- Identify where global contexts are injected.

## Output
Return:
- Client-side routing map
- Layout injection hierarchy

## Workflow
1. Route the hub folder agent to plugin/skills for this specific skill folder.
2. Invoke the native `discoverPages` tool to map the view matrix and routing structure.
3. Return the compiled routing map.
