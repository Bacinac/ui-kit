<script lang="ts">
	// On or off, said by a switch rather than a tick box: a setting that takes
	// effect the moment it is flipped. DIDA had drawn it three times with their
	// own track and knob sizes, holding the knob's resting place in sync by hand.

	let {
		checked,
		onclick,
		disabled = false,
		size = 'normal',
		label,
		title
	}: {
		checked: boolean;
		onclick?: (event: MouseEvent) => void;
		disabled?: boolean;
		/** a row of a list carries its switches small */
		size?: 'normal' | 'small';
		/** what a screen reader says the switch is for, when no words stand beside it */
		label?: string;
		title?: string;
	} = $props();
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	aria-label={label}
	class="switch {size}"
	class:on={checked}
	{title}
	{disabled}
	{onclick}
>
	<span class="track"><span class="knob"></span></span>
</button>

<style>
	/* The knob's travel is the track less the knob and both gaps, worked out
	   from the same three lengths, so the two sizes cannot drift apart. The
	   button is what a finger hits and is never smaller than --tap; the track
	   is drawn inside it at its own size. */
	.switch {
		--track: 2.75rem;
		--knob: 1.25rem;
		--gap: 0.125rem;
		--height: calc(var(--knob) + 2 * var(--gap));
		display: inline-grid;
		place-items: center;
		flex: none;
		width: max(var(--tap), var(--track));
		height: max(var(--tap), var(--height));
		padding: 0;
		border: none;
		border-radius: 999px;
		background: none;
		cursor: pointer;
	}
	.small {
		--track: 2.25rem;
		--knob: 1rem;
	}
	.track {
		position: relative;
		width: var(--track);
		height: var(--height);
		border-radius: 999px;
		background: var(--border);
		transition: background 0.12s ease;
	}
	.on .track {
		background: var(--accent);
	}
	.switch:disabled {
		opacity: 0.55;
		cursor: default;
	}
	.knob {
		position: absolute;
		top: var(--gap);
		left: var(--gap);
		width: var(--knob);
		height: var(--knob);
		border-radius: 999px;
		background: var(--bg);
		box-shadow: var(--shadow-s);
		transition: left 0.12s ease;
	}
	.on .knob {
		left: calc(var(--track) - var(--knob) - var(--gap));
	}
</style>
