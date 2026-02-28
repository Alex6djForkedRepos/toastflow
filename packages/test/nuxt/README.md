# Nuxt Toastflow Test App

This app is a local smoke test for `nuxt-toastflow`

It mounts `ToastContainer` and uses `useToast()` to trigger multiple scenarios:

- basic type toasts
- `show` and `update` flows
- `loading` success/error flows
- queue/maxVisible behavior
- duplicate prevention behavior
- dismiss single/all actions

## Setup

Install dependencies from the monorepo root:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm --filter test-nuxt-toastflow dev
```

## Production

Build the application for production:

```bash
pnpm --filter test-nuxt-toastflow build
```

Locally preview production build:

```bash
pnpm --filter test-nuxt-toastflow preview
```
