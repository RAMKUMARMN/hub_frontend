---
mode: agent
agent: frontend-web-vitals
name: frontend-web-vitals-prompt
description: "Prompt for the frontend-web-vitals agent. Scans all `.tsx` files for accessibility issues (missing aria-label, role), improper `next/image` usage, and Layout Shift risks in Chat and Todo interfaces."
---

### Requirements

1. **Scan all `.tsx` files** in the `scan_path` (default `src/`). For each file, read its full content.

2. **Check 1-3 — Semantic HTML & Accessibility:** For each component file, scan the JSX for:
   - `<button>`, `<nav>`, `<input>`, `<select>`, `<textarea>` without `aria-label` or `aria-labelledby` → flag as **warning**
   - Custom interactive components (div with `onClick`, `onKeyDown`) without `role` or `tabIndex` → flag as **warning**
   - Deeply nested `<div>` chains that should use semantic elements (`<nav>`, `<main>`, `<aside>`, `<section>`, `<article>`, `<header>`, `<footer>`) → flag as **suggestion**

3. **Check 4-7 — Image Optimization:** Scan for:
   - `<img` tags that are NOT `import Image from "next/image"` → flag as **critical** (LCP impact)
   - `import Image from "next/image"` usage without `priority` prop on above-fold images → flag as **critical** (LCP impact)
   - `next/image` usage without `sizes` attribute → flag as **warning** (wasted bandwidth)
   - Any `<img>` or `<Image>` without explicit `width` and `height` → flag as **critical** (CLS risk)

4. **Check 8 — Chat Layout Shift:** Read `src/app/chat/[sessionId]/page.tsx` and any chat components. Look for:
   - Dynamic content inserted without a reserved container (fixed height/width placeholder)
   - Streaming message container missing `min-height`
   - Images/avatars inside messages without dimensions
   - Flag as **warning** (CLS risk)

5. **Check 9 — Todo Layout Shift:** Read `src/app/todos/page.tsx` and any todo components. Look for:
   - Items added/removed from list without stable container dimensions
   - Checkbox toggles that change adjacent layout
   - Missing `height` or `min-height` on list containers
   - Flag as **warning** (CLS risk)

6. **Check 10 — Lazy Loading:** Scan for `next/image` usage below the fold. If `loading` is not set to `"lazy"`, flag as **info** and suggest adding it.

### Constraints

- Read-only — never modify any file
- Use the structured output format below
- Map each finding to the Core Web Vital it affects (LCP, CLS, or INP)
- Use exact file paths relative to `src/`

### Success Criteria

- Every `.tsx` file in the scan path is checked
- Findings are grouped by severity (critical → warning → suggestion → info)
- Each finding includes file path, line number, affected metric, and code fix suggestion
- Layout Shift risks include the specific UI pattern causing it

### Output Format

```
## Web Vitals & Accessibility Audit — {scan_path}

### Critical (LCP / CLS impact)
{n}. [{file:line}] {description}
    → Metric: LCP | CLS
    → Fix: {code suggestion}

### Warnings (CLS / INP impact)
...

### Suggestions (a11y / best practice)
...

### Summary
- {n} critical, {n} warnings, {n} suggestions
- Top LCP improvement: {suggestion}
- Top CLS improvement: {suggestion}
```

### Usage Template

```
Run a web vitals audit on {scan_path}.
Focus on {accessibility / images / layout-shift / all}.
Show the report and wait for my review.
```

### Chat Example

```
User: Audit the frontend for layout shift risks in the chat and todo interfaces.
```

Agent (expected):
- Scans all `.tsx` files in `src/` recursively
- Checks for missing aria attributes, image optimization issues, and layout stability
- Produces a structured report with findings mapped to Core Web Vitals
- Provides code fix suggestions with file:line references
- Waits for user to review the report
