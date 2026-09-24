import { keep, recall } from './stored';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

function readStored(): Theme {
	const v = recall(STORAGE_KEY);
	return v === 'light' || v === 'dark' || v === 'system' ? v : 'dark';
}

function systemPrefersDark(): boolean {
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function isDark(theme: Theme): boolean {
	return theme === 'dark' || (theme === 'system' && systemPrefersDark());
}

function applyToDom(dark: boolean) {
	document.documentElement.classList.toggle('dark', dark);
	// installed, the window has no address bar and the system paints its bars from
	// this tag — it has to follow the theme the app renders, not the one the OS
	// prefers. Read back from the token so the ground is defined in one file.
	const meta = document.querySelector('meta[name="theme-color"]');
	if (meta) {
		const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
		if (bg) meta.setAttribute('content', bg);
	}
}

class ThemeStore {
	theme = $state<Theme>('dark');
	#mqBound = false;

	setTheme(t: Theme) {
		this.theme = t;
		keep(STORAGE_KEY, t);
		applyToDom(isDark(t));
	}

	sync() {
		this.theme = readStored();
		applyToDom(isDark(this.theme));
		if (!this.#mqBound) {
			this.#mqBound = true;
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
				if (this.theme === 'system') applyToDom(systemPrefersDark());
			});
		}
	}
}

export const theme = new ThemeStore();
