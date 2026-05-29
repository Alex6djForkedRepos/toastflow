export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("highlightjs", { render: () => null });
});
