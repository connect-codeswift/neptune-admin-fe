"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Text } from "@/components/Text";
import {
  buildSettingsHref,
  getSettingsSection,
  isSettingsSectionActive,
  SETTINGS_SECTIONS,
  type SettingsSection,
  type SettingsSectionId,
} from "@/components/settings/settings-nav";
import { useSettingsLocation } from "@/components/settings/useSettingsLocation";

export type SettingsShellProps = Readonly<{
  activeSection: SettingsSectionId;
  children: ReactNode;
  /** Right-hand controls in the header row. Unused today; kept for editable tabs. */
  actions?: ReactNode;
}>;

type Crumb = Readonly<{ label: string; href?: string }>;

/**
 * Shared focus ring for the links on this surface.
 *
 * The tab strip and the breadcrumb are `Link`s, so they are already in the tab order and already
 * activate on Enter — nothing has to be re-implemented for the keyboard. What was missing is the
 * part a keyboard user actually needs: being able to see where they are. The offset colour is a
 * token, so the ring reads on the page ground in both themes.
 */
const settingsFocusRingClass =
  "outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ehs-light-bg";

function SettingsBreadcrumb(props: Readonly<{ items: readonly Crumb[] }>) {
  const { items } = props;

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        let crumb: ReactNode;

        if (item.href && !isLast) {
          crumb = (
            <Link
              href={item.href}
              className={`text8 text-ehs-muted-text hover:text-ehs-gray rounded transition-colors ${settingsFocusRingClass}`}
            >
              {item.label}
            </Link>
          );
        } else {
          crumb = (
            <Text
              as="span"
              className={[
                "text8",
                isLast ? "text-ehs-normal-blue" : "text-ehs-muted-text",
              ].join(" ")}
            >
              {item.label}
            </Text>
          );
        }

        return (
          <span key={item.label} className="flex items-center gap-1">
            {index > 0 ? (
              <Icon
                icon="mdi:chevron-right"
                className="text-ehs-muted-text size-3.5"
                aria-hidden="true"
              />
            ) : null}
            {crumb}
          </span>
        );
      })}
    </nav>
  );
}

/**
 * One tab in the segmented control.
 *
 * The active tab is a raised surface pill with brand-coloured text, not a solid brand fill.
 * A filled tab needs a coloured drop shadow to sit properly on the track, and that glow is a
 * light-theme device — over a dark page it haloes. A pill in the surface colour reads as
 * "lifted out of the track" in both themes using the same two ingredients the cards use.
 */
function SettingsTab(
  props: Readonly<{
    section: SettingsSection;
    href: string;
    isActive: boolean;
  }>,
) {
  const { section, href, isActive } = props;

  const stateClass = isActive
    ? "bg-ehs-surface text5 text-ehs-normal-blue shadow-(--ehs-shadow-tab-active)"
    : "text4 text-ehs-gray hover:bg-ehs-surface/50 hover:text-ehs-darker";

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={[
        "rounded-2.5 relative inline-flex w-fit shrink-0 items-center gap-2 px-3.5 py-2 whitespace-nowrap transition-all duration-150",
        stateClass,
        settingsFocusRingClass,
      ].join(" ")}
    >
      <Icon
        icon={section.icon}
        className={[
          "size-4.5 shrink-0 transition-colors",
          isActive ? "text-ehs-normal-blue" : "text-ehs-muted-text",
        ].join(" ")}
        aria-hidden="true"
      />
      {section.label}
      {/* `aria-current` marks the tab, but only for assistive tech that reports it on a link.
          Saying it in text as well costs nothing and is unambiguous. */}
      {isActive ? <span className="sr-only">(current tab)</span> : null}
    </Link>
  );
}

function SettingsSectionNav(
  props: Readonly<{ activeSection: SettingsSectionId; basePath: string }>,
) {
  const { activeSection, basePath } = props;
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Settings sections"
      /* An inset track rather than a raised bar: the tabs are what lift out of it, so the
         container reads as a groove and the active pill as the thing sitting in it. */
      className="border-ehs-border bg-ehs-surface-inverse/4 scrollbar-none inline-flex max-w-full gap-1 self-start overflow-x-auto rounded-3 border p-1"
    >
      {SETTINGS_SECTIONS.map((section) => {
        const href = buildSettingsHref(basePath, section.id);

        return (
          <SettingsTab
            key={section.id}
            section={section}
            href={href}
            isActive={
              section.id === activeSection ||
              isSettingsSectionActive(pathname, href)
            }
          />
        );
      })}
    </nav>
  );
}

/**
 * The frame every Settings tab renders inside: breadcrumb, title, the tab strip, and the active
 * section's one-line description.
 *
 * One shell serves both areas of the portal. The hrefs it builds come from
 * {@link useSettingsLocation}, so the same three tabs point at `/super/settings/*` for a
 * platform account and `/{company}/{site}/settings/*` for a tenant admin without either side
 * owning a copy of this layout.
 */
export function SettingsShell(props: Readonly<SettingsShellProps>) {
  const { activeSection, children, actions } = props;
  const location = useSettingsLocation();
  const section = getSettingsSection(activeSection);

  const crumbs: readonly Crumb[] = [
    { label: "Dashboard", href: location.dashboardHref },
    { label: "Settings", href: location.defaultHref },
    { label: section.label },
  ];

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-5 pb-8">
        <header className="flex flex-col gap-3">
          <SettingsBreadcrumb items={crumbs} />

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <Text as="h1" className="text1 text-ehs-darker">
                Settings
              </Text>
              <Text as="p" className="text4 text-ehs-muted-text max-w-2xl">
                {section.description[location.area]}
              </Text>
            </div>

            {actions ? (
              <div className="flex flex-wrap items-center gap-3">{actions}</div>
            ) : null}
          </div>

          <SettingsSectionNav
            activeSection={activeSection}
            basePath={location.basePath}
          />
        </header>

        <div className="flex min-w-0 flex-col gap-3.5">{children}</div>
      </div>
    </div>
  );
}
