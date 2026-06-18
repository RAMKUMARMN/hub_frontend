---
name: discover-file-uploads
description: Trace UI dropzones, file chunking, and direct S3 handoffs.
---

# Discover File Uploads

Analyze the document ingestion UI logic.

## Focus Areas
- File Dropzone components
- FormData construction or AWS S3 Presigned URL PUT requests
- Upload progress state tracking

## Goals
- Map the exact handoff mechanism from the UI to the Document Service.
- Document supported file types and size limits enforced on the client.

## Output
Return:
- File upload execution flow

## Workflow
1. Route the hub folder agent to plugin/skills for this specific skill folder.
2. Invoke `findFeatureImplementation` targeting "file upload", "dropzone", or "FormData".
3. Return the ingestion UI logic.
