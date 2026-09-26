<script lang="ts">
	// What the product is, who made it and which build this tab runs. Every
	// product had this page as a copy of the others; a product now hands over
	// only its mark and its words.

	import type { Snippet } from 'svelte';
	import Heading from './Heading.svelte';
	import { formatDate, t } from './i18n.svelte';
	import { MAKER } from './maker';
	import type { Revision } from './version.svelte';

	let {
		brand,
		tagline,
		intro,
		motto,
		what,
		why,
		stack,
		aside,
		build
	}: {
		/** the product's own mark, drawn large across the top */
		brand: Snippet;
		tagline: string;
		intro: string;
		/** markup from the product's own catalogue, after the intro: what the
		 * name stands for */
		motto?: string;
		what: string;
		/** what sets it apart from what already exists */
		why: string;
		stack: string;
		/** set apart under the text */
		aside?: string;
		/** the build this tab runs, once the product's /version has said */
		build: Revision | null;
	} = $props();

	const year = new Date().getFullYear();
</script>

<article class="about">
	<header>{@render brand()}</header>
	<div class="text">
		<p class="tagline">{tagline}</p>
		<p>{intro}{#if motto}{' '}{@html motto}{/if}</p>
		<section>
			<Heading label={t('about.heading.what')} />
			<p>{what}</p>
		</section>
		<section>
			<Heading label={t('about.heading.why')} />
			<p>{why}</p>
		</section>
		<section>
			<Heading label={t('about.heading.stack')} />
			<p>{stack}</p>
		</section>
		{#if aside}<p class="aside">{aside}</p>{/if}
	</div>
	<dl>
		<dt>{t('about.version')}</dt>
		<dd class="code">{build ? `v${build.version}` : '—'}</dd>
		{#if build?.sha}
			<dt>{t('about.revision')}</dt>
			<dd class="code">
				{build.sha}{build.branch ? ` · ${build.branch}` : ''}{build.dirty ? ` · ${t('about.dirty')}` : ''}
			</dd>
		{/if}
		{#if build?.committed_at}
			<dt>{t('about.date')}</dt>
			<dd>{formatDate(build.committed_at)}</dd>
		{/if}
		<dt>{t('about.author')}</dt>
		<dd>{MAKER.name}</dd>
		<dt>{t('about.contact')}</dt>
		<dd><a href="mailto:{MAKER.email}">{MAKER.email}</a></dd>
		<dt>{t('about.year')}</dt>
		<dd>© {year}</dd>
	</dl>
</article>

<style>
	.about {
		max-width: 48rem;
		margin: 0 auto;
		overflow: hidden;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-l);
	}
	header {
		padding: 2rem;
		border-bottom: 1px solid var(--border);
	}
	.text {
		display: grid;
		gap: 1.5rem;
		padding: 1.5rem;
		font-size: var(--fs-m);
		line-height: 1.6;
		color: var(--muted);
	}
	p {
		margin: 0;
	}
	.tagline {
		font-size: var(--fs-l);
		font-weight: 500;
		color: var(--text);
	}
	section {
		display: grid;
		gap: 0.5rem;
	}
	.aside {
		padding-left: 1rem;
		border-left: 2px solid var(--border);
		font-size: var(--fs-s);
		font-style: italic;
	}
	dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.75rem 2rem;
		margin: 0;
		padding: 1.5rem;
		font-size: var(--fs-m);
		color: var(--text);
		background: var(--surface-2);
		border-top: 1px solid var(--border);
	}
	dt {
		color: var(--muted);
	}
	dd {
		margin: 0;
		overflow-wrap: anywhere;
	}
	.code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}
	a {
		color: var(--accent);
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}
</style>
