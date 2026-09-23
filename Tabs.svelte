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
	}
	button {
		/* one width for all of them: a strip of tabs is a set of equals, and
		   letting each take the width of its own word makes the set look
		   accidental */
		flex: 1 1 0;
		min-width: 0;
		padding: 0.45rem 0.9rem;
		border-radius: 8px 8px 0 0;
		border: 1px solid var(--border);
		border-bottom: none;
		background: var(--surface);
		color: var(--muted);
		font: inherit;
		font-size: var(--fs-m);
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
		margin-left: 0.3rem;
		padding: 0 0.3rem;
		border-radius: 999px;
		border: 1px solid currentColor;
		font-size: var(--fs-2xs);
		font-weight: 700;
		letter-spacing: 0.03em;
		vertical-align: 0.1em;
	}
	.badge.ok {
		color: var(--ok);
	}
	.badge.warn {
		color: var(--warn);
	}
</style>
