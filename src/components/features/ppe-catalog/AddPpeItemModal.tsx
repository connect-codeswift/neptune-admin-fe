"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  NumberInput,
  SelectInput,
  TextInput,
} from "@/components/inputs";
import { Button, Modal } from "@/components/ui";
import {
  getCategoryLabel,
  PPE_CATEGORY_OPTIONS,
  type PpeCategoryId,
} from "@/lib/dummy-ppe-catalog";

export type AddPpeItemDraft = {
  name: string;
  modelNumber: string;
  manufacturer: string;
  safetyStandard: string;
  categoryId: PpeCategoryId;
  minStockLevel: number;
};

const EMPTY_DRAFT: AddPpeItemDraft = {
  name: "",
  modelNumber: "",
  manufacturer: "",
  safetyStandard: "",
  categoryId: "eye-face",
  minStockLevel: 10,
};

type AddPpeItemModalProps = Readonly<{
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onAdd: (draft: AddPpeItemDraft, categoryLabel: string) => void | Promise<void>;
}>;

export function AddPpeItemModal({
  open,
  loading = false,
  onClose,
  onAdd,
}: AddPpeItemModalProps) {
  const [draft, setDraft] = useState<AddPpeItemDraft>(EMPTY_DRAFT);

  const categoryLabel = getCategoryLabel(draft.categoryId);

  const resetAndClose = () => {
    setDraft(EMPTY_DRAFT);
    onClose();
  };

  const handleAdd = async () => {
    if (!draft.name.trim()) {
      toast.error("Item name is required.");
      return;
    }

    await onAdd(draft, categoryLabel);
    setDraft(EMPTY_DRAFT);
  };

  return (
    <Modal
      open={open}
      title="Add New PPE Item"
      onClose={resetAndClose}
      hideFooter
      size="xl"
      closeOnBackdrop={!loading}
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TextInput
            label="Item Name"
            placeholder="e.g. 3M Safety Glasses"
            value={draft.name}
            onChange={(event) =>
              setDraft((current) => ({ ...current, name: event.target.value }))
            }
            required
          />
          <TextInput
            label="Model Number"
            placeholder="e.g. 11848-00000"
            value={draft.modelNumber}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                modelNumber: event.target.value,
              }))
            }
          />
          <TextInput
            label="Manufacturer"
            placeholder="e.g. 3M Safety"
            value={draft.manufacturer}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                manufacturer: event.target.value,
              }))
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TextInput
            label="Safety Standard"
            placeholder="e.g. ANSI Z87.1+"
            value={draft.safetyStandard}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                safetyStandard: event.target.value,
              }))
            }
          />
          <SelectInput
            label="Category"
            options={PPE_CATEGORY_OPTIONS}
            value={draft.categoryId}
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                categoryId: value as PpeCategoryId,
              }))
            }
          />
          <NumberInput
            label="Min Stock Level"
            min={0}
            value={String(draft.minStockLevel)}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                minStockLevel: Number(event.target.value) || 0,
              }))
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={resetAndClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            leftIcon="lucide:package-plus"
            loading={loading}
            loadingText="Adding…"
            onClick={handleAdd}
          >
            Add to Catalog
          </Button>
        </div>
      </div>
    </Modal>
  );
}
