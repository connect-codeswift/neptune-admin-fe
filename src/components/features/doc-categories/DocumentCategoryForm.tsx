"use client";

import { useId, useState } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { CheckBoxInput, TextInput } from "@/components/inputs";
import { Button } from "@/components/ui";

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
  const [color, setColor] = useState(DEFAULT_CATEGORY_COLOR);
  const [requiresApproval, setRequiresApproval] = useState(false);

  const handleCreate = () => {
    onSubmit?.();
    toast.success("Category created.");
    onCancel();
  };

  return (
    <DetailCard title="New Category">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TextInput
            label="Category Name"
            placeholder="e.g. Risk Assessment"
            required
          />
          <TextInput label="Description" placeholder="Short description" />
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
            label="Requires approval workflow"
            checked={requiresApproval}
            onChange={(event) => setRequiresApproval(event.target.checked)}
          />
          <TextInput label="Retention" placeholder="e.g. 7 years" />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            leftIcon="lucide:folder-plus"
            onClick={handleCreate}
          >
            Create Category
          </Button>
        </div>
      </div>
    </DetailCard>
  );
}
