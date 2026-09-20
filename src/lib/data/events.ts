import { asset } from '$app/paths';

/* -------------------------------------------------------------------------
   Events come from a Supabase table, read through PostgREST directly rather
   than via @supabase/supabase-js — the query is one GET, so the SDK would be
   a dependency for nothing.

   The site is fully prerendered, so this runs in the browser after hydration.
   That means an event can be edited in Supabase and appears without a rebuild,
   at the cost of the list not being in the prerendered HTML (see README note).
   ------------------------------------------------------------------------- */

// PLACEHOLDER — set these in .env (see .env.example). While unset, the page
// falls back to the sample events below, so it still renders.
const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// PLACEHOLDER — the Cloudflare folder the event images live in, e.g.
// 'https://pub-xxxx.r2.dev/events'. A row's `image` is joined onto this unless
// it is already an absolute URL or a local /img path.
const IMAGE_BASE: string = import.meta.env.VITE_EVENT_IMAGE_BASE ?? '';

// View in the Meine Makaria database (sql/migration_website_veranstaltungen_view_2026-09.sql
// in the Makaria repo). Only published events, only display fields.
const TABLE = 'website_veranstaltungen';
const COLUMNS = 'id,title,image,image_alt,starts_on,ends_on,starts_at,description,labels';
/** Upcoming rows the landing page needs for its cards. */
const LANDING_COUNT = 3;
/**
 * Rows the landing page pulls before Intern events are filtered out. Wider than
 * LANDING_COUNT on purpose: Intern events are dropped client-side, so fetching
 * only three would leave gaps whenever a couple of them fall next in the diary.
 */
export const LANDING_WINDOW = 12;
/** Upper bound for the Veranstaltungen page, which lists every upcoming event. */
export const UPCOMING_LIMIT = 100;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/* ---- shape --------------------------------------------------------------- */

export type EventLabel = 'Intern' | 'SV' | 'Abgesagt';

export type MakariaEvent = {
	id: string;
	title: string;
	/** Filename inside the Cloudflare folder, an absolute URL, or a local /img path. */
	image: string | null;
	imageAlt: string | null;
	/** ISO date, YYYY-MM-DD. */
	startsOn: string;
	/** ISO date for events spanning several days, else null. */
	endsOn: string | null;
	/** HH:MM or HH:MM:SS, else null. */
	startsAt: string | null;
	description: string | null;
	labels: EventLabel[];
};

/** Chip colours. These sit on a photo, so each needs a solid fill of its own. */
export const labelStyles: Record<EventLabel, string> = {
	Intern: 'bg-gold text-ink',
	SV: 'bg-blue text-ink',
	Abgesagt: 'bg-red text-white'
};

/** Every label the site knows, in the order the filter shows them. */
export const EVENT_LABELS: readonly EventLabel[] = ['Intern', 'SV', 'Abgesagt'];

/* ---- fetching ------------------------------------------------------------ */

type Row = Record<string, unknown>;

function str(value: unknown): string | null {
	return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

/** Accepts a Postgres text[], a JSON array, or a comma-separated string. */
function toLabels(value: unknown): EventLabel[] {
	const raw = Array.isArray(value)
		? value
		: typeof value === 'string'
			? value.replace(/^\{|\}$/g, '').split(',')
			: [];
	return raw
		.map((entry) => String(entry).trim().replace(/^"|"$/g, ''))
		.filter((entry): entry is EventLabel => (EVENT_LABELS as readonly string[]).includes(entry));
}

/**
 * Descriptions are maintained as Markdown in Meine Makaria; the cards show
 * plain text. Mirrors stripMarkdown() in makaria-admin/src/lib/utils.ts.
 */
function stripMarkdown(text: string): string {
	return text
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/\*\*(.+?)\*\*/g, '$1')
		.replace(/\*(.+?)\*/g, '$1')
		.replace(/^- /gm, '')
		.replace(/^(\d+)\. /gm, (match, num: string, offset: number, all: string) => {
			// Only real list items: a leading "1." or a follow-up after another item,
			// never dates like "6. November".
			if (num === '1') return '';
			const prevLine = all.substring(0, offset).split('\n').slice(-2, -1)[0] ?? '';
			return /^\d+\. /.test(prevLine) ? '' : match;
		})
		.replace(/ {2}\n/g, '\n');
}

function toEvent(row: Row): MakariaEvent {
	const description = str(row.description);
	return {
		id: String(row.id ?? crypto.randomUUID()),
		title: str(row.title) ?? 'Ohne Titel',
		image: str(row.image),
		imageAlt: str(row.image_alt),
		startsOn: str(row.starts_on) ?? '',
		endsOn: str(row.ends_on),
		startsAt: str(row.starts_at),
		description: description ? stripMarkdown(description) : null,
		labels: toLabels(row.labels)
	};
}

async function query(params: string, fetchFn: typeof fetch): Promise<MakariaEvent[]> {
	const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${TABLE}?select=${encodeURIComponent(COLUMNS)}&${params}`;
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
	return Array.isArray(rows) ? rows.map((row) => toEvent(row as Row)) : [];
}

/** Today as YYYY-MM-DD in local time, so comparisons match the stored dates. */
function todayIso(): string {
	const now = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Soonest first, limited to events that have not finished yet. Returns null
 * when Supabase is not configured yet, which callers treat as "show the
 * placeholders"; throws on a real failure, so a misconfigured key is visible
 * rather than looking empty. A multi-day
 * event still running today counts as upcoming, hence the check against
 * ends_on as well — for single-day rows ends_on is null and the or() falls
 * through to starts_on.
 */
export async function fetchUpcomingEvents(
	limit: number = LANDING_COUNT,
	fetchFn: typeof fetch = fetch
): Promise<MakariaEvent[] | null> {
	if (!isSupabaseConfigured) return null;
	const today = todayIso();
	const params =
		`or=(ends_on.gte.${today},starts_on.gte.${today})` + `&order=starts_on.asc&limit=${limit}`;
	return query(params, fetchFn);
}

/* ---- selection ----------------------------------------------------------- */

/** Not finished yet — the end date decides for multi-day events. */
export function isUpcoming(event: MakariaEvent, today = todayIso()): boolean {
	return (event.endsOn ?? event.startsOn) >= today;
}

export type LandingEvents = { next: MakariaEvent | null; highlights: MakariaEvent[] };

/** Internal events are for members; the landing page shows public ones only. */
export const isPublicEvent = (event: MakariaEvent) => !event.labels.includes('Intern');

/** Open to anyone: neither members-only nor an SV event. */
export const isOpenEvent = (event: MakariaEvent) =>
	!event.labels.includes('Intern') && !event.labels.includes('SV');

/**
 * What the landing page shows: the next `count` upcoming public events, soonest
 * first. Intern events are left to the Veranstaltungen page. Past events never
 * appear; with nothing upcoming the row stays empty and the page shows a hint.
 */
export function selectLandingEvents(
	upcoming: MakariaEvent[],
	count = LANDING_COUNT
): LandingEvents {
	const shown = upcoming.filter(isPublicEvent);
	return { highlights: shown.slice(0, count), next: shown[0] ?? null };
}

/** Same rule applied to a local array, for the placeholder path. */
export function landingFromLocal(events: MakariaEvent[], count = LANDING_COUNT): LandingEvents {
	return selectLandingEvents(upcomingFromLocal(events), count);
}

/** Placeholder path of the Veranstaltungen page: upcoming only, soonest first. */
export function upcomingFromLocal(events: MakariaEvent[]): MakariaEvent[] {
	return events
		.filter((event) => isUpcoming(event))
		.sort((a, b) => a.startsOn.localeCompare(b.startsOn));
}

/* ---- presentation helpers ------------------------------------------------ */

/** Local-midnight Date, so Intl never shifts the day across a timezone offset. */
function parseDate(iso: string): Date | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
	if (!match) return null;
	return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

const dayMonthYear = new Intl.DateTimeFormat('de-DE', {
	day: 'numeric',
	month: 'long',
	year: 'numeric'
});
const dayMonth = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long' });

/**
 * "24. Oktober 2026" · "19.–21. Juni 2027" (same month) ·
 * "30. Mai – 2. Juni 2027" (same year) · full range across a year boundary.
 */
export function formatEventDate(event: Pick<MakariaEvent, 'startsOn' | 'endsOn'>): string {
	const start = parseDate(event.startsOn);
	if (!start) return '';
	const end = event.endsOn ? parseDate(event.endsOn) : null;
	if (!end || end.getTime() <= start.getTime()) return dayMonthYear.format(start);

	if (start.getFullYear() !== end.getFullYear()) {
		return `${dayMonthYear.format(start)} – ${dayMonthYear.format(end)}`;
	}
	if (start.getMonth() !== end.getMonth()) {
		return `${dayMonth.format(start)} – ${dayMonthYear.format(end)}`;
	}
	return `${start.getDate()}.–${dayMonthYear.format(end)}`;
}

/**
 * The semester the given date falls in: "Sommersemester 26" (15 April to
 * 14 October) or "Wintersemester 26/27" (15 October to 14 April). A winter
 * semester is named after the year it *starts* in, so January to mid-April
 * still belongs to the one that began the previous October.
 */
export function semesterLabel(now: Date = new Date()): string {
	const yy = (year: number) => String(year % 100).padStart(2, '0');
	const year = now.getFullYear();
	// Month and day as one comparable number (415 = 15 April, 1015 = 15 October),
	// which keeps the boundary check to a single range test.
	const monthDay = (now.getMonth() + 1) * 100 + now.getDate();
	if (monthDay >= 415 && monthDay < 1015) return `Sommersemester ${yy(year)}`;
	const start = monthDay >= 1015 ? year : year - 1;
	return `Wintersemester ${yy(start)}/${yy(start + 1)}`;
}

/** "20 Uhr" for a full hour, "20:30 Uhr" otherwise. */
export function formatEventTime(startsAt: string | null): string | null {
	if (!startsAt) return null;
	const match = /^(\d{1,2}):(\d{2})/.exec(startsAt);
	if (!match) return null;
	const [, hour, minute] = match;
	return minute === '00' ? `${Number(hour)} Uhr` : `${Number(hour)}:${minute} Uhr`;
}

/** Local paths keep going through asset(); everything else joins the CF base. */
export function eventImageUrl(image: string | null): string | null {
	if (!image) return null;
	if (/^https?:\/\//.test(image)) return image;
	if (image.startsWith('/img/')) return asset(image as `/${string}`);
	if (!IMAGE_BASE) return null;
	return `${IMAGE_BASE.replace(/\/$/, '')}/${image.replace(/^\//, '')}`;
}

/* ---- placeholders -------------------------------------------------------- */

// Shown until the table is wired up. The dates are invented, not confirmed
// termine — they exist so the layout can be judged.
export const placeholderEvents: MakariaEvent[] = [
	{
		id: 'open-mic',
		title: 'Open-Mic-Night',
		image: '/img/open-mic.jpg',
		imageAlt: 'Auftritt bei der Open-Mic-Night im Wohnzimmer',
		startsOn: '2026-10-24',
		endsOn: null,
		startsAt: '20:00',
		description: 'Mikro nehmen, drei Akkorde spielen, Applaus abholen. Eintritt frei.',
		labels: []
	},
	{
		id: 'woziko',
		title: 'WoZiKo unplugged',
		image: '/img/unplugged_woziko.jpg',
		imageAlt: 'Publikum bei WoZiKo unplugged im Wohnzimmer',
		startsOn: '2026-11-14',
		endsOn: null,
		startsAt: '19:30',
		description: 'Wohnzimmerkonzert auf dem Teppich, die Band steht anderthalb Meter weg.',
		labels: []
	},
	{
		id: 'live-in-der-makaria',
		title: 'Live in der Makaria',
		image: '/img/live_in_der_makaria.jpg',
		imageAlt: 'Publikum applaudiert bei Live in der Makaria',
		startsOn: '2026-12-05',
		endsOn: null,
		startsAt: '20:00',
		description: null,
		labels: []
	},
	{
		id: 'jazzabend',
		title: 'Jazzabend im Keller',
		image: '/img/jazzkeller.jpg',
		imageAlt: 'Bandprobe im Jazzkeller',
		startsOn: '2027-01-16',
		endsOn: null,
		startsAt: '21:00',
		description: 'Jam Session, offen für alle, die ein Instrument mitbringen.',
		labels: []
	},
	{
		id: 'kammermusik',
		title: 'Kammermusik im Konzertsaal',
		image: '/img/konzertsaal.jpg',
		imageAlt: 'Hände am Flügel im Konzertsaal',
		startsOn: '2027-02-06',
		endsOn: null,
		startsAt: null,
		description: null,
		labels: ['SV']
	},
	{
		id: 'theaterpremiere',
		title: 'Theaterpremiere',
		image: '/img/live_in_der_makaria_2.jpg',
		imageAlt: 'Bassist im Bühnenlicht bei Live in der Makaria',
		startsOn: '2027-03-12',
		endsOn: null,
		startsAt: '19:00',
		description: 'Das Ergebnis eines Semesters szenisches Theater.',
		labels: ['Abgesagt']
	},
	{
		id: 'gartenfest',
		title: 'Gartenfest',
		image: '/img/garten.jpg',
		imageAlt: 'Blumenbeete im Garten',
		startsOn: '2027-05-30',
		endsOn: '2027-06-02',
		startsAt: null,
		description: 'Vier Tage Garten, Grill und Lichterketten.',
		labels: []
	},
	{
		id: 'stiftungsfest',
		title: 'Stiftungsfest',
		image: '/img/stiftungsfest.jpg',
		imageAlt: 'Festlich gedeckte Tafel zum Stiftungsfest',
		startsOn: '2027-06-19',
		endsOn: '2027-06-21',
		startsAt: '18:00',
		description: 'Unser Geburtstag, mit Anzug, Reden und offenem Flügel um zwei Uhr nachts.',
		labels: ['Intern']
	},
	{
		id: 'sommerkonzert',
		title: 'Sommerkonzert',
		image: '/img/fassade.jpg',
		imageAlt: 'Der komplette Giebel der Fassade',
		startsOn: '2027-07-10',
		endsOn: null,
		startsAt: '19:30',
		description: null,
		labels: ['SV', 'Intern']
	}
];

export const weeklyLine = 'Szenisches Theater · wöchentlich · Donnerstags (20 Uhr)';

/*
 * Calendar feed, generated live from the same view by the Supabase Edge
 * Function `veranstaltungen-ics` (Makaria repo, supabase/functions). Upcoming
 * events plus the last 12 months; Intern and SV events are tagged in the title.
 * `webcal:` makes calendar apps offer a subscription instead of a one-off import.
 */
const CALENDAR_FEED = SUPABASE_URL
	? `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/veranstaltungen-ics`
	: '';
export const calendar = {
	download: CALENDAR_FEED ? `${CALENDAR_FEED}?download=1` : '',
	subscribe: CALENDAR_FEED.replace(/^https?:/, 'webcal:')
};

export const downloads = {
	pdf: '/programm/sempro26.pdf' as const,
	svEvents: 'https://sv.org/veranstaltungen/'
};
