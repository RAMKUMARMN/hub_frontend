# Frontend — CixioHub Web Application

Next.js 14 web app for CixioHub. Provides the full chat UI, document management, todos, and user profile.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Pre-built accessible components |
| **Axios** | HTTP client for API calls |
| **React Query (TanStack)** | Server state management & caching |
| **Zustand** | Client-side state (auth, chat) |
| **EventSource** | SSE for streaming chat responses |
| **React Hook Form + Zod** | Form handling and validation |
| **react-markdown + rehype** | Markdown rendering in chat |
| **react-syntax-highlighter** | Code block syntax highlighting |

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout (fonts, providers)
│   │   ├── page.tsx                # Redirect → /chat
│   │   ├── (auth)/                 # Auth group — no sidebar layout
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── chat/
│   │   │   ├── page.tsx            # /chat → redirect to latest session
│   │   │   └── [sessionId]/
│   │   │       └── page.tsx        # Chat session view
│   │   ├── documents/
│   │   │   └── page.tsx
│   │   ├── todos/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx         # Session list, nav links
│   │   │   └── TopBar.tsx          # User menu, settings
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx      # Main chat area
│   │   │   ├── MessageBubble.tsx   # Single message (user/assistant)
│   │   │   ├── ChatInput.tsx       # Text input + send button
│   │   │   └── StreamingMessage.tsx # Live streaming AI response
│   │   ├── documents/
│   │   │   ├── FileUpload.tsx      # Drag-and-drop upload zone
│   │   │   └── FileList.tsx        # List of uploaded documents
│   │   ├── todos/
│   │   │   ├── TodoForm.tsx
│   │   │   └── TodoItem.tsx
│   │   └── ui/                     # shadcn/ui components (Button, Input, etc.)
│   │
│   ├── lib/
│   │   ├── api.ts                  # Axios instance with interceptors
│   │   ├── auth.ts                 # Token storage, refresh logic
│   │   └── utils.ts                # cn() and other helpers
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useChat.ts
│   │   └── useDocuments.ts
│   │
│   ├── store/
│   │   ├── authStore.ts            # Zustand: current user
│   │   └── chatStore.ts            # Zustand: active session
│   │
│   └── types/
│       └── index.ts                # Shared TypeScript types
│
├── public/
│   └── logo.svg
│
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── Dockerfile
└── .env.example
```

---

## Setup & Running

### 1. Prerequisites
- Node.js 20+
- Backend API running on `:8000`

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Start development server

```bash
npm run dev
# App available at http://localhost:3000
```

### 5. Build for production

```bash
npm run build
npm run start
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_NAME` | Display name | `CixioHub` |

---

## Pages & Features

### `/login` — Login Page
- Email + password form
- Shows error messages inline (wrong credentials, network error)
- "Don't have an account? Register" link
- On success: store JWT, redirect to `/chat`

### `/register` — Registration Page
- Full name, email, phone (optional), password, confirm password
- Client-side validation with Zod
- On success: auto-login, redirect to `/chat`

### `/chat/default` — Chat Interface

This is the core screen. Build it carefully.

**Layout:**
```
┌─────────────┬──────────────────────────────────┐
│   Sidebar   │         Chat Messages             │
│             │                                   │
│ + New Chat  │  [User]: What is RAG?             │
│             │                                   │
│ Session 1   │  [AI]:  RAG stands for...        │
│ Session 2   │         (streaming...)            │
│ Session 3   │                                   │
│             ├───────────────────────────────────┤
│             │  [      Type a message...    ] ▶  │
└─────────────┴──────────────────────────────────┘
```

**Streaming chat (SSE):**
```typescript
// Use EventSource to connect to the streaming endpoint
const source = new EventSource(
  `${API_URL}/api/v1/chat/sessions/${sessionId}/messages`,
  { withCredentials: true }
);

source.onmessage = (event) => {
  if (event.data === '[DONE]') { source.close(); return; }
  const { delta } = JSON.parse(event.data);
  setCurrentMessage(prev => prev + delta);
};
```

**Markdown rendering:**
- Render AI responses as Markdown (bold, headers, lists)
- Code blocks: syntax-highlighted with language label
- Copy button on code blocks

### `/documents` — Document Manager
- Drag-and-drop upload zone (accepts `.pdf`, `.docx`, `.txt`, `.png`, `.jpg`)
- File list table: name, size, type, upload date, processed status
- Delete button per file (with confirmation dialog)
- Upload progress bar

### `/todos` — Todo List
- Simple list with checkboxes
- Inline create form at the top
- Click to mark complete (strikethrough)
- Delete button per item
- Optional: due date display

### `/profile` — User Profile
- Display name, email (read-only), phone
- Edit form for name + phone
- Avatar display + upload (click to change)
- Change password form (separate section)
- Logout button

---

## Authentication Flow

1. User logs in → backend returns `access_token` + `refresh_token`
2. Store `access_token` in memory (Zustand) and `refresh_token` in `localStorage`
3. Axios interceptor adds `Authorization: Bearer <token>` to every request
4. On 401 response: automatically call `/auth/refresh`, retry original request
5. On refresh failure: clear tokens, redirect to `/login`
6. Protected routes: if no token in Zustand on mount, redirect to `/login`

---

## Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Related Repositories

| Repository | Description |
|-----------|-------------|
| [backend](https://github.com/cixio-hub/backend) | API server this app calls |
| [infra](https://github.com/cixio-hub/infra) | Docker Compose, Nginx config |
