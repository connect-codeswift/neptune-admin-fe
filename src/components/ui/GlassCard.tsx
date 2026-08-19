import type { ReactNode } from "react";

/**
 * The command-center card surface (Figma node 6154:27540,
 * "Overlay+Border+OverlayBlur").
 *
 * Every dashboard card sits on this one surface so the ambient page gradient
 * reads through them consistently. The three shadows are, in order: the
 * contact shadow, the soft lift, and the inset top highlight that gives the
 * frosted edge — in Figma the highlight is a separate stacked layer, but as an
 * inset shadow it renders identically without the extra element.
 */
export type GlassCardProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

/**
 * Thinner than the original 62%-white pane: with the ambient colour layer
 * AppShell now paints behind every page, a lower fill and heavier blur let
 * the ground refract through, which is what makes the surface read as glass
 * rather than a white card. Matches the sidebar and auth card recipe.
 */
export const GLASS_SURFACE =
  "rounded-5 border border-ehs-hairline/70 bg-ehs-surface/50 backdrop-blur-xl " +
  "shadow-(--ehs-shadow-card)";

export function GlassCard(props: Readonly<GlassCardProps>) {
  const { children, className = "" } = props;

  return (
    <article
      className={[
        GLASS_SURFACE,
        "flex min-w-0 flex-col gap-2.5 p-4.75",
        // Entrance and hover response live on the surface itself, so every card
        // in the app behaves the same way instead of each screen reinventing it.
        // Both utilities self-disable under prefers-reduced-motion. `className`
        // is appended last, so a caller can still override either one.
        "animate-card-rise card-lift",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </article>
  );
}
