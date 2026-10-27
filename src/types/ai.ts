export const aiConfigPurposes = ["CLASSIFICATION", "RESPONSE_DRAFT"] as const;
export type AiConfigPurpose = (typeof aiConfigPurposes)[number];

export type AiConfiguration = {
  purpose: AiConfigPurpose;
  model: string;
  systemPrompt: string;
  maxOutputTokens: number;
  enabled: boolean;
};
