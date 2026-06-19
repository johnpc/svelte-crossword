<script>
	import Cell from './Cell.svelte';

	export let cells, w, h, focusedCellIndex, isDisableHighlight;
	export let isRevealing, isChecking, revealDuration, keyboardVisible;
	export let secondarilyFocusedCells, act;

	function onCellUpdate(i, v, d = 1, r = false) {
		act({ type: 'cellUpdate', index: i, value: v, diff: d, doReplace: r });
	}
	function onFocusCell(index) {
		act({ type: 'focusCell', index });
	}
	function onFocusClueDiff(diff = 1) {
		act({ type: 'focusClueDiff', diff });
	}
	function onMoveFocus(direction, diff) {
		act({ type: 'moveFocus', direction, diff });
	}
	function onFlipDirection() {
		act({ type: 'flipDirection' });
	}
	function onHistoricalChange(diff) {
		act({ type: 'historicalChange', diff });
	}
</script>

<svg viewBox="0 0 {w} {h}">
	{#each cells as { x, y, value, answer, index, number, custom }}
		<Cell
			{x}
			{y}
			{index}
			{value}
			{answer}
			{number}
			{custom}
			changeDelay={isRevealing ? (revealDuration / cells.length) * index : 0}
			{isRevealing}
			{isChecking}
			isFocused={focusedCellIndex == index && !isDisableHighlight}
			isSecondarilyFocused={secondarilyFocusedCells.includes(index) && !isDisableHighlight}
			preventFocus={!keyboardVisible}
			{onFocusCell}
			{onCellUpdate}
			{onFocusClueDiff}
			{onMoveFocus}
			{onFlipDirection}
			{onHistoricalChange}
		/>
	{/each}
</svg>

<style>
	svg {
		width: 100%;
		display: block;
		font-size: 1px;
		background: var(--main-color);
		border: 4px solid var(--main-color);
		box-sizing: border-box;
	}
</style>
