import { createToastflow } from "vue-toastflow";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(
    createToastflow({
      position: "top-right",
      duration: 5000,
      maxVisible: 5,
    }),
  );
});
