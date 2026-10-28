"use client";

import { LoaderCircle, RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage, requestJson } from "@/lib/api-client";
import type { AiConfiguration, AiConfigPurpose } from "@/types/ai";

const copy: Record<AiConfigPurpose, { title: string; description: string }> = {
  CLASSIFICATION: {
    title: "Ticket classification",
    description:
      "Selects a category, priority, and confidence for new tickets.",
  },
  RESPONSE_DRAFT: {
    title: "Response drafting",
    description:
      "Drafts the next public reply from the complete ticket thread.",
  },
};

/** Lets administrators review, override, and restore AI workflow settings. */
export function AiSettingsForm({
  initialConfigurations,
}: {
  initialConfigurations: AiConfiguration[];
}) {
  const [configurations, setConfigurations] = useState(initialConfigurations);
  const [busy, setBusy] = useState<AiConfigPurpose | null>(null);

  function update(purpose: AiConfigPurpose, patch: Partial<AiConfiguration>) {
    setConfigurations((current) =>
      current.map((item) =>
        item.purpose === purpose ? { ...item, ...patch } : item,
      ),
    );
  }

  async function save(configuration: AiConfiguration) {
    setBusy(configuration.purpose);
    try {
      const result = await requestJson<{ configuration: AiConfiguration }>(
        "/api/admin/ai-config",
        { method: "PUT", json: configuration },
      );
      update(configuration.purpose, result.configuration);
      toast.success(`${copy[configuration.purpose].title} settings saved`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not save AI settings"));
    } finally {
      setBusy(null);
    }
  }

  async function reset(purpose: AiConfigPurpose) {
    setBusy(purpose);
    try {
      const result = await requestJson<{ configuration: AiConfiguration }>(
        `/api/admin/ai-config?purpose=${purpose}`,
        { method: "DELETE" },
      );
      update(purpose, result.configuration);
      toast.success("Default AI settings restored");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not reset AI settings"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {configurations.map((configuration) => {
        const isBusy = busy === configuration.purpose;
        const details = copy[configuration.purpose];

        return (
          <Card key={configuration.purpose}>
            <CardHeader>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <CardTitle>{details.title}</CardTitle>
                  <p className="mt-1 text-sm text-text-muted">
                    {details.description}
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={configuration.enabled}
                    onChange={(event) =>
                      update(configuration.purpose, {
                        enabled: event.target.checked,
                      })
                    }
                    className="size-4 accent-brand"
                  />
                  Enabled
                </label>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                <label className="text-sm font-semibold">
                  Model
                  <Input
                    className="mt-2"
                    value={configuration.model}
                    onChange={(event) =>
                      update(configuration.purpose, {
                        model: event.target.value,
                      })
                    }
                    placeholder="gpt-5.4-mini"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Max output tokens
                  <Input
                    className="mt-2"
                    type="number"
                    min={50}
                    max={4000}
                    value={configuration.maxOutputTokens}
                    onChange={(event) =>
                      update(configuration.purpose, {
                        maxOutputTokens: Number(event.target.value),
                      })
                    }
                  />
                </label>
              </div>
              <label className="block text-sm font-semibold">
                System prompt
                <Textarea
                  className="mt-2 min-h-44 font-mono text-xs leading-5"
                  value={configuration.systemPrompt}
                  onChange={(event) =>
                    update(configuration.purpose, {
                      systemPrompt: event.target.value,
                    })
                  }
                />
              </label>
              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => reset(configuration.purpose)}
                >
                  <RotateCcw size={16} />
                  Restore defaults
                </Button>
                <Button
                  type="button"
                  disabled={isBusy}
                  onClick={() => save(configuration)}
                >
                  {isBusy ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save settings
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
