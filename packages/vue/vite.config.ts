import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import path from "node:path";

export default defineConfig({
    plugins: [vue(), dts({ tsconfigPath: "./tsconfig.json", exclude: ["vite.config.ts"], entryRoot: "src" })],
    build: {
        sourcemap: true,
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            formats: ["es"],
            fileName: (format) => `toastflow.${format}.js`
        },
        rollupOptions: {
            external: ["vue", "toastflow-core"]
        }
    }
});
