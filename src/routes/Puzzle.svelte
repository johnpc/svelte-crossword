<script lang="ts">
	import PuzzleCrossword from './PuzzleCrossword.svelte';
	import PuzzleHeader from './PuzzleHeader.svelte';
	import { SyncLoader } from 'svelte-loading-spinners';
	import { goto } from '$app/navigation';
	import { getCurrentUser, signOut } from 'aws-amplify/auth';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast';
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
	let outOfPuzzles = false;
	let cancelTimer: (() => void) | null = null;
	const tick = () => void timeInSeconds++;
	const isComplete = () => isPuzzleComplete;
	const startTimer = () => {
		cancelTimer?.();
		cancelTimer = createTimer(tick, isComplete);
	};

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
				if (!puzzle) {
					outOfPuzzles = true;
					return;
				}
				clues = puzzle.clues;
				puzzleId = puzzle.id;
				puzzleTitle = puzzle.title || '';
				puzzleAuthor = puzzle.author || '';
			},
			onUnauthenticated: () => goto('/preview'),
			onError: (e) => {
				console.error('Error loading:', e);
				toast.push('Error loading puzzle. Please try refreshing the page.');
			}
		});
	});

	onDestroy(() => cancelTimer?.());

	startTimer();

	const toggleKeyboard = () => {
		showAppKeyboard = !showAppKeyboard;
		localStorage.setItem('showAppKeyboard', String(showAppKeyboard));
	};
	const onNextPuzzle = async () => {
		try {
			const puzzle = await loadNextPuzzle(profile.id);
			if (!puzzle) {
				outOfPuzzles = true;
				return;
			}
			timeInSeconds = 0;
			usedCheck = usedReveal = usedClear = false;
			isPuzzleComplete = false;
			clues = puzzle.clues;
			puzzleId = puzzle.id;
			puzzleTitle = puzzle.title || '';
			puzzleAuthor = puzzle.author || '';
			startTimer();
		} catch (e) {
			console.error('Error loading next puzzle:', e);
			toast.push('Error loading the next puzzle. Please try again.');
		}
	};
	const onSignOut = () => performSignOut(signOut, () => void (clues = []));
</script>

{#if outOfPuzzles}
	<PuzzleHeader email={profile.email} puzzleTitle="" puzzleAuthor="" {onSignOut} />
	<p style="text-align: center; padding: 2rem;">
		You've completed every available puzzle! 🎉<br />
		Check back soon for more.
	</p>
{:else if clues.length === 0}
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
