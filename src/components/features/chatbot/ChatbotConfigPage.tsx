"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { NumberInput, SelectInput, TextAreaInput, ToggleInput } from "@/components/inputs";
import { PageHeader } from "@/components/layouts";
import { Button, KpiTrendCard } from "@/components/ui";
import {
  CHATBOT_USAGE_STATS,
  DEFAULT_CHATBOT_CONFIG,
  WRITING_FEATURE_META,
  WRITING_TONE_OPTIONS,
  type ChatbotConfig,
  type WritingFeatureId,
} from "@/lib/chatbot-config";

function FeatureCard({
  icon,
  label,
  description,
  enabled,
  disabled,
  onToggle,
}: Readonly<{
  icon: string;
  label: string;
  description: string;
  enabled: boolean;
  disabled?: boolean;
  onToggle: (enabled: boolean) => void;
}>) {
  return (
    <div className="rounded-2xl border border-darkest/8 bg-white/70 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-normal/12 text-blue-normal">
          <Icon icon={icon} width={20} height={20} aria-hidden />
        </div>
        <ToggleInput
          checked={enabled}
          disabled={disabled}
          onChange={onToggle}
          aria-label={`Toggle ${label}`}
        />
      </div>
      <p className="text5 font-semibold text-darkest">{label}</p>
      <p className="mt-1 text6 text-gray">{description}</p>
    </div>
  );
}

function AppPreview({ config }: Readonly<{ config: ChatbotConfig }>) {
  const activeFeatures = WRITING_FEATURE_META.filter(
    (feature) => config.features[feature.id].enabled,
  );

  return (
    <div className="rounded-2xl border border-darkest/10 bg-darkest/3 p-4">
      <p className="text7 font-semibold tracking-[0.5px] text-gray uppercase">
        In-app preview
      </p>
      <p className="mt-1 text6 text-gray">
        How the writing toolbar appears when a user selects text in a form field.
      </p>

      <div className="mt-4 rounded-xl border border-darkest/10 bg-white p-4 shadow-sm">
        <p className="text6 text-gray">Incident description</p>
        <p className="mt-2 text5 text-darkest">
          Worker sliped on wet floor near loading dock and reported minor bruising.
        </p>

        {config.enabled && activeFeatures.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-darkest/8 pt-3">
            {activeFeatures.map((feature) => (
              <span
                key={feature.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-normal/25 bg-blue-normal/10 px-3 py-1.5 text6 font-semibold text-blue-normal"
              >
                <Icon icon={feature.icon} width={14} height={14} aria-hidden />
                {feature.label}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 border-t border-darkest/8 pt-3 text6 text-gray">
            Writing assistant is off — no actions shown to users.
          </p>
        )}
      </div>
    </div>
  );
}

export function ChatbotConfigPage() {
  const [config, setConfig] = useState<ChatbotConfig>(DEFAULT_CHATBOT_CONFIG);

  const patchConfig = (patch: Partial<ChatbotConfig>) => {
    setConfig((current) => ({ ...current, ...patch }));
  };

  const toggleFeature = (featureId: WritingFeatureId, enabled: boolean) => {
    setConfig((current) => ({
      ...current,
      features: {
        ...current.features,
        [featureId]: { enabled },
      },
    }));
  };

  const enabledFeatureCount = WRITING_FEATURE_META.filter(
    (feature) => config.features[feature.id].enabled,
  ).length;

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Writing Assistant"
        description="Configure the in-app chatbot for paraphrasing, proofreading, and grammar correction across Neptune."
        breadcrumbs={[
          { label: "Super Admin", href: "/super/dashboard" },
          { label: "Writing Assistant" },
        ]}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon="lucide:refresh-cw"
              onClick={() => {
                setConfig(DEFAULT_CHATBOT_CONFIG);
                toast.success("Writing assistant reset to defaults.");
              }}
            >
              Reset Defaults
            </Button>
            <Button
              size="sm"
              leftIcon="lucide:check"
              onClick={() => toast.success("Writing assistant configuration saved.")}
            >
              Save Configuration
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiTrendCard
          label="Requests today"
          value={CHATBOT_USAGE_STATS.requestsToday.toLocaleString()}
          trendLabel={CHATBOT_USAGE_STATS.requestsTrend}
          trend="up"
          data={[820, 910, 980, 1050, 1120, 1200, 1284]}
        />
        <KpiTrendCard
          label="Active organizations"
          value={CHATBOT_USAGE_STATS.activeOrganizations}
          trendLabel="+2"
          trend="up"
          data={[12, 13, 14, 15, 16, 17, 18]}
        />
        <KpiTrendCard
          label="Most used action"
          value={CHATBOT_USAGE_STATS.topFeature}
          trendLabel="38%"
          trend="up"
          data={[30, 32, 34, 35, 36, 37, 38]}
        />
        <KpiTrendCard
          label="Avg. response time"
          value={`${CHATBOT_USAGE_STATS.avgLatencyMs} ms`}
          trendLabel="-40 ms"
          trend="down"
          data={[980, 960, 920, 900, 880, 860, 840]}
        />
      </div>

      <div className="rounded-[20px] border border-blue-normal/20 bg-blue-normal/8 px-5 py-4">
        <p className="text5 text-darkest">
          These settings control how the writing assistant behaves in the main
          Neptune app. Changes apply platform-wide after you save.
        </p>
      </div>

      <DetailCard
        title="Global Access"
        description="Turn the writing assistant on or off for every organization."
        action={
          <ToggleInput
            label="Enabled"
            checked={config.enabled}
            onChange={(enabled) => patchConfig({ enabled })}
          />
        }
      >
        <p className="text5 text-gray">
          When disabled, users will not see paraphrase, proofread, or grammar
          actions anywhere in the app.
        </p>
      </DetailCard>

      <DetailCard
        title="Writing Actions"
        description={`${enabledFeatureCount} of ${WRITING_FEATURE_META.length} actions enabled.`}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {WRITING_FEATURE_META.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              label={feature.label}
              description={feature.description}
              enabled={config.features[feature.id].enabled}
              disabled={!config.enabled}
              onToggle={(enabled) => toggleFeature(feature.id, enabled)}
            />
          ))}
        </div>
      </DetailCard>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        <DetailCard
          title="Behavior & Limits"
          description="Tune how requests are processed before they reach the language model."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberInput
              label="Max characters per request"
              min={500}
              max={20000}
              value={String(config.maxCharacters)}
              onChange={(event) =>
                patchConfig({
                  maxCharacters: Number(event.target.value) || 500,
                })
              }
              helperText="Text longer than this is truncated with a warning."
              disabled={!config.enabled}
            />
            <NumberInput
              label="Daily requests per user"
              min={0}
              value={String(config.dailyRequestLimit)}
              onChange={(event) =>
                patchConfig({
                  dailyRequestLimit: Number(event.target.value) || 0,
                })
              }
              helperText="0 means unlimited. Applies per licensed user."
              disabled={!config.enabled}
            />
            <SelectInput
              label="Default paraphrase tone"
              options={WRITING_TONE_OPTIONS}
              value={config.defaultTone}
              onChange={(defaultTone) =>
                patchConfig({
                  defaultTone: defaultTone as ChatbotConfig["defaultTone"],
                })
              }
              helperText="Users can override this in the paraphrase dialog."
              disabled={!config.enabled || !config.features.paraphrase.enabled}
              containerClassName="sm:col-span-2"
            />
          </div>

          <div className="mt-4">
            <TextAreaInput
              label="System instructions"
              rows={5}
              value={config.systemPrompt}
              onChange={(event) =>
                patchConfig({ systemPrompt: event.target.value })
              }
              helperText="Prepended to every writing-assistant request. Keep EHS and audit-trail context in mind."
              disabled={!config.enabled}
            />
          </div>
        </DetailCard>

        <DetailCard title="Preview">
          <AppPreview config={config} />
        </DetailCard>
      </div>
    </div>
  );
}
