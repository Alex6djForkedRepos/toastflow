import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import cssInjectedByJs from "vite-plugin-css-injected-by-js";
import path from "node:path";

export default defineConfig({
    plugins: [vue(), dts({ tsconfigPath: "./tsconfig.json", exclude: ["vite.config.ts"] }), cssInjectedByJs()],
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "Toastflow",
            fileName: (format) => `toastflow.${format}.js`
        },
        rollupOptions: {
            external: ["vue", "toastflow-core"],
            output: {
                globals: {
                    vue: "Vue",
                    "toastflow-core": "ToastflowCore"
                }
            }
        }
    }
});