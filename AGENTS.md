# AGENTS.md — BDP System

## Project Overview

Next.js 15 (App Router) + TypeScript + Prisma + PostgreSQL. Feature-slice architecture with Clean Architecture layering, Repository Pattern, RBAC, and Server Actions as the primary backend (no REST API for business logic).

---

## Build / Lint / Test Commands

### Package Manager
All commands use **Bun** as package manager and runtime.

```bash
# Install dependencies
bun install

# Development server (Turbopack)
bun run dev

# Production build + apply DB migrations
bun run build

# Start production server
bun run start
```

### Linting & Formatting
```bash
# Run ESLint (flat config, ESLint v9)
bun run lint

# Format with Prettier
bunx prettier --write .

# Format check only
bunx prettier --check .
```

### Database
```bash
# Apply migrations + regenerate Prisma client
bun run prisma:deploy

# Open Prisma Studio GUI
bun run prisma:studio

# Run database seed
bun run seed

# Start PostgreSQL via Docker
docker compose up -d
```

### Tests
**There are currently no tests.** The recommended future stack is:
- **Vitest** for unit/integration tests
- **Playwright** for E2E tests

When adding tests, the single-test command pattern will be:
```bash
# Vitest single test (future)
bunx vitest run src/features/finanzas/egresos/server/services/EgresoService.test.ts
```

---

## Path Aliases

The `@/` alias maps to `src/`. Always use it for cross-feature or cross-layer imports.

```typescript
import { prisma } from "@/core/lib/prisma";
import { auth } from "@/core/lib/auth/auth";
import { Ok, Err } from "@/core/shared/result/result";
```

Within a feature, relative imports are acceptable for sibling files.

---

## Architecture & Directory Structure

```
src/
├── app/                   # Next.js App Router (routing ONLY — no business logic)
│   ├── (Dashboard)/       # Protected route group
│   ├── (Public)/          # Unauthenticated pages
│   └── api/               # Only NextAuth handlers
├── core/
│   ├── lib/
│   │   ├── auth/          # NextAuth v5 config (JWT, credentials)
│   │   ├── permissions/   # RBAC guards, checker, route config
│   │   └── prisma.ts      # Singleton Prisma client
│   └── shared/
│       ├── components/    # Shared React components (AuthGuard, DataTable, etc.)
│       ├── errors/        # DomainError, ConflictError, ValidationError
│       ├── helpers/       # tryCatch, exportToExcel, etc.
│       ├── hooks/         # Shared hooks (use-auth, use-permissions, etc.)
│       ├── result/        # Result<T,E> type + Ok/Err constructors
│       └── ui/            # shadcn/ui components (source of truth)
└── features/              # Business domain slices (one per domain)
    └── finanzas/egresos/  # Example feature structure:
        ├── actions/       # (sometimes at feature root)
        ├── components/    # React UI components
        ├── hooks/         # TanStack Query/Form wrappers
        ├── pages/         # Full page components (thin)
        ├── schemas/       # Client-side Zod schemas
        ├── server/
        │   ├── actions/   # "use server" — validate permissions, call service
        │   ├── dtos/      # Data Transfer Objects (server → client boundary)
        │   ├── mappers/   # Entity → DTO conversions
        │   ├── repositories/ # Interface + PrismaXxxRepository implementation
        │   ├── services/  # Business logic (uses repositories)
        │   └── validators/ # Server-side Zod schemas
        └── types/         # TypeScript types and interfaces
```

---

## Naming Conventions

| Entity | Pattern | Example |
|---|---|---|
| React component | PascalCase + `.tsx` | `CreateEgresoSheet.tsx` |
| Page component | PascalCase + `Page.tsx` | `EgresosTablePage.tsx` |
| Hook | `use` prefix + `.hook.ts` | `useCreateEgreso.hook.ts` |
| Server action file | camelCase + `Action.ts` | `createEgresoAction.ts` |
| Service class | PascalCase + `Service.service.ts` | `EgresoService.service.ts` |
| Repository interface | PascalCase + `Repository.repository.ts` | `EgresoRepository.repository.ts` |
| Repository impl | `Prisma` prefix | `PrismaEgresoRepository.repository.ts` |
| DTO type | PascalCase + `Dto.dto.ts` | `EgresoDto.dto.ts` |
| Mapper | camelCase + `Mapper.ts` | `egresoMapper.ts` |
| Zod schema | camelCase + `Schema.ts` | `createEgresoSchema.ts` |
| Factory function file | `make` prefix | `makeEgresoService.ts` |
| Type/interface file | PascalCase + `.type.ts` | `Egreso.type.ts` |
| Enum file | PascalCase + `.enum.ts` | `ColaboradorEstado.enum.ts` |

---

## Code Style Guidelines

### TypeScript
- **Strict mode is enabled** — no `any`, no implicit `undefined`, no untyped function params.
- Use `import type { ... }` for type-only imports.
- Prefer `type` aliases for DTOs and plain objects; `interface` for repository contracts.
- Validate all environment variables at startup via Zod in `src/core/shared/config/env.config.ts`.
- Prisma-generated types are the source of truth for DB shapes; extend them for domain entities.

### Imports Order (enforce manually / Prettier handles formatting)
1. Node built-ins
2. External packages (`next/cache`, `react`, `zod`, etc.)
3. Internal `@/core/...` imports
4. Internal `@/features/...` imports
5. Relative imports (`./`, `../`)

### React / Next.js
- All pages in `src/app/` are **async Server Components** — no logic, just data-fetch + render of feature page component.
- Client components must declare `"use client"` at the top.
- Server actions must declare `"use server"` at the top.
- Use shadcn/ui components from `@/core/shared/ui/` — never install new UI primitives without checking if shadcn already provides them.
- Use Lucide React for all icons.

### Formatting
- 2 spaces indentation (no tabs) — enforced by `.prettierrc`.
- Tailwind CSS for all styling. Use `cn()` from `@/core/lib/utils` to merge conditional classes.

---

## Error Handling

### Result Pattern (mandatory in services)
All service methods return `Result<T, Error>` — never throw except at the Server Action boundary.

```typescript
import { Ok, Err, Result } from "@/core/shared/result/result";

// In service
async create(data: CreateArgs): Promise<Result<EgresoEntity, Error>> {
  const exists = await this.repo.findByName(data.name);
  if (exists) return Err(new ConflictError("Ya existe un egreso con ese nombre"));
  const created = await this.repo.create(data);
  return Ok(created);
}

// In server action
const result = await service.create(input);
if (!result.ok) return { ok: false, error: result.error.message };
return { ok: true, data: toEgresoDto(result.value) };
```

### Domain Errors
Use typed errors from `@/core/shared/errors/domain.ts`:
- `DomainError` — base class with `code` field
- `ConflictError` — duplicate/already-exists scenarios
- `ValidationError` — bad input that passed Zod but failed business rules
- `PermissionError` — unauthorized access (thrown by permission guards)

### tryCatch Helper
Use the `tryCatch` helper from `@/core/shared/helpers/` to wrap async calls into `Result`:
```typescript
const result = await tryCatch(riskyAsyncOperation());
```

---

## RBAC & Permissions

Permissions format: `resource:action` (e.g. `egresos:crear`, `admin:all`).

- **Middleware** — route-level guard in `src/middleware.ts`
- **Server Actions** — call `requireAnyPermission([...])` from `@/core/lib/permissions/server-permissions-guard` at the start of every mutating action
- **UI** — wrap elements with `<PermissionGuard permission="egresos:crear">` or use `usePermissions()` hook

---

## Data Fetching Pattern

Pages are async Server Components that pre-fetch data, then hand it to a client page component:

```typescript
// src/app/(Dashboard)/(Finanzas)/egresos/page.tsx
const EgresosPage = async () => {
  const initialData = await makeEgresoService({ prisma }).getAll();
  return <EgresosTablePage tableData={initialData} />;
};
```

Client-side mutations go through TanStack Query hooks that call Server Actions directly — no `fetch`/REST calls.

---

## Dependency Injection

Services are never instantiated directly. Use factory functions to wire dependencies:

```typescript
// makeEgresoService.ts
export function makeEgresoService({ prisma }: { prisma: PrismaClient }) {
  const repo = new PrismaEgresoRepository(prisma);
  return new EgresoService(repo, prisma);
}
```

---

## Key Libraries

| Library | Purpose |
|---|---|
| Next.js 15 + Turbopack | Framework + bundler |
| Prisma 6 + PostgreSQL 17 | ORM + database |
| NextAuth v5 (beta) | Auth (JWT, credentials) |
| TanStack Query v5 | Server state & caching |
| TanStack Form v1 | Form state |
| TanStack Table v8 | Data tables |
| Zod v4 | Schema validation (client + server) |
| shadcn/ui + Radix UI | UI component library |
| Tailwind CSS v4 | Styling |
| Sonner v2 | Toast notifications |
| AWS SDK S3 | DigitalOcean Spaces file storage |
