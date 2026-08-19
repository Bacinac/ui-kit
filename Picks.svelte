<script lang="ts" module>
	export type Pick = {
		key: string;
		label: string;
		/** a fact about the thing behind the pill — how many, how long, what year */
		note?: string;
	};
</script>

<script lang="ts">
	// A small set, chosen among: one of them, or as many as you like. Pills
	// rather than checkboxes because the same row has to work under a mouse and
	// under a D-pad, where a tick box the size of a word is a target and a tick
	// box the size of a tick is not.
	//
	// Choosing all of a set is a choice of its own, so `all` gives it one press
	// instead of asking for eight.

	let {
		picks,
		chosen = $bindable(),
		many = false,
		all = ''
	}: {
		picks: Pick[];
		/** the keys chosen, in the order they were chosen */
		chosen: string[];
		many?: boolean;
		/** the label of the take-everything pill; absent means no such pill */
		all?: string;
	} = $props();

	let every = $derived(picks.length > 0 && chosen.length === picks.length);

	function press(key: string) {
		if (!many) {
			chosen = [key];
			return;
		}
		chosen = chosen.includes(key) ? chosen.filter((k) => k !== key) : [...chosen, key];
	}
</script>

<div class="picks">
	{#if many && all}
		<button
			type="button"
			class="pick"
			class:on={every}
			onclick={() => (chosen = every ? [] : picks.map((p) => p.key))}
		>
			{all}
		</button>
	{/if}
	{#each picks as pick (pick.key)}
		<button
			type="button"
			class="pick"
			class:on={chosen.includes(pick.key)}
			aria-pressed={many ? chosen.includes(pick.key) : undefined}
			onclick={() => press(pick.key)}
		>
			{pick.label}{#if pick.note}<span class="note">{pick.note}</span>{/if}
		</button>
	{/each}
</div>

<style>
	.picks {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.pick {
		display: inline-flex;
		align-items: baseline;
		gap: 0.4rem;
		padding: 0.35rem 0.9rem;
		border-radius: var(--radius-pill);
		border: 1px solid var(--border);
		background: transparent;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}
	.pick:hover {
		border-color: var(--accent);
	}
	.pick.on {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--bg);
	}
	.note {
		font-size: 0.82em;
		opacity: 0.7;
	}
</style>
