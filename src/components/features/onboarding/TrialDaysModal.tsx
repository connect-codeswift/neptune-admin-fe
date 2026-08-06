"use client";

import { useState } from "react";
import { NumberInput } from "@/components/inputs";
import { Modal } from "@/components/ui";

export type TrialDaysModalMode = "start" | "extend";

export type TrialDaysModalProps = {
  open: boolean;
  mode: TrialDaysModalMode;
  clientName: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (days: number) => void;
};

const DEFAULT_DAYS = 14;

export function TrialDaysModal({
  open,
  mode,
  clientName,
  loading = false,
  onClose,
  onConfirm,
}: Readonly<TrialDaysModalProps>) {
  const [days, setDays] = useState(String(DEFAULT_DAYS));
  const parsedDays = Number.parseInt(days, 10);
  const isValid = Number.isFinite(parsedDays) && parsedDays > 0 && parsedDays <= 365;
  const isStart = mode === "start";

  return (
    <Modal
      open={open}
      title={isStart ? "Start Trial" : "Extend Trial"}
      size="md"
      secondaryLabel="Cancel"
      onSecondary={onClose}
      onClose={onClose}
      primaryLabel={isStart ? "Start Trial" : "Extend Trial"}
      disabled={!isValid}
      loading={loading}
      onPrimary={() => {
        if (!isValid) return;
        onConfirm(parsedDays);
      }}
    >
      <div className="flex flex-col gap-4">
        <p className="text5 text-gray">
          {isStart
            ? `Choose how many days of trial access to give ${clientName}. Access starts from now.`
            : `Set a new trial length for ${clientName}. This replaces the current window — it does not add days on top.`}
        </p>
        <NumberInput
          label="Trial days *"
          min={1}
          max={365}
          step={1}
          value={days}
          onChange={(event) => setDays(event.target.value)}
          placeholder="e.g. 14"
          error={
            days.length > 0 && !isValid
              ? "Enter a whole number of days between 1 and 365."
              : undefined
          }
        />
      </div>
    </Modal>
  );
}
