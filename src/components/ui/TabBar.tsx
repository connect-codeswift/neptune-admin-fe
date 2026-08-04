"use client";

export type TabBarTab = {
  id: string;
  label: string;
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

        return (
          <button
            key={tab.id}
            type="button"
            className={tabClass}
            aria-current={active ? "page" : undefined}
            onClick={() => onChange?.(index)}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
