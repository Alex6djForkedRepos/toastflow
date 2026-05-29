import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const toastflowPackage = JSON.parse(
  readFileSync(new URL("../vue/package.json", import.meta.url), "utf8"),
) as { version?: string };
const toastflowCorePackage = JSON.parse(
  readFileSync(new URL("../core/package.json", import.meta.url), "utf8"),
) as { version?: string };
const publicAssetsDir = fileURLToPath(new URL("../../assets", import.meta.url));

loadLocalEnv();
process.env.NUXT_PUBLIC_SITE_URL ??= "https://www.toastflow.top";
process.env.NUXT_SITE_URL ??= "https://www.toastflow.top";

function loadLocalEnv() {
  const envFile = new URL(".env.local", import.meta.url);

  if (!existsSync(envFile)) {
    return;
  }

  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

    if (!match || !match[1] || match[1].startsWith("#")) {
      continue;
    }

    const value = (match[2] ?? "").trim().replace(/^(['"])(.*)\1$/, "$2");
    process.env[match[1]] ??= value;
  }
}

function envValue(name: string, defaultValue = "") {
  return process.env[name] ?? defaultValue;
}

function nonEmptyEnvValue(name: string, defaultValue: string) {
  const value = process.env[name]?.trim();

  return value ? value : defaultValue;
}

function envFlag(name: string, defaultValue = false) {
  const value = process.env[name]?.trim().toLowerCase();

  if (!value) {
    return defaultValue;
  }

  if (["1", "true", "yes", "on"].includes(value)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(value)) {
    return false;
  }

  return defaultValue;
}

function cliOptionValue(name: string) {
  const longOption = `--${name}`;
  const inlineOption = `${longOption}=`;
  const shortOption = name.length === 1 ? `-${name}` : "";
  const args = process.argv;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === longOption || (shortOption && arg === shortOption)) {
      return args[index + 1];
    }

    if (arg?.startsWith(inlineOption)) {
      return arg.slice(inlineOption.length);
    }
  }
}

function devServerPort() {
  return (
    nonEmptyEnvValue("NUXT_DOCUS_DEV_PORT", "") ||
    nonEmptyEnvValue("NUXT_PORT", "") ||
    nonEmptyEnvValue("NITRO_PORT", "") ||
    nonEmptyEnvValue("PORT", "") ||
    cliOptionValue("port") ||
    cliOptionValue("p") ||
    "3000"
  );
}

function docusMcpServer() {
  const override = process.env.NUXT_DOCUS_MCP_SERVER?.trim();

  if (override) {
    return override;
  }

  if (process.env.NODE_ENV !== "production") {
    return `http://127.0.0.1:${devServerPort()}/mcp`;
  }

  return "/mcp";
}

function dropDevOnlyRootPrerender(nitroConfig: {
  prerender?: { routes?: unknown[] };
  routeRules?: Record<string, Record<string, unknown>>;
}) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  if (nitroConfig.prerender?.routes) {
    nitroConfig.prerender.routes = nitroConfig.prerender.routes.filter(
      (route) => route !== "/",
    );
  }

  if (!nitroConfig.routeRules) {
    return;
  }

  delete nitroConfig.routeRules["//_payload.json"];

  const rootRules = nitroConfig.routeRules["/"];
  if (rootRules?.prerender) {
    delete rootRules.prerender;

    if (Object.keys(rootRules).length === 0) {
      delete nitroConfig.routeRules["/"];
    }
  }
}

export default defineNuxtConfig({
  extends: ["docus"],
  devtools: {
    enabled: envFlag("NUXT_DEVTOOLS"),
  },
  css: ["highlight.js/styles/atom-one-dark.css"],
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
    },
  },
  vite: {
    define: {
      __TOASTFLOW_CORE_VERSION__: JSON.stringify(
        toastflowCorePackage.version ?? "latest",
      ),
      __VUE_TOASTFLOW_VERSION__: JSON.stringify(
        toastflowPackage.version ?? "latest",
      ),
      __TOASTFLOW_LOCAL_DEV__: JSON.stringify(false),
    },
    optimizeDeps: {
      include: [
        "@highlightjs/vue-plugin",
        "highlight.js/lib/common",
        "remark-emoji",
        "remark-mdc",
        "vue-snowfall",
        "@giscus/vue",
      ],
      exclude: ["@vue/repl"],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("@vue/repl")) {
              return "vue-repl";
            }
          },
        },
      },
    },
  },
  experimental: {
    defaults: {
      nuxtLink: {
        prefetch: process.env.NODE_ENV === "production",
      },
    },
  },
  site: {
    url: "https://www.toastflow.top",
    name: "Toastflow",
  },
  llms: {
    domain: "https://www.toastflow.top",
    title: "Toastflow",
    description:
      "Accessible toast notifications for Vue, Nuxt, and headless apps.",
    full: {
      title: "Toastflow",
      description:
        "Accessible toast notifications for Vue, Nuxt, and headless apps.",
    },
  },
  routeRules: {
    "/docs": {
      redirect: "/docs/global/overview",
    },
    "/docs/**": {
      isr: 3600,
    },
    "/docs/api": {
      redirect: "/docs/api/configuration",
    },
    "/docs/more": {
      redirect: "/docs/more/troubleshooting",
    },
    "/playground": {
      redirect: "/",
    },
  },
  icon: {
    provider: "server",
    clientBundle: {
      scan: true,
    },
  },
  nitro: {
    publicAssets: [
      {
        baseURL: "/",
        dir: publicAssetsDir,
      },
    ],
    compressPublicAssets: true,
  },
  hooks: {
    "nitro:config": dropDevOnlyRootPrerender,
  },
  docus: {
    assistant: {
      mcpServer: docusMcpServer(),
      model: nonEmptyEnvValue(
        "NUXT_DOCUS_ASSISTANT_MODEL",
        "google/gemini-3-flash",
      ),
    },
  },
  runtimeConfig: {
    public: {
      toastflowVersion: toastflowPackage.version ?? "0.0.0",
      seasonalMode: envValue("NUXT_PUBLIC_SEASONAL_MODE", "off"),
      umamiWebsiteId: envValue("NUXT_PUBLIC_UMAMI_WEBSITE_ID"),
      giscus: {
        repo: envValue("NUXT_PUBLIC_GISCUS_REPO"),
        repoId: envValue("NUXT_PUBLIC_GISCUS_REPO_ID"),
        category: envValue("NUXT_PUBLIC_GISCUS_CATEGORY"),
        categoryId: envValue("NUXT_PUBLIC_GISCUS_CATEGORY_ID"),
        mapping: envValue("NUXT_PUBLIC_GISCUS_MAPPING", "pathname"),
        theme: envValue("NUXT_PUBLIC_GISCUS_THEME", "light"),
        themeLight: envValue("NUXT_PUBLIC_GISCUS_THEME_LIGHT", "light"),
        themeDark: envValue("NUXT_PUBLIC_GISCUS_THEME_DARK", "dark_dimmed"),
        strict: envValue("NUXT_PUBLIC_GISCUS_STRICT", "0"),
      },
    },
  },
});
