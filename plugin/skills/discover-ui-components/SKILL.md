---
name: discover-ui-components
description: Analyze shared UI primitives, Tailwind styling, and Shadcn integrations.
---

# Discover UI Components

Map the reusable visual architecture of the frontend.

## Focus Areas
- Shared components (`src/components/`)
- Tailwind CSS global configurations (`app/globals.css`, `lib/utils.ts`)

## Goals
- Document the atomic UI pieces (Buttons, Modals, Cards).
- Understand styling utilities and thematic merging.

## Output
Return:
- Component library map

## Workflow
1. Route the hub folder agent to plugin/skills for this specific skill folder.
2. Invoke the `discoverComponents` tool to map atomic UI structures.
3. Return the component architecture map.
