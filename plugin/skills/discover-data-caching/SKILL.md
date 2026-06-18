---
name: discover-data-caching
description: Trace server-state caching layers like React Query or SWR.
---

# Discover Data Caching

Analyze how the frontend caches server responses to prevent over-fetching.

## Focus Areas
- React Query hooks (`useQuery`, `useMutation`) or SWR
- Cache invalidation triggers (e.g., invalidating document lists after upload)

## Goals
- Map how lists (Todos, Documents) are fetched and cached.
- Document pagination and infinite scrolling state.

## Output
Return:
- Query caching map and invalidation rules

## Workflow
1. Route the hub folder agent to plugin/skills for this specific skill folder.
2. Invoke `discoverStateManagement` and `findFeatureImplementation` targeting "React Query", "SWR", or "caching".
3. Return the caching architecture.
