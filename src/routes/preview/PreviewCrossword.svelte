<script lang="ts">
	import PuzzleCrossword from '../PuzzleCrossword.svelte';
	import type { ActiveSession, AssistKind } from '../helpers/session/puzzleSession';

	export let session: ActiveSession;
	export let showAppKeyboard: boolean;
	export let keyboardStyle: 'outline' | 'depth';
	export let onAssist: (kind: AssistKind) => void;
	export let onToggleKeyboard: () => void;
	export let onContinue: () => void;
	export let isComplete = false;
</script>

<PuzzleCrossword
	{session}
	{showAppKeyboard}
	{keyboardStyle}
	showHistory={false}
	{onAssist}
	{onToggleKeyboard}
	{onContinue}
	bind:isComplete
/>
