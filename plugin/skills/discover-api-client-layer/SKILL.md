---
name: discover-api-client-layer
description: Trace HTTP clients, JWT interceptors, and synchronous API communication.
---

# Discover API Client Layer

Analyze how the frontend communicates with the FastAPI backend.

## Focus Areas
- Axios instances or Fetch wrappers (`lib/api.ts`)
- JWT Token injection (Request Interceptors)
- Refresh token rotation logic

## Goals
- Map exactly how auth headers are attached.
- Document error handling for 401/403 responses.

## Output
Return:
- Network interceptor flow
- API service registry map

## Workflow
1. Route the hub folder agent to plugin/skills for this specific skill folder.
2. Invoke the `discoverApiLayer` tool to trace the HTTP client configuration.
3. Invoke the `discoverApiDependencies` tool to map endpoint registries.
4. Return the synchronous communication map.
