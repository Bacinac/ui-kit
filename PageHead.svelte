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
		title = '',
		facts = [],
		ways,
		aside,
		under,
		behind = '',
		sticky = true
	}: {
		/** empty draws no line at all */
		title?: string;
		/** what there is, counted — each in its kind's own colour */
		facts?: Fact[];
		/** the ways into this page: tabs, filters, a row of buttons */
		ways?: Snippet;
		/** anything that belongs opposite the title */
		aside?: Snippet;
		/** a line or two under the facts — what is being pointed at right now.
		 *  Clamped, because a head whose height follows its text moves the shelf
		 *  under it every time a remote does. */
		under?: Snippet;
		/** a picture behind all of it. A background and not a block: reserving
		 *  room for one leaves that room empty on every page that has none, which
		 *  is what a fixed panel did before this. */
		behind?: string;
		/** a page that scrolls something of its own may want it left alone */
		sticky?: boolean;
	} = $props();

	let tall = $state(0);

	// Written onto the document and not only onto this element: what wants to sit
	// clear of the head — a rail down the side of a shelf, a column of its own —
	// is a sibling, and a custom property inherits downwards only.
	$effect(() => {
		const root = document.documentElement;
		root.style.setProperty('--opus-page-head', `${sticky ? tall : 0}px`);
		return () => root.style.removeProperty('--opus-page-head');
	});
</script>

<div
	class="head"
	class:pinned={sticky}
	class:lit={Boolean(behind)}
	bind:clientHeight={tall}
	style:--opus-page-head="{tall}px"
>
	{#if behind}
		{#key behind}
			<div class="behind" style={`background-image:url(${behind})`}></div>
		{/key}
		<div class="scrim"></div>
	{/if}

	{#if title || aside}
	<div class="line">
		<!-- a surface that says where you are somewhere else — the television
		     lights the section in its own navigation — passes no title, and gets
		     no empty line where one would have been -->
		{#if title}<h1>{title}</h1>{/if}
		{#if aside}<div class="aside">{@render aside()}</div>{/if}
	</div>
	{/if}

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
	{#if under}<div class="under">{@render under()}</div>{/if}
</div>

<style>
	.head {
		position: relative;
		display: grid;
		gap: 0.6rem;
		background: var(--bg);
		/* the same room under it on every page, so the first thing on one screen
		   begins where the first thing on the next one does */
		padding: 0.9rem 0 1.4rem;
		isolation: isolate;
	}
	.behind,
	.scrim {
		position: absolute;
		inset: 0 -50vw;
		z-index: -1;
	}
	.behind {
		background-position: center;
		background-size: cover;
		opacity: 0.5;
		animation: rise 0.4s ease;
	}
	.scrim {
		background: linear-gradient(
			to bottom,
			color-mix(in srgb, var(--bg) 55%, transparent),
			var(--bg)
		);
	}
	@keyframes rise {
		from {
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.behind {
			animation: none;
		}
	}
	.under {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		color: var(--muted);
		font-size: 0.9rem;
		line-height: 1.35;
		/* two lines whether it has two or none, so the shelf under it does not
		   move as the remote walks along a row */
		min-height: 2.7em;
	}
	.pinned {
		position: sticky;
		top: var(--opus-header, 0px);
		z-index: 5;
		/* Where it comes to rest is where it starts. The page keeps a margin
		   above its content; pinned, the head rises through it, and the shelf
		   under it moves by that much the moment anybody scrolls. So the head
		   takes that space off the page and keeps it as its own padding: the
		   same gap to look at, and nothing to travel. */
		margin-top: calc(-1 * var(--opus-main-top, 0px));
		padding-top: calc(var(--opus-main-top, 0px) + 0.9rem);
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
