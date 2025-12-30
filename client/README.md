# Client - AI Chat Frontend

React + TypeScript + Vite frontend for the AI chat application.

## Architecture

### Folder Structure

```
src/
├── components/
│   ├── ui/                 # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   └── input.tsx
│   ├── chat-view.tsx       # Main chat interface
│   ├── chat-message.tsx    # Individual message bubble
│   ├── sidebar.tsx         # Session list & controls
│   └── theme-toggle.tsx    # Dark/light mode switch
├── services/
│   └── chat.service.ts     # API calls + TanStack Query keys
├── stores/
│   └── model.store.ts      # Zustand store for model selection
├── contexts/
│   └── theme.context.tsx   # Theme context provider
├── types/                  # TypeScript types
├── lib/                    # Utilities (cn helper, etc.)
├── styles/                 # Global CSS
└── App.tsx                 # Root component
```

### Design Decisions

#### 1. State Management Split

We use **two different state solutions** for different purposes:

**Zustand** → Client-only state (model selection)
```typescript
// stores/model.store.ts
export const useModelStore = create((set) => ({
  selectedModel: 'xiaomi/mimo-v2-flash:free',
  setModel: (model) => set({ selectedModel: model }),
}));
```

**TanStack Query** → Server state (sessions, messages)
```typescript
const { data: sessions } = useQuery({
  queryKey: chatKeys.sessions(),
  queryFn: getSessions,
});
```

**Why the split?**
- Server data needs caching, refetching, and optimistic updates → TanStack Query
- UI preferences need instant updates without API calls → Zustand
- Keeps concerns separate and code cleaner

#### 2. Query Key Factory Pattern

We use a factory pattern for query keys to ensure consistency:

```typescript
export const chatKeys = {
  all: ['chat'] as const,
  sessions: () => [...chatKeys.all, 'sessions'] as const,
  session: (id: string) => [...chatKeys.all, 'session', id] as const,
};
```

This makes cache invalidation predictable and type-safe.

#### 3. Component Structure

Components are organized by feature, not type:

- `chat-view.tsx` → Main chat area with message input
- `chat-message.tsx` → Message bubble with markdown support
- `sidebar.tsx` → Session list, new chat button, model selector

Each component is self-contained with its own hooks and logic.

#### 4. Theme System

We use CSS custom properties for theming:

```tsx
// contexts/theme.context.tsx
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
}
```

Works seamlessly with Tailwind's `dark:` variants.

#### 5. API Service Layer

All API calls are centralized in `services/chat.service.ts`:

```typescript
export async function sendMessage(sessionId: string, content: string, model?: string) {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, model }),
  });
  return response.json();
}
```

**Benefits:**
- Single source of truth for API endpoints
- Easy to mock for testing
- TypeScript types for all responses

#### 6. Optimistic Updates

When sending a message, we immediately show the user's message before the API responds:

```typescript
// Optimistically add user message to UI
queryClient.setQueryData(chatKeys.session(sessionId), (old) => ({
  ...old,
  messages: [...old.messages, optimisticMessage],
}));
```

This makes the chat feel instant and responsive.

## Key Features

- **Dark/Light Mode** → System preference detection + manual toggle
- **Model Selection** → Users can choose from available OpenRouter models
- **Markdown Support** → AI responses render with proper formatting
- **Session Management** → Create, switch, and delete chat sessions
- **Responsive Design** → Works on mobile and desktop

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `/api/v1/chat` (proxied in dev) |
