/**
 * Post-build script for toastflow-core.
 *
 * Walks `dist/` and creates a `.d.mts` copy of every `.d.ts` declaration
 * so consumers using `moduleResolution: "node16" | "nodenext" | "bundler"`
 * (notably Bun) can resolve types via the `import` condition correctly.
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
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

walk(DIST);
