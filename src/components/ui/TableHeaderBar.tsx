import type { ReactNode } from "react";

export type TableHeaderBarProps = Readonly<{
  /** Left-hand label for the register, e.g. "Users". */
  title: string;
  /** Right-aligned action buttons. Size them with the TABLE_HEADER_* classes. */
  actions?: ReactNode;
  className?: string;
}>;

/**
 * Title + actions strip that sits above a register's column headers, inside the
 * table card. Ported from `neptune-app-fe`'s `IncidentListTableHeader`, which is
 * the same bar hard-wired to one module — this takes the title and the buttons
 * as props so every register can use it.
 *
 * Pass it to `Table`'s `toolbar` prop rather than rendering it above the table:
 * the card clips its own corners, so a sibling strip would sit outside the
 * rounded edge instead of inside it.
 */
export function TableHeaderBar(props: TableHeaderBarProps) {
  const { title, actions, className = "" } = props;

  return (
    <div
      className={[
        "border-ehs-border-ink/8 flex h-12.5 flex-wrap items-center justify-between gap-3 border-b px-4 sm:px-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h2 className="text-ehs-darker shrink-0 text-xs leading-none font-bold">
        {title}
      </h2>

      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
