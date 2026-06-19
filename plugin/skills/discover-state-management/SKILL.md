---
name: discover-state-management
description: Analyze global state stores (Zustand/Redux) and session persistence.
---

# Discover State Management

Trace how client data is held in memory.

## Focus Areas
- Global state stores (`src/store/authStore.ts`)
- State hydration and persistence logic (e.g., Zustand persist)

## Goals
- Document the client-side memory architecture holding the Session.
- Map state actions (login, logout, updateProfile).

## Output
Return:
- State store architecture map

## Workflow
1. Route the hub folder agent to plugin/skills for this specific skill folder.
2. Invoke the native `discoverStateManagement` tool to map stores and slices.
3. Return the state action mappings.
