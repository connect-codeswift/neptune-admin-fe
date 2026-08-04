"use client";

import { usePathname } from "next/navigation";
import { parseOrgSitePath } from "@/lib/sidebar-items";
import {
  getSubscriptionSeatInfo,
  isSeatLimitReached,
  type SubscriptionSeatInfo,
} from "@/lib/subscription-seats";

export function useSubscriptionSeats() {
  const pathname = usePathname();
  const orgSite = parseOrgSitePath(pathname);
  const seatInfo = getSubscriptionSeatInfo(orgSite?.company ?? null);
  const atSeatLimit = seatInfo ? isSeatLimitReached(seatInfo) : false;

  return {
    orgId: orgSite?.company ?? null,
    seatInfo,
    atSeatLimit,
  };
}

export type { SubscriptionSeatInfo };
