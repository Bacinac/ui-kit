<script lang="ts">
	// A labelled input, on its own rather than driven by a settings spec the way
	// SettingField is. A login and a password change are not settings, but they
	// are the same control, and a module should not be re-styling an input to
	// get one.

	let {
		id,
		label,
		value = $bindable(),
		type = 'text',
		autocomplete,
		placeholder
	}: {
		id: string;
		label: string;
		value: string;
		type?: 'text' | 'password';
		autocomplete?: import('svelte/elements').FullAutoFill;
		placeholder?: string;
	} = $props();
</script>

<div class="field">
	<label for={id}>{label}</label>
	{#if type === 'password'}
		<input {id} type="password" bind:value {autocomplete} {placeholder} />
	{:else}
		<input {id} type="text" bind:value {autocomplete} {placeholder} />
	{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		width: 100%;
	}
	label {
		font-size: var(--fs-s);
		color: var(--muted);
	}
	input {
		width: 100%;
	}
</style>
