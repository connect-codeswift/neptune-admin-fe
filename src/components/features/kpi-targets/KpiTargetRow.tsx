"use client";

import { useId, useState } from "react";
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

  const inputId = useId();
  const hintId = useId();
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

  // The metric's own explanation plus whichever message NumberInput is showing
  // under the field. Written as an if/else chain rather than nested ternaries
  // (S3358), and it has to name the same ids NumberInput derives from `inputId`.
  let describedBy = hintId;
  if (error) {
    describedBy = `${hintId} ${inputId}-error`;
  } else if (definition.unit) {
    describedBy = `${hintId} ${inputId}-helper`;
  }

  return (
    <div className="flex flex-col gap-3 border-b border-ehs-border-ink/8 py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1">
        {/* A real `<label>`, so the metric name is the field's name and clicking
            it puts the cursor in the box. */}
        <label htmlFor={inputId} className="text4 text-ehs-darker">
          {definition.label}
        </label>
        <p id={hintId} className="mt-0.5 text8 text-ehs-muted-text">
          {betterLabel}
          {definition.hint ? ` · ${definition.hint}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-start gap-2">
        <NumberInput
          id={inputId}
          aria-describedby={describedBy}
          value={draft}
          min={0}
          step="any"
          placeholder="No target"
          disabled={readOnly}
          error={error}
          // The unit sits under the field rather than only in the hint line, so
          // "12" is never ambiguous between days, counts and percentages.
          helperText={definition.unit}
          containerClassName="w-36"
          onChange={(event) => {
            setDraft(event.target.value);
          }}
        />

        {/* Save is always here and goes live when the value changes. It used to
            appear only once the field was dirty, so the row's controls moved
            under the cursor as you typed and there was nothing to aim at. */}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!canSave}
          loading={isSaving}
          loadingText="Saving…"
        >
          Save
        </Button>

        {!readOnly && savedId != null ? (
          <TextButton
            size="sm"
            className="h-9"
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
