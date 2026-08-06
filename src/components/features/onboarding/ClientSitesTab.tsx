"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SelectInput, TextInput } from "@/components/inputs";
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
import { useCompanySites } from "@/hooks/useClientAccountDetail";
import { useSuperAdminSiteMutations } from "@/hooks/useSuperAdminSites";
import { getIanaTimezoneSelectOptions } from "@/lib/iana-timezones";
import {
  getSiteIndustryTypeSelectOptions,
  getSiteSizeSelectOptions,
} from "@/lib/site-form-options";
import { DetailCard } from "./DetailCard";

type SiteFormState = {
  siteName: string;
  location: string;
  industryType: string;
  siteSize: string;
  timeZoneId: string;
};

const EMPTY_FORM: SiteFormState = {
  siteName: "",
  location: "",
  industryType: "",
  siteSize: "",
  timeZoneId: "",
};

function toFormState(site?: SuperAdminSiteRow): SiteFormState {
  if (!site) return EMPTY_FORM;
  return {
    siteName: site.siteName,
    location: site.location,
    industryType: site.industryType ?? "",
    siteSize: site.siteSize ?? "",
    timeZoneId: site.timeZoneId ?? "",
  };
}

type ClientSitesTabProps = Readonly<{
  organizationId: number;
  orgContextReady: boolean;
  orgContextError?: string | null;
  onEnsureOrgContext: () => void;
  ensuringOrgContext?: boolean;
}>;

export function ClientSitesTab({
  organizationId,
  orgContextReady,
  orgContextError,
  onEnsureOrgContext,
  ensuringOrgContext = false,
}: ClientSitesTabProps) {
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const { data: sites = [], isLoading, isError, error, refetch } =
    useCompanySites(organizationId, includeDeleted);
  const { createSite, updateSite, removeSite } =
    useSuperAdminSiteMutations(organizationId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<SuperAdminSiteRow | null>(null);
  const [form, setForm] = useState<SiteFormState>(EMPTY_FORM);

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

  const canMutateSites = orgContextReady;

  const openCreate = () => {
    if (!canMutateSites) {
      onEnsureOrgContext();
      return;
    }
    setEditingSite(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (site: SuperAdminSiteRow) => {
    if (!canMutateSites) {
      onEnsureOrgContext();
      return;
    }
    setEditingSite(site);
    setForm(toFormState(site));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!canMutateSites) {
      onEnsureOrgContext();
      return;
    }

    if (!form.siteName.trim() || !form.location.trim()) {
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
      } else {
        await createSite.mutateAsync(payload);
        toast.success("Site created.");
      }
      setModalOpen(false);
    } catch (saveError) {
      toast.error(
        saveError instanceof Error ? saveError.message : "Failed to save site.",
      );
    }
  };

  const handleDelete = async (site: SuperAdminSiteRow) => {
    if (!canMutateSites) {
      onEnsureOrgContext();
      return;
    }

    if (site.userCount > 0) {
      toast.error(
        `Cannot delete this site: ${site.userCount} user(s) are still assigned. Reassign or deactivate them first.`,
      );
      return;
    }

    try {
      await removeSite.mutateAsync(site.id);
      toast.success("Site deleted.");
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete site.",
      );
    }
  };

  const columns: TableColumn<SuperAdminSiteRow>[] = [
    {
      id: "name",
      header: "Site Name",
      cell: (row) => (
        <span
          className={`text5 font-semibold ${
            row.isDrop ? "text-darkest/45 line-through" : "text-darkest"
          }`}
        >
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
      id: "timezone",
      header: "Timezone",
      cell: (row) => (
        <TableTextCell>{row.timeZoneId ?? "—"}</TableTextCell>
      ),
    },
    {
      id: "users",
      header: "Users",
      cell: (row) => <TableTextCell>{row.userCount}</TableTextCell>,
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
      cell: (row) => (
        <div className="flex items-center gap-1">
          <TableIconAction
            label={`Edit ${row.siteName}`}
            icon="lucide:pencil"
            onClick={row.isDrop ? undefined : () => openEdit(row)}
          />
          <TableIconAction
            label={`Delete ${row.siteName}`}
            icon="lucide:trash-2"
            onClick={
              row.isDrop || row.userCount > 0
                ? undefined
                : () => void handleDelete(row)
            }
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <DetailCard
        title="Sites & Locations"
        description={`${sites.length} site${sites.length === 1 ? "" : "s"} registered`}
        action={
          <div className="flex items-center gap-2">
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
              loading={ensuringOrgContext}
            >
              Add site
            </Button>
          </div>
        }
      >
        {!orgContextReady && orgContextError ? (
          <p className="mb-4 rounded-xl border border-red/20 bg-red/5 px-4 py-3 text6 text-red">
            {orgContextError}
          </p>
        ) : null}

        {!orgContextReady ? (
          <p className="mb-4 text6 text-gray">
            Site changes require organization context. It is being prepared
            automatically; add or edit once ready.
          </p>
        ) : null}

        <label className="mb-4 inline-flex items-center gap-2 text6 text-gray">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(event) => setIncludeDeleted(event.target.checked)}
            className="size-4 rounded border-darkest/20"
          />
          Show deleted sites
        </label>

        {isLoading ? (
          <p className="py-8 text-center text5 text-gray">Loading sites…</p>
        ) : null}

        {isError ? (
          <p className="py-8 text-center text5 text-red">
            {error instanceof Error ? error.message : "Failed to load sites."}
          </p>
        ) : null}

        {!isLoading && !isError ? (
          <Table
            columns={columns}
            data={sites}
            getRowId={(row) => String(row.id)}
            emptyMessage="No sites registered."
            className="border-darkest/8 bg-white shadow-lg backdrop-blur-none"
          />
        ) : null}
      </DetailCard>

      <Modal
        open={modalOpen}
        title={editingSite ? "Edit site" : "Add site"}
        onClose={() => setModalOpen(false)}
        primaryLabel={editingSite ? "Save site" : "Create site"}
        onPrimary={() => void handleSave()}
        loading={createSite.isPending || updateSite.isPending}
        size="lg"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            label="Site name *"
            value={form.siteName}
            onChange={(event) =>
              setForm((current) => ({ ...current, siteName: event.target.value }))
            }
          />
          <TextInput
            label="Location *"
            value={form.location}
            onChange={(event) =>
              setForm((current) => ({ ...current, location: event.target.value }))
            }
          />
          <SelectInput
            label="Industry type"
            placeholder="Select industry type"
            options={industryTypeOptions}
            value={form.industryType}
            onChange={(value) =>
              setForm((current) => ({ ...current, industryType: value }))
            }
          />
          <SelectInput
            label="Site size"
            placeholder="Select site size"
            options={siteSizeOptions}
            value={form.siteSize}
            onChange={(value) =>
              setForm((current) => ({ ...current, siteSize: value }))
            }
          />
          <SelectInput
            label="Timezone (IANA)"
            placeholder="Select timezone"
            options={timezoneOptions}
            value={form.timeZoneId}
            onChange={(value) =>
              setForm((current) => ({ ...current, timeZoneId: value }))
            }
            containerClassName="sm:col-span-2"
          />
        </div>
      </Modal>
    </>
  );
}
