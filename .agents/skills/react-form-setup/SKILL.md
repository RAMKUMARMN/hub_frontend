---
name: react-form-setup
description: Create forms using React Hook Form with Zod validation schemas. Follow the project's patterns for reusable form fields, error display, and API integration.
metadata:
  model: models/gemini-3.1-pro-preview
  last_modified: Mon, 29 Jun 2026 00:00:00 GMT
---

# React Hook Form with Zod

## Contents
- [Setup](#setup)
- [Form Template](#form-template)
- [Zod Schema](#zod-schema)
- [Error Display](#error-display)
- [API Integration](#api-integration)
- [Verification](#verification)

## Setup

Required packages are already installed:
- `react-hook-form`
- `@hookform/resolvers`
- `zod`

## Form Template

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/api'

const schema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

type FormData = z.infer<typeof schema>

export default function SettingsForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await api.put('/users/me', data)
    } catch (err) {
      console.error('Failed to save', err)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1.5">Display Name</label>
        <input {...register('displayName')} className="input-cixio" />
        {errors.displayName && (
          <p className="text-red-500 text-xs mt-1">{errors.displayName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Email</label>
        <input type="email" {...register('email')} className="input-cixio" />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-cixio">
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}
```

## Zod Schema

Define schemas co-located with the page (or in `src/lib/schemas/` if shared):

```tsx
import { z } from 'zod'

export const schema = z.object({
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be 50 characters or less'),
  email: z.string().email('Invalid email address'),
})
```

For password confirmation, use `.refine()`:

```tsx
const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
```

## Error Display

Errors are displayed inline below each field using the existing pattern:

```tsx
{errors.fieldName && (
  <p className="text-red-500 text-xs mt-1">{errors.fieldName.message}</p>
)}
```

For form-level errors:

```tsx
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
    <p className="text-red-600 text-sm">{error}</p>
  </div>
)}
```

## API Integration

Submit form data via the shared Axios instance:

```tsx
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

const onSubmit = async (data: FormData) => {
  try {
    await api.put('/users/me', data)
  } catch (err) {
    const message =
      (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Save failed'
    setError(message)
  }
}
```

## Verification

1. Form renders with all fields
2. Validation errors appear on invalid input
3. Submit calls the API with correct data shape
4. Loading state disables the submit button
5. `tsc --noEmit` passes
