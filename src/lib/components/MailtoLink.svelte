<script lang="ts">
	let { class: klass = '' }: { class?: string } = $props();

	// $effect (not $derived) is intentional: it only runs after hydration, so the
	// address is absent from the prerendered HTML and only appears for
	// JS-executing clients. Scrapers reading the static file find nothing.
	// eslint-disable-next-line svelte/prefer-writable-derived
	let email = $state('');

	$effect(() => {
		email = 'kontakt' + '@' + 'amv-makaria.de';
	});
</script>

{#if email}
	<a href="mailto:{email}" class={klass}>{email}</a>
{:else}
	<span class={klass}>E-Mail sichtbar mit JavaScript</span>
{/if}
