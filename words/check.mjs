// Every word a module says, checked rather than remembered.
//
// `registerModule` makes a mistyped literal a build error. What it cannot see is
// the other half of the calls, where the key is BUILT — `t(`video.status.${s}`)`
// naming a vocabulary that arrives from a server. A key with no word behind it
// comes back out of `t()` as the key itself, printed on a screen for as long as
// it takes somebody to notice.
//
// So each built key belongs to a FAMILY, a family names where its members come
// from, and this requires a word in both catalogues for every one of them. A
// screen that builds a key from a family nobody declared fails here rather than
// on the screen. An OPEN family is a vocabulary that is not ours to complete —
// the world's genres — and is checked only for the two languages agreeing.
//
// The core is the package's; each module declares only its families and where
// their members come from. It runs over the whole repository, because half of
// what the screens say is a vocabulary the backend owns.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const LINE = /^\t'([^']+)': '(.*)',$/;

/** The source without what is only said about it: a key a comment mentions is
 *  asked for by nobody. */
const spoken = (said) =>
	said
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');

/** `leftovers` also reads the module for code nothing uses — an export nobody
 *  imports, a component nobody draws — because the words such code alone asks
 *  for would otherwise live on behind it, and counts a word as asked for only
 *  where code asks for it rather than where a comment mentions it. */
export function checkWords({ root, families = {}, leftovers = false }) {
	const problems = [];
	const fail = (said) => problems.push(said);
	const read = (p) => readFileSync(join(root, p), 'utf8');

	function catalogue(path) {
		const words = new Map();
		const lines = read(path).split('\n');
		const open = lines.findIndex((l) => / = \{$/.test(l));
		const close = lines.findIndex((l, i) => i > open && l === '} as const;');
		if (open < 0 || close < 0) {
			fail(`${path}: no catalogue found — has the file's shape changed?`);
			return words;
		}
		for (const [i, line] of lines.slice(open + 1, close).entries()) {
			const said = LINE.exec(line);
			if (!said) {
				fail(`${path}:${open + i + 2}: one word per line, nothing else — "${line.trim()}"`);
				continue;
			}
			if (words.has(said[1])) fail(`${path}: ${said[1]} is said twice`);
			words.set(said[1], said[2]);
		}
		return words;
	}

	const PACKAGE = 'frontend/src/lib/opus';
	const hr = catalogue('frontend/src/lib/i18n/hr.ts');
	const en = catalogue('frontend/src/lib/i18n/en.ts');
	const packHr = catalogue(`${PACKAGE}/words/hr.ts`);
	const packEn = catalogue(`${PACKAGE}/words/en.ts`);

	// ─── the catalogues ──────────────────────────────────────────────────────

	// Croatian is written first and English follows it, key for key and in the
	// same order: two catalogues in different arrangements cannot be read side by
	// side, which is the only way a translation is ever checked by eye.
	function pair(hrName, hrWords, enName, enWords) {
		const hrKeys = [...hrWords.keys()];
		const enKeys = [...enWords.keys()];
		for (const key of hrKeys) if (!enWords.has(key)) fail(`${enName} says nothing for ${key}`);
		for (const key of enKeys)
			if (!hrWords.has(key)) fail(`${hrName} says nothing for ${key} — Croatian is written first`);
		if (hrKeys.length === enKeys.length) {
			const at = hrKeys.findIndex((k, i) => k !== enKeys[i]);
			if (at >= 0)
				fail(`${hrName} and ${enName} part company at #${at + 1}: ${hrKeys[at]} against ${enKeys[at]}`);
		}
		for (const [name, words] of [
			[hrName, hrWords],
			[enName, enWords]
		]) {
			for (const [key, said] of words) if (!said.trim()) fail(`${name}: ${key} is blank`);
		}
		// `plural` asks for one, few and many by name; two of the three is a
		// number that reads correctly until it is 2
		for (const key of hrKeys) {
			const said = /^(.*)\.(one|few|many)$/.exec(key);
			if (!said) continue;
			for (const form of ['one', 'few', 'many'])
				if (!hrWords.has(`${said[1]}.${form}`))
					fail(`${hrName} says nothing for ${said[1]}.${form} — Croatian counts in three`);
		}
	}
	pair('hr.ts', hr, 'en.ts', en);
	pair('words/hr.ts', packHr, 'words/en.ts', packEn);

	const hrKeys = [...hr.keys()];
	// the runtime throws at boot on this; here it is said before the boot
	for (const key of hrKeys)
		if (packHr.has(key)) fail(`${key} is the package's word — a module must not say it again`);

	// ─── what the sources ask for ────────────────────────────────────────────

	function sources(dir, skip) {
		const out = [];
		for (const entry of readdirSync(join(root, dir))) {
			if (skip.includes(entry)) continue;
			const path = join(dir, entry);
			if (statSync(join(root, path)).isDirectory()) out.push(...sources(path, skip));
			else if (/\.(svelte|ts)$/.test(entry)) out.push(path);
		}
		return out;
	}

	const own = sources('frontend/src', ['opus', 'node_modules', 'i18n']).map((p) => [
		p,
		leftovers ? spoken(read(p)) : read(p)
	]);
	const theirs = sources(PACKAGE, ['words', 'node_modules']).map((p) => [p, read(p)]);

	const quoted = new Set();
	for (const [, said] of own)
		for (const [, key] of said.matchAll(/['"`]([a-z][\w]*(?:\.[\w]+)+)['"`]/gi)) quoted.add(key);

	const builtIn = (files) => {
		const found = new Map();
		for (const [path, said] of files) {
			for (const [, prefix] of said.matchAll(/`([a-zA-Z][\w.]*)\.\$\{/g)) {
				if (!found.has(prefix)) found.set(prefix, new Set());
				found.get(prefix).add(relative('frontend/src', path));
			}
		}
		return found;
	};
	const builtHere = builtIn(own);
	const builtThere = builtIn(theirs);

	for (const [path, said] of own) {
		for (const [, key] of said.matchAll(/\bt\(\s*'([^']+)'/g))
			if (!hr.has(key) && !packHr.has(key))
				fail(`${relative('frontend/src', path)} asks for ${key}, and nothing says it`);
		for (const [built] of said.matchAll(/`\$\{[^}]*\}\.[\w.]*\$\{/g))
			fail(`${relative('frontend/src', path)} builds a key that starts with a variable (${built}) — no family can say what it is`);
	}

	// ─── the families ────────────────────────────────────────────────────────

	const declared = new Set();
	for (const [prefix, where] of builtHere)
		if (!families[prefix])
			fail(`${[...where].join(', ')} builds ${prefix}.* and no family says what those can be`);
	// the package builds some keys on the module's behalf — a field's label, a
	// reason a setting was refused — and the words for those are the module's
	for (const [prefix, where] of builtThere)
		if (!families[prefix] && hrKeys.some((k) => k.startsWith(`${prefix}.`)))
			fail(`${[...where].join(', ')} builds ${prefix}.* for this module, and no family says what those can be`);

	for (const [prefix, family] of Object.entries(families)) {
		if (!builtHere.has(prefix) && !builtThere.has(prefix))
			fail(`the family ${prefix} is declared and nothing builds it — it keeps dead words alive`);
		if (family.open) {
			for (const key of hrKeys) if (key.startsWith(`${prefix}.`)) declared.add(key);
			continue;
		}
		const members = family.members();
		if (!members.length) fail(`${prefix}: ${family.where} yielded nothing — the source has moved`);
		for (const member of new Set(members)) {
			const key = `${prefix}.${member}`;
			declared.add(key);
			if (packHr.has(key)) continue;
			if (!hr.has(key)) fail(`hr.ts says nothing for ${key} (${family.where})`);
			if (!en.has(key)) fail(`en.ts says nothing for ${key} (${family.where})`);
		}
	}

	// ─── nothing left behind ─────────────────────────────────────────────────

	// A word nobody asks for is either a typo or the last trace of a screen that
	// was deleted, and either is worth one line here.
	for (const key of hrKeys) {
		if (quoted.has(key) || declared.has(key)) continue;
		const plural = /^(.*)\.(one|few|many)$/.exec(key);
		if (plural && quoted.has(`${plural[1]}.one`)) continue;
		fail(`nothing asks for ${key} — a typo in the catalogue, or a word its screen took with it`);
	}

	// ─── nor code nothing uses ───────────────────────────────────────────────

	if (leftovers) {
		const lib = own.filter(([p]) => p.includes('/lib/'));
		for (const [path, said] of lib.filter(([p]) => p.endsWith('.ts'))) {
			for (const [, name] of said.matchAll(/^export (?:async )?(?:function|const|let|class) (\w+)/gm)) {
				const word = new RegExp(`\\b${name}\\b`, 'g');
				const elsewhere = own.some(([other, text]) => other !== path && word.test(text));
				if (!elsewhere && (said.match(word) ?? []).length < 2)
					fail(`${relative('frontend/src', path)} exports ${name}, and nothing uses it`);
			}
		}
		for (const [path] of lib.filter(([p]) => p.endsWith('.svelte'))) {
			const file = path.split('/').pop();
			if (!own.some(([, text]) => text.includes(`/${file}'`)))
				fail(`${relative('frontend/src', path)} is drawn by nothing`);
		}
	}

	return { problems, words: hrKeys.length, families: Object.keys(families).length };
}

/** A family's members read out of a source file: every quoted string inside the
 *  first thing the pattern captures. */
export function quotedIn(root, path, pattern) {
	const said = pattern.exec(readFileSync(join(root, path), 'utf8'));
	return said ? [...said[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]) : [];
}

export function report({ problems, words, families }) {
	if (problems.length) {
		for (const said of problems) console.error(`  ${said}`);
		console.error(`\nwords: ${problems.length} ${problems.length === 1 ? 'problem' : 'problems'}.`);
		process.exit(1);
	}
	console.log(`words: ${words} in two languages, ${families} families checked against their sources.`);
}
