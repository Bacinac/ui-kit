// Everything a module imports from the package, in one place, so an import line
// never has to know which file something lives in.
//
// CSS is deliberately NOT re-exported here: a module imports `tokens.css` and
// `base.css` from its own app.css, which is where a stylesheet belongs.
//
// Neither are PhotoTimeline and PhotoViewer, for a related reason: they need
// `thumbhash`, and a barrel is resolved whole by whoever imports from it. Listed
// here, a module that will never draw a photograph fails to build for want of a
// package it has no use for. They are imported by path —
// `$lib/opus/PhotoTimeline.svelte` — by the modules that draw them.

export { theme, type Theme } from './theme.svelte';
export { toasts, type Toast, type ToastKind } from './toasts.svelte';
export {
	i18n,
	t,
	registerModule,
	formatNumber,
	formatDateTime,
	formatTime,
	formatDate,
	formatBytes,
	formatRuntime,
	duration,
	plural,
	type Locale,
	type Word
} from './i18n.svelte';
export { request, bytes, json, onUnauthorized, Latest, type Asking } from './http';
export { me, type Role, type Session } from './me.svelte';
export { withLang } from './lang';
export { cssUrl } from './css';
export { modulesFor, moduleName, type ModuleKey } from './modules';
export { recall, keep, forget } from './stored';
export { SettingsDraft, type StoredSetting } from './settings.svelte';
export { episodeCode, videoStateMark } from './media';
export { tileOf, previewOf, playOf, aboutOf, cropOf, portraitOf, morphOf, regrouping, unlessRegrouping } from './photos';

export { default as ArmedButton } from './ArmedButton.svelte';
export { default as Button } from './Button.svelte';
export type { Tone } from './Button.svelte';
export { default as Card } from './Card.svelte';
export { default as Chips } from './Chips.svelte';
export { default as Dialog } from './Dialog.svelte';
export { default as Field } from './Field.svelte';
export { default as EpisodeRow } from './EpisodeRow.svelte';
export { default as MediaHead } from './MediaHead.svelte';
export { default as Meter } from './Meter.svelte';
export { default as Notice } from './Notice.svelte';
export { default as Picks } from './Picks.svelte';
export type { Pick } from './Picks.svelte';
export { default as Progress } from './Progress.svelte';
export { default as SearchBox } from './SearchBox.svelte';
export { default as SeriesPage } from './SeriesPage.svelte';
export type { PageEpisode, PageSeason, PageTag } from './SeriesPage.svelte';
export { default as StateMark } from './StateMark.svelte';
export { default as Tag } from './Tag.svelte';
export { default as Tally } from './Tally.svelte';
export type { Count } from './Tally.svelte';
export type { Tone as TagTone } from './Tag.svelte';
export { default as Letters } from './Letters.svelte';
export { initialOf, compareHr, lettersOf } from './letters';
export { default as Tabs } from './Tabs.svelte';
export type { Tab } from './Tabs.svelte';
export { default as Account } from './Account.svelte';
export { default as Login } from './Login.svelte';
export { default as Icon } from './Icon.svelte';
export { settle } from './settle';
export { hold } from './hold';
export { default as PageHead } from './PageHead.svelte';
export type { Fact } from './PageHead.svelte';
export { default as People } from './People.svelte';
export { default as Devices } from './Devices.svelte';
export { default as Preferences } from './Preferences.svelte';
export { default as Shell } from './Shell.svelte';
export type { Alert, NavItem, ModuleLink } from './Shell.svelte';
export { default as Stats } from './Stats.svelte';
export type { Stat } from './Stats.svelte';
export { default as Wordmark } from './Wordmark.svelte';
export { default as SaveBar } from './SaveBar.svelte';
export { default as Toasts } from './Toasts.svelte';
export { default as SettingField } from './SettingField.svelte';
export type { FieldSetting } from './SettingField.svelte';
