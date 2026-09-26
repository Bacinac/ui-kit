import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerModule } from './i18n.svelte';
import { toasts } from './toasts.svelte';
import { VersionWatch } from './version.svelte';

type Rev = { version: string; sha?: string };

function served(...answers: (Rev | Error)[]) {
	const queue = [...answers];
	return async () => {
		const next = queue.length > 1 ? queue.shift()! : queue[0];
		if (next instanceof Error) throw next;
		return next;
	};
}

function surroundings(idle = false) {
	return { reload: vi.fn(), idle: vi.fn(() => idle) };
}

let store: Map<string, string>;

beforeAll(() => {
	registerModule({ hr: {}, en: {} });
});

beforeEach(() => {
	store = new Map();
	vi.stubGlobal('localStorage', {
		getItem: (k: string) => store.get(k) ?? null,
		setItem: (k: string, v: string) => void store.set(k, v),
		removeItem: (k: string) => void store.delete(k)
	});
	toasts.toasts = [];
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('VersionWatch', () => {
	it('says nothing on a browser that never ran a build, and remembers this one', async () => {
		const w = new VersionWatch<Rev>(served({ version: '0.1.603', sha: 'a' }), surroundings());
		await w.boot();
		expect(w.label).toBe('0.1.603');
		expect(w.booted?.sha).toBe('a');
		expect(toasts.toasts).toEqual([]);
		expect(store.get('kit.version.seen')).toBe('0.1.603');
	});

	it('says which build a browser now runs when it last ran another', async () => {
		store.set('kit.version.seen', '0.1.603');
		const w = new VersionWatch<Rev>(served({ version: '0.1.604' }), surroundings());
		await w.boot();
		expect(toasts.toasts.map((t) => [t.kind, t.text])).toEqual([['info', 'Aplikacija je ažurirana na verziju 0.1.604.']]);
		expect(store.get('kit.version.seen')).toBe('0.1.604');
	});

	it('offers a newer build to a tab someone is using, without reloading it', async () => {
		const around = surroundings(false);
		const w = new VersionWatch<Rev>(served({ version: '0.1.603' }, { version: '0.1.603' }, { version: '0.1.604' }), around);
		await w.boot();
		await w.check();
		expect(w.available).toBeNull();
		await w.check();
		expect(w.available).toBe('0.1.604');
		expect(w.label).toBe('0.1.603');
		expect(around.reload).not.toHaveBeenCalled();
	});

	it('reloads a tab nobody is using once a newer build is served', async () => {
		const around = surroundings(true);
		const w = new VersionWatch<Rev>(served({ version: '0.1.603' }, { version: '0.1.603' }, { version: '0.1.604' }), around);
		await w.boot();
		await w.check();
		expect(around.reload).not.toHaveBeenCalled();
		await w.check();
		expect(around.reload).toHaveBeenCalledOnce();
	});

	it('takes a server that does not answer as no news', async () => {
		const around = surroundings(true);
		const w = new VersionWatch<Rev>(served(new Error('down'), { version: '0.1.603' }, new Error('down')), around);
		await w.boot();
		expect(w.booted).toBeNull();
		await w.check();
		expect(w.label).toBe('0.1.603');
		await w.check();
		expect(w.available).toBeNull();
		expect(around.reload).not.toHaveBeenCalled();
	});
});
