<script lang="ts">
	// How full something is. A disk, a quota, a share of anything against a
	// ceiling — the bar, the pair of numbers and the point at which the colour
	// stops being reassuring are the same wherever it is shown, so they are here
	// rather than drawn again in each module that owns a number.

	import { formatBytes, formatNumber } from './i18n.svelte';
	import Progress from './Progress.svelte';

	let {
		label,
		used,
		total,
		note = '',
		/** bytes unless told otherwise; anything else is shown as plain counts */
		bytes = true
	}: {
		label: string;
		used: number;
		total: number;
		note?: string;
		bytes?: boolean;
	} = $props();

	let share = $derived(total > 0 ? Math.min(used / total, 1) : 0);
	const show = (n: number) => (bytes ? formatBytes(n) : formatNumber(n));
</script>

<div class="meter">
	<div class="line">
		<span class="label">{label}</span>
		<span class="value">
			{show(used)} / {show(total)}
			<span class="share">{formatNumber(share * 100, { maximumFractionDigits: 0 })} %</span>
		</span>
	</div>
	<!-- a disk is not a problem until it nearly is, and then it is only a problem
	     if somebody notices — so the colour changes before the room runs out -->
	<Progress value={share} tone={share >= 0.92 ? 'danger' : share >= 0.8 ? 'warn' : 'accent'} />
	{#if note}<p class="note">{note}</p>{/if}
</div>

<style>
	.meter {
		display: grid;
		gap: 0.35rem;
	}
	.line {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}
	.label {
		font-weight: 600;
	}
	.value {
		font-size: 0.9em;
		color: var(--muted);
		white-space: nowrap;
	}
	.share {
		margin-left: 0.4rem;
		font-variant-numeric: tabular-nums;
	}
	.note {
		margin: 0;
		font-size: 0.85em;
		color: var(--muted);
	}
</style>
