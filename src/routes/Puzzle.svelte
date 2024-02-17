<script lang="ts">
	import Crossword from './components/crossword/Crossword.svelte';
	import { Jumper } from 'svelte-loading-spinners';
	import type { Schema } from '../../amplify/data/resource';
	import { generateClient } from 'aws-amplify/data';
	import { goto } from '$app/navigation';
	import { getCurrentUser } from 'aws-amplify/auth';
	import { onMount } from 'svelte';
	import { signOut } from 'aws-amplify/auth';
	import { getOrCreateProfile } from './helpers/getOrCreateProfile';
	import type { Clue, HydratedProfile } from './helpers/types/types';
	import { getNextPuzzle } from './helpers/getNextPuzzle';
	const client = generateClient<Schema>({
		authMode: 'userPool'
	});

	$: clues = [] as Clue[];
	$: puzzleId = '' as string;
	$: profile = {} as HydratedProfile;
	$: timeInSeconds = 0;
	$: isPuzzleComplete = false;
	$: usedCheck = false;
	$: usedReveal = false;
	$: usedClear = false;
	$: keyboardStyle = 'outline' as 'outline' | 'depth';
	let ref: any;

	onMount(() => {
		const setup = async () => {
			try {
				await getCurrentUser();
			} catch (e) {
				goto('/login');
			}
			profile = await getOrCreateProfile(client);
			console.log({ onMount: true, profile });
			const puzzle = await getNextPuzzle(profile);
			clues = puzzle.clues;
			puzzleId = puzzle.id;
			console.log({ onMount: true, clues });
		};

		setup();
	});

	const onPuzzleComplete = async () => {
		await client.models.UserPuzzle.create({
			usedCheck,
			usedClear,
			usedReveal,
			timeInSeconds,
			userPuzzlePuzzleId: puzzleId,
			profileCompletedPuzzlesId: profile.id
		});
	};

	const tickTimer = () => {
		setTimeout(() => {
			if (ref) {
				const cells = ref?.$$?.ctx?.find(
					(element: any) => Array.isArray(element) && element?.[0]?.cells
				);
				if (!cells) {
					return tickTimer();
				}
				isPuzzleComplete = cells.every((cell: any) => cell.isCorrect);
				if (isPuzzleComplete) {
					return onPuzzleComplete();
				}
			}
			timeInSeconds++;
			if (!isPuzzleComplete) {
				tickTimer();
			}
		}, 1000);
	};
	tickTimer();

	const onToolbarClear = (onClear: Function) => {
		usedClear = true;
		onClear();
	};
	const onToolbarReveal = (onReveal: Function) => {
		usedReveal = true;
		onReveal();
	};
	const onToolbarCheck = (onCheck: Function) => {
		usedCheck = true;
		onCheck();
	};
	const onToolbarHistory = () => {
		goto('/history');
	};
	const onToolbarNextPuzzle = async () => {
		console.log('Requested new puzzle!');
		timeInSeconds = 0;
		usedCheck = false;
		usedReveal = false;
		usedClear = false;
		isPuzzleComplete = false;
		const puzzle = await getNextPuzzle(profile);
		clues = puzzle.clues;
		puzzleId = puzzle.id;
		tickTimer();
	};

	const onSignOut = async () => {
		await signOut();
		goto('/login');
	};
</script>

{#if clues.length === 0}
	<p><Jumper size="60" color="#FF3E00" unit="px" duration="1s" /></p>
{:else}
	<h3>
		👋 {profile.email.split('@')[0]}
		<span id="logoutLink">(not you? <a href="#" on:click={() => onSignOut()}>sign out</a>)</span>
	</h3>

	<Crossword
		bind:this={ref}
		data={clues}
		breakpoint={10000}
		theme="amelia"
		showKeyboard={true}
		{keyboardStyle}
	>
		<div class="toolbar" slot="toolbar" let:onClear let:onReveal let:onCheck>
			<p id="timer">{timeInSeconds}</p>
			{#if !isPuzzleComplete}
				<button class="history-button" on:click={onToolbarHistory}>History</button>
			{/if}
			<button on:click={() => onToolbarClear(onClear)}>Clear</button>
			<button on:click={() => onToolbarReveal(onReveal)}>Reveal</button>
			<button on:click={() => onToolbarCheck(onCheck)}>Check</button>
			{#if isPuzzleComplete}
				<button class="next-puzzle-button" on:click={() => onToolbarNextPuzzle()}
					>Next Puzzle</button
				>
			{/if}
		</div>
	</Crossword>
{/if}

<style>
	.toolbar {
		margin-bottom: 1em;
		padding: 1em 0;
		display: flex;
		justify-content: flex-end;
		font-family: var(--font);
		font-size: 0.85em;
		background-color: transparent;
	}

	button {
		cursor: pointer;
		margin-left: 1em;
		font-size: 1em;
		font-family: var(--font);
		background-color: var(--accent-color);
		border-radius: 4px;
		color: var(--main-color);
		padding: 0.75em;
		border: none;
		font-weight: 400;
		transition: background-color 150ms;
	}

	button:hover {
		background-color: var(--primary-highlight-color);
	}

	.next-puzzle-button {
		background-color: var(--secondary-highlight-color);
		color: aliceblue;
	}
	.history-button {
		background-color: var(--secondary-highlight-color);
		color: aliceblue;
	}
	#logoutLink {
		font-size: small;
	}
	#timer {
		display: inline;
	}
</style>
