"use client";

import { Icon } from "@iconify/react";
import { Fragment } from "react";

export type SetupTabBarStep = {
  id: string;
  label: string;
  icon: string;
  /**
   * One line saying what the step covers. Shown only on the vertical rail,
   * where there is room for it — the compact bar has none.
   */
  summary?: string;
};

export type SetupTabBarProps = {
  steps: SetupTabBarStep[];
  /** Zero-based index of the active step. */
  activeIndex: number;
  className?: string;
};

type StepState = "done" | "current" | "upcoming";

const CIRCLE_CLASS: Record<StepState, string> = {
  done: "border-ehs-green bg-ehs-green text-ehs-on-accent",
  current:
    "border-ehs-normal-blue bg-ehs-normal-blue text-ehs-on-accent shadow-(--ehs-shadow-button-primary-sm)",
  upcoming: "border-ehs-border-ink/14 bg-ehs-border-ink/10 text-ehs-muted-text",
};

const LABEL_CLASS: Record<StepState, string> = {
  done: "text-ehs-green",
  current: "text-ehs-normal-blue",
  upcoming: "text-ehs-placeholder",
};

const CONNECTOR_CLASS: Record<StepState, string> = {
  done: "bg-ehs-green",
  current: "bg-ehs-border",
  upcoming: "bg-ehs-border",
};

/** Says where you are without the reader counting circles. */
const STATE_NOTE: Record<StepState, string> = {
  done: "Done",
  current: "In progress",
  upcoming: "Up next",
};

function getStepState(index: number, activeIndex: number): StepState {
  if (index < activeIndex) return "done";
  if (index === activeIndex) return "current";
  return "upcoming";
}

/**
 * The add-a-company wizard's progress rail. One DOM tree, two shapes:
 *
 * - below `xl` it is a compact horizontal bar — circles and connectors, with
 *   the labels dropping to screen-reader-only under `sm` so three steps still
 *   fit a 320px window without pushing the page sideways;
 * - from `xl` it turns into a vertical rail in the wizard's right column, where
 *   there is room to show every step's title, what it covers, and whether it is
 *   done, current or still ahead — all three at once, which the numbered bar
 *   could never do.
 *
 * Layout (width, padding, the surface it sits on) belongs to the caller; this
 * renders only the rail.
 */
export function SetupTabBar({
  steps,
  activeIndex,
  className = "",
}: Readonly<SetupTabBarProps>) {
  return (
    <nav aria-label="Setup steps" className={`w-full ${className}`.trim()}>
      <ol className="flex w-full items-start xl:flex-col xl:gap-0">
        {steps.map((step, index) => {
          const state = getStepState(index, activeIndex);
          const isLast = index === steps.length - 1;

          let iconName = step.icon;
          if (state === "done") {
            iconName = "lucide:check";
          }

          return (
            <Fragment key={step.id}>
              <li className="flex min-w-0 flex-1 flex-col items-center gap-1.5 xl:w-full xl:flex-none xl:flex-row xl:items-start xl:gap-3">
                <span
                  className={`flex size-9.5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${CIRCLE_CLASS[state]}`}
                  aria-current={state === "current" ? "step" : undefined}
                >
                  <Icon icon={iconName} width={17} height={17} aria-hidden />
                </span>

                {/* Under `sm` the visible label is dropped for width, so the
                    step keeps an accessible name here instead. */}
                <span className="sr-only sm:hidden">
                  {step.label} — {STATE_NOTE[state]}
                </span>

                <span className="hidden min-w-0 flex-col items-center gap-0.5 sm:flex xl:flex-1 xl:items-stretch xl:pt-1">
                  <span className="flex w-full min-w-0 items-baseline justify-center gap-2 xl:justify-between">
                    <span
                      className={`truncate text7 ${LABEL_CLASS[state]}`}
                      title={step.label}
                    >
                      {step.label}
                    </span>
                    <span
                      className={`hidden shrink-0 text8 xl:block ${LABEL_CLASS[state]}`}
                    >
                      {STATE_NOTE[state]}
                    </span>
                  </span>

                  {step.summary ? (
                    <span className="text-ehs-muted-text hidden text8 xl:block">
                      {step.summary}
                    </span>
                  ) : null}
                </span>
              </li>

              {isLast ? null : (
                <li
                  aria-hidden
                  className={`mx-2 mt-4.75 h-0.5 min-w-4 flex-1 list-none xl:mx-0 xl:my-1.5 xl:ml-4.5 xl:h-5 xl:w-0.5 xl:min-w-0 xl:flex-none ${CONNECTOR_CLASS[state]}`}
                />
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
