"use client";

import { useState } from "react";
import { NumberInput, TextInput } from "@/components/inputs";
import { Modal } from "@/components/ui";

export type SetOrganizationLimitsModalProps = Readonly<{
  open: boolean;
  companyName: string;
  initialMaxSeats?: number | null;
  initialMaxSites?: number | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (values: {
    maxSeats: number | null;
    maxSites: number | null;
    note: string | null;
  }) => void;
}>;

function parseOptionalLimit(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.toLowerCase() === "unlimited") {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : NaN;
}

export function SetOrganizationLimitsModal({
  open,
  companyName,
  initialMaxSeats = null,
  initialMaxSites = null,
  loading = false,
  onClose,
  onConfirm,
}: SetOrganizationLimitsModalProps) {
  const [maxSeats, setMaxSeats] = useState(
    initialMaxSeats == null ? "" : String(initialMaxSeats),
  );
  const [maxSites, setMaxSites] = useState(
    initialMaxSites == null ? "" : String(initialMaxSites),
  );
  const [note, setNote] = useState("");

  const parsedSeats = parseOptionalLimit(maxSeats);
  const parsedSites = parseOptionalLimit(maxSites);
  const isValid =
    !Number.isNaN(parsedSeats) &&
    !Number.isNaN(parsedSites) &&
    (parsedSeats != null || parsedSites != null);

  return (
    <Modal
      open={open}
      title="Set Organization Limits"
      size="md"
      secondaryLabel="Cancel"
      onSecondary={onClose}
      onClose={onClose}
      primaryLabel="Save Limits"
      disabled={!isValid}
      loading={loading}
      onPrimary={() => {
        if (!isValid) return;
        onConfirm({
          maxSeats: parsedSeats,
          maxSites: parsedSites,
          note: note.trim() || null,
        });
      }}
    >
      <div className="flex flex-col gap-4">
        <p className="text5 text-gray">
          Set seat and site caps for {companyName}. Leave blank or type
          &quot;unlimited&quot; for no cap on that dimension. At least one cap
          must be set, or use Clear limits to remove both.
        </p>
        <NumberInput
          label="Max seats"
          min={1}
          step={1}
          value={maxSeats}
          onChange={(event) => setMaxSeats(event.target.value)}
          placeholder="Unlimited"
          error={
            maxSeats.length > 0 && Number.isNaN(parsedSeats)
              ? "Enter a positive number or leave blank for unlimited."
              : undefined
          }
        />
        <NumberInput
          label="Max sites"
          min={1}
          step={1}
          value={maxSites}
          onChange={(event) => setMaxSites(event.target.value)}
          placeholder="Unlimited"
          error={
            maxSites.length > 0 && Number.isNaN(parsedSites)
              ? "Enter a positive number or leave blank for unlimited."
              : undefined
          }
        />
        <TextInput
          label="Note (optional)"
          placeholder="e.g. Standard trial package"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
    </Modal>
  );
}
