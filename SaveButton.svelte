<script lang="ts">
	// The one Save. It opens only when there is something to save and nothing is
	// being saved already, so a press always sends a change and never sends one
	// twice; every product had written that rule out by hand on each form.

	import Button from './Button.svelte';
	import { t } from './i18n.svelte';

	let {
		dirty,
		saving = false,
		blocked = false,
		onclick,
		type = 'button',
		size = 'normal',
		label
	}: {
		/** the draft differs from what is stored */
		dirty: boolean;
		saving?: boolean;
		/** something on the form stands in the way — a conflict, a missing field */
		blocked?: boolean;
		onclick?: (event: MouseEvent) => void;
		type?: 'button' | 'submit';
		size?: 'normal' | 'small';
		/** a verb more exact than "save", when the page has one */
		label?: string;
	} = $props();
</script>

<Button tone="primary" {type} {size} {onclick} disabled={!dirty || saving || blocked}>
	{saving ? t('common.saving') : (label ?? t('common.save'))}
</Button>
