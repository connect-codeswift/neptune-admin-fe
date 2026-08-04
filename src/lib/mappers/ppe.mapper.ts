import type { CreatePpePayload } from "@/dtos/req/ppe.req";
import type { PpeResponse } from "@/dtos/res/ppe.res";
import {
  getCategoryLabel,
  type DummyPpeItem,
  type PpeCategoryId,
} from "@/lib/dummy-ppe-catalog";

const CATEGORY_ID_BY_KEYWORD: Array<{ keywords: string[]; id: PpeCategoryId }> =
  [
    { keywords: ["eye", "face"], id: "eye-face" },
    { keywords: ["head", "helmet", "hard hat"], id: "head" },
    { keywords: ["respiratory", "respirator", "n95"], id: "respiratory" },
    { keywords: ["hand", "glove"], id: "hand" },
    { keywords: ["foot", "leg", "boot"], id: "foot-leg" },
    { keywords: ["fall", "harness"], id: "fall" },
    { keywords: ["hearing", "ear"], id: "hearing" },
    { keywords: ["body", "vest", "hi-vis"], id: "body" },
  ];

export function inferPpeCategoryId(category: string): PpeCategoryId {
  const normalized = category.toLowerCase();
  for (const entry of CATEGORY_ID_BY_KEYWORD) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.id;
    }
  }
  return "body";
}

export function mapPpeResponseToCatalogItem(ppe: PpeResponse): DummyPpeItem {
  const category = ppe.category?.trim() || "General PPE";
  const categoryId = inferPpeCategoryId(category);
  const supplier = ppe.supplier?.trim() || "—";
  const stock = ppe.inStock ?? 0;
  const minStock = ppe.minStock ?? 0;

  return {
    id: String(ppe.id ?? crypto.randomUUID()),
    name: supplier !== "—" ? supplier : category,
    modelNumber: ppe.availableSize?.trim() || "—",
    manufacturer: supplier,
    categoryId,
    categoryLabel: getCategoryLabel(categoryId) || category,
    safetyStandard: ppe.status?.trim() || "—",
    stock,
    minStockLevel: minStock,
    inspectInterval: ppe.inspectionInterval?.trim() || "—",
    lifespan: ppe.replaceAfter?.trim() || "—",
    hazardTypes: category !== "General PPE" ? [category] : [],
    trainingRequired: false,
  };
}

export function mapCatalogDraftToCreatePayload(input: {
  name: string;
  modelNumber: string;
  manufacturer: string;
  safetyStandard: string;
  categoryLabel: string;
  minStockLevel: number;
}): CreatePpePayload {
  return {
    category: input.categoryLabel,
    supplier: input.manufacturer.trim() || input.name.trim() || null,
    availableSize: input.modelNumber.trim() || null,
    minStock: input.minStockLevel,
    inStock: input.minStockLevel,
    inspectionInterval: "Monthly",
    replaceAfter: null,
    status: input.safetyStandard.trim() || "Active",
  };
}

export function mapPpeResponsesToCatalogItems(
  items: PpeResponse[],
): DummyPpeItem[] {
  return items.map(mapPpeResponseToCatalogItem);
}
