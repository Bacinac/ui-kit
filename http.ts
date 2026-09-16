// The one way a page asks its backend. A refusal is said as a toast carrying the
// backend's own detail, a server that does not answer is said as well, and the
// caller is handed the parsed body — or null, so a success path is a truthiness
// check and never has to read the response twice.

import { t } from './i18n.svelte';
import { toasts } from './toasts.svelte';

/** A call site whose earlier answers are worthless the moment it asks again: a
 *  page switching between artists, a search box typed into. */
export class Latest {
	#pending: AbortController | null = null;

	next(): AbortSignal {
		this.#pending?.abort();
		this.#pending = new AbortController();
		return this.#pending.signal;
	}
}

export type Asking = {
	/** statuses that are an answer rather than a failure — a scan already
	 *  running, a title already on the shelf. The handler is given the body and
	 *  the call still returns null, because it did not do what was asked. */
	on?: Record<number, (body: Record<string, unknown>) => void>;
	latest?: Latest;
	/** a failure the page says itself — beside what failed, or by asking again —
	 *  instead of the toast. Status 0 is a server that did not answer. */
	failed?: (detail: string, status: number) => void;
};

let unauthorized: (() => void) | null = null;

/** What the module does when its session is gone: show the door again. Set once
 *  by the layout, so a page never has to know that a 401 means that. */
export function onUnauthorized(then: () => void) {
	unauthorized = then;
}

function detailOf(body: Record<string, unknown>, status: number): string {
	const detail = body.detail;
	if (typeof detail === 'string') return detail;
	// a malformed request is answered with a list of objects, and String() of
	// that is "[object Object]"
	if (Array.isArray(detail)) {
		const said = detail
			.map((d) => (d as { msg?: string })?.msg)
			.filter(Boolean)
			.join('; ');
		if (said) return said;
	}
	return String(status);
}

async function bodyOf(resp: Response): Promise<Record<string, unknown> | null> {
	const text = await resp.text();
	if (!text) return {};
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}

// A superseded question is never answered: the promise stays pending and the
// caller's code after the await simply does not run, so no page needs a token
// of its own to keep a late answer off the screen.
const never = <T>() => new Promise<T>(() => {});

function refused(asking: Asking, detail: string, status: number): null {
	if (asking.failed) asking.failed(detail, status);
	else toasts.error(status ? t('common.requestFailed', { detail }) : detail);
	return null;
}

async function asked<T>(
	url: string,
	init: RequestInit,
	asking: Asking,
	read: (resp: Response) => Promise<T | null>
): Promise<T | null> {
	const latest = asking.latest?.next();
	const signal = latest ?? init.signal ?? undefined;
	const gone = () => Boolean(latest?.aborted || init.signal?.aborted);
	let resp: Response;
	try {
		resp = await fetch(url, latest ? { ...init, signal } : init);
	} catch (why) {
		if (gone()) return never();
		console.error(`${init.method ?? 'GET'} ${url}:`, why);
		return refused(asking, t('common.unreachable'), 0);
	}
	if (gone()) return never();
	if (resp.ok) {
		let said: T | null;
		try {
			said = await read(resp);
		} catch (why) {
			if (gone()) return never();
			console.error(`${init.method ?? 'GET'} ${url}:`, why);
			return refused(asking, t('common.unreachable'), 0);
		}
		if (gone()) return never();
		if (said === null) {
			console.error(`${init.method ?? 'GET'} ${url}: the answer is not what was asked for`);
			return refused(asking, String(resp.status), resp.status);
		}
		return said;
	}
	const body = (await bodyOf(resp).catch(() => null)) ?? {};
	if (gone()) return never();
	const handle = asking.on?.[resp.status];
	if (handle) {
		handle(body);
		return null;
	}
	if (resp.status === 401 && unauthorized) {
		unauthorized();
		asking.failed?.(detailOf(body, resp.status), resp.status);
		return null;
	}
	return refused(asking, detailOf(body, resp.status), resp.status);
}

export async function request<T = unknown>(
	url: string,
	init: RequestInit = {},
	asking: Asking = {}
): Promise<T | null> {
	return asked(url, init, asking, async (resp) => (await bodyOf(resp)) as T | null);
}

/** A file rather than words — a sealed picture, a download to be opened on the
 *  page — failing exactly as `request` does. */
export async function bytes(
	url: string,
	init: RequestInit = {},
	asking: Asking = {}
): Promise<ArrayBuffer | null> {
	return asked(url, init, asking, (resp) => resp.arrayBuffer());
}

/** The body of a JSON request, for the init argument. */
export function json(body: unknown, method = 'POST'): RequestInit {
	return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}
