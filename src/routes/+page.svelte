<script lang="ts">
	import { resolve, asset } from '$app/paths';
	import Crest from '$lib/components/Crest.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';

	const highlights = [
		{
			href: '/ueber-uns',
			title: 'Über uns',
			text: 'Wer wir sind - und wer nicht.',
			tint: 'bg-blue'
		},
		{
			href: '/veranstaltungen',
			title: 'Veranstaltungen',
			text: 'Konzerte, Theater und vieles mehr.',
			tint: 'bg-blue'
		},
		{
			href: '/wohnen',
			title: 'Wohnen',
			text: '7 Zimmer, Konzertsaal und Bandraum im Altbau mitten in der Bonner Südstadt.',
			tint: 'bg-blue'
		},
		{
			href: '/kontakt',
			title: 'Kontakt',
			text: 'Schreib uns, komm vorbei, lern uns kennen.',
			tint: 'bg-blue'
		}
	] as const;

	const gallery = [
		{ src: '/img/fassade.jpg', alt: 'Der komplette Giebel der Fassade' },
		{ src: '/img/hauswand.jpg', alt: 'Efeubewachsenes Fenster mit kleinen Wappen im Glas' },
		{
			src: '/img/live_in_der_makaria_2.jpg',
			alt: 'Bassist im Bühnenlicht bei Live in der Makaria'
		},
		{ src: '/img/open-mic.jpg', alt: 'Auftritt bei der Open-Mic-Night im Wohnzimmer' },
		{ src: '/img/unplugged_woziko.jpg', alt: 'Publikum bei WoZiKo unplugged im Wohnzimmer' },
		{ src: '/img/konzertsaal.jpg', alt: 'Hände am Flügel im Konzertsaal' },
		{ src: '/img/stiftungsfest.jpg', alt: 'Festlich gedeckte Tafel zum Stiftungsfest' },
		{ src: '/img/garten.jpg', alt: 'Blumenbeete im Garten' }
	];

	let galleryEl: HTMLDivElement | undefined = $state();
	let lightboxImage: { src: string; alt: string } | null = $state(null);

	function scrollGallery(dir: 1 | -1) {
		galleryEl?.scrollBy({ left: dir * 320, behavior: 'smooth' });
	}
</script>

<section
	class="relative overflow-hidden"
	style="background: linear-gradient(51deg, var(--color-blue) 0%, var(--color-red) 100%)"
>
	<div
		class="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-4 py-16 sm:py-24 md:grid-cols-2"
	>
		<div>
			<p
				class="-rotate-2 font-hand text-4xl font-bold text-white sm:text-5xl"
				style="text-shadow: 0 1px 0 rgba(0,0,0,.25), 0 10px 24px rgba(0,0,0,.3)"
			>
				<span class="relative inline-block">
					musik, ausdruck, freundschaft
					<span class="absolute right-[6%] -bottom-2 left-[3%] h-1 rotate-1 rounded bg-white/80"
					></span>
				</span>
			</p>
			<p
				class="mt-6 max-w-[38ch] text-lg text-white"
				style="text-shadow: 0 2px 8px rgba(0,0,0,.25)"
			>
				Eine Verbindung aus Musik, einem Altbau in der Bonner Südstadt und viel guter Laune.
			</p>
		</div>
		<div class="mx-auto flex w-full max-w-[300px] items-center justify-center">
			<Crest />
		</div>
	</div>
</section>

<section class="mx-auto max-w-5xl px-4 py-16 sm:py-20">
	<div class="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
		<div>
			<span class="section-mark" aria-hidden="true"></span>
			<p class="font-display text-2xl font-bold sm:text-3xl">Bunt Gemischt.</p>
			<p class="mt-3 text-muted">
				Rund 20 Aktive, die für Konzerte, Theater, Filmabende, Jammen oder zum Entspannen im Garten
				zusammen kommen. Ob selbst kunstschaffend, an der Tontechnik oder nur zum Zuhören: bei uns
				bist Du
				<span class="align-middle font-hand text-2xl font-bold text-red">herzlich willkommen.</span>
			</p>
		</div>
		<div class="aspect-video w-full overflow-hidden rounded-2xl border border-border">
			<iframe
				title="Video: AMV Makaria Bonn"
				src="https://www.youtube-nocookie.com/embed/ZQ7JnpB5FMM"
				width="100%"
				height="100%"
				loading="lazy"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
			></iframe>
		</div>
	</div>
</section>

<section
	class="relative overflow-hidden"
	style="background: linear-gradient(51deg, var(--color-red) 0%, var(--color-blue) 100%)"
>
	<div class="mx-auto max-w-5xl px-4 py-16 sm:py-20">
		<span class="section-mark bg-white" aria-hidden="true"></span>
		<p
			class="font-display text-2xl font-bold text-white sm:text-3xl"
			style="text-shadow: 0 2px 12px rgba(0,0,0,.25)"
		>
			Ein paar Eindrücke aus dem Makarenhaus.
		</p>

		<div class="relative mt-8">
			<div
				bind:this={galleryEl}
				class="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
			>
				{#each gallery as image (image.src)}
					<button
						type="button"
						class="shrink-0 snap-center"
						onclick={() => (lightboxImage = image)}
						aria-label="Foto vergrößern: {image.alt}"
					>
						<img
							src={asset(image.src)}
							alt={image.alt}
							loading="lazy"
							class="aspect-[4/3] w-64 rounded-2xl object-cover shadow-lg transition hover:opacity-90 sm:w-72"
						/>
					</button>
				{/each}
			</div>
			<div class="mt-4 flex justify-center gap-3">
				<button
					type="button"
					aria-label="Zurück"
					class="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 text-white hover:bg-white/10"
					onclick={() => scrollGallery(-1)}
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						class="h-4 w-4"
						><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" /></svg
					>
				</button>
				<button
					type="button"
					aria-label="Weiter"
					class="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 text-white hover:bg-white/10"
					onclick={() => scrollGallery(1)}
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						class="h-4 w-4"
						><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" /></svg
					>
				</button>
			</div>
		</div>
	</div>
</section>

<section>
	<div class="mx-auto max-w-5xl px-4 py-16 sm:py-20">
		<span class="section-mark" aria-hidden="true"></span>
		<p class="font-display text-2xl font-bold sm:text-3xl">Hier gehts weiter.</p>

		<div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each highlights as item (item.href)}
				<a
					href={resolve(item.href)}
					class="rounded-2xl {item.tint} p-6 text-white transition hover:-translate-y-1 hover:shadow-lg"
				>
					<h2 class="font-display font-bold">{item.title}</h2>
					<p class="mt-2 text-sm text-white/80">{item.text}</p>
				</a>
			{/each}
		</div>
	</div>
</section>

{#if lightboxImage}
	<Lightbox
		src={asset(lightboxImage.src)}
		alt={lightboxImage.alt}
		onClose={() => (lightboxImage = null)}
	/>
{/if}
