<script>
	import Clues from './Clues.svelte';
	import Puzzle from './Puzzle.svelte';

	export let clues;
	export let stacked;
	export let isDisableHighlight;
	export let isLoaded;
	export let focusedCellIndex;
	export let focusedDirection;
	export let isRevealing;
	export let isChecking;
	export let revealDuration;
	export let showKeyboard;
	export let keyboardStyle;
	export let cells;

	$: focusedCell = cells[focusedCellIndex] || {};
	$: cellIndexMap = Object.fromEntries(cells.map((cell) => [cell.id, cell.index]));
</script>

<div class="play" class:stacked class:is-loaded={isLoaded}>
	<Clues
		{clues}
		{cellIndexMap}
		{stacked}
		{isDisableHighlight}
		{isLoaded}
		bind:focusedCellIndex
		bind:focusedCell
		bind:focusedDirection
	/>
	<Puzzle
		{clues}
		{focusedCell}
		{isRevealing}
		{isChecking}
		{isDisableHighlight}
		{revealDuration}
		{showKeyboard}
		{stacked}
		{isLoaded}
		{keyboardStyle}
		bind:cells
		bind:focusedCellIndex
		bind:focusedDirection
	/>
</div>

<style>
	.play {
		display: flex;
		flex-direction: var(--order, row);
	}
	.play.is-loaded.stacked {
		flex-direction: column;
	}
	@media only screen and (max-width: 720px) {
		.play:not(.is-loaded) {
			flex-direction: column;
		}
	}
</style>
