export type RegulationStatus = "active" | "draft" | "archived";

export type DummyRegulation = {
  id: string;
  code: string;
  title: string;
  description: string;
  status: RegulationStatus;
  isPolicy: boolean;
  safetyLevel: boolean;
  tags: string[];
  compliancePercent: number;
};

export const DUMMY_REGULATIONS: DummyRegulation[] = [
  {
    id: "loto",
    code: "OSH 29 CFR 1910.147",
    title: "Control of Hazardous Energy (LOTO)",
    description:
      "Requirements for controlling hazardous energy during servicing and maintenance of machines and equipment.",
    status: "active",
    isPolicy: true,
    safetyLevel: true,
    tags: ["Hazardous Materials", "Equipment Safety"],
    compliancePercent: 94,
  },
  {
    id: "ppe-general",
    code: "OSH 29 CFR 1910.132",
    title: "Personal Protective Equipment (General)",
    description:
      "General requirements for personal protective equipment including selection, use, and maintenance standards.",
    status: "active",
    isPolicy: true,
    safetyLevel: false,
    tags: ["PPE", "Workplace Safety"],
    compliancePercent: 88,
  },
  {
    id: "iipp",
    code: "Cal/OSH Title 8 §3203",
    title: "Injury and Illness Prevention Program",
    description:
      "Employer responsibilities for establishing, implementing, and maintaining an effective IIPP.",
    status: "draft",
    isPolicy: false,
    safetyLevel: false,
    tags: ["Injury Prevention", "Training"],
    compliancePercent: 97,
  },
  {
    id: "aai",
    code: "EPA 40 CFR 312",
    title: "Innocent Landowner Defense — All Appropriate Inquiries",
    description:
      "Standards for conducting all appropriate inquiries into the previous ownership and uses of a property.",
    status: "draft",
    isPolicy: false,
    safetyLevel: false,
    tags: ["Environmental", "Due Diligence"],
    compliancePercent: 78,
  },
  {
    id: "eye-face",
    code: "ANSI/ISEA Z87.1",
    title:
      "Occupational and Educational Personal Eye and Face Protection Devices",
    description:
      "Performance requirements for protectors used in occupational and educational settings.",
    status: "archived",
    isPolicy: false,
    safetyLevel: false,
    tags: ["PPE", "Eye Protection"],
    compliancePercent: 92,
  },
  {
    id: "electrical-safety",
    code: "NFPA 70E",
    title: "Standard for Electrical Safety in the Workplace",
    description:
      "Requirements for safe work practices to protect personnel from electrical hazards.",
    status: "archived",
    isPolicy: true,
    safetyLevel: false,
    tags: ["Electrical", "Arc Flash"],
    compliancePercent: 85,
  },
];

export function getRegulationStats(
  regulations: DummyRegulation[] = DUMMY_REGULATIONS,
) {
  const activeCount = regulations.filter(
    (regulation) => regulation.status === "active",
  ).length;
  const safetyLevelCount = regulations.filter(
    (regulation) => regulation.safetyLevel,
  ).length;
  const avgCompliance =
    regulations.length === 0
      ? 0
      : Math.round(
          regulations.reduce(
            (sum, regulation) => sum + regulation.compliancePercent,
            0,
          ) / regulations.length,
        );

  return {
    total: regulations.length,
    active: activeCount,
    safetyLevel: safetyLevelCount,
    avgCompliance,
  };
}

export function getDummyRegulation(
  id: string,
): DummyRegulation | undefined {
  return DUMMY_REGULATIONS.find((regulation) => regulation.id === id);
}
