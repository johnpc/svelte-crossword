<script lang="ts">
	import Crossword from './components/crossword/Crossword.svelte';
	import PuzzleToolbar from './PuzzleToolbar.svelte';
	import type { ActiveSession } from './helpers/session/puzzleSession';
	import type { AssistKind } from './helpers/session/puzzleSession';

	/** The sitting being rendered: playing or solved. Everything shown derives from it. */
	export let session: ActiveSession;
	export let showAppKeyboard: boolean;
	export let keyboardStyle: 'outline' | 'depth';
	export let showHistory = true;
	export let onAssist: (kind: AssistKind) => void;
	export let onToggleKeyboard: () => void;
	export let onContinue: () => void;
	/** Reported by the engine: every square matches its answer. */
	export let isComplete = false;

	$: solved = session.phase === 'solved';
</script>

<Crossword
	bind:isComplete
	data={session.puzzle.clues}
	breakpoint={10000}
	theme="pink"
	showKeyboard={showAppKeyboard}
	revealed={solved}
	{keyboardStyle}
>
	<div slot="toolbar" let:onClear let:onReveal let:onCheck>
		<PuzzleToolbar
			elapsedSeconds={session.elapsedSeconds}
			{solved}
			assists={session.assists}
			{showAppKeyboard}
			{showHistory}
			{onClear}
			{onReveal}
			{onCheck}
			{onAssist}
			{onToggleKeyboard}
			{onContinue}
		/>
	</div>
</Crossword>
