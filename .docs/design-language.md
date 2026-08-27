# Design Language

The rules that make every workspace screen look like one product. This is a
**compact, information-dense** app — a working surface, not a marketing page.
When in doubt: smaller, tighter, fewer.

> Applies to every page under `app/(hub)/` and everything in `components/`.

---

## 1. Core principles

1. **Content over chrome.** Padding, borders and shadows are there to group
   content, never to fill space. If a container can be removed without losing
   grouping, remove it.
2. **One size per role.** A "control" is always the same size everywhere —
   a filter chip, a nav item and a primary button are visually siblings.
3. **Above the fold.** A user landing on any page should see real data without
   scrolling. Headers and stat bars must not eat the viewport.
4. **One action surface.** Don't repeat the same action as both an inline
   button and a menu item. Pick one — usually the `⋮` menu.
5. **Never hand-roll type.** Use the type scale classes; never `text-*`,
   `leading-*` or `tracking-*` on their own.

---

## 2. Type scale

Defined in [`app/globals.css`](../app/globals.css). These are the **only**
text sizes in the app. Each bundles size + line-height + tracking + weight and
steps up responsively, so never pair them with `text-*` / `leading-*` /
`tracking-*`.

| Class        | Use for                                                |
| ------------ | ------------------------------------------------------ |
| `heading1`   | Auth / marketing hero only — **not** in the workspace   |
| `heading2`   | Non-compact page title                                  |
| `heading3`   | **Compact page title** (workspace default)              |
| `heading4`   | Section title inside a page                             |
| `heading5`   | Rare — small emphatic label                             |
| `heading6`   | Card title, dense row title                             |
| `paragraph1` | Lead body — intros only                                 |
| `paragraph2` | **Default body**, control labels, primary row text      |
| `paragraph3` | Meta, captions, timestamps, menu items                  |
| `eyebrow`    | Small uppercase group label (see below)                 |

Weight is a *default*, not a lock — `font-medium` / `font-semibold` on top is
fine when a specific element needs it (e.g. controls use
`paragraph2 font-medium`).

### `eyebrow`

The small uppercase label that sits above a group — rail headings
("YOUR NEPTUNE TEAM", "AT A GLANCE"), table column headers, the sidebar "HUB"
tag, detail-pane field labels.

```tsx
<h3 className="eyebrow text-gray">At a glance</h3>
```

It bakes in uppercase + letter-spacing + weight, so it is the **one sanctioned
exception** to the "no `tracking-*`" rule — and the reason components must
never write `paragraph3 uppercase tracking-wider` by hand. Pair it with a text
color and nothing else.

**Workspace rule of thumb:** page title `heading3`, subtitle `paragraph3`,
card title `heading6` or `paragraph2 font-semibold`, everything secondary
`paragraph3`.

---

## 3. Color & surfaces

Tokens live in the `@theme` block of `app/globals.css`. Use the semantic names
(`darkest`, `gray`, `border`, `red`, …) — never raw hex in a component.

### Surface hierarchy

Three levels, and that's it:

| Level      | Classes                                          | Use for                         |
| ---------- | ------------------------------------------------ | ------------------------------- |
| Page       | (inherits app background)                        | The page itself                 |
| **Card**   | `rounded-xl border border-slate-200/60 bg-white`  | Primary content containers      |
| Nested     | `rounded-lg bg-gray/8`                            | A block *inside* a card         |

- **Prefer a border over a shadow.** Shadows are for things that genuinely
  float: popovers, modals, dropdowns.
- Don't stack fills. A `bg-gray/8` block inside a `bg-gray/12` card reads as
  mud — put nested blocks on white cards.
- Divider between rows: `border-slate-100`. Divider on a header/edge:
  `border-slate-200/60`.

### Interaction tints

| State           | Class                                    |
| --------------- | ---------------------------------------- |
| Hover (neutral) | `hover:bg-gray/6`                         |
| Hover (on chip) | `hover:text-darkest`                      |
| Active/selected | `bg-darkest text-white`                   |
| Inactive chip   | `bg-gray/12 text-gray`                    |
| Destructive     | `text-red hover:bg-red/10`                |

---

## 4. Spacing rhythm

Small, consistent steps. Anything above `gap-4` inside a page is suspect.

| Context                      | Value                    |
| ---------------------------- | ------------------------ |
| Page section stack           | `gap-3`                   |
| Between sibling cards / grid | `gap-2.5` – `gap-3`       |
| Card padding                 | `p-2` (dense) – `p-3`     |
| Inline group (icon + label)  | `gap-1.5` – `gap-2.5`     |
| Chip row                     | `gap-1.5`                 |
| Tight stack (title/subtitle) | `gap-0.5`                 |
| Empty state block            | `py-8` – `py-12`          |

Radii: `rounded-lg` for controls and nested blocks, `rounded-xl` for cards,
`rounded-2xl` for large containers (tables, page-level panels),
`rounded-full` for avatars, icon buttons and progress bars.

---

## 5. Controls

### The control baseline

Nav items, filter chips, tabs and text buttons **all share this**:

```
rounded-lg px-3 py-2 paragraph2 font-medium transition-colors
```

Then only the color varies:

```tsx
// Active
"bg-darkest text-white"
// Inactive
"bg-gray/12 text-gray hover:text-darkest"
```

This is why the sidebar nav, the Assets source chips, the Assets category
chips, the Users tabs and the "Submit a File" button all line up. **Don't
introduce a new control size.** No responsive size bumps on controls
(`sm:px-7 sm:py-3` and friends) — they break the alignment.

### Icon buttons

```
flex size-7 items-center justify-center rounded-lg  // dense (in-card ⋮)
flex size-8 items-center justify-center rounded-lg  // standard (toolbar, pagination)
```

### Icon sizes

| Size      | Use for                                   |
| --------- | ----------------------------------------- |
| `size-3.5`| Inside dropdown menu items                 |
| `size-4`  | **Default** — controls, nav, row icons     |
| `size-5`  | Rare — deliberately prominent              |

Anything `size-6`+ is decorative (empty-state art, file-type placeholders).

---

## 6. Component patterns

### Page header

Use [`PageHeader`](../components/layouts/PageHeader.tsx) with `compact` for
every workspace page:

```tsx
<PageHeader title="Action Plan" subtitle="Shared road map…" compact />
```

`compact` → `heading3` title + `paragraph3` subtitle + tighter gaps. The
non-compact variant (`heading2`/`paragraph2`) is for wider, less dense pages.

### Cards

```tsx
<article className="flex flex-col rounded-xl border border-slate-200/60 bg-white p-3 transition-colors hover:bg-gray/6">
```

- Title `heading6` or `paragraph2 font-semibold`, meta `paragraph3 text-gray`.
- Clamp long text: `line-clamp-2` for descriptions.
- **The whole card is clickable** for its primary action (see §7).

### Tables

[`SimpleTable`](../components/SimpleTable.tsx) is the only table. Shell:

```
container:  rounded-2xl border border-slate-200/60
header:     border-b border-slate-200/60 bg-gray/8 px-5 py-2.5
header txt: paragraph3 tracking-wide text-gray uppercase
row:        border-b border-slate-100 px-5 py-3, hover:bg-gray/6
```

Rows are clickable when there's an obvious primary action. Keep the action
column to a slim `⋮` — don't line up inline buttons.

### Dropdowns / context menus

[`ContextMenu`](../components/ContextMenu.tsx):

```
popover: absolute z-20 mt-1 w-32 rounded-lg border border-slate-200 bg-white shadow-lg
items:   divide-y divide-border, each `h-8 px-2.5 paragraph3 gap-1.5`
```

- No title/header row inside the menu — the trigger is context enough.
- Items are optional props; render only what applies (`onEdit ? … : null`), and
  use `divide-y` so dividers never trail after the last item.
- Destructive item last, `text-red hover:bg-red/5`.

### Progress bars

```
track: h-1.5 w-full overflow-hidden rounded-full bg-gray/20
fill:  h-full rounded-full bg-darkest transition-all duration-500
```

Use `h-1` for inline/mini bars sitting next to text.

### Stat rows

Number `heading4`, label `paragraph3 text-gray`, baseline-aligned, `gap-1.5`
inside a pair and `gap-4` between pairs. Numbers are data — they don't need to
be `heading2` to be readable.

---

## 7. Interaction

- **Primary action = click the container.** Cards and table rows open the
  main thing (view/preview). Give them `role="button"`, `tabIndex={0}`, and an
  `Enter`/`Space` `onKeyDown` handler — not just `onClick`.
- **Nested controls must stop propagation.** Wrap any button/menu inside a
  clickable card or row and call `event.stopPropagation()` so it doesn't also
  fire the container's action.
- **Focus is visible:** `focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-blue-normal/40`.
- **Transitions:** `transition-colors` for hover tints, `duration-500`/`700`
  for progress fills. Don't animate layout.
- Every icon-only control needs an `aria-label`; decorative icons get
  `aria-hidden`.

---

## 8. States

Use the shared components — don't hand-roll:

- Loading → [`LoadingState`](../components/ui/LoadingState.tsx)
- Error → [`ErrorState`](../components/ui/ErrorState.tsx) (always pass `onRetry`)
- Skeleton → [`Skeleton`](../components/ui/Skeleton.tsx)

Empty state:

```tsx
<div className="py-8 text-center paragraph2 text-gray">
  No action plan items yet for this hub.
</div>
```

Say what's missing *and* what to do about it when there's a next step.

---

## 9. Checklist before you ship a screen

- [ ] Page uses `PageHeader … compact`
- [ ] Page section stack is `gap-3`
- [ ] Every chip/tab/button uses the control baseline (§5)
- [ ] No `text-*` / `leading-*` / `tracking-*` outside the type scale
- [ ] No raw hex colors
- [ ] Cards are `rounded-xl border border-slate-200/60 bg-white`
- [ ] Icons are `size-4` (or `size-3.5` in menus)
- [ ] Primary action works by clicking the card/row, with keyboard support
- [ ] Nested controls call `stopPropagation`
- [ ] Loading / error / empty states all use the shared components
- [ ] Real content is visible without scrolling
