import assert from "node:assert/strict";
import { test } from "node:test";
import { pngSize, withCard } from "./linkcard.mjs";

const card = { origin: "https://demo.example", title: "A \"live\" demo", description: "Fish & chips <hot>", width: 1280, height: 640 };

test("the card goes into the head, with absolute addresses and escaped words", () => {
  const html = withCard("<html><head><title>x</title></head><body></body></html>", card);
  assert.match(html, /<meta property="og:image" content="https:\/\/demo.example\/og.png" \/>\n[^]*<\/head><body>/);
  assert.match(html, /<meta property="og:url" content="https:\/\/demo.example\/" \/>/);
  assert.match(html, /<meta property="og:title" content="A &quot;live&quot; demo" \/>/);
  assert.match(html, /<meta name="description" content="Fish &amp; chips &lt;hot>" \/>/);
  assert.match(html, /<meta property="og:image:width" content="1280" \/>/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image" \/>/);
});

test("a page without a head, or with a card already, is refused", () => {
  assert.throws(() => withCard("<html><body></body></html>", card), /no <\/head>/);
  assert.throws(() => withCard(withCard("<head></head>", card), card), /already carries/);
});

test("the picture's size is read from the PNG header, and anything else is refused", () => {
  const png = Buffer.alloc(24);
  png.writeUInt32BE(0x89504e47, 0);
  png.write("IHDR", 12, "ascii");
  png.writeUInt32BE(1280, 16);
  png.writeUInt32BE(640, 20);
  assert.deepEqual(pngSize(png), { width: 1280, height: 640 });
  assert.throws(() => pngSize(Buffer.from("RIFF....WEBPVP8 ........")), /not a PNG/);
});
