"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layouts";
import { Button, ConfirmDialog, SetupTabBar } from "@/components/ui";
import { CardHeading } from "@/components/ui/CardHeading";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";
import type { RegisterPayload } from "@/dtos/req/onboarding.req";
import { moduleIdsToActivatedModules } from "@/lib/ehs-modules";
import { register } from "@/services/auth.service";
import { SetupStepOne } from "./SetupStepOne";
import { SetupStepThree } from "./SetupStepThree";
import { SetupStepTwo, type SiteDraft } from "./SetupStepTwo";
import { WizardSummaryRail } from "./WizardSummaryRail";

const SETUP_STEPS = [
  {
    id: "organization",
    label: "Organization",
    icon: "lucide:building-2",
    /** Shown under the step strip so "what is left" is never a guess. */
    summary: "Name the company and pick the modules it is licensed for.",
  },
  {
    id: "sites",
    label: "Sites",
    icon: "lucide:map-pin",
    summary: "Add at least one physical site. More can be added after setup.",
  },
  {
    id: "admin-account",
    label: "Admin Account",
    icon: "lucide:key-round",
    summary: "Create the first administrator, who invites everyone else.",
  },
] as const;

type StepErrors = {
  organizationName?: string;
  sites?: string;
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function createId() {
  return crypto.randomUUID();
}

function buildRegisterPayload(input: {
  organizationName: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  sites: SiteDraft[];
  siteName: string;
  region: string;
  industryType: string;
  companySize: string;
  selectedModules: string[];
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
    activatedModules: moduleIdsToActivatedModules(input.selectedModules),
    invitedBy: null,
    sites,
  };
}

export function AddCompanyWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Errors appear only once the user has said they are finished with a step.
  // A required field is not "wrong" while it is still being filled in.
  const [showErrors, setShowErrors] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  // Every field lives here, at the level above the steps, which is why moving
  // backwards and forwards through the wizard never loses what was typed —
  // the step components are stateless views over this state.
  const [organizationName, setOrganizationName] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  const [siteName, setSiteName] = useState("");
  const [region, setRegion] = useState("");
  const [industryType, setIndustryType] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [sites, setSites] = useState<SiteDraft[]>([]);

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const hasEnteredAnything =
    organizationName.trim().length > 0 ||
    selectedModules.length > 0 ||
    sites.length > 0 ||
    siteName.trim().length > 0 ||
    adminName.trim().length > 0 ||
    adminEmail.trim().length > 0 ||
    adminPassword.length > 0;

  const stepErrors: StepErrors[] = [
    {
      organizationName: organizationName.trim()
        ? undefined
        : "Enter the organization's name.",
    },
    {
      sites:
        sites.length > 0 || siteName.trim()
          ? undefined
          : "Add at least one site before continuing.",
    },
    {
      adminName: adminName.trim() ? undefined : "Enter the administrator's name.",
      adminEmail: EMAIL_PATTERN.test(adminEmail.trim())
        ? undefined
        : "Enter a valid email address — this is where the sign-in link goes.",
      adminPassword:
        adminPassword.length >= MIN_PASSWORD_LENGTH
          ? undefined
          : `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
    },
  ];

  const currentErrors = stepErrors[stepIndex] ?? {};
  const currentStepValid = Object.values(currentErrors).every(
    (message) => message === undefined,
  );

  const leaveWizard = () => {
    router.push("/super/client-accounts");
  };

  const goBack = () => {
    setShowErrors(false);
    if (stepIndex === 0) {
      if (hasEnteredAnything) {
        setCancelOpen(true);
        return;
      }
      leaveWizard();
      return;
    }
    setStepIndex((current) => current - 1);
  };

  const completeSetup = async () => {
    // Guard against a step being skipped by an earlier bug: land the user on
    // the first step that is still incomplete rather than failing at the API.
    const firstBrokenStep = stepErrors.findIndex((errors) =>
      Object.values(errors).some((message) => message !== undefined),
    );
    if (firstBrokenStep !== -1) {
      setStepIndex(firstBrokenStep);
      setShowErrors(true);
      return;
    }

    const payload = buildRegisterPayload({
      organizationName,
      adminName,
      adminEmail,
      adminPassword,
      sites,
      siteName,
      region,
      industryType,
      companySize,
      selectedModules,
    });

    setIsSubmitting(true);
    try {
      const response = await register(payload);
      if (response.isError || !response.success) {
        toast.error(response.message || "Registration failed.");
        return;
      }
      toast.success(response.message || "Client registered.");
      router.push("/super/client-accounts");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registration failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const goContinue = () => {
    if (!currentStepValid) {
      setShowErrors(true);
      return;
    }

    setShowErrors(false);
    if (stepIndex >= SETUP_STEPS.length - 1) {
      void completeSetup();
      return;
    }
    setStepIndex((current) => current + 1);
  };

  const addSite = () => {
    if (!siteName.trim() || !region.trim() || !industryType || !companySize) {
      toast.error("Complete the site form first.");
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

  const removeSite = (id: string) => {
    setSites((current) => current.filter((site) => site.id !== id));
  };

  let stepContent = null;

  if (stepIndex === 0) {
    stepContent = (
      <SetupStepOne
        organizationName={organizationName}
        onOrganizationNameChange={setOrganizationName}
        selectedModules={selectedModules}
        onSelectedModulesChange={setSelectedModules}
        organizationNameError={
          showErrors ? currentErrors.organizationName : undefined
        }
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
        onRemoveSite={removeSite}
        sitesError={showErrors ? currentErrors.sites : undefined}
      />
    );
  } else {
    stepContent = (
      <SetupStepThree
        adminName={adminName}
        onAdminNameChange={setAdminName}
        adminEmail={adminEmail}
        onAdminEmailChange={setAdminEmail}
        adminPassword={adminPassword}
        onAdminPasswordChange={setAdminPassword}
        adminNameError={showErrors ? currentErrors.adminName : undefined}
        adminEmailError={showErrors ? currentErrors.adminEmail : undefined}
        adminPasswordError={showErrors ? currentErrors.adminPassword : undefined}
      />
    );
  }

  const isLastStep = stepIndex === SETUP_STEPS.length - 1;
  const currentStep = SETUP_STEPS[stepIndex] ?? SETUP_STEPS[0];
  const nextStep = SETUP_STEPS[stepIndex + 1];

  let continueLabel = "Continue";
  if (isLastStep) {
    continueLabel = "Complete Setup";
  }

  let backLabel = "Back";
  if (stepIndex === 0) {
    backLabel = "Cancel";
  }

  return (
    <div className="flex flex-col gap-3.5 pb-4">
      <PageHeader
        title="Add New Client"
        description="Walk through onboarding set up"
      />

      {/* The step rail shows where you are; this line says what this step is
          for and what is still ahead, which the icons alone never did.

          It sits above the grid rather than at the top of the form column so
          that both columns begin with a card at the same y. Inside the column
          it pushed the first form card ~60px below the rail beside it, and the
          two read as misaligned even though they were in the same row. */}
      <div
        className="flex flex-col gap-1 px-1"
        role="status"
        aria-live="polite"
      >
        <p className="text-ehs-normal-blue text6">
          Step {stepIndex + 1} of {SETUP_STEPS.length} · {currentStep.label}
        </p>
        <p className="text-ehs-muted-text text8">
          {currentStep.summary}
          {nextStep ? ` Next: ${nextStep.label}.` : " This is the last step."}
        </p>
      </div>

      {/*
        Three grid areas rather than one column: the form keeps a comfortable
        measure on the left (8 of 13 columns, the house split), and the right
        column carries the progress rail above a running summary of what has
        been entered. Below `xl` the same three items stack in reading order —
        rail, form, summary — so the step bar is still the first thing on a
        phone and the summary lands where a review belongs, at the end.

        `xl:grid-rows-[auto_1fr]` is load-bearing. The form spans both rows, and
        against the default `auto auto` a spanning item distributes its extra
        height across every track it covers — so a tall form silently stretched
        row 1 and left a large hole between the rail and the summary beside it.
        Making row 2 the flexible track sends that slack there instead, and row
        1 stays exactly as tall as the rail.
      */}
      <div className="stagger-cards grid gap-3.5 xl:grid-cols-13 xl:grid-rows-[auto_1fr] xl:items-start">
        <aside
          className={`${GLASS_SURFACE} animate-card-rise flex min-w-0 flex-col gap-4 p-4.75 xl:col-span-5 xl:col-start-9 xl:row-start-1`}
        >
          <div className="hidden xl:block">
            <CardHeading
              title="Setup steps"
              subtitle="Three steps, in order. You can go back without losing anything."
            />
          </div>

          <SetupTabBar steps={[...SETUP_STEPS]} activeIndex={stepIndex} />
        </aside>

        <div className="flex min-w-0 flex-col gap-3.5 xl:col-span-8 xl:col-start-1 xl:row-span-2 xl:row-start-1">
          <div className="stagger-cards flex min-w-0 flex-col gap-3.5">
            {stepContent}
          </div>

          {/* The action bar is a surface of its own so it reads as the floor of
              the form rather than as loose text under the last card. */}
          <div
            className={`${GLASS_SURFACE} animate-card-rise flex flex-wrap items-center justify-between gap-3 px-4.75 py-3.5`}
          >
            <Button
              type="button"
              variant="secondary"
              leftIcon={stepIndex === 0 ? undefined : "lucide:chevron-left"}
              onClick={goBack}
              disabled={isSubmitting}
            >
              {backLabel}
            </Button>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-ehs-muted-text text8">
                Nothing is saved until you finish the last step.
              </span>
              <Button
                type="button"
                rightIcon={isLastStep ? undefined : "lucide:chevron-right"}
                onClick={goContinue}
                loading={isSubmitting}
                loadingText="Creating client…"
              >
                {continueLabel}
              </Button>
            </div>
          </div>
        </div>

        <WizardSummaryRail
          organizationName={organizationName}
          selectedModules={selectedModules}
          sites={sites}
          pendingSiteName={siteName}
          adminName={adminName}
          adminEmail={adminEmail}
          activeStepIndex={stepIndex}
          className="xl:col-span-5 xl:col-start-9 xl:row-start-2"
        />
      </div>

      <ConfirmDialog
        open={cancelOpen}
        title="Leave without creating this client?"
        description="Nothing has been sent to the server yet, so everything typed into these three steps is discarded."
        confirmLabel="Discard and leave"
        cancelLabel="Stay here"
        onCancel={() => setCancelOpen(false)}
        onConfirm={leaveWizard}
      />
    </div>
  );
}
