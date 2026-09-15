// The alphabet a shelf is read in, and the letter a name files under.
//
// Not the reader's language: which letter follows which is a property of the
// names on the shelf, and they are Croatian whoever is looking at them. The
// three digraphs are single letters — Ljubav files under Lj, after L and
// before M — and a letter a foreign name brought with it files under the
// letter beneath its accent. Player's catalogue orders its shelves by this same
// rule on the server; Library sorts its wall here. One alphabet, so a letter in
// the rail always has a card under it.

const ALPHABET = [
	'a', 'b', 'c', 'č', 'ć', 'd', 'dž', 'đ', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
	'l', 'lj', 'm', 'n', 'nj', 'o', 'p', 'q', 'r', 's', 'š', 't', 'u', 'v', 'w',
	'x', 'y', 'z', 'ž'
] as const;
const RANK = new Map<string, number>(ALPHABET.map((letter, place) => [letter, place]));
const DIGRAPHS = new Set(['dž', 'lj', 'nj']);

// what sits either side of the alphabet: punctuation first, numbers next, the
// letters, and a script this alphabet has no place for after all of them
const MARK = -2;
const DIGIT = -1;
const FOREIGN = ALPHABET.length;

/** What a name files under: a rail's worth of letter, capitalised the way a
 *  digraph is written — `Lj`, not `LJ`. Digits and punctuation file under `#`,
 *  a script the alphabet does not hold under `?`. */
export function initialOf(name: string): string {
	const text = (name ?? '').trim().normalize('NFC');
	if (!text) return '#';
	const first = text[0];
	if (/\d/.test(first)) return '#';
	const lowered = text.slice(0, 2).toLocaleLowerCase('hr');
	if (DIGRAPHS.has(lowered)) return lowered[0].toLocaleUpperCase('hr') + lowered[1];
	const letter = lowered[0];
	if (RANK.has(letter)) return letter.toLocaleUpperCase('hr');
	const stripped = letter.normalize('NFD')[0];
	if (RANK.has(stripped)) return stripped.toLocaleUpperCase('hr');
	return /\p{L}|\p{N}/u.test(letter) ? '?' : '#';
}

type Piece = [rank: number, text: string];

function key(text: string): Piece[] {
	const lowered = (text ?? '').normalize('NFC').toLocaleLowerCase('hr');
	const out: Piece[] = [];
	let at = 0;
	while (at < lowered.length) {
		const letter = lowered[at];
		if (/\d/.test(letter)) {
			let run = at;
			while (run < lowered.length && /\d/.test(lowered[run])) run += 1;
			// a number is a number, not a row of characters: 300 files before
			// 1917 — padded so that comparing the text compares the value
			out.push([DIGIT, lowered.slice(at, run).padStart(20, '0')]);
			at = run;
			continue;
		}
		const pair = lowered.slice(at, at + 2);
		if (DIGRAPHS.has(pair)) {
			out.push([RANK.get(pair)!, pair]);
			at += 2;
			continue;
		}
		at += 1;
		const rank = RANK.get(letter);
		if (rank !== undefined) {
			out.push([rank, letter]);
			continue;
		}
		const stripped = letter.normalize('NFD')[0];
		const under = RANK.get(stripped);
		if (under !== undefined) out.push([under, letter]);
		else if (/\p{L}|\p{N}/u.test(letter)) out.push([FOREIGN, letter]);
		else out.push([MARK, letter]);
	}
	return out;
}

/** The order the alphabet above puts two names in. */
export function compareHr(a: string, b: string): number {
	const ka = key(a);
	const kb = key(b);
	const n = Math.min(ka.length, kb.length);
	for (let i = 0; i < n; i += 1) {
		if (ka[i][0] !== kb[i][0]) return ka[i][0] - kb[i][0];
		if (ka[i][1] !== kb[i][1]) return ka[i][1] < kb[i][1] ? -1 : 1;
	}
	return ka.length - kb.length;
}

/** The letters a list of names files under, each once, in the list's own
 *  order — so a rail beside a wall reads the way the wall does, whichever way
 *  round the wall is turned. */
export function lettersOf(names: readonly string[]): string[] {
	const out: string[] = [];
	for (const name of names) {
		const letter = initialOf(name);
		if (out[out.length - 1] !== letter) out.push(letter);
	}
	return out;
}
