<script lang="ts">
	import { asset } from '$app/paths';

	// Decorative: the wordmark next to it already names us, so the crest is
	// marked presentational rather than given a redundant alt text.
	let { class: klass = '' }: { class?: string } = $props();
</script>

<span class="crest-neon {klass}">
	<img src={asset('/img/wappen.png')} alt="" role="presentation" />
</span>
