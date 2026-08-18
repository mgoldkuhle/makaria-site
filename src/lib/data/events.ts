export type SampleEvent = {
	slug: string;
	title: string;
	tag: string;
	when: string;
	image: string;
	imageAlt: string;
};

// Illustrativ – zeigt die Art der Veranstaltungen. "when" sind Platzhalterdaten,
// keine bestätigten Termine. Echte Termine kommen über die Downloads (ICS/PDF).
export const sampleEvents: SampleEvent[] = [
	{
		slug: 'open-mic',
		title: 'Open-Mic-Night',
		tag: 'Öffentlich',
		when: '24. Oktober 2026',
		image: '/img/open-mic.jpg',
		imageAlt: 'Auftritt bei der Open-Mic-Night im Wohnzimmer'
	},
	{
		slug: 'woziko',
		title: 'WoZiKo unplugged',
		tag: 'Öffentlich',
		when: '14. November 2026',
		image: '/img/unplugged_woziko.jpg',
		imageAlt: 'Publikum bei WoZiKo unplugged im Wohnzimmer'
	},
	{
		slug: 'live-in-der-makaria',
		title: 'Live in der Makaria',
		tag: 'Öffentlich',
		when: '5. Dezember 2026',
		image: '/img/live_in_der_makaria.jpg',
		imageAlt: 'Publikum applaudiert bei Live in der Makaria'
	},
	{
		slug: 'stiftungsfest',
		title: 'Stiftungsfest',
		tag: 'Intern',
		when: '19.–21. Juni 2027',
		image: '/img/stiftungsfest.jpg',
		imageAlt: 'Festlich gedeckte Tafel zum Stiftungsfest'
	}
];

export const weekly = [{ time: 'Donnerstags (20 Uhr)', title: 'Szenisches Theater' }];

export const downloads = {
	ics: '/programm/ss26.ics' as const,
	pdf: '/programm/sempro26.pdf' as const,
	svEvents: 'https://sv.org/veranstaltungen/'
};
