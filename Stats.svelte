<script lang="ts" module>
	/** one number the page opens with, and what it counts. `href` is where the
	 * things it counted can be seen: a number that names a set the person can
	 * be shown is a way in, and one that names nothing they could look at is
	 * just a number. */
	export type Stat = {
		label: string;
		value: number | string;
		tone?: 'ok' | 'warn';
		href?: string;
	};
</script>

<script lang="ts">
	// The row of totals a library page opens with. Every media type counts
	// different things — artists and albums, films, series and episodes — but
	// they are read the same way, so the row is the package's and only the
	// numbers are the page's.

	import { formatNumber } from './i18n.svelte';

	let { stats }: { stats: Stat[] } = $props();
</script>

<div class="stats">
	{#each stats as stat (stat.label)}
		{#if stat.href}
			<a class="tile {stat.tone ?? ''}" href={stat.href}>
				<b>{typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}</b>
				<span>{stat.label}</span>
			</a>
		{:else}
			<div class="tile {stat.tone ?? ''}">
				<b>{typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}</b>
				<span>{stat.label}</span>
			</div>
		{/if}
	{/each}
</div>

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
		gap: 0.75rem;
	}
	.tile {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 0.8rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.tile b {
		font-size: var(--fs-2xl);
		font-variant-numeric: tabular-nums;
	}
	.tile span {
		font-size: var(--fs-s);
		color: var(--muted);
	}
	.tile.ok b {
		color: var(--ok);
	}
	.tile.warn b {
		color: var(--warn);
	}
	a.tile {
		color: inherit;
		text-decoration: none;
	}
	a.tile:hover,
	a.tile:focus-visible {
		border-color: var(--accent);
	}
</style>
