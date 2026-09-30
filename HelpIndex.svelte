<script lang="ts">
	// Every article a product has, grouped the same way in every product: how
	// it thinks, then how to run it.

	import { i18n, t } from './i18n.svelte';
	import Heading from './Heading.svelte';
	import type { Help, HelpGroup } from './help';

	let { help }: { help: Help } = $props();

	const GROUPS: HelpGroup[] = ['concepts', 'operating'];
</script>

<div class="help">
	{#each GROUPS as g (g)}
		{@const items = help.articles.filter((a) => a.group === g)}
		{#if items.length > 0}
			<section>
				<Heading label={t(`help.group.${g}`)} />
				{#each items as a (a.slug)}
					<a href="/help/{a.slug}">
						<strong>{a.title[i18n.locale]}</strong>
						<span>{a.summary[i18n.locale]}</span>
					</a>
				{/each}
			</section>
		{/if}
	{/each}
</div>

<style>
	.help {
		display: grid;
		gap: 2rem;
		max-width: 48rem;
	}
	section {
		display: grid;
		gap: 0.5rem;
	}
	a {
		display: grid;
		gap: 0.25rem;
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-m);
		background: var(--surface);
		color: var(--text);
		text-decoration: none;
		line-height: 1.25;
	}
	a:hover {
		border-color: var(--accent);
		background: var(--surface-2);
	}
	strong {
		font-size: var(--fs-m);
		font-weight: 600;
	}
	span {
		font-size: var(--fs-s);
		line-height: 1.5;
		color: var(--muted);
	}
</style>
