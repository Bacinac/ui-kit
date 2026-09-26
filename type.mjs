// A size of text is one of the seven steps in tokens.css. A size written out
// below the top of the scale is one an eye cannot tell from its neighbour, and
// each one invites the next; from 2rem up it is a glyph fitted to its box, not
// text, and may say its size. A product that carries the scale in Tailwind maps
// text-2xs … text-2xl onto the steps and removes Tailwind's in-between names,
// so those are refused too.
//
// `node type.mjs <dir>` lists every size off the scale and fails.

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const BETWEEN = /(?:^|[\s"'`{:])(text-(?:sm|base|lg|3xl))\b/g;
const WRITTEN = /text-\[[^\]]*\]|font-size:[^;"}]*/g;
const LENGTH = /(\d*\.?\d+)(rem|px)/g;

const text = (n, unit) => (unit === 'rem' ? n < 2 : n < 32);

export function offScale(source) {
	const found = [];
	source.split('\n').forEach((line, i) => {
		for (const m of line.matchAll(BETWEEN)) found.push({ line: i + 1, size: m[1] });
		for (const [written] of line.matchAll(WRITTEN)) {
			if ([...written.matchAll(LENGTH)].some(([, n, unit]) => text(Number(n), unit))) {
				found.push({ line: i + 1, size: written.trim() });
			}
		}
	});
	return found;
}

function* sources(dir) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name !== 'node_modules') yield* sources(path);
		} else if (/\.(svelte|ts|css)$/.test(entry.name)) {
			yield path;
		}
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const root = process.argv[2] ?? 'src';
	const off = [];
	for (const path of sources(root)) {
		for (const { line, size } of offScale(readFileSync(path, 'utf8'))) {
			off.push(`${relative(process.cwd(), path)}:${line}: ${size}`);
		}
	}
	if (off.length) {
		console.error(off.join('\n'));
		console.error("a text size off the kit's scale; use a step: var(--fs-*), or text-2xs … text-2xl");
		process.exit(1);
	}
	console.log('type: every size on the scale');
}
