# ui-kit

The interface every product shares — the OPUS modules, DIDA and BABA — with no
brand of its own.

## Why this exists

A button is a button in every product, and a dialog, a toast and a request
helper are the same thing wherever they are drawn. Forked, they drift by
construction: in OPUS alone the same button had been drawn sixteen ways and a
request helper written three ways that disagreed about what a failure is. So
what a person touches lives here once, and a primitive missing from the kit is
made here, never improvised in a product.

What differs between products is their brand — the palette, the marks, the
door a person signs in through — and that stays with each product's own layer
(`opus-ui` for OPUS). The frame around a page is not brand: a product hands
the kit's `Frame` its mark and its sections, and every product is walked the
same way.

## What is in it

Ground
- `tokens.css` — shape, type scale, the one face (`--font-sans`, which a
  Tailwind product takes through its own utilities), what is laid over a
  picture, shadows. The palette is not here: the product defines it
  (below). Seven text sizes (`--fs-2xs` … `--fs-2xl`) and no other
- `base.css` — document defaults: body, links, fields (what is typed into —
  not sliders, tick boxes or pickers), tables, `.fields`, `.action-row`, `.muted`
- `names.mjs` — every button, link and clicked element has a name a screen
  reader can say: words on its face, or `aria-label` (`label` on `Button`)
  when the face is a sign. A surface drawn on with the pointer says
  `role="presentation"` instead. Every product's check runs it over its `src`
- `type.mjs` — every size of text is one of the seven steps: a size written
  out below 2rem, or Tailwind's in-between `text-sm`/`base`/`lg`/`3xl`, fails.
  Every product's check runs it over its `src`

Frame
- `Frame` — the frame every page stands in: a sidebar with the product's mark
  (`brand`), its `sections` in groups and the `Signature`; a top bar with what
  only the product says on every page (`bar`) and the account menu; on a phone
  a bottom bar of the sections named in `tabs` (four, or five when one would be
  left over) and a sheet for the rest. The page scrolls, not a box inside it.
  It measures its top bar into `--shell-header`, its bottom bar into
  `--shell-bar-h`, says its top padding as `--shell-main-top`, and gives a page
  that fills the screen instead of scrolling the height it has as `--frame-room`
- `PageHead` — a page's title, counted facts and ways in, pinned under the
  header. It reads the header's height from `--shell-header` and the frame's top
  padding from `--shell-main-top`, and writes its own height to `--page-head`
- `Heading` — what introduces a block within a page
- `Dialog` — a window over the page: heading, way out, Escape, and the keyboard
  kept inside it
- `Dialogs` with `dialog` (`dialogs.svelte.ts`) — a question put to the person:
  `await dialog.confirm(…)` / `dialog.alert(…)`, drawn by the one `<Dialogs />`
  the product mounts in its frame

Controls
- `Button` (`tone`, `size="small"`, `href`), `ArmedButton` — the one confirm for
  what does not come back
- `Picks` — the one row of choices, one or many
- `Field` — a labelled control: its own input (`value`, `type`), or a label and
  hint around a control handed to it
- `SaveButton` — the one Save: open only when `dirty` and not `saving`;
  `SaveBar` carries it at the foot of a settings form
- `Toggle` — on or off, for what takes effect the moment it is flipped
- `Tabs`, `SearchBox`, `SettingField`, `Chips`, `SaveBar`
- `Tag` — the pill a list hangs a fact or a state on (`tone`, `onpicture`,
  `dashed`), or a kind of thing (`kind`, painted by the palette's
  `--kind-<name>`)
- `Notice`, `Progress`, `Meter`, `Stats`, `Letters`, `Icon`, `Toasts`
- `NewVersion` — the bar a tab running an older build shows, with the way to
  reload it
- `About` — the page that says what the product is, who made it and which
  build the tab runs; the product hands over its mark (`brand`), its words and
  its `VersionWatch`'s `booted`
- `Signature` — the line at the foot of a frame: the maker, the build, the way
  to `/about`. Who the maker is lives once, in `maker.ts`

Behaviour
- `http.ts` — `request()`: the one way a page asks its backend. A refusal is a
  toast with the backend's detail, a server that does not answer is said, a 204
  is a success, `on` handles the statuses a call expects, `Latest` keeps a
  superseded answer off the screen, `onUnauthorized` lets the product show its
  door on a 401. `json()` builds a JSON body
- `version.svelte.ts` — `VersionWatch`: which build the tab runs, whether the
  server serves a newer one, a reload once nobody is using the tab, and after a
  reload the build it now runs. The product hands it the call that reads its
  `/version` and starts it once from its frame with `watch()`; `holdWhile()`
  adds what only the product can tell keeps the tab in use, and `held` says so
- `settings.svelte.ts` — `SettingsDraft`: what is stored, the draft over it,
  `dirty`, and a save that sends only what changed
- `i18n.svelte.ts` — the runtime, `registerModule()`, and the formatters every
  number, size, date and length on a screen goes through: `formatNumber`,
  `formatBytes`, `formatDate`, `formatDateTime`, `formatTime`, `formatRuntime`,
  `duration`, `plural`
- `theme.svelte.ts` (light, dark, system — the `.dark` class on the document),
  `toasts.svelte.ts`, `lang.ts` (`withLang`), `css.ts` (`cssUrl`), `layers.ts`,
  `stored.ts`, `letters.ts`, `settle.ts`, `hold.ts` (`use:hold` — what a line
  offers on a long press or a right click)
- `words/` — the words these components say, in Croatian and English, and
  `check.mjs`, the checker every product runs its own catalogues through

## The palette a product brings

A product defines, for light in `:root` and for dark in `.dark`: `--bg`,
`--surface`, `--surface-2`, `--border`, `--text`, `--muted`, `--accent`, `--ok`,
`--warn`, `--danger`, and one `--kind-<name>` for every kind its tags paint.
Nothing in the kit falls back to a colour of its own, so a palette that forgets
one shows it at once. A product may add names of its own beside them — a
fainter text, the colour written on the accent — the kit paints only with these.

Density is the product's too: `--field-pad` and `--field-fs` size every field
and every row of `Picks`. Unset, a field takes the reading size a television
wants and `Picks` the size of the text around them; a product dense with
settings sets both in its `:root`.

## How a product consumes it

Checked out as a git submodule at `src/lib/kit` of the product's frontend, so
Vite compiles it as ordinary source: no registry, no network at build time, and
the deploy carries it like any other file. The pinned submodule commit is the
version. There is no standalone clone: change it inside one product's
submodule, commit and push there, then bump the pointer in every product.

`src/app.css`:

```css
@import './lib/kit/tokens.css';
@import './<the product's palette>.css';
@import './lib/kit/base.css';
```

A product on Tailwind imports `base.css` into `layer(base)`, so a utility on an
element still has the last word over a document default, and maps its own
colour utilities onto the palette with `@theme inline`.

The product's words, registered once before anything renders, with the words
of any package it is built on beneath them:

```ts
import { registerModule, type Word } from '$lib/kit';

export const t = registerModule({ hr, en }, [/* a package's { hr, en } */]);
```

## The contract with a product's words

The words a kit component says are the kit's (`words/hr.ts`, `words/en.ts`).
A package above the kit says its own, and a product carries only what it alone
knows. A layer that says a word already said beneath it fails at boot. The
catalogues are one word per line, Croatian first, English in the same order,
and `words/check.mjs` — given the product's families and the directories of the
packages it is built on — holds them to that. `src` names the frontend's source
under the repository (`frontend/src` unless said), and `named` lists the words a
server hands over whole, each with where they are read from.

## Licence

[PolyForm Noncommercial 1.0.0](LICENSE.md) — free for personal and
noncommercial use; a commercial licence on request. Outside contributions
(pull requests) are not taken. Required Notice: Copyright (c) 2026 Ivo Bošković.
