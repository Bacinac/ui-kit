<script lang="ts" module>
	/* What this control needs to know about a setting, and nothing more. Each
	   module's own Setting type carries extra fields (grouping, mode scope); a
	   structural type means those ride along without the package having to know
	   they exist. */
	export type FieldSetting = {
		key: string;
		label: string;
		kind: string; // text | bool | select | number | list
		secret?: boolean;
		options?: string[];
		is_set?: boolean | null;
	};
</script>

<script lang="ts">
	// One setting row: the label and the control its kind asks for — a toggle,
	// a fixed list of options, a write-only secret or plain text. The value is
	// bound straight back into the draft the page holds; nothing is saved here.
	// Labels are keyed by the field's suffix, so every engine reuses one catalog.

	import { t } from './i18n.svelte';
	import Chips from './Chips.svelte';
	import Picks from './Picks.svelte';

	let {
		setting,
		value = $bindable(),
		choices
	}: {
		setting: FieldSetting;
		value: string;
		/** what the setting can point at when the list is not the module's to
		 *  word — the devices another service knows by name. Already worded;
		 *  a stored value the list no longer offers stays chosen and visible.
		 *  On a list, several of them are chosen. */
		choices?: { value: string; label: string }[];
	} = $props();

	const listed = $derived(
		setting.kind === 'list'
			? value
					.split(',')
					.map((v) => v.trim())
					.filter(Boolean)
			: value
				? [value]
				: []
	);
	const offered = $derived(
		choices && [
			...choices,
			...listed
				.filter((v) => !choices.some((c) => c.value === v))
				.map((v) => ({ value: v, label: v }))
		]
	);
</script>

{#if setting.kind === 'list' && offered}
	<div class="row">
		<span class="label">{t(`field.${setting.label}`)}</span>
		<Picks
			picks={offered.map((c) => ({ key: c.value, label: c.label }))}
			bind:chosen={() => listed, (next) => (value = next.join(','))}
			many
		/>
	</div>
{:else if setting.kind === 'list'}
	<Chips id={setting.key} label={t(`field.${setting.label}`)} bind:value />
{:else}
<div class="row">
	<label class="label" for={setting.key}>
		{t(`field.${setting.label}`)}
	</label>
	{#if offered}
		<select id={setting.key} bind:value>
			<option value="">—</option>
			{#each offered as choice (choice.value)}
				<option value={choice.value}>{choice.label}</option>
			{/each}
		</select>
	{:else if setting.kind === 'bool'}
		<select id={setting.key} bind:value>
			<option value="false">{t('settings.bool.off')}</option>
			<option value="true">{t('settings.bool.on')}</option>
		</select>
	{:else if setting.kind === 'select'}
		<select id={setting.key} bind:value>
			{#each setting.options ?? [] as option (option)}
				<option value={option}>
					{t(`settings.opt.${setting.label}.${option}`)}
				</option>
			{/each}
		</select>
	{:else if setting.secret}
		<!-- new-password, not off: a browser fills a saved password into any
		     password box that does not claim to be a new one, and here that
		     writes somebody's own password over an engine's the moment the form
		     is saved — and leaves the form dirty forever until it is. The name
		     is deliberately not the field's, so nothing has a label to match. -->
		<input
			id={setting.key}
			name={`s-${setting.key}`}
			type="password"
			bind:value
			placeholder={setting.is_set ? t('settings.secretSet') : t('settings.secretUnset')}
			autocomplete="new-password"
			data-1p-ignore
			data-lpignore="true"
		/>
	{:else}
		<input id={setting.key} type="text" bind:value autocomplete="off" />
	{/if}
</div>
{/if}

<style>
	.row {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: 0;
	}
	.label {
		font-weight: 600;
		font-size: 0.9rem;
	}
	input,
	select {
		width: 100%;
	}
</style>
