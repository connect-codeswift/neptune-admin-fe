export type SkeletonProps = Readonly<{
  className?: string;
}>;

/**
 * A single placeholder block with a sheen travelling across it. Sizing and
 * rounding come from `className`.
 *
 * The sheen replaced an opacity pulse, which blinks the whole block; a sweep
 * reads as work in progress. `skeleton-sweep` disables itself under
 * prefers-reduced-motion, leaving a still block.
 *
 * The fill is `--ehs-skeleton`, whose light value is exactly the `slate-200/80`
 * this used to hardcode — lighter and cooler than `--ehs-border` (#e5e7eb).
 * It has to be a token rather than a literal because a light grey block on a
 * near-black card reads as content that has already loaded; the dark value is
 * a low-alpha wash, so the block reads as a hole in the surface instead.
 * This is the global skeleton grey, so changing it changes every loading state
 * in the app.
 */
export function Skeleton(props: SkeletonProps) {
  const { className = "" } = props;

  return (
    <div
      aria-hidden="true"
      className={["skeleton-sweep rounded bg-ehs-skeleton", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
