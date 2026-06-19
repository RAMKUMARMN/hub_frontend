---
name: discover-ai-rendering
description: Map Markdown parsers, syntax highlighters, and AI response UI formatting.
---

# Discover AI Rendering

Analyze how buffered AI tokens are painted on the screen.

## Focus Areas
- Markdown rendering libraries (`react-markdown`)
- Code block syntax highlighters
- Math/LaTeX rendering components

## Goals
- Document how the raw AI text stream is styled and formatted for the user.

## Output
Return:
- AI Response formatting map

## Workflow
1. Route the hub folder agent to plugin/skills for this specific skill folder.
2. Invoke `discoverComponents` targeting AI response bubbles, and `findFeatureImplementation` for "markdown parsing".
3. Return the rendering architecture.
