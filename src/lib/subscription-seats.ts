import { getDummyOrganization } from "./dummy-organizations";

export type SubscriptionSeatInfo = {
  orgId: string;
  planType: string;
  statusLabel: string;
  daysRemaining: number;
  seatsUsed: number;
  seatsTotal: number;
};

const DEFAULT_ORG_ID = "1";

export function getSubscriptionSeatInfo(
  orgId: string | null | undefined,
): SubscriptionSeatInfo | null {
  const resolvedOrgId = orgId ?? DEFAULT_ORG_ID;
  const org = getDummyOrganization(resolvedOrgId);
  if (!org) return null;

  return {
    orgId: resolvedOrgId,
    planType: org.subscription.planType,
    statusLabel: org.subscription.statusLabel,
    daysRemaining: org.subscription.daysRemaining,
    seatsUsed: org.subscription.seats.used,
    seatsTotal: org.subscription.seats.total,
  };
}

export function isSeatLimitReached(info: SubscriptionSeatInfo): boolean {
  return info.seatsUsed >= info.seatsTotal;
}

export function getSeatsAvailable(info: SubscriptionSeatInfo): number {
  return Math.max(0, info.seatsTotal - info.seatsUsed);
}

export function getSeatUsagePercent(info: SubscriptionSeatInfo): number {
  if (info.seatsTotal <= 0) return 100;
  return Math.min(100, Math.round((info.seatsUsed / info.seatsTotal) * 100));
}

export function getTrialStatusLabel(info: SubscriptionSeatInfo): string {
  if (info.daysRemaining > 0) {
    return `${info.daysRemaining} days remaining`;
  }
  return info.statusLabel;
}

export function getSeatLimitMessage(info: SubscriptionSeatInfo): string {
  if (isSeatLimitReached(info)) {
    return "You have reached your seat limit. Adding more users beyond your plan allowance will require a plan upgrade.";
  }

  return "You are approaching your seat limit. Adding more users beyond your plan allowance will require a plan upgrade.";
}
