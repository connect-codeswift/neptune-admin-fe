export type WritingFeatureId = "paraphrase" | "proofread" | "grammar";

export type WritingTone = "formal" | "neutral" | "concise";

export type WritingFeatureConfig = {
  enabled: boolean;
};

export type ChatbotConfig = {
  /** Master switch for the in-app writing assistant. */
  enabled: boolean;
  features: Record<WritingFeatureId, WritingFeatureConfig>;
  /** Max characters the user can send per request. */
  maxCharacters: number;
  /** Soft cap on assistant requests per user per day (0 = unlimited). */
  dailyRequestLimit: number;
  /** Default tone applied when paraphrasing. */
  defaultTone: WritingTone;
  /** Extra instructions prepended to every writing-assistant request. */
  systemPrompt: string;
};

export const WRITING_FEATURE_META: {
  id: WritingFeatureId;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "paraphrase",
    label: "Paraphrase",
    description:
      "Reword selected text while preserving meaning — useful for reports and incident narratives.",
    icon: "lucide:refresh-cw",
  },
  {
    id: "proofread",
    label: "Proofread",
    description:
      "Fix typos, punctuation, and awkward phrasing without changing the overall message.",
    icon: "lucide:spell-check",
  },
  {
    id: "grammar",
    label: "Grammar correction",
    description:
      "Correct grammar, tense, and sentence structure across safety forms and free text.",
    icon: "lucide:text-cursor-input",
  },
];

export const WRITING_TONE_OPTIONS: { value: WritingTone; label: string }[] = [
  { value: "neutral", label: "Neutral" },
  { value: "formal", label: "Formal" },
  { value: "concise", label: "Concise" },
];

export const DEFAULT_CHATBOT_CONFIG: ChatbotConfig = {
  enabled: true,
  features: {
    paraphrase: { enabled: true },
    proofread: { enabled: true },
    grammar: { enabled: true },
  },
  maxCharacters: 4000,
  dailyRequestLimit: 50,
  defaultTone: "neutral",
  systemPrompt:
    "You are Neptune's writing assistant for environmental, health, and safety professionals. Keep responses factual, professional, and suitable for audit trails. Do not invent hazards, incidents, or regulatory citations.",
};

export const CHATBOT_USAGE_STATS = {
  requestsToday: 1284,
  requestsTrend: "+12%",
  activeOrganizations: 18,
  topFeature: "Proofread" as const,
  avgLatencyMs: 840,
};
