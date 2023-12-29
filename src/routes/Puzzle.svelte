<script lang="ts">
	import Crossword from 'svelte-crossword';
	import type { Schema } from '../../amplify/data/resource';
	import { generateClient } from 'aws-amplify/data';
	import { Amplify } from 'aws-amplify';
	import config from '../amplifyconfiguration.json';
	import { goto } from '$app/navigation';
	import { getCurrentUser } from 'aws-amplify/auth';
	import type { AuthUser } from 'aws-amplify/auth';
	import { onMount } from 'svelte';
	Amplify.configure(config);
	const client = generateClient<Schema>({
		authMode: 'userPool'
	});

	type Clue = {
		clue: string;
		answer: string;
		direction: 'across' | 'down';
		x: number;
		y: number;
	};

	$: clues = [] as Clue[];
	let ref: any;
	$: puzzles = [] as Schema['Puzzle'][];
	$: profile = {} as Schema['Profile'];
	$: puzzleIndex = 0;
	$: timeInSeconds = 0;
	$: isPuzzleComplete = false;
	$: usedCheck = false;
	$: usedReveal = false;
	$: usedClear = false;
	$: currentUser = {} as AuthUser;

	onMount(() => {
		const setup = async () => {
			try {
				currentUser = await getCurrentUser();
			} catch (e) {
				goto('/login');
			}
			console.log({ currentUser });
			const profile = await getOrCreateProfile();
			console.log({ profile });
			const puzzle = await fetchPuzzle();
			console.log({ puzzle });
		};

		setup();
	});
	const getOrCreateProfile = async () => {
		const currentUser = await getCurrentUser();
		try {
			const getProfileResponse = await client.models.Profile.get({
				id: currentUser.userId
			});
			console.log({ getProfileResponse });
			if (getProfileResponse?.data?.id) {
				profile = getProfileResponse.data;
				return;
			}
		} catch (e) {
			console.warn(e);
		}
		const createProfileResponse = await client.models.Profile.create({
			id: currentUser.userId,
			userId: currentUser.userId,
			email: currentUser.signInDetails?.loginId!,
			name: currentUser.signInDetails?.loginId || currentUser.username
		});
		console.log({ createProfileResponse });
		profile = createProfileResponse.data;
		return profile;
	};

	const getCluesFromPuzzle = (puzzle: Schema['Puzzle']) => {
		if (!puzzle) {
			return [];
		}
		const jsonAtIndex = JSON.parse(puzzle.puzJson as string);
		const across = Object.values(jsonAtIndex.clues.across) as Clue[];
		const down = Object.values(jsonAtIndex.clues.down) as Clue[];
		return [...across, ...down];
	};

	const fetchPuzzle = async () => {
		console.log({ profile });
		const puzzleResponse = await client.models.Puzzle.list({
			limit: 100
		});
		console.log({ puzzleResponse });
		const completedPuzzles = await profile.completedPuzzles();
		const completedPuzzleIdPromises = completedPuzzles.data.map(async (completedPuzzle) => {
			const puzzle = await completedPuzzle.puzzle();
			return puzzle.data?.id;
		});
		const completedPuzzleIds = await Promise.all(completedPuzzleIdPromises);
		console.log({ completedPuzzleIds });
		puzzles = puzzleResponse.data.filter((puzzle) => {
			return !completedPuzzleIds.includes(puzzle.id);
		});
		clues = getCluesFromPuzzle(puzzles[puzzleIndex]);
		return clues;
	};

	const onPuzzleComplete = async () => {
		await client.models.UserPuzzle.create({
			usedCheck,
			usedClear,
			usedReveal,
			timeInSeconds,
			userPuzzlePuzzleId: puzzles[puzzleIndex].id,
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
	const onToolbarNextPuzzle = () => {
		console.log('Requested new puzzle!');
		timeInSeconds = 0;
		usedCheck = false;
		usedReveal = false;
		usedClear = false;
		isPuzzleComplete = false;
		puzzleIndex++;
		clues = getCluesFromPuzzle(puzzles[puzzleIndex]);
		tickTimer();
		fetchPuzzle();
	};
</script>

{#if clues.length === 0}
	<p>Loading...</p>
{:else}
	<Crossword bind:this={ref} data={clues} breakpoint={10000} theme="classic">
		<div class="toolbar" slot="toolbar" let:onClear let:onReveal let:onCheck>
			<p style="display: inline;">{timeInSeconds}</p>
			<button on:click={onToolbarHistory}>History</button>
			<button on:click={() => onToolbarClear(onClear)}>Clear</button>
			<button on:click={() => onToolbarReveal(onReveal)}>Reveal</button>
			<button on:click={() => onToolbarCheck(onCheck)}>Check</button>
			{#if isPuzzleComplete}
				<button class="next-puzzle" on:click={onToolbarNextPuzzle}>Next Puzzle</button>
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

	.next-puzzle {
		background-color: var(--secondary-highlight-color);
		color: aliceblue;
	}
</style>
