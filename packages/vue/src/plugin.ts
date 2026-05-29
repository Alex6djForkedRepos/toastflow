import type { App, Plugin } from "vue";
import { createToastStore, type ToastConfig } from "toastflow-core";
import { toastStoreKey } from "./symbols";
import { setToastStore } from "./toast";
import toastflowStyles from "./styles.css?raw";

const TOASTFLOW_STYLE_ATTR = "data-toastflow-styles";
let hasInjectedStyles = false;

export interface ToastflowPluginOptions {
  css?: boolean;
}

export function injectToastflowStyles(): void {
  if (hasInjectedStyles || typeof document === "undefined") {
    return;
  }

  const existing = document.head.querySelector<HTMLStyleElement>(
    `style[${TOASTFLOW_STYLE_ATTR}]`,
  );
  if (existing) {
    hasInjectedStyles = true;
    return;
  }

  const style = document.createElement("style");
  style.setAttribute(TOASTFLOW_STYLE_ATTR, "true");
  style.textContent = toastflowStyles;
  document.head.appendChild(style);
  hasInjectedStyles = true;
}

export function createToastflow(
  config: Partial<ToastConfig> = {},
  options: ToastflowPluginOptions = {},
): Plugin {
  const store = createToastStore(config);

  setToastStore(store);

  return {
    install(app: App) {
      if (options.css !== false) {
        injectToastflowStyles();
      }
      app.provide(toastStoreKey, store);
    },
  };
}
