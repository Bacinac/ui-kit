<script lang="ts">
	// A "?" beside a control: one line on what it does, and when there is more
	// to say, the way into the article that says it. The line comes from the
	// product's words, so this is only the mechanism, never a second copy of them.

	import { t } from './i18n.svelte';

	let { text, article }: { text: string; article?: string } = $props();

	let open = $state(false);
	let root = $state<HTMLElement>();
	let pop = $state<HTMLElement>();
	// centred under its "?", unless that would put it past an edge of the window
	let shift = $state(0);
	$effect(() => {
		if (!open || !pop) return void (shift = 0);
		const r = pop.getBoundingClientRect();
		const room = 8;
		shift = r.right > innerWidth - room ? innerWidth - room - r.right : r.left < room ? room - r.left : 0;
	});

	function away(e: MouseEvent) {
		if (open && !root?.contains(e.target as Node)) open = false;
	}
</script>

<svelte:window onclick={away} onkeydown={(e) => e.key === 'Escape' && (open = false)} />

<span class="hint" bind:this={root}>
	<button type="button" aria-label={t('help.title')} aria-expanded={open} onclick={() => (open = !open)}
		>?</button
	>
	{#if open}
		<span class="pop" role="note" bind:this={pop} style:translate="{shift}px 0">
			{text}
			{#if article}<a href="/help/{article}">{t('help.more')} →</a>{/if}
		</span>
	{/if}
</span>

<style>
	.hint {
		position: relative;
		display: inline-block;
		vertical-align: middle;
	}
	button {
		display: grid;
		place-items: center;
		width: 1rem;
		height: 1rem;
		padding: 0;
		border: 1px solid var(--border);
		border-radius: 50%;
		background: none;
		color: var(--muted);
		font: inherit;
		font-size: var(--fs-2xs);
		line-height: 1;
		cursor: pointer;
	}
	button:hover,
	button[aria-expanded='true'] {
		border-color: var(--accent);
		color: var(--accent);
	}
	.pop {
		position: absolute;
		top: 1.5rem;
		left: 50%;
		z-index: 20;
		display: grid;
		gap: 0.5rem;
		width: 16rem;
		padding: 0.75rem;
		transform: translateX(-50%);
		border: 1px solid var(--border);
		border-radius: var(--radius-s);
		background: var(--surface-2);
		box-shadow: var(--shadow-m);
		color: var(--text);
		font-size: var(--fs-s);
		font-weight: 400;
		line-height: 1.5;
		text-align: left;
		text-transform: none;
		letter-spacing: normal;
	}
	a {
		color: var(--accent);
	}
</style>
