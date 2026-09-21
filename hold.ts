import type { Action } from 'svelte/action';

const HOLD_MS = 550;
const DRIFT_PX = 10;

/**
 * What a line offers besides its obvious use, asked for by keeping a finger or
 * the mouse on it, or by the secondary button. The press that ends a hold is not
 * also a click, so holding the name of an episode does not play it.
 */
export const hold: Action<HTMLElement, (() => void) | undefined> = (node, handler) => {
	let fire = handler;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let start: { x: number; y: number } | null = null;
	let held = false;

	const cancel = () => {
		clearTimeout(timer);
		timer = undefined;
		start = null;
	};
	const down = (event: PointerEvent) => {
		if (!fire || event.button !== 0) return;
		held = false;
		start = { x: event.clientX, y: event.clientY };
		timer = setTimeout(() => {
			held = true;
			cancel();
			fire?.();
		}, HOLD_MS);
	};
	const move = (event: PointerEvent) => {
		if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > DRIFT_PX) cancel();
	};
	const click = (event: MouseEvent) => {
		if (!held) return;
		held = false;
		event.preventDefault();
		event.stopPropagation();
	};
	const menu = (event: MouseEvent) => {
		if (!fire) return;
		event.preventDefault();
		cancel();
		fire();
	};

	node.addEventListener('pointerdown', down);
	node.addEventListener('pointermove', move);
	node.addEventListener('pointerup', cancel);
	node.addEventListener('pointercancel', cancel);
	node.addEventListener('pointerleave', cancel);
	node.addEventListener('click', click, true);
	node.addEventListener('contextmenu', menu);
	return {
		update(next) {
			fire = next;
		},
		destroy() {
			cancel();
			node.removeEventListener('pointerdown', down);
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerup', cancel);
			node.removeEventListener('pointercancel', cancel);
			node.removeEventListener('pointerleave', cancel);
			node.removeEventListener('click', click, true);
			node.removeEventListener('contextmenu', menu);
		}
	};
};
