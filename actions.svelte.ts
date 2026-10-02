import type { Snippet } from 'svelte';

/** What the page on screen offers to do. A page says it with `<PageActions>`
 *  and the frame draws it in its top bar: a row of buttons inside the page
 *  started that page's content lower than the next page's, and each page sized
 *  and spaced its row its own way. */
class Actions {
	current = $state<Snippet | null>(null);
	/** frames on screen to draw them; with none, the page draws its own */
	hosts = $state(0);
}

export const actions = new Actions();
