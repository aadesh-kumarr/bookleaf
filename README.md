# BookLeaf Author Care

A full-stack Author Support & Communication Portal built for the BookLeaf Publishing technical assignment. It includes author and operations interfaces, database-backed ticket workflows, role-based access, near-real-time updates, AI-assisted triage, editable response drafts, and graceful no-AI fallback behavior.

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
- Five-second polling for near-real-time ticket updates

## Run locally

Requirements: Node.js 22.13+ and pnpm 11+.

```bash
pnpm install
copy .env.example .env
pnpm setup
pnpm dev
```

Open `http://localhost:3000`.

## Demo credentials

| Role | Email | Password |
|---|---|---|
| Author | `priya.sharma@email.com` | `bookleaf123` |
| Admin | `admin@bookleaf.test` | `admin123` |

All ten sample authors use `bookleaf123`; their emails come from `prisma/bookleaf_sample_data.json`.

## Configuration

Non-secret product, auth, AI, polling, feature, and BookLeaf theme settings live in `src/config/app.ts`. Secrets and deployment-specific values remain in environment variables:

| Variable | Required | Purpose |
|---|---:|---|
| `DATABASE_URL` | Yes | PostgreSQL connection URL |
| `AUTH_SECRET` | Yes | Long random value used to sign JWT sessions |
| `AUTH_COOKIE_SECURE` | Yes | `false` for local HTTP; set `true` on HTTPS deployment |
| `OPENAI_API_KEY` | No | Enables LLM classification and response drafting |
| `OPENAI_CLASSIFICATION_MODEL` | No | Defaults to `gpt-5.4-nano` for fast structured ticket triage |
| `OPENAI_RESPONSE_MODEL` | No | Defaults to `gpt-5.4-mini` for policy-grounded support drafts |

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
                    └──────── PostgreSQL
```

Important boundaries:

- `src/components/ui/`: shadcn-style primitives; feature components compose them.
- `src/config/app.ts`: one typed configuration source for non-secret settings.
- `src/lib/auth.ts`: session issue/verification and current-user lookup.
- `src/lib/ai.ts`: OpenAI calls, schemas, cost controls, and fallbacks.
- `src/lib/prompts.ts`: the complete classification and response prompt templates.
- `src/lib/knowledge-base.ts`: factual, category-specific policy context injected into prompts.
- `src/lib/utils/record-login-attempt.ts`: fail-safe database authentication audit writer.
- `src/app/api/`: REST resources and authorization.
- `prisma/schema.prisma`: normalized user, book, ticket, message, assignment, and note models.

## AI design

Classification uses Structured Outputs so category, priority, and confidence conform to a fixed schema. Only subject and description are sent for classification. Drafting selects one relevant knowledge-base section plus the specific book facts instead of sending the entire knowledge base or full conversation history. `store: false` is set on model calls.

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
| GET | `/api/admin/tickets` | Admin | Filtered queue via status/category/priority |
| POST | `/api/ai/draft` | Admin | Generate grounded, editable response draft |

## Verification

```bash
pnpm lint
pnpm build
```

Both commands pass on the delivered project.

## Deployment notes

For deployment, set `DATABASE_URL`, `AUTH_SECRET`, and optionally `OPENAI_API_KEY`, run migrations and seed only when appropriate, then deploy the Next.js app to Vercel/Render/Railway. Keep the repository private as required by the assignment.

## Known limitations / production evolution

- Polling is intentionally simple; production would use SSE or a managed pub/sub layer.
- Attachment control is UI-only per the brief; production would use signed uploads, malware scanning, file-size/type limits, and object storage.
- Local JWT auth would evolve to verified email login, password reset, audit trails, rate limiting, and stronger secret rotation.
- Production would add ticket/event audit tables, SLA timers, notifications, model evaluations, redaction, observability, and PostgreSQL migrations.

See `APPROACH.md` for the requested one-page write-up.
