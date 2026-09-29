import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ApiError, refusal, request, send } from './http';
import { registerModule, t } from './i18n.svelte';
import { toasts } from './toasts.svelte';

function reply(status: number, body?: unknown): Response {
	return new Response(body === undefined ? null : JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' }
	});
}

beforeAll(() => {
	registerModule({ hr: {}, en: {} });
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('send', () => {
	it('ends an unanswered request at its deadline, saying so', async () => {
		vi.stubGlobal('fetch', (_url: string, init: RequestInit) =>
			new Promise((_, reject) =>
				init.signal!.addEventListener('abort', () => reject(init.signal!.reason))
			)
		);
		const e = await send('/api/x', { deadlineMs: 5 }).catch((e: unknown) => e);
		expect(e).toBeInstanceOf(ApiError);
		expect((e as ApiError).status).toBe(0);
		expect((e as ApiError).message).toBe(t('common.timeout'));
	});

	it('tells a connection that failed apart from a slow one', async () => {
		vi.stubGlobal('fetch', () => Promise.reject(new TypeError('Failed to fetch')));
		await expect(send('/api/x')).rejects.toThrow(t('common.unreachable'));
		expect(t('common.unreachable')).not.toBe(t('common.timeout'));
	});

	it("lets the caller's own abort through untouched", async () => {
		const mine = new AbortController();
		const why = new DOMException('left the page', 'AbortError');
		vi.stubGlobal('fetch', () => {
			mine.abort(why);
			return Promise.reject(why);
		});
		await expect(send('/api/x', { signal: mine.signal })).rejects.toBe(why);
	});
});

describe('refusal', () => {
	it("carries the backend's own sentence and status", async () => {
		const e = await refusal(reply(409, { detail: 'slug already taken' }));
		expect(e.status).toBe(409);
		expect(e.message).toBe('slug already taken');
		expect(e.detail).toBe('slug already taken');
	});

	it("joins a validation failure's messages", async () => {
		const e = await refusal(reply(422, { detail: [{ loc: ['body', 'name'], msg: 'too short' }, { msg: 'bad url' }] }));
		expect(e.message).toBe('too short; bad url');
	});

	it('says the status when the backend gave no sentence', async () => {
		const e = await refusal(new Response('<html>bad gateway</html>', { status: 502 }));
		expect(e.message).toBe(t('common.failed', { status: 502 }));
		expect(e.detail).toBe('');
	});
});

describe('request', () => {
	it('hands the page the sentence rather than a bare status', async () => {
		vi.stubGlobal('fetch', () => Promise.resolve(reply(500)));
		let said = '';
		expect(await request('/api/x', {}, { failed: (detail) => (said = detail) })).toBeNull();
		expect(said).toBe(t('common.failed', { status: 500 }));
	});

	it("toasts the backend's own sentence, or says why there is none", async () => {
		const toast = vi.spyOn(toasts, 'error');
		vi.stubGlobal('fetch', () => Promise.resolve(reply(404, { detail: 'no such album' })));
		await request('/api/x');
		expect(toast).toHaveBeenLastCalledWith('no such album');
		vi.stubGlobal('fetch', () => Promise.reject(new TypeError('Failed to fetch')));
		vi.spyOn(console, 'error').mockImplementation(() => {});
		await request('/api/x');
		expect(toast).toHaveBeenLastCalledWith(t('common.unreachable'));
	});
});
