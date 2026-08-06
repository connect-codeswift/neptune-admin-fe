"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Button,
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
import {
  ClientSiteFormFields,
  ClientSiteFormModal,
  EMPTY_CLIENT_SITE_FORM,
  toClientSiteFormState,
} from "./ClientSiteFormModal";
import { DetailCard } from "./DetailCard";

type ClientSitesTabProps = Readonly<{
  organizationId: number;
  initialEditSiteId?: number | null;
  onInitialEditConsumed?: () => void;
}>;

export function ClientSitesTab({
  organizationId,
  initialEditSiteId = null,
  onInitialEditConsumed,
}: ClientSitesTabProps) {
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const { data: sites = [], isLoading, isError, error, refetch } =
    useCompanySites(organizationId, includeDeleted);
  const { createSite, updateSite, removeSite } =
    useSuperAdminSiteMutations(organizationId);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<SuperAdminSiteRow | null>(null);
  const [form, setForm] = useState(EMPTY_CLIENT_SITE_FORM);

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
    setForm(EMPTY_CLIENT_SITE_FORM);
    setCreateModalOpen(true);
  };

  const openEdit = (site: SuperAdminSiteRow) => {
    setEditingSite(site);
    setForm(toClientSiteFormState(site));
  };

  const closeEdit = () => {
    setEditingSite(null);
    setForm(EMPTY_CLIENT_SITE_FORM);
  };

  useEffect(() => {
    if (initialEditSiteId == null || isLoading) return;

    const site = sites.find(
      (row) => row.id === initialEditSiteId && !row.isDrop,
    );
    if (site) {
      setEditingSite(site);
      setForm(toClientSiteFormState(site));
    }
    onInitialEditConsumed?.();
  }, [initialEditSiteId, isLoading, sites, onInitialEditConsumed]);

  const handleSave = async () => {
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

  if (editingSite) {
    return (
      <DetailCard
        title={`Edit site — ${editingSite.siteName}`}
        description="Update site details for this client account."
        action={
          <Button type="button" variant="secondary" size="sm" onClick={closeEdit}>
            Back to sites
          </Button>
        }
      >
        <ClientSiteFormFields
          form={form}
          onFormChange={setForm}
          industryTypeOptions={industryTypeOptions}
          siteSizeOptions={siteSizeOptions}
          timezoneOptions={timezoneOptions}
        />
        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            loading={updateSite.isPending}
            onClick={() => void handleSave()}
          >
            Save changes
          </Button>
        </div>
      </DetailCard>
    );
  }

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
      headerClassName: "w-36",
      className: "w-36",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {!row.isDrop ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => openEdit(row)}
            >
              Edit
            </Button>
          ) : null}
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
            >
              Add site
            </Button>
          </div>
        }
      >
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

      <ClientSiteFormModal
        open={createModalOpen}
        editingSite={null}
        form={form}
        onFormChange={setForm}
        onClose={() => setCreateModalOpen(false)}
        onSave={() => void handleSave()}
        loading={createSite.isPending}
        industryTypeOptions={industryTypeOptions}
        siteSizeOptions={siteSizeOptions}
        timezoneOptions={timezoneOptions}
      />
    </>
  );
}
