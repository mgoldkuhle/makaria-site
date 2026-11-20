import { FALLBACK_VORSTAND, fetchVorstand, sameVorstand } from '$lib/data/vorstand';
import type { PageServerLoad } from './$types';

// Runs once, while the page is prerendered, so the names are in the static
// HTML: an Impressum has to be complete without JavaScript and when Supabase
// is unreachable. If the fetch fails or comes back empty, the last known
// Vorstand is used instead, so a Supabase outage never blocks a deploy or
// ships an Impressum without names. The warnings show up in the build log.
export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const vorstand = await fetchVorstand(fetch);
		if (!vorstand?.length) {
			throw new Error(
				vorstand
					? 'website_vorstand lieferte keine besetzten Ämter.'
					: 'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY fehlen (.env).'
			);
		}
		if (!sameVorstand(vorstand, FALLBACK_VORSTAND)) {
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
