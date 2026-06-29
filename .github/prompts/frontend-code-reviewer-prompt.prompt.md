---
mode: agent
agent: frontend-code-reviewer
name: frontend-code-reviewer-prompt
description: "Prompt for the frontend-code-reviewer agent. Reviews pages, components, API hooks, and stores for correctness, performance, accessibility, and best practices."
---

### Requirements

1. **Review each provided file** or changed files for correctness, performance, accessibility, best practices, readability, and security.
2. **Categorize each finding** as `critical`, `warning`, or `suggestion`.
3. **Reference specific line numbers** in files.
4. **Provide a risk summary** and go/no-go recommendation.
5. **Consider the following review dimensions:**

| Dimension | What to check |
|---|---|
| Correctness | Component logic, hook dependencies, API call structure, TypeScript types |
| Performance | Unnecessary re-renders, missing keys, bundle size, memoization opportunities |
| Accessibility | ARIA labels, keyboard navigation, color contrast, semantic HTML |
| Best practices | Next.js conventions (client/server boundary), state management patterns, file organization |
| Readability | Meaningful names, prop interfaces, consistent patterns with codebase |
| Security | No secrets in client code, input sanitization, XSS prevention |

### Constraints

- Do not implement fixes — flag issues for the domain agent to address
- If no issues found, confirm that the code is clean across all dimensions
- Pay special attention to the client/server boundary in Next.js (don't import server modules in client components)

### Output Format

```
## Review: [files reviewed]

### Critical
- [line] [issue description]

### Warnings
- [line] [issue description]

### Suggestions
- [line] [issue description]

### Risk Summary
[go / no-go] — [brief rationale]
```

### Usage Template

```
Review these files for merge readiness:
- [file path 1]
- [file path 2]
Context: [feature purpose, related components]
```

### Chat Example

```
User: Review src/app/chat/page.tsx and src/hooks/queries/useChatMessages.ts for correctness and performance.
```

Agent (expected):
- Reads both files and their dependencies
- Produces structured review with line references and severity
- Provides go/no-go recommendation with rationale
