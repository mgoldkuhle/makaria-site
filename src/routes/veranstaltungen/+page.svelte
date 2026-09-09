<script lang="ts">
	import { asset } from '$app/paths';
	import { reveal } from '$lib/actions/reveal';
	import { sampleEvents, weekly, downloads } from '$lib/data/events';
	import Seo from '$lib/components/Seo.svelte';
</script>

<Seo
	title="Veranstaltungen"
	description="Open-Mic-Nights, Wohnzimmerkonzerte, Bandkonzerte und Stiftungsfest — dazu jede Woche szenisches Theater. Das Semesterprogramm gibt es als PDF und .ics."
	image="/img/live_in_der_makaria.jpg"
/>

<section class="mx-auto max-w-5xl px-4 py-16 sm:py-20">
	<span class="section-mark" aria-hidden="true"></span>
	<div class="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-2">
		<h1 class="font-display text-4xl font-bold sm:text-5xl">Das steht dieses Semester so an.</h1>
		<div class="flex flex-wrap gap-x-4 gap-y-1">
			<a
				href={asset(downloads.pdf)}
				class="inline-block font-hand text-lg font-bold text-red underline decoration-wavy transition-transform hover:-rotate-3"
				>Download</a
			>
			<a
				href={asset(downloads.ics)}
				class="inline-block font-hand text-lg font-bold text-red underline decoration-wavy transition-transform hover:-rotate-3"
				>.ics</a
			>
			<a
				href={downloads.svEvents}
				rel="external"
				class="inline-block font-hand text-lg font-bold text-blue underline decoration-wavy transition-transform hover:rotate-3"
				>im SV</a
			>
		</div>
	</div>

	<div use:reveal class="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
		{#each sampleEvents as event (event.slug)}
			<article class="band-top overflow-hidden bg-red text-white">
				<img
					src={asset(event.image)}
					alt={event.imageAlt}
					class="aspect-video w-full object-cover"
					loading="lazy"
				/>
				<div class="p-5">
					<div class="flex items-start justify-between gap-4">
						<h2 class="font-display font-bold">{event.title}</h2>
						<span
							class="shrink-0 rounded-full px-3 py-1 text-xs font-bold {event.tag === 'Öffentlich'
								? 'bg-white text-red'
								: 'bg-white/20 text-white'}">{event.tag}</span
						>
					</div>
					<p class="mt-1 text-xs font-bold tracking-wide text-white/85 uppercase">{event.when}</p>
				</div>
			</article>
		{/each}
	</div>
</section>

<section>
	<div class="mx-auto max-w-5xl px-4 py-16 sm:py-20">
		<span class="section-mark" aria-hidden="true"></span>
		<h2 class="font-display text-3xl font-bold sm:text-4xl">Feste Termine jede Woche</h2>

		<div use:reveal class="mt-8">
			{#each weekly as item (item.title)}
				<div class="bg-blue p-5 text-center text-white">
					<h3 class="font-display font-bold">{item.time}</h3>
					<p class="text-white/80">{item.title}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
