import assert from "node:assert/strict";
import { test } from "node:test";
import { unnamed } from "./names.mjs";

const lines = (source) => unnamed(source).map((one) => one.line);

test("a face of words names itself, a sign does not", () => {
  assert.deepEqual(lines(`<button>{t('save')}</button>\n<button><Icon name="x" /></button>`), [2]);
  assert.deepEqual(lines(`<button>Spremi</button>\n<button>×</button>\n<button>{'↑'}</button>`), [2, 3]);
  assert.deepEqual(lines(`<a href="/x"><svg><path d="M0" /></svg></a>`), [1]);
});

test("aria-label, or label on a component, is the name", () => {
  assert.deepEqual(lines(`<button aria-label={t('close')}><Icon name="x" /></button>`), []);
  assert.deepEqual(lines(`<Button label={t('up')}>↑</Button>\n<Button>↑</Button>`), [2]);
  assert.deepEqual(lines(`<button title={t('close')}><Icon name="x" /></button>`), [1]);
});

test("a picture names its button only through its alt", () => {
  assert.deepEqual(lines(`<button><img src="a" alt="" /></button>\n<button><img src="a" alt={who} /></button>`), [1]);
  assert.deepEqual(lines(`<img src="a" alt="" onclick={go} />`), [1]);
});

test("every branch has to say something", () => {
  assert.deepEqual(lines(`<button>{#if thumb}<img src="a" alt={name} />{:else}<Icon name="photo" />{/if}</button>`), [1]);
  assert.deepEqual(lines(`<button>{#if thumb}<img src="a" alt={name} />{:else}{name}{/if}</button>`), []);
  assert.deepEqual(lines(`<button><Icon name="x" />{#if note}{note}{/if}</button>`), [1]);
});

test("a clicked element is a button, and a component that draws its own face is read where it is written", () => {
  assert.deepEqual(lines(`<div onclick={go}><Icon name="x" /></div>\n<span>{x}</span>`), [1]);
  assert.deepEqual(lines(`<InfoPress onclick={go} />\n<Press onclick={go}><Icon name="x" /></Press>`), [2]);
  assert.deepEqual(lines(`{#each items as it}<button>{@render line(it)}</button>{/each}`), []);
});

test("a surface drawn on with the pointer steps out of the tree instead of taking a name", () => {
  assert.deepEqual(lines(`<svg role="presentation" onclick={draw}></svg>\n<svg onclick={draw}></svg>`), [2]);
});
