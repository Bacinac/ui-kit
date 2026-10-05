// What is standing over what. A dialog can open over a dialog and a photograph
// over both, and one Escape must close the one on top rather than all of them
// at once — so everything that closes on Escape asks here whether it is the one
// on top before it does.

type Layer = { close: () => void };
const stack: Layer[] = [];

export function layer(close: () => void) {
	const me = { close };
	stack.push(me);
	return {
		top: () => stack.at(-1) === me,
		drop: () => {
			const at = stack.indexOf(me);
			if (at >= 0) stack.splice(at, 1);
		}
	};
}

export function dismissLayer(): boolean {
	const top = stack.at(-1);
	if (!top) return false;
	top.close();
	return true;
}
