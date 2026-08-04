"use client";

import { useState } from "react";
import { NumberInput } from "@/components/inputs";
import { Modal } from "@/components/ui";

export type TrialDaysModalMode = "start" | "extend";

export type TrialDaysModalProps = {
  open: boolean;
  mode: TrialDaysModalMode;
  clientName: string;
  onClose: () => void;
  onConfirm: (days: number) => void;
};

const DEFAULT_DAYS = 14;

export function TrialDaysModal({
  open,
  mode,
  clientName,
  onClose,
  onConfirm,
}: Readonly<TrialDaysModalProps>) {
  const [days, setDays] = useState(String(DEFAULT_DAYS));
  const parsedDays = Number.parseInt(days, 10);
  const isValid = Number.isFinite(parsedDays) && parsedDays > 0;
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
      onPrimary={() => {
        if (!isValid) return;
        onConfirm(parsedDays);
      }}
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray">
          {isStart
            ? `Choose how many days of trial access to give ${clientName}.`
            : `Choose how many additional days to extend the trial for ${clientName}.`}
        </p>
        <NumberInput
          label="Trial days *"
          min={1}
          step={1}
          value={days}
          onChange={(event) => setDays(event.target.value)}
          placeholder="e.g. 14"
          error={
            days.length > 0 && !isValid
              ? "Enter a number of days greater than 0."
              : undefined
          }
        />
      </div>
    </Modal>
  );
}
