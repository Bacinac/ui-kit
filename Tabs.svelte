<script lang="ts" module>
	export type Tab = {
		key: string;
		label: string;
		warn?: boolean;
		/** a standing fact about the thing behind the tab, not a state of the
		 * tab: what it runs through, what it is. Shown whether or not it is the
		 * tab in front. */
		badge?: { text: string; tone?: 'ok' | 'warn' };
	};
</script>

<script lang="ts">
	// One strip of tabs. `warn` marks a tab whose thing needs attention — the
	// dot is the package's, so a module does not invent its own each time.

	let {
		tabs,
		active,
		onpick
	}: {
		tabs: Tab[];
		active: string | null;
		onpick: (key: string) => void;
	} = $props();
</script>

<nav class="tabs">
	{#each tabs as tab (tab.key)}
		<button type="button" class:active={active === tab.key} onclick={() => onpick(tab.key)}>
			{tab.label}
			{#if tab.badge}
				<span class="badge {tab.badge.tone ?? 'ok'}">{tab.badge.text}</span>
			{/if}
			{#if tab.warn}<span class="warn">•</span>{/if}
		</button>
	{/each}
</nav>

<style>
	.tabs {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
	}
	button {
		padding: 0.45rem 1.1rem;
		border-radius: 8px 8px 0 0;
		border: 1px solid var(--border);
		border-bottom: none;
		background: var(--surface);
		color: var(--muted);
		font: inherit;
		font-size: 0.92rem;
		cursor: pointer;
	}
	button.active {
		color: var(--text);
		border-color: var(--accent);
	}
	.warn {
		color: var(--warn);
	}
	.badge {
		margin-left: 0.45rem;
		padding: 0.05rem 0.4rem;
		border-radius: 999px;
		border: 1px solid currentColor;
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		vertical-align: 0.05em;
	}
	.badge.ok {
		color: var(--ok);
	}
	.badge.warn {
		color: var(--warn);
	}
</style>
