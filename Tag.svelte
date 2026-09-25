<script lang="ts" module>
	/** What the tag says about the thing it is stuck to. `fact` is the neutral
	    one — a resolution, a size, a codec: true regardless of how anyone feels
	    about it. The rest are states, and their colours are the product's, not
	    each module's guess at them. A kind is not a state at all: it says which
	    kind of thing is being counted, in the colour the product's palette gives
	    it as --kind-<name>. */
	export type Tone = 'fact' | 'ok' | 'warn' | 'err' | 'busy' | 'quiet';
</script>

<script lang="ts">
	// The small pill a list hangs its facts on. It was written three times — a
	// resolution chip here, a language chip there, a status badge in two modules
	// with the same four colours copied by hand — which is how a library row came
	// to look considered and a player row came to look like a sentence.

	import type { Snippet } from 'svelte';

	let {
		tone = 'fact',
		kind,
		title = '',
		onpicture = false,
		dashed = false,
		onclick,
		onmouseenter,
		onmouseleave,
		children
	}: {
		tone?: Tone;
		/** which kind of thing is counted; paints over the tone */
		kind?: string;
		/** the long form, for a tag whose short form needs one */
		title?: string;
		/** laid over a photograph or a poster, where the page's own ground is not
		 *  what is behind it */
		onpicture?: boolean;
		/** something known to exist elsewhere rather than something held here */
		dashed?: boolean;
		/** a tag that is also where the thing it names is changed */
		onclick?: () => void;
		onmouseenter?: () => void;
		onmouseleave?: () => void;
		children: Snippet;
	} = $props();
</script>

{#if onclick}
	<button
		type="button"
		class="tag {kind ? 'kind' : tone}"
		style:--hue={kind ? `var(--kind-${kind})` : undefined}
		class:onpicture
		class:dashed
		{title}
		{onclick}
		{onmouseenter}
		{onmouseleave}
	>
		{@render children()}
	</button>
{:else}
	<span
		class="tag {kind ? 'kind' : tone}"
		style:--hue={kind ? `var(--kind-${kind})` : undefined}
		class:onpicture
		class:dashed
		{title}
		role={onmouseenter ? 'presentation' : undefined}
		{onmouseenter}
		{onmouseleave}>{@render children()}</span
	>
{/if}

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
		border: 1px solid transparent;
		border-radius: 999px;
		font: inherit;
		font-size: var(--tag-font, var(--fs-xs));
		font-weight: 700;
		letter-spacing: 0.01em;
		white-space: nowrap;
	}
	button.tag {
		cursor: pointer;
	}
	button.tag:hover {
		border-color: currentColor;
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
	.err {
		background: color-mix(in srgb, var(--danger) 16%, transparent);
		color: var(--danger);
	}
	.kind {
		background: color-mix(in srgb, var(--hue) 18%, transparent);
		color: var(--hue);
	}
	.busy {
		background: color-mix(in srgb, var(--accent) 18%, transparent);
		color: var(--accent);
	}
	.dashed {
		background: transparent;
		border-color: currentColor;
		border-style: dashed;
	}
	/* A picture is its own ground and it is never the page's colour, so a tag
	   laid over one brings a ground of its own in both themes. */
	.onpicture {
		background: var(--veil);
		color: var(--on-picture);
		font-weight: 600;
	}
	.onpicture.quiet {
		color: var(--on-picture-muted);
	}
	.onpicture.busy {
		background: var(--accent);
		color: var(--bg);
	}
	.onpicture.ok {
		background: var(--ok);
		color: var(--bg);
	}
	.onpicture.warn {
		background: var(--warn);
		color: var(--bg);
	}
	.onpicture.err {
		background: var(--danger);
		color: var(--bg);
	}
	.onpicture.kind {
		background: var(--hue);
		color: var(--bg);
	}
</style>
