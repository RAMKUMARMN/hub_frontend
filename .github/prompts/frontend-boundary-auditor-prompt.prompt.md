---
mode: agent
agent: frontend-boundary-auditor
name: frontend-boundary-auditor-prompt
description: "Prompt for the frontend-boundary-auditor agent. Scans all `.tsx` files in `src/app/` and `src/components/` for `\"use client\"` boundary violations, Server Component import leaks, and component extraction opportunities."
---

### Requirements

1. **Scan all `.tsx` files** in the `scan_path` (default `src/`). For each file, read its full content.

2. **Check 1 — Unnecessary `"use client":`** If a file has `"use client"` at the top, check if it actually uses any client features:
   - React hooks (`useState`, `useEffect`, `useContext`, `useRef`, `useCallback`, `useMemo`, `useReducer`)
   - Browser APIs (`window`, `document`, `localStorage`, `addEventListener`)
   - Client-only libraries (`useForm` from react-hook-form, `useAuthStore` from zustand, `useQuery` from @tanstack/react-query)
   - Event handlers (`onClick`, `onSubmit`, `onChange` — in JSX)
   If none of these are found, flag as **warning** — `"use client"` may be unnecessary.

3. **Check 2 — Server Component import leak:** For files that do NOT have `"use client"`, scan imports for:
   - `zustand` (e.g., `from "@/store/authStore"`)
   - `react-hook-form` or `@hookform/resolvers`
   - `react-markdown`, `remark-gfm`, `rehype-highlight`, `highlight.js`
   - `@tanstack/react-query`
   If found, flag as **critical** — Server Component importing client-only code.

4. **Check 3 — Inline page logic:** For each `page.tsx` file, count the total lines. If > `min_inline_lines` (default 100), flag as **suggestion** and propose component names to extract based on the JSX structure.

5. **Check 4 — Server-to-Client direct import:** In non-client files, check if they import any `.tsx` file that has `"use client"`. If found, flag as **warning** and suggest using the `children` prop pattern.

6. **Check 5 — Missing `"use client":`** In files without the directive, check if they use hooks (`useState`, `useEffect`, etc.), event handlers, or browser APIs. If found, flag as **critical**.

### Constraints

- Read-only — never modify any file
- Report using the structured output format below
- Use exact file paths relative to `src/` in all findings

### Success Criteria

- Every `.tsx` file in the scan path is checked
- Findings are grouped by severity (critical → warning → suggestion → info)
- Each finding includes file path, line number, current state, and recommendation
- Component extraction suggestions include specific component names based on file content
- Total line counts are included for inline extraction candidates

### Output Format

```
## Boundary Audit — {scan_path}

### Critical (must fix)
{n}. [{file}:{line}] {description}
    → {recommendation}

### Warnings (should fix)
...

### Suggestions (nice to have)
...

### Component Extraction Candidates
| File | Lines | Suggested Components |
|---|---|---|
| src/app/chat/[sessionId]/page.tsx | ~196 | ChatWindow, MessageBubble, ChatInput |

### Summary
- {n} files scanned
- {n} critical, {n} warnings, {n} suggestions
- {n} component extraction candidates
```

### Usage Template

```
Run a boundary audit on {scan_path}.
{Optional: custom min_inline_lines, report_format}
Show the report and wait for my review.
```

### Chat Example

```
User: Audit the frontend for "use client" issues and find files that need component extraction.
```

Agent (expected):
- Scans all `.tsx` files in `src/` recursively
- Checks each file for the audit criteria
- Produces a structured report with findings by severity
- Lists component extraction candidates with suggested names
- Waits for user to review the report
