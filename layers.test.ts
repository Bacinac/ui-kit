// @vitest-environment happy-dom
import { expect, test } from 'vitest';
import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import Dialog from './Dialog.svelte';

const inner = createRawSnippet(() => ({ render: () => '<div class="inner"></div>' }));

test('two dialogs going away together give the page its scroll back', async () => {
	document.body.style.overflow = '';
	document.body.innerHTML = '<main></main><aside></aside>';
	const props = { title: 'x', onclose: () => {}, children: inner };
	let first!: ReturnType<typeof mount>, second!: ReturnType<typeof mount>;
	flushSync(() => { first = mount(Dialog, { target: document.querySelector('main')!, props }); });
	flushSync(() => { second = mount(Dialog, { target: document.querySelector('aside')!, props }); });
	expect(document.body.style.overflow).toBe('hidden');
	await unmount(first);
	expect(document.body.style.overflow).toBe('hidden');
	await unmount(second);
	expect(document.body.style.overflow).toBe('');
});
