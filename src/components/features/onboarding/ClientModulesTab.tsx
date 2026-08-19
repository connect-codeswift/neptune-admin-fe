"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button, ConfirmDialog } from "@/components/ui";
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
      // A module card is a two-state control, so it says so: `aria-pressed`
      // makes the on/off state audible instead of leaving it to the dot.
      aria-pressed={active}
      className={`focus-visible:ring-ehs-normal-blue/30 cursor-pointer rounded-xl border px-4 py-3.5 text-left outline-none transition-colors focus-visible:ring-2 ${
        active
          ? "border-blue-normal/20 bg-blue-normal/8"
          : "border-ehs-border-ink/10 bg-ehs-surface hover:border-ehs-border-ink/16"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span className="flex items-center gap-2">
        <span
          className={`size-1.5 shrink-0 rounded-full ${
            active ? "bg-blue-normal" : "bg-ehs-border-ink/25"
          }`}
          aria-hidden
        />
        <span
          className={`text4 ${active ? "text-darkest" : "text-ehs-muted-text"}`}
        >
          {label}
        </span>
      </span>
    </button>
  );
}

function parseCompanyModuleIds(
  company: SuperAdminCompanyDetailResponse,
): string[] {
  return activatedModuleCodesToIds(
    company.activatedModules
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  );
}

export function ClientModulesTab({
  company,
}: Readonly<{ company: SuperAdminCompanyDetailResponse }>) {
  const updateModules = useUpdateCompanyModules(company.id);
  const savedIds = parseCompanyModuleIds(company);
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    parseCompanyModuleIds(company),
  );
  const [dirty, setDirty] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedSet = new Set(selectedIds);
  const active = EHS_MODULES.filter((module) => selectedSet.has(module.id));
  const inactive = EHS_MODULES.filter((module) => !selectedSet.has(module.id));

  const savedSet = new Set(savedIds);
  const removedModules = EHS_MODULES.filter(
    (module) => savedSet.has(module.id) && !selectedSet.has(module.id),
  );
  const addedModules = EHS_MODULES.filter(
    (module) => !savedSet.has(module.id) && selectedSet.has(module.id),
  );

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

  const handleReset = () => {
    setSelectedIds(parseCompanyModuleIds(company));
    setDirty(false);
  };

  const handleSave = async () => {
    try {
      await updateModules.mutateAsync(moduleIdsToActivatedModules(selectedIds));
      toast.success("Modules updated.");
      setDirty(false);
      setConfirmOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update modules.",
      );
    }
  };

  // Turning a module off hides a whole area of the product from the client's
  // users, so that direction gets a confirm step. Adding modules does not.
  const requestSave = () => {
    if (removedModules.length > 0) {
      setConfirmOpen(true);
      return;
    }
    void handleSave();
  };

  let changeSummary = "No changes to save.";
  if (dirty) {
    const parts: string[] = [];
    if (addedModules.length > 0) parts.push(`${addedModules.length} to activate`);
    if (removedModules.length > 0)
      parts.push(`${removedModules.length} to deactivate`);
    changeSummary = parts.length > 0 ? `Unsaved: ${parts.join(", ")}.` : "Unsaved changes.";
  }

  return (
    <>
      {/* Picker on the left, the pending diff and its two controls in a rail on
          the right: what a save is about to do was previously a single line of
          text wedged above a wall of forty toggles. */}
      <div className="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <DetailCard
          title="Activated EHS Modules"
          description="Select the modules this organization is licensed for. Saving replaces the full module list — anything left unselected is turned off."
        >
          <div className="flex flex-col gap-5">
            <section>
              <h3 className="mb-3 text8 tracking-[0.5px] text-blue-normal uppercase">
                Active ({active.length})
              </h3>
              {active.length === 0 ? (
                <p className="text4 text-gray">
                  No modules selected. This client would see an almost empty
                  product — pick at least one below.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
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

            <section className="border-ehs-hairline/70 border-t pt-5">
              <h3 className="mb-3 text8 tracking-[0.5px] text-ehs-muted-text uppercase">
                Available ({inactive.length})
              </h3>
              {inactive.length === 0 ? (
                <p className="text4 text-gray">Every module is activated.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
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

        <DetailCard
          title="Pending changes"
          description="Nothing reaches the client until you save."
          className="order-first xl:order-last"
          footer={
            // Save and Reset are always present, disabled until there is
            // something to save. They used to appear only once the form was
            // dirty, which made the control row jump as soon as you clicked a
            // module and gave no way back to the saved state.
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                disabled={!dirty}
                loading={updateModules.isPending}
                loadingText="Saving…"
                onClick={requestSave}
              >
                Save modules
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!dirty || updateModules.isPending}
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          }
        >
          <p className="text8 text-ehs-muted-text" role="status" aria-live="polite">
            {changeSummary}
          </p>

          {addedModules.length > 0 ? (
            <div className="mt-4">
              <h3 className="mb-2 text8 tracking-[0.5px] text-blue-normal uppercase">
                To activate ({addedModules.length})
              </h3>
              <ul className="flex flex-col gap-1">
                {addedModules.map((module) => (
                  <li key={module.id} className="text4 text-darkest truncate">
                    {module.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {removedModules.length > 0 ? (
            <div className="mt-4">
              <h3 className="mb-2 text8 tracking-[0.5px] text-ehs-muted-text uppercase">
                To deactivate ({removedModules.length})
              </h3>
              <ul className="flex flex-col gap-1">
                {removedModules.map((module) => (
                  <li key={module.id} className="text4 text-darkest truncate">
                    {module.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

        </DetailCard>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Deactivate modules for this client?"
        description={
          <>
            <p>
              {removedModules.map((module) => module.label).join(", ")} will be
              turned off. Their users lose access to those areas of the product
              immediately; the data behind them is not deleted.
            </p>
            {addedModules.length > 0 ? (
              <p className="mt-2">
                {addedModules.map((module) => module.label).join(", ")} will be
                activated in the same save.
              </p>
            ) : null}
          </>
        }
        confirmLabel="Save modules"
        cancelLabel="Keep editing"
        loading={updateModules.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void handleSave()}
      />
    </>
  );
}
