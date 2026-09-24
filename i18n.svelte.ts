/* The i18n runtime, shared — and, since the components in this package say
   words of their own, the words for those components too.

   How translation works is identical in every product on the kit (same two
   locales, same storage, same {param} interpolation, same Intl formatting), and
   so is what its components SAY: a dialog closes with the same word everywhere.
   What differs is each product's domain, and that stays with the product.

   This used to be a list of keys the package obliged every module to carry.
   Three modules satisfying that contract independently is not one vocabulary,
   it is three that happen to agree until they do not — which they had already
   stopped doing. A product that redefines one of these now fails at boot rather
   than quietly winning. */

import { keep, recall } from './stored';
import { hr as wordsHr } from './words/hr';
import { en as wordsEn } from './words/en';

const WORDS = { hr: wordsHr, en: wordsEn } as const;

/** A word the package says. Modules widen their own key type with it, so a typo
    is still a build error on either side of the line. */
export type Word = keyof typeof wordsHr;

export type Locale = 'hr' | 'en';

const STORAGE_KEY = 'locale';
const INTL_LOCALES: Record<Locale, string> = { hr: 'hr-HR', en: 'en-US' };

export type Catalogs = Record<Locale, Record<string, string>>;

class I18n {
	locale = $state<Locale>('hr');
	#catalogs: Catalogs = { hr: {}, en: {} };

	/** Called once per module, before anything renders. The kit's own words go
	    at the bottom, then the words of each package the module is built on,
	    then the module's. A layer that says a word again is a bug loud enough to
	    stop the boot: a silent override is how three modules drift apart while
	    every one of them looks correct on its own. */
	register(catalogs: Catalogs, beneath: Catalogs[] = []) {
		for (const locale of ['hr', 'en'] as Locale[]) {
			const merged: Record<string, string> = { ...WORDS[locale] };
			for (const layer of [...beneath, catalogs]) {
				const said = Object.keys(layer[locale]).filter((k) => k in merged);
				if (said.length) {
					throw new Error(
						`i18n: ${said.join(', ')} is already said beneath — a module must not say it again`
					);
				}
				Object.assign(merged, layer[locale]);
			}
			this.#catalogs[locale] = merged;
		}
	}

	get catalogs(): Catalogs {
		return this.#catalogs;
	}

	init() {
		const stored = recall(STORAGE_KEY);
		if (stored === 'hr' || stored === 'en') this.locale = stored;
		this.#applyLang();
	}

	set(locale: Locale) {
		this.locale = locale;
		keep(STORAGE_KEY, locale);
		this.#applyLang();
	}

	#applyLang() {
		document.documentElement.lang = this.locale;
	}
}

export const i18n = new I18n();

// Reads i18n.locale ($state), so every template calling t() re-renders on switch.
export function t(key: string, params?: Record<string, string | number>): string {
	const catalogs = i18n.catalogs;
	let s: string = catalogs[i18n.locale][key] ?? catalogs.hr[key] ?? key;
	if (params) {
		for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v));
	}
	return s;
}

/** Croatian counts in three: one file, two files, five files. English counts in
    two. A number and three keys, so a module never writes the rule out again.
    The number arrives written the way the reader writes numbers — the form is
    chosen from the count, and the count is not what is printed. */
export function plural(n: number, one: string, few: string, many: string): string {
	const mod10 = n % 10;
	const mod100 = n % 100;
	const key =
		i18n.locale === 'en'
			? n === 1
				? one
				: many
			: mod10 === 1 && mod100 !== 11
				? one
				: mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
					? few
					: many;
	return t(key, { n: formatNumber(n) });
}

/** A module hands its two catalogues over once, before anything renders, with
    the catalogues of any package it is built on, and gets back a `t` narrowed
    to its own keys and the kit's. English has to carry exactly the keys
    Croatian does, so a word written in one language only is a build error
    rather than a gap on screen. */
export function registerModule<K extends string>(
	catalogs: {
		hr: Record<K, string>;
		en: Record<K, string>;
	},
	beneath: Catalogs[] = []
) {
	i18n.register(catalogs, beneath);
	return t as (key: K | Word, params?: Record<string, string | number>) => string;
}

export function formatNumber(n: number, opts?: Intl.NumberFormatOptions): string {
	if (!isFinite(n)) return '—';
	return new Intl.NumberFormat(INTL_LOCALES[i18n.locale], opts).format(n);
}

/** A moment, in the reader's language rather than the server's. Every module
    shows times from a database that keeps them in UTC; none of them should be
    deciding on its own how a date reads. */
export function formatDateTime(iso: string): string {
	return new Date(iso).toLocaleString(INTL_LOCALES[i18n.locale]);
}

/** A time of day as a clock on the wall shows it: hours and minutes. */
export function formatTime(when: Date): string {
	return when.toLocaleTimeString(INTL_LOCALES[i18n.locale], { hour: '2-digit', minute: '2-digit' });
}

/** A size in the unit a person would have said it in. Every module shows bytes
    from somewhere — a file, a disk, a download — and none of them should be
    deciding on its own where the decimal point goes. */
export function formatBytes(bytes: number): string {
	const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'];
	let n = Math.max(bytes, 0);
	let unit = 0;
	while (n >= 1024 && unit < units.length - 1) {
		n /= 1024;
		unit++;
	}
	const digits = unit < 2 || n >= 100 ? 0 : 1;
	return `${formatNumber(n, { maximumFractionDigits: digits })} ${units[unit]}`;
}

/** How long something runs, written the way a listener reads it: minutes and
    seconds, and hours only when there are any.

    It was written seven times across the two modules — in the player, in the
    sleeve, in the bar, in the film's overlay, in the library's track list — and
    three of those copies had no hours in them, so a long track came out as
    "74:12". A time is written one way in this product, and this is where that
    is decided. Nothing at all is returned when there is no length to state: a
    song the catalogue never measured says so by saying nothing, rather than by
    claiming to last no time. */
export function duration(seconds: number | null | undefined): string {
	if (seconds === null || seconds === undefined) return '';
	if (!isFinite(seconds)) return '0:00';
	const whole = Math.max(0, Math.floor(seconds));
	const h = Math.floor(whole / 3600);
	const m = Math.floor((whole % 3600) / 60);
	const s = whole % 60;
	return h
		? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
		: `${m}:${String(s).padStart(2, '0')}`;
}

/** How long a film runs, the way a listing says it: hours and minutes, and
    nothing at all for a film nobody measured. */
export function formatRuntime(minutes: number | null | undefined): string {
	if (!minutes) return '';
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return [h ? t('runtime.hours', { h: formatNumber(h) }) : '', m ? t('runtime.minutes', { m: formatNumber(m) }) : '']
		.filter(Boolean)
		.join(' ');
}

/** A day, without the hour nobody asked about: an air date, a release, a due
    date. Same rule as above — the reader's language, not the server's. A
    catalogue that knows only the year of something says only the year. */
export function formatDate(iso: string): string {
	if (/^\d{4}$/.test(iso)) return iso;
	return new Date(iso).toLocaleDateString(INTL_LOCALES[i18n.locale]);
}
