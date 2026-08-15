<script lang="ts">
	// A raised surface with a border: what every panel in the product sits on.
	// Each module had its own — same colour, same border, four different radii
	// and paddings — which is the kind of drift a shared package exists to stop.

	import type { Snippet } from 'svelte';

	let {
		title,
		heading,
		actions,
		collapsible = false,
		open = false,
		children
	}: {
		/** the panel's heading, when a line of text is all it is */
		title?: string;
		/** the heading when it is more than that — a name over a row of tags */
		heading?: Snippet;
		/** whatever belongs opposite it: a status, a control */
		actions?: Snippet;
		/** the card folds, and its heading is what unfolds it */
		collapsible?: boolean;
		open?: boolean;
		children: Snippet;
	} = $props();

	// the prop is where it starts, not where it stays: after the first click the
	// card is showing what the person chose, not what the caller suggested
	let shown = $state(false);
	$effect(() => {
		shown = open;
	});
</script>

<section class="card">
	{#if title || heading || actions}
		<header class:folded={collapsible && !shown}>
			{#if collapsible}
				<button type="button" class="toggle" aria-expanded={shown}
					onclick={() => (shown = !shown)}>
					<span class="caret" class:down={shown}>›</span>
					{#if heading}{@render heading()}{:else}<h2>{title}</h2>{/if}
				</button>
			{:else if heading}
				{@render heading()}
			{:else}
				<h2>{title}</h2>
			{/if}
			{@render actions?.()}
		</header>
	{/if}
	{#if !collapsible || shown}
		{@render children()}
	{/if}
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
	header.folded {
		padding-bottom: 0;
		border-bottom: none;
	}
	.toggle {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex: 1;
		min-width: 0;
		padding: 0;
		border: none;
		background: none;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}
	.caret {
		display: inline-block;
		color: var(--muted);
		font-size: 1.1rem;
		line-height: 1;
		transition: transform 0.12s ease;
	}
	.caret.down {
		transform: rotate(90deg);
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
