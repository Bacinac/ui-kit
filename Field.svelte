<script lang="ts">
	// A labelled control, on its own rather than driven by a settings spec the way
	// SettingField is. A login and a password change are not settings, but they
	// are the same control, and a product should not be re-styling an input to
	// get one. Given a control of its own — a select, a number, a row of
	// choices — it is the same label and hint around that instead.
	import type { Snippet } from 'svelte';

	let {
		id,
		label,
		hint,
		value = $bindable(''),
		type = 'text',
		autocomplete,
		placeholder,
		children
	}: {
		/** the control's id, so the label names it */
		id?: string;
		label?: string;
		/** a line under the control: what the value means, what it is for */
		hint?: string;
		value?: string;
		type?: 'text' | 'password';
		autocomplete?: import('svelte/elements').FullAutoFill;
		placeholder?: string;
		children?: Snippet;
	} = $props();
</script>

<div class="field">
	{#if label}
		{#if id}<label for={id}>{label}</label>{:else}<span class="label">{label}</span>{/if}
	{/if}
	{#if children}
		{@render children()}
	{:else if type === 'password'}
		<input {id} type="password" bind:value {autocomplete} {placeholder} />
	{:else}
		<input {id} type="text" bind:value {autocomplete} {placeholder} />
	{/if}
	{#if hint}<p class="hint">{hint}</p>{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		width: 100%;
	}
	label,
	.label {
		font-size: var(--fs-s);
		color: var(--muted);
	}
	input {
		width: 100%;
	}
	.hint {
		margin: 0;
		font-size: var(--fs-xs);
		color: var(--muted);
	}
</style>
