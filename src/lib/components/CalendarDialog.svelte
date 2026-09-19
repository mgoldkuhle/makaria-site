<script lang="ts">
	let {
		downloadUrl,
		subscribeUrl
	}: {
		downloadUrl: string;
		subscribeUrl: string;
	} = $props();

	// Native <dialog> with showModal(): focus trap, Escape and the inert
	// background come from the browser, so none of it is rebuilt here.
	let dialog: HTMLDialogElement | undefined = $state();
	let copied = $state(false);

	export function open() {
		copied = false;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
	}

	async function copy(input: HTMLInputElement) {
		try {
			await navigator.clipboard.writeText(subscribeUrl);
		} catch {
			// Clipboard API unavailable (http, old browser): leave the URL
			// selected so Strg+C still works.
			input.select();
			return;
		}
		copied = true;
	}

	let urlInput: HTMLInputElement | undefined = $state();
</script>

<!-- Clicking the backdrop (the dialog element itself, outside the panel) closes it. -->
<dialog
	bind:this={dialog}
	aria-labelledby="calendar-dialog-title"
	class="m-auto w-[min(34rem,calc(100%-2rem))] overflow-visible bg-transparent p-0 backdrop:bg-ink/70"
	onclick={(e) => {
		if (e.target === dialog) close();
	}}
>
	<div class="hard rounded-2xl bg-paper p-6 sm:p-8">
		<div class="flex items-start justify-between gap-4">
			<h2 id="calendar-dialog-title" class="font-display text-2xl font-bold uppercase">
				Termine in den Kalender
			</h2>
			<button
				type="button"
				aria-label="Schließen"
				class="hard hard-press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red text-white"
				onclick={close}
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					class="h-5 w-5"
				>
					<path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
				</svg>
			</button>
		</div>

		<section class="mt-6">
			<h3 class="font-bold">Kalender abonnieren</h3>
			<p class="mt-1 text-sm leading-relaxed text-muted">
				Neue und geänderte Termine erscheinen automatisch. Die Adresse in deiner Kalender-App als
				Abo hinzufügen, z.&nbsp;B. in Google Kalender unter „Weitere Kalender“ → „Per URL“.
			</p>
			<div class="mt-3 flex gap-2">
				<input
					bind:this={urlInput}
					type="text"
					readonly
					value={subscribeUrl}
					aria-label="Kalender-Adresse zum Abonnieren"
					class="min-w-0 flex-1 rounded-xl border-3 border-ink bg-surface-2 px-3 py-2 font-mono text-sm"
					onfocus={(e) => e.currentTarget.select()}
				/>
				<button
					type="button"
					class="hard hard-press hard-gold shrink-0 rounded-xl bg-paper px-4 py-2 font-bold"
					onclick={() => urlInput && copy(urlInput)}
				>
					{copied ? 'Kopiert' : 'Kopieren'}
				</button>
			</div>
			<a
				href={subscribeUrl}
				rel="external"
				class="mt-3 inline-block text-sm font-bold underline underline-offset-4"
				>Direkt in der Kalender-App öffnen</a
			>
		</section>

		<section class="mt-6 border-t-3 border-ink/10 pt-6">
			<h3 class="font-bold">Einmalig herunterladen</h3>
			<p class="mt-1 text-sm leading-relaxed text-muted">
				Alle Termine als .ics-Datei zum Importieren. Spätere Änderungen werden nicht übernommen.
			</p>
			<a
				href={downloadUrl}
				rel="external"
				class="hard hard-press mt-3 inline-block rounded-xl bg-paper px-4 py-2 font-bold"
				>.ics herunterladen</a
			>
		</section>
	</div>
</dialog>
