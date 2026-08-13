"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layouts";
import type { KpiTargetModule } from "@/dtos/req/kpi-targets.req";
import type { KpiTargetResponse } from "@/dtos/res/kpi-targets.res";
import {
  useDropKpiTarget,
  useKpiTargets,
  useSaveKpiTarget,
} from "@/hooks/useKpiTargets";
import { useOrgDashboard } from "@/hooks/useOrgDashboard";
import { isSuperAdminRole } from "@/lib/auth-tokens";
import { buildOrgSiteBasePath, parseOrgSitePath } from "@/lib/admin-sidebar";
import { usePathname } from "next/navigation";
import { KpiTargetRow } from "./KpiTargetRow";
import {
  isModuleActivated,
  KPI_TARGET_MODULES,
  type KpiModuleDefinition,
} from "./kpi-targets-catalog";

/** Keyed `${module}:${metric}`, lowercased — the backend matches case-insensitively on read. */
function indexTargets(rows: readonly KpiTargetResponse[]) {
  const map = new Map<string, KpiTargetResponse>();
  for (const row of rows) {
    map.set(`${row.module.toLowerCase()}:${row.metric.toLowerCase()}`, row);
  }
  return map;
}

function targetKey(module: KpiTargetModule, metric: string) {
  return `${module.toLowerCase()}:${metric.toLowerCase()}`;
}

export function KpiTargetsPage() {
  const pathname = usePathname();
  const orgSite = parseOrgSitePath(pathname ?? "");
  const adminHref = orgSite
    ? `${buildOrgSiteBasePath(orgSite.company, orgSite.site)}/dashboard`
    : "#";

  const targetsQuery = useKpiTargets();
  const { summary } = useOrgDashboard();
  const saveMutation = useSaveKpiTarget();
  const dropMutation = useDropKpiTarget();

  /** Which metric is mid-flight, so only its own button shows a pending label. */
  const [pendingMetric, setPendingMetric] = useState<string | null>(null);
  const [clearingId, setClearingId] = useState<number | null>(null);

  // Staff carry a superadmin org token whose `id` claim is not `NameIdentifier`, so the
  // backend cannot resolve an author on write. GET works; PUT/DELETE 400. Read-only
  // until that backend gap closes — see FEGuides/KpiTargets.md "Known gaps".
  const readOnly = isSuperAdminRole();

  const activatedModules = summary?.activatedModules?.modules ?? null;

  const visibleModules = KPI_TARGET_MODULES.filter((definition) =>
    isModuleActivated(definition, activatedModules),
  );

  const targetsByKey = indexTargets(targetsQuery.data ?? []);

  function handleSave(module: KpiTargetModule, metric: string, value: number) {
    setPendingMetric(targetKey(module, metric));
    saveMutation.mutate(
      { module, metric, targetValue: value },
      {
        onSuccess: () => {
          toast.success("Target saved.");
        },
        onError: (error: unknown) => {
          toast.error(
            error instanceof Error ? error.message : "Failed to save the target.",
          );
        },
        onSettled: () => {
          setPendingMetric(null);
        },
      },
    );
  }

  function handleClear(id: number) {
    setClearingId(id);
    dropMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Target cleared. The tile will show no target.");
      },
      onError: (error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to clear the target.",
        );
      },
      onSettled: () => {
        setClearingId(null);
      },
    });
  }

  function renderModule(definition: KpiModuleDefinition) {
    return (
      <section
        key={definition.module}
        className="rounded-[20px] bg-white/62 p-5 shadow-[0_1px_2px_rgba(11,19,32,0.04),0_12px_32px_-16px_rgba(11,19,32,0.16)]"
      >
        <div className="flex items-start gap-3">
          <span className="bg-blue-lightest text-blue-normal flex size-9 shrink-0 items-center justify-center rounded-xl">
            <Icon icon={definition.icon} className="size-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text5 text-darkest font-semibold">
              {definition.label}
            </h2>
            <p className="text8 text-gray mt-0.5">{definition.description}</p>
          </div>
        </div>

        <div className="mt-2">
          {definition.metrics.map((metric) => {
            const saved = targetsByKey.get(
              targetKey(definition.module, metric.metric),
            );
            return (
              <KpiTargetRow
                key={metric.metric}
                definition={metric}
                savedValue={saved?.targetValue ?? null}
                savedId={saved?.id ?? null}
                readOnly={readOnly}
                isSaving={
                  pendingMetric === targetKey(definition.module, metric.metric)
                }
                isClearing={clearingId != null && clearingId === saved?.id}
                onSave={(metricKey, value) => {
                  handleSave(definition.module, metricKey, value);
                }}
                onClear={handleClear}
              />
            );
          })}
        </div>
      </section>
    );
  }

  let body: React.ReactNode;
  if (targetsQuery.isPending) {
    body = (
      <p className="text7 text-gray py-8 text-center">Loading targets…</p>
    );
  } else if (targetsQuery.isError) {
    body = (
      <p role="alert" className="text7 text-red py-8 text-center">
        {targetsQuery.error instanceof Error
          ? targetsQuery.error.message
          : "Failed to load KPI targets."}
      </p>
    );
  } else {
    body = (
      <div className="flex flex-col gap-5">{visibleModules.map(renderModule)}</div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="KPI Targets"
        description="Set the numbers EHSS dashboard tiles are measured against, for this site."
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "KPI Targets" },
        ]}
      />

      <p className="text8 text-gray max-w-3xl">
        Targets apply to the currently selected site. Leave a field empty for no target
        — <strong>0 is a real target</strong>, not a way to clear one. Use{" "}
        <strong>Clear</strong> to remove a target so the tile reports none instead of
        zero.
      </p>

      {readOnly ? (
        <p
          role="status"
          className="text8 text-darkest bg-yellow/15 rounded-xl px-4 py-3"
        >
          You are signed in as CodeSwift staff, so this page is read-only. Saving needs
          an organization admin account until the staff-token author gap is fixed on the
          backend.
        </p>
      ) : null}

      {body}
    </div>
  );
}
