"use client";

import { ClientAccessWindowPanel } from "./ClientAccessWindowPanel";

type ClientSubscriptionTabProps = Readonly<{
  organizationId: number;
  companyName: string;
  accessExpiresAt?: string | null;
  daysRemaining?: number | null;
}>;

export function ClientSubscriptionTab(props: ClientSubscriptionTabProps) {
  return <ClientAccessWindowPanel {...props} showHistory />;
}
