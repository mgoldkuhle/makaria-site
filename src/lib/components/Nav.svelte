<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Crest from './Crest.svelte';

	// Only two content pages remain, so the header carries a toggle to the other
	// one instead of a menu. resolve() is called with literals on both branches —
	// it cannot be given a variable and still be statically checked.
	const onEvents = $derived(page.route.id === '/veranstaltungen');
</script>

<header class="sticky top-0 z-40 border-b-3 border-ink bg-paper">
	<div class="mx-auto flex h-20 max-w-[88rem] items-center justify-between px-6 sm:px-8 lg:px-12">
		<!-- Lockup proportions follow the template: crest ~2x the wordmark size,
		     sub-line ~0.75x it, 10px gap, 1.05 line-height between the two lines. -->
		<a href={resolve('/')} class="flex items-center gap-2.5">
			<Crest class="h-12 w-12 shrink-0" />
			<span class="flex flex-col leading-[1.05]">
				<span
					class="wordmark font-display text-2xl leading-[1.05] font-bold tracking-[-0.02em] uppercase"
					>Makaria</span
				>
				<span class="font-hand text-lg leading-[1.05] font-bold text-blue">est. 1878</span>
			</span>
		</a>
		<!-- Below sm the label plus arrow overflows a phone header alongside the
		     wordmark, so it collapses to a single icon. aria-label carries the
		     name at every size, since there is no visible text on small screens. -->
		<a
			href={onEvents ? resolve('/') : resolve('/veranstaltungen')}
			aria-label={onEvents ? 'Zur Startseite' : 'Zu den Veranstaltungen'}
			class="hard hard-press flex items-center gap-2 rounded-full bg-red p-3 text-white sm:px-5 sm:py-2.5"
		>
			{#if onEvents}
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					class="h-5 w-5 sm:hidden"
					aria-hidden="true"
				>
					<path d="M3 11.2 12 4l9 7.2" stroke-linecap="round" stroke-linejoin="round" />
					<path d="M5.5 9.8V20h13V9.8" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					class="hidden h-4 w-4 sm:block"
					aria-hidden="true"
				>
					<path d="M19 12H5M11 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				<span class="hidden font-display text-sm font-bold uppercase sm:inline">Start</span>
			{:else}
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					class="h-5 w-5 sm:hidden"
					aria-hidden="true"
				>
					<rect x="3.5" y="5" width="17" height="15.5" rx="2" />
					<path d="M8 3.2v3.6M16 3.2v3.6M3.5 10h17" stroke-linecap="round" />
				</svg>
				<span class="hidden font-display text-sm font-bold uppercase sm:inline"
					>Veranstaltungen</span
				>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					class="hidden h-4 w-4 sm:block"
					aria-hidden="true"
				>
					<path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			{/if}
		</a>
	</div>
</header>
