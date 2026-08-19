"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingGrid,
} from "@/components/features/shared";
import { PageHeader } from "@/components/layouts";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";
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
    const setCount = definition.metrics.filter((metric) =>
      targetsByKey.has(targetKey(definition.module, metric.metric)),
    ).length;

    return (
      <section key={definition.module} className={`${GLASS_SURFACE} p-5`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ehs-light-blue text-ehs-normal-blue">
              <Icon
                icon={definition.icon}
                className="size-4.5"
                aria-hidden="true"
              />
            </span>
            <div className="min-w-0">
              <h2 className="text3 text-ehs-darker">{definition.label}</h2>
              <p className="mt-0.5 text8 text-ehs-muted-text">
                {definition.description}
              </p>
            </div>
          </div>

          {/* How much of this module is configured, so a long list of empty
              fields is not the only way to find out. */}
          <p className="text8 text-ehs-muted-text tabular-nums">
            {setCount} of {definition.metrics.length} set
          </p>
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

  let body: ReactNode;
  if (targetsQuery.isPending) {
    // Two module-sized panes, not a paragraph of grey bars: the page is two
    // tall cards and the placeholder should hold that shape.
    body = (
      <FeatureLoadingGrid
        count={2}
        label="Loading KPI targets…"
        className="flex flex-col gap-5"
        cardClassName="min-h-96"
      />
    );
  } else if (targetsQuery.isError) {
    body = (
      <FeatureErrorCard
        title="Couldn’t load KPI targets"
        message={
          targetsQuery.error instanceof Error
            ? targetsQuery.error.message
            : "Failed to load KPI targets."
        }
        onRetry={() => {
          void targetsQuery.refetch();
        }}
      />
    );
  } else if (visibleModules.length === 0) {
    body = (
      <FeatureEmptyState
        icon="lucide:target"
        title="No modules to set targets for"
        description="Targets only exist for modules this organization has switched on. Incident and CAPA are both inactive, so there is nothing to configure here yet."
      />
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

      {/* The two rules that are not guessable from the form: targets are
          per-site, and an empty field is not the same as zero. They were loose
          paragraphs on the page ground; in a panel they read as instructions
          rather than as stray text. */}
      <div className="flex items-start gap-2.5 rounded-xl border border-ehs-normal-blue/15 bg-ehs-normal-blue/5 px-4 py-3">
        <Icon
          icon="lucide:info"
          width={16}
          height={16}
          className="mt-0.5 shrink-0 text-ehs-normal-blue"
          aria-hidden="true"
        />
        <p className="text8 text-ehs-slate">
          Targets apply to the currently selected site. Leave a field empty for
          no target — <strong className="text-ehs-darker">0 is a real target</strong>,
          not a way to clear one. Use <strong className="text-ehs-darker">Clear</strong>{" "}
          to remove a target so the tile reports none instead of zero.
        </p>
      </div>

      {readOnly ? (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-ehs-warning-border bg-ehs-warning-surface px-4 py-3"
        >
          <Icon
            icon="lucide:lock"
            width={16}
            height={16}
            className="mt-0.5 shrink-0 text-ehs-warning-ink"
            aria-hidden="true"
          />
          <p className="text8 text-ehs-warning-ink">
            You are signed in as CodeSwift staff, so this page is read-only.
            Saving needs an organization admin account until the staff-token
            author gap is fixed on the backend.
          </p>
        </div>
      ) : null}

      {body}
    </div>
  );
}
