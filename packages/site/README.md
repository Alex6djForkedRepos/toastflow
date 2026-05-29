# Toastflow Site

Unified Nuxt site for Toastflow documentation and the interactive playground.

## What lives here

- Docus-powered docs split into `Global`, `Vue`, `Nuxt`, and `Headless`
- `/` is the custom playground homepage
- `/docs` serves the Docus documentation
- Favicons and shared public images are served from the repository root `assets/` folder

## Local development

```bash
pnpm --filter toastflow-site dev
```

## Build

```bash
pnpm --filter toastflow-site build
pnpm --filter toastflow-site preview
```

## Environment

Copy values from [`.env.example`](./.env.example).

- `NUXT_PUBLIC_GISCUS_*` is optional and only affects the playground feedback modal.
- `NUXT_DEVTOOLS=true` opts into Nuxt DevTools locally. They are disabled by default for this app because Docus already makes dev heavy.
- `AI_GATEWAY_API_KEY` is optional server-only auth for the Docus assistant. It must be a Vercel AI Gateway key, not an `OPENAI_API_KEY`.
- `NUXT_DOCUS_ASSISTANT_MODEL` overrides the Docus assistant model. The default is `google/gemini-3-flash`.
- `NUXT_DOCUS_DEV_PORT` is optional. Set it when Nuxt auto-selects a different local port for dev.
- `NUXT_DOCUS_MCP_SERVER` is optional. Set it to a full URL such as `http://127.0.0.1:3001/mcp` to override MCP resolution.
