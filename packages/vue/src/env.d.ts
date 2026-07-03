declare module "*.css";
declare module "*.css?raw" {
  const content: string;
  export default content;
}

// Fallback for plain `tsc --noEmit`; vue-tsc/vite-plugin-dts resolve real SFC types.
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >;
  export default component;
}
