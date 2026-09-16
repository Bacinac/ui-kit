// A preference remembered in the browser. A private window, a blocked site or a
// page rendered where there is no storage at all refuses both calls by throwing,
// and a preference that cannot be remembered is still a preference for as long
// as the page is open.

export function recall(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

export function forget(key: string): void {
	try {
		localStorage.removeItem(key);
	} catch {
		return;
	}
}

export function keep(key: string, value: string): void {
	try {
		localStorage.setItem(key, value);
	} catch {
		return;
	}
}
