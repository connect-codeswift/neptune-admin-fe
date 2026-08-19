"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import {
  CheckBoxInput,
  DateInput,
  SelectInput,
  TextAreaInput,
  TextInput,
} from "@/components/inputs";
import { PageHeader } from "@/components/layouts";
import { Button, ConfirmDialog, IconButton } from "@/components/ui";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import {
  useCreateRegulation,
} from "@/hooks/useRegulationLibrary";
import { mapRegulationFormToCreatePayload } from "@/lib/mappers/compliance.mapper";
import {
  ORDINANCE_REQUIREMENT_EXAMPLE,
  REGULATION_CATEGORY_OPTIONS,
  REGULATION_JURISDICTION_OPTIONS,
  REGULATION_REVIEW_CYCLE_OPTIONS,
} from "./regulation-form.constants";
import { useRegulationLibraryPaths } from "./useRegulationLibraryPaths";

const DEFAULT_JURISDICTION = "federal-us";
const DEFAULT_CATEGORY = "safety";
const DEFAULT_REVIEW_CYCLE = "annual";

function QuickReferenceRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-ehs-border-ink/8 py-2.5 last:border-b-0">
      <span className="text8 text-ehs-muted-text">{label}</span>
      <span className="min-w-0 truncate text-right text4 text-ehs-darker" title={value}>
        {value}
      </span>
    </div>
  );
}

export function AddRegulationPage() {
  const router = useRouter();
  const formId = useId();
  const { adminHref, basePath } = useRegulationLibraryPaths();
  const createRegulation = useCreateRegulation();

  const [citationCode, setCitationCode] = useState("");
  const [title, setTitle] = useState("");
  const [issuingAgency, setIssuingAgency] = useState("");
  const [jurisdiction, setJurisdiction] = useState(DEFAULT_JURISDICTION);
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [effectiveDate, setEffectiveDate] = useState("");
  const [regulatoryOverview, setRegulatoryOverview] = useState("");
  const [requirementSummary, setRequirementSummary] = useState("");
  const [reviewCycle, setReviewCycle] = useState(DEFAULT_REVIEW_CYCLE);
  const [monitorCompliance, setMonitorCompliance] = useState(true);
  const [alertOnUpdates, setAlertOnUpdates] = useState(true);
  const [trackLastReview, setTrackLastReview] = useState(false);
  const [requirements, setRequirements] = useState<string[]>([""]);
  /** Field errors stay quiet until a field is left or a save is attempted. */
  const [showErrors, setShowErrors] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const handleAddRequirement = () => {
    setRequirements((current) => [...current, ""]);
  };

  const handleRequirementChange = (index: number, value: string) => {
    setRequirements((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements((current) =>
      current.length === 1
        ? [""]
        : current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const trimmedCitation = citationCode.trim();
  const trimmedTitle = title.trim();
  const trimmedOverview = regulatoryOverview.trim();

  // The three fields the create payload cannot be built without. They used to
  // be checked in one toast after the fact, which named all three whichever one
  // was missing and left the user hunting.
  let citationError: string | undefined;
  if (showErrors && trimmedCitation === "") {
    citationError = "Required — the citation is how the regulation is looked up.";
  }

  let titleError: string | undefined;
  if (showErrors && trimmedTitle === "") {
    titleError = "Required — this is the name shown in the library.";
  }

  let overviewError: string | undefined;
  if (showErrors && trimmedOverview === "") {
    overviewError = "Required — it doubles as the issuing agency when none is given.";
  }

  const isComplete =
    trimmedCitation !== "" && trimmedTitle !== "" && trimmedOverview !== "";

  const isDirty =
    trimmedCitation !== "" ||
    trimmedTitle !== "" ||
    issuingAgency.trim() !== "" ||
    trimmedOverview !== "" ||
    requirementSummary.trim() !== "" ||
    effectiveDate !== "" ||
    jurisdiction !== DEFAULT_JURISDICTION ||
    category !== DEFAULT_CATEGORY ||
    reviewCycle !== DEFAULT_REVIEW_CYCLE ||
    !monitorCompliance ||
    !alertOnUpdates ||
    trackLastReview ||
    requirements.some((requirement) => requirement.trim() !== "");

  const handleCancel = () => {
    if (isDirty) {
      setConfirmDiscard(true);
      return;
    }
    router.push(basePath);
  };

  const handleSave = async () => {
    if (!isComplete) {
      setShowErrors(true);
      return;
    }

    try {
      await createRegulation.mutateAsync(
        mapRegulationFormToCreatePayload({
          citationCode,
          title,
          issuingAgency: issuingAgency.trim() || regulatoryOverview.trim(),
          jurisdiction,
          category,
          effectiveDate,
          reviewCycle,
        }),
      );
      toast.success("Regulation saved.");
      router.push(basePath);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save regulation.",
      );
    }
  };

  const quickReferenceCode = trimmedCitation || "—";

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Add New Regulation"
        description="Register a new regulation to the platform for compliance tracking."
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "Regulations", href: basePath },
          { label: "Add Regulation" },
        ]}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={createRegulation.isPending}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              leftIcon="lucide:save"
              loading={createRegulation.isPending}
              loadingText="Saving…"
              disabled={!isComplete}
              onClick={handleSave}
            >
              Save Regulation
            </Button>
          </>
        }
      />

      {/* Half of this form is not stored yet. Saying so once, up front, is
          kinder than nine "coming soon" helper texts — and much kinder than
          letting someone type out twelve ordinance requirements that the
          create call silently drops. */}
      <div className="flex items-start gap-2.5 rounded-xl border border-ehs-warning-border bg-ehs-warning-surface px-4 py-3">
        <Icon
          icon="lucide:triangle-alert"
          width={16}
          height={16}
          className="mt-0.5 shrink-0 text-ehs-warning-ink"
          aria-hidden="true"
        />
        <p className="text8 text-ehs-warning-ink">
          Only the identification fields and the review cycle are stored today.
          The requirement summary, the ordinance requirements and the monitoring
          options below are captured for review but are not yet saved with the
          regulation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <DetailCard
            title="Regulation Identification"
            description="How the regulation is cited, who issues it, and where it applies."
          >
            <div className="flex flex-col gap-4">
              <TextInput
                label="Citation Code"
                placeholder="e.g., 29 CFR Part 1910 Subpart J (1910.141-147, 1910.151, 1910.157, 1910.165)"
                helperText="The full citation, as it is written in the source document."
                value={citationCode}
                error={citationError}
                onChange={(event) => setCitationCode(event.target.value)}
                onBlur={() => setShowErrors(true)}
                required
              />
              <TextInput
                label="Regulation Title"
                placeholder="e.g., Occupational Health and Safety — General Industry"
                value={title}
                error={titleError}
                onChange={(event) => setTitle(event.target.value)}
                onBlur={() => setShowErrors(true)}
                required
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextInput
                  label="Issuing Agency"
                  placeholder="e.g., OSHA"
                  helperText="Defaults to OSHA when left empty."
                  value={issuingAgency}
                  onChange={(event) => setIssuingAgency(event.target.value)}
                />
                <SelectInput
                  label="Jurisdiction"
                  options={REGULATION_JURISDICTION_OPTIONS}
                  value={jurisdiction}
                  onChange={setJurisdiction}
                />
                <SelectInput
                  label="Category"
                  options={REGULATION_CATEGORY_OPTIONS}
                  value={category}
                  onChange={setCategory}
                />
                <DateInput
                  label="Effective Date"
                  value={effectiveDate}
                  onChange={setEffectiveDate}
                />
              </div>
            </div>
          </DetailCard>

          <DetailCard title="Summary & Scope">
            <div className="flex flex-col gap-4">
              <TextAreaInput
                label="Regulatory Overview"
                placeholder="Briefly describe what this regulation covers, who it applies to, and the key compliance obligations…"
                rows={5}
                value={regulatoryOverview}
                error={overviewError}
                onChange={(event) => setRegulatoryOverview(event.target.value)}
                onBlur={() => setShowErrors(true)}
                required
              />
              <TextAreaInput
                label="General Requirement Summary"
                placeholder="e.g., OSHA 1910.147, Lockout/Tagout requires…"
                rows={4}
                value={requirementSummary}
                onChange={(event) => setRequirementSummary(event.target.value)}
              />
            </div>
          </DetailCard>

          <DetailCard
            title="Ordinance Requirements"
            description="Specific requirements from the regulation, for compliance tracking."
            action={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon="lucide:plus"
                onClick={handleAddRequirement}
              >
                Add New
              </Button>
            }
          >
            <div className="mb-4 flex items-start gap-2.5 rounded-[10px] border border-ehs-normal-blue/20 bg-ehs-normal-blue/8 px-3.5 py-3">
              <Icon
                icon="lucide:info"
                width={16}
                height={16}
                className="mt-0.5 shrink-0 text-ehs-normal-blue"
                aria-hidden="true"
              />
              <p className="text8 text-ehs-slate">
                {ORDINANCE_REQUIREMENT_EXAMPLE}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {requirements.map((requirement, index) => (
                <div
                  key={`${formId}-requirement-${index + 1}`}
                  className="flex items-start gap-2"
                >
                  <TextInput
                    aria-label={`Requirement ${index + 1}`}
                    placeholder="Enter a specific compliance requirement"
                    value={requirement}
                    onChange={(event) =>
                      handleRequirementChange(index, event.target.value)
                    }
                    containerClassName="min-w-0 flex-1"
                  />
                  <IconButton
                    icon="lucide:trash-2"
                    label={`Remove requirement ${index + 1}`}
                    size="md"
                    variant="soft"
                    onClick={() => handleRemoveRequirement(index)}
                    disabled={requirements.length === 1 && !requirement}
                  />
                </div>
              ))}
            </div>
          </DetailCard>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <DetailCard title="Review & Monitoring">
            <div className="flex flex-col gap-4">
              <SelectInput
                label="Review Cycle"
                options={REGULATION_REVIEW_CYCLE_OPTIONS}
                value={reviewCycle}
                onChange={setReviewCycle}
              />

              <CheckBoxInput
                label="Monitor compliance tracking"
                helperText="Track against the tasks and evidence required for this regulation."
                checked={monitorCompliance}
                onChange={(event) => setMonitorCompliance(event.target.checked)}
              />
              <CheckBoxInput
                label="Alert on regulatory updates"
                helperText="Notify relevant administrators if a regulation is updated or changed."
                checked={alertOnUpdates}
                onChange={(event) => setAlertOnUpdates(event.target.checked)}
              />
              <CheckBoxInput
                label="Last review conducted"
                helperText="Keep record of the last time this regulation was reviewed."
                checked={trackLastReview}
                onChange={(event) => setTrackLastReview(event.target.checked)}
              />
            </div>
          </DetailCard>

          <DetailCard
            title="Quick Reference"
            description="Information regarding specific citations."
          >
            <div className="flex flex-col">
              <QuickReferenceRow label="Citation Code" value={quickReferenceCode} />
              <QuickReferenceRow label="Version" value="v1.0 — draft" />
              <QuickReferenceRow label="Last Revised" value="Not yet published" />
              <QuickReferenceRow label="JSON Code" value="Pending" />
              <QuickReferenceRow label="ID" value="Assigned on save" />
            </div>
          </DetailCard>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard this regulation?"
        description="Nothing has been saved yet. Leaving now loses everything typed on this form."
        cancelLabel="Keep editing"
        confirmLabel="Discard"
        confirmVariant="danger"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false);
          router.push(basePath);
        }}
      />
    </div>
  );
}
