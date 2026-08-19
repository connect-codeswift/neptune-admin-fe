/** Shared Tailwind classes using @theme EHS tokens from globals.css */

export const ehsFieldClass = "flex flex-col gap-1.5";

export const ehsLabelClass = "text7 text-ehs-gray block";

/**
 * Frosted to match FIELD_BASE in `@/components/ui/field-styles` — same fill,
 * hairline, blur and focus halo, so fields are one material everywhere. These
 * controls used to be solid (`bg-ehs-light-text`) because the auth screens
 * sat on opaque panels; those panels are glass now, and a solid field on a
 * glass card reads as a sticker on a window.
 */
export const ehsInputClass =
  "text4 text-ehs-darker w-full rounded-2.5 border border-ehs-border-ink/8 bg-ehs-surface/55 px-3.5 py-2.5 backdrop-blur-1.25 outline-none transition placeholder:text-ehs-muted-text hover:border-ehs-border-ink/18 hover:bg-ehs-surface/70 focus:border-ehs-normal-blue focus:ring-0.75 focus:ring-ehs-normal-blue/15 disabled:cursor-not-allowed disabled:opacity-60";

export const ehsSelectClass =
  "text4 text-ehs-darker w-full cursor-pointer rounded-2.5 border border-ehs-border-ink/8 bg-ehs-surface/55 px-3.5 py-2.5 backdrop-blur-1.25 outline-none transition hover:border-ehs-border-ink/18 hover:bg-ehs-surface/70 focus:border-ehs-normal-blue focus:ring-0.75 focus:ring-ehs-normal-blue/15 disabled:cursor-not-allowed disabled:opacity-60";

/* `--ehs-dark-blue`, not `--ehs-normal-blue`: link text is small text, and the
   brand teal on a white card is 3.74:1 against the 4.5:1 it needs. The deeper
   step measures 6.01:1 in light; in dark the token resolves to #67d6e6, which
   is the bright end of the hue and already well clear on a near-black card. */
export const ehsLinkClass =
  "text4 text-ehs-dark-blue transition-colors hover:text-ehs-dark-blue-hover";

export const ehsIconButtonClass =
  "cursor-pointer text-ehs-muted-text transition-colors hover:text-ehs-gray";

export const ehsButtonBaseClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50";

/**
 * Button tiers. Primary and danger are solid fills so the actions that matter
 * never dissolve into the scenery; secondary and tertiary are bounded — a
 * legible fill with a border that clears 3:1 against the surface behind it —
 * and only ghost is allowed to disappear until hovered.
 *
 * The quiet tiers used to frost like the fields, with the same hairline and
 * blur. That is right for an input, which is a well you type into, and wrong
 * for a button, which has to advertise that it can be pressed. See the note
 * above `ehsButtonSecondaryClass` for the measurements.
 *
 * The filled tiers' shadow is a token rather than a literal because the two
 * themes need different *shapes*, not different colours: the coloured glow
 * reads as the button spilling light onto a white page, but on a near-black
 * one it haloes the button like a focus ring nobody asked for, so the dark
 * value drops it for a plain contact shadow.
 */
/* `--ehs-accent-solid`, not `--ehs-normal-blue`: white on the brand teal is
   3.74:1 and a 14px label needs 4.5:1. The solid-fill role is the same hue a
   step deeper in light and identical to the old value in dark, which already
   passed. Measured 6.01:1 light, 6.77:1 dark. */
export const ehsButtonPrimaryClass =
  "btn-sweep bg-ehs-accent-solid text-ehs-on-accent shadow-(--ehs-shadow-button-primary) hover:bg-ehs-accent-solid-hover active:bg-ehs-accent-solid-active";

/*
 * Secondary and tertiary diverge from the EHSS recipes on purpose — they were
 * not visible enough to use.
 *
 * The originals were `border-ehs-hairline/60` over `bg-ehs-light-blue/75`.
 * `--ehs-hairline` is `#ffffff` in the light theme, so that is a *white border
 * on a near-white page*: measured against the card behind it, the fill came out
 * at 1.09:1 and the border at 1.06:1. WCAG 1.4.11 asks for 3:1 on the boundary
 * of a UI control. Nothing but a small drop shadow said "button" at all, which
 * is exactly how it looked.
 *
 * The hairline is a glass device: it reads as the lit top edge of a translucent
 * pane sitting on a *shadowed* surface. On a control that is already pale, and
 * on a pale ground, there is no shadow for it to catch.
 *
 * Measured for the replacements (light / dark):
 *   secondary  border vs fill  3.32 / 5.64   border vs card  3.74 / 7.21
 *              label vs fill   5.34 / 7.89
 *   tertiary   border vs card  3.14 / 4.94   label vs fill  12.51 / 11.17
 *
 * All clear 3:1 on the boundary and 4.5:1 on the label, in both themes. Keep
 * them full-opacity: every alpha step below 1.0 on the secondary border drops
 * it under 3:1 in light (see the sweep — /85 lands at 2.75).
 */
export const ehsButtonSecondaryClass =
  "border border-ehs-normal-blue bg-ehs-light-blue text-ehs-dark-blue shadow-xs hover:border-ehs-dark-blue hover:bg-ehs-light-blue-hover active:bg-ehs-light-blue-active";

export const ehsButtonTertiaryClass =
  "border border-ehs-muted-text bg-ehs-surface text-ehs-slate shadow-xs hover:border-ehs-gray hover:bg-ehs-surface-raised hover:text-ehs-darker";

/* Same reason as primary: white on `--ehs-red` is 3.76:1. `--ehs-danger-solid`
   is the fill role, one step deeper in light and unchanged in dark. Measured
   4.83:1 light, 5.83:1 dark. The old hover/active were alpha steps on the
   fill, which *lowered* contrast as the button lightened over the page — they
   are now explicit deeper values instead. */
export const ehsButtonDangerClass =
  "btn-sweep bg-ehs-danger-solid text-ehs-on-accent shadow-(--ehs-shadow-button-danger) hover:bg-ehs-danger-solid-hover active:bg-ehs-danger-solid-hover focus-visible:ring-ehs-red/30";

export const ehsIconButtonBaseClass =
  "inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50";

export const ehsIconButtonPrimaryClass =
  "bg-ehs-accent-solid text-ehs-on-accent shadow-md shadow-ehs-normal-blue/15 hover:bg-ehs-accent-solid-hover active:bg-ehs-accent-solid-active";

/* Same boundary problem, same fix — an icon button has no label to fall back
   on, so an invisible edge leaves nothing on screen but a glyph. */
export const ehsIconButtonSecondaryClass =
  "border border-ehs-normal-blue bg-ehs-light-blue text-ehs-dark-blue shadow-xs hover:border-ehs-dark-blue hover:bg-ehs-light-blue-hover active:bg-ehs-light-blue-active";

export const ehsIconButtonTertiaryClass =
  "border border-ehs-muted-text bg-ehs-surface text-ehs-slate shadow-xs hover:border-ehs-gray hover:bg-ehs-surface-raised hover:text-ehs-darker";

/* Ghost stays borderless — it is the one tier that is *meant* to disappear
   until hovered (row actions, the sidebar logout). Its ink is lifted from
   `--ehs-muted-text` to `--ehs-gray` so the resting glyph still clears 4.5:1
   as text, which is the part that was genuinely too faint. */
export const ehsIconButtonGhostClass =
  "text-ehs-gray hover:bg-ehs-light-bg hover:text-ehs-darker";

/* Same contrast reason as `ehsLinkClass` — this renders as a link, not a fill. */
export const ehsTextButtonClass =
  "inline-flex cursor-pointer items-center gap-1 rounded bg-transparent p-0 text-sm font-medium text-ehs-dark-blue transition-colors hover:text-ehs-dark-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50";
