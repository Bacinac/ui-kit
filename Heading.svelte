<script lang="ts">
	// What every block on every screen is introduced by: a mark, a word, and a
	// line running out to the edge. One of these rather than each page inventing
	// its own heading — that is what made the screens look like different
	// applications, and the line is what gives a page of posters any structure
	// at all once the boxes around things are gone.

	import { formatNumber } from './i18n.svelte';

	let { label, count }: { label: string; count?: number | string } = $props();
</script>

<h2>
	<span class="cap" aria-hidden="true"></span>
	<span class="what">{label}</span>
	{#if count !== undefined}<span class="count"
			>{typeof count === 'number' ? formatNumber(count) : count}</span
		>{/if}
	<span class="rule" aria-hidden="true"></span>
</h2>

<style>
	h2 {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		margin: 0 0 var(--heading-gap, 0.8rem);
		font-size: var(--fs-s);
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.cap {
		width: 3px;
		height: 0.95em;
		border-radius: 2px;
		background: var(--accent);
	}
	.count {
		letter-spacing: normal;
		opacity: 0.7;
	}
	.rule {
		flex: 1;
		height: 1px;
		background: linear-gradient(
			to right,
			color-mix(in srgb, var(--border) 90%, transparent),
			transparent
		);
	}
</style>
