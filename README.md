# opus-ui

The brand layer shared by every OPUS module — **Downloads**, **Library** and
**Player**.

## Why this exists, and why it is only this

Each module's application skeleton is forked on purpose: they are separate
services, deployed to different hosts on different cadences, and their domain
code has no business being coupled. That stays true.

A *brand* is the opposite case. Forked, it drifts by construction — and it
already had: the three apps carried the same `app.css` structure painted marine
in one and wine in another, plus four byte-identical components in three copies.
Under one product that is not a variation, it is a leak. So exactly one thing
lives here: the layer that must be identical everywhere.

- `tokens.css` — the palette, light and dark
- `base.css` — document defaults (body, links, tables, state colours)
- `Shell.svelte` — the header: wordmark, module name, module nav, module switcher
- `theme.svelte.ts` — light / dark / system, stored under one key for the whole
  product so switching modules keeps the theme you chose
- `i18n.svelte.ts` — the translation runtime; **catalogues stay in each module**
- `Toasts` / `ThemeSwitcher` / `LanguageSwitcher` / `SettingField`
- `marks/` — the favicon family: one shape language, one glyph per module (an
  arrow arriving for Downloads, works on a shelf for Library, a play triangle for
  Player). A module does not keep its own copy; its `static/favicon.svg` is a
  symlink into here, so the family cannot drift one mark at a time.

Domain UI does not belong here. If only one module would ever render it, it is
that module's.

## How a module consumes it

Checked out as a git submodule at `frontend/src/lib/opus`, so Vite compiles it as
ordinary source: no package registry, no network at build time, and the deploy
(which tars the working tree) carries it along like any other file. The pinned
submodule commit is the version.

```bash
git submodule add git@github.com:Bacinac/opus-ui.git frontend/src/lib/opus
```

`src/app.css`:

```css
@import './lib/opus/tokens.css';
@import './lib/opus/base.css';
```

`src/lib/i18n/index.ts` — the module registers its own catalogues and narrows
`t` to its own keys, so a typo is a build error rather than a raw key on screen:

```ts
import { hr } from './hr';
import { en } from './en';
import { i18n, typed } from '$lib/opus';

export type MessageKey = keyof typeof hr;
i18n.register({ hr, en }, 'hr');
export const t = typed<MessageKey>();
export { i18n, formatNumber } from '$lib/opus';
```

`src/routes/+layout.svelte`:

```svelte
<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { Shell } from '$lib/opus';
	import { t } from '$lib/i18n';

	let { children } = $props();
	const nav = $derived([{ href: '/', label: t('nav.engines') }]);
</script>

<Shell module="Downloads" {nav} pathname={page.url.pathname} modules={MODULES}>
	{@render children()}
</Shell>
```

## The one contract

Every module's message catalogue **must** carry the keys the shell renders —
`theme.light`, `theme.dark`, `theme.system`, `lang.switch`, and, if it uses
`SettingField`, `settings.bool.on|off`, `settings.secretSet|secretUnset` plus a
`field.<name>` per field. `SHELL_KEYS` names the first group. A missing key
renders as the key itself rather than throwing: a visible gap beats a blank page.

## Updating

Change a token here, commit, then in each module bump the submodule and commit
the new pointer. Nothing is copied, so nothing can be forgotten in one module and
not another — which is the entire point.
