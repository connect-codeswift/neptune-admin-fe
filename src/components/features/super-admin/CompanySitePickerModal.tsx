"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SelectInput } from "@/components/inputs";
import { Button, Modal } from "@/components/ui";
import {
  useSuperAdminCompanies,
  useSuperAdminCompanySites,
} from "@/hooks/useSuperAdminCompanies";
import {
  buildOrgDashboardPath,
  enterOrganization,
} from "@/lib/select-company-flow";

export type CompanySitePickerModalProps = Readonly<{
  open: boolean;
  required?: boolean;
  title?: string;
  description?: string;
  initialOrganizationId?: number;
  initialSiteId?: number;
  onClose?: () => void;
  onSuccess?: (path: string) => void;
}>;

function getSitePlaceholder(
  organizationId: number | undefined,
  sitesLoading: boolean,
): string {
  if (!organizationId) return "Select a company first";
  if (sitesLoading) return "Loading sites…";
  return "Select site";
}

export function CompanySitePickerModal({
  open,
  required = false,
  title = "Select organization",
  description = "Choose a client company and site to continue. Org-scoped pages require an organization token.",
  initialOrganizationId,
  initialSiteId,
  onClose,
  onSuccess,
}: CompanySitePickerModalProps) {
  const queryClient = useQueryClient();
  const { data: companies = [], isLoading: companiesLoading } =
    useSuperAdminCompanies();
  const [organizationId, setOrganizationId] = useState<number | undefined>(
    initialOrganizationId,
  );
  const [siteId, setSiteId] = useState<number | undefined>(initialSiteId);
  const [submitting, setSubmitting] = useState(false);

  const { data: sites = [], isLoading: sitesLoading } =
    useSuperAdminCompanySites(organizationId);

  useEffect(() => {
    if (!open) return;
    setOrganizationId(initialOrganizationId);
    setSiteId(initialSiteId);
  }, [open, initialOrganizationId, initialSiteId]);

  useEffect(() => {
    if (!organizationId || sites.length === 0) return;
    if (siteId && sites.some((site) => site.id === siteId)) return;
    setSiteId(sites[0]?.id);
  }, [organizationId, sites, siteId]);

  const selectedCompany = companies.find((company) => company.id === organizationId);

  const handleConfirm = async () => {
    if (!organizationId || !siteId || !selectedCompany) {
      toast.error("Select a company and site.");
      return;
    }

    setSubmitting(true);
    try {
      await enterOrganization({
        organizationId,
        organizationName: selectedCompany.name,
        siteId,
      });
      // enterOrganization mints a fresh org token; anything cached under the
      // previous org/site is now the wrong tenant's data.
      queryClient.clear();
      const path = buildOrgDashboardPath(organizationId, siteId);
      onSuccess?.(path);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to select organization.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={required ? undefined : onClose}
      title={title}
      size="md"
      hideFooter
    >
      <div className="flex flex-col gap-4">
        <p className="text6 text-gray">{description}</p>
        <SelectInput
          label="Company"
          placeholder={companiesLoading ? "Loading companies…" : "Select company"}
          options={companies.map((company) => ({
            value: String(company.id),
            label: company.name,
          }))}
          value={organizationId ? String(organizationId) : ""}
          onChange={(value) => {
            setOrganizationId(Number(value));
            setSiteId(undefined);
          }}
          disabled={companiesLoading || submitting}
        />

        <SelectInput
          label="Site"
          placeholder={getSitePlaceholder(organizationId, sitesLoading)}
          options={sites.map((site) => ({
            value: String(site.id),
            label: site.siteName,
          }))}
          value={siteId ? String(siteId) : ""}
          onChange={(value) => setSiteId(Number(value))}
          disabled={!organizationId || sitesLoading || submitting}
        />

        <div className="flex justify-end gap-2 pt-2">
          {!required && onClose ? (
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
          ) : null}
          <Button
            size="sm"
            leftIcon="lucide:building-2"
            onClick={handleConfirm}
            disabled={submitting || !organizationId || !siteId}
          >
            {submitting ? "Selecting…" : "Continue"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
