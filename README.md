# makaria-site

Website der AMV Makaria Bonn — SvelteKit + Tailwind v4, built as a fully static site (`adapter-static`), deployed to Uberspace.

## Developing

```sh
npm install
npm run dev -- --open
```

## Checks

```sh
npm run format   # prettier --write
npm run lint      # prettier --check + eslint
npm run check     # svelte-check (types)
```

## Building

```sh
npm run build      # outputs to build/, root-relative paths
npm run preview    # serve the production build locally
```

To build a copy for a preview subfolder (e.g. `amv-makaria.de/neu/`) instead of the domain root:

```sh
BASE_PATH=/neu VITE_NOINDEX=true npm run build
```

`BASE_PATH` prefixes all internal links/assets; `VITE_NOINDEX` adds a `noindex` meta tag so the preview doesn't get crawled. Omit both for a normal production build.

## Deploying

The build output in `build/` is plain static HTML/CSS/JS/images — copy it to the Uberspace document root (or a subfolder of it) with `rsync`. No Node process required on the server.
