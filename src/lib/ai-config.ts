import "server-only";

import { serverConfig } from "@/config/server";
import { db } from "@/lib/db";
import { defaultPrompts } from "@/lib/prompts";
import { getRedisClient } from "@/lib/redis";
import {
  aiConfigPurposes,
  type AiConfiguration,
  type AiConfigPurpose,
} from "@/types/ai";

const aiConfigurationCacheTtlSeconds = 300;

function cacheKey(purpose: AiConfigPurpose) {
  return `bookleaf:ai-config:v1:${purpose}`;
}

function toAiConfiguration(configuration: AiConfiguration): AiConfiguration {
  return {
    purpose: configuration.purpose,
    model: configuration.model,
    systemPrompt: configuration.systemPrompt,
    maxOutputTokens: configuration.maxOutputTokens,
    enabled: configuration.enabled,
  };
}

function parseCachedConfiguration(
  value: string | null,
  purpose: AiConfigPurpose,
): AiConfiguration | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<AiConfiguration>;
    return parsed.purpose === purpose &&
      typeof parsed.model === "string" &&
      typeof parsed.systemPrompt === "string" &&
      typeof parsed.maxOutputTokens === "number" &&
      typeof parsed.enabled === "boolean"
      ? (parsed as AiConfiguration)
      : null;
  } catch {
    return null;
  }
}

/** Writes one canonical AI setting to the shared Redis cache when available. */
export async function cacheAiConfiguration(
  configuration: AiConfiguration,
) {
  const redis = getRedisClient();
  if (!redis) return;
  try {
    await redis.set(
      cacheKey(configuration.purpose),
      JSON.stringify(toAiConfiguration(configuration)),
      "EX",
      aiConfigurationCacheTtlSeconds,
    );
  } catch (error) {
    console.error("Unable to refresh the AI configuration cache.", error);
  }
}

/** Provides environment-backed defaults when no database override exists. */
export const defaultAiConfigurations: Record<
  AiConfigPurpose,
  AiConfiguration
> = {
  CLASSIFICATION: {
    purpose: "CLASSIFICATION",
    model: "gpt-5.4-nano",
    systemPrompt: defaultPrompts.classification,
    maxOutputTokens: serverConfig.ai.classificationMaxTokens,
    enabled: true,
  },
  RESPONSE_DRAFT: {
    purpose: "RESPONSE_DRAFT",
    model: "gpt-5.4-mini",
    systemPrompt: defaultPrompts.responseDraft,
    maxOutputTokens: serverConfig.ai.responseMaxTokens,
    enabled: true,
  },
};

/** Resolves one AI setting from Redis, falling back to PostgreSQL and defaults. */
export async function getAiConfiguration(
  purpose: AiConfigPurpose,
): Promise<AiConfiguration> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const cached = parseCachedConfiguration(
        await redis.get(cacheKey(purpose)),
        purpose,
      );
      if (cached) return cached;
    } catch (error) {
      console.error("Unable to read the AI configuration cache.", error);
    }
  }

  const stored = await db.aiConfiguration.findUnique({ where: { purpose } });
  const configuration = toAiConfiguration(
    stored ?? defaultAiConfigurations[purpose],
  );
  await cacheAiConfiguration(configuration);
  return configuration;
}

/** Loads every editable AI setting for the administration interface. */
export async function getAllAiConfigurations() {
  return Promise.all(aiConfigPurposes.map(getAiConfiguration));
}
