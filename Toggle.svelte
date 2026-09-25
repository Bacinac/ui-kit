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
	<span class="knob"></span>
</button>

<style>
	/* The knob's travel is the track less the knob and both gaps, worked out
	   from the same three lengths, so the two sizes cannot drift apart. */
	.switch {
		--track: 2.75rem;
		--knob: 1.25rem;
		--gap: 0.125rem;
		position: relative;
		flex: none;
		width: var(--track);
		height: calc(var(--knob) + 2 * var(--gap));
		padding: 0;
		border: none;
		border-radius: 999px;
		background: var(--border);
		cursor: pointer;
		transition: background 0.12s ease;
	}
	.small {
		--track: 2.25rem;
		--knob: 1rem;
	}
	.on {
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
		background: #fff;
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.3);
		transition: left 0.12s ease;
	}
	.on .knob {
		left: calc(var(--track) - var(--knob) - var(--gap));
	}
</style>
