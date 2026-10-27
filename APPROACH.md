# Approach and trade-offs

I prioritised the complete support loop: an author can sign in, understand their book and royalty data, raise a ticket, and see replies; an operator can triage, override AI decisions, assign work, write private notes, draft a grounded response, and send it. The interface deliberately mirrors BookLeaf’s public visual language—coral calls-to-action, white space, pale blush surfaces, rounded shapes, and warm charcoal text—without copying the marketing site’s layout.

The highest-weighted evaluation area is AI integration, so it is treated as a bounded service rather than a decorative button. Classification has a strict output schema. Drafting receives the selected policy section and relevant book facts, not the full knowledge base or every historical message. Stable instructions and category policy appear before changing ticket content, enabling OpenAI prompt-prefix caching with stable cache keys and model-compatible retention. AI settings use a shared Redis cache with DB-backed misses, write-through admin updates, and a five-minute recovery TTL. This reduces database reads, input-token cost, and latency without making Redis the source of truth. The API key never reaches the browser. If Redis or the model is unavailable, PostgreSQL and deterministic AI fallbacks keep the workflow usable. Human review is mandatory before sending.

PostgreSQL and Prisma provide a normalized persistence layer. The assignment’s exact 10-author, 18-book JSON dataset is imported by the setup command, alongside representative tickets needed to exercise the complete workflow. A ticket stores both AI suggestions and current values, so operator overrides remain visible and auditable. Public responses and internal notes share a message model but are filtered at the API boundary, preventing author access to private notes.

For real-time behavior I use an authenticated Vercel Function WebSocket route.
Redis Streams fan out small invalidation events across Function instances; the
event contains no ticket content, and each client refetches the role-scoped REST
resource from PostgreSQL. One socket is shared per browser tab and reconnects
with exponential backoff. Attachment selection is represented in the query form,
while actual upload remains out of scope as allowed by the assignment.

The UI uses a feature-based component structure with shared shadcn-style primitives. Admin, author, and authentication components are isolated under `src/features`; shared layout and primitive components live under `src/components`. All color and shadow values are semantic tokens in `src/app/globals.css`, while `src/config/app.ts` contains only browser-safe product metadata. Environment variables remain the only home for secrets. The implementation intentionally stops at the assignment boundary.
