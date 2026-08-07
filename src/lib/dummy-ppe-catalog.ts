export type PpeCategoryId =
  | "eye-face"
  | "head"
  | "respiratory"
  | "hand"
  | "foot-leg"
  | "fall"
  | "hearing"
  | "body";

export type DummyPpeItem = {
  id: string;
  name: string;
  modelNumber: string;
  manufacturer: string;
  categoryId: PpeCategoryId;
  categoryLabel: string;
  safetyStandard: string;
  stock: number;
  minStockLevel: number;
  inspectInterval: string;
  lifespan: string;
  hazardTypes: string[];
  trainingRequired: boolean;
};

export const PPE_CATEGORIES: Array<{
  id: PpeCategoryId | "all";
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "eye-face", label: "Eye & Face Protection" },
  { id: "head", label: "Head Protection" },
  { id: "respiratory", label: "Respiratory Protection" },
  { id: "hand", label: "Hand Protection" },
  { id: "foot-leg", label: "Foot & Leg Protection" },
  { id: "fall", label: "Fall Protection" },
  { id: "hearing", label: "Hearing Protection" },
  { id: "body", label: "Body Protection" },
];

export const PPE_CATEGORY_OPTIONS = PPE_CATEGORIES.filter(
  (category) => category.id !== "all",
).map((category) => ({
  value: category.id,
  label: category.label,
}));

export const DUMMY_PPE_ITEMS: DummyPpeItem[] = [
  {
    id: "ppe-1",
    name: "3M Safety Glasses — Clear Lens",
    modelNumber: "11648-00000-20",
    manufacturer: "3M Safety",
    categoryId: "eye-face",
    categoryLabel: "Eye & Face Protection",
    safetyStandard: "ANSI Z87.1+",
    stock: 245,
    minStockLevel: 50,
    inspectInterval: "Monthly",
    lifespan: "2 years",
    hazardTypes: ["Flying debris", "Chemical splash", "UV radiation"],
    trainingRequired: false,
  },
  {
    id: "ppe-2",
    name: "Hard Hat — Type I Class E",
    modelNumber: "475407",
    manufacturer: "MSA V-Gard",
    categoryId: "head",
    categoryLabel: "Head Protection",
    safetyStandard: "ANSI/ISEA Z89.1",
    stock: 186,
    minStockLevel: 40,
    inspectInterval: "Monthly",
    lifespan: "5 years",
    hazardTypes: ["Falling objects", "Electrical hazard"],
    trainingRequired: false,
  },
  {
    id: "ppe-3",
    name: "N95 Respirator — 3M 8210",
    modelNumber: "07048-00000",
    manufacturer: "3M Safety",
    categoryId: "respiratory",
    categoryLabel: "Respiratory Protection",
    safetyStandard: "NIOSH N95",
    stock: 420,
    minStockLevel: 100,
    inspectInterval: "Daily pre-use",
    lifespan: "Single use",
    hazardTypes: ["Dust", "Particulates", "Smoke"],
    trainingRequired: true,
  },
  {
    id: "ppe-4",
    name: "Nitrile Gloves — Heavy Duty",
    modelNumber: "92-600",
    manufacturer: "Ansell TouchNTuff",
    categoryId: "hand",
    categoryLabel: "Hand Protection",
    safetyStandard: "ANSI/ISEA 105",
    stock: 1200,
    minStockLevel: 200,
    inspectInterval: "Before each use",
    lifespan: "Single use",
    hazardTypes: ["Chemicals", "Oils", "Punctures"],
    trainingRequired: false,
  },
  {
    id: "ppe-5",
    name: "Steel Toe Boots — 6″",
    modelNumber: "475407",
    manufacturer: "Timberland PRO",
    categoryId: "foot-leg",
    categoryLabel: "Foot & Leg Protection",
    safetyStandard: "ASTM F2413",
    stock: 98,
    minStockLevel: 30,
    inspectInterval: "Monthly",
    lifespan: "1 year",
    hazardTypes: ["Crushing", "Puncture", "Slip"],
    trainingRequired: false,
  },
  {
    id: "ppe-6",
    name: "Full Body Harness — DBI-SALA ExoFit",
    modelNumber: "1113101",
    manufacturer: "DBI-SALA",
    categoryId: "fall",
    categoryLabel: "Fall Protection",
    safetyStandard: "ANSI Z359.11",
    stock: 34,
    minStockLevel: 15,
    inspectInterval: "Before each use",
    lifespan: "5 years",
    hazardTypes: ["Falls from height"],
    trainingRequired: true,
  },
  {
    id: "ppe-7",
    name: "Ear Plugs — Foam",
    modelNumber: "3301105",
    manufacturer: "Howard Leight MAX",
    categoryId: "hearing",
    categoryLabel: "Hearing Protection",
    safetyStandard: "ANSI S3.19",
    stock: 850,
    minStockLevel: 150,
    inspectInterval: "Daily",
    lifespan: "Single use",
    hazardTypes: ["Noise", "Loud machinery"],
    trainingRequired: false,
  },
  {
    id: "ppe-8",
    name: "Hi-Vis Safety Vest — Class 2",
    modelNumber: "1510",
    manufacturer: "ML Kishigo",
    categoryId: "body",
    categoryLabel: "Body Protection",
    safetyStandard: "ANSI/ISEA 107",
    stock: 312,
    minStockLevel: 60,
    inspectInterval: "Monthly",
    lifespan: "2 years",
    hazardTypes: ["Low visibility", "Traffic"],
    trainingRequired: false,
  },
];

export function getPpeCatalogStats(items: DummyPpeItem[]) {
  const categoryIds = new Set(items.map((item) => item.categoryId));

  return {
    totalTypes: items.length,
    categories: categoryIds.size,
    lowStock: items.filter((item) => item.stock <= item.minStockLevel).length,
    requireTraining: items.filter((item) => item.trainingRequired).length,
  };
}

export function getPpeCategoryCounts(items: DummyPpeItem[]) {
  const counts = new Map<PpeCategoryId | "all", number>();
  counts.set("all", items.length);

  for (const category of PPE_CATEGORIES) {
    if (category.id === "all") continue;
    counts.set(
      category.id,
      items.filter((item) => item.categoryId === category.id).length,
    );
  }

  return counts;
}

export function getCategoryLabel(categoryId: PpeCategoryId): string {
  return (
    PPE_CATEGORY_OPTIONS.find((option) => option.value === categoryId)?.label ??
    categoryId
  );
}
