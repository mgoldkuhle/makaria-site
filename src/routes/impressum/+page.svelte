<script lang="ts">
	import { onMount } from 'svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { fetchVorstand } from '$lib/data/vorstand';

	let { data } = $props();

	// Prerendered from the build; refreshed here so a change of office in Meine
	// Makaria shows up without a rebuild. A failed or empty refresh keeps the
	// prerendered names rather than blanking the Impressum.
	// svelte-ignore state_referenced_locally
	let vorstand = $state(data.vorstand);

	onMount(async () => {
		try {
			const aktuell = await fetchVorstand();
			if (aktuell?.length) vorstand = aktuell;
		} catch (error) {
			console.error('[impressum] Aktualisierung fehlgeschlagen:', error);
		}
	});
</script>

<Seo title="Impressum" description="Impressum und Haftungsausschluss der AMV Makaria Bonn." />

<section
	class="mx-auto prose max-w-3xl px-4 py-20 sm:py-28 prose-h1:text-3xl prose-h2:text-xl prose-h3:text-lg"
>
	<span class="section-mark not-prose" aria-hidden="true"></span>
	<h1>Impressum</h1>

	<p>
		AMV&nbsp;Makaria&nbsp;Bonn<br />
		Bonner&nbsp;Talweg&nbsp;60<br />
		53113&nbsp;Bonn
	</p>

	<p>E-Mail: kontakt@amv-makaria.de</p>

	<p>
		Vorstand:
		{#if vorstand?.length}
			{#each vorstand as mitglied (mitglied.amt)}
				<br />{mitglied.name} ({mitglied.amt})
			{/each}
		{:else}
			<br />Der Vorstand konnte gerade nicht geladen werden.
		{/if}
	</p>

	<h2>Haftungsausschluss</h2>
	<h3>Haftung für Inhalte</h3>
	<p>
		Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
		Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als
		Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den
		allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch
		nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach
		Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur
		Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben
		hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis
		einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
		Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
	</p>

	<h3>Haftung für Links</h3>
	<p>
		Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss
		haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die
		Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten
		verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche
		Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht
		erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
		Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen
		werden wir derartige Links umgehend entfernen.
	</p>

	<h3>Urheberrecht</h3>
	<p>
		Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
		deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
		Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
		jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten,
		nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber
		erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter
		als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam
		werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
		werden wir derartige Inhalte umgehend entfernen.
	</p>
</section>
