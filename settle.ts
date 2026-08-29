import { untrack } from 'svelte';

/** Write into `$state` from code an effect calls, without subscribing to what
 * is written.
 *
 * The trap this exists for: an effect calls a method, the method does
 * `into.thing = { ...into.thing, key }` or `if (into[key] !== v) into[key] = v`
 * — and either shape READS the state it is about to write, so the effect now
 * depends on what it changes and re-runs itself into
 * `effect_update_depth_exceeded`. In a production build that error names no
 * component, aborts the flush, and wedges the whole app: the address keeps
 * moving while the page under it is dead. It has done exactly that here twice
 * in one day, the second time an hour after the first was written down —
 * which is why this is a function and not a note.
 *
 * The guard read is untracked, the write is in place, and the return says
 * whether anything actually changed. */
export function settle<T extends object, K extends keyof T>(into: T, key: K, value: T[K]): boolean {
	if (untrack(() => into[key]) === value) return false;
	into[key] = value;
	return true;
}
