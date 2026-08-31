/**
 * Shared post-build script for the publishable packages.
 *
 * Walks the package's `dist/` and creates a `.d.mts` copy of every `.d.ts`
 * declaration so consumers using `moduleResolution: "node16" | "nodenext" |
 * "bundler"` (notably Bun) can resolve types via the `import` condition
 * correctly.
 *
 * Packages with a public CSS export can additionally copy their stylesheet:
 *
 *   node ../../scripts/post-build.cjs --copy-styles <src> <dest>
 *
 * Paths are resolved against the package root (the current working
 * directory, i.e. where pnpm runs the build script).
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");

function walk(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (entry.isFile() && full.endsWith(".d.ts")) {
      const mtsPath = full.slice(0, -".d.ts".length) + ".d.mts";
      fs.copyFileSync(full, mtsPath);
    }
  }
}

function copyStyles(src, dest) {
  const srcPath = path.resolve(ROOT, src);
  const destPath = path.resolve(ROOT, dest);
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Missing source stylesheet at ${srcPath}`);
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(srcPath, destPath);
}

walk(DIST);

const args = process.argv.slice(2);
const flagIndex = args.indexOf("--copy-styles");
if (flagIndex !== -1) {
  const src = args[flagIndex + 1];
  const dest = args[flagIndex + 2];
  if (!src || !dest) {
    throw new Error("--copy-styles requires <src> and <dest> arguments");
  }
  copyStyles(src, dest);
}
