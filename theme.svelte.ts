export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'opus.theme';
const ORDER: Theme[] = ['light', 'dark', 'system'];

function readStored(): Theme {
	const v = localStorage.getItem(STORAGE_KEY);
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
}

class ThemeStore {
	theme = $state<Theme>('dark');
	#mqBound = false;

	setTheme(t: Theme) {
		this.theme = t;
		localStorage.setItem(STORAGE_KEY, t);
		applyToDom(isDark(t));
	}

	cycle() {
		this.setTheme(ORDER[(ORDER.indexOf(this.theme) + 1) % ORDER.length]);
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
