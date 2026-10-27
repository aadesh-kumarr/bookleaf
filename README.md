# BookLeaf Author Care

A full-stack Author Support & Communication Portal built for the BookLeaf Publishing technical assignment. It includes author and operations interfaces, database-backed ticket workflows, role-based access, real-time updates, AI-assisted triage, editable response drafts, and graceful no-AI fallback behavior.

## What the assignment requires

- Author portal: email/password login, private book and royalty data, support-query creation, attachments UI, ticket history, and near-real-time responses.
- Admin portal: filterable ticket queue, urgency/age visibility, AI category and priority suggestions with overrides, editable AI drafts, assignment, statuses, public replies, and private notes.
- API: REST endpoints, auth on every protected route, author-level ownership checks, admin role checks, input validation, and meaningful errors.
- AI: knowledge-base grounded writing, secure server-only API key, useful fallback during outages/rate limits, and token-conscious context selection.
- Submission: private source repository, deployed demo, setup documentation, test credentials, API reference, and a one-page approach note.

The database is not optional in practice: persistent authors, books, tickets, messages, assignments, internal notes, status history, and login audits are core requirements. This project uses PostgreSQL through Prisma.

## Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- shadcn component structure with Radix Slot, CVA, `cn()`, and reusable UI primitives
- Prisma 6 + PostgreSQL
- JWT sessions in secure HTTP-only cookies, bcrypt password hashes
- Zod input validation
- OpenAI Responses API with Structured Outputs for classification
- Vercel Functions WebSockets with Redis Stream fan-out

## Run locally

Requirements: Node.js 22.13+, pnpm 11+, PostgreSQL, and a Redis-compatible service.

```bash
pnpm install
# Create .env from .env.example and enter your service credentials.
pnpm setup
pnpm dev
```

Open the URL printed by `vercel dev`. WebSocket upgrades require the Vercel
development runtime. `REDIS_URL` must be an ioredis-compatible TCP/TLS URL
(`redis://` or `rediss://`), not a REST-only endpoint.

`pnpm setup` provisions the Prisma schema and imports the exact assignment
dataset (10 authors and 18 books), plus representative support tickets.

## Demo credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@bookleaf.test` | `admin123` |
| Author | `priya.sharma@email.com` | `bookleaf123` |

These accounts are for the private assignment demo only. The seed command
refuses to replace production data unless `ALLOW_DEMO_SEED=true` is explicitly
set.

## Configuration

Browser-safe product settings live in
`src/config/app.ts`. The complete semantic color and shadow system lives in
`src/app/globals.css`. Server auth and AI configuration lives in
`src/config/server.ts`. Secrets and deployment-specific values remain in
environment variables:

| Variable | Required | Purpose |
|---|---:|---|
| `DATABASE_URL` | Yes | PostgreSQL connection URL |
| `AUTH_SECRET` | Yes | Long random value used to sign JWT sessions |
| `REDIS_URL` | Yes | Redis connection used for WebSocket fan-out and the shared AI-configuration cache |
| `OPENAI_API_KEY` | No | Enables LLM classification and response drafting |
| `OPENAI_CLASSIFICATION_MODEL` | No | Defaults to `gpt-5.4-nano` for fast structured ticket triage |
| `OPENAI_RESPONSE_MODEL` | No | Defaults to `gpt-5.4-mini` for policy-grounded support drafts |
| `AI_USAGE_LOGGING` | No | Set to `true` to log aggregate input and prompt-cache token counts; no prompt content is logged |

Production session cookies automatically use the `Secure` flag and the
`__Host-` prefix. Configure Vercel Firewall rules with the IDs `auth-login`,
`ai-draft`, and `ticket-create`; the guarded handlers fail closed when a
production rule is missing or unavailable.

Without `OPENAI_API_KEY`, the app remains fully usable. Deterministic rules classify tickets and a policy-grounded template provides the admin draft.

## Architecture

```text
Browser
  ├─ Author portal ─┐
  └─ Admin portal  ─┼─ Next.js REST route handlers
                    │    ├─ JWT auth + role/ownership checks
                    │    ├─ Zod validation
                    │    ├─ AI service + deterministic fallback
                    │    └─ Prisma data access
                    ├─ Authenticated WebSocket route ─ Redis Stream
                    └─────────────────────────────── PostgreSQL
```

Important boundaries:

- `src/features/admin/`: admin-only components and feature-owned types.
- `src/features/author/`: author ticket and submission components.
- `src/features/auth/`: authentication UI.
- `src/components/layout/`: shared portal shells, branding, and error states.
- `src/components/ui/`: small reusable UI primitives; feature components compose them.
- `src/hooks/use-realtime-events.ts`: shared browser subscription hook backed by one reconnecting socket per tab.
- `src/proxy.ts`: early authentication gate for the protected author and admin route trees.
- `src/app/globals.css`: the only source of UI color and shadow values; components use semantic Tailwind tokens.
- `src/config/app.ts`: one typed configuration source for non-secret settings.
- `src/lib/auth.ts`: session issue/verification and current-user lookup.
- `src/lib/ai.ts`: OpenAI calls, schemas, cost controls, and fallbacks.
- `src/lib/ai-config.ts`: cache-aside AI settings with DB-backed misses, write-through updates, and a five-minute Redis safety TTL.
- `src/lib/prompts.ts`: the complete classification and response prompt templates.
- `src/lib/knowledge-base.ts`: factual, category-specific policy context injected into prompts.
- `src/lib/record-login-attempt.ts`: fail-safe database authentication audit writer.
- `src/lib/realtime.ts`: targeted server event delivery and Redis Stream fan-out.
- `src/app/api/`: REST resources and authorization.
- `prisma/schema.prisma`: normalized user, book, ticket, message, assignment, and note models.

## AI design

Classification uses Structured Outputs so category, priority, and confidence conform to a fixed schema. Only subject and description are sent for classification. Drafting selects one relevant knowledge-base section plus the specific book facts instead of sending the entire knowledge base or full conversation history. Stable prompt prefixes use purpose/category cache keys and model-compatible OpenAI prompt-cache retention; dynamic ticket content remains at the end. `store: false` is set on model calls.

AI configuration reads use Redis first and query PostgreSQL only on a cache
miss. Admin updates commit to PostgreSQL before refreshing Redis, so PostgreSQL
remains the source of truth. The TTL bounds stale data if an external/manual DB
change bypasses the application update endpoint.

The admin must review and click Send; AI never sends a response autonomously. API errors, missing keys, or rate limits fall back cleanly and never block ticket creation.

## REST API

All errors use `{ "error": { "message": string, "details"?: unknown } }`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Create HTTP-only session |
| POST | `/api/auth/logout` | Signed in | Clear session |
| GET | `/api/me` | Signed in | Current user |
| GET | `/api/books` | Signed in | Author’s books; admins can read all |
| GET | `/api/tickets` | Signed in | Role-scoped tickets |
| POST | `/api/tickets` | Author | Create, classify, and prioritize ticket |
| GET | `/api/tickets/:id` | Owner/Admin | Ticket and visible messages |
| PATCH | `/api/tickets/:id` | Admin | Status/category/priority/assignment |
| POST | `/api/tickets/:id/responses` | Owner/Admin | Public response or admin-only note |
| POST | `/api/tickets/:id/read` | Owner/Admin | Mark visible incoming messages as read |
| GET | `/api/admin/tickets` | Admin | Filtered queue via status/category/priority |
| GET | `/api/notifications` | Signed in | Role-scoped unread message count |
| GET (upgrade) | `/api/realtime` | Signed in | Authenticated ticket/notification WebSocket events |
| POST | `/api/ai/draft` | Admin | Generate grounded, editable response draft |
| GET | `/api/admin/ai-config` | Admin | Read classification and drafting configuration |
| PUT | `/api/admin/ai-config` | Admin | Save one AI configuration |
| DELETE | `/api/admin/ai-config` | Admin | Restore one AI configuration to its default |

## Verification

```bash
pnpm lint
pnpm build
```

Both commands pass on the delivered project.

## Deployment notes

For deployment, set `DATABASE_URL`, `AUTH_SECRET`, `REDIS_URL`, and optionally
`OPENAI_API_KEY`; provision the schema, then deploy the Next.js app to Vercel.
The socket reconnects with exponential backoff when Vercel rotates a Function
instance. Keep the repository private as required by the assignment.

## Assignment scope boundaries

- Ticket updates use authenticated Vercel WebSockets. Events contain only ticket IDs; clients refetch authorized REST resources and PostgreSQL remains the source of truth.
- Attachment selection is UI-only, as permitted by the brief; selected files are not uploaded.

See `APPROACH.md` for the requested one-page write-up.
