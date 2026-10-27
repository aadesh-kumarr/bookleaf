import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api";
import { authorizeRequest } from "@/lib/authorization";
import {
  cacheAiConfiguration,
  defaultAiConfigurations,
  getAllAiConfigurations,
} from "@/lib/ai-config";
import { db } from "@/lib/db";
import { aiConfigPurposes } from "@/types/ai";

const configurationSchema = z.object({
  purpose: z.enum(aiConfigPurposes),
  model: z.string().trim().min(2).max(100),
  systemPrompt: z.string().trim().min(20).max(12_000),
  maxOutputTokens: z.number().int().min(50).max(4_000),
  enabled: z.boolean(),
});

export async function GET(request: NextRequest) {
  const authorization = await authorizeRequest(request, "ADMIN");
  if (!authorization.ok) return authorization.response;

  return NextResponse.json({ configurations: await getAllAiConfigurations() });
}

export async function PUT(request: NextRequest) {
  const authorization = await authorizeRequest(request, "ADMIN");
  if (!authorization.ok) return authorization.response;

  const parsed = configurationSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return apiError("Enter a valid model, prompt, and token limit.", 422);
  }

  const { purpose, ...data } = parsed.data;
  const configuration = await db.aiConfiguration.upsert({
    where: { purpose },
    create: { purpose, ...data },
    update: data,
  });
  await cacheAiConfiguration(configuration);

  return NextResponse.json({ configuration });
}

export async function DELETE(request: NextRequest) {
  const authorization = await authorizeRequest(request, "ADMIN");
  if (!authorization.ok) return authorization.response;

  const parsedPurpose = z
    .enum(aiConfigPurposes)
    .safeParse(request.nextUrl.searchParams.get("purpose"));
  if (!parsedPurpose.success) {
    return apiError("A valid AI configuration purpose is required.", 422);
  }

  const purpose = parsedPurpose.data;
  await db.aiConfiguration.deleteMany({ where: { purpose } });
  const configuration = defaultAiConfigurations[purpose];
  await cacheAiConfiguration(configuration);
  return NextResponse.json({ configuration });
}
