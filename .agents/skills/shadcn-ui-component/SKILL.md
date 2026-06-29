---
name: shadcn-ui-component
description: Create reusable UI components using shadcn/ui primitives, Tailwind CSS, and TypeScript. Follow the project's brand tokens and accessibility patterns.
metadata:
  model: models/gemini-3.1-pro-preview
  last_modified: Mon, 29 Jun 2026 00:00:00 GMT
---

# Creating shadcn/ui Components

## Contents
- [Directory Layout](#directory-layout)
- [Component Template](#component-template)
- [Brand Tokens](#brand-tokens)
- [Accessibility](#accessibility)
- [cn() Utility](#cn-utility)
- [Verification](#verification)

## Directory Layout

```
src/components/
├── ui/                         # shadcn/ui primitives (do not modify)
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── popover.tsx
│   ├── dropdown-menu.tsx
│   └── ...
├── chat/                       # Chat feature components
│   ├── chat-message.tsx
│   ├── chat-input.tsx
│   ├── notification-bell.tsx
│   └── ...
├── todos/                      # Todos feature components
│   ├── todo-list.tsx
│   ├── todo-item.tsx
│   └── ...
├── admin/                      # Admin feature components
│   └── ...
└── settings/                   # Settings feature components
    └── ...
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
        'hover:bg-hover focus:outline-none focus:ring-2 focus:ring-cixio-blue',
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
| `navy` | `--navy` | Headers, navigation, secondary elements |
| `dark` | `--dark` | Text, icons on light backgrounds |
| `light` | `--light` | Backgrounds, cards |
| `bg` | `--bg` | Page background |
| `hover` | `--hover` | Hover state backgrounds |
| `muted` | `--muted` | Secondary text, disabled states, borders |

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

## Verification

1. Component renders without errors
2. Props are properly typed
3. Works in light and dark mode
4. Keyboard navigable with visible focus ring
5. Screen reader announces interactive elements
6. `tsc --noEmit` passes
