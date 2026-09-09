<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Seo from '$lib/components/Seo.svelte';

	const isNotFound = $derived(page.status === 404);
</script>

<Seo
	title={isNotFound ? 'Seite nicht gefunden' : 'Fehler'}
	description="Diese Seite gibt es nicht (mehr)."
/>

<section class="mx-auto max-w-3xl px-4 py-24 text-center sm:py-32">
	<span class="section-mark mx-auto" aria-hidden="true"></span>
	<p class="font-display text-7xl leading-none font-bold text-blue sm:text-8xl">{page.status}</p>
	<h1 class="mt-6 font-display text-3xl font-bold sm:text-4xl">
		{isNotFound ? 'Hier ist nichts.' : 'Da ist etwas schiefgelaufen.'}
	</h1>
	<p class="mt-4 text-muted">
		{isNotFound
			? 'Die Seite gibt es nicht — vielleicht ist der Link alt oder vertippt.'
			: page.error?.message}
	</p>
	<p class="mt-8 font-hand text-3xl font-bold text-red">Aber der Rest ist noch da.</p>
	<a
		href={resolve('/')}
		class="mt-8 inline-block rounded-full bg-red px-6 py-3 font-bold text-white hover:opacity-90"
		>Zur Startseite</a
	>
</section>
