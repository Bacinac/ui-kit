<script lang="ts" module>
	/* What this control needs to know about a setting, and nothing more. Each
	   module's own Setting type carries extra fields (grouping, mode scope); a
	   structural type means those ride along without the package having to know
	   they exist. */
	export type FieldSetting = {
		key: string;
		label: string;
		kind: string; // text | bool | select | number
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

	let { setting, value = $bindable() }: { setting: FieldSetting; value: string } = $props();
</script>

<div class="row">
	<label class="label" for={setting.key}>
		{t(`field.${setting.label}`)}
	</label>
	{#if setting.kind === 'bool'}
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
		<input
			id={setting.key}
			type="password"
			bind:value
			placeholder={setting.is_set ? t('settings.secretSet') : t('settings.secretUnset')}
			autocomplete="off"
		/>
	{:else}
		<input id={setting.key} type="text" bind:value autocomplete="off" />
	{/if}
</div>

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
		box-sizing: border-box;
		padding: 0.55rem 0.8rem;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--bg);
		color: inherit;
		font: inherit;
		font-size: 0.95rem;
	}
	input:focus,
	select:focus {
		outline: none;
		border-color: var(--accent);
	}
</style>
