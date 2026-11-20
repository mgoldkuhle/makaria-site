import { building } from '$app/environment';
import { FALLBACK_VORSTAND, fetchVorstand, sameVorstand } from '$lib/data/vorstand';
import type { PageLoad } from './$types';

// Runs while the page is prerendered, so the names are in the static HTML: an
// Impressum has to be complete without JavaScript and when Supabase is
// unreachable. If the fetch fails or comes back empty, the last known Vorstand
// is used instead, so a Supabase outage never blocks a deploy or ships an
// Impressum without names. The warnings show up in the build log.
//
// A universal load rather than +page.server.ts on purpose: a server load
// makes the build emit impressum/__data.json, and that `impressum/` folder
// makes Apache redirect /impressum to /impressum/ (403) instead of serving
// impressum.html.
export const load: PageLoad = async ({ fetch }) => {
	try {
		const vorstand = await fetchVorstand(fetch);
		if (!vorstand?.length) {
			throw new Error(
				vorstand
					? 'website_vorstand lieferte keine besetzten Ämter.'
					: 'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY fehlen (.env).'
			);
		}
		if (building && !sameVorstand(vorstand, FALLBACK_VORSTAND)) {
			console.warn(
				'[impressum] FALLBACK_VORSTAND in src/lib/data/vorstand.ts ist veraltet, bitte aktualisieren:',
				vorstand
			);
		}
		return { vorstand };
	} catch (error) {
		console.warn(
			'[impressum] Vorstand nicht geladen, verwende FALLBACK_VORSTAND:',
			error instanceof Error ? error.message : error
		);
		return { vorstand: [...FALLBACK_VORSTAND] };
	}
};
