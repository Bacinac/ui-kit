<script lang="ts">
	// How far along something is: a download, a scan, an upload. One bar, drawn
	// at one height in one colour, with the share said the way the reader writes
	// numbers — where it had been six bars with three heights and three ways of
	// printing a percentage.

	import { formatNumber } from './i18n.svelte';

	let {
		value,
		share = false,
		inline = false,
		tone = 'accent'
	}: {
		/** from 0 to 1 */
		value: number;
		/** say the percentage beside the bar */
		share?: boolean;
		/** a short bar inside a line of text rather than one across its container */
		inline?: boolean;
		tone?: 'accent' | 'warn' | 'danger';
	} = $props();

	let clamped = $derived(Math.min(1, Math.max(0, value || 0)));
</script>

<span class="progress" class:inline>
	<span
		class="track"
		role="progressbar"
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={Math.round(clamped * 100)}
	>
		<span class="fill {tone}" style:width="{clamped * 100}%"></span>
	</span>
	{#if share}
		<span class="share">{formatNumber(clamped * 100, { maximumFractionDigits: 0 })} %</span>
	{/if}
</span>

<style>
	.progress {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
	}
	.progress.inline {
		display: inline-flex;
		width: auto;
		vertical-align: middle;
	}
	.track {
		flex: 1;
		height: 0.45rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--muted) 22%, transparent);
		overflow: hidden;
	}
	.inline .track {
		flex: none;
		width: 6rem;
	}
	.fill {
		display: block;
		height: 100%;
		border-radius: 999px;
		transition: width 0.4s ease;
	}
	.accent {
		background: var(--accent);
	}
	.warn {
		background: var(--warn);
	}
	.danger {
		background: var(--danger);
	}
	.share {
		font-size: 0.85em;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
</style>
