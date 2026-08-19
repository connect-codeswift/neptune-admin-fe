"use client";

import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { SelectInput, TextInput } from "@/components/inputs";
import { PageHeader } from "@/components/layouts";
import {
  Button,
  Modal,
  Table,
  TableIconAction,
  TableStatusBadge,
  TableTextCell,
  type TableColumn,
} from "@/components/ui";
import type { SuperAdminSiteRow } from "@/dtos/res/sites.res";
import {
  useSuperAdminSiteMutations,
  useSuperAdminSites,
} from "@/hooks/useSuperAdminSites";
import { buildOrgSitePath } from "@/lib/org-sites";
import { parseOrgSitePath } from "@/lib/sidebar-items";
import { patchCachedSiteInTenantContext } from "@/lib/tenant-context";
import { getIanaTimezoneSelectOptions } from "@/lib/iana-timezones";
import {
  getSiteIndustryTypeSelectOptions,
  getSiteSizeSelectOptions,
} from "@/lib/site-form-options";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { FeatureErrorCard } from "@/components/features/shared";

type SiteFormState = {
  siteName: string;
  location: string;
  industryType: string;
  siteSize: string;
  timeZoneId: string;
};

const SKELETON_ROW_KEYS = ["r1", "r2", "r3", "r4", "r5"];
const SKELETON_CELL_KEYS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];

function toFormState(site: SuperAdminSiteRow): SiteFormState {
  return {
    siteName: site.siteName,
    location: site.location,
    industryType: site.industryType ?? "",
    siteSize: site.siteSize ?? "",
    timeZoneId: site.timeZoneId ?? "",
  };
}

/**
 * A grid the shape of the table it replaces — eight columns, five rows, a
 * header band on top. The old placeholder was four full-width bars, which is
 * the silhouette of a paragraph, so the layout jumped when the rows arrived.
 */
function SiteTableSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading sites…"
      className="flex flex-col gap-3"
    >
      <div className="grid grid-cols-4 gap-4 border-b border-ehs-border-ink/8 pb-3 lg:grid-cols-8">
        {SKELETON_CELL_KEYS.map((key) => (
          <Skeleton
            key={key}
            className="h-3 w-16 rounded-md bg-ehs-skeleton-strong"
          />
        ))}
      </div>
      {SKELETON_ROW_KEYS.map((rowKey) => (
        <div key={rowKey} className="grid grid-cols-4 gap-4 py-1 lg:grid-cols-8">
          {SKELETON_CELL_KEYS.map((cellKey) => (
            <Skeleton
              key={`${rowKey}-${cellKey}`}
              className="h-4 w-full rounded-md"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function buildColumns(
  onEdit: (site: SuperAdminSiteRow) => void,
): TableColumn<SuperAdminSiteRow>[] {
  return [
    {
      id: "name",
      header: "Site Name",
      cell: (row) => (
        <span className="text5 text-ehs-darker" title={row.siteName}>
          {row.siteName}
        </span>
      ),
    },
    {
      id: "location",
      header: "Location",
      cell: (row) => <TableTextCell muted>{row.location}</TableTextCell>,
    },
    {
      id: "industry",
      header: "Industry",
      cell: (row) => (
        <TableTextCell>{row.industryType?.trim() || "—"}</TableTextCell>
      ),
    },
    {
      id: "size",
      header: "Site Size",
      cell: (row) => <TableTextCell>{row.siteSize?.trim() || "—"}</TableTextCell>,
    },
    {
      id: "timezone",
      header: "Timezone",
      cell: (row) => <TableTextCell>{row.timeZoneId?.trim() || "—"}</TableTextCell>,
    },
    {
      id: "users",
      header: "Users",
      cell: (row) => <TableTextCell>{row.userCount}</TableTextCell>,
    },
    {
      id: "status",
      header: "Status",
      cell: () => <TableStatusBadge status="active" label="Active" />,
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      headerClassName: "w-16",
      className: "w-16",
      cell: (row) => (
        <TableIconAction
          label={`Edit ${row.siteName}`}
          icon="lucide:pencil"
          onClick={() => onEdit(row)}
        />
      ),
    },
  ];
}

export function SiteManagementPage() {
  const pathname = usePathname();
  const orgSite = parseOrgSitePath(pathname);
  const sectionHeadingId = useId();
  const {
    data: sites = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useSuperAdminSites(false);
  const { updateSite } = useSuperAdminSiteMutations();

  const [editingSite, setEditingSite] = useState<SuperAdminSiteRow | null>(null);
  const [form, setForm] = useState<SiteFormState | null>(null);
  /** Field errors stay quiet until the field is left or a save is attempted. */
  const [showErrors, setShowErrors] = useState(false);

  const adminHref = orgSite
    ? buildOrgSitePath(orgSite.company, orgSite.site)
    : "/dashboard";

  // No `useMemo` anywhere in this file: React Compiler is on for this app and
  // the repo's rule is that components do not hand-memoize.
  const activeSites = sites.filter((site) => !site.isDrop);

  const columns = buildColumns((site) => {
    setEditingSite(site);
    setForm(toFormState(site));
    setShowErrors(false);
  });

  const timezoneOptions = getIanaTimezoneSelectOptions(form?.timeZoneId);
  const industryTypeOptions = getSiteIndustryTypeSelectOptions(
    form?.industryType,
  );
  const siteSizeOptions = getSiteSizeSelectOptions(form?.siteSize);

  const closeModal = () => {
    setEditingSite(null);
    setForm(null);
    setShowErrors(false);
  };

  const trimmedName = form?.siteName.trim() ?? "";
  const trimmedLocation = form?.location.trim() ?? "";

  let siteNameError: string | undefined;
  if (showErrors && trimmedName === "") {
    siteNameError = "A site needs a name.";
  }

  let locationError: string | undefined;
  if (showErrors && trimmedLocation === "") {
    locationError = "A site needs a location.";
  }

  // Nothing to save until something actually changed — the primary action was
  // previously live the moment the dialog opened.
  const baseline = editingSite ? toFormState(editingSite) : null;
  const isDirty = Boolean(
    form &&
      baseline &&
      (form.siteName !== baseline.siteName ||
        form.location !== baseline.location ||
        form.industryType !== baseline.industryType ||
        form.siteSize !== baseline.siteSize ||
        form.timeZoneId !== baseline.timeZoneId),
  );
  const canSave =
    isDirty && trimmedName !== "" && trimmedLocation !== "";

  const handleSave = async () => {
    if (!editingSite || !form) return;

    if (!trimmedName || !trimmedLocation) {
      setShowErrors(true);
      return;
    }

    const payload = {
      siteName: trimmedName,
      location: trimmedLocation,
      industryType: form.industryType.trim() || undefined,
      siteSize: form.siteSize.trim() || undefined,
      timeZoneId: form.timeZoneId.trim() || undefined,
    };

    try {
      await updateSite.mutateAsync({ siteId: editingSite.id, payload });
      patchCachedSiteInTenantContext(editingSite.id, {
        name: payload.siteName,
        location: payload.location,
        industryType: payload.industryType ?? "",
        siteSize: payload.siteSize ?? "",
      });
      toast.success("Site updated.");
      closeModal();
    } catch (saveError) {
      toast.error(
        saveError instanceof Error ? saveError.message : "Failed to update site.",
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Site Management"
        description={
          activeSites.length > 0
            ? `${activeSites.length} active site${activeSites.length === 1 ? "" : "s"} in your organization`
            : "Update site details for your organization"
        }
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "Site Management" },
        ]}
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon="lucide:refresh-cw"
            // `isFetching`, not `isLoading`: a background refetch is exactly
            // what this button starts, and `isLoading` only covers the very
            // first fetch, so the spinner would never appear on a real refresh.
            loading={isFetching}
            loadingText="Refreshing…"
            onClick={() => void refetch()}
          >
            Refresh
          </Button>
        }
      />

      <section aria-labelledby={sectionHeadingId} className="flex flex-col gap-4">
        {/* This used to be a bordered, shadowed panel of its own — a permanent
            announcement banner for a fact that never changes, shouting on every
            visit. As a caption under the section heading it says the same thing
            without claiming to be news. */}
        <div className="min-w-0">
          <h2 id={sectionHeadingId} className="text3 text-ehs-darker">
            Sites
          </h2>
          <p className="mt-1 max-w-2xl text8 text-ehs-muted-text">
            Update site metadata such as location, industry, and timezone.
            Adding or removing sites is managed by Neptune administrators.
          </p>
        </div>

        <div className={`${GLASS_SURFACE} p-5`}>
          {isLoading ? <SiteTableSkeleton /> : null}

          {isError ? (
            <FeatureErrorCard
              title="Couldn’t load sites"
              message={
                error instanceof Error ? error.message : "Failed to load sites."
              }
              onRetry={() => {
                void refetch();
              }}
              surface={false}
            />
          ) : null}

          {!isLoading && !isError ? (
            <Table
              columns={columns}
              data={activeSites}
              getRowId={(row) => String(row.id)}
              emptyMessage="No sites are set up for this organization yet. Neptune administrators add sites — ask them to create one and it will appear here."
              className="border-ehs-border-ink/8 bg-ehs-surface shadow-(--ehs-shadow-card) backdrop-blur-none"
            />
          ) : null}
        </div>
      </section>

      <Modal
        open={editingSite !== null && form !== null}
        title={editingSite ? `Edit ${editingSite.siteName}` : "Edit site"}
        onClose={closeModal}
        // The footer is rendered here rather than through Modal's own
        // `primaryLabel` / `disabled` pair: that `disabled` dims *both* buttons,
        // and Cancel has to stay live even when there is nothing to save.
        hideFooter
        loading={updateSite.isPending}
        closeOnBackdrop={!updateSite.isPending}
        size="lg"
      >
        {form ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Site name"
              required
              value={form.siteName}
              error={siteNameError}
              onBlur={() => setShowErrors(true)}
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? { ...current, siteName: event.target.value }
                    : current,
                )
              }
            />
            <TextInput
              label="Location"
              required
              placeholder="City, Country"
              value={form.location}
              error={locationError}
              onBlur={() => setShowErrors(true)}
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? { ...current, location: event.target.value }
                    : current,
                )
              }
            />
            <SelectInput
              label="Industry type"
              placeholder="Select industry type"
              options={industryTypeOptions}
              value={form.industryType}
              onChange={(value) =>
                setForm((current) =>
                  current ? { ...current, industryType: value } : current,
                )
              }
            />
            <SelectInput
              label="Site size"
              placeholder="Select site size"
              options={siteSizeOptions}
              value={form.siteSize}
              onChange={(value) =>
                setForm((current) =>
                  current ? { ...current, siteSize: value } : current,
                )
              }
            />
            <SelectInput
              label="Timezone (IANA)"
              placeholder="Select timezone"
              helperText="Drives due dates and shift boundaries for everything logged at this site."
              options={timezoneOptions}
              value={form.timeZoneId}
              onChange={(value) =>
                setForm((current) =>
                  current ? { ...current, timeZoneId: value } : current,
                )
              }
              containerClassName="sm:col-span-2"
            />

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-ehs-border-ink/8 pt-4 sm:col-span-2">
              <Button
                type="button"
                variant="secondary"
                disabled={updateSite.isPending}
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                type="button"
                leftIcon="lucide:save"
                loading={updateSite.isPending}
                loadingText="Saving…"
                disabled={!canSave}
                onClick={() => void handleSave()}
              >
                Save changes
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
