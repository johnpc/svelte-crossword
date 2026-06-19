<script lang="ts">
	import { getKeydownAction } from './helpers/cellLogic.js';
	import CellText from './CellText.svelte';
	import type { Direction } from './helpers/types';

	export let x: number;
	export let y: number;
	export let value: string | undefined;
	export let answer: string;
	export let number: number | undefined;
	export let index: number;
	export let custom: string | undefined;
	export let changeDelay = 0;
	export let isRevealing = false;
	export let isChecking = false;
	export let isFocused = false;
	export let isSecondarilyFocused = false;
	export let preventFocus = false;
	export let onFocusCell: (index: number) => void = () => {};
	export let onCellUpdate: (
		index: number,
		value: string,
		diff?: number,
		doReplace?: boolean
	) => void = () => {};
	export let onFocusClueDiff: (diff: number) => void = () => {};
	export let onMoveFocus: (direction: Direction, diff: number) => void = () => {};
	export let onFlipDirection: () => void = () => {};
	export let onHistoricalChange: (diff: number) => void = () => {};

	let element: SVGGElement | undefined;

	$: (isFocused, onFocusSelf());
	$: correct = answer === value;
	$: showCheck = isChecking && value;

	function onFocusSelf() {
		if (!element) return;
		if (isFocused && !preventFocus) element.focus();
	}

	function onKeydown(e: KeyboardEvent) {
		const action = getKeydownAction(e);
		if (!action) return;
		if (action.preventDefault) {
			e.preventDefault();
			e.stopPropagation();
		}

		if (action.type === 'historicalChange') onHistoricalChange(action.diff!);
		else if (action.type === 'focusClueDiff') onFocusClueDiff(action.diff!);
		else if (action.type === 'flipDirection') onFlipDirection();
		else if (action.type === 'delete') onCellUpdate(index, '', -1, true);
		else if (action.type === 'letter') onCellUpdate(index, action.value!);
		else if (action.type === 'moveFocus') onMoveFocus(action.direction!, action.diff!);
	}
</script>

<g
	class="cell {custom} cell-{x}-{y}"
	class:is-focused={isFocused}
	class:is-secondarily-focused={isSecondarilyFocused}
	class:is-correct={showCheck && correct}
	class:is-incorrect={showCheck && !correct}
	transform={`translate(${x}, ${y})`}
	tabIndex="0"
	on:click={() => onFocusCell(index)}
	on:keydown={onKeydown}
	bind:this={element}
>
	<rect width="1" height="1"></rect>
	{#if showCheck && !correct}
		<line x1="0" y1="1" x2="1" y2="0"></line>
	{/if}
	<CellText {value} {number} {changeDelay} {isRevealing} />
</g>

<style>
	g {
		cursor: pointer;
		user-select: none;
	}
	g:focus {
		outline: none;
	}
	g.is-secondarily-focused rect {
		fill: var(--secondary-highlight-color);
	}
	g.is-focused rect {
		fill: var(--primary-highlight-color);
	}
	rect {
		fill: var(--bg-color);
		stroke: var(--main-color);
		stroke-width: 0.01em;
		transition: fill 0.1s ease-out;
	}
	line {
		stroke: var(--main-color);
		stroke-width: 0.02em;
	}
</style>
