// Whether this tab still runs the build the server serves. A deployed build
// never reaches an open tab by itself: the tab keeps the code it loaded, so a
// window left open — a wall panel, a live grid — would run the old one until
// someone reloads it, and would break on the first lazy chunk the deploy
// removed. The watcher says a newer build is there, reloads a tab nobody is
// using, and after a reload says what the tab now runs.

import { t } from './i18n.svelte';
import { recall, keep } from './stored';
import { toasts } from './toasts.svelte';

const SEEN = 'kit.version.seen';
const POLL_MS = 120_000;
const QUIET_MS = 300_000;

/** What a product's /version says about the build it serves. */
export type Revision = {
	version: string;
	sha?: string;
	branch?: string;
	committed_at?: string | null;
	dirty?: boolean;
};

export type Surroundings = {
	reload: () => void;
	/** Nobody would lose anything to a reload now. */
	idle: () => boolean;
};

export class VersionWatch<R extends { version: string }> {
	/** The build this tab runs, as the server described it when the tab loaded. */
	booted = $state<R | null>(null);
	/** The build the server serves now, once it is not the one this tab runs. */
	available = $state<string | null>(null);

	#source: () => Promise<R | null>;
	#around: Surroundings | null;

	constructor(source: () => Promise<R | null>, around: Surroundings | null = null) {
		this.#source = source;
		this.#around = around;
	}

	get label(): string {
		return this.booted?.version ?? '';
	}

	async #ask(): Promise<R | null> {
		try {
			return await this.#source();
		} catch {
			return null;
		}
	}

	/** The first answer is this tab's build. A browser that last ran another
	 *  one is told what it runs now. */
	async boot(): Promise<void> {
		if (this.booted) return;
		const rev = await this.#ask();
		if (!rev?.version) return;
		this.booted = rev;
		const seen = recall(SEEN);
		keep(SEEN, rev.version);
		if (seen && seen !== rev.version) {
			toasts.show('info', t('version.installed', { version: rev.version }), 8000);
		}
	}

	async check(): Promise<void> {
		if (!this.booted) {
			await this.boot();
			return;
		}
		const rev = await this.#ask();
		if (rev?.version && rev.version !== this.booted.version) this.available = rev.version;
		this.#reloadIfIdle();
	}

	reload(): void {
		this.#surroundings().reload();
	}

	/** Boot, then ask every two minutes and whenever the tab is looked at again.
	 *  Lives as long as the tab, so there is nothing to stop. */
	watch(everyMs = POLL_MS): void {
		if (typeof window === 'undefined') return;
		void this.boot();
		setInterval(() => void this.check(), everyMs);
		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'visible') void this.check();
			else this.#reloadIfIdle();
		});
	}

	#reloadIfIdle(): void {
		if (this.available && this.#surroundings().idle()) this.reload();
	}

	#surroundings(): Surroundings {
		this.#around ??= browser();
		return this.#around;
	}
}

function browser(): Surroundings {
	let touched = Date.now();
	for (const kind of ['pointerdown', 'keydown', 'wheel', 'touchstart']) {
		window.addEventListener(kind, () => (touched = Date.now()), { capture: true, passive: true });
	}
	const busy = () =>
		[...document.querySelectorAll<HTMLMediaElement>('video, audio')].some((m) => !m.paused) ||
		document.querySelector('[role="dialog"], [role="alertdialog"]') !== null ||
		document.activeElement?.matches('input, textarea, select, [contenteditable="true"]') === true;
	return {
		reload: () => window.location.reload(),
		idle: () =>
			!busy() && (document.visibilityState === 'hidden' || Date.now() - touched >= QUIET_MS)
	};
}
