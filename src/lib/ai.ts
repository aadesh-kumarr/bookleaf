import "server-only";

import OpenAI from "openai";
import type { TicketCategory, TicketPriority } from "@prisma/client";
import { categories, priorities } from "@/lib/constants";
import { getKnowledge } from "@/lib/knowledge-base";
import { serverConfig } from "@/config/server";
import { classificationPrompt, responsePrompt } from "@/lib/prompts";
import { getAiConfiguration } from "@/lib/ai-config";

type Classification = {
  category: TicketCategory;
  priority: TicketPriority;
  confidence: number;
  source: "ai" | "fallback";
};

function promptCacheSettings(model: string, key: string) {
  const version = model.match(/^gpt-(\d+)(?:\.(\d+))?/);
  const major = Number(version?.[1] ?? 0);
  const minor = Number(version?.[2] ?? 0);

  if (major > 5 || (major === 5 && minor >= 6)) {
    return {
      prompt_cache_key: key,
      prompt_cache_options: { mode: "implicit" as const, ttl: "30m" as const },
    };
  }

  if (/^gpt-(?:5(?:\.[1-5])?|4\.1)(?:-|$)/.test(model)) {
    return {
      prompt_cache_key: key,
      prompt_cache_retention: "24h" as const,
    };
  }

  return { prompt_cache_key: key };
}

function logPromptCacheUsage(
  purpose: "CLASSIFICATION" | "RESPONSE_DRAFT",
  usage:
    | {
        input_tokens: number;
        input_tokens_details: { cached_tokens: number };
      }
    | null
    | undefined,
) {
  if (!serverConfig.ai.logUsage || !usage) return;
  console.info("AI prompt cache usage", {
    purpose,
    inputTokens: usage.input_tokens,
    cachedTokens: usage.input_tokens_details.cached_tokens,
  });
}

function fallbackClassification(text: string): Classification {
  const value = text.toLowerCase();
  let category: TicketCategory = "GENERAL_INQUIRY";
  if (/royalt|payment|payout|bank|money|paid/.test(value))
    category = "ROYALTY_PAYMENTS";
  else if (/isbn|metadata|description|author bio/.test(value))
    category = "ISBN_METADATA";
  else if (/print|binding|misprint|blurry|colour|color|pages/.test(value))
    category = "PRINTING_QUALITY";
  else if (/amazon|flipkart|unavailable|listing|distribution|stock/.test(value))
    category = "DISTRIBUTION_AVAILABILITY";
  else if (/production|typeset|cover|proof|status|publish/.test(value))
    category = "BOOK_STATUS_PRODUCTION";

  let priority: TicketPriority = "LOW";
  if (
    /wrong isbn|duplicate isbn|legal|fraud|six months|6 months|never received|urgent/.test(
      value,
    )
  )
    priority = "CRITICAL";
  else if (/overdue|quality|defect|wrong|months|missing payment/.test(value))
    priority = "HIGH";
  else if (category !== "GENERAL_INQUIRY") priority = "MEDIUM";
  return { category, priority, confidence: 0.7, source: "fallback" };
}

function client() {
  return process.env.OPENAI_API_KEY
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        maxRetries: 1,
        timeout: 20_000,
      })
    : null;
}

/** Classifies a new ticket with structured AI output and deterministic fallback rules. */
export async function classifyTicket(
  subject: string,
  description: string,
): Promise<Classification> {
  const fallback = fallbackClassification(`${subject}\n${description}`);
  const openai = client();
  if (!openai) return fallback;
  try {
    const config = await getAiConfiguration("CLASSIFICATION");
    if (!config.enabled) return fallback;
    const response = await openai.responses.create({
      model: config.model,
      ...promptCacheSettings(
        config.model,
        "bookleaf:classification:v1",
      ),
      reasoning: { effort: serverConfig.ai.reasoningEffort },
      instructions: config.systemPrompt,
      input: classificationPrompt.input(subject, description),
      text: {
        format: {
          type: "json_schema",
          name: "ticket_classification",
          strict: true,
          schema: {
            type: "object",
            properties: {
              category: { type: "string", enum: [...categories] },
              priority: { type: "string", enum: [...priorities] },
              confidence: { type: "number", minimum: 0, maximum: 1 },
            },
            required: ["category", "priority", "confidence"],
            additionalProperties: false,
          },
        },
      },
      max_output_tokens: config.maxOutputTokens,
      store: false,
    });
    logPromptCacheUsage("CLASSIFICATION", response.usage);
    const parsed = JSON.parse(response.output_text);
    return { ...parsed, source: "ai" } as Classification;
  } catch (error) {
    console.error("AI classification unavailable; using fallback", error);
    return fallback;
  }
}

type DraftInput = {
  category: TicketCategory;
  subject: string;
  description: string;
  authorName: string;
  book?: {
    title: string;
    status: string;
    royaltyPending: number;
    lastRoyaltyPayoutDate: Date | null;
  } | null;
  conversation: Array<{
    body: string;
    createdAt: Date;
    sender: { name: string; role: "AUTHOR" | "ADMIN" };
  }>;
};

function fallbackDraft(input: DraftInput) {
  const firstName = input.authorName.split(" ")[0];
  const timeline =
    input.category === "PRINTING_QUALITY"
      ? "5–7 business days after verification"
      : input.category === "DISTRIBUTION_AVAILABILITY"
        ? "24–48 hours"
        : input.category === "ISBN_METADATA"
          ? "within 48 hours"
          : "within 2 business days";
  const bookContext = input.book
    ? `For ${input.book.title}, the current recorded status is ${input.book.status}.`
    : "I’ve reviewed this as an account-level query.";
  return `Hi ${firstName},\n\nThank you for bringing this to our attention. I understand why this is concerning, and we’ll help you get a clear resolution. ${bookContext}\n\nBased on our ${input.category.replaceAll("_", " ").toLowerCase()} policy, our team will review the relevant records before confirming the next action. We expect to update you ${timeline}. If we need any supporting details, we’ll contact you here so everything stays together.\n\nNext step: we’ll begin the review now and post the outcome on this ticket.\n\nWarmly,\nBookLeaf Author Support`;
}

/** Streams a grounded support draft while preserving a safe non-AI fallback. */
export async function* streamDraftResponse(input: DraftInput) {
  const context = getKnowledge(input.category);
  const bookContext = input.book
    ? `Book: ${input.book.title}; current status: ${input.book.status}; pending royalty: ₹${input.book.royaltyPending}; last payout: ${input.book.lastRoyaltyPayoutDate?.toISOString().slice(0, 10) ?? "none"}.`
    : "This is an account-level query.";
  const conversationContext = input.conversation.length
    ? input.conversation
        .map((message, index) => {
          const source =
            message.sender.role === "ADMIN"
              ? `BOOKLEAF RESPONSE by ${message.sender.name}`
              : `AUTHOR REPLY by ${message.sender.name}`;
          return `${index + 1}. [${message.createdAt.toISOString()}] ${source}: ${message.body}`;
        })
        .join("\n")
    : "No follow-up messages yet.";
  const openai = client();
  if (openai) {
    let emitted = false;
    try {
      const config = await getAiConfiguration("RESPONSE_DRAFT");
      if (!config.enabled) {
        yield fallbackDraft(input);
        return;
      }
      const prompt = responsePrompt({
        category: input.category,
        authorName: input.authorName,
        subject: input.subject,
        description: input.description,
        bookContext,
        knowledgeContext: context,
        conversationContext,
        systemPrompt: config.systemPrompt,
      });
      const stream = await openai.responses.create({
        model: config.model,
        ...promptCacheSettings(
          config.model,
          `bookleaf:response-draft:v1:${input.category}`,
        ),
        reasoning: { effort: serverConfig.ai.reasoningEffort },
        instructions: prompt.instructions,
        input: prompt.input,
        max_output_tokens: config.maxOutputTokens,
        store: false,
        stream: true,
      });
      for await (const event of stream) {
        if (event.type === "response.output_text.delta") {
          emitted = true;
          yield event.delta;
        } else if (event.type === "response.completed") {
          logPromptCacheUsage("RESPONSE_DRAFT", event.response.usage);
        }
      }
      if (emitted) return;
    } catch (error) {
      console.error("AI drafting unavailable; using fallback", error);
      if (emitted) return;
    }
  }
  yield fallbackDraft(input);
}
