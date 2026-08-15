<script lang="ts">
	// A raised surface with a border: what every panel in the product sits on.
	// Each module had its own — same colour, same border, four different radii
	// and paddings — which is the kind of drift a shared package exists to stop.

	import type { Snippet } from 'svelte';

	let {
		title,
		heading,
		actions,
		children
	}: {
		/** the panel's heading, when a line of text is all it is */
		title?: string;
		/** the heading when it is more than that — a name over a row of tags */
		heading?: Snippet;
		/** whatever belongs opposite it: a status, a control */
		actions?: Snippet;
		children: Snippet;
	} = $props();
</script>

<section class="card">
	{#if title || heading || actions}
		<header>
			{#if heading}{@render heading()}{:else}<h2>{title}</h2>{/if}
			{@render actions?.()}
		</header>
	{/if}
	{@render children()}
</section>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.2rem 1.35rem 1.35rem;
	}
	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border);
	}
	h2 {
		margin: 0;
		font-size: 1.1rem;
	}
</style>
