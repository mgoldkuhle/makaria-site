/* -------------------------------------------------------------------------
   The Vorstand named in the Impressum (Präside, Kassenwart, Schriftwart of the
   Aktivitas). Offices are maintained in Meine Makaria; the Supabase view
   `website_vorstand` (sql/migration_website_vorstand_view_2026-09.sql in the
   Makaria repo) exposes only these three filled offices: title in the form
   matching the holder, first and last name.

   Unlike the events, the Impressum must never render without it, so the page
   loads this at build time (prerendered into the HTML) and refreshes it in the
   browser afterwards. When the build cannot reach Supabase it falls back to
   FALLBACK_VORSTAND below and warns, rather than failing or shipping an
   Impressum without names.
   ------------------------------------------------------------------------- */

const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export type Vorstandsmitglied = {
	/** "Präside" / "Präsidin", "Kassenwart" / "Kassenwartin", ... */
	amt: string;
	name: string;
};

/**
 * Last known Vorstand, used when the build cannot load it (Supabase down, no
 * .env, view empty). The build warns whenever this differs from Meine Makaria,
 * so update it then. As of 2026-11-20.
 */
export const FALLBACK_VORSTAND: readonly Vorstandsmitglied[] = [
	{ amt: 'Präside', name: 'Lukas Raschke' },
	{ amt: 'Kassenwart', name: 'Laurent Tarabout' },
	{ amt: 'Schriftwartin', name: 'Lara Sophie Amann' }
];

/** True when both lists name the same people in the same offices and order. */
export function sameVorstand(
	a: readonly Vorstandsmitglied[],
	b: readonly Vorstandsmitglied[]
): boolean {
	return a.length === b.length && a.every((m, i) => m.amt === b[i].amt && m.name === b[i].name);
}

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
