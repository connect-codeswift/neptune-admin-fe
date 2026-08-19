"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { FeatureEmptyState } from "@/components/features/shared";
import { EmailInput, TextInput } from "@/components/inputs";
import { Button, ConfirmDialog, GLASS_SURFACE } from "@/components/ui";
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
import { ClientAccessWindowSummaryCard } from "./ClientAccessWindowPanel";

function ModulePill({ label }: Readonly<{ label: string }>) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-normal/18 bg-blue-normal/12 px-3 py-1.5 text7 text-blue-normal">
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

/** Bare hostnames are the common case; a link needs a scheme regardless. */
function toWebsiteHref(website: string): string {
  const trimmed = website.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http")) return trimmed;
  return `https://${trimmed}`;
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
  onGoToSites,
  onGoToModules,
}: Readonly<{
  company: SuperAdminCompanyDetailResponse;
  onEditSite: (siteId: number) => void;
  /** Jumps to the Sites tab — the only place a site can be created. */
  onGoToSites?: () => void;
  onGoToModules?: () => void;
}>) {
  const updateProfile = useUpdateCompanyProfile(company.id);
  const { data: sites = [] } = useCompanySites(company.id);
  const [form, setForm] = useState(() => toFormState(company));
  const [dirty, setDirty] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const activeSites = sites.filter((site) => !site.isDrop);

  const moduleCodes = parseActivatedModuleCodes(company.activatedModules);
  const moduleIds = activatedModuleCodesToIds(moduleCodes);

  // The company name is required by the API, so an emptied field is an error
  // now rather than a toast after the user has already pressed Save. The
  // employee count is free text on the wire but has to parse as a number.
  const nameError = form.name.trim() ? undefined : "Company name is required.";
  const employeeCountError =
    form.employeeCount.trim() && !/^\d+$/.test(form.employeeCount.trim())
      ? "Enter a whole number of employees, or leave it blank."
      : undefined;
  const hasFieldError = Boolean(nameError ?? employeeCountError);

  const handleChange = (field: keyof ProfileFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (hasFieldError) {
      toast.error("Fix the highlighted fields before saving.");
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
    setDiscardOpen(false);
  };

  const websiteHref = toWebsiteHref(form.website);

  let modulesContent = (
    <FeatureEmptyState
      surface={false}
      className="min-h-0 py-6"
      icon="mdi:puzzle-outline"
      title="No modules activated yet"
      description="Until a module is turned on, this client's users see an almost empty product."
      action={
        onGoToModules ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon="lucide:puzzle"
            onClick={onGoToModules}
          >
            Activate modules
          </Button>
        ) : undefined
      }
    />
  );

  if (moduleIds.length > 0) {
    modulesContent = (
      <div className="flex flex-wrap gap-2.5">
        {moduleIds.map((moduleId) => (
          <ModulePill key={moduleId} label={getModuleLabel(moduleId)} />
        ))}
      </div>
    );
  } else if (moduleCodes.length > 0) {
    // Codes the module catalogue does not recognise — shown raw rather than
    // dropped, so an unknown entitlement is visible instead of invisible.
    modulesContent = (
      <div className="flex flex-wrap gap-2.5">
        {moduleCodes.map((code) => (
          <ModulePill key={code} label={code} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {/* The save row governs the two editable cards below (profile + contact),
          so it stays at the top of the tab where it can be seen without
          scrolling past a screenful of fields. */}
      <div
        className={`${GLASS_SURFACE} flex flex-wrap items-center justify-end gap-3 px-5 py-3`}
      >
        <p className="text8 text-ehs-muted-text mr-auto" role="status" aria-live="polite">
          {dirty
            ? "Unsaved changes on this tab."
            : "Company profile is up to date."}
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!dirty || updateProfile.isPending}
          onClick={() => setDiscardOpen(true)}
        >
          Discard
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!dirty || hasFieldError}
          loading={updateProfile.isPending}
          loadingText="Saving…"
          onClick={() => void handleSave()}
        >
          Save changes
        </Button>
      </div>

      {/* Primary record on the left, the context you consult while editing it
          on the right — the house detail-view ratio rather than one column of
          full-width slabs. `items-start` keeps the short rail from stretching
          to the height of the profile form. */}
      <div className="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="stagger-cards flex min-w-0 flex-col gap-3.5">
          <DetailCard
            title="Company Information"
            description="Identity and registration details. Fields shown greyed out are derived and cannot be edited here."
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <TextInput
                label="Company name *"
                value={form.name}
                error={nameError}
                onChange={(event) => handleChange("name", event.target.value)}
              />
              <TextInput
                label="Legal name"
                value={form.legalName}
                helperText="The registered entity, if it differs from the trading name."
                onChange={(event) => handleChange("legalName", event.target.value)}
              />
              <TextInput
                label="Client code"
                value={form.code}
                helperText="Short internal reference used on invoices and support tickets."
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
                placeholder="e.g. meridianchem.com"
                onChange={(event) => handleChange("website", event.target.value)}
              />
              <TextInput
                label="Number of employees"
                value={form.employeeCount}
                inputMode="numeric"
                error={employeeCountError}
                onChange={(event) =>
                  handleChange("employeeCount", event.target.value)
                }
              />
              <TextInput
                label="Number of sites"
                value={`${company.siteCount} site${company.siteCount === 1 ? "" : "s"}`}
                helperText="Derived from the Sites tab."
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
            description={`${activeSites.length} active site${activeSites.length === 1 ? "" : "s"}. Select one to edit it on the Sites tab.`}
          >
            {activeSites.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {activeSites.map((site) => (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => onEditSite(site.id)}
                    className="group flex min-h-28 min-w-0 flex-col justify-between rounded-2xl border border-ehs-border-ink/10 bg-ehs-surface p-4 text-left shadow-sm transition-colors hover:border-blue-normal/35 hover:bg-blue-normal/5 focus-visible:ring-2 focus-visible:ring-blue-normal/30 focus-visible:outline-none"
                  >
                    <div className="min-w-0">
                      <p
                        className="truncate text5 font-semibold text-darkest"
                        title={site.siteName}
                      >
                        {site.siteName}
                      </p>
                      <p className="mt-1 truncate text8 text-gray" title={site.location}>
                        {site.location}
                      </p>
                      {site.timeZoneId ? (
                        <p className="mt-0.5 truncate text7 text-ehs-muted-text">
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
              <FeatureEmptyState
                surface={false}
                className="min-h-0 py-6"
                icon="mdi:map-marker-off-outline"
                title="No sites registered yet"
                description="A client needs at least one site before its users can record anything against a location."
                action={
                  onGoToSites ? (
                    <Button
                      type="button"
                      size="sm"
                      leftIcon="lucide:plus"
                      onClick={onGoToSites}
                    >
                      Add the first site
                    </Button>
                  ) : undefined
                }
              />
            )}
          </DetailCard>
        </div>

        <div className="stagger-cards flex min-w-0 flex-col gap-3.5">
          <DetailCard
            title="Primary Contact"
            description="Who CodeSwift speaks to about this account."
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                  className="focus-visible:ring-ehs-normal-blue/30 inline-flex items-center gap-1.5 self-start rounded-lg text4 text-blue-normal outline-none hover:text-blue-deep focus-visible:ring-2 lg:col-span-2"
                >
                  <Icon
                    icon="lucide:external-link"
                    width={14}
                    height={14}
                    aria-hidden
                  />
                  Visit website
                </a>
              ) : null}
            </div>
          </DetailCard>

          {/* Modules and the access window are read-only context on this tab —
              both are edited elsewhere — so they belong in the rail beside the
              record rather than as two more full-width bands under it. */}
          <DetailCard
            title="Activated Modules"
            description="Read-only here — modules are turned on and off from the Modules tab."
          >
            {modulesContent}
          </DetailCard>

          <ClientAccessWindowSummaryCard
            organizationId={company.id}
            companyName={company.name}
            accessExpiresAt={company.accessExpiresAt}
            daysRemaining={company.daysRemaining}
            showActions={false}
            dense
          />
        </div>
      </div>

      <ConfirmDialog
        open={discardOpen}
        title="Discard your changes?"
        description="Every edit on this tab goes back to the values currently saved on the account. This cannot be undone."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        onCancel={() => setDiscardOpen(false)}
        onConfirm={handleDiscard}
      />
    </div>
  );
}
