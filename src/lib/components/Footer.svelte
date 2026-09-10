<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<footer class="border-t border-border py-8 text-sm text-muted">
	<div
		class="mx-auto flex max-w-[88rem] flex-col gap-2 px-6 sm:flex-row sm:justify-between sm:px-8 lg:px-12"
	>
		<p>AMV Makaria Bonn · Bonner Talweg 60 · 53113 Bonn</p>
		<div class="flex items-baseline gap-4">
			<a href={resolve('/impressum')} class="hover:text-red">Impressum</a>
			<a href={resolve('/datenschutz')} class="hover:text-red">Datenschutz</a>
			<a href="https://www.instagram.com/makariabonn/" class="hover:text-red">Instagram</a>
			<a
				href="https://meine.amv-makaria.de"
				rel="external"
				class="font-hand text-base font-bold text-red hover:opacity-80">meine makaria.</a
			>
		</div>
	</div>
</footer>
