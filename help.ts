// The help a product explains itself with: hand-written articles on how it
// thinks, the part its code cannot say. Every product keeps them the same way,
// in one directory of its own:
//
//   index.json       — every article in the order the index lists them: its
//                      slug, group, the pages it explains, and its title and
//                      summary in both languages. A product of several apps
//                      (OPUS: Library, Downloads, Player — each its own origin,
//                      so `/settings` is three pages) names its pages per app:
//                      `{"library": ["/tags"], "player": ["/music"]}`.
//   <slug>.hr.md     — the body, in Croatian
//   <slug>.en.md     — the body, in English
//
// What an article says about itself lives in the index and nowhere else, so a
// backend that reads the same articles (DIDA's assistant) reads the same list.
// `articles.mjs` holds a product's articles to this shape in its checks.

import type { Locale } from './i18n.svelte';

export type HelpGroup = 'concepts' | 'operating';

export type HelpEntry = {
	slug: string;
	group: HelpGroup;
	/** the addresses this article explains — the frame's "?" opens it there —
	 * or, in a product of several apps, those addresses per app */
	pages?: string[] | Record<string, string[]>;
	title: Record<Locale, string>;
	summary: Record<Locale, string>;
};

export type HelpArticle = HelpEntry & { body: Record<Locale, string> };

export class Help {
	readonly articles: HelpArticle[];
	private readonly app: string | undefined;

	/** `files` is what `import.meta.glob('<dir>/*.md', { query: '?raw',
	 * import: 'default', eager: true })` hands the product, keyed by path;
	 * `app` is which of the product's apps is asking, where its articles name
	 * their pages per app. */
	constructor(index: HelpEntry[], files: Record<string, string>, app?: string) {
		const bodies = new Map(
			Object.entries(files).map(([path, text]) => [path.slice(path.lastIndexOf('/') + 1), text])
		);
		const body = (slug: string, locale: Locale) => {
			const text = bodies.get(`${slug}.${locale}.md`);
			if (text === undefined) throw new Error(`help: ${slug}.${locale}.md is missing`);
			return text;
		};
		for (const e of index)
			if (e.pages && !Array.isArray(e.pages) && app === undefined)
				throw new Error(`help: ${e.slug} names its pages per app, and no app was given`);
		this.app = app;
		this.articles = index.map((e) => ({ ...e, body: { hr: body(e.slug, 'hr'), en: body(e.slug, 'en') } }));
	}

	private pagesOf(a: HelpEntry): string[] {
		if (!a.pages) return [];
		return Array.isArray(a.pages) ? a.pages : (a.pages[this.app!] ?? []);
	}

	bySlug(slug: string): HelpArticle | undefined {
		return this.articles.find((a) => a.slug === slug);
	}

	/** The article explaining the page at `pathname`: the one naming the
	 * longest address it stands under. */
	forPage(pathname: string): HelpArticle | undefined {
		let best: HelpArticle | undefined;
		let length = -1;
		for (const a of this.articles)
			for (const p of this.pagesOf(a))
				if ((pathname === p || pathname.startsWith(p + '/')) && p.length > length) {
					best = a;
					length = p.length;
				}
		return best;
	}
}

// A deliberately small markdown: the articles are written in the product's own
// repository, never by a user, and this much is all they need — ## and ###
// headings, paragraphs, **bold**, *italic*, `code`, lists (- and 1.), > quotes,
// [links](/help/…) and a --- rule. Everything is escaped BEFORE any markup is
// added, and the markup added is only these fixed tags, so what comes out
// cannot carry anything the text did not.

function esc(s: string): string {
	return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function inline(s: string): string {
	return (
		esc(s)
			// code first, so what is inside backticks stays literal
			.replace(/`([^`]+)`/g, '<code>$1</code>')
			.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text: string, url: string) => {
				// a slip of the pen must not become a javascript: link
				const safe = /^(\/|https?:\/\/|mailto:)/.test(url) ? url : '#';
				const away = safe.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
				return `<a href="${safe}"${away}>${text}</a>`;
			})
			.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
			.replace(/\*([^*\s][^*]*)\*/g, '<em>$1</em>')
	);
}

export function renderMarkdown(md: string): string {
	const html: string[] = [];
	for (const raw of md.trim().split(/\n{2,}/)) {
		const block = raw.trim();
		if (!block) continue;
		const lines = block.split('\n');
		if (block === '---') html.push('<hr />');
		else if (block.startsWith('### ')) html.push(`<h3>${inline(block.slice(4))}</h3>`);
		else if (block.startsWith('## ')) html.push(`<h2>${inline(block.slice(3))}</h2>`);
		else if (lines.every((l) => /^-\s+/.test(l)))
			html.push(`<ul>${lines.map((l) => `<li>${inline(l.replace(/^-\s+/, ''))}</li>`).join('')}</ul>`);
		else if (lines.every((l) => /^\d+\.\s+/.test(l)))
			html.push(`<ol>${lines.map((l) => `<li>${inline(l.replace(/^\d+\.\s+/, ''))}</li>`).join('')}</ol>`);
		else if (lines.every((l) => l.startsWith('>')))
			html.push(`<blockquote>${inline(lines.map((l) => l.replace(/^>\s?/, '')).join(' '))}</blockquote>`);
		else html.push(`<p>${inline(lines.join(' '))}</p>`);
	}
	return html.join('\n');
}
