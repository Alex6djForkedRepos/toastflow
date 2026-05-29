/**
 * Post-build script for nuxt-toastflow.
 *
 * Walks `dist/` and creates a `.d.mts` copy of every `.d.ts` declaration
 * so consumers using `moduleResolution: "node16" | "nodenext" | "bundler"`
 * (notably Bun) can resolve types via the `import` condition correctly.
 *
 * Also copies the shared stylesheet from `vue-toastflow` so the public
 * `./styles.css` export resolves locally without depending on the sibling
 * package's filesystem layout at install time.
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SHARED_STYLES = path.resolve(ROOT, "..", "vue", "src", "styles.css");

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
  if (!fs.existsSync(SHARED_STYLES)) {
    throw new Error(`Missing shared stylesheet at ${SHARED_STYLES}`);
  }
  fs.mkdirSync(DIST, { recursive: true });
  fs.copyFileSync(SHARED_STYLES, path.join(DIST, "styles.css"));
}

walk(DIST);
copyStyles();
