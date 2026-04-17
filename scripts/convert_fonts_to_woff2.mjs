#!/usr/bin/env node
/**
 * One-shot TTF → WOFF2 converter for /app/fonts.
 * Run with: node scripts/convert_fonts_to_woff2.mjs
 */
import { readdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import ttf2woff2 from "ttf2woff2";

const FONT_DIR = new URL("../app/fonts/", import.meta.url).pathname;

const entries = readdirSync(FONT_DIR).filter((name) => name.endsWith(".ttf"));
let totalIn = 0;
let totalOut = 0;

for (const name of entries) {
  const ttfPath = join(FONT_DIR, name);
  const woff2Path = ttfPath.replace(/\.ttf$/, ".woff2");
  const input = readFileSync(ttfPath);
  const output = ttf2woff2(input);
  writeFileSync(woff2Path, output);
  unlinkSync(ttfPath);

  const inSize = input.length;
  const outSize = output.length;
  totalIn += inSize;
  totalOut += outSize;
  const pct = ((1 - outSize / inSize) * 100).toFixed(1);
  console.log(`${name.padEnd(32)} ${(inSize / 1024).toFixed(1).padStart(7)} KB → ${(outSize / 1024).toFixed(1).padStart(7)} KB  (-${pct}%)`);
}

console.log("---");
console.log(`Total: ${(totalIn / 1024).toFixed(1)} KB → ${(totalOut / 1024).toFixed(1)} KB  (-${((1 - totalOut / totalIn) * 100).toFixed(1)}%)`);
