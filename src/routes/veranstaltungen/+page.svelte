<script lang="ts">
	import { onMount } from 'svelte';
	import { asset } from '$app/paths';
	import { reveal } from '$lib/actions/reveal';
	import {
		calendar,
		downloads,
		eventImageUrl,
		fetchUpcomingEvents,
		formatEventDate,
		formatEventTime,
		isSupabaseConfigured,
		placeholderEvents,
		// semesterLabel, // see the heading note below
		UPCOMING_LIMIT,
		upcomingFromLocal,
		weeklyLine,
		type MakariaEvent
	} from '$lib/data/events';
	import CalendarDialog from '$lib/components/CalendarDialog.svelte';
	import EventLabels from '$lib/components/EventLabels.svelte';
	import Seo from '$lib/components/Seo.svelte';

	// Upcoming only, soonest first. Past events are not listed.
	let events: MakariaEvent[] = $state(upcomingFromLocal(placeholderEvents));
	let failed = $state(false);
	let calendarDialog: ReturnType<typeof CalendarDialog> | undefined = $state();

	// The heading is a plain "Veranstaltungen" for now.
	//
	// To go back to "Sommersemester 26" / "Wintersemester 26/27": uncomment the
	// semesterLabel import above and the assignment in onMount below. It is set
	// on mount rather than here because whatever is prerendered freezes at build
	// time — a site built in September would still claim "Sommersemester" all
	// through October — so the neutral value is what JS-less clients keep.
	let semester = $state('Veranstaltungen');

	// Runs after hydration only: the page is prerendered, so this is what lets
	// an edit in Supabase show up without rebuilding the site.
	onMount(async () => {
		// semester = semesterLabel();
		if (!isSupabaseConfigured) return;
		try {
			const rows = await fetchUpcomingEvents(UPCOMING_LIMIT);
			if (rows) events = rows;
		} catch (error) {
			console.error('[events] Laden fehlgeschlagen:', error);
			failed = true;
		}
	});
</script>

<Seo
	title="Veranstaltungen"
	description="Open-Mic-Nights, Wohnzimmerkonzerte, Bandkonzerte und Stiftungsfest, dazu jede Woche szenisches Theater. Das Semesterprogramm gibt es als PDF und .ics."
	image="/img/live_in_der_makaria.jpg"
/>

<div class="border-b-3 border-ink bg-blue">
	<section class="mx-auto max-w-[88rem] px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
		<span class="section-mark bg-white" aria-hidden="true"></span>
		<div class="mt-4 flex flex-wrap items-end gap-x-6 gap-y-4">
			<h1
				class="type-pop-ink font-display text-3xl font-bold text-white uppercase sm:text-5xl lg:text-6xl"
			>
				{semester}
			</h1>
			<div class="flex flex-wrap gap-3">
				<a
					href={asset(downloads.pdf)}
					class="hard hard-press rounded-full bg-paper px-4 py-1.5 font-hand text-lg font-bold"
					>Download</a
				>
				{#if calendar.download}
					<button
						type="button"
						aria-haspopup="dialog"
						class="hard hard-press hard-gold cursor-pointer rounded-full bg-paper px-4 py-1.5 font-hand text-lg font-bold"
						onclick={() => calendarDialog?.open()}>.ics</button
					>
				{/if}
				<a
					href={downloads.svEvents}
					target="_blank"
					rel="external noopener noreferrer"
					class="hard hard-press hard-red rounded-full bg-paper px-4 py-1.5 font-hand text-lg font-bold"
					>im SV</a
				>
			</div>
		</div>

		{#if failed}
			<p class="hard-flat mt-10 rounded-2xl bg-paper p-5 font-bold">
				Die Termine lassen sich gerade nicht laden. Das Semesterprogramm gibt es oben als PDF und
				.ics.
			</p>
		{:else if events.length === 0}
			<p data-js-only class="hard-flat mt-10 rounded-2xl bg-paper p-5 font-bold">
				Gerade stehen keine Termine an. Das neue Semesterprogramm folgt bald.
			</p>
		{:else}
			<div
				use:reveal
				data-js-only
				class="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
			>
				{#each events as event (event.id)}
					{@const image = eventImageUrl(event.image)}
					{@const time = formatEventTime(event.startsAt)}
					{@const cancelled = event.labels.includes('Abgesagt')}
					<article class="hard-flat overflow-hidden rounded-2xl bg-paper">
						{#if image}
							<div class="relative">
								<img
									src={image}
									alt={event.imageAlt ?? ''}
									class="aspect-video w-full border-b-3 border-ink object-cover {cancelled
										? 'opacity-55 grayscale'
										: ''}"
									loading="lazy"
								/>
								{#if event.labels.length}
									<div class="absolute top-3 right-3 flex flex-wrap justify-end gap-2">
										<EventLabels labels={event.labels} />
									</div>
								{/if}
							</div>
						{/if}
						<div class="p-5">
							<p class="text-xs font-bold tracking-[0.1em] uppercase">
								{formatEventDate(event)}{#if time}<span class="text-ink/60"> · {time}</span>{/if}
							</p>
							<h2 class="mt-1 font-display text-xl font-bold {cancelled ? 'line-through' : ''}">
								{event.title}
							</h2>
							{#if event.description}
								<p class="mt-2 text-sm leading-relaxed text-ink/75">{event.description}</p>
							{/if}
							<!-- no photo to sit on, so the chips fall back into the body -->
							{#if !image && event.labels.length}
								<div class="mt-3 flex flex-wrap gap-2"><EventLabels labels={event.labels} /></div>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		{/if}

		<noscript>
			<p class="hard-flat mt-10 rounded-2xl bg-paper p-5 leading-relaxed font-bold">
				Die Termine laden wir per JavaScript nach. Das vollständige Semesterprogramm gibt es oben
				als PDF und .ics.
			</p>
		</noscript>

		<!-- mt-8 matches the grid's gap-8, so the card reads as one more row -->
		<div use:reveal class="mt-8">
			<div class="hard-flat rounded-2xl bg-gold p-5 text-center">
				<p class="font-display text-lg font-bold sm:text-xl">{weeklyLine}</p>
			</div>
		</div>
	</section>
</div>

{#if calendar.download}
	<CalendarDialog
		bind:this={calendarDialog}
		downloadUrl={calendar.download}
		subscribeUrl={calendar.subscribe}
	/>
{/if}
