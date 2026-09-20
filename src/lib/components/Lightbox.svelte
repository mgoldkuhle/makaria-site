<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';

	let {
		src,
		alt,
		onClose,
		onPrev,
		onNext
	}: {
		src: string;
		alt: string;
		onClose: () => void;
		onPrev: () => void;
		onNext: () => void;
	} = $props();

	let closeBtn: HTMLButtonElement | undefined = $state();

	// Svelte transitions don't consult the media query themselves, so collapse
	// the durations to zero rather than dropping the transitions entirely —
	// that keeps one code path for both cases.
	const dur = $derived(prefersReducedMotion.current ? 0 : 220);

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
		else if (e.key === 'ArrowLeft') onPrev();
		else if (e.key === 'ArrowRight') onNext();
	}

	$effect(() => {
		closeBtn?.focus();
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prevOverflow;
		};
	});
</script>

<svelte:window onkeydown={onKey} />

{#snippet arrow(dir: -1 | 1, extra: string)}
	<!-- stopPropagation: without it the backdrop's own click handler would close
	     the lightbox on the same click that steps it. -->
	<button
		type="button"
		aria-label={dir < 0 ? 'Vorheriges Foto' : 'Nächstes Foto'}
		class="hard hard-press h-11 w-11 items-center justify-center rounded-full bg-paper {extra}"
		onclick={(e) => {
			e.stopPropagation();
			if (dir < 0) onPrev();
			else onNext();
		}}
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-5 w-5">
			<path
				d={dir < 0 ? 'M15 18l-6-6 6-6' : 'M9 6l6 6-6 6'}
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>
{/snippet}

<div
	class="scanlines fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-ink/70 p-4 sm:gap-0 sm:p-8"
	role="dialog"
	aria-modal="true"
	aria-label="Bildvorschau"
	tabindex="-1"
	onclick={onClose}
	onkeydown={(e) => {
		// Both this handler and the window one sit on the same propagation
		// path, so without stopping here every arrow press stepped twice.
		// The window listener remains the fallback for when focus has left
		// the dialog entirely (e.g. onto <body>).
		e.stopPropagation();
		onKey(e);
	}}
	transition:fade={{ duration: dur }}
>
	<button
		bind:this={closeBtn}
		type="button"
		aria-label="Schließen"
		class="hard hard-press absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-red text-white sm:top-8 sm:right-8"
		onclick={onClose}
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-5 w-5">
			<path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
		</svg>
	</button>

	<!-- From sm up the photo is narrower than the screen, so the arrows sit in
	     the margins beside it. On a phone it fills the width and they would
	     cover it, so there they go underneath instead. -->
	{@render arrow(-1, 'absolute left-6 z-10 hidden sm:flex')}
	{@render arrow(1, 'absolute right-6 z-10 hidden sm:flex')}

	<!-- Same frame as the rest of the site: hard outline, caption bar along the
	     bottom edge. -->
	<div
		role="presentation"
		class="hard-flat relative max-h-full overflow-hidden rounded-2xl bg-ink"
		onclick={(e) => e.stopPropagation()}
		transition:scale={{ duration: dur, start: 0.94, opacity: 0, easing: backOut }}
	>
		<img {src} {alt} class="block max-h-[62vh] max-w-[88vw] object-contain sm:max-h-[78vh]" />
		<!-- aria-hidden: the img alt already carries this text -->
		<span class="caption-bar bg-paper" aria-hidden="true">{alt}</span>
	</div>

	<div class="flex gap-4 sm:hidden">
		{@render arrow(-1, 'flex')}
		{@render arrow(1, 'flex')}
	</div>
</div>
