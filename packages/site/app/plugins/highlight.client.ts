import hljsVuePlugin from "@highlightjs/vue-plugin";
import "highlight.js/lib/common";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(hljsVuePlugin);
});
