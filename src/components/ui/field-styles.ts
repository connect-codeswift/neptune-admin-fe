/**
 * Canonical form-control styling for the whole app.
 *
 * NOTE — `backdrop-blur-1.25` and `focus:ring-0.75` below emit no CSS. Tailwind
 * v4 resolves `backdrop-blur-*` through `--blur-*` theme values and neither this
 * repo nor the EHSS repo this file was ported from declares them, so both
 * utilities are inert: fields have no backdrop blur, and the focus state is
 * carried entirely by `focus:border-ehs-normal-blue`.
 *
 * They are kept rather than deleted because that is exactly how the fields
 * render in the EHSS app, which this app is matching. Declaring `--blur-1.25`
 * to "fix" them would not restore an intended design — it would make this app's
 * inputs blur and ring where the reference app's do not, i.e. it would create
 * the divergence it looks like it is repairing. If the blur and ring are wanted,
 * add them to BOTH repos in the same change.
 *
 * These classes were previously redeclared in ten places and had drifted into
 * five different looks — three input heights, two corner radii, two font sizes
 * and two border colours, depending on which screen you were on. Everything now
 * imports from here, so a change lands once.
 *
 * The values are the incident-report / HazCom treatment, which was already the
 * most widely used. Colours are expressed as theme tokens rather than the raw
 * hex the originals hardcoded — `--ehs-dark-bg` is `#0b1320`, `--ehs-muted-text`
 * is `#8892a3` and `--ehs-normal-blue` is `#0891a6`, so this renders identically
 * while staying tied to the palette.
 *
 * `ehsInputClass` in `@/lib/ehs-classes` (auth screens and the generic
 * `components/inputs` controls) now mirrors this treatment — same fill,
 * hairline, blur and focus halo. It used to be a solid panel because those
 * screens sat on opaque backgrounds; the app went glass, and the fields went
 * with it. If FIELD_BASE's material changes, change it there too.
 */

const FIELD_BASE = [
  "w-full rounded-2.5 border border-ehs-border-ink/8",
  // 55% white to sit on the thinner glass cards the app now uses — 62% read
  // a step more solid than the surface underneath it.
  "bg-ehs-surface/55 text-ehs-dark-bg backdrop-blur-1.25 outline-none",
  "transition-[color,background-color,border-color,box-shadow] duration-150",
  "placeholder:text-ehs-muted-text",
  "hover:border-ehs-border-ink/18 hover:bg-ehs-surface/[0.78]",
  // A soft 3px halo rather than a hard 2px ring — reads as a glow at this
  // field size instead of a second border fighting the first.
  "focus:border-ehs-normal-blue focus:ring-0.75 focus:ring-ehs-normal-blue/[0.15]",
  // Error state, driven by `aria-invalid` so the styling and the accessible
  // state can't disagree.
  "aria-invalid:border-ehs-red aria-invalid:focus:border-ehs-red aria-invalid:focus:ring-ehs-red/[0.15]",
  "disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

/** Single-line inputs and selects. */
export const FIELD_INPUT_CLASS = ` p-3 text4  ${FIELD_BASE}`;

/**
 * Selects: native chevron removed so we can draw our own, with room for it.
 */
export const FIELD_SELECT_CLASS = `${FIELD_INPUT_CLASS} cursor-pointer appearance-none pr-9 `;

/**
 * Applied while a select has no value, so "Select…" reads as a prompt rather
 * than an answer. Matters now that the classification questions start blank —
 * an unanswered field should look unanswered.
 */
export const FIELD_SELECT_PLACEHOLDER_CLASS = "text-ehs-muted-text text4";

/** Multi-line inputs — same skin, no fixed height. */
export const FIELD_TEXTAREA_CLASS = `min-h-27.5 resize-y px-3.25 py-[11px] text4 leading-normal ${FIELD_BASE}`;

/**
 * Textarea with a reserved strip along the bottom for in-field controls such as
 * the AI assist button. Taller than the plain variant so the writing area still
 * shows three lines once the strip is taken out.
 */
export const FIELD_TEXTAREA_WITH_CONTROLS_CLASS = `min-h-32 resize-y px-3.25 pt-[11px] pb-10 text4 leading-[19.5px] ${FIELD_BASE}`;

/**
 * Taller variant for the template/form builders, where a field is the primary
 * thing on the row rather than one cell in a dense grid.
 */
export const FIELD_INPUT_LG_CLASS = `px-3 py-2.5 text4 ${FIELD_BASE}`;
