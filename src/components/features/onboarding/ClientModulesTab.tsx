"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import type { SuperAdminCompanyDetailResponse } from "@/dtos/res/companies.res";
import {
  activatedModuleCodesToIds,
  EHS_MODULES,
  moduleIdsToActivatedModules,
} from "@/lib/ehs-modules";
import { useUpdateCompanyModules } from "@/hooks/useClientAccountDetail";
import { DetailCard } from "./DetailCard";

function ModuleCard({
  label,
  active,
  onToggle,
  disabled,
}: Readonly<{
  label: string;
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
}>) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`rounded-xl border px-4 py-3.5 text-left transition-colors ${
        active
          ? "border-blue-normal/20 bg-blue-normal/8"
          : "border-darkest/10 bg-white hover:border-darkest/16"
      } disabled:opacity-60`}
    >
      <span className="flex items-center gap-2">
        <span
          className={`size-1.5 shrink-0 rounded-full ${
            active ? "bg-blue-normal" : "bg-darkest/25"
          }`}
          aria-hidden
        />
        <span
          className={`text5 ${active ? "text-darkest" : "text-darkest/45"}`}
        >
          {label}
        </span>
      </span>
    </button>
  );
}

export function ClientModulesTab({
  company,
}: Readonly<{ company: SuperAdminCompanyDetailResponse }>) {
  const updateModules = useUpdateCompanyModules(company.id);
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    activatedModuleCodesToIds(
      company.activatedModules
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
  );
  const [dirty, setDirty] = useState(false);

  const selectedSet = new Set(selectedIds);
  const active = EHS_MODULES.filter((module) => selectedSet.has(module.id));
  const inactive = EHS_MODULES.filter((module) => !selectedSet.has(module.id));

  const toggleModule = (moduleId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return [...next];
    });
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      await updateModules.mutateAsync(moduleIdsToActivatedModules(selectedIds));
      toast.success("Modules updated.");
      setDirty(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update modules.",
      );
    }
  };

  return (
    <DetailCard
      title="Activated EHS Modules"
      description="Toggle modules for this organization. Changes replace the full module list."
      action={
        dirty ? (
          <Button
            type="button"
            size="sm"
            loading={updateModules.isPending}
            onClick={() => void handleSave()}
          >
            Save modules
          </Button>
        ) : null
      }
    >
      <div className="flex flex-col gap-6">
        <section>
          <p className="mb-3 text8 tracking-[0.5px] text-blue-normal uppercase">
            Active ({active.length})
          </p>
          {active.length === 0 ? (
            <p className="text5 text-gray">No modules activated.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {active.map((module) => (
                <ModuleCard
                  key={module.id}
                  label={module.label}
                  active
                  onToggle={() => toggleModule(module.id)}
                  disabled={updateModules.isPending}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <p className="mb-3 text8 tracking-[0.5px] text-[#8892a3] uppercase">
            Available ({inactive.length})
          </p>
          {inactive.length === 0 ? (
            <p className="text5 text-gray">Every module is activated.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {inactive.map((module) => (
                <ModuleCard
                  key={module.id}
                  label={module.label}
                  active={false}
                  onToggle={() => toggleModule(module.id)}
                  disabled={updateModules.isPending}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </DetailCard>
  );
}
