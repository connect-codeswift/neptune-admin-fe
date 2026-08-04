"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { TextAreaInput, TextInput } from "@/components/inputs";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import { countSelectedByGroup } from "@/lib/permissions";
import {
  DEFAULT_PRESET_ID,
  getPresetRightCount,
  getPresetRights,
  ROLE_PRESETS,
} from "@/lib/presets";
import { RightsSelector } from "./RightsSelector";
import { useRolesAndRightsPaths } from "./useRolesAndRightsPaths";

export function CreateRolePage() {
  const router = useRouter();
  const { adminHref, basePath } = useRolesAndRightsPaths();
  const [activePresetId, setActivePresetId] = useState(DEFAULT_PRESET_ID);
  const [selectedRights, setSelectedRights] = useState<string[]>(
    getPresetRights(DEFAULT_PRESET_ID),
  );

  const groupSummary = countSelectedByGroup(selectedRights);

  const handlePresetSelect = (presetId: string) => {
    setActivePresetId(presetId);
    setSelectedRights(getPresetRights(presetId));
  };

  const handleCreate = () => {
    toast.success("Role created.");
    router.push(basePath);
  };

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Create New Role"
        description="Define a custom role with tailored rights"
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "Roles & Rights", href: basePath },
          { label: "New Role" },
        ]}
        actions={
          <>
            <Button variant="secondary" size="sm" href={basePath}>
              Cancel
            </Button>
            <Button
              size="sm"
              leftIcon="lucide:shield-plus"
              onClick={handleCreate}
            >
              Create Role
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <DetailCard title="Role Information">
            <div className="flex flex-col gap-4">
              <TextInput
                label="Role Name"
                placeholder="e.g. Environmental Compliance Officer"
                required
              />
              <TextAreaInput
                label="Description"
                placeholder="Describe the responsibilities and scope of this role..."
                rows={4}
              />
            </div>
          </DetailCard>

          <DetailCard
            title="Rights"
            action={
              <span className="text5 text-gray">
                {selectedRights.length} granted
              </span>
            }
          >
            <RightsSelector
              selected={selectedRights}
              onChange={setSelectedRights}
              showHeader={false}
            />
          </DetailCard>
        </div>

        <div className="flex flex-col gap-6">
          <DetailCard
            title="Start from Preset"
            description="Copy rights from an existing role, then customize"
          >
            <ul className="flex flex-col gap-2">
              {ROLE_PRESETS.map((preset) => {
                const active = preset.id === activePresetId;
                let itemClass =
                  "flex w-full cursor-pointer items-center justify-between rounded-[10px] border px-3.5 py-3 text-left transition-colors";
                if (active) {
                  itemClass +=
                    " border-blue-normal bg-blue-normal/8 text-blue-normal";
                } else {
                  itemClass +=
                    " border-darkest/10 bg-white text-darkest hover:border-darkest/20 hover:bg-darkest/3";
                }

                return (
                  <li key={preset.id}>
                    <button
                      type="button"
                      className={itemClass}
                      onClick={() => handlePresetSelect(preset.id)}
                    >
                      <span className="text5 font-semibold">{preset.name}</span>
                      <span className="text6 text-gray">
                        {getPresetRightCount(preset.id)} rights
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </DetailCard>

          <DetailCard title="Summary">
            <p className="text2 text-darkest">
              {selectedRights.length}{" "}
              <span className="text4 font-normal text-gray">rights selected</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {groupSummary.map((entry) => (
                <span
                  key={entry.group}
                  className="inline-flex items-center rounded-md bg-darkest/6 px-2.5 py-1 text6 text-darkest"
                >
                  {entry.group}: {entry.count}
                </span>
              ))}
            </div>
          </DetailCard>
        </div>
      </div>
    </div>
  );
}
