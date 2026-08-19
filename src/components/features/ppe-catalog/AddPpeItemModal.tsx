"use client";

import { useState, type ReactNode } from "react";
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

/** Titled group inside the modal, so the six fields read as two decisions. */
function FieldGroup({
  legend,
  children,
}: Readonly<{ legend: string; children: ReactNode }>) {
  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="mb-3 text6 tracking-[0.5px] text-ehs-muted-text uppercase">
        {legend}
      </legend>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{children}</div>
    </fieldset>
  );
}

export function AddPpeItemModal({
  open,
  loading = false,
  onClose,
  onAdd,
}: AddPpeItemModalProps) {
  const [draft, setDraft] = useState<AddPpeItemDraft>(EMPTY_DRAFT);
  /** Errors only appear once the field has been left or a save attempted. */
  const [showErrors, setShowErrors] = useState(false);

  const categoryLabel = getCategoryLabel(draft.categoryId);
  const trimmedName = draft.name.trim();

  // The rule the toast used to state after the fact: a name is the only field
  // the catalog cannot render a row without.
  let nameError: string | undefined;
  if (showErrors && trimmedName === "") {
    nameError = "Give the item a name — it is what appears on the catalog card.";
  }

  const canSubmit = trimmedName !== "" && !loading;

  const resetAndClose = () => {
    setDraft(EMPTY_DRAFT);
    setShowErrors(false);
    onClose();
  };

  const handleAdd = async () => {
    if (trimmedName === "") {
      setShowErrors(true);
      return;
    }

    await onAdd(draft, categoryLabel);
    setDraft(EMPTY_DRAFT);
    setShowErrors(false);
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
        <FieldGroup legend="Item">
          <TextInput
            label="Item Name"
            placeholder="e.g. 3M Safety Glasses"
            value={draft.name}
            error={nameError}
            onChange={(event) =>
              setDraft((current) => ({ ...current, name: event.target.value }))
            }
            onBlur={() => setShowErrors(true)}
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
        </FieldGroup>

        <FieldGroup legend="Classification & stock">
          <TextInput
            label="Safety Standard"
            placeholder="e.g. ANSI Z87.1+"
            helperText="The standard printed on the item."
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
            helperText="Units. Below this the catalog flags the item as low stock."
            value={String(draft.minStockLevel)}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                minStockLevel: Number(event.target.value) || 0,
              }))
            }
          />
        </FieldGroup>

        {/* Right-aligned above a hairline, matching Modal's own footer, so a
            modal with a custom action row does not read as a different dialog. */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-ehs-border-ink/8 pt-4">
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
            disabled={!canSubmit}
            onClick={handleAdd}
          >
            Add to Catalog
          </Button>
        </div>
      </div>
    </Modal>
  );
}
