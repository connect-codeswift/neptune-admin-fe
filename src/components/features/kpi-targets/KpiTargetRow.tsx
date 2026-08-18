"use client";

import { useState } from "react";
import { NumberInput } from "@/components/inputs";
import { Button, TextButton } from "@/components/ui";
import type { KpiMetricDefinition } from "./kpi-targets-catalog";

export type KpiTargetRowProps = Readonly<{
  definition: KpiMetricDefinition;
  /** The saved target, or null when this metric has none. */
  savedValue: number | null;
  /** Row id, needed to clear. Null when nothing is saved. */
  savedId: number | null;
  readOnly: boolean;
  isSaving: boolean;
  isClearing: boolean;
  onSave: (metric: string, targetValue: number) => void;
  onClear: (id: number) => void;
}>;

/** Empty input means "no target". `0` is a real target, so it must survive this. */
function toDraft(value: number | null): string {
  return value == null ? "" : String(value);
}

export function KpiTargetRow(props: Readonly<KpiTargetRowProps>) {
  const {
    definition,
    savedValue,
    savedId,
    readOnly,
    isSaving,
    isClearing,
    onSave,
    onClear,
  } = props;

  const [draft, setDraft] = useState(() => toDraft(savedValue));
  const [syncedValue, setSyncedValue] = useState(savedValue);

  // Re-sync when the server value changes (save, clear, or a site-switch refetch).
  // Adjusted during render rather than in an effect: an effect here would cascade a
  // second render and trips `react-hooks/set-state-in-effect`. This is the pattern
  // React documents for "adjusting state when a prop changes".
  if (syncedValue !== savedValue) {
    setSyncedValue(savedValue);
    setDraft(toDraft(savedValue));
  }

  const trimmed = draft.trim();
  const parsed = trimmed === "" ? null : Number(trimmed);
  const isNumeric = parsed != null && Number.isFinite(parsed);

  let error: string | undefined;
  if (trimmed !== "" && !isNumeric) {
    error = "Enter a number.";
  } else if (isNumeric && parsed < 0) {
    error = "Target cannot be negative.";
  }

  const isDirty = trimmed !== toDraft(savedValue);
  const canSave = !readOnly && isDirty && trimmed !== "" && !error && !isSaving;
  const betterLabel =
    definition.betterWhen === "lower" ? "Lower is better" : "Higher is better";

  function handleSave() {
    if (!canSave || parsed == null) return;
    onSave(definition.metric, parsed);
  }

  const describedBy = `kpi-${definition.metric}-hint`;

  return (
    <div className="border-muted/60 flex flex-col gap-3 border-b py-4 last:border-b-0 sm:flex-row sm:items-start sm:gap-6">
      <div className="min-w-0 flex-1">
        <p className="text6 text-darkest font-medium">{definition.label}</p>
        <p id={describedBy} className="text8 text-gray mt-0.5">
          {betterLabel} · {definition.unit}
          {definition.hint ? ` · ${definition.hint}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-start gap-2">
        <NumberInput
          aria-label={`${definition.label} target`}
          aria-describedby={describedBy}
          value={draft}
          min={0}
          step="any"
          placeholder="No target"
          disabled={readOnly}
          error={error}
          containerClassName="w-36"
          onChange={(event) => {
            setDraft(event.target.value);
          }}
        />

        {canSave ? (
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
        ) : null}

        {!readOnly && savedId != null && !isDirty ? (
          <TextButton
            size="sm"
            onClick={() => {
              onClear(savedId);
            }}
            disabled={isClearing}
          >
            {isClearing ? "Clearing…" : "Clear"}
          </TextButton>
        ) : null}
      </div>
    </div>
  );
}
