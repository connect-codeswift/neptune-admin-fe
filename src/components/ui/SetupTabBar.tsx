"use client";

import { Icon } from "@iconify/react";
import { Fragment } from "react";

export type SetupTabBarStep = {
  id: string;
  label: string;
  icon: string;
};

export type SetupTabBarProps = {
  steps: SetupTabBarStep[];
  /** Zero-based index of the active step. */
  activeIndex: number;
  className?: string;
};

export function SetupTabBar({
  steps,
  activeIndex,
  className = "",
}: Readonly<SetupTabBarProps>) {
  return (
    <nav
      aria-label="Setup steps"
      className={`w-full pt-3.5 max-w-2xl mx-auto pb-8 ${className}`.trim()}
    >
      <ol className="flex w-full items-center">
        {steps.map((step, index) => {
          const active = index === activeIndex;
          const completed = index < activeIndex;
          const isLast = index === steps.length - 1;

          let circleClass =
            "border-darkest/14 bg-[rgba(139,155,180,0.15)] text-[#8b9bb4]";
          let labelClass = "font-normal text-[#b3bbc8]";
          let iconName = step.icon;

          if (completed) {
            circleClass = "border-green bg-green text-white";
            labelClass = "font-bold text-green";
            iconName = "lucide:check";
          } else if (active) {
            circleClass =
              "border-blue-normal bg-blue-normal text-white shadow-xl";
            labelClass = "font-bold text-blue-normal";
          }

          let connectorClass = "bg-border";
          if (completed) {
            connectorClass = "bg-green";
          }

          return (
            <Fragment key={step.id}>
              <li className="relative flex shrink-0 flex-col items-center gap-1.5">
                <div
                  className={`flex size-9.5 items-center justify-center rounded-full border-[1.5px] ${circleClass}`}
                  aria-current={active ? "step" : undefined}
                >
                  <Icon icon={iconName} width={17} height={17} aria-hidden />
                </div>
                <span
                  className={`absolute top-11 text7 whitespace-nowrap ${labelClass}`}
                >
                  {step.label}
                </span>
              </li>

              {isLast ? null : (
                <li
                  aria-hidden
                  className={`mx-2 mb-5 h-0.5 min-w-4 flex-1 list-none ${connectorClass}`}
                />
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
