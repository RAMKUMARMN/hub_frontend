---
name: discover-form-validation
description: Map Zod/React Hook Form schemas and frontend payload structuring.
---

# Discover Form Validation

Analyze how user input is validated before hitting the backend.

## Focus Areas
- Form libraries (React Hook Form, Formik)
- Validation schemas (Zod, Yup) in `src/types/` or alongside components.

## Goals
- Verify frontend payloads match backend FastAPI Pydantic schemas.
- Document client-side error messaging rules.

## Output
Return:
- Input validation schema map

## Workflow
1. Route the hub folder agent to plugin/skills for this specific skill folder.
2. Invoke `findFeatureImplementation` targeting "Zod schemas", "useForm", or "payload validation".
3. Return the payload structuring rules.
