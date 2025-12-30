# AI Live Chat Agent

A customer support chat widget with AI integration using **OpenRouter API**.

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm

### 1. Configure Environment

Copy the example environment files:

```bash
# Server environment
cp server/.env.example server/.env

# Client environment
cp client/.env.example client/.env
```

Edit `server/.env` and add your OpenRouter API key:

```
DATABASE_URL=file:./dev.db
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

> Get your API key from [openrouter.ai](https://openrouter.ai/)
>
> **Supabase Setup (Optional)**
> 1. Create a new project on [Supabase.com](https://supabase.com/).
> 2. Go to Project Settings -> Database -> Connection String.
> 3. Copy the "URI" for Transaction Mode (Port 6543) or Session Mode (Port 5432).
> 4. In `server/.env`, replace `DATABASE_URL` with your Supabase connection string.
>    ```
>    DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres
>    ```
> 5. (Important) If using Transaction Mode (PgBouncer), you may need to add `?pgbouncer=true` to the URL.
> 6. Run the setup command to push the schema to your Supabase database:
>    ```bash
>    pnpm run db:setup
>    ```

### 2. Install & Setup

```bash
pnpm run setup
```

This installs all dependencies and sets up the database.

### 3. Run the App

```bash
pnpm run prod
```

Opens at **http://localhost:5001** (frontend + API on same port)

---

## Development Mode

If you want to run in development mode with hot reload:

```bash
# Terminal 1 - Backend
pnpm run dev:server

# Terminal 2 - Frontend
pnpm run dev:client
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5001

---

## Available Scripts

| Script              | Description                           |
| ------------------- | ------------------------------------- |
| `pnpm run setup`    | Install all dependencies + setup database |
| `pnpm run prod`     | Build and run production server       |
| `pnpm run dev:server` | Run backend in dev mode             |
| `pnpm run dev:client` | Run frontend in dev mode            |

---

## Technology Stack

- **Backend**: Node.js + TypeScript + Express
- **Database**: PostgreSQL / SQLite (via Prisma ORM)
- **Frontend**: React + TypeScript + Vite
- **State Management**: Zustand + TanStack Query
- **Styling**: Tailwind CSS + shadcn/ui
- **LLM Provider**: OpenRouter (supports multiple models)

---

For more details about the architecture and folder structure, see the individual READMEs:
- [Server README](./server/README.md)
- [Client README](./client/README.md)
#
