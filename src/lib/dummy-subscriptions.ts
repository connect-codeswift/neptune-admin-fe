import { DUMMY_ORGANIZATIONS } from "@/lib/dummy-organizations";
import { getModuleLabel } from "@/lib/ehs-modules";
import {
  DEFAULT_PRICING_RATES,
  getModulePrice,
  type PricingRates,
} from "@/lib/pricing-rates";

export type SubscriptionLineItemKind = "users" | "site" | "module";

/**
 * A single agreed charge on a subscription. Prices are frozen when the
 * subscription is saved — later rate card edits never reach back into it.
 */
export type SubscriptionLineItem = {
  kind: SubscriptionLineItemKind;
  /** Module id, or a fixed key for the user and site lines. */
  key: string;
  label: string;
  quantity: number;
  unitPrice: number;
  total: number;
  overridden: boolean;
};

export type SubscriptionStatus =
  | "draft"
  | "pending"
  | "active"
  | "expired"
  | "cancelled";

export type Subscription = {
  id: string;
  organizationId: string;
  organizationName: string;
  licensedUsers: number;
  siteCount: number;
  modules: string[];
  lineItems: SubscriptionLineItem[];
  yearlyTotal: number;
  termStart: string;
  termEnd: string;
  status: SubscriptionStatus;
  notes: string;
};

export type SubscriptionDraftInput = {
  licensedUsers: number;
  siteCount: number;
  modules: string[];
};

export const SUBSCRIPTION_STATUS_OPTIONS: {
  value: SubscriptionStatus;
  label: string;
}[] = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

export function getSubscriptionStatusLabel(status: SubscriptionStatus): string {
  return (
    SUBSCRIPTION_STATUS_OPTIONS.find((option) => option.value === status)
      ?.label ?? status
  );
}

export function lineItemId(kind: SubscriptionLineItemKind, key: string): string {
  return `${kind}:${key}`;
}

/** Seeds line items from the current rate card at the quantities requested. */
export function buildLineItems(
  rates: PricingRates,
  input: SubscriptionDraftInput,
): SubscriptionLineItem[] {
  const users = Math.max(input.licensedUsers, 0);
  const siteCount = Math.max(input.siteCount, 0);

  const items: SubscriptionLineItem[] = [
    {
      kind: "users",
      key: "users",
      label: "Licensed users",
      quantity: users,
      unitPrice: rates.pricePerUser,
      total: users * rates.pricePerUser,
      overridden: false,
    },
    {
      kind: "site",
      key: "sites",
      label: "Sites",
      quantity: siteCount,
      unitPrice: rates.pricePerSite,
      total: siteCount * rates.pricePerSite,
      overridden: false,
    },
  ];

  for (const moduleId of input.modules) {
    const unitPrice = getModulePrice(rates, moduleId);
    items.push({
      kind: "module",
      key: moduleId,
      label: getModuleLabel(moduleId),
      quantity: 1,
      unitPrice,
      total: unitPrice,
      overridden: false,
    });
  }

  return items;
}

/**
 * Re-seeds line items for changed quantities while preserving any price the
 * salesman has already negotiated on a line that still exists.
 */
export function reseedLineItems(
  rates: PricingRates,
  input: SubscriptionDraftInput,
  existing: SubscriptionLineItem[],
): SubscriptionLineItem[] {
  const overrides = new Map(
    existing
      .filter((item) => item.overridden)
      .map((item) => [lineItemId(item.kind, item.key), item.unitPrice]),
  );

  return buildLineItems(rates, input).map((item) => {
    const override = overrides.get(lineItemId(item.kind, item.key));
    if (override === undefined) return item;

    return {
      ...item,
      unitPrice: override,
      total: override * item.quantity,
      overridden: true,
    };
  });
}

export function applyOverride(
  lineItems: SubscriptionLineItem[],
  kind: SubscriptionLineItemKind,
  key: string,
  unitPrice: number,
): SubscriptionLineItem[] {
  const targetId = lineItemId(kind, key);

  return lineItems.map((item) => {
    if (lineItemId(item.kind, item.key) !== targetId) return item;
    return {
      ...item,
      unitPrice,
      total: unitPrice * item.quantity,
      overridden: true,
    };
  });
}

export function clearOverride(
  rates: PricingRates,
  lineItems: SubscriptionLineItem[],
  kind: SubscriptionLineItemKind,
  key: string,
): SubscriptionLineItem[] {
  const targetId = lineItemId(kind, key);

  return lineItems.map((item) => {
    if (lineItemId(item.kind, item.key) !== targetId) return item;

    let unitPrice = 0;
    if (item.kind === "users") unitPrice = rates.pricePerUser;
    else if (item.kind === "site") unitPrice = rates.pricePerSite;
    else unitPrice = getModulePrice(rates, item.key);

    return {
      ...item,
      unitPrice,
      total: unitPrice * item.quantity,
      overridden: false,
    };
  });
}

export function sumLineItems(lineItems: SubscriptionLineItem[]): number {
  return lineItems.reduce((sum, item) => sum + item.total, 0);
}

export function getLineItemsByKind(
  lineItems: SubscriptionLineItem[],
  kind: SubscriptionLineItemKind,
): SubscriptionLineItem[] {
  return lineItems.filter((item) => item.kind === kind);
}

export function getKindSubtotal(
  lineItems: SubscriptionLineItem[],
  kind: SubscriptionLineItemKind,
): number {
  return sumLineItems(getLineItemsByKind(lineItems, kind));
}

export function addYearMinusDay(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;

  date.setFullYear(date.getFullYear() + 1);
  date.setDate(date.getDate() - 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatTerm(termStart: string, termEnd: string): string {
  return `${termStart} → ${termEnd}`;
}

function buildDummySubscription(
  orgId: string,
  licensedUsers: number,
  modules: string[],
  status: SubscriptionStatus,
  termStart: string,
  userPriceOverride?: number,
): Subscription {
  const org = DUMMY_ORGANIZATIONS.find((entry) => entry.id === orgId);
  const siteCount = org?.siteCount ?? 1;

  let lineItems = buildLineItems(DEFAULT_PRICING_RATES, {
    licensedUsers,
    siteCount,
    modules,
  });

  if (userPriceOverride !== undefined) {
    lineItems = applyOverride(
      lineItems,
      "users",
      "users",
      userPriceOverride,
    );
  }

  return {
    id: `sub-${orgId}`,
    organizationId: orgId,
    organizationName: org?.name ?? `Organization ${orgId}`,
    licensedUsers,
    siteCount,
    modules,
    lineItems,
    yearlyTotal: sumLineItems(lineItems),
    termStart,
    termEnd: addYearMinusDay(termStart),
    status,
    notes: "",
  };
}

export const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  buildDummySubscription(
    "1",
    50,
    [
      "incident",
      "hazard",
      "capa",
      "near-miss",
      "ppe-management",
    ],
    "active",
    "2026-03-01",
  ),
  buildDummySubscription(
    "2",
    120,
    [
      "incident",
      "hazard",
      "capa",
      "near-miss",
      "ppe-management",
      "audits",
    ],
    "active",
    "2025-11-15",
    120,
  ),
  buildDummySubscription(
    "3",
    25,
    ["incident", "hazard"],
    "draft",
    "2026-05-20",
  ),
];

export function getSubscriptionForOrganization(
  subscriptions: Subscription[],
  organizationId: string,
): Subscription | null {
  return (
    subscriptions.find((entry) => entry.organizationId === organizationId) ??
    null
  );
}

export function getSubscriptionStats(
  subscriptions: Subscription[],
  referenceDate: Date = new Date(),
) {
  const active = subscriptions.filter((entry) => entry.status === "active");
  const totalArr = active.reduce((sum, entry) => sum + entry.yearlyTotal, 0);

  const ninetyDaysOut = new Date(referenceDate);
  ninetyDaysOut.setDate(ninetyDaysOut.getDate() + 90);

  const expiringSoon = active.filter((entry) => {
    const end = new Date(`${entry.termEnd}T00:00:00`);
    if (Number.isNaN(end.getTime())) return false;
    return end >= referenceDate && end <= ninetyDaysOut;
  }).length;

  return {
    total: subscriptions.length,
    active: active.length,
    totalArr,
    expiringSoon,
  };
}

export function getOrganizationOptions() {
  return DUMMY_ORGANIZATIONS.map((org) => ({
    value: org.id,
    label: org.name,
  }));
}

export function getSiteCountForOrganization(organizationId: string): number {
  const org = DUMMY_ORGANIZATIONS.find((entry) => entry.id === organizationId);
  return org?.siteCount ?? 1;
}
