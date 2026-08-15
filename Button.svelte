<script lang="ts" module>
	/* A button is a button in every module, which is the whole reason this
	   package exists. Three tones, because three is what the product actually
	   distinguishes: the one action a screen is for, everything else beside it,
	   and the one you want somebody to think about first. */
	export type Tone = 'primary' | 'quiet' | 'danger';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		tone = 'quiet',
		type = 'button',
		disabled = false,
		selected = false,
		title,
		onclick,
		onmouseleave,
		children
	}: {
		tone?: Tone;
		type?: 'button' | 'submit';
		disabled?: boolean;
		/** for a button standing in a set of choices: this is the one in force */
		selected?: boolean;
		title?: string;
		onclick?: (event: MouseEvent) => void;
		/** a button that arms on the first click disarms when the pointer leaves,
		 * so a half-pressed confirm does not sit there waiting to be finished */
		onmouseleave?: (event: MouseEvent) => void;
		children: Snippet;
	} = $props();
</script>

<button class="btn {tone}" class:selected {type} {disabled} {title} {onclick} {onmouseleave}>
	{@render children()}
</button>

<style>
	.btn {
		padding: 0.45rem 1.1rem;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		font: inherit;
		font-size: 0.9rem;
		line-height: 1.35;
		cursor: pointer;
		transition: border-color 0.12s ease, background 0.12s ease;
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
	.quiet {
		color: var(--muted);
	}
	.danger {
		color: var(--warn);
		border-color: var(--warn);
	}
	/* a chosen option reads as chosen without changing weight, so a row of them
	   does not shift as the choice moves along it */
	.selected {
		color: var(--text);
		border-color: var(--accent);
	}
</style>
