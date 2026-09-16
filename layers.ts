// What is standing over what. A dialog can open over a dialog and a photograph
// over both, and one Escape must close the one on top rather than all of them
// at once — so everything that closes on Escape asks here whether it is the one
// on top before it does.

const stack: symbol[] = [];

export function layer() {
	const me = Symbol();
	stack.push(me);
	return {
		top: () => stack.at(-1) === me,
		drop: () => {
			const at = stack.indexOf(me);
			if (at >= 0) stack.splice(at, 1);
		}
	};
}
