<script>
	export let stacked;
	export let isLoaded;
</script>

<section class="clues" class:stacked class:is-loaded={isLoaded}>
	<slot />
</section>

<style>
	section {
		position: sticky;
		top: 1em;
		flex: 0 1 16em;
		height: fit-content;
		margin: 0;
		margin-right: 1em;
	}
	section.is-loaded.stacked {
		position: static;
		height: auto;
		top: auto;
		display: block;
		margin: 1em 0;
		flex: auto;
	}
	@media only screen and (max-width: 720px) {
		section:not(.is-loaded) {
			position: static;
			height: auto;
			top: auto;
			display: block;
			margin: 1em 0;
			flex: auto;
		}
	}
</style>
