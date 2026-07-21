---
name: shadcn-ui-component
description: Create reusable UI components using Tailwind CSS, TypeScript, and brand tokens. Note: shadcn/ui is NOT used in this project — components are built with plain Tailwind CSS.
metadata:
  model: models/gemini-3.1-pro-preview
  last_modified: Mon, 29 Jun 2026 00:00:00 GMT
---

# Creating UI Components

## Contents
- [Directory Layout](#directory-layout)
- [Component Template](#component-template)
- [Brand Tokens](#brand-tokens)
- [Accessibility](#accessibility)
- [cn() Utility](#cn-utility)
- [Existing Utility Classes](#existing-utility-classes)
- [Verification](#verification)

## Important Note

This project does NOT use shadcn/ui. There are no `@radix-ui/*` packages, no `components/ui/` directory, and no shadcn primitives. All components are built with plain Tailwind CSS using the custom `cixio-*` brand tokens.

## Directory Layout

```
src/components/
├── NavBar.tsx                   # Shared navigation (currently the only component)
├── chat/                        # Chat feature components (to be created)
├── todos/                       # Todos feature components (to be created)
└── settings/                    # Settings feature components (to be created)
```

## Component Template

```tsx
import { cn } from '@/lib/utils'

interface NotificationBellProps {
  unreadCount: number
  onBellClick?: () => void
  className?: string
}

export function NotificationBell({
  unreadCount,
  onBellClick,
  className,
}: NotificationBellProps) {
  return (
    <button
      onClick={onBellClick}
      className={cn(
        'relative rounded-full p-2 transition-colors',
        'hover:bg-cixio-hover focus:outline-none focus:ring-2 focus:ring-cixio-blue',
        className
      )}
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
    >
      <BellIcon className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
```

## Brand Tokens

Use these Tailwind CSS brand tokens throughout the project:

| Token | CSS Variable | Usage |
|---|---|---|
| `cixio-blue` | `--cixio-blue` | Primary actions, links, active states |
| `cixio-navy` | `--cixio-navy` | Headers, navigation, secondary elements |
| `cixio-dark` | `--cixio-dark` | Text, icons on light backgrounds |
| `cixio-light` | `--cixio-light` | Backgrounds, cards |
| `cixio-bg` | `--cixio-bg` | Page background |
| `cixio-hover` | `--cixio-hover` | Hover state backgrounds |
| `cixio-muted` | `--cixio-muted` | Secondary text, disabled states, borders |

All tokens use the `cixio-` prefix, e.g.: `bg-cixio-blue`, `text-cixio-dark`, `hover:bg-cixio-hover`, `border-cixio-muted`.

## Accessibility

- Use `aria-label`, `aria-labelledby`, `aria-describedby` for interactive elements
- All buttons must be keyboard accessible (native `<button>` or `role="button"` with `tabIndex`)
- Focus indicators must be visible (`focus:ring-2 focus:ring-cixio-blue`)
- Color is never the only indicator of state (add text or icon)
- Use semantic HTML (`<nav>`, `<main>`, `<aside>`, `<section>`)

## cn() Utility

Always use the `cn()` utility from `@/lib/utils` for conditional class merging:

```tsx
import { cn } from '@/lib/utils'

// Good
className={cn('base-class', variant === 'primary' && 'bg-cixio-blue', className)}

// Avoid
className={`base-class ${variant === 'primary' ? 'bg-cixio-blue' : ''} ${className}`}
```

## Existing Utility Classes

The project defines these reusable utility classes in `src/app/globals.css`:

| Class | Purpose |
|---|---|
| `btn-cixio` | Primary button with hover, focus, and disabled states |
| `card-cixio` | Card container with border and shadow |
| `input-cixio` | Form input with focus ring and border |

Use these for consistency across the application.

## Verification

1. Component renders without errors
2. Props are properly typed
3. Keyboard navigable with visible focus ring
4. Screen reader announces interactive elements
5. `tsc --noEmit` passes
