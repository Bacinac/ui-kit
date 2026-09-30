import { describe, expect, it } from 'vitest';
import { Help, renderMarkdown, type HelpEntry } from './help';

const entry = (slug: string, pages?: HelpEntry['pages']): HelpEntry => ({
	slug,
	group: 'concepts',
	pages,
	title: { hr: slug, en: slug },
	summary: { hr: '', en: '' }
});
const files = (...slugs: string[]) =>
	Object.fromEntries(slugs.flatMap((s) => [[`./x/${s}.hr.md`, `hr ${s}`], [`./x/${s}.en.md`, `en ${s}`]]));

describe('Help', () => {
	it('pairs every entry with its bodies, keyed by file name', () => {
		const help = new Help([entry('zones')], files('zones'));
		expect(help.bySlug('zones')?.body).toEqual({ hr: 'hr zones', en: 'en zones' });
		expect(help.bySlug('rules')).toBeUndefined();
	});

	it('fails at once on a body that is not there', () => {
		expect(() => new Help([entry('zones')], { './x/zones.hr.md': '' })).toThrow('zones.en.md');
	});

	it('finds the article of the longest address a page stands under', () => {
		const help = new Help(
			[entry('home', ['/']), entry('settings', ['/settings']), entry('zones', ['/settings/zones'])],
			files('home', 'settings', 'zones')
		);
		expect(help.forPage('/')?.slug).toBe('home');
		expect(help.forPage('/settings/users')?.slug).toBe('settings');
		expect(help.forPage('/settings/zones/3')?.slug).toBe('zones');
		expect(help.forPage('/settingsx')).toBeUndefined();
		expect(help.forPage('/cameras')).toBeUndefined();
	});

	it('reads the pages of the app asking, in a product of several', () => {
		const index = [
			entry('library', { library: ['/settings'] }),
			entry('house', { player: ['/settings/house'] }),
			entry('home', { player: ['/settings'] })
		];
		const player = new Help(index, files('library', 'house', 'home'), 'player');
		expect(player.forPage('/settings')?.slug).toBe('home');
		expect(player.forPage('/settings/house')?.slug).toBe('house');
		expect(new Help(index, files('library', 'house', 'home'), 'library').forPage('/settings/house')?.slug).toBe(
			'library'
		);
		expect(new Help(index, files('library', 'house', 'home'), 'downloads').forPage('/settings')).toBeUndefined();
		expect(() => new Help(index, files('library', 'house', 'home'))).toThrow('no app was given');
	});
});

describe('renderMarkdown', () => {
	it('draws the small markdown the articles are written in', () => {
		expect(renderMarkdown('## A\n\n- **b** `c`\n- [d](/help/e)\n\n1. f\n\n> g\n\n---\n\nh *j*\ni')).toBe(
			[
				'<h2>A</h2>',
				'<ul><li><strong>b</strong> <code>c</code></li><li><a href="/help/e">d</a></li></ul>',
				'<ol><li>f</li></ol>',
				'<blockquote>g</blockquote>',
				'<hr />',
				'<p>h <em>j</em> i</p>'
			].join('\n')
		);
	});

	it('lets nothing through that the text carried', () => {
		expect(renderMarkdown('<img src=x onerror=a()> [x](javascript:alert) [y](https://e.x)')).toBe(
			'<p>&lt;img src=x onerror=a()&gt; <a href="#">x</a> <a href="https://e.x" target="_blank" rel="noopener">y</a></p>'
		);
		expect(renderMarkdown('[x](/a" onclick="b)')).toBe('<p><a href="/a&quot; onclick=&quot;b">x</a></p>');
	});
});
