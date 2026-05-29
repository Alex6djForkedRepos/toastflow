<script setup lang="ts">
import type { ContentNavigationItem, PageCollections } from "@nuxt/content";
import * as nuxtUiLocales from "@nuxt/ui/locale";
import { ToastContainer } from "vue-toastflow";

function transformNavigation(
  data: ContentNavigationItem[],
  isI18nEnabled: boolean,
  locale?: string,
): ContentNavigationItem[] {
  if (isI18nEnabled && locale) {
    const localeResult =
      data.find((item) => item.path === `/${locale}`)?.children || data;

    return (
      localeResult.find((item) => item.path === `/${locale}/docs`)?.children ||
      localeResult
    );
  }

  return data.find((item) => item.path === "/docs")?.children || data;
}

const appConfig = useAppConfig();
const { seo } = appConfig;
const forcedColorMode = (appConfig.docus as { colorMode?: string } | undefined)
  ?.colorMode;
const faviconHref = computed(
  () => appConfig.header?.logo?.favicon || "/favicon.svg",
);
const site = useSiteConfig();
const route = useRoute();
const { locale, locales, isEnabled, switchLocalePath } = useDocusI18n();
const {
  isEnabled: isAssistantEnabled,
  panelWidth: assistantPanelWidth,
  shouldPushContent,
} = useAssistant();

const nuxtUiLocale = computed(
  () =>
    nuxtUiLocales[locale.value as keyof typeof nuxtUiLocales] ||
    nuxtUiLocales.en,
);
const lang = computed(() => nuxtUiLocale.value.code);
const dir = computed(() => nuxtUiLocale.value.dir);
const collectionName = computed(() =>
  isEnabled.value ? `docs_${locale.value}` : "docs",
);
const isDocsRoute = computed(() => route.meta.layout === "docs");

useHead({
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: computed(() => [
    {
      rel: "icon",
      href: faviconHref.value,
      type: faviconHref.value.endsWith(".svg") ? "image/svg+xml" : undefined,
    },
    { rel: "shortcut icon", href: "/favicon.ico" },
  ]),
  htmlAttrs: {
    lang,
    dir,
  },
});

useSeoMeta({
  title: seo.title,
  description: seo.description,
  ogSiteName: site.name,
  twitterCard: "summary_large_image",
});

if (isEnabled.value) {
  const defaultLocale = useRuntimeConfig().public.i18n.defaultLocale!;

  onMounted(() => {
    const currentLocale = route.path.split("/")[1];
    if (!locales.some((item) => item.code === currentLocale)) {
      return navigateTo(switchLocalePath(defaultLocale) as string);
    }
  });
}

const { data: navigation } = await useAsyncData(
  () => `navigation_${collectionName.value}`,
  () =>
    queryCollectionNavigation(collectionName.value as keyof PageCollections),
  {
    transform: (data: ContentNavigationItem[]) =>
      transformNavigation(data, isEnabled.value, locale.value),
    watch: [locale],
  },
);

const { data: files } = useLazyAsyncData(
  `search_${collectionName.value}`,
  () =>
    queryCollectionSearchSections(
      collectionName.value as keyof PageCollections,
    ),
  {
    server: false,
    watch: [locale],
  },
);

provide("navigation", navigation);

const { subNavigationMode } = useSubNavigation(navigation);
</script>

<template>
  <UApp :locale="nuxtUiLocale">
    <NuxtLoadingIndicator color="var(--ui-primary)" />

    <div
      :class="[
        isDocsRoute && isAssistantEnabled && shouldPushContent
          ? 'transition-[margin-right] duration-200 ease-linear will-change-[margin-right]'
          : '',
        { 'tf-docs-shell': isDocsRoute },
        { 'docus-sub-header': isDocsRoute && subNavigationMode === 'header' },
      ]"
      :style="{
        marginRight:
          isDocsRoute && isAssistantEnabled && shouldPushContent
            ? `${assistantPanelWidth}px`
            : '0',
      }"
    >
      <AppHeader v-if="isDocsRoute && $route.meta.header !== false" />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <AppFooter v-if="isDocsRoute && $route.meta.footer !== false" />
    </div>

    <ClientOnly>
      <LazyUContentSearch
        v-if="isDocsRoute"
        :files="files"
        :navigation="navigation"
        :color-mode="!forcedColorMode"
      />
      <template v-if="isDocsRoute && isAssistantEnabled">
        <LazyAssistantPanel />
        <LazyAssistantFloatingInput />
      </template>
    </ClientOnly>

    <ToastContainer v-if="isDocsRoute" />
  </UApp>
</template>

<style>
html {
  scrollbar-gutter: stable;
}

@media (min-width: 1024px) {
  .docus-sub-header {
    /* 64px base header + 48px sub-navigation bar */
    --ui-header-height: 112px;
  }

  .tf-docs-shell main > div > [data-slot="root"],
  .tf-docs-shell
    main
    > div
    > [data-slot="root"]
    > [data-slot="center"]
    > [data-slot="root"] {
    display: grid;
    grid-template-columns: repeat(10, minmax(0, 1fr));
    gap: 2.5rem;
    align-items: start;
  }

  .tf-docs-shell main > div > [data-slot="root"] > [data-slot="left"] {
    grid-column: span 2 / span 2;
  }

  .tf-docs-shell main > div > [data-slot="root"] > [data-slot="center"],
  .tf-docs-shell
    main
    > div
    > [data-slot="root"]
    > [data-slot="center"]
    > [data-slot="root"]
    > [data-slot="center"] {
    grid-column: span 8 / span 8;
    min-width: 0;
  }

  .tf-docs-shell
    main
    > div
    > [data-slot="root"]
    > [data-slot="center"]
    > [data-slot="root"]
    > [data-slot="right"] {
    grid-column: span 2 / span 2;
  }
}
</style>
