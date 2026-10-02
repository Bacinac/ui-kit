<script lang="ts">
	// What a page offers to do, said once: the frame draws it at the right of its
	// top bar, the same size and spacing on every page, and on a phone behind one
	// button. A surface the frame does not stand around — a television, a wall —
	// keeps it where the page put it.
	import type { Snippet } from 'svelte';
	import { actions } from './actions.svelte';
	let { children }: { children: Snippet } = $props();
	// The next page may say its actions before this one is gone, so this page
	// takes back only what is still its own.
	$effect(() => {
		actions.current = children;
		return () => {
			if (actions.current === children) actions.current = null;
		};
	});
</script>

{#if !actions.hosts}<div class="actions">{@render children()}</div>{/if}

<style>
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
		justify-content: flex-end;
	}
</style>
