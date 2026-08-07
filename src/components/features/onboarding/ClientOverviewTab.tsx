"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { EmailInput, TextInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import type { SuperAdminCompanyDetailResponse } from "@/dtos/res/companies.res";
import {
  activatedModuleCodesToIds,
  getModuleLabel,
  parseActivatedModuleCodes,
} from "@/lib/ehs-modules";
import {
  useCompanySites,
  useUpdateCompanyProfile,
} from "@/hooks/useClientAccountDetail";
import { DetailCard } from "./DetailCard";
import { ClientAccessWindowPanel } from "./ClientAccessWindowPanel";

function InfoField({
  label,
  children,
}: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-b border-darkest/12 pb-2">
      <p className="text7 tracking-[0.5px] text-[#8892a3] uppercase">{label}</p>
      <div className="text5 font-semibold text-darkest">{children}</div>
    </div>
  );
}

function ModulePill({ label }: Readonly<{ label: string }>) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[20px] border border-blue-normal/18 bg-blue-normal/12 px-3 py-1.5 text7 text-blue-normal">
      <span className="size-1.5 rounded-full bg-blue-normal" aria-hidden />
      {label}
    </span>
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

type ProfileFormState = {
  name: string;
  code: string;
  industry: string;
  legalName: string;
  website: string;
  employeeCount: string;
  complianceZone: string;
  primaryContactName: string;
  primaryContactTitle: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
};

function toFormState(company: SuperAdminCompanyDetailResponse): ProfileFormState {
  return {
    name: company.name ?? "",
    code: company.code ?? "",
    industry: company.industry ?? "",
    legalName: company.legalName ?? "",
    website: company.website ?? "",
    employeeCount:
      company.employeeCount != null ? String(company.employeeCount) : "",
    complianceZone: company.complianceZone ?? "",
    primaryContactName: company.primaryContactName ?? "",
    primaryContactTitle: company.primaryContactTitle ?? "",
    primaryContactEmail: company.primaryContactEmail ?? "",
    primaryContactPhone: company.primaryContactPhone ?? "",
  };
}

export function ClientOverviewTab({
  company,
  onEditSite,
}: Readonly<{
  company: SuperAdminCompanyDetailResponse;
  onEditSite: (siteId: number) => void;
}>) {
  const updateProfile = useUpdateCompanyProfile(company.id);
  const { data: sites = [] } = useCompanySites(company.id);
  const [form, setForm] = useState(() => toFormState(company));
  const [dirty, setDirty] = useState(false);

  const activeSites = useMemo(
    () => sites.filter((site) => !site.isDrop),
    [sites],
  );

  const moduleCodes = parseActivatedModuleCodes(company.activatedModules);
  const moduleIds = activatedModuleCodesToIds(moduleCodes);

  const handleChange = (field: keyof ProfileFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Company name cannot be empty.");
      return;
    }

    const employeeCount = form.employeeCount.trim()
      ? Number(form.employeeCount)
      : undefined;

    try {
      await updateProfile.mutateAsync({
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        industry: form.industry.trim() || undefined,
        legalName: form.legalName.trim() || undefined,
        website: form.website.trim() || undefined,
        employeeCount: Number.isFinite(employeeCount) ? employeeCount : undefined,
        complianceZone: form.complianceZone.trim() || undefined,
        primaryContactName: form.primaryContactName.trim() || undefined,
        primaryContactTitle: form.primaryContactTitle.trim() || undefined,
        primaryContactEmail: form.primaryContactEmail.trim() || undefined,
        primaryContactPhone: form.primaryContactPhone.trim() || undefined,
      });
      toast.success("Company profile updated.");
      setDirty(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile.",
      );
    }
  };

  const handleDiscard = () => {
    setForm(toFormState(company));
    setDirty(false);
  };

  const websiteHref = form.website.startsWith("http")
    ? form.website
    : form.website
      ? `https://${form.website}`
      : "";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!dirty || updateProfile.isPending}
          onClick={handleDiscard}
        >
          Discard
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!dirty}
          loading={updateProfile.isPending}
          onClick={() => void handleSave()}
        >
          Save changes
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-5">
        <DetailCard title="Company Information">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <TextInput
              label="Company name"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
            />
            <TextInput
              label="Legal name"
              value={form.legalName}
              onChange={(event) => handleChange("legalName", event.target.value)}
            />
            <TextInput
              label="Client code"
              value={form.code}
              onChange={(event) => handleChange("code", event.target.value)}
            />
            <TextInput
              label="Industry"
              value={form.industry}
              onChange={(event) => handleChange("industry", event.target.value)}
            />
            <TextInput
              label="Website"
              value={form.website}
              onChange={(event) => handleChange("website", event.target.value)}
            />
            <TextInput
              label="Number of employees"
              value={form.employeeCount}
              onChange={(event) =>
                handleChange("employeeCount", event.target.value)
              }
            />
            <TextInput
              label="Number of sites"
              value={`${company.siteCount} site${company.siteCount === 1 ? "" : "s"}`}
              disabled
              readOnly
            />
            <TextInput
              label="Compliance zone"
              value={form.complianceZone}
              onChange={(event) =>
                handleChange("complianceZone", event.target.value)
              }
            />
            <TextInput
              label="Created"
              value={formatDate(company.createdAt)}
              disabled
              readOnly
            />
            <TextInput
              label="Last updated"
              value={formatDate(company.updatedAt)}
              disabled
              readOnly
            />
          </div>
        </DetailCard>

        <DetailCard
          title="Sites"
          description={`${activeSites.length} active site${activeSites.length === 1 ? "" : "s"}`}
        >
          {activeSites.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeSites.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => onEditSite(site.id)}
                  className="group flex min-h-28 flex-col justify-between rounded-2xl border border-darkest/10 bg-white p-4 text-left shadow-sm transition-colors hover:border-blue-normal/35 hover:bg-blue-normal/5 focus-visible:ring-2 focus-visible:ring-blue-normal/30 focus-visible:outline-none"
                >
                  <div className="min-w-0">
                    <p className="text5 font-semibold text-darkest">
                      {site.siteName}
                    </p>
                    <p className="mt-1 text6 text-gray">{site.location}</p>
                    {site.timeZoneId ? (
                      <p className="mt-0.5 text7 text-[#8892a3]">
                        {site.timeZoneId}
                      </p>
                    ) : null}
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 text7 font-semibold text-blue-normal">
                    Edit site
                    <Icon
                      icon="lucide:arrow-right"
                      width={12}
                      height={12}
                      className="transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text5 text-gray">No sites registered yet.</p>
          )}
          <p className="mt-3 text6 text-gray">
            Click a site to edit. Add or remove sites on the Sites tab.
          </p>
        </DetailCard>

        <DetailCard title="Activated Modules">
          {moduleIds.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {moduleIds.map((moduleId) => (
                <ModulePill key={moduleId} label={getModuleLabel(moduleId)} />
              ))}
            </div>
          ) : moduleCodes.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {moduleCodes.map((code) => (
                <ModulePill key={code} label={code} />
              ))}
            </div>
          ) : (
            <p className="text5 text-gray">No modules activated yet.</p>
          )}
          <p className="mt-3 text6 text-gray">
            Manage modules on the Modules tab.
          </p>
        </DetailCard>
      </div>

      <div className="flex flex-col gap-5">
        <DetailCard title="Primary Contact">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TextInput
              label="Full name"
              value={form.primaryContactName}
              onChange={(event) =>
                handleChange("primaryContactName", event.target.value)
              }
            />
            <TextInput
              label="Title"
              value={form.primaryContactTitle}
              onChange={(event) =>
                handleChange("primaryContactTitle", event.target.value)
              }
            />
            <EmailInput
              label="Email"
              value={form.primaryContactEmail}
              onChange={(event) =>
                handleChange("primaryContactEmail", event.target.value)
              }
            />
            <TextInput
              label="Phone"
              value={form.primaryContactPhone}
              onChange={(event) =>
                handleChange("primaryContactPhone", event.target.value)
              }
            />
            {websiteHref ? (
              <a
                href={websiteHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text6 text-blue-normal hover:text-blue-deep"
              >
                <Icon icon="lucide:external-link" width={14} height={14} />
                Visit website
              </a>
            ) : null}
          </div>
        </DetailCard>
      </div>

      </div>

      <ClientAccessWindowPanel
        organizationId={company.id}
        companyName={company.name}
        accessExpiresAt={company.accessExpiresAt}
        daysRemaining={company.daysRemaining}
        showActions={false}
      />
    </div>
  );
}
