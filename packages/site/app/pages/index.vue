<script setup lang="ts">
definePageMeta({
  layout: false,
  header: false,
  footer: false,
});

import {
  computed,
  defineAsyncComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";
import { toast, ToastContainer } from "vue-toastflow";
import Button from "@/components/Button.vue";
import Badge from "@/components/Badge.vue";
import { useGitHubStars } from "@/composables/useGitHubStars";

const Playground = defineAsyncComponent({
  loader: () => import("@/views/Playground.vue"),
});

type ThemeMode = "light" | "dark";
type SnowfallController = {
  startSnowflakes: () => void;
  stopSnowflakes: () => void;
};

const runtimeConfig = useRuntimeConfig();
const colorMode = useColorMode();
const { stars: githubStars } = useGitHubStars("adrianjanocko", "toastflow");

const libVersion = String(runtimeConfig.public.toastflowVersion ?? "0.0.0");
const seasonalMode = String(
  runtimeConfig.public.seasonalMode ?? "off",
).toLowerCase();
const hasWindow = import.meta.client;
const isHolidayMode = seasonalMode === "holiday";
const prefersReducedMotion =
  hasWindow &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const showMore = ref(true);
const hasMounted = ref(false);
const themeMode = computed<ThemeMode>(function () {
  return colorMode.value === "dark" ? "dark" : "light";
});
const isDarkTheme = computed(function () {
  return themeMode.value === "dark";
});
const themeToggleLabel = computed(function () {
  if (!hasMounted.value) {
    return "Toggle color mode";
  }

  return isDarkTheme.value ? "Switch to light mode" : "Switch to dark mode";
});
const siteUrl = "https://www.toastflow.top/";
const siteTitle = "Toast Notifications Playground for Vue and Nuxt | Toastflow";
const siteDescription =
  "Test Toastflow toast notifications for Vue 3 and Nuxt. Configure positions, timing, animations, and behaviors in an interactive live playground.";
const siteImage =
  "https://raw.githubusercontent.com/adrianjanocko/toastflow/main/assets/banner.png";
const umamiWebsiteId = String(runtimeConfig.public.umamiWebsiteId ?? "").trim();

function toggleTheme() {
  colorMode.preference = isDarkTheme.value ? "light" : "dark";
}

onMounted(function () {
  hasMounted.value = true;
});

useSeoMeta({
  title: siteTitle,
  description: siteDescription,
  keywords:
    "vue toast, nuxt toast, toast notifications, toastflow, vue toast library, nuxt module, toast messages, vue 3 notifications, nuxt toast plugin",
  robots: "index,follow",
  author: "Adrián Janočko",
  ogType: "website",
  ogLocale: "en_US",
  ogUrl: siteUrl,
  ogSiteName: "Toastflow",
  ogTitle: siteTitle,
  ogDescription: siteDescription,
  ogImage: siteImage,
  ogImageWidth: 1252,
  ogImageHeight: 679,
  twitterCard: "summary_large_image",
  twitterTitle: siteTitle,
  twitterDescription: siteDescription,
  twitterImage: siteImage,
  themeColor: "#0ea5e9",
});

useHead({
  title: siteTitle,
  titleTemplate: "%s",
  link: [
    { rel: "canonical", href: siteUrl },
    { rel: "manifest", href: "/site.webmanifest" },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon-96x96.png",
      sizes: "96x96",
    },
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    { rel: "shortcut icon", href: "/favicon.ico" },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "preload",
      as: "style",
      href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap",
    },
  ],
  meta: [
    {
      name: "apple-mobile-web-app-title",
      content: "Toastflow",
    },
  ],
  script: [
    ...(umamiWebsiteId
      ? [
          {
            defer: true,
            src: "https://cloud.umami.is/script.js",
            "data-website-id": umamiWebsiteId,
          },
        ]
      : []),
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Toastflow",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        url: siteUrl,
        image: siteImage,
        description:
          "Accessible, customizable toast notification library for Vue 3 and Nuxt with CSS-first theming, queue management, and headless mode.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        author: {
          "@type": "Person",
          name: "Adrian Janočko",
          url: "https://www.linkedin.com/in/adrianjanocko",
        },
      }),
    },
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Toastflow",
        url: siteUrl,
        logo: siteImage,
        sameAs: [
          "https://github.com/adrianjanocko/toastflow",
          "https://www.npmjs.com/package/vue-toastflow",
          "https://www.npmjs.com/package/nuxt-toastflow",
        ],
      }),
    },
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Is Toastflow accessible?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Toasts use alert/status live regions, ARIA labels, a built-in pause-on-hover, and a prefers-reduced-motion media query to keep animations gentle.",
            },
          },
          {
            "@type": "Question",
            name: "Does Toastflow support SSR?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The core store is isomorphic, the Vue renderer defers DOM access until mounted, and the Nuxt module works out of the box with SSR.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use Toastflow outside Vue components?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Install the plugin once, then call toast methods from stores or services. In Nuxt, use nuxt-toastflow and call auto-imported toast or useToast(). For non-Vue apps, use the headless toastflow-core store and render your own UI.",
            },
          },
          {
            "@type": "Question",
            name: "How do I style Toastflow to match my brand?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Override CSS variables or animation class names, pass a theme or animation override, or use the headless slot to ship a fully custom card with the same store logic.",
            },
          },
          {
            "@type": "Question",
            name: "How do I log or react to toast events?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Subscribe to toast.subscribe for state changes or toast.subscribeEvents for duplicate, update, and timer-reset signals, wire lifecycle hooks like onMount or onClose, and inspect toast.getState() when you need analytics.",
            },
          },
        ],
      }),
    },
  ],
});

let stopSnowfall: (() => void) | null = null;

if (isHolidayMode && !prefersReducedMotion) {
  onMounted(async function () {
    // vue-snowfall is browser-only, so keep it out of the SSR bundle.
    const { useSnowfall } = (await import("vue-snowfall")) as {
      useSnowfall: (options: { container: string }) => SnowfallController;
    };
    const snowfall = useSnowfall({
      container: "#snow-container",
    });
    stopSnowfall = snowfall.stopSnowflakes;
    snowfall.startSnowflakes();
    toast.show({
      type: "info",
      title: "Merry Christmas!",
      description: "Have a cozy holiday.",
      theme: "merry-christmas",
      duration: 3000,
      position: "top-left",
    });
    setTimeout(function () {
      toast.show({
        type: "success",
        title: "Happy New Year!",
        description: "Wishing you a joyful year ahead.",
        theme: "happy-new-year",
        duration: 3000,
        position: "top-right",
      });
    }, 1000);
  });

  onBeforeUnmount(function () {
    stopSnowfall?.();
  });
}

function openMore(targetId = "more-info", offsetPx = 20) {
  showMore.value = true;

  if (!targetId) {
    return;
  }

  nextTick(function () {
    const el = document.getElementById(targetId);
    if (!el) {
      return;
    }
    const y = el.getBoundingClientRect().top + window.scrollY - offsetPx;
    window.scrollTo({ top: y, behavior: "smooth" });
  });
}
</script>

<template>
  <div
    class="tf-playground-page ui-canvas relative min-h-screen overflow-hidden transition-colors duration-300"
  >
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:bg-slate-900 dark:focus:text-slate-100 dark:focus:ring-slate-300"
    >
      Skip to main content
    </a>

    <div
      v-if="isHolidayMode"
      id="snow-container"
      class="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />

    <div
      id="main-content"
      class="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-14 px-4 py-8"
    >
      <header
        class="flex flex-col items-center justify-between gap-2 sm:flex-row"
      >
        <div class="flex items-center gap-2">
          <h1
            class="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100"
          >
            Toastflow
            <span class="sr-only">- Toast notifications for Vue and Nuxt</span>
          </h1>
          <Badge variant="brand">
            <template #icon>
              <UIcon
                name="i-tabler-sparkles"
                class="ui-brand-pill-icon size-3"
              />
            </template>
            Playground
          </Badge>
        </div>

        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            :tooltip="themeToggleLabel"
            icon-only
            @click="toggleTheme"
          >
            <ClientOnly>
              <UIcon v-if="isDarkTheme" name="i-tabler-sun" class="size-4" />
              <UIcon v-else name="i-tabler-moon-stars" class="size-4" />
              <template #fallback>
                <UIcon name="i-tabler-moon-stars" class="size-4" />
              </template>
            </ClientOnly>
          </Button>

          <Button
            variant="outline"
            href="https://github.com/adrianjanocko/toastflow"
            target="_blank"
            tooltip="View on GitHub"
          >
            <UIcon name="i-tabler-brand-github-copilot" class="size-4" />
            GitHub
            <span
              v-if="githubStars !== null"
              class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-px text-[0.65rem] font-semibold tabular-nums text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              <UIcon
                name="i-tabler-star-filled"
                class="size-3 text-amber-400"
              />
              {{ githubStars }}
            </span>
          </Button>

          <Button variant="primary" href="/docs" tooltip="Open documentation">
            <UIcon name="i-tabler-book" class="size-4" />
            Documentation
          </Button>
        </div>
      </header>

      <main
        class="flex flex-1 flex-col items-center justify-start gap-12 pb-24 lg:justify-center lg:pb-0"
      >
        <section
          class="grid max-w-3xl gap-5 text-center text-base text-slate-500/90 dark:text-slate-400"
        >
          <h2
            class="text-[2.5rem] leading-[1.1] font-bold tracking-tight text-slate-950 dark:text-white"
          >
            Toast notifications playground
          </h2>
          <p class="mx-auto mb-1 max-w-2xl">
            Explore Toastflow - an accessible, lightweight toast notification
            library for Vue 3 and Nuxt. Configure positions, timing, animations,
            and behaviors in this interactive playground, then copy the
            generated code straight into your project.
          </p>
          <p
            class="text-[0.8rem] font-medium uppercase tracking-wide text-slate-400/80 dark:text-slate-500/80"
          >
            TypeScript-first - CSS-first theming - headless mode - SSR-ready -
            MIT licensed
          </p>
          <div class="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Button
              variant="primary"
              href="https://www.npmjs.com/package/vue-toastflow"
              target="_blank"
              tooltip="View Toastflow npm package for Vue"
            >
              Install for Vue
            </Button>
            <Button
              variant="primary"
              href="https://www.npmjs.com/package/nuxt-toastflow"
              target="_blank"
              tooltip="View Toastflow npm package for Nuxt"
            >
              Install for Nuxt
            </Button>
          </div>
        </section>

        <ClientOnly>
          <Playground :theme-mode="themeMode" />
          <template #fallback>
            <div
              class="flex w-full max-w-5xl items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
              style="min-height: 600px"
            >
              <div class="flex flex-col items-center gap-3 text-slate-400">
                <svg
                  class="size-6 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span class="text-sm">Loading playground…</span>
              </div>
            </div>
          </template>
        </ClientOnly>

        <div class="grid w-full max-w-5xl gap-4">
          <div class="flex justify-center">
            <Button
              variant="primary"
              :aria-expanded="showMore"
              aria-controls="more-info"
              @click="showMore ? (showMore = false) : openMore()"
            >
              {{ showMore ? "Hide details" : "Show details" }}
            </Button>
          </div>

          <div id="more-info" v-show="showMore" class="grid gap-6">
            <section
              class="grid w-full gap-5 rounded-3xl border border-slate-200/80 bg-white/95 p-8 text-sm text-slate-700 shadow-xl shadow-slate-200/30 backdrop-blur-md transition-colors dark:border-slate-700/40 dark:bg-slate-900/80 dark:text-slate-200 dark:shadow-none"
            >
              <div class="grid gap-2 text-left">
                <h2
                  class="text-xl font-semibold text-slate-900 dark:text-slate-100"
                >
                  Why Toastflow for Vue and Nuxt
                </h2>
                <p class="text-slate-600 dark:text-slate-300">
                  Toastflow ships sensible defaults for accessibility, queue
                  management, and keyboard shortcuts. It is a typed core with a
                  Vue renderer, Nuxt wrapper, CSS-first theming, and headless
                  hooks so you can render the same store logic with your own UI.
                  The library weighs under 5 kB gzipped, has zero runtime
                  dependencies, and supports Vue 3.5+ with full TypeScript
                  inference.
                </p>
              </div>

              <div class="grid gap-4 md:grid-cols-3">
                <div
                  class="rounded-2xl border border-slate-200/60 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-slate-800/65"
                >
                  <h3
                    class="text-base font-semibold text-slate-900 dark:text-slate-100"
                  >
                    Accessible toast notifications
                  </h3>
                  <p class="text-slate-600 dark:text-slate-300">
                    ARIA live-region toasts with focus management,
                    pause-on-hover, keyboard shortcuts, and a
                    prefers-reduced-motion media query ready for WCAG out of the
                    box.
                  </p>
                </div>
                <div
                  class="rounded-2xl border border-slate-200/60 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-slate-800/65"
                >
                  <h3
                    class="text-base font-semibold text-slate-900 dark:text-slate-100"
                  >
                    Flexible and customizable UI
                  </h3>
                  <p class="text-slate-600 dark:text-slate-300">
                    Configure placement, alignment, width, action buttons, and
                    HTML support. Override CSS variables, swap animation
                    classes, or use the headless slot to render a fully custom
                    toast card while keeping core behaviors.
                  </p>
                </div>
                <div
                  class="rounded-2xl border border-slate-200/60 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-slate-800/65"
                >
                  <h3
                    class="text-base font-semibold text-slate-900 dark:text-slate-100"
                  >
                    Lightweight and SSR-ready
                  </h3>
                  <p class="text-slate-600 dark:text-slate-300">
                    Minimal bundle with zero runtime dependencies, SSR-safe
                    guards, and CSS-only animations. Works with Vite, Nuxt SSR,
                    and edge runtimes without extra configuration.
                  </p>
                </div>
              </div>
            </section>

            <section
              id="install"
              class="grid gap-4 rounded-3xl border border-slate-200/80 bg-white/95 p-8 text-sm text-slate-700 shadow-xl shadow-slate-200/30 backdrop-blur-md transition-colors dark:border-slate-700/40 dark:bg-slate-900/80 dark:text-slate-200 dark:shadow-none"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2
                    class="text-xl font-semibold text-slate-900 dark:text-slate-100"
                  >
                    Install Toastflow for Vue and Nuxt
                  </h2>
                  <p class="text-slate-600 dark:text-slate-300">
                    Works with Vue 3.5+ and Nuxt 3/4. Install the Vue plugin or
                    the Nuxt module and start showing toast notifications in
                    minutes.
                  </p>
                </div>
                <div class="flex gap-2">
                  <Button
                    variant="primary"
                    href="/docs"
                    tooltip="Open Nuxt quick start"
                  >
                    Docs
                  </Button>
                  <Button
                    variant="outline"
                    href="https://www.npmjs.com/package/vue-toastflow"
                    target="_blank"
                    tooltip="Open Vue npm package"
                  >
                    vue npm
                  </Button>
                  <Button
                    variant="outline"
                    href="https://www.npmjs.com/package/nuxt-toastflow"
                    target="_blank"
                    tooltip="Open Nuxt npm package"
                  >
                    nuxt npm
                  </Button>
                </div>
              </div>

              <div
                class="rounded-2xl border border-slate-200/60 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-slate-800/65"
              >
                <p
                  class="mb-2 text-[0.9rem] font-semibold text-slate-900 dark:text-slate-100"
                >
                  Install
                </p>
                <pre
                  class="code-block bg-slate-900 p-3 text-slate-100"
                ><code>npm install vue-toastflow<br/>npm install nuxt-toastflow</code></pre>
              </div>

              <div class="grid gap-3">
                <p
                  class="text-[0.9rem] font-semibold text-slate-900 dark:text-slate-100"
                >
                  Common use cases
                </p>
                <ul
                  class="grid list-inside list-disc gap-2 text-slate-600 dark:text-slate-300"
                >
                  <li>
                    Product launches that need reliable, branded toast
                    notifications
                  </li>
                  <li>
                    Dashboards and admin panels that queue multiple events
                    without overlap
                  </li>
                  <li>
                    Nuxt SSR apps that require server-safe notification
                    components
                  </li>
                  <li>
                    Teams looking for a typed, accessible Vue toast library with
                    headless support
                  </li>
                </ul>
              </div>
            </section>

            <section
              class="grid gap-4 rounded-3xl border border-slate-200/80 bg-white/95 p-8 text-sm text-slate-700 shadow-xl shadow-slate-200/30 backdrop-blur-md transition-colors dark:border-slate-700/40 dark:bg-slate-900/80 dark:text-slate-200 dark:shadow-none"
            >
              <div class="grid gap-2">
                <h2
                  class="text-xl font-semibold text-slate-900 dark:text-slate-100"
                >
                  Frequently asked questions
                </h2>
                <p class="text-slate-600 dark:text-slate-300">
                  Quick answers for developers and teams evaluating Toastflow as
                  their Vue or Nuxt toast notification solution.
                </p>
              </div>
              <div class="grid gap-3">
                <div
                  class="rounded-xl border border-slate-200/60 bg-slate-50/60 p-3 dark:border-white/5 dark:bg-slate-800/65"
                >
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">
                    Is Toastflow accessible?
                  </h3>
                  <p class="text-slate-600 dark:text-slate-300">
                    Yes. Toasts use alert/status live regions, ARIA labels,
                    pause-on-hover, and a prefers-reduced-motion media query to
                    keep animations gentle.
                  </p>
                </div>
                <div
                  class="rounded-xl border border-slate-200/60 bg-slate-50/60 p-3 dark:border-white/5 dark:bg-slate-800/65"
                >
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">
                    Does it support SSR?
                  </h3>
                  <p class="text-slate-600 dark:text-slate-300">
                    The core store is isomorphic, the Vue renderer defers DOM
                    access until mounted, and the Nuxt wrapper keeps the setup
                    client-safe.
                  </p>
                </div>
                <div
                  class="rounded-xl border border-slate-200/60 bg-slate-50/60 p-3 dark:border-white/5 dark:bg-slate-800/65"
                >
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">
                    Can I use it outside Vue components?
                  </h3>
                  <p class="text-slate-600 dark:text-slate-300">
                    Yes. Install the plugin once, then call
                    <code>toast.*</code> from stores or services. In Nuxt, use
                    auto-imported <code>toast</code> or <code>useToast()</code>.
                    For non-Vue apps, use the headless
                    <code>toastflow-core</code> store.
                  </p>
                </div>
                <div
                  class="rounded-xl border border-slate-200/60 bg-slate-50/60 p-3 dark:border-white/5 dark:bg-slate-800/65"
                >
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">
                    How do I style it to match my brand?
                  </h3>
                  <p class="text-slate-600 dark:text-slate-300">
                    Override CSS variables, pass a <code>theme</code> or inline
                    <code>css</code>
                    object, or use the headless slot to ship a fully custom
                    card.
                  </p>
                </div>
                <div
                  class="rounded-xl border border-slate-200/60 bg-slate-50/60 p-3 dark:border-white/5 dark:bg-slate-800/65"
                >
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">
                    How do I log or react to toast events?
                  </h3>
                  <p class="text-slate-600 dark:text-slate-300">
                    Subscribe to <code>toast.subscribe</code> for state changes
                    or <code>toast.subscribeEvents</code> for duplicate, update,
                    and timer-reset signals, then wire your analytics from
                    there.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer class="flex w-full justify-center text-[11px]">
        <div class="flex items-center gap-2">
          <span class="font-medium text-slate-800 dark:text-slate-200"
            >Built by</span
          >
          <Button
            variant="ghost"
            href="https://www.linkedin.com/in/adrianjanocko"
            target="_blank"
            tooltip="Open LinkedIn profile"
            class="p-0! bg-transparent! text-slate-600! hover:text-slate-900! dark:text-slate-300! dark:hover:text-slate-100!"
          >
            @adrianjanocko
          </Button>
        </div>
      </footer>
    </div>

    <ToastContainer />

    <div
      class="fixed bottom-3 left-3 z-50 inline-flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-white/80 px-2.5 py-1 text-[0.6rem] font-medium text-slate-500 backdrop-blur-md select-none dark:border-slate-700/50 dark:bg-slate-900/70 dark:text-slate-400"
      :title="`vue-toastflow v${libVersion}`"
    >
      <span
        class="size-1.5 rounded-full"
        :class="libVersion.includes('beta') ? 'bg-amber-400' : 'bg-emerald-400'"
      />
      v{{ libVersion }}
    </div>
  </div>
</template>

<style src="../assets/css/playground.css"></style>

<style>
.tf-toast-accent--merry-christmas {
  --tf-toast-bg: #c33232;
  --tf-toast-border-color: #f7ede2;
  --tf-toast-color: #fff7f2;
  --tf-toast-description-color: #fdeae2;
  --tf-toast-progress-bg: color-mix(in srgb, #f7ede2 20%, transparent);
  --tf-toast-progress-bar-bg: #f7ede2;

  --tf-toast-icon-info: #fff;
}

.tf-toast-accent--happy-new-year {
  --tf-toast-bg: #1c2133;
  --tf-toast-border-color: #f7ede2;
  --tf-toast-color: #fff8f3;
  --tf-toast-description-color: #f2e6d9;
  --tf-toast-progress-bg: color-mix(in srgb, #f7ede2 22%, transparent);
  --tf-toast-progress-bar-bg: #f1c46b;

  --tf-toast-icon-success: #f1c46b;
}
</style>
