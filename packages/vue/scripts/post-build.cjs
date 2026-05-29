/**
 * Post-build script for vue-toastflow.
 *
 * Walks `dist/` and creates a `.d.mts` copy of every `.d.ts` declaration
 * so consumers using `moduleResolution: "node16" | "nodenext" | "bundler"`
 * (notably Bun) can resolve types via the `import` condition correctly.
 *
 * Also copies the source CSS to `dist/vue-toastflow.css` for the public
 * `./styles.css` export.
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

function copyStyles() {
  const src = path.join(ROOT, "src", "styles.css");
  const dest = path.join(DIST, "vue-toastflow.css");
  if (!fs.existsSync(src)) {
    throw new Error(`Missing source stylesheet at ${src}`);
  }
  fs.mkdirSync(DIST, { recursive: true });
  fs.copyFileSync(src, dest);
}

walk(DIST);
copyStyles();
