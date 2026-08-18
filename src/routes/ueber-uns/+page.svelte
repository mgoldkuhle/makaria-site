<script lang="ts">
	import { asset } from '$app/paths';
</script>

<section class="mx-auto max-w-3xl px-4 py-16 sm:py-20">
	<span class="section-mark" aria-hidden="true"></span>
	<h1 class="font-display text-3xl font-bold sm:text-4xl">Wer wir sind</h1>

	<div class="mt-10 grid grid-cols-3 gap-4 text-center sm:gap-8">
		<div>
			<p class="font-display text-5xl leading-none font-bold text-blue sm:text-7xl">20</p>
			<p class="mt-2 text-xs font-bold tracking-wide text-muted uppercase sm:text-sm">Aktive</p>
		</div>
		<div>
			<p class="font-display text-5xl leading-none font-bold text-red sm:text-7xl">18</p>
			<p class="mt-2 text-xs font-bold tracking-wide text-muted uppercase sm:text-sm">Auswärtige</p>
		</div>
		<div>
			<p class="font-display text-5xl leading-none font-bold text-gold sm:text-7xl">80</p>
			<p class="mt-2 text-xs font-bold tracking-wide text-muted uppercase sm:text-sm">Ehemalige</p>
		</div>
	</div>

	<p class="mt-10 leading-relaxed">
		Wir sind eine
		<span class="align-middle font-hand text-2xl font-bold text-red">gemischte</span>, nicht
		schlagende und nicht farbentragende Verbindung von Studierenden und bieten ein breites Spektrum
		an kulturellen Veranstaltungen an. Wir musizieren gemeinsam, nutzen die Räumlichkeiten in
		unserem Haus und organisieren Konzerte, Filmabende, Vorträge und Kunstprojekte.
	</p>

	<p class="mt-8 leading-relaxed">
		Wenn Du Interesse an Musik hast – ob selbst kunstschaffend, an der Tontechnik oder beim Zuhören
		– bist Du bei uns an der richtigen Adresse. Schau gerne auf unserer
		<a
			href="https://www.instagram.com/makariabonn/"
			class="text-2x1 inline-block font-hand text-lg font-bold text-blue underline decoration-wavy transition-transform hover:rotate-3"
			>Instagram-Seite</a
		>
		vorbei. Dort findest Du aktuellen Content.
	</p>

	<div class="mt-10 rounded-3xl bg-ink p-6 sm:p-8">
		<p class="sm:text-l text-lg leading-relaxed text-white">
			Von Saufzwang, rechtsextremem Gedankengut und Teilen des traditionellen Verbindungsgeschehens,
			wie dem Tragen von Farben, dem Schlagen oder dem Couleurbummel, distanzieren wir uns hingegen
			ausdrücklich.
		</p>
	</div>

	<div class="mt-16 flex flex-col items-center gap-3 text-center">
		<img src={asset('/img/wappen.png')} alt="Wappen der AMV Makaria Bonn" class="h-32" />
		<p class="font-hand text-lg text-muted">musik, ausdruck, freundschaft</p>
	</div>
</section>
