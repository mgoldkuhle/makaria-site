<script lang="ts">
	let { src, alt, onClose }: { src: string; alt: string; onClose: () => void } = $props();

	let closeBtn: HTMLButtonElement | undefined = $state();

	$effect(() => {
		closeBtn?.focus();
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prevOverflow;
		};
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') onClose();
	}}
/>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
	role="dialog"
	aria-modal="true"
	aria-label="Bildvorschau"
	tabindex="-1"
	onclick={onClose}
	onkeydown={(e) => {
		if (e.key === 'Escape') onClose();
	}}
>
	<button
		bind:this={closeBtn}
		type="button"
		aria-label="Schließen"
		class="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
		onclick={onClose}
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
			<path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
		</svg>
	</button>
	<div role="presentation" onclick={(e) => e.stopPropagation()}>
		<img {src} {alt} class="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl" />
	</div>
</div>
