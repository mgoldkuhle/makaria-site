export const site = {
	name: 'AMV Makaria Bonn',
	url: 'https://amv-makaria.de',
	// Used as the fallback share image; the facade is the most recognisable shot we have.
	ogImage: '/img/fassade.jpg',
	locale: 'de_DE'
};

/** Builds the browser/tab title: "Wohnen · AMV Makaria Bonn", or just the site name on the homepage. */
export function pageTitle(title?: string) {
	return title ? `${title} · ${site.name}` : `${site.name}: Musik, Haus und Bühne seit 1878`;
}
