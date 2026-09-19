<script lang="ts">
	import { labelStyles, type EventLabel } from '$lib/data/events';

	let { labels }: { labels: readonly EventLabel[] } = $props();
</script>

{#each labels as label (label)}
	<span
		class="rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase {labelStyles[label]}"
		>{label}</span
	>
{/each}
