<script lang="ts" module>
	/* One AI provider's key and the model each of the product's roles uses, over
	   home_core.llm's /ai routes. BABA drew this card for itself with one model
	   per provider; DIDA needs a model per role, so the card is the kit's and the
	   roles are what a product hands it. */

	export type AiSetting = {
		provider: string;
		api_key_masked: string;
		enabled: boolean;
		models: Record<string, string>;
		last_used_at: string | null;
	};
	/** a role the product calls a model for, worded by the product */
	export type AiRole = { key: string; label: string; hint?: string };
	/** the product's own JSON request: its base URL, its session, its words for
	 *  a refusal; throws an Error carrying the sentence to show */
	export type AiCall = <T>(path: string, init?: RequestInit) => Promise<T>;

	type ModelOption = { id: string; label: string; roles: string[] };
	type TestResult = { model: string; ok: boolean; latency_ms: number; error: string | null };

	export const AI_PROVIDERS: Record<string, { label: string; keyUrl: string; placeholder: string }> = {
		anthropic: {
			label: 'Anthropic',
			keyUrl: 'https://console.anthropic.com/settings/keys',
			placeholder: 'sk-ant-…'
		},
		openai: { label: 'OpenAI', keyUrl: 'https://platform.openai.com/api-keys', placeholder: 'sk-…' }
	};
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import Button from './Button.svelte';
	import Card from './Card.svelte';
	import Field from './Field.svelte';
	import SaveButton from './SaveButton.svelte';
	import Tag from './Tag.svelte';
	import Toggle from './Toggle.svelte';
	import { dialog } from './dialogs.svelte';
	import { formatDateTime, t } from './i18n.svelte';
	import { json } from './http';
	import { toasts } from './toasts.svelte';

	let {
		provider,
		roles,
		stored: initial,
		call
	}: {
		provider: string;
		roles: AiRole[];
		stored: AiSetting | null;
		call: AiCall;
	} = $props();

	const meta = $derived(AI_PROVIDERS[provider] ?? { label: provider, keyUrl: '', placeholder: '' });

	// the prop is where the card starts; from then on it shows what was saved
	let stored = $state<AiSetting | null>(untrack(() => initial));
	let apiKey = $state('');
	let enabled = $state(untrack(() => initial?.enabled ?? true));
	const unchosen = () => Object.fromEntries(roles.map((r) => [r.key, '']));
	let chosen = $state<Record<string, string>>(untrack(() => ({ ...unchosen(), ...initial?.models })));

	let models = $state<ModelOption[] | null>(null);
	let loading = $state(false);
	let modelsError = $state('');
	let saving = $state(false);
	let testing = $state(false);
	let results = $state<TestResult[]>([]);
	let error = $state('');

	const offered = (role: string) => (models ?? []).filter((m) => m.roles.includes(role));
	const listed = (role: string) => offered(role).some((m) => m.id === chosen[role]);
	const complete = $derived(roles.every((r) => chosen[r.key]));
	const changed = $derived(
		stored !== null &&
			(enabled !== stored.enabled || roles.some((r) => chosen[r.key] !== stored?.models[r.key]))
	);
	const dirty = $derived(complete && (!!apiKey.trim() || changed));
	const blocked = $derived(models !== null && roles.some((r) => !listed(r.key)));

	async function loadModels() {
		loading = true;
		modelsError = '';
		const key = apiKey.trim();
		try {
			const out = await call<{ models: ModelOption[] }>(
				'/ai/models',
				json(key ? { provider, api_key: key } : { provider })
			);
			models = out.models;
		} catch (e) {
			models = null;
			modelsError = (e as Error).message;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (stored) void loadModels();
	});

	async function save() {
		saving = true;
		error = '';
		try {
			const key = apiKey.trim();
			stored = await call<AiSetting>(
				'/ai/settings',
				json({ provider, enabled, models: chosen, ...(key ? { api_key: key } : {}) }, 'PUT')
			);
			apiKey = '';
			toasts.success(t('settings.saved'));
		} catch (e) {
			error = (e as Error).message;
		} finally {
			saving = false;
		}
	}

	async function test() {
		testing = true;
		results = [];
		error = '';
		const key = apiKey.trim();
		const wanted = [...new Set(roles.map((r) => chosen[r.key]).filter(Boolean))];
		try {
			const out = await call<{ ok: boolean; results: TestResult[] }>(
				'/ai/test',
				json({ provider, models: wanted, ...(key ? { api_key: key } : {}) })
			);
			results = out.results;
		} catch (e) {
			error = (e as Error).message;
		} finally {
			testing = false;
		}
	}

	async function remove() {
		const sure = await dialog.confirm({
			title: t('ai.remove'),
			message: t('ai.confirmRemove', { provider: meta.label }),
			confirmLabel: t('ai.remove'),
			danger: true
		});
		if (!sure) return;
		error = '';
		try {
			await call<null>(`/ai/settings/${provider}`, { method: 'DELETE' });
			stored = null;
			apiKey = '';
			enabled = true;
			chosen = unchosen();
			models = null;
			modelsError = '';
			results = [];
		} catch (e) {
			error = (e as Error).message;
		}
	}
</script>

<Card title={meta.label}>
	{#snippet actions()}
		{#if !stored}
			<Tag tone="quiet">{t('ai.unset')}</Tag>
		{:else if stored.enabled}
			<Tag tone="ok">{t('settings.bool.on')}</Tag>
		{:else}
			<Tag tone="warn">{t('settings.bool.off')}</Tag>
		{/if}
	{/snippet}

	<Field label={t('ai.apiKey')} hint={stored ? t('ai.apiKeyStored', { key: stored.api_key_masked }) : t('ai.apiKeyHint')}>
		<input
			type="password"
			autocomplete="off"
			bind:value={apiKey}
			onchange={() => apiKey.trim() && loadModels()}
			placeholder={stored ? stored.api_key_masked : meta.placeholder}
		/>
	</Field>
	{#if meta.keyUrl}
		<a class="key-link" href={meta.keyUrl} target="_blank" rel="noreferrer noopener">{t('ai.getKey')}</a>
	{/if}

	{#if loading}
		<p class="line">{t('ai.modelsLoading')}</p>
	{:else if modelsError}
		<p class="line err">{t('ai.modelsFailed', { detail: modelsError })}</p>
	{:else if models === null}
		<p class="line">{t('ai.modelsNeedKey')}</p>
	{/if}

	{#each roles as role (role.key)}
		<Field
			label={role.label}
			hint={models !== null && chosen[role.key] && !listed(role.key) ? t('ai.modelUnavailableHint') : role.hint}
		>
			<select bind:value={chosen[role.key]} disabled={models === null}>
				{#if !chosen[role.key]}
					<option value="" disabled>{t('ai.modelPick')}</option>
				{:else if !listed(role.key)}
					<option value={chosen[role.key]}>
						{models === null ? chosen[role.key] : `${chosen[role.key]} · ${t('ai.modelUnavailable')}`}
					</option>
				{/if}
				{#each offered(role.key) as m (m.id)}
					<option value={m.id}>{m.label}</option>
				{/each}
			</select>
		</Field>
	{/each}

	<div class="row">
		<Toggle checked={enabled} onclick={() => (enabled = !enabled)} label={t('ai.enabled')} />
		<span class="line">{t('ai.enabled')}</span>
	</div>

	<div class="row">
		<SaveButton {dirty} {saving} {blocked} onclick={save} />
		<Button onclick={test} disabled={testing || !complete || (!stored && !apiKey.trim())}>
			{testing ? t('ai.testing') : t('ai.test')}
		</Button>
		{#if stored}
			<span class="end"><Button tone="danger" onclick={remove}>{t('ai.remove')}</Button></span>
		{/if}
	</div>

	{#if error}<p class="line err">{error}</p>{/if}
	{#each results as r (r.model)}
		{#if r.ok}
			<p class="line ok">{t('ai.testOk', { model: r.model, ms: r.latency_ms })}</p>
		{:else}
			<p class="line err">{t('ai.testFailed', { model: r.model, error: r.error ?? '' })}</p>
		{/if}
	{/each}

	{#if stored}
		<p class="line">
			{stored.last_used_at
				? t('ai.lastUsed', { when: formatDateTime(stored.last_used_at) })
				: t('ai.neverUsed')}
		</p>
	{/if}
</Card>

<style>
	input,
	select {
		width: 100%;
	}
	input {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}
	.key-link {
		align-self: flex-start;
		margin-top: -0.6rem;
		font-size: var(--fs-s);
		color: var(--accent);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}
	.end {
		margin-left: auto;
	}
	.line {
		margin: 0;
		font-size: var(--fs-s);
		color: var(--muted);
	}
	.ok {
		color: var(--ok);
	}
	.err {
		color: var(--danger);
	}
</style>
