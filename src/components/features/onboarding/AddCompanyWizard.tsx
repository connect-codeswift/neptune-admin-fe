"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layouts";
import { Button, SetupTabBar } from "@/components/ui";
import type { RegisterPayload } from "@/dtos/req/onboarding.req";
import { register } from "@/services/auth.service";
import { SetupStepFour, type InviteDraft } from "./SetupStepFour";
import { SetupStepOne } from "./SetupStepOne";
import { SetupStepThree } from "./SetupStepThree";
import { SetupStepTwo, type SiteDraft } from "./SetupStepTwo";

const SETUP_STEPS = [
  {
    id: "organization",
    label: "Organization",
    icon: "lucide:building-2",
  },
  {
    id: "sites",
    label: "Sites",
    icon: "lucide:map-pin",
  },
  {
    id: "admin-account",
    label: "Admin Account",
    icon: "lucide:key-round",
  },
  {
    id: "invite-team",
    label: "Invite Team",
    icon: "lucide:user-cog",
  },
] as const;

function createId() {
  return crypto.randomUUID();
}

function buildRegisterPayload(input: {
  organizationName: string;
  modules: string[];
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  sites: SiteDraft[];
  siteName: string;
  region: string;
  industryType: string;
  companySize: string;
}): RegisterPayload {
  const sites = input.sites.map((site) => ({
    industryType: site.industryType,
    siteSize: site.companySize,
    siteName: site.name,
    location: site.region,
  }));

  if (input.siteName.trim()) {
    sites.push({
      industryType: input.industryType,
      siteSize: input.companySize,
      siteName: input.siteName.trim(),
      location: input.region.trim(),
    });
  }

  return {
    fullName: input.adminName.trim(),
    email: input.adminEmail.trim(),
    passwordHash: input.adminPassword,
    roleId: 0,
    organizationId: 0,
    organizationName: input.organizationName.trim(),
    activatedModules: input.modules.join(","),
    invitedBy: null,
    sites,
  };
}

export function AddCompanyWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [organizationName, setOrganizationName] = useState("");
  const [modules, setModules] = useState<string[]>([
    "incident-reporting",
    "hazard-management",
    "capa",
  ]);

  const [siteName, setSiteName] = useState("");
  const [region, setRegion] = useState("");
  const [industryType, setIndustryType] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [sites, setSites] = useState<SiteDraft[]>([]);

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteSiteId, setInviteSiteId] = useState("");
  const [invites, setInvites] = useState<InviteDraft[]>([]);

  const siteOptions = (() => {
    const options = sites.map((site) => ({
      value: site.id,
      label: site.name,
    }));
    if (siteName.trim()) {
      options.unshift({ value: "current", label: siteName.trim() });
    }
    if (options.length === 0) {
      return [{ value: "demo-site", label: "Houston Plant" }];
    }
    return options;
  })();

  const goBack = () => {
    if (stepIndex === 0) {
      router.push("/client-accounts");
      return;
    }
    setStepIndex((current) => current - 1);
  };

  const completeSetup = async () => {
    if (!organizationName.trim()) {
      toast.error("Organization name is required.");
      setStepIndex(0);
      return;
    }
    if (sites.length === 0 && !siteName.trim()) {
      toast.error("Add at least one site.");
      setStepIndex(1);
      return;
    }
    if (!adminName.trim() || !adminEmail.trim() || !adminPassword) {
      toast.error("Admin name, email, and password are required.");
      setStepIndex(2);
      return;
    }

    const payload = buildRegisterPayload({
      organizationName,
      modules,
      adminName,
      adminEmail,
      adminPassword,
      sites,
      siteName,
      region,
      industryType,
      companySize,
    });

    setIsSubmitting(true);
    try {
      const response = await register(payload);
      if (response.isError || !response.success) {
        toast.error(response.message || "Registration failed.");
        return;
      }
      toast.success(response.message || "Client registered.");
      router.push("/client-accounts");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registration failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const goContinue = () => {
    if (stepIndex >= SETUP_STEPS.length - 1) {
      void completeSetup();
      return;
    }
    setStepIndex((current) => current + 1);
  };

  const addSite = () => {
    if (!siteName.trim()) {
      toast.error("Enter a site name first.");
      return;
    }
    setSites((current) => [
      ...current,
      {
        id: createId(),
        name: siteName.trim(),
        region: region.trim(),
        industryType,
        companySize,
      },
    ]);
    setSiteName("");
    setRegion("");
    setIndustryType("");
    setCompanySize("");
  };

  const addInvite = () => {
    if (!inviteEmail.trim() || !inviteRole || !inviteSiteId) {
      toast.error("Email, role, and site are required.");
      return;
    }
    setInvites((current) => [
      ...current,
      {
        id: createId(),
        email: inviteEmail.trim(),
        role: inviteRole,
        siteId: inviteSiteId,
      },
    ]);
    setInviteEmail("");
    setInviteRole("");
    setInviteSiteId("");
  };

  const removeInvite = (id: string) => {
    setInvites((current) => current.filter((invite) => invite.id !== id));
  };

  let stepContent = null;

  if (stepIndex === 0) {
    stepContent = (
      <SetupStepOne
        organizationName={organizationName}
        onOrganizationNameChange={setOrganizationName}
        modules={modules}
        onModulesChange={setModules}
      />
    );
  } else if (stepIndex === 1) {
    stepContent = (
      <SetupStepTwo
        siteName={siteName}
        onSiteNameChange={setSiteName}
        region={region}
        onRegionChange={setRegion}
        industryType={industryType}
        onIndustryTypeChange={setIndustryType}
        companySize={companySize}
        onCompanySizeChange={setCompanySize}
        sites={sites}
        onAddSite={addSite}
      />
    );
  } else if (stepIndex === 2) {
    stepContent = (
      <SetupStepThree
        adminName={adminName}
        onAdminNameChange={setAdminName}
        adminEmail={adminEmail}
        onAdminEmailChange={setAdminEmail}
        adminPassword={adminPassword}
        onAdminPasswordChange={setAdminPassword}
      />
    );
  } else {
    stepContent = (
      <SetupStepFour
        inviteEmail={inviteEmail}
        onInviteEmailChange={setInviteEmail}
        inviteRole={inviteRole}
        onInviteRoleChange={setInviteRole}
        inviteSiteId={inviteSiteId}
        onInviteSiteIdChange={setInviteSiteId}
        siteOptions={siteOptions}
        invites={invites}
        onAddInvite={addInvite}
        onRemoveInvite={removeInvite}
      />
    );
  }

  const isLastStep = stepIndex === SETUP_STEPS.length - 1;

  let continueLabel = "Continue";
  if (isLastStep) {
    continueLabel = isSubmitting ? "Submitting…" : "Complete Setup";
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Add New Client"
        description="Walk through onboarding set up"
      />

      <SetupTabBar steps={[...SETUP_STEPS]} activeIndex={stepIndex} />

      <div className="mx-auto w-full max-w-2xl">{stepContent}</div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="secondary"
          leftIcon="lucide:chevron-left"
          onClick={goBack}
          disabled={isSubmitting}
        >
          Back
        </Button>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray">
            Step {stepIndex + 1} of {SETUP_STEPS.length}
          </span>
          <Button
            type="button"
            rightIcon={isLastStep ? undefined : "lucide:chevron-right"}
            onClick={goContinue}
            disabled={isSubmitting}
          >
            {continueLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
