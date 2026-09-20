<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { prefersReducedMotion } from 'svelte/motion';
	import { asset } from '$app/paths';
	import { reveal } from '$lib/actions/reveal';
	import {
		calendar,
		downloads,
		EVENT_LABELS,
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
		type EventLabel,
		type MakariaEvent
	} from '$lib/data/events';
	import CalendarDialog from '$lib/components/CalendarDialog.svelte';
	import EventLabels from '$lib/components/EventLabels.svelte';
	import Seo from '$lib/components/Seo.svelte';

	// Upcoming only, soonest first. Past events are not listed.
	let events: MakariaEvent[] = $state(upcomingFromLocal(placeholderEvents));
	let failed = $state(false);
	let calendarDialog: ReturnType<typeof CalendarDialog> | undefined = $state();

	// Label filter. Nothing selected means no filter; several selected widen the
	// result rather than narrowing it, since an event carries at most one of
	// these in practice and AND would almost always come back empty.
	let activeLabels: EventLabel[] = $state([]);
	let filterOpen = $state(false);

	const dur = $derived(prefersReducedMotion.current ? 0 : 220);

	// Only offer labels that actually occur, so the filter can never present a
	// choice that leads to an empty page.
	const availableLabels = $derived(
		EVENT_LABELS.filter((label) => events.some((event) => event.labels.includes(label)))
	);

	const shownEvents = $derived(
		activeLabels.length === 0
			? events
			: events.filter((event) => event.labels.some((label) => activeLabels.includes(label)))
	);

	function toggleLabel(label: EventLabel) {
		activeLabels = activeLabels.includes(label)
			? activeLabels.filter((entry) => entry !== label)
			: [...activeLabels, label];
	}

	// The heading is a plain "Kalender" for now.
	//
	// To go back to "Sommersemester 26" / "Wintersemester 26/27": uncomment the
	// semesterLabel import above and the assignment in onMount below. It is set
	// on mount rather than here because whatever is prerendered freezes at build
	// time — a site built in September would still claim "Sommersemester" all
	// through October — so the neutral value is what JS-less clients keep.
	let semester = $state('Kalender');

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
	title="Kalender"
	description="Open-Mic-Nights, Wohnzimmerkonzerte, Bandkonzerte und Stiftungsfest, dazu jede Woche szenisches Theater. Das Semesterprogramm gibt es als PDF und .ics."
	image="/img/live_in_der_makaria.jpg"
/>

<div class="border-b-3 border-ink bg-blue">
	<section class="mx-auto max-w-[88rem] px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
		<span class="section-mark bg-white" aria-hidden="true"></span>
		<div class="mt-4 flex flex-wrap items-end gap-x-6 gap-y-4 [&>h1]:min-w-0">
			<h1
				class="type-pop-ink font-display text-3xl font-bold break-words hyphens-auto text-white uppercase sm:text-5xl lg:text-6xl"
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
			{#if availableLabels.length > 1}
				<div data-js-only class="mt-8 flex flex-wrap items-center gap-2">
					<!-- Collapsed by default; the icon carries the active state so a
					     filter left on is never invisible. -->
					<button
						type="button"
						aria-expanded={filterOpen}
						aria-controls="event-filter"
						aria-label={filterOpen ? 'Filter schließen' : 'Filter öffnen'}
						onclick={() => (filterOpen = !filterOpen)}
						class="hard hard-press flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full {activeLabels.length
							? 'bg-ink text-paper'
							: 'bg-paper'}"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							class="h-4 w-4"
							aria-hidden="true"
						>
							<path d="M4 6h16M7 12h10M10 18h4" stroke-linecap="round" />
						</svg>
					</button>

					{#if filterOpen}
						<div
							id="event-filter"
							role="group"
							aria-label="Termine nach Kategorie filtern"
							class="flex flex-wrap items-center gap-2"
							transition:slide={{ axis: 'x', duration: dur }}
						>
							{#each availableLabels as label (label)}
								{@const on = activeLabels.includes(label)}
								<button
									type="button"
									aria-pressed={on}
									onclick={() => toggleLabel(label)}
									class="hard hard-press cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold tracking-wide whitespace-nowrap uppercase {on
										? 'bg-ink text-paper'
										: 'bg-paper'}">{label}</button
								>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			{#if shownEvents.length === 0}
				<p data-js-only class="hard-flat mt-8 rounded-2xl bg-paper p-5 font-bold">
					Keine Termine in dieser Auswahl.
				</p>
			{:else}
				<!-- Keyed on the filter: changing it remounts the grid, which re-runs
				     use:reveal so the cards animate in again instead of swapping. -->
				{#key activeLabels.join('|')}
					<div
						use:reveal
						data-js-only
						class="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
					>
						{#each shownEvents as event (event.id)}
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
										{formatEventDate(event)}{#if time}<span class="text-ink/60">
												· {time}</span
											>{/if}
									</p>
									<h2
										class="mt-1 font-display text-xl font-bold break-words hyphens-auto {cancelled
											? 'line-through'
											: ''}"
									>
										{event.title}
									</h2>
									{#if event.description}
										<p class="mt-2 text-sm leading-relaxed text-ink/75">{event.description}</p>
									{/if}
									<!-- no photo to sit on, so the chips fall back into the body -->
									{#if !image && event.labels.length}
										<div class="mt-3 flex flex-wrap gap-2">
											<EventLabels labels={event.labels} />
										</div>
									{/if}
								</div>
							</article>
						{/each}
					</div>
				{/key}
			{/if}
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
