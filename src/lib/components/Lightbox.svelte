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

<div
	class="scanlines fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 sm:p-8"
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

	<!-- stopPropagation on the arrows: without it the backdrop's own click
	     handler would close the lightbox on the same click that steps it. -->
	<button
		type="button"
		aria-label="Vorheriges Foto"
		class="hard hard-press absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-paper sm:left-6"
		onclick={(e) => {
			e.stopPropagation();
			onPrev();
		}}
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-5 w-5">
			<path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</button>
	<button
		type="button"
		aria-label="Nächstes Foto"
		class="hard hard-press absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-paper sm:right-6"
		onclick={(e) => {
			e.stopPropagation();
			onNext();
		}}
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-5 w-5">
			<path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</button>

	<!-- Same frame as the rest of the site: hard outline, solid offset shadow,
	     caption bar along the bottom edge. -->
	<div
		role="presentation"
		class="hard relative max-h-full overflow-hidden rounded-2xl bg-ink"
		onclick={(e) => e.stopPropagation()}
		transition:scale={{ duration: dur, start: 0.94, opacity: 0, easing: backOut }}
	>
		<img {src} {alt} class="block max-h-[78vh] max-w-[78vw] object-contain" />
		<!-- aria-hidden: the img alt already carries this text -->
		<span class="caption-bar bg-paper" aria-hidden="true">{alt}</span>
	</div>
</div>
