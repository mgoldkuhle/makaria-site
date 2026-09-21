/* -------------------------------------------------------------------------
   The Vorstand named in the Impressum (Präside, Kassenwart, Schriftwart of the
   Aktivitas). Offices are maintained in Meine Makaria; the Supabase view
   `website_vorstand` (sql/migration_website_vorstand_view_2026-09.sql in the
   Makaria repo) exposes only these three filled offices: title in the form
   matching the holder, first and last name.

   Unlike the events, the Impressum must never render without it, so the page
   loads this at build time (prerendered into the HTML, build fails if it
   cannot) and refreshes it in the browser afterwards.
   ------------------------------------------------------------------------- */

const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export type Vorstandsmitglied = {
	/** "Präside" / "Präsidin", "Kassenwart" / "Kassenwartin", ... */
	amt: string;
	name: string;
};

/**
 * Sorted by office (Präside, Kassenwart, Schriftwart). Returns null when
 * Supabase is not configured; throws on a failed request.
 */
export async function fetchVorstand(
	fetchFn: typeof fetch = fetch
): Promise<Vorstandsmitglied[] | null> {
	if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
	const url =
		`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/website_vorstand` +
		`?select=amt,vorname,nachname&order=sortierung.asc`;
	const response = await fetchFn(url, {
		headers: {
			apikey: SUPABASE_ANON_KEY,
			Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
			Accept: 'application/json'
		}
	});
	if (!response.ok) {
		throw new Error(`Supabase antwortete mit ${response.status} ${response.statusText}`);
	}
	const rows: unknown = await response.json();
	if (!Array.isArray(rows)) return [];
	return rows.flatMap((row: Record<string, unknown>) => {
		const amt = typeof row.amt === 'string' ? row.amt.trim() : '';
		const name = [row.vorname, row.nachname]
			.filter((part): part is string => typeof part === 'string' && part.trim() !== '')
			.map((part) => part.trim())
			.join(' ');
		return amt && name ? [{ amt, name }] : [];
	});
}
