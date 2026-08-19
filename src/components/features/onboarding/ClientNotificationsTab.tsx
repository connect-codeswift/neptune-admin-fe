"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { Button, GLASS_SURFACE, TextButton } from "@/components/ui";
import { NumberInput, SelectInput, TimeInput, ToggleInput } from "@/components/inputs";
import {
  ALL_EVENTS,
  buildDefaultPolicy,
  countEventsForRole,
  countRoutedEvents,
  isRoleRouted,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_MODULE_GROUPS,
  NOTIFICATION_ROLES,
  policiesMatch,
  ROLE_LABELS,
  SEVERITY_LABELS,
  SEVERITY_LEVELS,
  setModuleForRole,
  setRowRoles,
  toggleRole,
  type ChannelMatrix,
  type NotificationChannel,
  type NotificationModuleGroup,
  type NotificationPolicy,
  type SeverityLevel,
} from "@/lib/notification-routing";
import { DetailCard } from "./DetailCard";

/**
 * Every role is a column, so the matrix is only readable at width. Rather than collapse it into
 * something that hides the comparison — which is the point of a matrix — it scrolls sideways
 * with the event column holding its width.
 */
const GRID = `minmax(17rem, 1.7fr) repeat(${NOTIFICATION_ROLES.length}, minmax(6.5rem, 0.8fr))`;

function ChannelTabs(props: {
  active: NotificationChannel;
  policy: NotificationPolicy;
  onSelect: (channel: NotificationChannel) => void;
}) {
  const { active, policy, onSelect } = props;

  return (
    <div className="flex flex-wrap gap-2">
      {NOTIFICATION_CHANNELS.map((channel) => {
        const isActive = channel.id === active;
        const isOn = policy.channels[channel.id];

        return (
          <button
            key={channel.id}
            type="button"
            onClick={() => onSelect(channel.id)}
            aria-current={isActive ? "true" : undefined}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text4 transition-colors ${
              isActive
                ? "border-blue-normal bg-blue-lightest text-blue-deep"
                : "border-border bg-ehs-surface/60 text-gray hover:bg-ehs-surface"
            }`}
          >
            <Icon icon={channel.icon} className="size-4 shrink-0" aria-hidden="true" />
            {channel.label}
            <span
              className={`inline-block size-1.5 rounded-full ${
                isOn ? "bg-green" : "bg-ehs-border-ink/20"
              }`}
              aria-hidden="true"
            />
            {/* `aria-label` on a plain span is not exposed by most screen
                readers — the state has to be real text. */}
            <span className="sr-only">
              {isOn ? "enabled" : "disabled"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function RoutingMatrix(props: {
  matrix: ChannelMatrix;
  disabled: boolean;
  onChange: (next: ChannelMatrix) => void;
  visibleGroups: readonly NotificationModuleGroup[];
}) {
  const { matrix, disabled, onChange, visibleGroups } = props;

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="overflow-x-auto">
        <div className="min-w-[52rem]">
          <div className="grid items-end bg-ehs-border-ink/4" style={{ gridTemplateColumns: GRID }}>
            <div className="px-4 py-2.5 text6 uppercase tracking-wide text-textcolor">Event</div>
            {NOTIFICATION_ROLES.map((role) => (
              <div
                key={role}
                className="px-2 py-2.5 text-center text6 uppercase tracking-wide text-textcolor"
              >
                {ROLE_LABELS[role]}
              </div>
            ))}
          </div>

          {visibleGroups.map((group) => (
            <div key={group.id} className="border-t border-border">
              {/* The module header doubles as a bulk control: one click gives a role every
                  event in the module, which is the move staff actually want. */}
              <div className="grid items-center bg-ehs-border-ink/2" style={{ gridTemplateColumns: GRID }}>
                <div className="flex items-center gap-2 px-4 py-2">
                  <Icon
                    icon={group.icon}
                    className="size-4 shrink-0 text-blue-normal"
                    aria-hidden="true"
                  />
                  <span className="text6 uppercase tracking-wide text-darkest">{group.label}</span>
                </div>

                {NOTIFICATION_ROLES.map((role) => {
                  const allOn = group.events.every((event) =>
                    isRoleRouted(matrix, event.type, role),
                  );

                  return (
                    <div key={role} className="flex justify-center px-2 py-1">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(setModuleForRole(matrix, group, role, !allOn))}
                        aria-label={`${allOn ? "Remove" : "Give"} ${ROLE_LABELS[role]} every ${group.label} notification`}
                        className="rounded px-1.5 py-0.5 text8 text-textcolor transition-colors hover:bg-blue-lightest hover:text-blue-normal disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {allOn ? "none" : "all"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {group.events.map((event) => {
                const routed = matrix[event.type] ?? [];
                const allChecked = routed.length === NOTIFICATION_ROLES.length;

                return (
                  <div
                    key={event.type}
                    className="grid items-center border-t border-border/60"
                    style={{ gridTemplateColumns: GRID }}
                  >
                    <div className="flex min-w-0 flex-col gap-0.5 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text4 text-darkest">{event.label}</span>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onChange(setRowRoles(matrix, event.type, !allChecked))}
                          className="text8 text-textcolor underline-offset-2 transition-colors hover:text-blue-normal hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {allChecked ? "clear row" : "select row"}
                        </button>
                      </div>
                      <span className="text8 text-gray">
                        {event.rule === "broadcast"
                          ? `${event.description} Reaches everyone holding a ticked role.`
                          : `${event.description} Reaches the assignee, if their role is ticked.`}
                      </span>
                    </div>

                    {NOTIFICATION_ROLES.map((role) => (
                      <div key={role} className="flex items-center justify-center px-2 py-3">
                        <input
                          type="checkbox"
                          checked={isRoleRouted(matrix, event.type, role)}
                          disabled={disabled}
                          onChange={() => onChange(toggleRole(matrix, event.type, role))}
                          aria-label={`Send ${event.label} to ${ROLE_LABELS[role]}`}
                          className="size-4.5 cursor-pointer accent-blue-normal disabled:cursor-not-allowed disabled:opacity-40"
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Per-customer notification policy: which roles hear about which events, on which channel.
 *
 * Staff-facing rather than tenant-facing because it is entitlement-shaped — it decides what a
 * customer's plan reaches, alongside the seat and site limits on the neighbouring tab.
 *
 * The UI is complete and the API is not. Saving is deliberately blocked rather than faked, so
 * this screen cannot join the toggles elsewhere in the product that look editable and persist
 * nothing.
 */
export function ClientNotificationsTab(
  props: Readonly<{ companyName: string; activatedModules?: string }>,
) {
  const { companyName, activatedModules } = props;

  const [policy, setPolicy] = useState<NotificationPolicy>(buildDefaultPolicy);
  const [channel, setChannel] = useState<NotificationChannel>("sms");
  const savedPolicy = buildDefaultPolicy();
  const isDirty = !policiesMatch(policy, savedPolicy);

  const licensed = (activatedModules ?? "")
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);

  // Falls open when the company has no module string, rather than showing an empty table.
  const visibleGroups = NOTIFICATION_MODULE_GROUPS.filter(
    (group) => licensed.length === 0 || licensed.includes(group.id),
  );

  const activeChannel = NOTIFICATION_CHANNELS.find((entry) => entry.id === channel)!;
  const matrix = policy.matrices[channel];
  const channelEnabled = policy.channels[channel];

  const setMatrix = (next: ChannelMatrix) => {
    setPolicy((current) => ({
      ...current,
      matrices: { ...current.matrices, [channel]: next },
    }));
  };

  const setChannelEnabled = (enabled: boolean) => {
    setPolicy((current) => ({
      ...current,
      channels: { ...current.channels, [channel]: enabled },
    }));
  };

  const setRule = (
    eventType: string,
    patch: Partial<{ minSeverity: SeverityLevel; overridesQuietHours: boolean }>,
  ) => {
    setPolicy((current) => ({
      ...current,
      rules: {
        ...current.rules,
        [eventType]: { ...current.rules[eventType], ...patch },
      },
    }));
  };

  const severityEvents = ALL_EVENTS.filter((event) => event.hasSeverity);

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-start gap-3 rounded-xl border border-yellow/40 bg-yellow/8 px-4 py-3">
        <Icon
          icon="mdi:progress-wrench"
          className="mt-0.5 size-5 shrink-0 text-yellow"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text5 text-darkest">Interface preview — nothing is saved yet</p>
          <p className="mt-0.5 text8 text-gray">
            The notification API is the next phase. You can configure this and see how it behaves,
            but Save is disabled and your choices reset on reload.
          </p>
        </div>
      </div>

      {/* The channel selector drives the matrix under it, so the two stay
          adjacent; the severity and quiet-hours gates are the settings you
          consult while reading them, so they take the rail. */}
      <div className="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <DetailCard
          title="Channels"
          description={`Which ways ${companyName} can be reached. A channel that is off sends nothing, whatever the table says.`}
        >
          <div className="flex flex-col gap-4">
            <ChannelTabs active={channel} policy={policy} onSelect={setChannel} />

            <div className="rounded-xl border border-border bg-consent-bg px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text5 text-darkest">{activeChannel.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text7 ${
                        activeChannel.status === "live"
                          ? "bg-green/12 text-green"
                          : "bg-yellow/14 text-yellow"
                      }`}
                    >
                      {activeChannel.status === "live" ? "Live" : "Not built yet"}
                    </span>
                  </div>
                  <p className="mt-1 max-w-2xl text8 text-gray">{activeChannel.note}</p>
                </div>

                <ToggleInput
                  label={`Enable ${activeChannel.label}`}
                  checked={channelEnabled}
                  onChange={setChannelEnabled}
                />
              </div>

              {channel === "sms" ? (
                <div className="mt-4 max-w-xs border-t border-border pt-4">
                  <NumberInput
                    label="Monthly message cap"
                    helperText="Leave empty for no cap. Counts every message the organization sends."
                    min={0}
                    value={policy.smsMonthlyCap ?? undefined}
                    onChange={(event) => {
                      const raw = event.target.value;
                      setPolicy((current) => ({
                        ...current,
                        smsMonthlyCap: raw === "" ? null : Number(raw),
                      }));
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </DetailCard>

        <DetailCard
          title="Severity and timing"
          description="Extra gates applied after the routing table. These keep a channel useful by stopping it becoming noise."
        >
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="mb-2 text5 text-darkest">Minimum severity</h3>
              <p className="mb-3 text8 text-gray">
                Only these events carry a severity. Everything else always sends when its role is
                ticked.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {severityEvents.map((event) => (
                  <div key={event.type} className="min-w-0 sm:w-64">
                    <SelectInput
                      label={event.label}
                      value={policy.rules[event.type]?.minSeverity ?? "all"}
                      onChange={(next) =>
                        setRule(event.type, { minSeverity: next as SeverityLevel })
                      }
                      options={SEVERITY_LEVELS.map((level) => ({
                        value: level,
                        label: SEVERITY_LABELS[level],
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-5">
              <ToggleInput
                label="Quiet hours"
                description="Hold non-urgent messages overnight and deliver them in the morning. In-app notifications are never held."
                checked={policy.quietHours.enabled}
                onChange={(enabled) =>
                  setPolicy((current) => ({
                    ...current,
                    quietHours: { ...current.quietHours, enabled },
                  }))
                }
              />

              {policy.quietHours.enabled ? (
                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="w-40">
                      <TimeInput
                        label="From"
                        value={policy.quietHours.start}
                        onChange={(next) =>
                          setPolicy((current) => ({
                            ...current,
                            quietHours: { ...current.quietHours, start: next },
                          }))
                        }
                      />
                    </div>
                    <div className="w-40">
                      <TimeInput
                        label="To"
                        value={policy.quietHours.end}
                        onChange={(next) =>
                          setPolicy((current) => ({
                            ...current,
                            quietHours: { ...current.quietHours, end: next },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text8 text-gray">
                      Events that ignore quiet hours and send immediately:
                    </p>
                    <div className="flex flex-col gap-2">
                      {ALL_EVENTS.map((event) => (
                        <label
                          key={event.type}
                          className="flex cursor-pointer items-center gap-2 text4 text-darkest"
                        >
                          <input
                            type="checkbox"
                            checked={policy.rules[event.type]?.overridesQuietHours ?? false}
                            onChange={(changeEvent) =>
                              setRule(event.type, {
                                overridesQuietHours: changeEvent.target.checked,
                              })
                            }
                            className="size-4 cursor-pointer accent-blue-normal"
                          />
                          {event.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </DetailCard>
      </div>

      <DetailCard
        title="Who hears about what"
        description="Tick a role to make it reachable for that event on the selected channel. This narrows each event's existing recipients — it never adds new ones."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {NOTIFICATION_ROLES.map((role) => {
              const count = countEventsForRole(matrix, role);

              return (
                <span
                  key={role}
                  className={`rounded-lg border px-2.5 py-1 text7 ${
                    count > 0
                      ? "border-blue-normal/30 bg-blue-lightest text-blue-deep"
                      : "border-border text-textcolor"
                  }`}
                >
                  {`${ROLE_LABELS[role]} · ${String(count)}`}
                </span>
              );
            })}
          </div>

          <RoutingMatrix
            matrix={matrix}
            disabled={!channelEnabled}
            onChange={setMatrix}
            visibleGroups={visibleGroups}
          />

          <p className="text8 text-gray">
            {`${String(countRoutedEvents(matrix))} of ${String(ALL_EVENTS.length)} events reach at least one role on ${activeChannel.label}. Modules this company has not licensed are hidden.`}
          </p>
        </div>
      </DetailCard>

      <div
        className={`${GLASS_SURFACE} flex flex-wrap items-center justify-end gap-3 px-5 py-3`}
      >
        <p className="mr-auto text8 text-gray" id="notification-save-reason">
          Saving needs the notification API, which is not built yet.
        </p>
        <TextButton
          type="button"
          onClick={() => setPolicy(buildDefaultPolicy())}
          disabled={!isDirty}
        >
          Reset
        </TextButton>
        <Button
          type="button"
          disabled
          aria-describedby="notification-save-reason"
          title="The notification API is not built yet, so there is nowhere to save this."
        >
          Save policy
        </Button>
      </div>
    </div>
  );
}
