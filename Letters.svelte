<script lang="ts">
	// The letters down the edge of a wall of names, for going straight to one.
	//
	// A phone's contacts have this and a finger knows it: touch the rail and
	// slide, and the wall follows under the finger — pressing one letter, then
	// looking, then pressing the next is what a rail without the slide asks for.
	// A pointer clicks a letter instead. The rail says which letter is under the
	// finger while it is held, because the rail itself is too narrow to read
	// under a thumb.
	//
	// Only the letters the wall actually holds: a letter with nothing under it is
	// a button that does nothing, and on a rail that is meant to be run down
	// without looking, that is a hole the finger falls into.

	import { t } from './i18n.svelte';

	let {
		letters,
		onjump
	}: {
		/** the letters that have something under them, in the wall's order */
		letters: readonly string[];
		onjump: (letter: string) => void;
	} = $props();

	let rail: HTMLElement | undefined = $state();
	let held = $state<string | null>(null);

	function under(y: number): string | null {
		if (!rail) return null;
		for (const el of rail.querySelectorAll<HTMLElement>('[data-letter]')) {
			const box = el.getBoundingClientRect();
			if (y >= box.top && y < box.bottom) return el.dataset.letter ?? null;
		}
		return null;
	}

	function go(letter: string | null) {
		if (!letter || letter === held) return;
		held = letter;
		onjump(letter);
	}

	function down(event: PointerEvent) {
		if (event.pointerType === 'mouse') return; // a mouse clicks a letter; it does not slide
		rail?.setPointerCapture(event.pointerId);
		go(under(event.clientY));
	}
	function move(event: PointerEvent) {
		if (!rail?.hasPointerCapture(event.pointerId)) return;
		go(under(event.clientY));
	}
	function up(event: PointerEvent) {
		if (rail?.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
		held = null;
	}
</script>

{#if letters.length > 1}
	<nav
		class="letters"
		aria-label={t('letters.label')}
		bind:this={rail}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
		onpointercancel={up}
	>
		{#each letters as letter (letter)}
			<button
				type="button"
				data-letter={letter}
				class:held={held === letter}
				onclick={() => onjump(letter)}
				tabindex="-1"
			>
				{letter}
			</button>
		{/each}
		{#if held}
			<span class="bubble" aria-hidden="true">{held}</span>
		{/if}
	</nav>
{/if}

<style>
	.letters {
		position: fixed;
		right: 0.15rem;
		top: 50%;
		transform: translateY(-50%);
		z-index: 20;
		display: flex;
		flex-direction: column;
		align-items: center;
		max-height: 92vh;
		padding: 0.3rem 0.1rem;
		border-radius: 999px;
		/* the finger slides along it, and the page must not scroll under the slide */
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
	}
	.letters button {
		display: grid;
		place-items: center;
		width: 1.5rem;
		min-height: 1.15rem;
		flex: 1 1 0;
		padding: 0;
		border: none;
		border-radius: 6px;
		background: none;
		color: var(--muted);
		font: inherit;
		font-size: 0.72rem;
		font-weight: 600;
		line-height: 1;
		cursor: pointer;
	}
	.letters button:hover,
	.letters button.held {
		color: var(--accent);
	}
	.bubble {
		position: absolute;
		right: 2.4rem;
		top: 50%;
		transform: translateY(-50%);
		display: grid;
		place-items: center;
		width: 3.4rem;
		height: 3.4rem;
		border-radius: 50%;
		background: var(--accent);
		color: var(--on-accent, #fff);
		font-size: 1.6rem;
		font-weight: 700;
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
		pointer-events: none;
	}
	@media (max-width: 700px) {
		.letters button {
			width: 1.3rem;
			min-height: 1rem;
			font-size: 0.66rem;
		}
	}
</style>
