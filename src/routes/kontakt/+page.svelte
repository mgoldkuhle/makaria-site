<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';

	// $effect (not $derived) is intentional: it only runs after hydration, so the
	// address is absent from the prerendered HTML and only appears for JS-executing
	// clients, same as the obfuscation on the old site.
	// eslint-disable-next-line svelte/prefer-writable-derived
	let email = $state('');

	$effect(() => {
		email = 'kontakt' + '@' + 'amv-makaria.de';
	});
</script>

<Seo
	title="Kontakt"
	description="Schreib uns oder komm einfach vorbei: AMV Makaria Bonn, Bonner Talweg 60, 53113 Bonn."
/>

<section class="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
	<span class="section-mark mx-auto" aria-hidden="true"></span>
	<h1 class="font-display text-3xl font-bold sm:text-4xl">Schreib uns.</h1>
	<p class="mt-3 text-muted">Bonner Talweg 60 · 53113 Bonn</p>

	<div class="mt-8 flex flex-wrap justify-center gap-4">
		{#if email}
			<a
				href="mailto:{email}"
				class="rounded-full bg-red px-6 py-3 font-bold text-white hover:opacity-90">{email}</a
			>
		{:else}
			<em class="text-muted"
				>E-Mail-Adresse durch JavaScript geschützt. Bitte aktiviere JavaScript.</em
			>
		{/if}
		<a
			href="https://www.instagram.com/makariabonn/"
			rel="external"
			class="rounded-full border border-border px-6 py-3 font-bold hover:border-blue">Instagram</a
		>
	</div>
</section>

<section>
	<div class="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
		<span class="section-mark mx-auto" aria-hidden="true"></span>
		<h2 class="font-display text-2xl font-bold">So findest Du uns.</h2>

		<div class="mt-8 aspect-video w-full overflow-hidden rounded-2xl border border-border">
			<iframe
				title="Karte: AMV Makaria Bonn, Bonner Talweg 60"
				src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2525.72162258527!2d7.100015315565906!3d50.725103479514175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bee177c78c4429%3A0x9b4d72039a168835!2sAMV+Makaria+Bonn+(Akademisch-Musikalischen+Verbindung)!5e0!3m2!1sde!2sde!4v1522255357954"
				width="100%"
				height="100%"
				loading="lazy"
			></iframe>
		</div>
	</div>
</section>
