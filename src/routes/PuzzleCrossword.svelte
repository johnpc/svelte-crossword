<script lang="ts">
	import Crossword from './components/crossword/Crossword.svelte';
	import PuzzleToolbar from './PuzzleToolbar.svelte';
	import type { Clue } from './helpers/types/types';

	export let clues: Clue[];
	export let showAppKeyboard: boolean;
	export let keyboardStyle: 'outline' | 'depth';
	export let timeInSeconds: number;
	export let isPuzzleComplete: boolean;
	export let usedClear: boolean;
	export let usedReveal: boolean;
	export let usedCheck: boolean;
	export let onToggleKeyboard: () => void;
	export let onNextPuzzle: () => Promise<void>;
	export let isComplete = false;
</script>

<Crossword
	bind:isComplete
	data={clues}
	breakpoint={10000}
	theme="pink"
	showKeyboard={showAppKeyboard}
	{keyboardStyle}
>
	<div slot="toolbar" let:onClear let:onReveal let:onCheck>
		<PuzzleToolbar
			{timeInSeconds}
			{isPuzzleComplete}
			{usedClear}
			{usedReveal}
			{usedCheck}
			{showAppKeyboard}
			{onClear}
			{onReveal}
			{onCheck}
			{onToggleKeyboard}
			{onNextPuzzle}
		/>
	</div>
</Crossword>
