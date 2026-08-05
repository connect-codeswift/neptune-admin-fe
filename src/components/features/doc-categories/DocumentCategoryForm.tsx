"use client";

import { useId, useState } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { CheckBoxInput, TextInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import { useCreateDocCategory } from "@/hooks/useDocCategories";

const DEFAULT_CATEGORY_COLOR = "#7c3aed";

type DocumentCategoryFormProps = Readonly<{
  onCancel: () => void;
  onSubmit?: () => void;
}>;

export function DocumentCategoryForm({
  onCancel,
  onSubmit,
}: DocumentCategoryFormProps) {
  const colorInputId = useId();
  const createMutation = useCreateDocCategory();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(DEFAULT_CATEGORY_COLOR);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [isRequired, setIsRequired] = useState(false);
  const [retentionDays, setRetentionDays] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        categorytName: name.trim(),
        description: description.trim() || null,
        color: color.trim() || null,
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
    <DetailCard title="New Category">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TextInput
            label="Category Name"
            placeholder="e.g. Risk Assessment"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <TextInput
            label="Description"
            placeholder="Short description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={colorInputId}
              className="text5 font-semibold text-darkest"
            >
              Color
            </label>
            <div className="flex items-center gap-2">
              <input
                id={colorInputId}
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="size-10 shrink-0 cursor-pointer rounded-[10px] border border-darkest/12 bg-white p-1"
                aria-label="Category color"
              />
              <TextInput
                value={color}
                onChange={(event) => setColor(event.target.value)}
                containerClassName="min-w-0 flex-1"
                aria-label="Category color hex value"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-end">
          <CheckBoxInput
            label="Required category"
            checked={isRequired}
            onChange={(event) => setIsRequired(event.target.checked)}
          />
          <CheckBoxInput
            label="Requires approval workflow"
            checked={requiresApproval}
            onChange={(event) => setRequiresApproval(event.target.checked)}
          />
          <TextInput
            label="Retention (days)"
            placeholder="e.g. 2555"
            value={retentionDays}
            onChange={(event) => setRetentionDays(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            leftIcon="lucide:folder-plus"
            onClick={() => void handleCreate()}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating…" : "Create Category"}
          </Button>
        </div>
      </div>
    </DetailCard>
  );
}
