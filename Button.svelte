<script lang="ts" module>
	/* A button is a button in every module, which is the whole reason this
	   package exists. Three tones, because three is what the product actually
	   distinguishes: the one action a screen is for, everything else beside it,
	   and the one you want somebody to think about first. */
	export type Tone = 'primary' | 'accent' | 'quiet' | 'danger';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		tone = 'quiet',
		size = 'normal',
		type = 'button',
		href,
		disabled = false,
		selected = false,
		title,
		label,
		onclick,
		onmouseleave,
		onblur,
		children
	}: {
		tone?: Tone;
		/** a row of a table or a line of a list carries its actions small */
		size?: 'normal' | 'small';
		type?: 'button' | 'submit';
		/** a way somewhere rather than a thing done: drawn as a button, followed as a link */
		href?: string;
		disabled?: boolean;
		/** for a button standing in a set of choices: this is the one in force */
		selected?: boolean;
		title?: string;
		/** what a screen reader says for a button whose face is a sign rather than a word */
		label?: string;
		onclick?: (event: MouseEvent) => void;
		onmouseleave?: (event: MouseEvent) => void;
		onblur?: (event: FocusEvent) => void;
		children: Snippet;
	} = $props();
</script>

{#if href}
	<a class="btn {tone} {size}" class:selected {href} {title} aria-label={label}>
		{@render children()}
	</a>
{:else}
	<button
		class="btn {tone} {size}"
		class:selected
		{type}
		{disabled}
		{title}
		aria-label={label}
		{onclick}
		{onmouseleave}
		{onblur}
	>
		{@render children()}
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4em;
		padding: 0.45rem 1.1rem;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		font: inherit;
		font-size: 0.9rem;
		line-height: 1.35;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		transition: border-color 0.12s ease, background 0.12s ease;
	}
	.small {
		padding: 0.2rem 0.6rem;
		border-radius: 6px;
		font-size: 0.8rem;
	}
	.btn:hover:not(:disabled) {
		border-color: var(--accent);
	}
	.btn:disabled {
		opacity: 0.55;
		cursor: default;
	}
	.primary {
		border-color: var(--accent);
		background: var(--accent);
		color: var(--bg);
		font-weight: 600;
	}
	/* tinted rather than filled: a row of four filled buttons reads as four
	   things demanding to be pressed */
	.accent {
		border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
		background: color-mix(in srgb, var(--accent) 12%, var(--surface));
		color: var(--accent);
		font-weight: 600;
	}
	.accent:hover:not(:disabled) {
		background: color-mix(in srgb, var(--accent) 22%, var(--surface));
	}
	.quiet {
		color: var(--muted);
	}
	.quiet:hover:not(:disabled) {
		color: var(--text);
	}
	.danger {
		color: var(--danger);
		border-color: color-mix(in srgb, var(--danger) 55%, var(--border));
	}
	.danger:hover:not(:disabled) {
		border-color: var(--danger);
		background: color-mix(in srgb, var(--danger) 12%, var(--surface));
	}
	/* a chosen option reads as chosen without changing weight, so a row of them
	   does not shift as the choice moves along it */
	.selected {
		color: var(--text);
		border-color: var(--accent);
	}
</style>
