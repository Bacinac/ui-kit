/* The i18n runtime, shared; the message catalogues stay with each module.

   Splitting it that way is the point: how translation works is identical in
   Downloads, Library and Player (same two locales, same storage, same {param}
   interpolation, same Intl formatting), while WHAT is translated is entirely
   each module's own. So the machinery lives here once and every module
   registers its own hr/en catalogue on boot.

   Each module's catalogue MUST carry the shell keys below, because the header
   this package renders asks for them. A missing key renders as the key itself
   rather than throwing — a visible gap beats a blank page. */

export type Locale = 'hr' | 'en';

export const SHELL_KEYS = [
	'theme.light',
	'theme.dark',
	'theme.system',
	'lang.switch',
	'prefs.language',
	'prefs.theme',
	'login.username',
	'login.password',
	'login.submit',
	'login.working',
	'login.missing',
	'login.failed',
	'account.yours',
	'account.password',
	'account.current',
	'account.new',
	'account.repeat',
	'account.changed',
	'account.token',
	'account.tokenShow',
	'account.err.blank',
	'account.err.mismatch',
	'account.err.rejected',
	'people.title',
	'people.add',
	'people.name',
	'people.display',
	'people.password',
	'people.newPassword',
	'people.repeat',
	'people.you',
	'people.wasAdded',
	'people.owner',
	'people.makeOwner',
	'people.dropOwner',
	'people.disabled',
	'people.disable',
	'people.enable',
	'people.reset',
	'people.remove',
	'people.err.mismatch',
	'people.err.short',
	'people.err.refused',
	'people.err.blank',
	'people.err.notOwner',
	'people.err.failed',
	'common.save',
	'common.saving'
] as const;
export type ShellKey = (typeof SHELL_KEYS)[number];

const STORAGE_KEY = 'opus.locale';
const INTL_LOCALES: Record<Locale, string> = { hr: 'hr-HR', en: 'en-US' };

type Catalogs = Record<Locale, Record<string, string>>;

class I18n {
	locale = $state<Locale>('hr');
	#catalogs: Catalogs = { hr: {}, en: {} };
	#fallback: Locale = 'hr';

	/** Called once per module, before anything renders. */
	register(catalogs: Catalogs, fallback: Locale = 'hr') {
		this.#catalogs = catalogs;
		this.#fallback = fallback;
	}

	get catalogs(): Catalogs {
		return this.#catalogs;
	}

	get fallback(): Locale {
		return this.#fallback;
	}

	init() {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === 'hr' || stored === 'en') this.locale = stored;
		this.#applyLang();
	}

	set(locale: Locale) {
		this.locale = locale;
		localStorage.setItem(STORAGE_KEY, locale);
		this.#applyLang();
	}

	toggle() {
		this.set(this.locale === 'hr' ? 'en' : 'hr');
	}

	#applyLang() {
		document.documentElement.lang = this.locale;
	}
}

export const i18n = new I18n();

// Reads i18n.locale ($state), so every template calling t() re-renders on switch.
export function t(key: string, params?: Record<string, string | number>): string {
	const catalogs = i18n.catalogs;
	let s: string = catalogs[i18n.locale][key] ?? catalogs[i18n.fallback][key] ?? key;
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

/** A module narrows `t` to its own catalogue's keys, so a typo is caught at
    build time in the module rather than surfacing as a raw key at runtime. */
export function typed<K extends string>() {
	return t as (key: K, params?: Record<string, string | number>) => string;
}

export function formatNumber(n: number, opts?: Intl.NumberFormatOptions): string {
	return new Intl.NumberFormat(INTL_LOCALES[i18n.locale], opts).format(n);
}

/** A moment, in the reader's language rather than the server's. Every module
    shows times from a database that keeps them in UTC; none of them should be
    deciding on its own how a date reads. */
export function formatDateTime(iso: string): string {
	return new Date(iso).toLocaleString(INTL_LOCALES[i18n.locale]);
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

/** A day, without the hour nobody asked about: an air date, a release, a due
    date. Same rule as above — the reader's language, not the server's. */
export function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString(INTL_LOCALES[i18n.locale]);
}
