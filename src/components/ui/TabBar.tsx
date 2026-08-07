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
      className={`flex gap-3 border-b border-darkest/12 pl-2 ${className}`.trim()}
    >
      {tabs.map((tab, index) => {
        const active = index === activeIndex;

        let tabClass =
          "cursor-pointer px-4 pt-2 pb-3 text5 text-[#8892a3] transition-colors hover:text-darkest";
        if (active) {
          tabClass =
            "cursor-pointer border-b-[3px] border-blue-normal px-4 pt-2 pb-3 text4 text-blue-normal";
        }

        let badgeClass = "rounded-full bg-red px-1.5 py-0.5 text9 text-white";
        if (!active) {
          badgeClass = "rounded-full bg-red/12 px-1.5 py-0.5 text9 text-red";
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
