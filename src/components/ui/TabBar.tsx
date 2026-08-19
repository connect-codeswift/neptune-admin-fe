"use client";

export type TabBarTab = {
  id: string;
  label: string;
  /** Count pill after the label — omitted when zero or undefined. */
  badge?: number;
};

export type TabBarProps = {
  tabs: TabBarTab[];
  /** Zero-based index of the active tab. */
  activeIndex: number;
  onChange?: (index: number) => void;
  className?: string;
  /** Accessible name for the nav. */
  label?: string;
};

export function TabBar({
  tabs,
  activeIndex,
  onChange,
  className = "",
  label = "Sections",
}: Readonly<TabBarProps>) {
  return (
    <nav
      aria-label={label}
      className={`border-ehs-border flex gap-3 border-b pl-2 ${className}`.trim()}
    >
      {tabs.map((tab, index) => {
        const active = index === activeIndex;

        let tabClass =
          "text4 text-ehs-muted-text hover:text-ehs-darker cursor-pointer px-4 pt-2 pb-3 transition-colors";
        if (active) {
          tabClass =
            "text5 border-ehs-normal-blue text-ehs-normal-blue cursor-pointer border-b-[3px] px-4 pt-2 pb-3";
        }

        let badgeClass =
          "text7 bg-ehs-red text-ehs-on-accent rounded-full px-1.5 py-0.5";
        if (!active) {
          badgeClass =
            "text7 bg-ehs-red/12 text-ehs-red rounded-full px-1.5 py-0.5";
        }

        return (
          <button
            key={tab.id}
            type="button"
            className={`inline-flex items-center gap-2 ${tabClass}`}
            aria-current={active ? "page" : undefined}
            onClick={() => onChange?.(index)}
          >
            {tab.label}
            {tab.badge ? <span className={badgeClass}>{tab.badge}</span> : null}
          </button>
        );
      })}
    </nav>
  );
}
