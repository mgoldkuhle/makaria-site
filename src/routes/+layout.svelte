<script lang="ts">
	import './layout.css';
	import { asset } from '$app/paths';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={asset('/favicon.svg')} type="image/svg+xml" />
	<link rel="alternate icon" href={asset('/favicon.ico')} sizes="32x32" />
	<link rel="apple-touch-icon" href={asset('/apple-touch-icon.png')} />
	<meta name="theme-color" content="#3457c9" />
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
