import assert from "node:assert/strict";
import { test } from "node:test";
import { offScale } from "./type.mjs";

const lines = (source) => offScale(source).map((one) => one.line);

test("a step of the scale passes, a size of its own does not", () => {
  assert.deepEqual(lines(`font-size: var(--fs-s);\nfont-size: 0.75rem;\nfont-size: 11px;`), [2, 3]);
  assert.deepEqual(lines(`<p class="text-s">a</p>\n<p class="text-[11px]">b</p>\n<p class="text-[0.6rem]">c</p>`), [2, 3]);
});

test("Tailwind's in-between names are refused wherever they stand", () => {
  assert.deepEqual(lines(`<p class="text-sm">a</p>\n<p class="md:text-lg">b</p>\n<p class="{x} text-base">c</p>`), [1, 2, 3]);
  assert.deepEqual(lines(`<p class="text-xs text-m text-2xl">a</p>\n<p class="text-smooth">b</p>`), []);
});

test("a glyph fitted to its box, or a size relative to its text, says its size", () => {
  assert.deepEqual(lines(`font-size: 2.5rem;\nfont-size: 48px;\n<p class="text-[3rem]">★</p>`), []);
  assert.deepEqual(lines(`font-size: 0.85em;\nfont-size: var(--field-fs, 1em);`), []);
});
