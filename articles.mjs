// A product's articles held to the shape `help.ts` reads (see there): every
// entry of index.json whole in both languages, a body for each, no body the
// index does not list, every link between articles leading to one, and — given
// the product's source — every Hint's article real and every page an article
// names a route that exists. What the app would otherwise meet at boot, or as a
// dead link, fails here.
//
// `node articles.mjs <help dir> [<src>]` lists what is wrong and fails. A
// product of several apps names every app, each with its source where this
// checkout has it: `node articles.mjs <help dir> library=src downloads player`.
// Its pages are then named per app, and only the apps given a source have
// their routes and Hints read — each app's own check covers its own.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const LOCALES = ['hr', 'en'];
const GROUPS = ['concepts', 'operating'];
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

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

/** Whether SvelteKit serves `page` from `routes`: a (group) directory is
 * walked through, a [param] directory takes any segment. */
export function routed(routes, page) {
	const walk = (dir, rest) => {
		if (!existsSync(dir) || !statSync(dir).isDirectory()) return false;
		const dirs = readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory());
		if (rest.length === 0 && existsSync(join(dir, '+page.svelte'))) return true;
		for (const e of dirs) {
			if (e.name.startsWith('(') && walk(join(dir, e.name), rest)) return true;
		}
		if (rest.length === 0) return false;
		const [head, ...tail] = rest;
		return dirs.some(
			(e) => (e.name === head || /^\[[^\]]+\]$/.test(e.name)) && walk(join(dir, e.name), tail)
		);
	};
	return walk(routes, page.split('/').filter(Boolean));
}

/** `src` is the product's source, or — for a product of several apps — each
 * app's name mapped to its source, or to null where the checkout has none. */
export function checkHelp(dir, src) {
	const apps = src !== null && typeof src === 'object' ? src : null;
	const sources = apps ? Object.values(apps).filter(Boolean) : src ? [src] : [];
	const off = [];
	let index;
	try {
		index = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8'));
	} catch (e) {
		return [`index.json: ${e.message}`];
	}
	if (!Array.isArray(index)) return ['index.json: not a list of articles'];

	const slugs = new Set();
	const pages = new Map();
	for (const [i, e] of index.entries()) {
		const at = `index.json[${i}]${e?.slug ? ` (${e.slug})` : ''}`;
		if (typeof e?.slug !== 'string' || !SLUG.test(e.slug)) off.push(`${at}: slug is not lower-case-with-dashes`);
		else if (slugs.has(e.slug)) off.push(`${at}: slug said twice`);
		else slugs.add(e.slug);
		if (!GROUPS.includes(e?.group)) off.push(`${at}: group is not one of ${GROUPS.join(', ')}`);
		for (const field of ['title', 'summary'])
			for (const l of LOCALES)
				if (typeof e?.[field]?.[l] !== 'string' || !e[field][l].trim()) off.push(`${at}: no ${field}.${l}`);
		let listed = [];
		if (Array.isArray(e?.pages)) {
			if (apps) off.push(`${at}: pages are not named per app (${Object.keys(apps).join(', ')})`);
			listed = [[null, e.pages]];
		} else if (e?.pages && typeof e.pages === 'object') {
			if (!apps && src) off.push(`${at}: pages are named per app, and the product is one`);
			listed = Object.entries(e.pages);
		} else if (e?.pages !== undefined) off.push(`${at}: pages are neither a list nor a list per app`);
		for (const [app, list] of listed) {
			if (app !== null && apps && !(app in apps)) {
				off.push(`${at}: ${app} is not an app of the product`);
				continue;
			}
			if (!Array.isArray(list)) {
				off.push(`${at}: pages${app ? ` of ${app}` : ''} are not a list`);
				continue;
			}
			const root = app === null ? src : apps?.[app];
			const where = app === null ? '' : `${app} `;
			for (const p of list) {
				if (typeof p !== 'string' || !p.startsWith('/')) {
					off.push(`${at}: page ${JSON.stringify(p)} is not an address`);
					continue;
				}
				if (pages.has(where + p)) off.push(`${at}: page ${where}${p} is already explained by ${pages.get(where + p)}`);
				else pages.set(where + p, e.slug);
				if (typeof root === 'string' && !routed(join(root, 'routes'), p)) off.push(`${at}: no route serves ${where}${p}`);
			}
		}
	}

	const files = readdirSync(dir).filter((f) => f !== 'index.json');
	for (const f of files) {
		const m = /^(.+)\.(hr|en)\.md$/.exec(f);
		if (!m) off.push(`${f}: neither index.json nor <slug>.<hr|en>.md`);
		else if (!slugs.has(m[1])) off.push(`${f}: index.json lists no article ${m[1]}`);
	}
	for (const slug of slugs)
		for (const l of LOCALES) {
			const f = `${slug}.${l}.md`;
			if (!files.includes(f)) {
				off.push(`${f}: missing`);
				continue;
			}
			const body = readFileSync(join(dir, f), 'utf8');
			if (!body.trim()) off.push(`${f}: empty`);
			for (const [, to] of body.matchAll(/\]\(\/help\/([^)#\s]+)\)/g))
				if (!slugs.has(to)) off.push(`${f}: links to /help/${to}, which is no article`);
		}

	for (const root of sources)
		for (const path of svelteFiles(root)) {
			const source = readFileSync(path, 'utf8');
			for (const [, to] of source.matchAll(/<Hint\b[^>]*\barticle="([^"]+)"/g))
				if (!slugs.has(to)) off.push(`${relative(process.cwd(), path)}: Hint leads to ${to}, which is no article`);
		}
	return off;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const [dir, ...rest] = process.argv.slice(2);
	const apps = rest.some((a) => a.includes('='))
		? Object.fromEntries(rest.map((a) => [a.split('=')[0], a.includes('=') ? a.slice(a.indexOf('=') + 1) : null]))
		: null;
	const off = checkHelp(dir, apps ?? rest[0]);
	if (off.length) {
		console.error(off.join('\n'));
		process.exit(1);
	}
	console.log('help: every article whole in both languages, every way into one leads somewhere');
}
