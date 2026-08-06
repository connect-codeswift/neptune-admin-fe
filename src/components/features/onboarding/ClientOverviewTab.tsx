"use client";

import { useState } from "react";
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
import { useUpdateCompanyProfile } from "@/hooks/useClientAccountDetail";
import { DetailCard } from "./DetailCard";

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
}: Readonly<{ company: SuperAdminCompanyDetailResponse }>) {
  const updateProfile = useUpdateCompanyProfile(company.id);
  const [form, setForm] = useState(() => toFormState(company));
  const [dirty, setDirty] = useState(false);

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

  const websiteHref = form.website.startsWith("http")
    ? form.website
    : form.website
      ? `https://${form.website}`
      : "";

  return (
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-5">
        <DetailCard
          title="Company Information"
          action={
            dirty ? (
              <Button
                type="button"
                size="sm"
                loading={updateProfile.isPending}
                onClick={() => void handleSave()}
              >
                Save changes
              </Button>
            ) : null
          }
        >
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
            <InfoField label="Number of sites">
              {company.siteCount} sites
              {company.sites && company.sites.length > 0 ? (
                <ul className="mt-2 space-y-1 text6 font-normal text-gray">
                  {company.sites.map((site) => (
                    <li key={site.id}>{site.siteName}</li>
                  ))}
                </ul>
              ) : null}
            </InfoField>
            <TextInput
              label="Compliance zone"
              value={form.complianceZone}
              onChange={(event) =>
                handleChange("complianceZone", event.target.value)
              }
            />
            <InfoField label="Created">{formatDate(company.createdAt)}</InfoField>
            <InfoField label="Last updated">
              {formatDate(company.updatedAt)}
            </InfoField>
          </div>
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
          <div className="flex flex-col gap-4">
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

        {(company.accessExpiresAt || company.daysRemaining != null) && (
          <DetailCard title="Access Window">
            <div className="flex flex-col gap-2">
              <InfoField label="Expires">
                {formatDate(company.accessExpiresAt)}
              </InfoField>
              {company.daysRemaining != null ? (
                <InfoField label="Days remaining">
                  {company.daysRemaining} days
                </InfoField>
              ) : null}
            </div>
          </DetailCard>
        )}
      </div>
    </div>
  );
}
