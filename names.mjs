// Every button, link and clicked element has a name a screen reader can say.
// A face of words names itself; a face that is only a sign (an Icon, an svg, a
// picture with an empty alt, a glyph) needs aria-label, or `label` on a
// component that hands it on. `title` is not a name: it is a tooltip no remote
// and no phone shows. The Svelte compiler asks this too, but it takes any
// component or any <img alt> for words, which is exactly the face of an icon
// button here.
//
// Read from the parsed tree, not the text: `node names.mjs <dir>` lists every
// unnamed one and fails.

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'svelte/compiler';

const WORD = /[\p{L}\p{N}]/u;
const LABELLED = new Set(['Button', 'ArmedButton']);

const attribute = (node, name) =>
	node.attributes?.find((a) => a.type === 'Attribute' && a.name === name);

function said(value) {
	if (value === true || value === undefined) return false;
	const parts = Array.isArray(value) ? value : [value];
	return parts.some((p) => p.type === 'ExpressionTag' || WORD.test(p.data ?? ''));
}

function named(node) {
	if (node.attributes?.some((a) => a.type === 'SpreadAttribute')) return true;
	return ['aria-label', 'aria-labelledby', ...(node.type === 'Component' ? ['label'] : [])].some(
		(name) => said(attribute(node, name)?.value)
	);
}

function worded(fragment) {
	return (fragment?.nodes ?? []).some(words);
}

function words(node) {
	switch (node.type) {
		case 'Text':
			return WORD.test(node.data);
		case 'ExpressionTag':
			return node.expression.type !== 'Literal' || WORD.test(String(node.expression.value));
		case 'RenderTag':
		case 'AwaitBlock':
			return true;
		case 'IfBlock':
			return worded(node.consequent) && !!node.alternate && worded(node.alternate);
		case 'EachBlock':
			return worded(node.body);
		case 'KeyBlock':
			return worded(node.fragment);
		case 'RegularElement':
			if (node.name === 'img') return said(attribute(node, 'alt')?.value);
			if (node.name === 'svg') return false;
			return named(node) || worded(node.fragment);
		case 'Component':
			if (node.name === 'Icon') return false;
			return node.fragment.nodes.length === 0 || worded(node.fragment);
		default:
			return false;
	}
}

function clicked(node) {
	if (node.type === 'RegularElement') {
		if (node.name === 'button') return true;
		if (node.name === 'a' && attribute(node, 'href')) return true;
	}
	if (node.type === 'Component' && LABELLED.has(node.name)) return true;
	return (
		(node.type === 'RegularElement' || node.type === 'Component') &&
		(!!attribute(node, 'onclick') ||
			node.attributes.some((a) => a.type === 'OnDirective' && a.name === 'click'))
	);
}

function children(node) {
	return [
		node.fragment,
		node.consequent,
		node.alternate,
		node.body,
		node.fallback,
		node.pending,
		node.then,
		node.catch
	].filter(Boolean);
}

export function unnamed(source) {
	const found = [];
	const visit = (fragment) => {
		for (const node of fragment?.nodes ?? []) {
			if (clicked(node) && !named(node)) {
				// a component with nothing inside draws its own face, and is read in its own file
				const face =
					node.name === 'img'
						? said(attribute(node, 'alt')?.value)
						: (node.type === 'Component' && node.fragment.nodes.length === 0) || worded(node.fragment);
				if (!face) found.push({ name: node.name, line: source.slice(0, node.start).split('\n').length });
			}
			children(node).forEach(visit);
		}
	};
	visit(parse(source, { modern: true }).fragment);
	return found;
}

function* svelteFiles(dir) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name !== 'node_modules') yield* svelteFiles(path);
		} else if (entry.name.endsWith('.svelte')) {
			yield path;
		}
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const root = process.argv[2] ?? 'src';
	const off = [];
	for (const path of svelteFiles(root)) {
		for (const { name, line } of unnamed(readFileSync(path, 'utf8'))) {
			off.push(`${relative(process.cwd(), path)}:${line}: <${name}> has no name to say`);
		}
	}
	if (off.length) {
		console.error(off.join('\n'));
		console.error('a button whose face is a sign takes aria-label (label= on Button), in words from i18n');
		process.exit(1);
	}
	console.log('names: every button says what it is');
}
