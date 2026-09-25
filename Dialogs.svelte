<script lang="ts">
	// The question the dialog store is asking, if any. Escape, the backdrop and
	// the way out answer a confirm with no and an alert with OK — an alert has
	// nothing else to say.

	import Button from './Button.svelte';
	import Dialog from './Dialog.svelte';
	import { dialog } from './dialogs.svelte';
	import { t } from './i18n.svelte';

	const dismiss = () => dialog.resolve(dialog.current?.kind === 'alert');
</script>

{#if dialog.current}
	<Dialog title={dialog.current.title} size="narrow" onclose={dismiss}>
		<p class="message">{dialog.current.message}</p>
		<div class="action-row">
			{#if dialog.current.kind === 'confirm'}
				<Button onclick={() => dialog.resolve(false)}>{dialog.current.cancelLabel ?? t('common.cancel')}</Button>
			{/if}
			<Button tone={dialog.current.danger ? 'danger' : 'primary'} onclick={() => dialog.resolve(true)}>
				{dialog.current.confirmLabel ?? t('common.ok')}
			</Button>
		</div>
	</Dialog>
{/if}

<style>
	.message {
		margin: 0;
		white-space: pre-line;
		color: var(--muted);
		font-size: var(--fs-m);
	}
</style>
