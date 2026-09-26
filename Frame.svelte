<script lang="ts" module>
	export type Section = {
		href: string;
		label: string;
		/** the inside of a 24×24 outline drawing, for the phone's bottom bar */
		icon?: string;
		/** for a section that is where you are on more addresses than its own */
		active?: boolean;
		/** shown under the section while you are in it */
		children?: Section[];
	};
	export type AccountItem = {
		label: string;
		href?: string;
		/** opens in a window of its own */
		external?: boolean;
		onpick?: () => void;
		/** only on a narrow screen, for what the top bar carries on a wide one */
		narrow?: boolean;
	};
	export type Account = {
		name: string;
		role?: string;
		href: string;
		onlogout?: () => void;
		items?: AccountItem[];
	};
</script>

<script lang="ts">
	// The frame every product's pages stand in. The sidebar carries the
	// product's mark, its sections and the signature; the top bar what the
	// product alone has to say on every page and who is signed in. A phone has
	// no room for a column, so there the sections move to a bar along the bottom
	// edge, where the hand holding it is, and what does not fit goes into a sheet.
	//
	// The page scrolls, not a box inside the frame: the browser restores the
	// page's own scroll on the way back, and a phone hides its address bar only
	// for it.

	import type { Snippet } from 'svelte';
	import { t } from './i18n.svelte';
	import Signature from './Signature.svelte';

	let {
		pathname,
		sections,
		tabs,
		account,
		version = '',
		focus = false,
		brand,
		bar,
		children
	}: {
		pathname: string;
		/** groups of sections, already only what the person may see */
		sections: Section[][];
		/** which sections earn a place on the phone's bottom bar, most wanted
		 * first; the first ones in order when not said */
		tabs?: string[];
		account?: Account;
		/** the build, for the signature */
		version?: string;
		/** a page doing something that needs the bottom of a phone to itself */
		focus?: boolean;
		brand: Snippet;
		bar?: Snippet;
		children: Snippet;
	} = $props();

	const TABS = 4;
	const MORE =
		'<circle cx="5" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.7" fill="currentColor" stroke="none"/>';

	const on = (s: Section) =>
		s.active ??
		(s.href === '/' ? pathname === '/' : pathname === s.href || pathname.startsWith(s.href + '/'));

	const all = $derived(sections.flat());
	const tabbed = $derived.by(() => {
		const order = tabs ?? all.map((s) => s.href);
		return order
			.map((href) => all.find((s) => s.href === href))
			.filter((s): s is Section => !!s)
			.slice(0, TABS);
	});
	const rest = $derived(
		sections.map((g) => g.filter((s) => !tabbed.includes(s))).filter((g) => g.length > 0)
	);
	// a sheet holding one plain link is a tap spent on nothing; that one takes
	// the fifth place on the bar instead
	const lone = $derived.by(() => {
		const left = rest.flat();
		return left.length === 1 && !left[0].children ? left[0] : null;
	});
	const onBar = $derived(lone ? [...tabbed, lone] : tabbed);
	const more = $derived(lone ? [] : rest);

	let sheet = $state(false);
	let menu = $state(false);
	let menuEl = $state<HTMLElement>();
	$effect(() => {
		void pathname;
		sheet = false;
		menu = false;
	});

	let tall = $state(0);
	let low = $state(0);

	function away(e: MouseEvent) {
		if (menu && !menuEl?.contains(e.target as Node)) menu = false;
	}
	function key(e: KeyboardEvent) {
		if (e.key !== 'Escape') return;
		menu = false;
		sheet = false;
	}
</script>

<svelte:window onclick={away} onkeydown={key} />

<div class="frame" style:--shell-header="{tall}px" style:--shell-bar-h="{low}px">
	<aside>
		<a href="/" class="brand">{@render brand()}</a>
		<nav>
			{#each sections as group, g (g)}
				<div class="group">
					{#each group as s (s.href)}
						<a href={s.href} class:on={on(s)} aria-current={on(s) ? 'page' : undefined}>{s.label}</a>
						{#if s.children && on(s)}
							<div class="children">
								{#each s.children as c (c.href)}
									<a href={c.href} class:on={on(c)} aria-current={on(c) ? 'page' : undefined}
										>{c.label}</a
									>
								{/each}
							</div>
						{/if}
					{/each}
				</div>
			{/each}
		</nav>
		<p class="signature"><Signature {version} /></p>
	</aside>

	<div class="column">
		<header bind:clientHeight={tall}>
			<a href="/" class="brand">{@render brand()}</a>
			<div class="bar">{@render bar?.()}</div>
			{#if account}
				<div class="account" bind:this={menuEl}>
					<button
						type="button"
						class="badge"
						aria-haspopup="menu"
						aria-expanded={menu}
						onclick={() => (menu = !menu)}
					>
						<span class="initial">{account.name.slice(0, 1).toUpperCase()}</span>
						<span class="who">{account.name}</span>
					</button>
					{#if menu}
						<div class="menu" role="menu">
							<p class="me">
								{t('frame.signedInAs')}
								<strong>{account.name}</strong>
								{#if account.role}<span>{account.role}</span>{/if}
							</p>
							{#each account.items ?? [] as item (item.label)}
								{#if item.href}
									<a
										role="menuitem"
										href={item.href}
										class:narrow={item.narrow}
										target={item.external ? '_blank' : undefined}
										rel={item.external ? 'noopener' : undefined}
										onclick={() => (menu = false)}>{item.label}</a
									>
								{:else}
									<button
										type="button"
										role="menuitem"
										class:narrow={item.narrow}
										onclick={() => {
											menu = false;
											item.onpick?.();
										}}>{item.label}</button
									>
								{/if}
							{/each}
							<a role="menuitem" href={account.href} onclick={() => (menu = false)}
								>{t('frame.account')}</a
							>
							{#if account.onlogout}
								<button
									type="button"
									role="menuitem"
									onclick={() => {
										menu = false;
										account.onlogout?.();
									}}>{t('frame.logout')}</button
								>
							{/if}
							<!-- the sidebar carries it on a wide screen; a phone has no sidebar -->
							<p class="signature narrow"><Signature {version} /></p>
						</div>
					{/if}
				</div>
			{/if}
		</header>

		<main>
			{@render children()}
		</main>
	</div>

	{#if all.length > 1 && !focus}
		<nav class="tabs" bind:clientHeight={low}>
			{#each onBar as s (s.href)}
				<a href={s.href} class:on={on(s)} aria-current={on(s) ? 'page' : undefined}>
					{#if s.icon}{@render mark(s.icon)}{/if}
					<span>{s.label}</span>
				</a>
			{/each}
			{#if more.length}
				<button
					type="button"
					class:on={more.flat().some(on)}
					aria-expanded={sheet}
					onclick={() => (sheet = true)}
				>
					{@render mark(MORE)}
					<span>{t('frame.more')}</span>
				</button>
			{/if}
		</nav>
	{/if}

	{#if sheet}
		<button type="button" class="scrim" aria-label={t('common.close')} onclick={() => (sheet = false)}
		></button>
		<div class="sheet">
			<div class="grip"></div>
			<nav>
				{#each more as group, g (g)}
					<div class="group">
						{#each group as s (s.href)}
							{#if s.children}
								<p class="title">{s.label}</p>
								{#each s.children as c (c.href)}
									<a href={c.href} class:on={on(c)} aria-current={on(c) ? 'page' : undefined}
										>{c.label}</a
									>
								{/each}
							{:else}
								<a href={s.href} class:on={on(s)} aria-current={on(s) ? 'page' : undefined}
									>{s.label}</a
								>
							{/if}
						{/each}
					</div>
				{/each}
			</nav>
		</div>
	{/if}
</div>

{#snippet mark(inside: string)}
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.8"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true">{@html inside}</svg
	>
{/snippet}

<style>
	.frame {
		display: flex;
		min-height: 100dvh;
		--frame-gutter: 1.5rem;
		/* said out loud because a page head has to cancel it: pinned, the head
		   rises by exactly this much */
		--shell-main-top: 1.5rem;
	}

	aside {
		position: sticky;
		top: 0;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		width: 14rem;
		height: 100dvh;
		padding: 1rem;
		overflow-y: auto;
		border-right: 1px solid var(--border);
		background: var(--surface);
	}
	.brand {
		display: flex;
		align-items: center;
		color: inherit;
		text-decoration: none;
	}
	aside .brand {
		margin-bottom: 1.5rem;
	}
	nav {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-size: var(--fs-m);
	}
	.group {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}
	aside nav a,
	.sheet a {
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		color: var(--muted);
		text-decoration: none;
	}
	aside nav a:hover,
	.sheet a:hover {
		background: var(--surface-2);
		color: var(--text);
	}
	aside nav a.on,
	.sheet a.on {
		background: var(--surface-2);
		color: var(--accent);
	}
	.children {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		margin: 0 0 0.25rem 0.75rem;
		padding-left: 0.5rem;
		border-left: 1px solid var(--border);
	}
	.children a {
		padding: 0.375rem 0.75rem;
		font-size: var(--fs-s);
	}
	.signature {
		margin: 0;
		color: var(--muted);
		font-size: var(--fs-2xs);
		line-height: 1;
		text-align: center;
		white-space: nowrap;
	}
	aside .signature {
		margin-top: auto;
		padding-top: 1rem;
	}

	/* A page head's picture reaches past the gutter; clipped here, it stops at
	   the column rather than running under the sidebar or widening a phone.
	   Clip rather than hidden: it is not a scroll container, so nothing sticky
	   inside loses its scroller. */
	.column {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		overflow-x: clip;
	}
	/* Opaque and stays: a shelf scrolls under it for a long time, and it keeps
	   the stacking context the account menu drops out of. */
	header {
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-height: 3.25rem;
		padding: 0.5rem var(--frame-gutter);
		border-bottom: 1px solid var(--border);
		background: var(--bg);
	}
	header .brand {
		display: none;
		flex-shrink: 0;
	}
	.bar {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 0.75rem;
		min-width: 0;
	}
	main {
		flex: 1;
		padding: var(--shell-main-top) var(--frame-gutter) calc(3rem + var(--shell-bar-h));
	}

	.account {
		position: relative;
	}
	.badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.7rem 0.25rem 0.25rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--surface);
		color: var(--text);
		font: inherit;
		font-size: var(--fs-m);
		cursor: pointer;
	}
	.badge:hover {
		border-color: var(--accent);
	}
	.initial {
		display: grid;
		place-items: center;
		width: 1.65rem;
		height: 1.65rem;
		border-radius: 999px;
		background: var(--accent);
		color: var(--bg);
		font-size: var(--fs-s);
		font-weight: 700;
	}
	.menu {
		position: absolute;
		top: calc(100% + 0.4rem);
		right: 0;
		display: flex;
		flex-direction: column;
		min-width: 12rem;
		padding: 0.3rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
		box-shadow: var(--shadow-m);
	}
	.me {
		display: flex;
		flex-direction: column;
		margin: 0 0 0.3rem;
		padding: 0.4rem 0.7rem 0.6rem;
		border-bottom: 1px solid var(--border);
		color: var(--muted);
		font-size: var(--fs-s);
	}
	.me strong {
		color: var(--text);
		font-size: var(--fs-m);
		font-weight: 500;
	}
	.me span {
		font-size: var(--fs-xs);
	}
	.menu a,
	.menu button {
		padding: 0.45rem 0.7rem;
		border: none;
		border-radius: 6px;
		background: none;
		color: var(--text);
		font: inherit;
		font-size: var(--fs-m);
		text-align: left;
		text-decoration: none;
		cursor: pointer;
	}
	.menu a:hover,
	.menu button:hover {
		background: var(--bg);
	}
	.menu .signature {
		margin-top: 0.3rem;
		font-size: var(--fs-xs);
		padding: 0.6rem 0.7rem 0.3rem;
		border-top: 1px solid var(--border);
	}
	.narrow,
	.tabs,
	.scrim,
	.sheet {
		display: none;
	}

	@media (max-width: 767.98px) {
		.frame {
			--frame-gutter: 1rem;
		}
		aside,
		.who {
			display: none;
		}
		header .brand {
			display: flex;
		}
		.menu .narrow {
			display: block;
		}
		.tabs {
			position: fixed;
			inset: auto 0 0;
			z-index: 15;
			display: flex;
			flex-direction: row;
			gap: 0;
			padding-bottom: env(safe-area-inset-bottom);
			border-top: 1px solid var(--border);
			/* the shelf scrolls under it, and a solid bar would read as the end
			   of the page rather than something laid over it */
			background: color-mix(in srgb, var(--surface) 94%, transparent);
			backdrop-filter: blur(12px);
		}
		.tabs a,
		.tabs button {
			display: flex;
			flex: 1;
			flex-direction: column;
			align-items: center;
			gap: 0.125rem;
			min-width: 0;
			padding: 0.5rem 0.25rem 0.375rem;
			border: none;
			background: none;
			color: var(--muted);
			font: inherit;
			font-size: var(--fs-xs);
			font-weight: 500;
			text-decoration: none;
			cursor: pointer;
		}
		.tabs span {
			max-width: 100%;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.tabs svg {
			width: 1.25rem;
			height: 1.25rem;
		}
		.tabs .on {
			color: var(--accent);
		}
		.scrim {
			position: fixed;
			inset: 0;
			z-index: 40;
			display: block;
			border: none;
			background: rgb(0 0 0 / 0.4);
			cursor: default;
		}
		.sheet {
			position: fixed;
			inset: auto 0 0;
			z-index: 50;
			display: block;
			max-height: 75vh;
			overflow-y: auto;
			padding: 0.75rem 0.75rem max(0.75rem, env(safe-area-inset-bottom));
			border-top: 1px solid var(--border);
			border-radius: 1rem 1rem 0 0;
			background: var(--surface);
		}
		.grip {
			width: 2.5rem;
			height: 0.25rem;
			margin: 0 auto 0.5rem;
			border-radius: 999px;
			background: var(--border);
		}
		.title {
			margin: 0;
			padding: 0.25rem 0.75rem;
			color: var(--muted);
			font-size: var(--fs-xs);
			font-weight: 600;
			letter-spacing: 0.04em;
			text-transform: uppercase;
		}
	}
</style>
