<script lang="ts">
	import { resolve, asset } from '$app/paths';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import MailtoLink from '$lib/components/MailtoLink.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { onMount } from 'svelte';
	import {
		eventImageUrl,
		fetchEvents,
		fetchUpcomingEvents,
		formatEventDate,
		isSupabaseConfigured,
		landingFromLocal,
		placeholderEvents,
		selectLandingEvents,
		weeklyLine
	} from '$lib/data/events';

	// Same rules as the live path, applied to the placeholders, so the page
	// shows a sensible selection before the table exists.
	let landing = $state(landingFromLocal(placeholderEvents));

	onMount(async () => {
		mounted = true;
		if (!isSupabaseConfigured) return;
		try {
			const upcoming = (await fetchUpcomingEvents()) ?? [];
			// The newest list is only needed when there aren't enough upcoming
			// ones, so it costs a second request only in that case.
			const enough = upcoming.filter((event) => !event.labels.includes('Intern')).length >= 3;
			const newest = enough ? [] : ((await fetchEvents()) ?? []);
			landing = selectLandingEvents(upcoming, newest);
		} catch (error) {
			console.error('[events] Laden fehlgeschlagen, zeige Platzhalter:', error);
		}
	});

	const pillars = [
		{
			title: 'Musik im Mittelpunkt',
			text: 'Ob solo am Klavier, in einer Band, im Kammermusik-Ensemble, an der Tontechnik oder beim Tanzen. Uns alle verbindet eine Begeisterung für die Musik.',
			shadow: 'hard-blue'
		},
		{
			title: 'Ein Treffpunkt',
			text: 'Come as you are! Unser Haus am Bonner Talweg ist ein Wohlfühlort für Studierende jeder Art zum gemeinsamen Musizieren, Abhängen, Feiern und manchmal auch Studieren.',
			shadow: 'hard-red'
		},
		{
			title: 'Nicht so eine Verbindung',
			mark: 'so',
			text: 'Wir sind gemischt, nicht schlagend und nicht farbentragend. Kein Saufzwang, kein rechtsextremes Gedankengut, keine Aufnahmeprüfungen.',
			shadow: 'hard-gold'
		}
	] as const;

	// Carried over from the Wohnen page, which folded into this section.
	const rooms = [
		{
			title: 'Der Altbau',
			text: 'Unser Haus steht seit 1906 am Bonner\u00A0Talweg\u00A060 im Herzen der Südstadt. Sieben Zimmer für Studierende, unabhängig von Geschlecht, Herkunft oder Ausrichtung.',
			image: '/img/fassade.jpg',
			alt: 'Der komplette Giebel der Fassade',
			bg: 'bg-blue',
			fg: 'text-ink',
			fgMuted: 'text-ink/75'
		},
		{
			title: 'Der Konzertsaal',
			text: 'Ein Flügel, gute Akustik und viel Platz für Ensembles, Theater und unsere Feste. Der Kneipsaal liegt gleich nebenan, für die Party danach und unsere Mitgliederversammlungen.',
			image: '/img/konzertsaal.jpg',
			alt: 'Hände am Flügel im Konzertsaal',
			bg: 'bg-blue',
			fg: 'text-ink',
			fgMuted: 'text-ink/75'
		},
		{
			title: 'Der Jazzkeller',
			text: 'Unser Proberaum im Keller, mit Verstärkern, Schlagzeug und allem, was sonst noch dazugehört. Hier proben die Bands der Makaria und von Freunden, hier wird gejammt und aufgenommen.',
			image: '/img/jazzkeller.jpg',
			alt: 'Bandprobe im Jazzkeller',
			bg: 'bg-blue',
			fg: 'text-ink',
			fgMuted: 'text-ink/75'
		},
		{
			title: 'Der Garten',
			text: 'Blumenbeete, Lichterketten und viel Platz zum Chillen, Sonnenbaden und für gemütliche Sommerabende. 10 Meter darüber liegt unsere sonnige Dachterrasse.',
			image: '/img/garten.jpg',
			alt: 'Blumenbeete im Garten',
			bg: 'bg-blue',
			fg: 'text-ink',
			fgMuted: 'text-ink/75'
		}
	] as const;

	// Carousel media, video first. Photos keep their own alt text; the video
	// shows a local poster until it is the active slide, so YouTube is only
	// contacted once someone actually opens it.
	type Slide =
		| { kind: 'video'; src: string; poster: string; label: string }
		| { kind: 'photo'; src: string; alt: string };

	const slides: Slide[] = [
		{
			kind: 'video',
			src: 'https://www.youtube-nocookie.com/embed/ZQ7JnpB5FMM',
			poster: '/img/live_in_der_makaria.jpg',
			label: 'Video: AMV Makaria Bonn'
		},
		{ kind: 'photo', src: '/img/fassade.jpg', alt: 'Der komplette Giebel der Fassade' },
		{
			kind: 'photo',
			src: '/img/hauswand.jpg',
			alt: 'Efeubewachsenes Fenster mit kleinen Wappen im Glas'
		},
		{
			kind: 'photo',
			src: '/img/open-mic.jpg',
			alt: 'Auftritt bei der Open-Mic-Night im Wohnzimmer'
		},
		{
			kind: 'photo',
			src: '/img/unplugged_woziko.jpg',
			alt: 'Publikum bei WoZiKo unplugged im Wohnzimmer'
		},
		{ kind: 'photo', src: '/img/konzertsaal.jpg', alt: 'Hände am Flügel im Konzertsaal' },
		{
			kind: 'photo',
			src: '/img/stiftungsfest.jpg',
			alt: 'Festlich gedeckte Tafel zum Stiftungsfest'
		},
		{ kind: 'photo', src: '/img/garten.jpg', alt: 'Blumenbeete im Garten' }
	];

	const photos = slides.filter(
		(slide): slide is Extract<Slide, { kind: 'photo' }> => slide.kind === 'photo'
	);

	// Gates the YouTube iframe. Without this the prerendered HTML ships a live
	// embed, which browsers load even inside a display:none block — so a JS-less
	// visitor would silently hit YouTube for a carousel they cannot use.
	let mounted = $state(false);

	let active = $state(0);
	let slideEls: (HTMLElement | undefined)[] = $state([]);
	// Index into `slides`, not a copy of the image: the lightbox needs its
	// position in the list to step to the next photo.
	let lightboxIndex: number | null = $state(null);

	// Narrow to a photo here rather than in the template, so the markup can use
	// .alt without a second type guard.
	const lightboxPhoto = $derived.by(() => {
		if (lightboxIndex === null) return null;
		const slide = slides[lightboxIndex];
		return slide.kind === 'photo' ? slide : null;
	});

	// Steps to the next/previous photo, skipping the video. Also moves the
	// carousel behind, so closing the lightbox leaves it where you left off.
	function stepLightbox(dir: 1 | -1) {
		if (lightboxIndex === null) return;
		let i = lightboxIndex;
		do {
			i = (i + dir + slides.length) % slides.length;
		} while (slides[i].kind !== 'photo' && i !== lightboxIndex);
		lightboxIndex = i;
		active = i;
	}

	function go(dir: 1 | -1) {
		active = (active + dir + slides.length) % slides.length;
	}

	// Only scroll in response to a change of slide, never on mount — an
	// unconditional scrollIntoView here would yank the viewport to the
	// carousel as soon as the page loads.
	let settled = false;
	$effect(() => {
		const el = slideEls[active];
		if (!settled) {
			settled = true;
			return;
		}
		el?.scrollIntoView({
			behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
			inline: 'center',
			block: 'nearest'
		});
	});
</script>

<Seo
	description="Die AMV Makaria Bonn ist eine gemischte, nicht schlagende und nicht farbentragende Studentenverbindung in der Bonner Südstadt: Konzerte, Theater, Jazzkeller, Konzertsaal mit Flügel und sieben Zimmer im Altbau."
/>

{#snippet allEventsLink()}
	<a
		href={resolve('/veranstaltungen')}
		class="hard hard-press rounded-2xl bg-paper px-5 py-3 font-display font-bold uppercase"
		>Alle Termine</a
	>
{/snippet}

<!-- Hero ------------------------------------------------------------------->
<section
	class="scanlines relative flex min-h-[calc(100svh-var(--header-h))] items-center overflow-hidden"
	style="background: linear-gradient(129deg, var(--color-blue) 0%, var(--color-red) 100%)"
>
	<div
		class="relative mx-auto grid w-full max-w-[88rem] gap-12 px-6 py-20 sm:px-8 sm:py-24 md:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-12"
	>
		<!-- The column stretches to the height of the image cluster. From md up the
		     free space is shared by three spacers in a 1 : 2 : 1 ratio — above the
		     headline, between headline and box, below the box. The middle one keeps
		     the gap the previous layout had (half the free space), while the outer
		     two lift headline and box by the same amount. Being ratios, this holds
		     at every width. Below md the columns stack and the spacers are hidden. -->
		<div class="flex flex-col items-start gap-6 md:gap-0">
			<div class="hidden md:block md:grow" aria-hidden="true"></div>
			<h1
				class="type-pop-layered font-display text-5xl leading-[0.92] font-bold tracking-[-0.03em] text-white uppercase sm:text-6xl lg:text-7xl xl:text-8xl"
			>
				Ein Haus<br />voller Musik
			</h1>
			<div class="hidden md:block md:grow-2" aria-hidden="true"></div>
			<p class="hard max-w-[46ch] bg-paper p-5 text-lg leading-relaxed font-medium">
				Hast Du Interesse an Musik? Dann bist Du bei uns an der richtigen Adresse. Neben einem
				„beflügelten“ Konzertsaal und unserem Jazzkeller haben wir noch viel weiteren Raum zur
				künstlerischen Entfaltung. In unserem schönen Haus in der Bonner Südstadt kommen rund 20
				aktive Mitglieder der AMV&nbsp;Makaria&nbsp;Bonn zusammen, musizieren gemeinsam, spielen
				Theater und organisieren Konzerte, Filmabende und Vorträge.
			</p>
			<div class="hidden md:block md:grow" aria-hidden="true"></div>
		</div>

		<!-- Image cluster: one large frame over two smaller ones, each with a
		     solid caption bar, closed off by the next-event strip. -->
		<div class="flex flex-col gap-5">
			<div class="hard-flat relative h-72 overflow-hidden rounded-2xl sm:h-80 lg:h-96">
				<img
					src={asset('/img/live_in_der_makaria_2.jpg')}
					alt="Bassist im Bühnenlicht bei Live in der Makaria"
					class="h-full w-full object-cover"
				/>
				<span
					class="blink absolute top-3 left-3 rounded-md bg-red px-2.5 py-1 text-xs font-bold tracking-[0.08em] text-white uppercase"
					>● Live</span
				>
				<span class="caption-bar bg-blue">Live in der Makaria</span>
			</div>
			<div class="grid grid-cols-2 gap-5 lg:gap-6">
				<div class="hard-flat relative h-44 overflow-hidden rounded-2xl lg:h-52">
					<img
						src={asset('/img/jazzkeller.jpg')}
						alt="Bandprobe im Jazzkeller"
						loading="lazy"
						class="h-full w-full object-cover"
					/>
					<span class="caption-bar bg-gold">Jazzkeller</span>
				</div>
				<div class="hard-flat relative h-44 overflow-hidden rounded-2xl lg:h-52">
					<img
						src={asset('/img/konzertsaal.jpg')}
						alt="Hände am Flügel im Konzertsaal"
						loading="lazy"
						class="h-full w-full object-cover"
					/>
					<span class="caption-bar bg-red text-white">Konzertsaal</span>
				</div>
			</div>
			<a
				href={resolve('/veranstaltungen')}
				data-js-only
				class="hard hard-press flex items-center justify-between gap-3 rounded-2xl bg-paper p-4"
			>
				<span class="flex flex-col">
					<span class="text-xs font-bold tracking-[0.1em] text-muted uppercase">Nächstes Event</span
					>
					<span class="font-display text-lg font-bold"
						>{landing.next?.title ?? 'Programm ansehen'}</span
					>
				</span>
				<span class="shrink-0 rounded-full bg-gold px-3 py-1.5 text-sm font-bold text-ink"
					>{landing.next ? formatEventDate(landing.next) : 'Alle Termine'}</span
				>
			</a>

			<noscript>
				<a
					href={resolve('/veranstaltungen')}
					class="hard flex items-center justify-between gap-3 rounded-2xl bg-paper p-4"
				>
					<span class="flex flex-col">
						<span class="text-xs font-bold tracking-[0.1em] text-muted uppercase">Programm</span>
						<span class="font-display text-lg font-bold">Alle Termine ansehen</span>
					</span>
					<span
						class="flex shrink-0 items-center rounded-full bg-gold px-3 py-1.5 text-ink"
						aria-hidden="true"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							class="h-4 w-4"
						>
							<path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</span>
				</a>
			</noscript>
		</div>
	</div>
</section>

<!-- What we are ------------------------------------------------------------>
<section class="mx-auto max-w-[88rem] px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
	<span class="section-mark bg-blue" aria-hidden="true"></span>
	<h2 class="type-pop font-display text-3xl font-bold uppercase sm:text-5xl lg:text-6xl">
		Das sind wir
	</h2>

	<div use:reveal class="mt-12 grid gap-8 sm:grid-cols-3 lg:gap-10">
		{#each pillars as pillar (pillar.title)}
			<div class="hard {pillar.shadow} rounded-2xl bg-paper p-6">
				<h3 class="font-display text-xl font-bold">
					{#if 'mark' in pillar}
						{@const at = pillar.title.indexOf(pillar.mark)}
						{pillar.title.slice(0, at)}<mark class="pillar-mark">{pillar.mark}</mark
						>{pillar.title.slice(at + pillar.mark.length)}
					{:else}
						{pillar.title}
					{/if}
				</h3>
				<p class="mt-3 leading-relaxed text-muted">{pillar.text}</p>
			</div>
		{/each}
	</div>
</section>

<!-- Events ----------------------------------------------------------------->
<section class="border-y-3 border-ink bg-blue">
	<div class="mx-auto max-w-[88rem] px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
		<div class="flex flex-wrap items-end justify-between gap-4">
			<div>
				<span class="section-mark bg-white" aria-hidden="true"></span>
				<h2
					class="type-pop-ink font-display text-3xl font-bold text-white uppercase sm:text-5xl lg:text-6xl"
				>
					Das steht an
				</h2>
			</div>
			<!-- beside the heading from sm up; below the cards on phones, where a
			     button next to the heading would wrap onto its own cramped line -->
			<div class="hidden sm:block">{@render allEventsLink()}</div>
		</div>

		<div use:reveal data-js-only class="mt-12 grid gap-8 sm:grid-cols-3 lg:gap-10">
			{#each landing.highlights as event (event.id)}
				<article class="hard-flat overflow-hidden rounded-2xl bg-paper">
					<img
						src={eventImageUrl(event.image)}
						alt={event.imageAlt ?? ''}
						loading="lazy"
						class="aspect-video w-full border-b-3 border-ink object-cover"
					/>
					<div class="p-5">
						<p class="text-xs font-bold tracking-[0.1em] text-red uppercase">
							{formatEventDate(event)}
						</p>
						<h3 class="mt-1 font-display text-xl font-bold">{event.title}</h3>
					</div>
				</article>
			{/each}
		</div>

		<div class="hard-flat mt-8 rounded-2xl bg-gold p-6 text-center">
			<p class="font-display text-lg font-bold sm:text-xl">
				{weeklyLine}
			</p>
		</div>

		<div class="mt-10 flex justify-center sm:hidden">{@render allEventsLink()}</div>
	</div>
</section>

<!-- Living ----------------------------------------------------------------->
<section id="wohnen" class="mx-auto max-w-[88rem] px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
	<span class="section-mark bg-blue" aria-hidden="true"></span>
	<h2 class="type-pop font-display text-3xl font-bold uppercase sm:text-5xl lg:text-6xl">Die WG</h2>
	<p class="mt-4 max-w-[46ch] leading-relaxed text-muted">
		Ein Altbau von 1906 mitten in der Bonner Südstadt, vier Minuten zur Unibibliothek. Weil das Haus
		uns selbst gehört, liegt die Miete deutlich unter dem Bonner Marktpreis.
	</p>

	<div use:reveal class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
		{#each rooms as room (room.title)}
			<div class="hard-flat overflow-hidden rounded-2xl {room.bg}">
				<img
					src={asset(room.image)}
					alt={room.alt}
					loading="lazy"
					class="h-44 w-full border-b-3 border-ink object-cover"
				/>
				<div class="p-5">
					<h3 class="font-display text-xl font-bold {room.fg}">{room.title}</h3>
					<p class="mt-2 text-sm leading-relaxed {room.fgMuted}">{room.text}</p>
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- Gallery ---------------------------------------------------------------->
<section class="scanlines relative overflow-hidden border-y-3 border-ink bg-red">
	<div class="relative py-20 sm:py-28">
		<div class="mx-auto max-w-[88rem] px-6 sm:px-8 lg:px-12">
			<span class="section-mark bg-white" aria-hidden="true"></span>
			<h2
				class="type-pop-ink font-display text-3xl font-bold text-white uppercase sm:text-5xl lg:text-6xl"
			>
				Galerie
			</h2>
		</div>

		<!-- One row, one enlarged slide. The row scrolls the active slide to
		     centre; the strip runs past both edges so it reads as continuing. -->
		<div
			data-js-only
			class="no-scrollbar mt-10 flex h-[17rem] gap-4 overflow-x-auto px-6 pt-4 pb-8 sm:h-[21rem] sm:px-8 lg:h-[27rem] lg:px-12"
		>
			{#each slides as slide, i (slide.src)}
				{@const current = i === active}
				<div
					bind:this={slideEls[i]}
					class="hard-flat slide relative h-full shrink-0 overflow-hidden rounded-2xl {current
						? 'w-[24.9rem] sm:w-[32rem] lg:w-[42.67rem]'
						: 'slide-lift w-16 sm:w-24 lg:w-28'}"
				>
					{#if slide.kind === 'video' && current && mounted}
						<iframe
							title={slide.label}
							src={slide.src}
							width="100%"
							height="100%"
							loading="lazy"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
						></iframe>
					{:else}
						<button
							type="button"
							class="block h-full w-full cursor-pointer"
							onclick={() =>
								current && slide.kind === 'photo' ? (lightboxIndex = i) : (active = i)}
							aria-label={slide.kind === 'video'
								? 'Video abspielen'
								: current
									? `Foto vergrößern: ${slide.alt}`
									: `Anzeigen: ${slide.alt}`}
						>
							<img
								src={asset(slide.kind === 'video' ? slide.poster : slide.src)}
								alt={slide.kind === 'video' ? '' : slide.alt}
								loading="lazy"
								class="h-full w-full object-cover"
							/>
							{#if slide.kind === 'video'}
								<span
									class="absolute inset-0 flex items-center justify-center bg-ink/45 text-white"
								>
									<svg viewBox="0 0 24 24" fill="currentColor" class="h-8 w-8 lg:h-12 lg:w-12"
										><path d="M8 5v14l11-7z" /></svg
									>
								</span>
							{/if}
						</button>
					{/if}
				</div>
			{/each}
		</div>

		<div
			data-js-only
			class="mx-auto mt-6 flex max-w-[88rem] items-center gap-3 px-6 sm:px-8 lg:px-12"
		>
			<button
				type="button"
				aria-label="Vorheriges Medium"
				class="hard hard-press flex h-10 w-10 items-center justify-center rounded-full bg-paper"
				onclick={() => go(-1)}
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					class="h-4 w-4"
					><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" /></svg
				>
			</button>
			<button
				type="button"
				aria-label="Nächstes Medium"
				class="hard hard-press flex h-10 w-10 items-center justify-center rounded-full bg-paper"
				onclick={() => go(1)}
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					class="h-4 w-4"
					><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" /></svg
				>
			</button>
			<span class="ml-2 font-display text-sm font-bold text-white"
				>{active + 1} / {slides.length}</span
			>
		</div>

		<!-- The carousel needs JS for its arrows, its resizing slide and the
		     lightbox, so it is replaced by a plain grid of the same photos. The
		     video is dropped rather than embedded: it would be a dead frame. -->
		<noscript>
			<div
				class="mx-auto mt-10 grid max-w-[88rem] gap-5 px-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 lg:px-12"
			>
				{#each photos as photo (photo.src)}
					<img
						src={asset(photo.src)}
						alt={photo.alt}
						loading="lazy"
						class="hard-flat aspect-[4/3] w-full rounded-2xl object-cover"
					/>
				{/each}
			</div>
		</noscript>
	</div>
</section>

<!-- Contact ---------------------------------------------------------------->
<section id="kontakt" class="mx-auto max-w-[88rem] px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
	<div class="hard hard-blue grid gap-10 rounded-2xl bg-paper p-8 sm:p-12 md:grid-cols-2">
		<div>
			<span class="section-mark bg-blue" aria-hidden="true"></span>
			<h2 class="font-display text-3xl font-bold uppercase sm:text-4xl">Schreib uns</h2>
			<p class="mt-4 max-w-[38ch] leading-relaxed text-muted">
				Ein Satz reicht, egal ob Du ein Zimmer suchst oder einfach zum Konzert kommen willst.
				Donnerstags ab 20 Uhr steht die Tür sowieso offen.
			</p>
		</div>
		<div class="flex flex-col items-start justify-center gap-5">
			<p class="font-display text-2xl leading-tight font-bold">
				Bonner&nbsp;Talweg&nbsp;60<br />53113&nbsp;Bonn
			</p>
			<div class="flex flex-wrap gap-3">
				<MailtoLink
					class="hard hard-press rounded-2xl bg-red px-5 py-3 font-display font-bold text-white uppercase"
				/>
				<a
					href="https://www.instagram.com/makariabonn/"
					rel="external"
					class="hard hard-press rounded-2xl bg-paper px-5 py-3 font-display font-bold uppercase"
					>Instagram</a
				>
			</div>
		</div>
	</div>
</section>

{#if lightboxPhoto}
	<Lightbox
		src={asset(lightboxPhoto.src)}
		alt={lightboxPhoto.alt}
		onClose={() => (lightboxIndex = null)}
		onPrev={() => stepLightbox(-1)}
		onNext={() => stepLightbox(1)}
	/>
{/if}
