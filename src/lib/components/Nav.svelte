<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Crest from './Crest.svelte';

	let open = $state(false);

	const links = [
		{ href: '/ueber-uns', label: 'Über uns' },
		{ href: '/veranstaltungen', label: 'Veranstaltungen' },
		{ href: '/wohnen', label: 'Wohnen' },
		{ href: '/kontakt', label: 'Kontakt' }
	] as const;
</script>

<header class="relative border-b border-border">
	<div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
		<a href={resolve('/')} class="flex items-center gap-3">
			<span class="h-9 w-9 shrink-0"><Crest size="mark" /></span>
			<span class="flex flex-col leading-tight">
				<span class="font-display text-lg font-bold">AMV Makaria Bonn</span>
				<span class="font-hand text-sm text-muted">musik, ausdruck, freundschaft</span>
			</span>
		</a>
		<button
			class="flex items-center gap-2 rounded-full bg-red px-4 py-2 text-sm font-bold text-white"
			aria-expanded={open}
			aria-controls="mobile-nav"
			onclick={() => (open = !open)}
		>
			<span class="flex flex-col gap-[3px]">
				<span
					class="h-[2px] w-4 bg-white transition-transform duration-200"
					class:translate-y-[5px]={open}
					class:rotate-45={open}
				></span>
				<span class="h-[2px] w-4 bg-white transition-opacity duration-200" class:opacity-0={open}
				></span>
				<span
					class="h-[2px] w-4 bg-white transition-transform duration-200"
					class:-translate-y-[5px]={open}
					class:-rotate-45={open}
				></span>
			</span>
			Menü
		</button>
	</div>
	<div
		id="mobile-nav"
		class="overflow-hidden transition-[max-height] duration-300"
		style="max-height: {open ? '220px' : '0px'}"
	>
		<nav class="mx-auto grid max-w-5xl grid-cols-2 gap-2 px-4 pt-1 pb-6 sm:flex sm:gap-8">
			{#each links as link (link.href)}
				{@const current = page.url.pathname === link.href}
				<a
					href={resolve(link.href)}
					class="w-fit font-display text-lg font-bold hover:text-red {current
						? 'text-red underline decoration-red decoration-wavy underline-offset-4'
						: ''}"
					aria-current={current ? 'page' : undefined}
					onclick={() => (open = false)}>{link.label}</a
				>
			{/each}
		</nav>
	</div>
</header>
