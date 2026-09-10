# makaria-site

Website der AMV Makaria Bonn. SvelteKit + Tailwind v4, built as a fully static site (`adapter-static`), deployed to Uberspace.

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

## Events (Supabase)

The Veranstaltungen page reads the 9 newest rows from a Supabase `events` table
via PostgREST. Copy `.env.example` to `.env` and fill in:

| variable                 | purpose                                    |
| ------------------------ | ------------------------------------------ |
| `VITE_SUPABASE_URL`      | project URL                                |
| `VITE_SUPABASE_ANON_KEY` | anon key (public by design)                |
| `VITE_EVENT_IMAGE_BASE`  | Cloudflare folder the event images live in |

Expected columns — `id`, `title`, `image`, `image_alt`, `starts_on` (date),
`ends_on` (date, null for single-day), `starts_at` (time, optional),
`description` (optional), `labels` (text[] of `Intern` / `SV` / `Abgesagt`).
Table, columns and sort order are constants at the top of
[`src/lib/data/events.ts`](src/lib/data/events.ts).

Two things to know:

- The table needs an RLS policy allowing `anon` to `SELECT`, or the request
  succeeds and returns an empty array.
- The fetch runs **in the browser after hydration**, not at build time, so
  editing an event in Supabase shows up without redeploying. The trade-off is
  that the list is not in the prerendered HTML, so search engines and link
  previews won't see individual events. Moving the fetch into a `+page.ts` load
  would reverse both.

While the variables are unset the page renders `placeholderEvents` from the same
file, so the layout still works. **Those dates are invented and must be replaced
before the site goes live.**
