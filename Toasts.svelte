<script lang="ts">
	import { toasts } from './toasts.svelte';
</script>

<div class="stack">
	{#each toasts.toasts as toast (toast.id)}
		<button class={`toast ${toast.kind}`} onclick={() => toasts.dismiss(toast.id)}>
			{toast.text}
		</button>
	{/each}
</div>

<style>
	.stack {
		position: fixed;
		bottom: 1.25rem;
		right: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		z-index: 100;
		max-width: min(420px, calc(100vw - 2.5rem));
	}
	.toast {
		text-align: left;
		font: inherit;
		font-size: var(--fs-l);
		color: var(--text);
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-left-width: 4px;
		border-radius: 8px;
		padding: 0.7rem 1rem;
		cursor: pointer;
		box-shadow: var(--shadow-m);
	}
	.toast.success {
		border-left-color: var(--ok);
	}
	.toast.error {
		border-left-color: var(--danger);
	}
	.toast.info {
		border-left-color: var(--accent);
	}
</style>
