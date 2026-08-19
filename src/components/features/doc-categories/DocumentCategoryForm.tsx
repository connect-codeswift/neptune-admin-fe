"use client";

import { useId, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { CheckBoxInput, NumberInput, TextInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import { useCreateDocCategory } from "@/hooks/useDocCategories";

/**
 * A data value, not a class: it is written to `category.color` and handed to a
 * native colour input, both of which need a literal hex. It stays a hex on
 * purpose — the token palette cannot express a value the API stores.
 */
const DEFAULT_CATEGORY_COLOR = "#7c3aed";

/**
 * The presets are data too. Every one of them is a mid-tone chosen to stay
 * legible as a small dot on both the white light surface and the near-black
 * dark one; the ring drawn round each swatch below is what actually guarantees
 * the edge is visible either way, because a #64748b dot on a dark card is only
 * a little darker than the card.
 */
const CATEGORY_COLOR_PRESETS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "#7c3aed", label: "Purple" },
  { value: "#0891a6", label: "Teal" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#f97316", label: "Orange" },
  { value: "#ef4444", label: "Red" },
  { value: "#64748b", label: "Slate" },
];

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

type DocumentCategoryFormProps = Readonly<{
  onCancel: () => void;
  onSubmit?: () => void;
}>;

/** Titled group, so eight controls read as two decisions rather than a wall. */
function FieldGroup({
  legend,
  className = "",
  children,
}: Readonly<{ legend: string; className?: string; children: ReactNode }>) {
  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="mb-3 text6 tracking-[0.5px] text-ehs-muted-text uppercase">
        {legend}
      </legend>
      <div className={className}>{children}</div>
    </fieldset>
  );
}

export function DocumentCategoryForm({
  onCancel,
  onSubmit,
}: DocumentCategoryFormProps) {
  const colorInputId = useId();
  const swatchGroupId = useId();
  const createMutation = useCreateDocCategory();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(DEFAULT_CATEGORY_COLOR);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [isRequired, setIsRequired] = useState(false);
  const [retentionDays, setRetentionDays] = useState("");
  /** Errors stay quiet until the field is left or a create is attempted. */
  const [showErrors, setShowErrors] = useState(false);

  const trimmedName = name.trim();
  const trimmedColor = color.trim();
  const retentionNumber = retentionDays.trim() === "" ? null : Number(retentionDays);

  let nameError: string | undefined;
  if (showErrors && trimmedName === "") {
    nameError = "Give the category a name — it is what people file against.";
  }

  let colorError: string | undefined;
  if (trimmedColor !== "" && !HEX_PATTERN.test(trimmedColor)) {
    colorError = "Use a 6-digit hex value, e.g. #7c3aed.";
  }

  let retentionError: string | undefined;
  if (retentionNumber != null && !Number.isFinite(retentionNumber)) {
    retentionError = "Enter a number of days.";
  } else if (retentionNumber != null && retentionNumber < 0) {
    retentionError = "Retention cannot be negative.";
  }

  const hasErrors = Boolean(colorError) || Boolean(retentionError);
  const canCreate =
    trimmedName !== "" && !hasErrors && !createMutation.isPending;

  const handleCreate = async () => {
    if (trimmedName === "") {
      setShowErrors(true);
      return;
    }
    if (hasErrors) return;

    try {
      await createMutation.mutateAsync({
        categorytName: trimmedName,
        description: description.trim() || null,
        color: trimmedColor || null,
        isRequired,
        requiresApprovalWorkflow: requiresApproval,
        retentionDays: retentionDays ? Number(retentionDays) : null,
      });
      onSubmit?.();
      toast.success("Category created.");
      onCancel();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create category.",
      );
    }
  };

  return (
    <DetailCard
      title="New Category"
      description="Categories are what documents get filed against, so the name is the part people will read most."
    >
      <div className="flex flex-col gap-5">
        <FieldGroup
          legend="Identity"
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <TextInput
            label="Category Name"
            placeholder="e.g. Risk Assessment"
            required
            value={name}
            error={nameError}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => setShowErrors(true)}
          />
          <TextInput
            label="Description"
            placeholder="Short description"
            helperText="Shown under the name wherever the category is picked."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <div className="flex min-w-0 flex-col gap-1.5">
            <label
              htmlFor={colorInputId}
              className="text5 font-semibold text-darkest"
            >
              Colour
            </label>
            <div className="flex items-center gap-2">
              <input
                id={colorInputId}
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="size-12 shrink-0 cursor-pointer rounded-2.5 border border-ehs-border-ink/12 bg-ehs-surface p-1"
                aria-label="Category colour"
              />
              <TextInput
                value={color}
                error={colorError}
                onChange={(event) => setColor(event.target.value)}
                containerClassName="min-w-0 flex-1"
                aria-label="Category colour hex value"
              />
            </div>

            {/* Presets, because a colour picker on its own asks a question most
                admins do not want to answer. Each swatch carries a ring in the
                border-ink token, which is dark ink on light and light ink on
                dark — that is what keeps a dark swatch from vanishing into a
                dark card. */}
            <p id={swatchGroupId} className="text8 text-ehs-muted-text">
              Or pick a preset
            </p>
            <div
              role="group"
              aria-labelledby={swatchGroupId}
              className="flex flex-wrap gap-2"
            >
              {CATEGORY_COLOR_PRESETS.map((preset) => {
                const selected =
                  preset.value.toLowerCase() === trimmedColor.toLowerCase();

                let swatchClass =
                  "size-7 cursor-pointer rounded-full ring-1 ring-ehs-border-ink/25 transition outline-none hover:ring-ehs-border-ink/45 focus-visible:ring-2 focus-visible:ring-ehs-normal-blue";
                if (selected) {
                  swatchClass =
                    "size-7 cursor-pointer rounded-full ring-2 ring-ehs-normal-blue ring-offset-2 ring-offset-ehs-surface transition outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue";
                }

                return (
                  <button
                    key={preset.value}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${preset.label} (${preset.value})`}
                    title={`${preset.label} — ${preset.value}`}
                    className={swatchClass}
                    style={{ backgroundColor: preset.value }}
                    onClick={() => setColor(preset.value)}
                  />
                );
              })}
            </div>
          </div>
        </FieldGroup>

        <FieldGroup
          legend="Filing rules"
          className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start"
        >
          <CheckBoxInput
            label="Required category"
            helperText="Sites must have at least one document filed here."
            checked={isRequired}
            onChange={(event) => setIsRequired(event.target.checked)}
          />
          <CheckBoxInput
            label="Requires approval workflow"
            helperText="Uploads sit in review until an approver signs them off."
            checked={requiresApproval}
            onChange={(event) => setRequiresApproval(event.target.checked)}
          />
          <NumberInput
            label="Retention (days)"
            placeholder="e.g. 2555"
            min={0}
            helperText="Days to keep a document before it can be purged. Leave empty for no limit."
            value={retentionDays}
            error={retentionError}
            onChange={(event) => setRetentionDays(event.target.value)}
          />
        </FieldGroup>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ehs-border-ink/8 pt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={createMutation.isPending}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            leftIcon="lucide:folder-plus"
            onClick={() => void handleCreate()}
            disabled={!canCreate}
            loading={createMutation.isPending}
            loadingText="Creating…"
          >
            Create Category
          </Button>
        </div>
      </div>
    </DetailCard>
  );
}
