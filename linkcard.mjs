// A public demo is a single-page app: every address answers with the same
// index.html, and the head the page fills in later is never seen by what reads
// a shared link — it does not run the page. So the card a link shows on
// Mastodon, LinkedIn or in a message is written into the built index.html,
// with the product's picture beside it as og.png.
//
// `node linkcard.mjs <site> <origin> <picture.png> <title> <description>`

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const attribute = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

export function pngSize(bytes) {
	if (bytes.length < 24 || bytes.readUInt32BE(0) !== 0x89504e47 || bytes.toString('ascii', 12, 16) !== 'IHDR') {
		throw new Error('the picture is not a PNG');
	}
	return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

export function withCard(html, { origin, title, description, width, height }) {
	if (!html.includes('</head>')) throw new Error('the page has no </head> to write the card into');
	if (html.includes('property="og:')) throw new Error('the page already carries a link card');
	const tags = [
		['name', 'description', description],
		['property', 'og:type', 'website'],
		['property', 'og:url', `${origin}/`],
		['property', 'og:title', title],
		['property', 'og:description', description],
		['property', 'og:image', `${origin}/og.png`],
		['property', 'og:image:width', String(width)],
		['property', 'og:image:height', String(height)],
		['name', 'twitter:card', 'summary_large_image'],
	];
	const card = tags.map(([key, name, value]) => `<meta ${key}="${name}" content="${attribute(value)}" />\n`).join('');
	return html.replace('</head>', `${card}</head>`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const [site, origin, picture, title, description] = process.argv.slice(2);
	if (!description) {
		console.error('usage: node linkcard.mjs <site> <origin> <picture.png> <title> <description>');
		process.exit(2);
	}
	if (!/^https?:\/\/[^/]+$/.test(origin)) {
		console.error(`linkcard: the origin is scheme and host only, without a path: ${origin}`);
		process.exit(2);
	}
	const bytes = readFileSync(picture);
	const page = join(site, 'index.html');
	const html = withCard(readFileSync(page, 'utf8'), { origin, title, description, ...pngSize(bytes) });
	writeFileSync(page, html);
	if (existsSync(`${page}.gz`)) writeFileSync(`${page}.gz`, gzipSync(html, { level: 9 }));
	if (existsSync(`${page}.br`)) writeFileSync(`${page}.br`, brotliCompressSync(html));
	copyFileSync(picture, join(site, 'og.png'));
	console.log(`linkcard: ${origin} — ${title}`);
}
