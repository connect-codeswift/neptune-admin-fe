"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
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

type SiteFormState = {
  siteName: string;
  location: string;
  industryType: string;
  siteSize: string;
  timeZoneId: string;
};

function toFormState(site: SuperAdminSiteRow): SiteFormState {
  return {
    siteName: site.siteName,
    location: site.location,
    industryType: site.industryType ?? "",
    siteSize: site.siteSize ?? "",
    timeZoneId: site.timeZoneId ?? "",
  };
}

function buildColumns(
  onEdit: (site: SuperAdminSiteRow) => void,
): TableColumn<SuperAdminSiteRow>[] {
  return [
    {
      id: "name",
      header: "Site Name",
      cell: (row) => (
        <span className="text5 font-semibold text-darkest">{row.siteName}</span>
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
  const { data: sites = [], isLoading, isError, error, refetch } =
    useSuperAdminSites(false);
  const { updateSite } = useSuperAdminSiteMutations();

  const [editingSite, setEditingSite] = useState<SuperAdminSiteRow | null>(null);
  const [form, setForm] = useState<SiteFormState | null>(null);

  const adminHref = orgSite
    ? buildOrgSitePath(orgSite.company, orgSite.site)
    : "/dashboard";

  const activeSites = useMemo(
    () => sites.filter((site) => !site.isDrop),
    [sites],
  );

  const columns = useMemo(
    () =>
      buildColumns((site) => {
        setEditingSite(site);
        setForm(toFormState(site));
      }),
    [],
  );

  const timezoneOptions = useMemo(
    () => getIanaTimezoneSelectOptions(form?.timeZoneId),
    [form?.timeZoneId],
  );

  const closeModal = () => {
    setEditingSite(null);
    setForm(null);
  };

  const handleSave = async () => {
    if (!editingSite || !form) return;

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
            onClick={() => void refetch()}
          >
            Refresh
          </Button>
        }
      />

      <div className="rounded-2xl border border-darkest/8 bg-white/80 px-5 py-4 text5 text-gray shadow-lg">
        Update site metadata such as location, industry, and timezone. Adding or
        removing sites is managed by Neptune administrators.
      </div>

      <section className="rounded-[20px] border border-white/90 bg-white/62 p-5 shadow-lg backdrop-blur-[10px]">
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
            data={activeSites}
            getRowId={(row) => String(row.id)}
            emptyMessage="No sites found for this organization."
            className="border-darkest/8 bg-white shadow-lg backdrop-blur-none"
          />
        ) : null}
      </section>

      <Modal
        open={editingSite !== null && form !== null}
        title={editingSite ? `Edit ${editingSite.siteName}` : "Edit site"}
        onClose={closeModal}
        primaryLabel="Save changes"
        onPrimary={() => void handleSave()}
        loading={updateSite.isPending}
        size="lg"
      >
        {form ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Site name *"
              value={form.siteName}
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? { ...current, siteName: event.target.value }
                    : current,
                )
              }
            />
            <TextInput
              label="Location *"
              value={form.location}
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? { ...current, location: event.target.value }
                    : current,
                )
              }
            />
            <TextInput
              label="Industry type"
              value={form.industryType}
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? { ...current, industryType: event.target.value }
                    : current,
                )
              }
            />
            <TextInput
              label="Site size"
              value={form.siteSize}
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? { ...current, siteSize: event.target.value }
                    : current,
                )
              }
            />
            <SelectInput
              label="Timezone (IANA)"
              placeholder="Select timezone"
              options={timezoneOptions}
              value={form.timeZoneId}
              onChange={(value) =>
                setForm((current) =>
                  current ? { ...current, timeZoneId: value } : current,
                )
              }
              containerClassName="sm:col-span-2"
            />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
