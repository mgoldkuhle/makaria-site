import { building } from '$app/environment';
import { fetchVorstand } from '$lib/data/vorstand';
import type { PageServerLoad } from './$types';

// Runs once, while the page is prerendered, so the names are in the static
// HTML: an Impressum has to be complete without JavaScript and when Supabase
// is unreachable. A build that cannot fetch them fails instead of shipping an
// Impressum without a Vorstand. In `vite dev` a failure only shows a hint.
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
		return { vorstand };
	} catch (error) {
		if (building) {
			throw new Error(`Impressum: Vorstand konnte nicht geladen werden. ${String(error)}`, {
				cause: error
			});
		}
		console.error('[impressum] Vorstand nicht geladen:', error);
		return { vorstand: null };
	}
};
