// The catalogue answers in the language the reader chose for the frame. It
// travels as a query parameter rather than a header because a module may
// forward it to another, and a parameter survives that hop without either side
// having to agree about anything else.

import { i18n } from './i18n.svelte';

export function withLang(url: string): string {
	return `${url}${url.includes('?') ? '&' : '?'}lang=${i18n.locale}`;
}
