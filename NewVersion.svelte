<script lang="ts" generics="R extends { version: string }">
	// Said at the top of a tab that runs an older build than the server serves,
	// until the person reloads it or the watcher does.

	import Button from './Button.svelte';
	import { t } from './i18n.svelte';
	import type { VersionWatch } from './version.svelte';

	let { watch }: { watch: VersionWatch<R> } = $props();
</script>

{#if watch.available}
	<div class="bar" role="status">
		<span>{t('version.available', { version: watch.available })}</span>
		<Button tone="primary" size="small" onclick={() => watch.reload()}>{t('version.reload')}</Button>
	</div>
{/if}

<style>
	.bar {
		position: fixed;
		top: max(0.5rem, env(safe-area-inset-top));
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		max-width: calc(100vw - 2rem);
		padding: 0.5rem 0.5rem 0.5rem 1rem;
		font-size: var(--fs-m);
		color: var(--text);
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-left: 4px solid var(--accent);
		border-radius: var(--radius-s);
		box-shadow: var(--shadow-m);
	}
</style>
