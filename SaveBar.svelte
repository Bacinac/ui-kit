<script lang="ts">
	// The bar a form of settings saves from. It rode along the bottom of two
	// modules' settings pages as the same forty lines of CSS twice, which is the
	// drift this package exists to stop.

	import Button from './Button.svelte';

	let {
		dirty = false,
		saving = false,
		unsavedLabel,
		saveLabel,
		savingLabel
	}: {
		/** the draft differs from what is stored — the bar says so, and the button opens */
		dirty?: boolean;
		saving?: boolean;
		unsavedLabel: string;
		saveLabel: string;
		savingLabel: string;
	} = $props();
</script>

<!-- nothing to save is nothing to show: the bar arrives with the first edit and
     leaves with the save -->
{#if dirty}
	<div class="save-bar">
		<span class="unsaved">{unsavedLabel}</span>
		<Button type="submit" tone="primary" disabled={saving}>
			{saving ? savingLabel : saveLabel}
		</Button>
	</div>
{/if}

<style>
	.save-bar {
		position: sticky;
		bottom: 0.75rem;
		margin-top: 1.25rem;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 1rem;
		padding: 0.6rem 0.9rem;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: color-mix(in srgb, var(--surface) 88%, transparent);
		backdrop-filter: blur(10px);
		box-shadow: 0 6px 24px rgb(0 0 0 / 0.12);
	}
	.unsaved {
		color: var(--warn);
		font-size: 0.9rem;
	}
</style>
