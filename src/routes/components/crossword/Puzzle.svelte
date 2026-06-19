<script>
	import { onMount } from 'svelte';
	import PuzzleGrid from './PuzzleGrid.svelte';
	import PuzzleKeyboard from './PuzzleKeyboard.svelte';
	import checkMobile from './helpers/checkMobile.js';
	import { dispatch } from './helpers/puzzleController.js';

	export let clues, cells, focusedDirection, focusedCellIndex, focusedCell;
	export let isRevealing,
		isChecking,
		isDisableHighlight,
		stacked,
		revealDuration = 0;
	export let showKeyboard, isLoaded, keyboardStyle;

	let gridComponent,
		hiddenInput,
		cellsHistoryIndex = 0,
		cellsHistory = [];
	let focusedCellIndexHistoryIndex = 0,
		focusedCellIndexHistory = [];
	let isMobile = false,
		isPuzzleFocused = false;
	const numberOfStatesInHistory = 10;

	$: w = Math.max(...cells.map((d) => d.x)) + 1;
	$: h = Math.max(...cells.map((d) => d.y)) + 1;
	$: keyboardVisible = typeof showKeyboard === 'boolean' ? showKeyboard : isMobile;
	$: sortedCellsInDirection = [...cells].sort((a, b) =>
		focusedDirection == 'down' ? a.x - b.x || a.y - b.y : a.y - b.y || a.x - b.x
	);
	$: if (!keyboardVisible && hiddenInput) setTimeout(() => hiddenInput?.focus(), 100);

	onMount(() => {
		isMobile = checkMobile();
	});

	function s() {
		return {
			cells,
			cellsHistory,
			cellsHistoryIndex,
			focusedDirection,
			focusedCellIndex,
			focusedCell,
			focusedCellIndexHistory,
			focusedCellIndexHistoryIndex,
			sortedCellsInDirection,
			clues,
			isPuzzleFocused,
			numberOfStatesInHistory
		};
	}
	function fh() {
		if (!keyboardVisible && hiddenInput) setTimeout(() => hiddenInput?.focus(), 0);
	}
	function apply(p) {
		if (!p) return;
		if ('cells' in p) cells = p.cells;
		if ('cellsHistory' in p) cellsHistory = p.cellsHistory;
		if ('cellsHistoryIndex' in p) cellsHistoryIndex = p.cellsHistoryIndex;
		if ('focusedCellIndex' in p) focusedCellIndex = p.focusedCellIndex;
		if ('focusedDirection' in p) focusedDirection = p.focusedDirection;
		if ('focusedCellIndexHistory' in p) focusedCellIndexHistory = p.focusedCellIndexHistory;
		if ('focusedCellIndexHistoryIndex' in p)
			focusedCellIndexHistoryIndex = p.focusedCellIndexHistoryIndex;
		if (p._focusHidden) fh();
	}
	function act(action) {
		apply(dispatch(s(), action));
	}
	function onKeydown({ detail }) {
		act({ type: 'keydown', detail });
	}
	function onNativeKeydown(e) {
		const p = dispatch(s(), {
			type: 'nativeKeydown',
			key: e.key,
			ctrlKey: e.ctrlKey,
			altKey: e.altKey
		});
		if (!p) return;
		e.preventDefault();
		apply(p);
		fh();
	}
	function onClick() {
		const el = gridComponent?.getElement();
		isPuzzleFocused =
			(el && el.contains(document.activeElement)) || document.activeElement === hiddenInput;
	}
</script>

<svelte:window on:click={onClick} />
<PuzzleGrid
	bind:this={gridComponent}
	bind:hiddenInputBinding={hiddenInput}
	{cells}
	{w}
	{h}
	{focusedCellIndex}
	{focusedCell}
	{focusedDirection}
	{isRevealing}
	{isChecking}
	{isDisableHighlight}
	{revealDuration}
	{keyboardVisible}
	{isLoaded}
	{stacked}
	{act}
	{onNativeKeydown}
/>
{#if keyboardVisible}<PuzzleKeyboard {keyboardStyle} {onKeydown} />{/if}
