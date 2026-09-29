// The one way a page asks its backend. A refusal is said as a toast carrying the
// backend's own detail, a server that does not answer is said as well, and the
// caller is handed the parsed body — or null, so a success path is a truthiness
// check and never has to read the response twice. `send` and `refusal` are the
// transport under it, for a product whose client throws instead.

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
	 *  instead of the toast. It is handed the sentence the toast would have said;
	 *  status 0 is a server that did not answer. */
	failed?: (detail: string, status: number) => void;
};

/** A request that did not do what was asked. The message is the one a reader is
 *  shown; `detail` is the backend's own sentence, empty when it gave none, and
 *  status 0 is a server that did not answer. */
export class ApiError extends Error {
	constructor(
		readonly status: number,
		message: string,
		readonly detail = ''
	) {
		super(message);
	}
}

export type Sending = RequestInit & { deadlineMs?: number };

// A request nobody answers must end, or its spinner never does. Above the longest
// operation a backend bounds itself, so the deadline cuts a hung connection, never
// a slow answer.
const DEADLINE_MS = 180_000;
/** A whole file moving runs as long as the data does: the deadline covers
 *  reading the body too. */
export const TRANSFER_MS = 30 * 60_000;

function lost(why: unknown): ApiError {
	const late = why instanceof DOMException && why.name === 'TimeoutError';
	return new ApiError(0, t(late ? 'common.timeout' : 'common.unreachable'));
}

/** The transport under every call: a deadline, and a server that did not answer
 *  told apart from one that is slow. The caller's own abort passes untouched. */
export async function send(url: string, init: Sending = {}): Promise<Response> {
	const { deadlineMs = DEADLINE_MS, ...rest } = init;
	const deadline = AbortSignal.timeout(deadlineMs);
	const signal = rest.signal ? AbortSignal.any([rest.signal, deadline]) : deadline;
	try {
		return await fetch(url, { ...rest, signal });
	} catch (why) {
		if (rest.signal?.aborted) throw why;
		throw lost(deadline.aborted ? deadline.reason : why);
	}
}

let unauthorized: (() => void) | null = null;

/** What the module does when its session is gone: show the door again. Set once
 *  by the layout, so a page never has to know that a 401 means that. */
export function onUnauthorized(then: () => void) {
	unauthorized = then;
}

function detailOf(body: Record<string, unknown>): string {
	const detail = body.detail;
	if (typeof detail === 'string') return detail;
	// a malformed request is answered with a list of objects, and String() of
	// that is "[object Object]"
	if (Array.isArray(detail)) {
		return detail
			.map((d) => (d as { msg?: string })?.msg)
			.filter(Boolean)
			.join('; ');
	}
	return '';
}

function refusedWith(body: Record<string, unknown>, status: number): ApiError {
	const detail = detailOf(body);
	return new ApiError(status, detail || t('common.failed', { status }), detail);
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

/** Why the backend refused, read from its answer. */
export async function refusal(resp: Response): Promise<ApiError> {
	return refusedWith((await bodyOf(resp).catch(() => null)) ?? {}, resp.status);
}

function refused(asking: Asking, error: ApiError): null {
	if (asking.failed) asking.failed(error.message, error.status);
	else toasts.error(error.message);
	return null;
}

async function asked<T>(
	url: string,
	init: Sending,
	asking: Asking,
	read: (resp: Response) => Promise<T | null>
): Promise<T | null> {
	const latest = asking.latest?.next();
	const signal = latest ?? init.signal ?? undefined;
	const gone = () => Boolean(latest?.aborted || init.signal?.aborted);
	let resp: Response;
	try {
		resp = await send(url, latest ? { ...init, signal } : init);
	} catch (why) {
		if (gone()) return never();
		console.error(`${init.method ?? 'GET'} ${url}:`, why);
		return refused(asking, why instanceof ApiError ? why : lost(why));
	}
	if (gone()) return never();
	if (resp.ok) {
		let said: T | null;
		try {
			said = await read(resp);
		} catch (why) {
			if (gone()) return never();
			console.error(`${init.method ?? 'GET'} ${url}:`, why);
			return refused(asking, lost(why));
		}
		if (gone()) return never();
		if (said === null) {
			console.error(`${init.method ?? 'GET'} ${url}: the answer is not what was asked for`);
			return refused(asking, refusedWith({}, resp.status));
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
	const error = refusedWith(body, resp.status);
	if (resp.status === 401 && unauthorized) {
		unauthorized();
		asking.failed?.(error.message, error.status);
		return null;
	}
	return refused(asking, error);
}

export async function request<T = unknown>(
	url: string,
	init: Sending = {},
	asking: Asking = {}
): Promise<T | null> {
	return asked(url, init, asking, async (resp) => (await bodyOf(resp)) as T | null);
}

/** A file rather than words — a sealed picture, a download to be opened on the
 *  page — failing exactly as `request` does. */
export async function bytes(
	url: string,
	init: Sending = {},
	asking: Asking = {}
): Promise<ArrayBuffer | null> {
	return asked(url, init, asking, (resp) => resp.arrayBuffer());
}

/** The body of a JSON request, for the init argument. */
export function json(body: unknown, method = 'POST'): RequestInit {
	return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}
