<script lang="ts">
	import { onMount } from 'svelte';
	import PuzzleGrid from './PuzzleGrid.svelte';
	import PuzzleKeyboard from './PuzzleKeyboard.svelte';
	import checkMobile from './helpers/checkMobile.js';
	import { dispatch } from './helpers/puzzleController.js';
	import type {
		Cell,
		Clue,
		Direction,
		PuzzleState,
		StatePatch,
		PuzzleAction
	} from './helpers/types';

	export let clues: Clue[];
	export let cells: Cell[];
	export let focusedDirection: Direction;
	export let focusedCellIndex: number;
	export let focusedCell: Cell;
	export let isRevealing: boolean;
	export let isChecking: boolean;
	export let isDisableHighlight: boolean;
	export let stacked: boolean;
	export let revealDuration = 0;
	export let showKeyboard: boolean | undefined;
	export let isLoaded: boolean;
	export let keyboardStyle: string;

	let gridComponent: PuzzleGrid | undefined;
	let hiddenInput: HTMLInputElement | undefined;
	let cellsHistoryIndex = 0,
		cellsHistory: Cell[][] = [];
	let focusedCellIndexHistoryIndex = 0,
		focusedCellIndexHistory: number[] = [];
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
		isMobile = !!checkMobile();
	});

	function s(): PuzzleState {
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
	function apply(p: StatePatch | null) {
		if (!p) return;
		if ('cells' in p && p.cells) cells = p.cells;
		if ('cellsHistory' in p && p.cellsHistory) cellsHistory = p.cellsHistory;
		if ('cellsHistoryIndex' in p && p.cellsHistoryIndex !== undefined)
			cellsHistoryIndex = p.cellsHistoryIndex;
		if ('focusedCellIndex' in p && p.focusedCellIndex !== undefined)
			focusedCellIndex = p.focusedCellIndex;
		if ('focusedDirection' in p && p.focusedDirection) focusedDirection = p.focusedDirection;
		if ('focusedCellIndexHistory' in p && p.focusedCellIndexHistory)
			focusedCellIndexHistory = p.focusedCellIndexHistory;
		if ('focusedCellIndexHistoryIndex' in p && p.focusedCellIndexHistoryIndex !== undefined)
			focusedCellIndexHistoryIndex = p.focusedCellIndexHistoryIndex;
		if (p._focusHidden) fh();
	}
	function act(action: PuzzleAction) {
		apply(dispatch(s(), action));
	}
	function onKeydown({ detail }: CustomEvent<string>) {
		act({ type: 'keydown', detail });
	}
	function onNativeKeydown(e: KeyboardEvent) {
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
			(!!el && el.contains(document.activeElement)) || document.activeElement === hiddenInput;
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
