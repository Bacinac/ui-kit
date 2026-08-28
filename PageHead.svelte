<script lang="ts">
	// What a page says about itself before it says anything else: what it is, how
	// much of it there is, and the handful of ways into it.
	//
	// Written once because it was written three times — a title over counts in
	// the player, a tab strip in the library, and a heading with nothing under it
	// in downloads — and because the same three things want the same behaviour:
	// they stay while the page under them scrolls. A shelf of forty thousand
	// photographs, or two thousand episodes, leaves with the first screenful
	// otherwise, and takes the way between its views with it.
	//
	// It pins itself under whatever the shell keeps at the top, which the shell
	// measures onto the page as `--opus-header`. Its own height goes back the
	// same way, so a rail or a column inside the page can sit under both.

	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import Tag, { type Tone } from './Tag.svelte';

	export type Fact = { text: string; tone?: Tone; icon?: string };

	let {
		title,
		facts = [],
		ways,
		aside,
		sticky = true
	}: {
		title: string;
		/** what there is, counted — each in its kind's own colour */
		facts?: Fact[];
		/** the ways into this page: tabs, filters, a row of buttons */
		ways?: Snippet;
		/** anything that belongs opposite the title */
		aside?: Snippet;
		/** a page that scrolls something of its own may want it left alone */
		sticky?: boolean;
	} = $props();

	let tall = $state(0);
</script>

<div
	class="head"
	class:pinned={sticky}
	bind:clientHeight={tall}
	style:--opus-page-head="{tall}px"
>
	<div class="line">
		<h1>{title}</h1>
		{#if aside}<div class="aside">{@render aside()}</div>{/if}
	</div>

	{#if facts.length}
		<div class="facts">
			{#each facts as f (f.text)}
				<Tag tone={f.tone ?? 'fact'}>
					{#if f.icon}<Icon name={f.icon} />{/if}
					{f.text}
				</Tag>
			{/each}
		</div>
	{/if}

	{#if ways}<div class="ways">{@render ways()}</div>{/if}
</div>

<style>
	.head {
		display: grid;
		gap: 0.6rem;
		background: var(--bg);
		padding: 0.9rem 0 0.8rem;
	}
	.pinned {
		position: sticky;
		top: var(--opus-header, 0px);
		z-index: 5;
	}
	.line {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		flex-wrap: wrap;
	}
	h1 {
		margin: 0;
		font-size: 1.5rem;
		line-height: 1.1;
	}
	.aside {
		margin-left: auto;
	}
	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
	}
	.ways {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		align-items: center;
	}
</style>
