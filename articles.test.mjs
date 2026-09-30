import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkHelp, routed } from './articles.mjs';

const both = (hr, en) => ({ hr, en });
const entry = (slug, extra = {}) => ({
	slug,
	group: 'concepts',
	title: both('Naslov', 'Title'),
	summary: both('Sažetak', 'Summary'),
	...extra
});

function tree(files) {
	const root = mkdtempSync(join(tmpdir(), 'help-'));
	for (const [path, text] of Object.entries(files)) {
		mkdirSync(join(root, path, '..'), { recursive: true });
		writeFileSync(join(root, path), text);
	}
	return root;
}

test('a whole article in both languages passes', () => {
	const root = tree({
		'help/index.json': JSON.stringify([entry('zones'), entry('rules')]),
		'help/zones.hr.md': 'Vidi [pravila](/help/rules).',
		'help/zones.en.md': 'See [rules](/help/rules).',
		'help/rules.hr.md': 'x',
		'help/rules.en.md': 'x'
	});
	assert.deepEqual(checkHelp(join(root, 'help')), []);
});

test('a missing body, a stray one and a dead link are each said', () => {
	const root = tree({
		'help/index.json': JSON.stringify([entry('zones')]),
		'help/zones.hr.md': 'Vidi [pravila](/help/rules).',
		'help/old.en.md': 'x',
		'help/notes.txt': 'x'
	});
	const off = checkHelp(join(root, 'help'));
	assert.ok(off.some((o) => o.startsWith('zones.en.md: missing')));
	assert.ok(off.some((o) => o.startsWith('old.en.md: index.json lists no article')));
	assert.ok(off.some((o) => o.startsWith('notes.txt:')));
	assert.ok(off.some((o) => o.includes('links to /help/rules')));
});

test('an entry is whole: slug, group, both titles and summaries, one article per page', () => {
	const root = tree({
		'help/index.json': JSON.stringify([
			entry('Zones', { group: 'other' }),
			{ ...entry('rules'), title: { hr: 'Pravila' } },
			entry('a', { pages: ['/x'] }),
			entry('b', { pages: ['/x', 'y'] })
		]),
		'help/rules.hr.md': 'x',
		'help/rules.en.md': 'x',
		'help/a.hr.md': 'x',
		'help/a.en.md': 'x',
		'help/b.hr.md': 'x',
		'help/b.en.md': 'x'
	});
	const off = checkHelp(join(root, 'help'));
	assert.ok(off.some((o) => o.includes('(Zones): slug')));
	assert.ok(off.some((o) => o.includes('(Zones): group')));
	assert.ok(off.some((o) => o.includes('(rules): no title.en')));
	assert.ok(off.some((o) => o.includes('page /x is already explained by a')));
	assert.ok(off.some((o) => o.includes('page "y" is not an address')));
});

test('with the source: every Hint leads to an article, every page is a route', () => {
	const root = tree({
		'help/index.json': JSON.stringify([entry('zones', { pages: ['/cameras', '/settings/zones', '/gone'] })]),
		'help/zones.hr.md': 'x',
		'help/zones.en.md': 'x',
		'src/routes/(app)/cameras/+page.svelte': '',
		'src/routes/settings/[tab]/+page.svelte': '',
		'src/lib/A.svelte': '<Hint text={t("a")} article="zones" />\n<Hint text={t("b")} article="rules" />'
	});
	const off = checkHelp(join(root, 'help'), join(root, 'src'));
	assert.deepEqual(
		off.map((o) => o.replace(/^.*?(Hint|no route)/, '$1')),
		['no route serves /gone', 'Hint leads to rules, which is no article']
	);
});

test('a product of several apps names its pages per app, each read against its own routes', () => {
	const root = tree({
		'help/index.json': JSON.stringify([
			entry('shelf', { pages: { library: ['/tags', '/gone'], player: ['/music'] } }),
			entry('house', { pages: { player: ['/settings'], library: ['/settings'] } }),
			entry('flat', { pages: ['/x'] }),
			entry('stray', { pages: { radio: ['/y'] } })
		]),
		...Object.fromEntries(
			['shelf', 'house', 'flat', 'stray'].flatMap((s) => [
				[`help/${s}.hr.md`, 'x'],
				[`help/${s}.en.md`, 'x']
			])
		),
		'library/routes/tags/+page.svelte': '',
		'library/routes/settings/+page.svelte': '',
		'library/lib/A.svelte': '<Hint text={t("a")} article="none" />'
	});
	const off = checkHelp(join(root, 'help'), { library: join(root, 'library'), player: null });
	assert.deepEqual(
		off.map((o) => o.replace(/^.*?(Hint|index)/, '$1')),
		[
			'index.json[0] (shelf): no route serves library /gone',
			'index.json[2] (flat): pages are not named per app (library, player)',
			'index.json[3] (stray): radio is not an app of the product',
			'Hint leads to none, which is no article'
		]
	);
	const one = checkHelp(join(root, 'help'), join(root, 'library'));
	assert.ok(one.some((o) => o.includes('(shelf): pages are named per app, and the product is one')));
});

test('a route is found through groups and params, and only where a page is', () => {
	const root = tree({
		'routes/(app)/+page.svelte': '',
		'routes/(app)/devices/[id]/+page.svelte': '',
		'routes/help/+layout.svelte': ''
	});
	const r = join(root, 'routes');
	assert.equal(routed(r, '/'), true);
	assert.equal(routed(r, '/devices/7'), true);
	assert.equal(routed(r, '/devices'), false);
	assert.equal(routed(r, '/help'), false);
});
