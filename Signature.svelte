<script lang="ts">
	// The line a frame ends with: who made it, which build it runs, and the way
	// to the about page. It takes the size and colour of wherever it is put.

	import { MAKER } from './maker';

	let { version = '', href = '/about' }: { version?: string; href?: string } = $props();

	const year = new Date().getFullYear();
</script>

<span><a {href}>{MAKER.name}</a>{#if version}{' '}· v{version}{/if} · © {year}</span>

<style>
	a {
		color: var(--accent);
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}
</style>
