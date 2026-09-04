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
import { StatCard } from "@/components/features/dashboard/StatCard";
import { Button, ModuleFilterBar, ModuleSearchBar } from "@/components/ui";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";
import type { KpiTargetModule } from "@/dtos/req/kpi-targets.req";
import type { KpiTargetResponse } from "@/dtos/res/kpi-targets.res";
import {
  useDropKpiTarget,
  useKpiTargetsBySite,
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

/**
 * Two columns, not the three the registers use: each panel holds number fields
 * with Save/Clear beside them, and at three-up those controls wrap onto their
 * own line on all but the widest screens.
 */
const MODULE_GRID_CLASS = "grid grid-cols-1 gap-5 lg:grid-cols-2";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "set", label: "Set" },
  { value: "unset", label: "Not set" },
] as const;

type KpiTargetsPageProps = Readonly<{ siteId: number }>;

export function KpiTargetsPage({ siteId }: KpiTargetsPageProps) {
  const pathname = usePathname();
  const orgSite = parseOrgSitePath(pathname ?? "");
  const adminHref = orgSite
    ? `${buildOrgSiteBasePath(orgSite.company, orgSite.site)}/dashboard`
    : "#";

  const targetsQuery = useKpiTargetsBySite(siteId);
  const { summary } = useOrgDashboard();
  const saveMutation = useSaveKpiTarget();
  const dropMutation = useDropKpiTarget();

  /** Which metric is mid-flight, so only its own button shows a pending label. */
  const [pendingMetric, setPendingMetric] = useState<string | null>(null);
  const [clearingId, setClearingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Two different reasons this page can be read-only, and the reader deserves to know
  // which one applies — hence a reason string rather than a bare boolean.
  //
  // Staff carry a superadmin org token whose `id` claim is not `NameIdentifier`, so the
  // backend cannot resolve an author on write. GET works; PUT/DELETE 400. See
  // FEGuides/KpiTargets.md "Known gaps".
  //
  // The other: KPI target writes take the site from the caller's token, never from a
  // parameter, so saving while viewing another site would write into the wrong one.
  // Reads accept an explicit siteId; writes deliberately do not.
  let readOnlyReason: string | null = null;
  if (isSuperAdminRole()) {
    readOnlyReason =
      "You are signed in as CodeSwift staff, so this page is read-only. Saving needs an organization admin account until the staff-token author gap is fixed on the backend.";
  } else if (orgSite === null || String(siteId) !== orgSite.site) {
    readOnlyReason =
      "You are viewing another site's targets, so this page is read-only. Targets save to the site you are currently switched to — switch to this site to edit them.";
  }
  const readOnly = readOnlyReason !== null;

  const activatedModules = summary?.activatedModules?.modules ?? null;

  const activeModules = KPI_TARGET_MODULES.filter((definition) =>
    isModuleActivated(definition, activatedModules),
  );

  const targetsByKey = indexTargets(targetsQuery.data ?? []);

  const isSet = (definition: KpiModuleDefinition, metric: string) =>
    targetsByKey.has(targetKey(definition.module, metric));

  // Search and status narrow the METRICS, then a module drops out entirely once
  // none of its metrics survive — filtering whole modules instead would hide a
  // matching metric just because its neighbours did not match.
  const normalizedSearch = search.trim().toLowerCase();

  function visibleMetrics(definition: KpiModuleDefinition) {
    return definition.metrics.filter((metric) => {
      if (statusFilter === "set" && !isSet(definition, metric.metric)) {
        return false;
      }
      if (statusFilter === "unset" && isSet(definition, metric.metric)) {
        return false;
      }
      if (normalizedSearch === "") {
        return true;
      }
      return (
        metric.label.toLowerCase().includes(normalizedSearch) ||
        metric.metric.toLowerCase().includes(normalizedSearch)
      );
    });
  }

  const visibleModules = activeModules.filter(
    (definition) => visibleMetrics(definition).length > 0,
  );

  const totalMetrics = activeModules.reduce(
    (count, definition) => count + definition.metrics.length,
    0,
  );
  const totalSet = activeModules.reduce(
    (count, definition) =>
      count +
      definition.metrics.filter((metric) => isSet(definition, metric.metric))
        .length,
    0,
  );
  const shownMetrics = visibleModules.reduce(
    (count, definition) => count + visibleMetrics(definition).length,
    0,
  );
  const filtersActive = normalizedSearch !== "" || statusFilter !== "";

  function clearFilters() {
    setSearch("");
    setStatusFilter("");
  }

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
      isSet(definition, metric.metric),
    ).length;
    const metrics = visibleMetrics(definition);

    return (
      // `h-full` so two panels side by side in the grid end level even when one
      // module has more metrics than the other.
      <section key={definition.module} className={`${GLASS_SURFACE} h-full p-5`}>
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
          {metrics.map((metric) => {
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
  } else if (activeModules.length === 0) {
    body = (
      <FeatureEmptyState
        icon="lucide:target"
        title="No modules to set targets for"
        description="Targets only exist for modules this organization has switched on. Incident and CAPA are both inactive, so there is nothing to configure here yet."
      />
    );
  } else if (visibleModules.length === 0) {
    // A filtered-to-nothing result is a different thing from having no modules,
    // and it is a dead end unless it offers the way back out.
    body = (
      <FeatureEmptyState
        icon="lucide:filter-x"
        title="No metrics match"
        description="No metric matches the current search and status filter."
        action={
          <Button
            variant="secondary"
            size="sm"
            leftIcon="lucide:filter-x"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        }
      />
    );
  } else {
    body = <div className={MODULE_GRID_CLASS}>{visibleModules.map(renderModule)}</div>;
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

      {/* Progress first: the page's real question is "how much of this is
          configured", which a column of half-empty number fields answers only
          by being read end to end. */}
      <div className="stagger-cards grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon="lucide:target"
          label="Targets set"
          value={totalSet}
          detail={`of ${String(totalMetrics)} metric${totalMetrics === 1 ? "" : "s"}`}
        />
        <StatCard
          icon="lucide:circle-dashed"
          label="Not set"
          value={totalMetrics - totalSet}
          detail="tiles reporting no target"
        />
        <StatCard
          icon="lucide:layers"
          label="Modules"
          value={activeModules.length}
          detail="switched on for this organization"
        />
      </div>

      {/* The two rules that are not guessable from the form: targets are
          per-site, and an empty field is not the same as zero. Kept as one
          compact line — it is a caption on the form, not a headline. */}
      <p className="text8 text-ehs-muted-text flex items-start gap-2">
        <Icon
          icon="lucide:info"
          width={14}
          height={14}
          className="text-ehs-normal-blue mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <span>
          Targets apply to the selected site. An empty field means no target —{" "}
          <strong className="text-ehs-darker">0 is a real target</strong>, so use{" "}
          <strong className="text-ehs-darker">Clear</strong> to remove one.
        </span>
      </p>

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
          <p className="text8 text-ehs-warning-ink">{readOnlyReason}</p>
        </div>
      ) : null}

      {/* Only worth showing once there is enough to sift. Below that the
          controls cost more space than the scanning they save. */}
      {!targetsQuery.isPending && !targetsQuery.isError && totalMetrics > 0 ? (
        <>
          <ModuleFilterBar
            segments={[
              {
                label: "Status",
                value: statusFilter,
                onChange: setStatusFilter,
                options: STATUS_FILTER_OPTIONS,
              },
            ]}
          />

          <ModuleSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search metrics…"
            aria-label="Search KPI metrics"
            resultLabel={
              filtersActive
                ? `${String(shownMetrics)} of ${String(totalMetrics)} shown`
                : `${String(totalSet)} of ${String(totalMetrics)} set`
            }
          />
        </>
      ) : null}

      {body}
    </div>
  );
}
