# Server - AI Chat Backend

Express + TypeScript + Prisma backend for the AI chat application.

## Architecture

### Folder Structure

```
src/
├── controllers/        # Request handlers (thin layer)
│   ├── chat.controller.ts
│   └── user.controller.ts
├── services/           # Business logic
│   ├── chat.service.ts      # Session & message management
│   └── openrouter.service.ts # LLM integration
├── routers/            # Route definitions
│   ├── chat.router.ts
│   └── index.ts
├── middlewares/        # Express middlewares
│   ├── error.middleware.ts  # Global error handling
│   └── validation.middleware.ts
├── exceptions/         # Custom error classes
│   ├── BadRequestError.ts
│   ├── NotFoundError.ts
│   └── ...
├── validations/        # Zod schemas for request validation
├── lib/               # Database connection (Prisma)
├── types/             # TypeScript types
└── server.ts          # Entry point
```

### Design Decisions

#### 1. Layered Architecture

We follow a clean separation of concerns:

- **Controllers** → Handle HTTP request/response, delegate to services
- **Services** → Contain all business logic, interact with database
- **Routers** → Define API routes and attach controllers

This makes the code testable and maintainable.

#### 2. OpenRouter Integration

We chose **OpenRouter** over a single LLM provider for flexibility:

```typescript
// openrouter.service.ts
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  headers: { Authorization: `Bearer ${apiKey}` },
  body: JSON.stringify({ model: selectedModel, messages, max_tokens }),
});
```

**Why OpenRouter?**
- Switch between models (GPT-4, Claude, Mistral, etc.) without code changes
- Users can select their preferred model from the frontend
- Single API key, multiple providers

#### 3. System Prompt Strategy

The LLM is prompted as a support agent for a fictional e-commerce store:

```typescript
const STORE_KNOWLEDGE = `
You are a helpful support agent for "Spurify" - a fictional e-commerce store.

STORE POLICIES:
- Shipping: We ship worldwide within 3-5 business days...
- Returns: 30-day return policy...
`;
```

This gives the chatbot a consistent persona and domain knowledge.

#### 4. Conversation Context

Full conversation history is sent with each request for better context:

```typescript
const allMessages = [
  { role: 'system', content: STORE_KNOWLEDGE },
  ...messages.slice(-maxMessages), // Limit to prevent token overflow
];
```

Trade-off: Better accuracy vs. higher token cost (configurable via `MAX_MESSAGES_PER_SESSION`).

#### 5. Custom Exception Classes

We use custom error classes that extend a base `HttpError`:

```typescript
throw new NotFoundError('Chat session not found');
throw new BadRequestError('Message cannot be empty');
```

The error middleware catches these and returns proper HTTP status codes.

#### 6. Prisma ORM

Database schema is simple but effective:

```prisma
model ChatSession {
  id        String    @id @default(cuid())
  title     String
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id            String      @id @default(cuid())
  chatSession   ChatSession @relation(...)
  role          Role        // USER or ASSISTANT
  content       String
  timestamp     DateTime    @default(now())
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/chat/sessions` | Get all chat sessions |
| POST | `/api/v1/chat/sessions` | Create new session |
| GET | `/api/v1/chat/sessions/:id` | Get session with messages |
| DELETE | `/api/v1/chat/sessions/:id` | Delete session |
| POST | `/api/v1/chat/sessions/:id/messages` | Send message & get AI response |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL or SQLite connection | Required |
| `OPENROUTER_API_KEY` | OpenRouter API key | Required |
| `MAX_TOKENS_PER_MESSAGE` | Max tokens per LLM response | 1000 |
| `MAX_MESSAGES_PER_SESSION` | Max messages for context | 50 |
| `PORT` | Server port | 5001 |
