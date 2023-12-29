<script lang="ts">
	import Crossword from 'svelte-crossword';
	import type { Schema } from '../../amplify/data/resource';
	import { generateClient } from 'aws-amplify/data';
	import { Amplify } from 'aws-amplify';
	import config from '../amplifyconfiguration.json';
	Amplify.configure(config);
	const client = generateClient<Schema>();

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
	$: puzzleIndex = 0;
	$: timeInSeconds = 0;
	$: isPuzzleComplete = false;
	$: usedCheck = false;
	$: usedReveal = false;
	$: usedClear = false;

	const getCluesFromPuzzle = (puzzle: Schema['Puzzle']) => {
		const jsonAtIndex = JSON.parse(puzzles[puzzleIndex].puzJson as string);
		const across = Object.values(jsonAtIndex.clues.across) as Clue[];
		const down = Object.values(jsonAtIndex.clues.down) as Clue[];
		return [...across, ...down];
	};
	const fetchPuzzle = async () => {
		const puzzleResponse = await client.models.Puzzle.list({
			authMode: 'iam'
		});
		puzzles = puzzleResponse.data;
		clues = getCluesFromPuzzle(puzzles[puzzleIndex]);
	};

	fetchPuzzle();

	const onPuzzleComplete = () => {
		console.log('Puzzle complete!');
		console.log({
			usedCheck,
			usedClear,
			usedReveal,
			timeInSeconds
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

<Crossword bind:this={ref} data={clues} showKeyboard={true} theme="amelia">
	<div class="toolbar" slot="toolbar" let:onClear let:onReveal let:onCheck>
		<p style="display: inline;">{timeInSeconds}</p>
		<button on:click={() => onToolbarClear(onClear)}>Clear</button>
		<button on:click={() => onToolbarReveal(onReveal)}>Reveal</button>
		<button on:click={() => onToolbarCheck(onCheck)}>Check</button>
		{#if isPuzzleComplete}
			<button class="next-puzzle" on:click={onToolbarNextPuzzle}>Next Puzzle</button>
		{/if}
	</div>
</Crossword>

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
