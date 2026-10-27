import { AiSettingsForm } from "@/features/admin/components/ai-settings-form";
import { getAllAiConfigurations } from "@/lib/ai-config";

export default async function AiSettingsPage() {
  const configurations = await getAllAiConfigurations();

  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-semibold text-brand-strong">
          AI administration
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
          Models and prompts
        </h1>
        <p className="mt-3 max-w-3xl text-text-muted">
          Control the model, system prompt, token budget, and availability for
          each AI workflow. API credentials remain protected in environment
          variables.
        </p>
      </div>
      <AiSettingsForm initialConfigurations={configurations} />
    </>
  );
}
