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
import { Button, IconButton } from "@/components/ui";
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

function QuickReferenceRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-darkest/8 py-2.5 last:border-b-0">
      <span className="text6 text-gray">{label}</span>
      <span className="text-right text5 text-darkest">{value}</span>
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
  const [jurisdiction, setJurisdiction] = useState("federal-us");
  const [category, setCategory] = useState("safety");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [regulatoryOverview, setRegulatoryOverview] = useState("");
  const [requirementSummary, setRequirementSummary] = useState("");
  const [reviewCycle, setReviewCycle] = useState("annual");
  const [monitorCompliance, setMonitorCompliance] = useState(true);
  const [alertOnUpdates, setAlertOnUpdates] = useState(true);
  const [trackLastReview, setTrackLastReview] = useState(false);
  const [requirements, setRequirements] = useState<string[]>([""]);

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

  const handleSave = async () => {
    if (!citationCode.trim() || !title.trim() || !regulatoryOverview.trim()) {
      toast.error("Citation code, regulation title, and regulatory overview are required.");
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

  const quickReferenceCode = citationCode.trim() || "—";

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
            <Button variant="secondary" size="sm" href={basePath}>
              Cancel
            </Button>
            <Button
              size="sm"
              leftIcon="lucide:save"
              loading={createRegulation.isPending}
              loadingText="Saving…"
              onClick={handleSave}
            >
              Save Regulation
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <DetailCard title="Regulation Identification">
            <div className="flex flex-col gap-4">
              <TextInput
                label="Citation Code"
                placeholder="e.g., 29 CFR Part 1910 Subpart J (1910.141-147, 1910.151, 1910.157, 1910.165)"
                value={citationCode}
                onChange={(event) => setCitationCode(event.target.value)}
                required
              />
              <TextInput
                label="Regulation Title"
                placeholder="e.g., Occupational Health and Safety — General Industry"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextInput
                  label="Issuing Agency"
                  placeholder="e.g., OSHA"
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
                onChange={(event) => setRegulatoryOverview(event.target.value)}
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
            <p className="mb-4 text5 text-gray">
              Enter specific requirements from the regulation for compliance
              tracking.
            </p>

            <div className="mb-4 flex items-start gap-2.5 rounded-[10px] border border-blue-normal/20 bg-blue-normal/8 px-3.5 py-3">
              <Icon
                icon="lucide:info"
                width={16}
                height={16}
                className="mt-0.5 shrink-0 text-blue-normal"
                aria-hidden
              />
              <p className="text6 text-darkest">{ORDINANCE_REQUIREMENT_EXAMPLE}</p>
            </div>

            <div className="flex flex-col gap-3">
              {requirements.map((requirement, index) => (
                <div
                  key={`${formId}-requirement-${index + 1}`}
                  className="flex items-start gap-2"
                >
                  <TextInput
                    placeholder="Enter a specific compliance requirement"
                    value={requirement}
                    onChange={(event) =>
                      handleRequirementChange(index, event.target.value)
                    }
                    containerClassName="flex-1"
                  />
                  <IconButton
                    icon="lucide:trash-2"
                    label={`Remove requirement ${index + 1}`}
                    size="sm"
                    variant="soft"
                    onClick={() => handleRemoveRequirement(index)}
                    disabled={requirements.length === 1 && !requirement}
                  />
                </div>
              ))}
            </div>
          </DetailCard>
        </div>

        <div className="flex flex-col gap-6">
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
    </div>
  );
}
