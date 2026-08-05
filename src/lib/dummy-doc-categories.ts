export type DummyDocumentCategory = {
  id: string;
  name: string;
  description: string;
  slug: string;
  documentCount: number;
  required?: boolean;
  deletable?: boolean;
};

export const DUMMY_DOCUMENT_CATEGORIES: DummyDocumentCategory[] = [
  {
    id: "policy",
    name: "Policy",
    description: "Company-wide safety and compliance policies",
    slug: "/policy",
    documentCount: 47,
    required: true,
  },
  {
    id: "procedure",
    name: "Procedure",
    description: "Standard operating procedures and step-by-step workflows",
    slug: "/procedure",
    documentCount: 89,
    required: true,
  },
  {
    id: "work-instruction",
    name: "Work Instruction",
    description: "Detailed task-level instructions for specific job activities",
    slug: "/work-instruction",
    documentCount: 112,
    required: true,
  },
  {
    id: "sds",
    name: "SDS",
    description: "Safety Data Sheets for hazardous materials and chemicals",
    slug: "/sds",
    documentCount: 156,
    required: true,
  },
  {
    id: "training-material",
    name: "Training Material",
    description: "Training guides, courses, and competency resources",
    slug: "/training-material",
    documentCount: 98,
    required: true,
  },
  {
    id: "permit-template",
    name: "Permit Template",
    description: "Templates for work permits and authorization forms",
    slug: "/permit-template",
    documentCount: 76,
    required: true,
  },
  {
    id: "form",
    name: "Form",
    description: "General-purpose forms and checklists used across sites",
    slug: "/form",
    documentCount: 54,
    deletable: true,
  },
  {
    id: "regulation-reference",
    name: "Regulation Reference",
    description: "External regulations, standards, and compliance references",
    slug: "/regulation-reference",
    documentCount: 95,
    deletable: true,
  },
];

export function getDocumentCategoryStats(
  categories: DummyDocumentCategory[] = DUMMY_DOCUMENT_CATEGORIES,
) {
  return {
    totalCategories: categories.length,
    totalDocuments: categories.reduce(
      (sum, category) => sum + category.documentCount,
      0,
    ),
    requiredCategories: categories.filter((category) => category.required)
      .length,
  };
}

export function getDummyDocumentCategory(
  id: string,
): DummyDocumentCategory | undefined {
  return DUMMY_DOCUMENT_CATEGORIES.find((category) => category.id === id);
}
