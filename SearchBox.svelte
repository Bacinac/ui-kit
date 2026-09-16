<script lang="ts">
	// A box to type into and the button that sends it: a search, a link to add.
	// Seven screens drew this pair with seven slightly different inputs.

	import type { Snippet } from 'svelte';
	import Button, { type Tone } from './Button.svelte';

	let {
		value = $bindable(''),
		placeholder,
		action,
		url = false,
		tone = 'primary',
		busy = false,
		onsubmit,
		after
	}: {
		value?: string;
		/** says what goes in, and is what a screen reader calls the box */
		placeholder: string;
		action: string;
		/** an address rather than words */
		url?: boolean;
		tone?: Tone;
		busy?: boolean;
		onsubmit: () => void;
		/** anything that belongs on the same line after the button */
		after?: Snippet;
	} = $props();
</script>

<form
	class="ask"
	onsubmit={(event) => {
		event.preventDefault();
		onsubmit();
	}}
>
	{#if url}
		<input type="url" bind:value {placeholder} aria-label={placeholder} autocomplete="off" />
	{:else}
		<input type="search" bind:value {placeholder} aria-label={placeholder} autocomplete="off" />
	{/if}
	<Button type="submit" {tone} disabled={busy}>{action}</Button>
	{#if after}{@render after()}{/if}
</form>

<style>
	.ask {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 0 0 1rem;
	}
	input {
		flex: 1 1 14rem;
		min-width: 0;
		max-width: 36rem;
	}
</style>
