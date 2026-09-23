<script lang="ts">
	// A window over the page: a title, a way out, and whatever it is for. It was
	// drawn five times, each with its own backdrop, its own corner radius and its
	// own idea of whether Escape closes it — and none of them kept the keyboard
	// inside, so Tab walked out of the window into the page behind it.

	import { onMount, type Snippet } from 'svelte';
	import { t } from './i18n.svelte';
	import { layer } from './layers';

	let {
		title = '',
		subtitle = '',
		label = '',
		size = 'normal',
		onclose,
		onescape,
		actions,
		children
	}: {
		/** empty draws no heading, for a window whose content names itself */
		title?: string;
		subtitle?: string;
		/** what a screen reader calls the window when it has no heading */
		label?: string;
		/** `full` is a sheet over the whole screen, for a window that is a page */
		size?: 'narrow' | 'normal' | 'wide' | 'full';
		onclose: () => void;
		/** a window holding a selection lets Escape put that down first */
		onescape?: () => void;
		/** what may be done from the heading, beside the way out */
		actions?: Snippet;
		children: Snippet;
	} = $props();

	const uid = $props.id();
	let panel = $state<HTMLElement | null>(null);

	const STOPS =
		'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

	onMount(() => {
		const here = layer();
		const before = document.activeElement as HTMLElement | null;
		const overflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		panel?.focus();

		function key(event: KeyboardEvent) {
			if (!here.top() || !panel) return;
			if (event.key === 'Escape') {
				event.preventDefault();
				(onescape ?? onclose)();
				return;
			}
			if (event.key !== 'Tab') return;
			const stops = [...panel.querySelectorAll<HTMLElement>(STOPS)].filter(
				(el) => el.offsetParent !== null
			);
			const at = document.activeElement;
			if (!stops.length) {
				event.preventDefault();
				panel.focus();
			} else if (!panel.contains(at) || (event.shiftKey ? at === stops[0] || at === panel : at === stops.at(-1))) {
				event.preventDefault();
				(event.shiftKey ? stops.at(-1)! : stops[0]).focus();
			}
		}

		window.addEventListener('keydown', key);
		return () => {
			window.removeEventListener('keydown', key);
			here.drop();
			document.body.style.overflow = overflow;
			before?.focus();
		};
	});
</script>

<div class="shade {size}">
	<button class="backdrop" type="button" tabindex="-1" aria-label={t('common.close')} onclick={onclose}
	></button>
	<div
		class="panel"
		role="dialog"
		aria-modal="true"
		aria-labelledby={title ? `${uid}-title` : undefined}
		aria-label={title ? undefined : label}
		tabindex="-1"
		bind:this={panel}
	>
		<header class:bare={!title}>
			{#if title}
				<div class="titles">
					<h2 id="{uid}-title">{title}</h2>
					{#if subtitle}<span class="subtitle">{subtitle}</span>{/if}
				</div>
			{/if}
			{#if actions}<div class="actions">{@render actions()}</div>{/if}
			<button class="close" type="button" aria-label={t('common.close')} onclick={onclose}>×</button>
		</header>
		<div class="body">
			{@render children()}
		</div>
	</div>
</div>

<style>
	.shade {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
	}
	.backdrop {
		position: absolute;
		inset: 0;
		border: none;
		background: rgb(0 0 0 / 0.55);
		cursor: pointer;
	}
	.panel {
		position: relative;
		width: min(46rem, 100%);
		max-height: 86vh;
		display: flex;
		flex-direction: column;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-m);
		box-shadow: 0 24px 60px rgb(0 0 0 / 0.35);
		overflow: hidden;
	}
	.panel:focus {
		outline: none;
	}
	.narrow .panel {
		width: min(38rem, 100%);
	}
	.wide .panel {
		width: min(60rem, 100%);
	}
	.full {
		padding: 0;
	}
	.full .panel {
		width: 100%;
		height: 100%;
		max-height: none;
		border: none;
		border-radius: 0;
		background: var(--bg);
	}
	header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.9rem 1.1rem;
		border-bottom: 1px solid var(--border);
	}
	/* no heading: the content names itself, and the way out floats over its corner */
	header.bare {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 2;
		padding: 0.6rem;
		border: none;
	}
	.titles {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
		flex: 1;
	}
	h2 {
		margin: 0;
		font-size: var(--fs-l);
	}
	.subtitle {
		color: var(--muted);
		font-size: var(--fs-m);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.close {
		flex: none;
		width: 2rem;
		height: 2rem;
		border: none;
		border-radius: var(--radius-s);
		background: color-mix(in srgb, var(--surface) 70%, transparent);
		color: var(--muted);
		font: inherit;
		font-size: var(--fs-2xl);
		line-height: 1;
		cursor: pointer;
	}
	.close:hover {
		color: var(--text);
		background: var(--surface-2);
	}
	.body {
		overflow-y: auto;
		min-height: 0;
		flex: 1;
		padding: 1rem 1.1rem 1.2rem;
	}
</style>
