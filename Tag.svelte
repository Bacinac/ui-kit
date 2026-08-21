<script lang="ts" module>
	/** What the tag says about the thing it is stuck to. `fact` is the neutral
	    one — a resolution, a size, a codec: true regardless of how anyone feels
	    about it. The rest are states, and their colours are the product's, not
	    each module's guess at them. */
	export type Tone = 'fact' | 'ok' | 'warn' | 'busy' | 'quiet';
</script>

<script lang="ts">
	// The small pill a list hangs its facts on. It was written three times — a
	// resolution chip here, a language chip there, a status badge in two modules
	// with the same four colours copied by hand — which is how a library row came
	// to look considered and a player row came to look like a sentence.

	import type { Snippet } from 'svelte';

	let {
		tone = 'fact',
		title = '',
		children
	}: {
		tone?: Tone;
		/** the long form, for a tag whose short form needs one */
		title?: string;
		children: Snippet;
	} = $props();
</script>

<span class="tag {tone}" {title}>{@render children()}</span>

<style>
	/* Sized from one variable and spaced in ems, so a surface that is read from
	   ten feet away sets --tag-font once and the pill grows with its words. */
	.tag {
		flex: none;
		display: inline-flex;
		align-items: center;
		gap: 0.35em;
		vertical-align: middle;
		padding: 0.2em 0.7em;
		border-radius: 999px;
		font-size: var(--tag-font, 0.72rem);
		font-weight: 700;
		letter-spacing: 0.01em;
		white-space: nowrap;
	}
	.fact {
		background: var(--surface-2);
		color: var(--text);
	}
	.quiet {
		background: var(--surface-2);
		color: var(--muted);
	}
	.ok {
		background: color-mix(in srgb, var(--ok) 16%, transparent);
		color: var(--ok);
	}
	.warn {
		background: color-mix(in srgb, var(--warn) 18%, transparent);
		color: var(--warn);
	}
	.film {
		background: color-mix(in srgb, var(--kind-film) 18%, transparent);
		color: var(--kind-film);
	}
	.series {
		background: color-mix(in srgb, var(--kind-series) 18%, transparent);
		color: var(--kind-series);
	}
	.music {
		background: color-mix(in srgb, var(--kind-music) 18%, transparent);
		color: var(--kind-music);
	}
	.busy {
		background: color-mix(in srgb, var(--accent) 18%, transparent);
		color: var(--accent);
	}
</style>
