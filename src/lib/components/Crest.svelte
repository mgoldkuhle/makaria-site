<script lang="ts">
	import { asset } from '$app/paths';

	let { size = 'hero' }: { size?: 'hero' | 'mark' } = $props();

	let wrapEl: HTMLDivElement | undefined = $state();
	let medalEl: HTMLDivElement | undefined = $state();
	let sheenEl: HTMLDivElement | undefined = $state();

	function onPointerMove(e: PointerEvent) {
		if (!wrapEl || !medalEl || !sheenEl) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const rect = wrapEl.getBoundingClientRect();
		const px = (e.clientX - rect.left) / rect.width;
		const py = (e.clientY - rect.top) / rect.height;
		const rx = (px - 0.5) * 26;
		const ry = (0.5 - py) * 26;
		medalEl.style.setProperty('--rx', `${rx}deg`);
		medalEl.style.setProperty('--ry', `${ry}deg`);
		sheenEl.style.setProperty('--mx', `${px * 100}%`);
		sheenEl.style.setProperty('--my', `${py * 100}%`);
	}

	function onPointerLeave() {
		if (!medalEl) return;
		medalEl.style.setProperty('--rx', '0deg');
		medalEl.style.setProperty('--ry', '0deg');
	}
</script>

{#if size === 'mark'}
	<img src={asset('/img/wappen.png')} alt="" class="h-full w-full object-contain" />
{:else}
	<div
		bind:this={wrapEl}
		class="relative aspect-square w-full [perspective:900px]"
		onpointermove={onPointerMove}
		onpointerleave={onPointerLeave}
		role="presentation"
	>
		<div
			class="pointer-events-none absolute -inset-[14%] rounded-full"
			style="background: radial-gradient(circle, rgba(255,255,255,0.35), rgba(255,255,255,0) 70%)"
			aria-hidden="true"
		></div>
		<div
			bind:this={medalEl}
			class="relative flex h-full w-full cursor-grab items-center justify-center rounded-full border border-white/60 backdrop-blur-xl backdrop-saturate-150 transition-transform duration-150 ease-out [transform-style:preserve-3d]"
			style="background: linear-gradient(135deg, rgba(255,255,255,0.5), rgba(227,234,251,0.22)); box-shadow: 0 20px 45px -28px rgba(10,14,26,0.5); transform: rotateX(var(--ry, 0deg)) rotateY(var(--rx, 0deg));"
		>
			<img
				src={asset('/img/wappen.png')}
				alt="Wappen der AMV Makaria Bonn"
				class="pointer-events-none w-2/3 [transform:translateZ(10px)] select-none"
				style="filter: drop-shadow(0 4px 6px rgba(10,14,26,0.25))"
			/>
			<div
				bind:this={sheenEl}
				class="pointer-events-none absolute inset-0 rounded-full mix-blend-overlay"
				style="background: radial-gradient(circle at var(--mx, 30%) var(--my, 20%), rgba(255,255,255,0.75), transparent 45%)"
				aria-hidden="true"
			></div>
		</div>
	</div>
{/if}
