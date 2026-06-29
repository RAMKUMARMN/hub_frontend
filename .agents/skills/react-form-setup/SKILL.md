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
- [Reusable Form Fields](#reusable-form-fields)
- [Error Display](#error-display)
- [API Integration](#api-integration)
- [Verification](#verification)

## Setup

Ensure the required packages are installed:

```bash
npm install react-hook-form @hookform/resolvers zod
```

## Form Template

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const settingsSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }),
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface SettingsFormProps {
  defaultValues?: Partial<SettingsFormData>
  onSubmit: (data: SettingsFormData) => Promise<void>
}

export function SettingsForm({ defaultValues, onSubmit }: SettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input id="displayName" {...register('displayName')} />
        {errors.displayName && (
          <p className="text-sm text-red-500">{errors.displayName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Notification Preferences</legend>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('notifications.email')} />
          Email notifications
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('notifications.push')} />
          Push notifications
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('notifications.sms')} />
          SMS notifications
        </label>
      </fieldset>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}
```

## Zod Schema

Define schemas co-located with the form or in `src/lib/schemas/` if shared:

```tsx
import { z } from 'zod'

export const settingsSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be 50 characters or less'),
  email: z.string().email('Invalid email address'),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }),
})
```

## Reusable Form Fields

For frequently used field patterns, create a wrapper:

```tsx
interface FormFieldProps {
  label: string
  error?: string
  children: React.ReactNode
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
```

## Error Display

Errors are displayed inline below each field. Use a consistent pattern:

```tsx
{errors.fieldName && (
  <p className="text-sm text-red-500" role="alert">
    {errors.fieldName.message}
  </p>
)}
```

## API Integration

Submit form data via the shared Axios instance:

```tsx
const { mutateAsync: updateSettings, isPending } = useMutation({
  mutationFn: async (data: SettingsFormData) => {
    const response = await api.put('/api/v1/users/me', data)
    return response.data
  },
  onSuccess: () => {
    toast.success('Settings saved')
    queryClient.invalidateQueries({ queryKey: ['user'] })
  },
  onError: (err) => {
    toast.error('Failed to save settings')
  },
})
```

## Verification

1. Form renders with all fields
2. Validation errors appear on invalid input
3. Submit calls the API with correct data shape
4. Loading state disables the submit button
5. Success/error feedback is shown to the user
6. `tsc --noEmit` passes
