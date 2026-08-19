/**
 * Notification routing policy for one customer.
 *
 * Three axes decide whether a person is told about something:
 *
 * - **Event** — one of the notification types the backend already emits. Six module services
 *   emit these today, so nothing here invents a trigger that does not exist.
 * - **Channel** — in-app bell, SMS, or email. Each is configured separately, because "put it in
 *   the bell" and "wake someone up" are different decisions.
 * - **Role** — a filter on top of the event's own recipient rule.
 *
 * That last point matters. The two kinds of event pick recipients differently: a *reported*
 * event broadcasts to roles, while an *assigned* event goes to one named person whatever their
 * role. So a ticked cell reads "a user holding this role may be reached on this channel for this
 * event" — it narrows the event's existing recipients, it never widens them. Ticking Worker for
 * "Audit assigned" does not message every worker; it means a worker who *is* the assignee is
 * reachable.
 */

/** Tenant roles, in seniority order. Mirrors `AppRole` on the backend. */
export const NOTIFICATION_ROLES = [
  "Ehs_Director",
  "Ehs_Lead",
  "Ehs_Manager",
  "Supervisor",
  "Worker",
] as const;

export type NotificationRole = (typeof NOTIFICATION_ROLES)[number];

export const ROLE_LABELS: Readonly<Record<NotificationRole, string>> = {
  Ehs_Director: "EHS Director",
  Ehs_Lead: "EHS Lead",
  Ehs_Manager: "EHS Manager",
  Supervisor: "Supervisor",
  Worker: "Worker",
};

export type NotificationChannel = "inApp" | "sms" | "email";

export type ChannelMeta = Readonly<{
  id: NotificationChannel;
  label: string;
  icon: string;
  /** Shown on the channel tab so staff know what is actually wired. */
  status: "live" | "planned";
  note: string;
}>;

export const NOTIFICATION_CHANNELS: readonly ChannelMeta[] = [
  {
    id: "inApp",
    label: "In-app",
    icon: "mdi:bell-outline",
    status: "live",
    note: "The notification bell. Already emitted by the backend for every event below.",
  },
  {
    id: "sms",
    label: "SMS",
    icon: "mdi:message-text-outline",
    status: "planned",
    note: "Text messages via Twilio. Requires the SMS service, a verified phone number and consent from each recipient.",
  },
  {
    id: "email",
    label: "Email",
    icon: "mdi:email-outline",
    status: "planned",
    note: "No EHS event is emailed today — the mail service only sends invitations, password resets and access-expiry warnings.",
  },
];

/** Severity gate, for the events that carry one. */
export const SEVERITY_LEVELS = ["all", "medium", "high", "critical"] as const;
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

export const SEVERITY_LABELS: Readonly<Record<SeverityLevel, string>> = {
  all: "Any severity",
  medium: "Medium and above",
  high: "High and above",
  critical: "Critical only",
};

export type NotificationEvent = Readonly<{
  /** The backend `NotificationType` constant. */
  type: string;
  label: string;
  description: string;
  /** How the event picks its recipients before the role filter is applied. */
  rule: "broadcast" | "assignee";
  /** True when the payload carries a severity that can gate delivery. */
  hasSeverity: boolean;
  defaultRoles: readonly NotificationRole[];
}>;

export type NotificationModuleGroup = Readonly<{
  /** Matches the `activatedModules` code, so unlicensed modules can be hidden. */
  id: string;
  label: string;
  icon: string;
  events: readonly NotificationEvent[];
}>;

const ALL_ROLES = [...NOTIFICATION_ROLES];
const LEADERSHIP: readonly NotificationRole[] = ["Ehs_Director", "Ehs_Manager"];
const RESPONDERS: readonly NotificationRole[] = [
  "Ehs_Director",
  "Ehs_Lead",
  "Ehs_Manager",
  "Supervisor",
];

/**
 * Only the seven types the backend actually emits. More rows arrive as producers are added; a
 * row with no producer would be a promise the system cannot keep.
 */
export const NOTIFICATION_MODULE_GROUPS: readonly NotificationModuleGroup[] = [
  {
    id: "INCIDENT",
    label: "Incidents",
    icon: "mdi:alert-octagon-outline",
    events: [
      {
        type: "Incident.Reported",
        label: "Incident reported",
        description: "A new incident is logged at the site.",
        rule: "broadcast",
        hasSeverity: true,
        defaultRoles: LEADERSHIP,
      },
    ],
  },
  {
    id: "NEAR_MISS",
    label: "Near miss",
    icon: "mdi:near-me-outline",
    events: [
      {
        type: "NearMiss.Reported",
        label: "Near miss reported",
        description: "A near miss is logged at the site.",
        rule: "broadcast",
        hasSeverity: false,
        defaultRoles: LEADERSHIP,
      },
    ],
  },
  {
    id: "HAZARD",
    label: "Hazards",
    icon: "mdi:hazard-lights",
    events: [
      {
        type: "Hazard.Assigned",
        label: "Hazard assigned",
        description: "A hazard is assigned to someone to resolve.",
        rule: "assignee",
        hasSeverity: false,
        defaultRoles: RESPONDERS,
      },
    ],
  },
  {
    id: "CAPA",
    label: "CAPA",
    icon: "mdi:clipboard-check-outline",
    events: [
      {
        type: "Capa.Assigned",
        label: "CAPA assigned",
        description: "A corrective or preventive action is assigned.",
        rule: "assignee",
        hasSeverity: false,
        defaultRoles: RESPONDERS,
      },
    ],
  },
  {
    id: "AUDITS",
    label: "Audits",
    icon: "mdi:shield-check-outline",
    events: [
      {
        type: "Audit.Assigned",
        label: "Audit assigned",
        description: "An audit is assigned to an auditor.",
        rule: "assignee",
        hasSeverity: false,
        defaultRoles: ["Ehs_Lead", "Ehs_Manager"],
      },
      {
        type: "Audit.FindingAssigned",
        label: "Audit finding raised",
        description: "A finding is raised and assigned to someone to close.",
        rule: "assignee",
        hasSeverity: true,
        defaultRoles: RESPONDERS,
      },
    ],
  },
  {
    id: "REGULATORY_COMPLIANCE",
    label: "Regulatory compliance",
    icon: "mdi:scale-balance",
    events: [
      {
        type: "Compliance.Assigned",
        label: "Obligation assigned",
        description: "A compliance obligation is assigned. Carries a due date.",
        rule: "assignee",
        hasSeverity: false,
        defaultRoles: ["Ehs_Director", "Ehs_Lead"],
      },
    ],
  },
];

export const ALL_EVENTS: readonly NotificationEvent[] =
  NOTIFICATION_MODULE_GROUPS.flatMap((group) => group.events);

/** `Incident.Reported` → the roles reachable on one channel. */
export type ChannelMatrix = Readonly<
  Record<string, readonly NotificationRole[]>
>;

export type EventRule = Readonly<{
  minSeverity: SeverityLevel;
  /** Send outside the quiet window anyway. Only meaningful for SMS. */
  overridesQuietHours: boolean;
}>;

export type QuietHours = Readonly<{
  enabled: boolean;
  /** 24h `HH:mm`, in the site's local time. */
  start: string;
  end: string;
}>;

export type NotificationPolicy = Readonly<{
  channels: Readonly<Record<NotificationChannel, boolean>>;
  matrices: Readonly<Record<NotificationChannel, ChannelMatrix>>;
  rules: Readonly<Record<string, EventRule>>;
  quietHours: QuietHours;
  /** Null means no cap. Matches how seat and site limits already model "unlimited". */
  smsMonthlyCap: number | null;
}>;

function defaultMatrix(): ChannelMatrix {
  return Object.fromEntries(
    ALL_EVENTS.map((event) => [event.type, event.defaultRoles]),
  );
}

export function buildDefaultPolicy(): NotificationPolicy {
  return {
    channels: { inApp: true, sms: false, email: false },
    matrices: {
      // The bell is the one channel that already fires for everyone it can reach.
      inApp: Object.fromEntries(
        ALL_EVENTS.map((event) => [event.type, ALL_ROLES]),
      ),
      sms: defaultMatrix(),
      email: defaultMatrix(),
    },
    rules: Object.fromEntries(
      ALL_EVENTS.map((event) => [
        event.type,
        { minSeverity: "all" as SeverityLevel, overridesQuietHours: false },
      ]),
    ),
    quietHours: { enabled: false, start: "21:00", end: "07:00" },
    smsMonthlyCap: 1000,
  };
}

export function isRoleRouted(
  matrix: ChannelMatrix,
  eventType: string,
  role: NotificationRole,
): boolean {
  return matrix[eventType]?.includes(role) ?? false;
}

export function toggleRole(
  matrix: ChannelMatrix,
  eventType: string,
  role: NotificationRole,
): ChannelMatrix {
  const current = matrix[eventType] ?? [];
  const next = current.includes(role)
    ? current.filter((entry) => entry !== role)
    : [...current, role];

  return { ...matrix, [eventType]: next };
}

export function setRowRoles(
  matrix: ChannelMatrix,
  eventType: string,
  enabled: boolean,
): ChannelMatrix {
  return { ...matrix, [eventType]: enabled ? ALL_ROLES : [] };
}

/** Every event in one module, for one role. */
export function setModuleForRole(
  matrix: ChannelMatrix,
  group: NotificationModuleGroup,
  role: NotificationRole,
  enabled: boolean,
): ChannelMatrix {
  const next: Record<string, readonly NotificationRole[]> = { ...matrix };

  for (const event of group.events) {
    const without = (next[event.type] ?? []).filter((entry) => entry !== role);
    next[event.type] = enabled ? [...without, role] : without;
  }

  return next;
}

export function countEventsForRole(
  matrix: ChannelMatrix,
  role: NotificationRole,
): number {
  return Object.values(matrix).filter((roles) => roles.includes(role)).length;
}

export function countRoutedEvents(matrix: ChannelMatrix): number {
  return Object.values(matrix).filter((roles) => roles.length > 0).length;
}

/** Order-insensitive, so re-ticking a box back where it started is not a change. */
export function policiesMatch(
  a: NotificationPolicy,
  b: NotificationPolicy,
): boolean {
  return JSON.stringify(normalizePolicy(a)) === JSON.stringify(normalizePolicy(b));
}

function normalizePolicy(policy: NotificationPolicy) {
  const matrices = Object.fromEntries(
    Object.entries(policy.matrices).map(([channel, matrix]) => [
      channel,
      Object.fromEntries(
        Object.entries(matrix).map(([type, roles]) => [type, [...roles].sort()]),
      ),
    ]),
  );

  return { ...policy, matrices };
}
