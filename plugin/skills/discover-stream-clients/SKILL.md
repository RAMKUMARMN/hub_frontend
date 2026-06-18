---
name: discover-stream-clients
description: Map WebSocket listeners and Server-Sent Events (SSE) AI stream consumers.
---

# Discover Stream Clients

Analyze ingestion of live AI tokens and real-time chat updates.

## Focus Areas
- WebSocket client instantiation
- SSE chunk consumers (`EventSource` or stream reading loops)

## Goals
- Trace how the frontend connects to Chat Service pools.
- Document how raw AI text chunks are buffered into state.

## Output
Return:
- WebSocket/SSE streaming lifecycle map

## Workflow
1. Route the hub folder agent to plugin/skills for this specific skill folder.
2. Invoke `findFeatureImplementation` and `discoverServices` targeting "WebSocket", "SSE", or "Server-Sent Events".
3. Return the real-time communication architecture.
