<script lang="ts">
	import PuzzleCrossword from './PuzzleCrossword.svelte';
	import PuzzleHeader from './PuzzleHeader.svelte';
	import { SyncLoader } from 'svelte-loading-spinners';
	import { goto } from '$app/navigation';
	import { getCurrentUser, signOut } from 'aws-amplify/auth';
	import { onMount } from 'svelte';
	import { getOrCreateProfile } from './helpers/sql/getOrCreateProfile';
	import type { Clue, HydratedProfile } from './helpers/types/types';
	import {
		createTimer,
		performSignOut,
		loadNextPuzzle,
		initializePuzzle,
		submitPuzzleCompletion
	} from './helpers/puzzleGameLogic';

	$: clues = [] as Clue[];
	$: puzzleId = '';
	$: profile = {} as HydratedProfile;
	$: timeInSeconds = 0;
	$: isPuzzleComplete = false;
	$: usedCheck = false;
	$: usedReveal = false;
	$: usedClear = false;
	let puzzleTitle = '',
		puzzleAuthor = '';
	let crosswordComplete = false,
		showAppKeyboard = true;
	const tick = () => void timeInSeconds++;
	const isComplete = () => isPuzzleComplete;

	$: if (crosswordComplete && !isPuzzleComplete) {
		isPuzzleComplete = true;
		submitPuzzleCompletion({
			profileId: profile.id,
			puzzleId,
			usedCheck,
			usedClear,
			usedReveal,
			timeInSeconds
		});
	}

	onMount(() => {
		showAppKeyboard = localStorage.getItem('showAppKeyboard') !== 'false';
		initializePuzzle(getCurrentUser, getOrCreateProfile, {
			onAuthenticated(p, puzzle) {
				profile = p;
				clues = puzzle.clues;
				puzzleId = puzzle.id;
				puzzleTitle = puzzle.title || '';
				puzzleAuthor = puzzle.author || '';
			},
			onUnauthenticated: () => goto('/preview'),
			onError: (e) =>
				void (console.error('Error loading:', e),
				alert('Error loading puzzle. Please try refreshing the page.'))
		});
	});

	createTimer(tick, isComplete);

	const toggleKeyboard = () => {
		showAppKeyboard = !showAppKeyboard;
		localStorage.setItem('showAppKeyboard', String(showAppKeyboard));
	};
	const onNextPuzzle = async () => {
		timeInSeconds = 0;
		usedCheck = usedReveal = usedClear = false;
		isPuzzleComplete = false;
		const puzzle = await loadNextPuzzle(profile.id);
		clues = puzzle.clues;
		puzzleId = puzzle.id;
		puzzleTitle = puzzle.title || '';
		puzzleAuthor = puzzle.author || '';
		createTimer(tick, isComplete);
	};
	const onSignOut = () => performSignOut(signOut, () => void (clues = []));
</script>

{#if clues.length === 0}
	<p><SyncLoader size="60" color="palevioletred" unit="px" duration="1s" /></p>
{:else}
	<PuzzleHeader email={profile.email} {puzzleTitle} {puzzleAuthor} {onSignOut} />
	<PuzzleCrossword
		{clues}
		{showAppKeyboard}
		keyboardStyle="outline"
		{timeInSeconds}
		{isPuzzleComplete}
		{usedClear}
		{usedReveal}
		{usedCheck}
		onToggleKeyboard={toggleKeyboard}
		{onNextPuzzle}
		bind:isComplete={crosswordComplete}
	/>
{/if}
