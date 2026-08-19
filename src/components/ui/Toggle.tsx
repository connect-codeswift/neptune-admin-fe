export type ToggleProps = Readonly<{
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  "aria-label": string;
}>;

export function Toggle(props: Readonly<ToggleProps>) {
  const { id, checked, onChange, "aria-label": ariaLabel } = props;

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={[
        "focus-visible:ring-ehs-normal-blue/20 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed",
        checked ? "bg-ehs-normal-blue" : "bg-ehs-border",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute top-0.5 left-0.5 inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}
