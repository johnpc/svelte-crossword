<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Key from './Key.svelte';
	import qwertyStandard from './layouts/qwerty/standard.js';
	import qwertyCrossword from './layouts/qwerty/crossword.js';
	import qwertyWordle from './layouts/qwerty/wordle.js';
	import azertyStandard from './layouts/azerty/standard.js';
	import azertyCrossword from './layouts/azerty/crossword.js';
	import azertyWordle from './layouts/azerty/wordle.js';
	import backspaceSVG from './svg/backspace.js';
	import enterSVG from './svg/enter.js';
	import { haptic } from '../../helpers/haptics';
	import { SWAPS, processKeyStart, transformKeyData, getRowData } from './keyboardLogic.js';

	type KeyDef = import('./keyboardLogic.js').KeyDef;

	export let custom: KeyDef[] | undefined = undefined;
	export let localizationLayout: string = 'qwerty';
	export let layout: string = 'crossword';
	export let noSwap: string[] = [];
	export let keyClass: Record<string, string> = {};
	export let style: string | undefined = undefined;

	let page = 0;
	let shifted = false;
	let active: string | undefined = undefined;

	const layouts: Record<string, Record<string, KeyDef[]>> = {
		qwerty: { standard: qwertyStandard, crossword: qwertyCrossword, wordle: qwertyWordle },
		azerty: { standard: azertyStandard, crossword: azertyCrossword, wordle: azertyWordle }
	};
	const dispatch = createEventDispatcher<{ keydown: string }>();
	const swaps: Record<string, string> = { ...SWAPS, Enter: enterSVG, Backspace: backspaceSVG };

	const onKeyStart = (event: Event, value: string) => {
		event.preventDefault();
		haptic();
		active = value;
		const result = processKeyStart(value, shifted);
		if (result.type === 'page') page = result.page;
		else if (result.type === 'shift') shifted = result.shifted;
		else dispatch('keydown', result.output);
		event.stopPropagation();
		return false;
	};

	const onKeyEnd = (value: string) => {
		setTimeout(() => {
			if (value === active) active = undefined;
		}, 50);
	};

	$: rawData = custom || layouts[localizationLayout][layout] || qwertyStandard;
	$: data = transformKeyData(rawData, swaps, noSwap, shifted);
	$: rowData = getRowData(data);
</script>

<div class="svelte-keyboard" {style}>
	{#each rowData as row, i}
		<div class="page" class:visible={i === page}>
			{#each row as keys}
				<div class="row row--{i}">
					{#each keys as { value, display }}
						<Key
							{value}
							display={display ?? ''}
							keyClass={keyClass[value] || ''}
							active={value === active}
							{onKeyStart}
							{onKeyEnd}
						/>
					{/each}
				</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.row {
		display: flex;
		justify-content: center;
		touch-action: manipulation;
	}
	.page {
		display: none;
	}
	.page.visible {
		display: block;
	}
	:global(.svelte-keyboard svg) {
		stroke-width: var(--stroke-width, 2px);
		vertical-align: middle;
	}
</style>
