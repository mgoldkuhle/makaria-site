<script lang="ts">
	import { onMount } from 'svelte';
	import { asset } from '$app/paths';
	import { reveal } from '$lib/actions/reveal';
	import {
		downloads,
		eventImageUrl,
		fetchEvents,
		formatEventDate,
		formatEventTime,
		isSupabaseConfigured,
		labelStyles,
		type EventLabel,
		placeholderEvents,
		semesterLabel,
		weeklyLine,
		type MakariaEvent
	} from '$lib/data/events';
	import Seo from '$lib/components/Seo.svelte';

	let events: MakariaEvent[] = $state(placeholderEvents);
	let failed = $state(false);

	// Deliberately NOT the computed label: whatever is prerendered is frozen at
	// build time, so a site built in September would still claim "Sommersemester"
	// all through October. A neutral heading can never go stale, and clients with
	// JS get the real semester on mount.
	let semester = $state('Veranstaltungen');

	// Runs after hydration only: the page is prerendered, so this is what lets
	// an edit in Supabase show up without rebuilding the site.
	onMount(async () => {
		semester = semesterLabel();
		if (!isSupabaseConfigured) return;
		try {
			const rows = await fetchEvents();
			if (rows) events = rows;
		} catch (error) {
			console.error('[events] Laden fehlgeschlagen:', error);
			failed = true;
		}
	});
</script>

{#snippet labelChips(labels: readonly EventLabel[])}
	{#each labels as label (label)}
		<span
			class="rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase {labelStyles[label]}"
			>{label}</span
		>
	{/each}
{/snippet}

<Seo
	title="Veranstaltungen"
	description="Open-Mic-Nights, Wohnzimmerkonzerte, Bandkonzerte und Stiftungsfest, dazu jede Woche szenisches Theater. Das Semesterprogramm gibt es als PDF und .ics."
	image="/img/live_in_der_makaria.jpg"
/>

<div class="border-b-3 border-ink bg-blue">
	<section class="mx-auto max-w-[88rem] px-6 pt-20 pb-12 sm:px-8 sm:pt-28 sm:pb-16 lg:px-12">
		<span class="section-mark bg-white" aria-hidden="true"></span>
		<div class="mt-4 flex flex-wrap items-end gap-x-6 gap-y-4">
			<h1 class="type-pop-ink font-display text-4xl font-bold text-white sm:text-5xl">
				{semester}
			</h1>
			<div class="flex flex-wrap gap-3">
				<a
					href={asset(downloads.pdf)}
					class="hard hard-press rounded-full bg-paper px-4 py-1.5 font-hand text-lg font-bold"
					>Download</a
				>
				<a
					href={asset(downloads.ics)}
					class="hard hard-press hard-gold rounded-full bg-paper px-4 py-1.5 font-hand text-lg font-bold"
					>.ics</a
				>
				<a
					href={downloads.svEvents}
					rel="external"
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
										{@render labelChips(event.labels)}
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
								<div class="mt-3 flex flex-wrap gap-2">{@render labelChips(event.labels)}</div>
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
	</section>

	<section>
		<div class="mx-auto max-w-[88rem] px-6 pb-20 sm:px-8 sm:pb-28 lg:px-12">
			<span class="section-mark bg-white" aria-hidden="true"></span>
			<h2 class="type-pop-ink font-display text-3xl font-bold text-white sm:text-4xl">
				Feste Termine jede Woche
			</h2>

			<div use:reveal class="mt-8">
				<div class="hard-flat rounded-2xl bg-gold p-5 text-center">
					<p class="font-display text-lg font-bold sm:text-xl">{weeklyLine}</p>
				</div>
			</div>
		</div>
	</section>
</div>
