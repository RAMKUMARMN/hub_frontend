---
name: discover-flutter-mobile
description: Map Dart file structures, mobile routing, and cross-platform state.
---

# Discover Flutter Mobile

Analyze the mobile application codebase for feature parity.

## Focus Areas
- Dart `lib/` directory and screen layouts
- Mobile state management (Riverpod/Bloc)
- Mobile HTTP/WebSocket client wrappers

## Goals
- Cross-reference mobile implementations against the Next.js web app.

## Output
Return:
- Flutter mobile architecture map

## Workflow
1. Route the hub folder agent to plugin/skills for this specific skill folder.
2. Invoke `findFeature` targeting "Flutter mobile" and `discoverFrontendArchitecture` to locate the Dart directories.
3. Return the mobile architecture mapping.
