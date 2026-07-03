import type { ToastConfig } from "./runtime";
import {
  addComponent,
  addImports,
  addPluginTemplate,
  addTemplate,
  addTypeTemplate,
  defineNuxtModule,
  useNuxt,
} from "@nuxt/kit";

export interface NuxtToastflowOptions {
  /**
   * Global Toastflow config passed to createToastflow.
   */
  config: Partial<ToastConfig>;
  /**
   * Automatically include Toastflow CSS.
   */
  css: boolean;
  /**
   * Auto-register ToastContainer under this name. Set false to disable.
   */
  componentName: string | false;
  /**
   * Auto-register the remaining vue-toastflow components (Toast,
   * ToastProgress, and the icon components) under their export names.
   * Set false if any name collides with your own components — they stay
   * importable from "nuxt-toastflow/runtime".
   */
  components: boolean;
}

// Compiled SFCs are plain objects carrying `setup` and/or `render`; every
// other runtime export (functions, the `toast` object, symbols, sets) has
// neither. This keeps the registration list derived from the actual public
// exports instead of a hard-coded name list.
function isVueComponent(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    ("setup" in value || "render" in value)
  );
}

// Full `toastflow` key typing (including every ToastConfig field) in
// nuxt.config — without this, editors offer no completion for the key.
declare module "@nuxt/schema" {
  interface NuxtConfig {
    toastflow?: Partial<NuxtToastflowOptions>;
  }
  interface NuxtOptions {
    toastflow?: NuxtToastflowOptions;
  }
}

interface UnserializableEntry {
  path: string;
  kind: "function" | "Date" | "RegExp";
}

// JSON.stringify silently omits functions and mangles Date/RegExp values, so
// collect their exact config paths to warn the user by name.
function collectUnserializable(
  value: unknown,
  path: string = "toastflow.config",
  visited: Set<unknown> = new Set(),
  found: UnserializableEntry[] = [],
): UnserializableEntry[] {
  if (typeof value === "function") {
    found.push({ path, kind: "function" });
    return found;
  }

  if (!value || typeof value !== "object") {
    return found;
  }

  if (value instanceof Date) {
    found.push({ path, kind: "Date" });
    return found;
  }

  if (value instanceof RegExp) {
    found.push({ path, kind: "RegExp" });
    return found;
  }

  if (visited.has(value)) {
    return found;
  }
  visited.add(value);

  if (Array.isArray(value)) {
    value.forEach(function (item: unknown, index: number) {
      collectUnserializable(item, `${path}[${index}]`, visited, found);
    });
    return found;
  }

  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    collectUnserializable(item, `${path}.${key}`, visited, found);
  }

  return found;
}

export default defineNuxtModule<NuxtToastflowOptions>({
  meta: {
    name: "nuxt-toastflow",
    configKey: "toastflow",
    compatibility: {
      nuxt: "^3.0.0 || ^4.0.0",
    },
  },
  defaults: {
    config: {},
    css: true,
    componentName: "ToastContainer",
    components: true,
  },
  async setup(options) {
    const nuxt = useNuxt();
    const runtimeEntry = "nuxt-toastflow/runtime";

    nuxt.options.build.transpile.push("vue-toastflow");

    const unserializable = collectUnserializable(options.config);
    for (const entry of unserializable) {
      if (entry.kind === "function") {
        console.warn(
          `[nuxt-toastflow] \`${entry.path}\` is a function and will be omitted — functions are not serializable in nuxt.config. Configure it at runtime instead (e.g. in a plugin).`,
        );
      } else {
        console.warn(
          `[nuxt-toastflow] \`${entry.path}\` is a ${entry.kind} and will not survive JSON serialization in nuxt.config. Use a plain serializable value instead.`,
        );
      }
    }

    let serializedConfig = "{}";
    try {
      serializedConfig = JSON.stringify(options.config ?? {}, null, 2) ?? "{}";
    } catch {
      throw new Error(
        "[nuxt-toastflow] `toastflow.config` must be JSON-serializable.",
      );
    }

    addPluginTemplate({
      filename: "toastflow.mjs",
      mode: "client",
      getContents: function () {
        return [
          `import { createToastflow, toast } from "${runtimeEntry}";`,
          "",
          "export default defineNuxtPlugin((nuxtApp) => {",
          `  nuxtApp.vueApp.use(createToastflow(${serializedConfig}, { css: ${options.css ? "true" : "false"} }));`,
          "",
          "  return {",
          "    provide: {",
          "      toast,",
          "    },",
          "  };",
          "});",
          "",
        ].join("\n");
      },
    });

    const toastTemplate = addTemplate({
      filename: "toastflow/toast.ts",
      write: true,
      getContents: function () {
        return [
          'import { useNuxtApp } from "#app";',
          "",
          `type ToastApi = typeof import("${runtimeEntry}")["toast"];`,
          "",
          "export function useToast(): ToastApi {",
          "  return useNuxtApp().$toast;",
          "}",
          "",
          "export const toast: ToastApi = new Proxy({} as ToastApi, {",
          "  get(_target, key) {",
          "    const currentToast = useNuxtApp().$toast as Record<PropertyKey, unknown>;",
          "    const value = currentToast[key];",
          '    if (typeof value === "function") {',
          "      return (value as (...args: unknown[]) => unknown).bind(currentToast);",
          "    }",
          "    return value;",
          "  },",
          "});",
          "",
        ].join("\n");
      },
    });

    addImports({
      name: "useToast",
      from: toastTemplate.dst,
    });

    addImports({
      name: "toast",
      from: toastTemplate.dst,
    });

    addTypeTemplate({
      filename: "types/nuxt-toastflow.d.ts",
      getContents: function () {
        return [
          `type ToastApi = typeof import("${runtimeEntry}")["toast"];`,
          "",
          'declare module "#app" {',
          "  interface NuxtApp {",
          "    $toast: ToastApi;",
          "  }",
          "}",
          "",
          'declare module "vue" {',
          "  interface ComponentCustomProperties {",
          "    $toast: ToastApi;",
          "  }",
          "}",
          "",
          "export {};",
          "",
        ].join("\n");
      },
    });

    if (options.componentName) {
      addComponent({
        name: options.componentName,
        export: "ToastContainer",
        filePath: runtimeEntry,
        mode: "client",
      });
    }

    if (options.components) {
      const runtime = await import("vue-toastflow");
      const componentNames = Object.entries(runtime)
        .filter(function ([name, value]) {
          // The container is governed by the componentName option above.
          return name !== "ToastContainer" && isVueComponent(value);
        })
        .map(function ([name]) {
          return name;
        })
        .sort();

      for (const name of componentNames) {
        addComponent({
          name,
          export: name,
          filePath: runtimeEntry,
          mode: "client",
        });
      }
    }
  },
});
