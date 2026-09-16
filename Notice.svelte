<script lang="ts">
	// A line the page says about itself — something running, something that
	// failed, something that needs a hand — set apart from the content by a
	// coloured edge rather than by a box of its own colour, so it can be read
	// without shouting over what it is about.

	import type { Snippet } from 'svelte';

	let { tone = 'info', children }: { tone?: 'info' | 'warn' | 'err'; children: Snippet } = $props();
</script>

<div class="notice {tone}" role={tone === 'info' ? 'status' : 'alert'}>
	{@render children()}
</div>

<style>
	.notice {
		display: grid;
		gap: 0.5rem;
		margin: 0 0 1rem;
		padding: 0.7rem 1rem;
		border: 1px solid var(--border);
		border-left: 4px solid var(--accent);
		border-radius: var(--radius-s);
	}
	.notice :global(p) {
		margin: 0;
	}
	.warn {
		border-left-color: var(--warn);
	}
	.err {
		border-left-color: var(--danger);
	}
</style>
