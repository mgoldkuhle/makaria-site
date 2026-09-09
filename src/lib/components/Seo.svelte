<script lang="ts">
	import { page } from '$app/state';
	import { site, pageTitle } from '$lib/seo';

	let {
		title,
		description,
		image = site.ogImage
	}: { title?: string; description: string; image?: string } = $props();

	const fullTitle = $derived(pageTitle(title));
	const canonical = $derived(site.url + page.url.pathname);
	// Share images must be absolute URLs, so this deliberately does not use asset():
	// asset() yields a page-relative path, which can't be concatenated onto the origin.
	const imageUrl = $derived(site.url + image);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:locale" content={site.locale} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={imageUrl} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />
</svelte:head>
