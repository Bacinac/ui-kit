# opus-ui

The interface shared by every OPUS module — **Downloads**, **Library** and
**Player**.

## Why this exists

Each module's application is its own: separate services, deployed to different
hosts on different cadences, and their domain code has no business being
coupled. The interface is the opposite case. Forked, it drifts by construction —
and it had: the same button drawn sixteen ways, a dialog five ways, a request
helper three ways that disagreed about what a failure is. So what a person
touches in every module lives here once, and a primitive missing from this
package is made here, never improvised in a module.

## What is in it

Ground
- `tokens.css` — the palette, light and dark, and the radii. One red
  (`--danger`), one colour per kind of thing kept (`--kind-film`,
  `--kind-series`, `--kind-music`, `--kind-photos`)
- `base.css` — document defaults: body, links, fields, tables, `.fields`,
  `.action-row`, `.muted`
- `app.html` — the page template; a module links `src/app.html` to it
- `csp.js` — the page policy (`kit.csp` in every module's `svelte.config.js`):
  scripts only from the module itself or under the per-request nonce
- `server.mjs` — the production server: the built app, `/api` proxied to
  `OPUS_API_URL` (required), websocket upgrades, and upstream streams dropped
  when the reader leaves, and the client address the backend is told: from a
  proxy in `OPUS_TRUSTED_PROXIES` its `cf-connecting-ip` or first
  `x-forwarded-for`, from anybody else the socket. A module's Dockerfile copies
  it beside the build; `node --test server.test.mjs` checks the address rule

Frame
- `Shell` — header, module nav, the way across to the other modules, the
  account menu, alerts; it says its own words
- `Wordmark`, `Login`, `Account` (password, preferences, the tokens of the machines that call the module and
  — for an admin of the module that keeps the roster — `People` and `Devices`),
  `Preferences`
- `PageHead` — a page's title, counted facts and ways in, pinned under the
  header
- `MediaHead` — the top of a page about one thing: a film, a series, a record, a
  person; `amount` puts how many it holds in brackets after the name. `SeriesPage` and `EpisodeRow` build a series on it: one season at a
  time behind a picker, each line with its still, running time and how far the
  profile got. `StateMark` says a state as one tinted icon, its words on the
  pointer; `Tally` says a season as icon-and-number counts
- `Dialog` — a window over the page: heading, way out, Escape, and the keyboard
  kept inside it

Controls
- `Button` (`tone`, `size="small"`, `href`), `ArmedButton` — the one confirm for
  what does not come back
- `Picks` — the one row of choices, one or many
- `Tabs`, `SearchBox`, `Field`, `SettingField`, `Chips`, `SaveBar`
- `Tag` — the pill a list hangs a fact or a state on (`err`, `onpicture`,
  `dashed`, and the kinds)
- `Notice`, `Progress`, `Meter`, `Stats`, `Letters`, `Icon`, `Toasts`

Photographs (imported by path — they need `thumbhash`)
- `PhotoTimeline`, `PhotoViewer`

Behaviour
- `http.ts` — `request()`: the one way a page asks its backend. A refusal is a
  toast with the backend's detail, a server that does not answer is said, a 204
  is a success, `on` handles the statuses a call expects, `Latest` keeps a
  superseded answer off the screen, `onUnauthorized` lets the module show its
  door on a 401. `json()` builds a JSON body
- `me.svelte.ts` — who is signed in and at what standing: `me.check()`,
  `me.logout()`, `me.admin`, `me.guest`
- `settings.svelte.ts` — `SettingsDraft`: what is stored, the draft over it,
  `dirty`, and a save that sends only what changed
- `i18n.svelte.ts` — the runtime, `registerModule()`, and the formatters every
  number, size, date and length on a screen goes through: `formatNumber`,
  `formatBytes`, `formatDate`, `formatDateTime`, `formatTime`, `formatRuntime`,
  `duration`, `plural`
- `modules.ts` (`modulesFor`, `moduleName`), `lang.ts` (`withLang`), `css.ts` (`cssUrl`),
  `media.ts` (`episodeCode`, `videoStateMark`), `photos.ts` (`tileOf`,
  `previewOf`, `playOf`, `aboutOf`, `cropOf`, `portraitOf`, `morphOf`),
  `layers.ts`, `stored.ts`, `letters.ts`, `settle.ts`, `hold.ts` (`use:hold` — what a
  line offers on a long press or a right click; `EpisodeRow` takes it as `onhold`)
- `words/` — the words these components say, in Croatian and English, and
  `check.mjs`, the checker every module runs its own catalogues through
- `marks/` — every OPUS mark, derived by `marks/build.sh` from the accepted
  family sheet: one cut O for the tab (`favicon.*`) and the home screen
  (`icons/`), shared by all three modules; the full lockups
  `opus-{downloads,library,player}.svg`, which `Wordmark` shows; and the
  Android vectors (`android/`) the Player's TV app copies in. A module's
  `static/` links into it; bump `?v=` in `app.html` and the manifest when the
  marks change

## How a module consumes it

Checked out as a git submodule at `frontend/src/lib/opus`, so Vite compiles it as
ordinary source: no registry, no network at build time, and the deploy carries
it like any other file. The pinned submodule commit is the version.

```bash
git submodule add git@github.com:Bacinac/opus-ui.git frontend/src/lib/opus
ln -s lib/opus/app.html frontend/src/app.html
```

`src/app.css`:

```css
@import './lib/opus/tokens.css';
@import './lib/opus/base.css';
```

`src/lib/i18n/index.ts`:

```ts
import { hr } from './hr';
import { en } from './en';
import { registerModule, type Word } from '$lib/opus';

export type MessageKey = keyof typeof hr | Word;
export const t = registerModule({ hr, en });
```

`src/routes/+layout.svelte`:

```svelte
<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { Login, Shell, Toasts, me, onUnauthorized } from '$lib/opus';
	import { MODULE, MODULES } from '$lib/core/modules';

	let { children } = $props();
	onUnauthorized(() => (me.open = false));
	$effect(() => {
		me.check();
	});
</script>

{#if me.open === false}
	<Login module={MODULE} onin={() => me.check()} />
	<Toasts />
{:else if me.open}
	<Shell module={MODULE} nav={[]} pathname={page.url.pathname} modules={MODULES}
		account={me.name ? { username: me.name, href: '/account', onlogout: () => me.logout() } : undefined}>
		{@render children()}
	</Shell>
{:else}
	<Toasts />
{/if}
```

## The contract with a module's words

The words a package component says are the package's (`words/hr.ts`,
`words/en.ts`), and a module that says one of them again fails at boot. A module
carries only what it alone knows: its domain, and the `field.*`,
`settings.opt.*` and `settings.err.*` words for its own settings, which
`SettingField` and `SettingsDraft` build keys for. Its catalogues are one word
per line, Croatian first, English in the same order, and `words/check.mjs` —
run with the module's own families — holds them to that.

## Updating

Change something here, commit, then in each module bump the submodule and commit
the new pointer, and run that module's check and build.
