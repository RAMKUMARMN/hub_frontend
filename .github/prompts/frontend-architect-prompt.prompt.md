---
mode: agent
agent: frontend-architect
name: frontend-architect-prompt
description: "Prompt for the frontend-architect agent. Designs page/component trees, route layouts, data flow, and file organization for new features. Produces architecture plans and hands off implementation to domain-specific agents."
---

### Requirements

1. **Understand the feature:** Read the feature description and any existing related files (route files, stores, components) to understand the current state.

2. **Design the route structure:**
   - Determine the page location in `src/app/`
   - Use route groups (`(auth)`) and dynamic segments (`[sessionId]`) where appropriate
   - Plan loading, error, and layout files

3. **Design the component tree:**
   - Identify shared components → place in `src/components/`
   - Identify page-specific helpers → co-locate inline in the page file
   - Define parent-child layout and props interface

4. **Design data flow:**
   - Server data (API calls) → TanStack React Query hooks
   - Global client state → Zustand store in `src/store/`
   - Local UI state → `useState` / `useReducer`
   - Auth state → existing `useAuthStore`

5. **Produce the architecture plan:**
   - File tree of new/modified files
   - Component hierarchy (text-based tree)
   - Data flow description
   - Implementation checklist grouped by agent handoff

### Constraints

- Read-only — never modify any file
- Reference existing project conventions from the agent definition
- When the plan requires implementation, specify which agent to hand off to

### Success Criteria

- Plan includes exact file paths following project conventions
- Component hierarchy shows parent-child relationships
- Data flow clearly distinguishes server vs client state
- Implementation checklist is ordered and actionable
- Decisions include rationale (e.g., "Zustand store because this state is shared across routes")

### Output Format

```
## Architecture Plan — {feature}

### Route Structure
- `src/app/settings/page.tsx` — main settings page
- `src/app/settings/layout.tsx` — settings sidebar layout

### Component Hierarchy
```
<SettingsLayout>
  <SettingsNav />       {/* shared, src/components/SettingsNav.tsx */}
  <ProfileForm />       {/* inline in page */}
  <NotificationForm />  {/* inline in page */}
</SettingsLayout>
```

### Data Flow
- User profile → React Query (`useQuery('/users/me')`)
- Form state → React Hook Form (local)
- Theme preference → Zustand store (`useSettingsStore`)

### Implementation Checklist
1. [frontend-pages] Create `src/app/settings/layout.tsx`
2. [frontend-components] Create `src/components/SettingsNav.tsx`
3. [frontend-pages] Create `src/app/settings/page.tsx`
4. [frontend-data] Add `useSettingsStore` to `src/store/settingsStore.ts`
```

### Usage Template

```
Architect the frontend for: {feature description}.
Focus on route structure, component tree, and data flow.
{Optional: reference existing patterns or constraints}
```

### Chat Example

```
User: Design the architecture for a document approval workflow. Users submit documents, reviewers approve/reject, and admins see a dashboard.

Agent (expected):
- Analyses requirements
- Proposes routes: /documents/submit, /documents/review, /admin/documents
- Designs component hierarchy
- Defines data flow (React Query for lists, Zustand for filter state)
- Produces implementation checklist grouped by agent
```
