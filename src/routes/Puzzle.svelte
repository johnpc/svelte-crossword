<script lang="ts">
	import Crossword from 'svelte-crossword';
	import type { Schema } from "../../amplify/data/resource";

	type Clue = {
		clue: string,
		answer: string,
		direction: "across"|"down",
		x: number,
		y: number,
	};
	let clues: Clue[]
	let ref: any;
	let puzzle: Schema["Puzzle"];
	$: timeInSeconds = 0;
	$: isPuzzleComplete = false;
	$: usedCheck = false;
	$: usedReveal = false;
	$: usedClear = false;

	const fetchPuzzle = async () => {
		clues = [
		{
			clue: 'The 1% of 1% milk',
			answer: 'FAT',
			direction: 'across',
			x: 2,
			y: 0
		},
		{
			clue: 'Flicker of light',
			answer: 'GLINT',
			direction: 'across',
			x: 0,
			y: 1
		},
		{
			clue: 'Really neat',
			answer: 'NIFTY',
			direction: 'across',
			x: 0,
			y: 2
		},
		{
			clue: '"__ we meet again"',
			answer: 'UNTIL',
			direction: 'across',
			x: 0,
			y: 3
		},
		{
			clue: "It's way over your head",
			answer: 'SKY',
			direction: 'across',
			x: 0,
			y: 4
		},
		{
			clue: 'Point bonus for using all seven tiles in Scrabble',
			answer: 'FIFTY',
			direction: 'down',
			x: 2,
			y: 0
		},
		{
			clue: 'Opposite of pro-',
			answer: 'ANTI',
			direction: 'down',
			x: 3,
			y: 0
		},
		{
			clue: 'Texter\'s "gotta run"',
			answer: 'TTYL',
			direction: 'down',
			x: 4,
			y: 0
		},
		{
			clue: 'Migratory antelopes',
			answer: 'GNUS',
			direction: 'down',
			x: 0,
			y: 1
		},
		{
			clue: 'Clickable part of a webpage',
			answer: 'LINK',
			direction: 'down',
			x: 1,
			y: 1
		}
	];
	}

	fetchPuzzle();

	const onPuzzleComplete = () => {
		console.log('Puzzle complete!');
		console.log({
			usedCheck,
			usedClear,
			usedReveal,
			timeInSeconds,
		})
	};
	const tickTimer = () => {
		setTimeout(() => {
			if (ref) {
				const cells = ref.$$.ctx.find(
					(element: any) => Array.isArray(element) && element?.[0].cells
				);
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
</script>

<Crossword bind:this={ref} data={clues} theme="amelia">
	<div class="toolbar" slot="toolbar" let:onClear let:onReveal let:onCheck>
		<p style="display: inline;">{timeInSeconds}</p>

		<button on:click={() => onToolbarClear(onClear)}>Clear</button>
		<button on:click={() => onToolbarReveal(onReveal)}>Reveal</button>
		<button on:click={() => onToolbarCheck(onCheck)}>Check</button>
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
	  background-color: var(--secondary-highlight-color);
	}
  </style>
