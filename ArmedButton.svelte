<script lang="ts">
	// A button for what does not come back: the first press arms it and says so,
	// the second does it. It disarms on its own — when the pointer leaves, when
	// focus moves on, and after a few seconds on a screen with no pointer to
	// leave — so a half-pressed confirm never sits there waiting to be finished
	// by somebody who has stopped reading.

	import type { Snippet } from 'svelte';
	import Button, { type Tone } from './Button.svelte';
	import { t } from './i18n.svelte';

	let {
		tone = 'danger',
		size = 'normal',
		disabled = false,
		title,
		label,
		onconfirm,
		children
	}: {
		tone?: Tone;
		size?: 'normal' | 'small';
		disabled?: boolean;
		title?: string;
		label?: string;
		onconfirm: () => void;
		children: Snippet;
	} = $props();

	const PATIENCE = 4000;

	let armed = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function disarm() {
		armed = false;
		clearTimeout(timer);
	}

	function press() {
		if (!armed) {
			armed = true;
			clearTimeout(timer);
			timer = setTimeout(disarm, PATIENCE);
			return;
		}
		disarm();
		onconfirm();
	}

	$effect(() => disarm);
</script>

<Button
	tone={armed ? 'danger' : tone}
	{size}
	{disabled}
	{title}
	{label}
	onclick={press}
	onmouseleave={disarm}
	onblur={disarm}
>
	{#if armed}{t('common.confirm')}{:else}{@render children()}{/if}
</Button>
