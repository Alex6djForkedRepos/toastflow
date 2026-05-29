import type { DefinedCollection } from "@nuxt/content";
import { defineCollection, defineContentConfig, z } from "@nuxt/content";
import { useNuxt } from "@nuxt/kit";
import { joinURL } from "ufo";

const { options } = useNuxt();
const cwd = joinURL(options.rootDir, "content");

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
  });

const collections: Record<string, DefinedCollection> = {
  landing: defineCollection({
    type: "page",
    source: {
      cwd,
      include: "index.md",
    },
  }),
  docs: defineCollection({
    type: "page",
    source: {
      cwd,
      include: "docs/**",
      prefix: "/docs",
      exclude: ["index.md"],
    },
    schema: createDocsSchema(),
  }),
};

export default defineContentConfig({ collections });
