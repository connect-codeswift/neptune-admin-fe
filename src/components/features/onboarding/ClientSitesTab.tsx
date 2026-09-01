"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Button,
  ConfirmDialog,
  IconButton,
  Table,
  TableStatusBadge,
  TableTextCell,
  type TableColumn,
} from "@/components/ui";
import type { SuperAdminSiteRow } from "@/dtos/res/sites.res";
import { useCompanySites } from "@/hooks/useClientAccountDetail";
import { useSuperAdminSiteMutations } from "@/hooks/useSuperAdminSites";
import { toSiteLimitInfo } from "@/lib/organization-limits";
import { getIanaTimezoneSelectOptions } from "@/lib/iana-timezones";
import {
  getSiteIndustryTypeSelectOptions,
  getSiteSizeSelectOptions,
} from "@/lib/site-form-options";
import {
  ClientSiteFormFields,
  ClientSiteFormModal,
  EMPTY_CLIENT_SITE_FORM,
  toClientSiteFormState,
  type ClientSiteFormState,
} from "./ClientSiteFormModal";
import { FeatureEmptyState, FeatureErrorCard } from "@/components/features/shared";
import { Skeleton } from "@/components/ui/Skeleton";
import { DetailCard } from "./DetailCard";
import { SiteLimitModal } from "./SiteLimitModal";

type ClientSitesTabProps = Readonly<{
  organizationId: number;
  maxSites?: number | null;
  sitesUsed?: number;
  atSiteLimit?: boolean;
  initialEditSiteId?: number | null;
  onInitialEditConsumed?: () => void;
}>;

/** Site name and location are what the create/update endpoints require. */
function isSiteFormComplete(form: ClientSiteFormState): boolean {
  return Boolean(form.siteName.trim() && form.location.trim());
}

function sameSiteForm(a: ClientSiteFormState, b: ClientSiteFormState): boolean {
  return (
    a.siteName === b.siteName &&
    a.location === b.location &&
    a.industryType === b.industryType &&
    a.siteSize === b.siteSize &&
    a.timeZoneId === b.timeZoneId
  );
}

/**
 * Why a site cannot be deleted, or undefined when it can. Deleting is the one
 * irreversible control on this tab, so the reason travels with the button
 * rather than arriving as a toast after the click.
 */
function getDeleteBlockReason(site: SuperAdminSiteRow): string | undefined {
  if (site.isDrop) return "This site is already deleted.";
  if (site.userCount > 0) {
    return `${site.userCount} user${site.userCount === 1 ? " is" : "s are"} still assigned to this site. Reassign or deactivate them first.`;
  }
  return undefined;
}

/** One figure and its label, for the context rail beside the table. */
function RailMetric({
  label,
  value,
  accent = false,
}: Readonly<{ label: string; value: string; accent?: boolean }>) {
  return (
    <div className="min-w-0">
      <p className="text7 tracking-[0.5px] text-ehs-muted-text uppercase">
        {label}
      </p>
      <p
        className={`mt-1 text5 font-semibold tabular-nums ${
          accent ? "text-blue-normal" : "text-darkest"
        }`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

export function ClientSitesTab({
  organizationId,
  maxSites = null,
  sitesUsed = 0,
  atSiteLimit = false,
  initialEditSiteId = null,
  onInitialEditConsumed,
}: ClientSitesTabProps) {
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const { data: sites = [], isLoading, isError, error, refetch } =
    useCompanySites(organizationId, includeDeleted);
  const { createSite, updateSite, removeSite } =
    useSuperAdminSiteMutations(organizationId);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [siteLimitModalOpen, setSiteLimitModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<SuperAdminSiteRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SuperAdminSiteRow | null>(
    null,
  );
  const [form, setForm] = useState(EMPTY_CLIENT_SITE_FORM);
  // Flipped by the first save attempt so blank required fields report inline
  // instead of the form shouting red the moment it opens.
  const [saveAttempted, setSaveAttempted] = useState(false);

  const industryTypeOptions = useMemo(
    () => getSiteIndustryTypeSelectOptions(form.industryType),
    [form.industryType],
  );
  const siteSizeOptions = useMemo(
    () => getSiteSizeSelectOptions(form.siteSize),
    [form.siteSize],
  );
  const timezoneOptions = useMemo(
    () => getIanaTimezoneSelectOptions(form.timeZoneId),
    [form.timeZoneId],
  );

  const openCreate = () => {
    const siteInfo =
      maxSites != null
        ? toSiteLimitInfo({
            maxSites,
            sitesUsed,
            sitesAvailable: Math.max(0, maxSites - sitesUsed),
            atSiteLimit,
          })
        : null;

    if (atSiteLimit && siteInfo) {
      setSiteLimitModalOpen(true);
      return;
    }

    setForm(EMPTY_CLIENT_SITE_FORM);
    setSaveAttempted(false);
    setCreateModalOpen(true);
  };

  const siteLimitInfo =
    maxSites != null
      ? toSiteLimitInfo({
          maxSites,
          sitesUsed,
          sitesAvailable: Math.max(0, maxSites - sitesUsed),
          atSiteLimit,
        })
      : null;

  const openEdit = (site: SuperAdminSiteRow) => {
    setEditingSite(site);
    setForm(toClientSiteFormState(site));
    setSaveAttempted(false);
  };

  const closeEdit = () => {
    setEditingSite(null);
    setForm(EMPTY_CLIENT_SITE_FORM);
    setSaveAttempted(false);
  };

  // Opening the editor for a site the parent nominated is a one-shot command,
  // not a subscription. React's own answer for "adjust state when a prop
  // changed" is to do it during render, guarded by the value that triggered it
  // — an effect would repaint the tab once before the editor appeared.
  const [consumedEditSiteId, setConsumedEditSiteId] = useState<number | null>(
    null,
  );
  if (
    initialEditSiteId != null &&
    !isLoading &&
    consumedEditSiteId !== initialEditSiteId
  ) {
    setConsumedEditSiteId(initialEditSiteId);
    const site = sites.find(
      (row) => row.id === initialEditSiteId && !row.isDrop,
    );
    if (site) {
      setEditingSite(site);
      setForm(toClientSiteFormState(site));
    }
  }

  // Telling the parent it can drop the request is the one part that must not
  // happen during render — it sets state in another component.
  useEffect(() => {
    if (consumedEditSiteId == null) return;
    onInitialEditConsumed?.();
  }, [consumedEditSiteId, onInitialEditConsumed]);

  const handleSave = async () => {
    setSaveAttempted(true);
    if (!isSiteFormComplete(form)) {
      toast.error("Site name and location are required.");
      return;
    }

    const payload = {
      siteName: form.siteName.trim(),
      location: form.location.trim(),
      industryType: form.industryType.trim() || undefined,
      siteSize: form.siteSize.trim() || undefined,
      timeZoneId: form.timeZoneId.trim() || undefined,
    };

    try {
      if (editingSite) {
        await updateSite.mutateAsync({ siteId: editingSite.id, payload });
        toast.success("Site updated.");
        closeEdit();
      } else {
        await createSite.mutateAsync(payload);
        toast.success("Site created.");
        setCreateModalOpen(false);
      }
    } catch (saveError) {
      toast.error(
        saveError instanceof Error ? saveError.message : "Failed to save site.",
      );
    }
  };

  const handleDelete = async (site: SuperAdminSiteRow) => {
    const blockReason = getDeleteBlockReason(site);
    if (blockReason) {
      toast.error(blockReason);
      return;
    }

    try {
      await removeSite.mutateAsync(site.id);
      toast.success("Site deleted.");
      setPendingDelete(null);
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete site.",
      );
    }
  };

  if (editingSite) {
    const savedForm = toClientSiteFormState(editingSite);
    const editDirty = !sameSiteForm(form, savedForm);

    return (
      // Form on the left, the controls that act on it in a rail on the right,
      // so Save is on screen next to the fields rather than below whatever
      // length the form happens to be.
      <div className="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <DetailCard
          title={`Edit site — ${editingSite.siteName}`}
          description="Update site details for this client account. Fields marked * are required."
        >
          <ClientSiteFormFields
            form={form}
            onFormChange={setForm}
            industryTypeOptions={industryTypeOptions}
            siteSizeOptions={siteSizeOptions}
            timezoneOptions={timezoneOptions}
            showErrors={saveAttempted}
          />
        </DetailCard>

        <DetailCard
          title="Review & save"
          description="Nothing changes on the account until you save."
          className="order-first xl:order-last"
          footer={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                loading={updateSite.isPending}
                loadingText="Saving…"
                disabled={!editDirty}
                onClick={() => void handleSave()}
              >
                Save changes
              </Button>
              <Button type="button" variant="secondary" onClick={closeEdit}>
                Cancel
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <RailMetric
              label="Users assigned"
              value={String(editingSite.userCount)}
            />
            <RailMetric
              label="Status"
              value={editingSite.isDrop ? "Deleted" : "Active"}
            />
          </div>

          <p
            className="text8 text-ehs-muted-text mt-4"
            role="status"
            aria-live="polite"
          >
            {editDirty ? "Unsaved changes." : "No changes to save."}
          </p>

        </DetailCard>
      </div>
    );
  }

  const columns: TableColumn<SuperAdminSiteRow>[] = [
    {
      id: "name",
      header: "Site Name",
      cell: (row) => (
        <span
          title={row.siteName}
          className={`text5 block max-w-56 truncate font-semibold ${
            row.isDrop ? "text-ehs-muted-text line-through" : "text-darkest"
          }`}
        >
          {row.siteName}
        </span>
      ),
    },
    {
      id: "location",
      header: "Location",
      cell: (row) => (
        <span
          title={row.location}
          className="text4 text-ehs-muted-text block max-w-56 truncate"
        >
          {row.location}
        </span>
      ),
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
      cell: (row) => (
        <TableTextCell className="whitespace-nowrap">
          {row.timeZoneId ?? "—"}
        </TableTextCell>
      ),
    },
    {
      id: "users",
      header: "Users",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <TableTextCell className="tabular-nums">{row.userCount}</TableTextCell>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <TableStatusBadge
          status={row.isDrop ? "inactive" : "active"}
          label={row.isDrop ? "Deleted" : "Active"}
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "w-36 text-right",
      className: "w-36",
      cell: (row) => {
        const blockReason = getDeleteBlockReason(row);

        return (
          <div className="flex items-center justify-end gap-1.5">
            {row.isDrop ? null : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => openEdit(row)}
              >
                Edit
              </Button>
            )}
            {/* Disabled with the reason attached rather than rendered as a
                live button whose handler is `undefined` — that looked
                clickable and did nothing at all. The wrapper carries the
                tooltip because a disabled button has `pointer-events: none`
                and would never show its own `title`. */}
            <span title={blockReason} className="inline-flex">
              <IconButton
                icon="lucide:trash-2"
                label={
                  blockReason
                    ? `Cannot delete ${row.siteName} — ${blockReason}`
                    : `Delete ${row.siteName}`
                }
                size="sm"
                variant="ghost"
                disabled={Boolean(blockReason)}
                onClick={() => setPendingDelete(row)}
              />
            </span>
          </div>
        );
      },
    },
  ];

  const hasData = !isLoading && !isError;
  const activeSiteCount = sites.filter((site) => !site.isDrop).length;

  const sitesUsedLabel =
    maxSites == null ? `${sitesUsed} · no cap` : `${sitesUsed} / ${maxSites}`;
  let sitesAvailableLabel = "Unlimited";
  if (maxSites != null) {
    sitesAvailableLabel = String(Math.max(0, maxSites - sitesUsed));
  }

  return (
    <>
      {/* The table is the tab, so it takes the wide column; the allowance and
          the deleted-sites toggle are context and sit in the rail beside it. */}
      <div className="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <DetailCard
          title="Sites & Locations"
          description={`${activeSiteCount} active site${activeSiteCount === 1 ? "" : "s"}${
            includeDeleted ? ` · ${sites.length - activeSiteCount} deleted shown` : ""
          }`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon="lucide:refresh-cw"
                onClick={() => void refetch()}
              >
                Refresh
              </Button>
              <Button
                type="button"
                size="sm"
                leftIcon="lucide:plus"
                onClick={openCreate}
              >
                Add site
              </Button>
            </div>
          }
        >
          {isLoading ? (
            <div
              className="flex flex-col gap-3 py-2"
              role="status"
              aria-busy="true"
              aria-label="Loading sites…"
            >
              <Skeleton className="h-4 w-40 rounded-md bg-ehs-skeleton-strong" />
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-3/4 rounded-md" />
            </div>
          ) : null}

          {isError ? (
            <FeatureErrorCard
              surface={false}
              title="Couldn’t load sites"
              message={
                error instanceof Error
                  ? error.message
                  : "The site list did not load. Check your connection and try again."
              }
              onRetry={() => {
                void refetch();
              }}
            />
          ) : null}

          {/* "No sites at all" and "the deleted ones are hidden" are different
              situations: one wants a site created, the other wants the filter
              turned off. They used to share the message "No sites registered." */}
          {hasData && sites.length === 0 ? (
            <FeatureEmptyState
              surface={false}
              className="min-h-0 py-8"
              icon="mdi:map-marker-plus-outline"
              title={
                includeDeleted
                  ? "No sites, deleted or otherwise"
                  : "No active sites yet"
              }
              description="A client needs at least one site before its users can log anything against a location."
              action={
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    leftIcon="lucide:plus"
                    onClick={openCreate}
                  >
                    Add the first site
                  </Button>
                  {includeDeleted ? null : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      leftIcon="lucide:eye"
                      onClick={() => setIncludeDeleted(true)}
                    >
                      Show deleted sites
                    </Button>
                  )}
                </div>
              }
            />
          ) : null}

          {hasData && sites.length > 0 ? (
            <Table
              columns={columns}
              data={sites}
              getRowId={(row) => String(row.id)}
              className="border-ehs-border-ink/8 bg-ehs-surface shadow-(--ehs-shadow-card) backdrop-blur-none"
            />
          ) : null}
        </DetailCard>

        {/* The allowance used to surface only as a modal after you had already
            clicked "Add site" and been refused. It is context, so it sits beside
            the table with the one view control that belongs to it. */}
        <DetailCard
          title="Allowance & view"
          description="Caps come from the account's organization limits."
          className="order-first xl:order-last"
        >
          <div className="grid grid-cols-2 gap-4">
            <RailMetric
              label="Sites used"
              value={sitesUsedLabel}
              accent={atSiteLimit}
            />
            <RailMetric label="Available" value={sitesAvailableLabel} />
          </div>

          {atSiteLimit ? (
            <p className="text8 text-ehs-muted-text mt-4">
              This organization is at its site cap. Raise the cap on the Access &
              Limits tab before adding another site.
            </p>
          ) : null}

          <label className="text4 text-gray mt-4 inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(event) => setIncludeDeleted(event.target.checked)}
              className="focus-visible:ring-ehs-normal-blue/30 size-4 cursor-pointer rounded border-ehs-border-ink/20 accent-ehs-normal-blue outline-none focus-visible:ring-2"
            />
            Show deleted sites
          </label>
        </DetailCard>
      </div>

      <ClientSiteFormModal
        open={createModalOpen}
        editingSite={null}
        form={form}
        onFormChange={setForm}
        onClose={() => setCreateModalOpen(false)}
        onSave={() => void handleSave()}
        loading={createSite.isPending}
        showErrors={saveAttempted}
        industryTypeOptions={industryTypeOptions}
        siteSizeOptions={siteSizeOptions}
        timezoneOptions={timezoneOptions}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={
          pendingDelete
            ? `Delete ${pendingDelete.siteName}?`
            : "Delete this site?"
        }
        description="The site stops appearing for this client's users and anything recorded against it keeps pointing at a deleted location. This cannot be undone from here."
        confirmLabel="Delete site"
        cancelLabel="Keep site"
        loading={removeSite.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) void handleDelete(pendingDelete);
        }}
      />

      {siteLimitInfo ? (
        <SiteLimitModal
          open={siteLimitModalOpen}
          siteInfo={siteLimitInfo}
          onClose={() => setSiteLimitModalOpen(false)}
          onContactSales={() => {
            toast.info("Contact CodeSwift to increase your site allowance.");
            setSiteLimitModalOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
