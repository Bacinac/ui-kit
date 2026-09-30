<script lang="ts">
	// One article. `after` is what a product adds under it — DIDA's way on to
	// its assistant — and is handed the article it stands under.

	import type { Snippet } from 'svelte';
	import { i18n, t } from './i18n.svelte';
	import Notice from './Notice.svelte';
	import { renderMarkdown, type Help, type HelpArticle } from './help';

	let { help, slug, after }: { help: Help; slug: string; after?: Snippet<[HelpArticle]> } =
		$props();

	const article = $derived(help.bySlug(slug));
	// the product's own articles through the renderer that escapes before it
	// adds a tag, so nothing but its fixed tags can come out
	const html = $derived(article ? renderMarkdown(article.body[i18n.locale]) : '');
</script>

<article>
	<a class="back" href="/help">← {t('help.title')}</a>
	{#if article}
		<h1>{article.title[i18n.locale]}</h1>
		<div class="body">{@html html}</div>
		{@render after?.(article)}
	{:else}
		<Notice tone="warn">{t('help.notFound')}</Notice>
	{/if}
</article>

<style>
	article {
		display: grid;
		gap: 1rem;
		max-width: 44rem;
	}
	.back {
		justify-self: start;
		font-size: var(--fs-s);
		color: var(--muted);
		text-decoration: none;
	}
	.back:hover {
		color: var(--accent);
	}
	h1 {
		margin: 0;
		font-size: var(--fs-2xl);
		font-weight: 600;
		line-height: 1.25;
	}
	.body {
		font-size: var(--fs-l);
		line-height: 1.6;
		color: var(--text);
	}
	.body :global(h2) {
		margin: 2rem 0 0.75rem;
		font-size: var(--fs-xl);
		font-weight: 600;
		line-height: 1.25;
	}
	.body :global(h3) {
		margin: 1.5rem 0 0.5rem;
		font-size: var(--fs-l);
		font-weight: 600;
		line-height: 1.25;
	}
	.body :global(p),
	.body :global(ul),
	.body :global(ol),
	.body :global(blockquote) {
		margin: 0.75rem 0;
	}
	.body :global(ul),
	.body :global(ol) {
		display: grid;
		gap: 0.25rem;
		padding-left: 1.25rem;
	}
	.body :global(ul) {
		list-style: disc;
	}
	.body :global(ol) {
		list-style: decimal;
	}
	.body :global(blockquote) {
		padding-left: 0.75rem;
		border-left: 2px solid var(--accent);
		color: var(--muted);
	}
	.body :global(code) {
		padding: 0.1em 0.3em;
		border-radius: var(--radius-s);
		background: var(--surface-2);
		font-size: 0.85em;
	}
	.body :global(a) {
		color: var(--accent);
	}
	.body :global(hr) {
		margin: 1.5rem 0;
		border: 0;
		border-top: 1px solid var(--border);
	}
</style>
