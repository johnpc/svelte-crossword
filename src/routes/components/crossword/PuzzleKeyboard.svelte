<script>
	import Keyboard from '../keyboard/Keyboard.svelte';

	export let keyboardStyle;
	export let onKeydown;
</script>

<div class="keyboard">
	<Keyboard
		layout="crossword"
		style={keyboardStyle}
		on:keydown={onKeydown}
		--height="2.5rem"
		--background="linen"
		--color="currentColor"
		--border="none"
		--border-radius="1px"
		--box-shadow="none"
		--flex="1"
		--font-family="sans-serif"
		--font-size="12px"
		--font-weight="normal"
		--margin="0.125rem"
		--min-width="1rem"
		--opacity="1"
		--stroke-width="1px"
		--text-transform="none"
		--active-background="palevioletred"
		--active-border="none"
		--active-box-shadow="none"
		--active-color="currentColor"
		--active-opacity="1"
		--active-transform="none"
	/>
</div>

<style>
	.keyboard {
		order: 3;
	}
</style>
