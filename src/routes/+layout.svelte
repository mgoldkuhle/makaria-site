<script lang="ts">
	import './layout.css';
	import { asset } from '$app/paths';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={asset('/favicon-96x96.png')} type="image/png" sizes="96x96" />
	<link rel="alternate icon" href={asset('/favicon.ico')} sizes="16x16 32x32 48x48" />
	<link rel="apple-touch-icon" href={asset('/apple-touch-icon.png')} />
	<noscript>
		<!-- Blocks marked data-js-only render placeholder data that is only
		     replaced once the client fetches the real events. Without JS that
		     replacement never happens, so they are hidden rather than shown as
		     if they were real. -->
		<style>
			[data-js-only] {
				display: none !important;
			}
		</style>
	</noscript>
	<!-- matches the white header, which is the topmost thing on every page -->
	<meta name="theme-color" content="#ffffff" />
	{#if import.meta.env.VITE_NOINDEX === 'true'}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
</svelte:head>
<div class="flex min-h-screen flex-col">
	<Nav />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>
