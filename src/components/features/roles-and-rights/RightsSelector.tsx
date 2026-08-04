"use client";

import { Icon } from "@iconify/react";
import {
  isLockedRight,
  RIGHTS_GROUPS,
  type RightsGroup,
} from "@/lib/permissions";

type RightsSelectorProps = Readonly<{
  selected: string[];
  onChange: (selected: string[]) => void;
  grantedLabel?: string;
  showHeader?: boolean;
}>;

function RightChip({
  label,
  selected,
  locked,
  onToggle,
}: Readonly<{
  label: string;
  selected: boolean;
  locked: boolean;
  onToggle: () => void;
}>) {
  if (locked) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-darkest/10 bg-darkest/4 px-2.5 py-1 text6 text-[#8892a3]">
        <Icon icon="lucide:lock" width={12} height={12} aria-hidden />
        {label}
      </span>
    );
  }

  let chipClass =
    "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-darkest/15 bg-white px-2.5 py-1 text6 text-gray transition-colors hover:border-darkest/25";
  if (selected) {
    chipClass =
      "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-green bg-green/8 px-2.5 py-1 text6 font-medium text-darkest transition-colors";
  }

  return (
    <button type="button" onClick={onToggle} className={chipClass}>
      <Icon
        icon={selected ? "lucide:circle-check" : "lucide:circle"}
        width={12}
        height={12}
        className={selected ? "text-green" : "text-[#b3bbc8]"}
        aria-hidden
      />
      {label}
    </button>
  );
}

function RightsGroupSection({
  entry,
  selectedSet,
  onToggle,
}: Readonly<{
  entry: RightsGroup;
  selectedSet: Set<string>;
  onToggle: (right: string) => void;
}>) {
  return (
    <div className="flex flex-wrap gap-2">
      {entry.rights.map((right) => {
        const locked = isLockedRight(right);
        return (
          <RightChip
            key={right}
            label={right}
            selected={selectedSet.has(right)}
            locked={locked}
            onToggle={() => onToggle(right)}
          />
        );
      })}
    </div>
  );
}

export function RightsSelector({
  selected,
  onChange,
  grantedLabel = "granted",
  showHeader = true,
}: RightsSelectorProps) {
  const selectedSet = new Set(selected);

  const toggleRight = (right: string) => {
    if (isLockedRight(right)) return;
    if (selectedSet.has(right)) {
      onChange(selected.filter((item) => item !== right));
      return;
    }
    onChange([...selected, right]);
  };

  return (
    <div className="flex flex-col gap-4">
      {showHeader ? (
        <div className="flex items-center justify-between gap-3">
          <h3 className="text4 text-darkest">Rights</h3>
          <p className="text5 text-gray">
            {selected.length} {grantedLabel}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        {RIGHTS_GROUPS.map((entry) => (
          <RightsGroupSection
            key={entry.group}
            entry={entry}
            selectedSet={selectedSet}
            onToggle={toggleRight}
          />
        ))}
      </div>
    </div>
  );
}
