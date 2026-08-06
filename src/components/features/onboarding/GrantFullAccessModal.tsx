"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui";

export type FullAccessGrantChoice =
  | Readonly<{ kind: "days"; days: number; label: string }>
  | Readonly<{ kind: "expiresAt"; expiresAt: string; label: string }>
  | Readonly<{ kind: "permanent"; label: string }>;

export type GrantFullAccessModalProps = Readonly<{
  open: boolean;
  clientName: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (choice: FullAccessGrantChoice) => void;
}>;

function addUtcYears(years: number): string {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() + years);
  return date.toISOString();
}

function formatExpiryPreview(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

type GrantOption = Readonly<{
  id: string;
  title: string;
  description: string;
  choice: FullAccessGrantChoice;
}>;

function buildGrantOptions(): GrantOption[] {
  const oneYearExpiresAt = addUtcYears(1);
  const twoYearExpiresAt = addUtcYears(2);

  return [
    {
      id: "1y",
      title: "1 year",
      description: `Access until ${formatExpiryPreview(oneYearExpiresAt)}`,
      choice: {
        kind: "expiresAt",
        expiresAt: oneYearExpiresAt,
        label: "1 year",
      },
    },
    {
      id: "2y",
      title: "2 years",
      description: `Access until ${formatExpiryPreview(twoYearExpiresAt)}`,
      choice: {
        kind: "expiresAt",
        expiresAt: twoYearExpiresAt,
        label: "2 years",
      },
    },
    {
      id: "permanent",
      title: "Permanent",
      description: "No expiry — typical once a client is fully onboarded or paying.",
      choice: { kind: "permanent", label: "Permanent" },
    },
  ];
}

export function GrantFullAccessModal({
  open,
  clientName,
  loading = false,
  onClose,
  onConfirm,
}: GrantFullAccessModalProps) {
  const options = useMemo(() => buildGrantOptions(), []);
  const [selectedId, setSelectedId] = useState("1y");

  const selected =
    options.find((option) => option.id === selectedId) ?? options[0]!;

  return (
    <Modal
      open={open}
      title="Grant Full Access"
      size="md"
      secondaryLabel="Cancel"
      onSecondary={onClose}
      onClose={onClose}
      primaryLabel="Confirm"
      loading={loading}
      onPrimary={() => onConfirm(selected.choice)}
    >
      <div className="flex flex-col gap-4">
        <p className="text5 text-gray">
          Choose how long {clientName} should keep access after the trial. This
          replaces the current trial window, or clears it for permanent access.
        </p>

        <fieldset className="flex flex-col gap-2 border-0 p-0">
          <legend className="sr-only">Access duration</legend>
          {options.map((option) => {
            const isSelected = option.id === selectedId;

            return (
              <label
                key={option.id}
                className={[
                  "flex cursor-pointer flex-col gap-1 rounded-xl border px-4 py-3 transition-colors",
                  isSelected
                    ? "border-blue-normal bg-blue-normal/8"
                    : "border-darkest/12 bg-white hover:border-darkest/20",
                ].join(" ")}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="grant-duration"
                    value={option.id}
                    checked={isSelected}
                    onChange={() => setSelectedId(option.id)}
                    className="size-4 accent-blue-normal"
                  />
                  <span className="text5 font-semibold text-darkest">
                    {option.title}
                  </span>
                </span>
                <span className="pl-6 text6 text-gray">{option.description}</span>
              </label>
            );
          })}
        </fieldset>
      </div>
    </Modal>
  );
}
