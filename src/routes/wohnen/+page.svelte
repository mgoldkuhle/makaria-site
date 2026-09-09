<script lang="ts">
	import { resolve, asset } from '$app/paths';
	import { reveal } from '$lib/actions/reveal';
	import Seo from '$lib/components/Seo.svelte';

	const tiles = [
		{
			title: 'Der Altbau.',
			text: 'Unser 1906 eingeweihtes Haus mit reicher Geschichte am Bonner Talweg 60, mitten in der Bonner Südstadt. Sieben Zimmer für Studierende jeden Geschlechts, jeder Nationalität, jeder Ausrichtung.',
			image: '/img/fassade.jpg',
			alt: 'Der komplette Giebel der Fassade',
			bg: 'bg-blue'
		},
		{
			title: 'Der Konzertsaal.',
			text: 'Ein Flügel, tolle Akustik und riesig viel Platz für Kammer-Ensembles, Theater, und unsere Feierlichkeiten. Mit dem Kneipsaal gleich nebenan für die Party danach.',
			image: '/img/konzertsaal.jpg',
			alt: 'Hände am Flügel im Konzertsaal',
			bg: 'bg-red'
		},
		{
			title: 'Der Jazzkeller.',
			text: 'Unser Proberaum im Keller. Verstärker, Schlagzeug, und alles was das Musikherz sonst so begehrt. Hier proben die Bands unserer Makaren und Friends, hier wird gejammed und die nächste EP aufgenommen.',
			image: '/img/jazzkeller.jpg',
			alt: 'Bandprobe im Jazzkeller',
			bg: 'bg-blue'
		},
		{
			title: 'Der Garten.',
			text: 'Blumenbeete, Lichterketten und eine Oase zum gemeinsamen Faulenzen und Sonnenbaden. Und 15m darüber unsere ähnlich gemütliche Dachterasse.',
			image: '/img/garten.jpg',
			alt: 'Blumenbeete im Garten',
			bg: 'bg-red'
		}
	] as const;
</script>

<Seo
	title="Wohnen"
	description="Sieben Zimmer für Studierende im Altbau am Bonner Talweg — mit Konzertsaal, Jazzkeller, Garten und studifreundlicher Miete, mitten in der Bonner Südstadt."
	image="/img/fassade.jpg"
/>

<section class="mx-auto max-w-5xl px-4 pt-16 pb-8 text-center sm:pt-20">
	<span class="section-mark mx-auto" aria-hidden="true"></span>
	<h1 class="font-display text-6xl font-bold sm:text-7xl lg:text-8xl">Unser Haus.</h1>
</section>

<section>
	<div use:reveal class="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-12 sm:py-16">
		{#each tiles as tile (tile.title)}
			<div class="band-top overflow-hidden {tile.bg}">
				<img
					src={asset(tile.image)}
					alt={tile.alt}
					loading="lazy"
					class="h-56 w-full object-cover sm:h-72"
				/>
				<div class="p-6 sm:p-8">
					<h2 class="font-display text-3xl font-bold text-white sm:text-4xl">{tile.title}</h2>
					<p class="mt-3 leading-relaxed text-white/85">{tile.text}</p>
				</div>
			</div>
		{/each}
	</div>
</section>

<section>
	<div class="mx-auto max-w-2xl px-4 pb-20 text-center">
		<p class="font-hand text-3xl font-bold text-red sm:text-4xl">
			Studifreundliche Miete inklusive.
		</p>
		<a
			href={resolve('/kontakt')}
			class="mt-8 inline-block rounded-full bg-red px-6 py-3 font-bold text-white hover:opacity-90"
			>Schreib uns.</a
		>
	</div>
</section>
