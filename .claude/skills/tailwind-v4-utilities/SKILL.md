---
name: tailwind-v4-utilities
description: Tailwind v4 spacing scale, rounding fractional MCP/Figma px, and bg-linear-to-* gradients. Use when writing classes from a Figma/MCP spec, or when tempted to write an arbitrary [Npx] value.
---

<!-- Mirror of .cursor/rules/tailwind-v4-utilities.mdc — edit both, keep the bodies identical. -->

# Tailwind v4 utilities

## Never copy MCP / Figma fractional sizes

MCP (Figma, etc.) often returns fractional px like `12.75`, `9.73`, `29.19`, `0.97`. **Do not use those values.**

1. Round to the **nearest integer** px (e.g. `12.75` → `13`, `9.73` → `10`, `29.19` → `29`, `0.97` → `1`).
2. Map that integer to the **closest Tailwind spacing-scale** utility (1 unit = 4px). Prefer scale classes over arbitrary `[Npx]`.
3. Sub-pixel borders (~1px) → `border` / `border-b`, not `border-[0.97px]`.

```
❌ gap-[9.73px] size-[29.19px] rounded-[3.89px] border-[0.97px] h-[50.595px]
✅ gap-2.5     size-7         rounded         border          h-12.5
```

## Spacing — no arbitrary pixels

Do **not** use arbitrary pixel (or rem) values when a Tailwind spacing-scale class exists.

- Prefer: `h-45`, `w-12`, `p-4`, `gap-2`, `min-h-80`, `max-w-96`
- Avoid: `h-[180px]`, `w-[48px]`, `p-[16px]`, `gap-[0.5rem]`, `min-h-[20rem]`

| Arbitrary | Scale                                       |
| --------- | ------------------------------------------- |
| `Npx`     | `N / 4` → e.g. `h-[180px]` → `h-45`         |
| `Nrem`    | `N * 4` → e.g. `min-w-[12rem]` → `min-w-48` |

Only keep arbitrary values when the size is **not** on the 4px/0.25rem grid after rounding.

## Gradients — `bg-linear-to-*`

- Prefer: `bg-linear-to-t`, `bg-linear-to-b`, `bg-linear-to-r`, `bg-linear-to-br`
- Avoid: `bg-gradient-to-t`, `bg-gradient-to-b`, `bg-gradient-to-r`, `bg-gradient-to-br`

`from-*` / `via-*` / `to-*` stop colors stay the same.

## This is enforced by ESLint

`eslint.config.mjs` reports all of the above as **warnings** — never errors, so they flag drift
without failing a build.

Class **order** is enforced too, but by Prettier rather than by the Tailwind plugin:
`.prettierrc` loads `prettier-plugin-tailwindcss`, and `eslint-plugin-prettier` surfaces the
result as `prettier/prettier` warnings in ESLint. `tailwindcss/classnames-order` is therefore off
— two sorters would fight. Both `npx eslint --fix` and `npm run format` clear ordering warnings.

| What fires                                                         | Rule                                             |
| ------------------------------------------------------------------ | ------------------------------------------------ |
| Fractional px/rem (`gap-[9.73px]`, `border-[0.97px]`)              | `no-restricted-syntax`                           |
| `bg-gradient-to-*`                                                 | `no-restricted-syntax`                           |
| Arbitrary value that has a scale equivalent (`h-[180px]` → `h-45`) | `tailwindcss/no-unnecessary-arbitrary-value`     |
| Conflicting classes (`px-2 px-4`)                                  | `tailwindcss/no-contradicting-classname`         |
| v3 important marker (`!flex` → `flex!`)                            | `tailwindcss/important-modifier-suffix`          |
| Negated arbitrary (`-translate-x-[85%]` → `translate-x-[-85%]`)    | `tailwindcss/enforces-negative-arbitrary-values` |

### Radius is token-gated — check before using `rounded-<number>`

Tailwind's spacing scale is dynamic in v4 (`h-5.25`, `pb-2.75` all generate), **but radius is
not**. Bare numeric radii only work when a matching `--radius-*` variable exists in
`globals.css`, and only four do:

```
--radius-2.5: 0.625rem;   --radius-3: 0.75rem;
--radius-4:   1rem;       --radius-5: 1.25rem;
```

`rounded-2`, `rounded-1.5`, `rounded-3.5` and friends emit **no CSS at all** — the corners
render square and nothing warns you. Use `rounded-2.5` / `-3` / `-4` / `-5`, one of Tailwind's
named sizes (`rounded-lg`, `rounded-full`), or an explicit `rounded-[9px]`. If you need a new
numeric radius, add the `--radius-*` token first.

> As of 2026-08-18 the repo has **263 occurrences** of untokenized numeric radii (172 of them
> `rounded-2`) that are silently rendering square. Pre-existing and untouched by the formatting
> sweep — fixing them changes the visual design in 263 places, so it needs a deliberate decision,
> not a drive-by edit.

Two things the enforcement deliberately does **not** do:

- **`tracking-*` and `leading-*` are exempt from the fractional check.** Letter-spacing and
  line-height are legitimately sub-pixel; rounding `tracking-[0.22px]` to `0px` would silently
  change the design. Half the raw matches in this repo were these two.
- **Arbitrary values are not banned outright.** `tailwindcss/no-arbitrary-value` is off. A size
  that is genuinely off the 4px grid after rounding still belongs in brackets — that is the
  escape hatch this page has always allowed.

The checks match on raw class strings, so they fire inside `cn()` / `clsx()` calls and extracted
`const` strings too, not just JSX `className`. One caveat: `no-restricted-syntax` reports **once
per string literal**, so a single className with three fractional values yields one warning — fix
them all, not just the one the caret points at.
