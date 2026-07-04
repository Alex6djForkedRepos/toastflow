import type { DefinedCollection } from "@nuxt/content";
import { defineCollection, defineContentConfig, z } from "@nuxt/content";
import { defineSitemapSchema } from "@nuxtjs/sitemap/content";

const createDocsSchema = () =>
  z.object({
    links: z
      .array(
        z.object({
          label: z.string(),
          icon: z.string(),
          to: z.string(),
          target: z.string().optional(),
        }),
      )
      .optional(),
    sitemap: defineSitemapSchema({ z }),
  });

const collections: Record<string, DefinedCollection> = {
  landing: defineCollection({
    type: "page",
    source: "index.md",
  }),
  docs: defineCollection({
    type: "page",
    source: {
      include: "docs/**",
      exclude: ["docs/index.md"],
      prefix: "/docs",
    },
    schema: createDocsSchema(),
  }),
};

export default defineContentConfig({ collections });
