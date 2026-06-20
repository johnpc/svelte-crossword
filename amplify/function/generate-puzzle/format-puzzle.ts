import { GeneratedGrid } from './grid-generator';
import { GeneratedClues } from './clue-generator';

export interface PuzJson {
	header: {
		checksum: number;
		fileMagic: string;
		cibChecksum: number;
		maskedLowCheckSums: string;
		maskedHighCheckSums: string;
		version: string;
		reserved1C: string;
		scrambledChecksum: number;
		reserved20: string;
		width: number;
		height: number;
		scrambled: boolean;
		numberOfClues: number;
		unknownBitmask: number;
		scambledtag: number;
		title: string;
		author: string;
		copyright: string;
	};
	puzzle: {
		solution: string;
		state: string;
	};
	clues: {
		across: Record<
			string,
			{ clue: string; x: number; y: number; answer: string; direction: 'across' | 'down' }
		>;
		down: Record<
			string,
			{ clue: string; x: number; y: number; answer: string; direction: 'across' | 'down' }
		>;
	};
	board: {
		x: number;
		y: number;
		letter: string;
		isBlank: boolean;
		acrossClue: number;
		downClue: number;
	}[][];
}

export function formatPuzzle(grid: GeneratedGrid, clues: GeneratedClues): PuzJson {
	const header = {
		checksum: 0,
		fileMagic: 'ACROSS&DOWN',
		cibChecksum: 0,
		maskedLowCheckSums: '00000000',
		maskedHighCheckSums: '00000000',
		version: '1.3',
		reserved1C: '0000',
		scrambledChecksum: 0,
		reserved20: '000000000000000000000000',
		width: 5,
		height: 5,
		scrambled: false,
		numberOfClues: 10,
		unknownBitmask: 0,
		scambledtag: 0,
		title: clues.title,
		author: 'xwords robot',
		copyright: ''
	};

	const solution = grid.solution;
	const state = '-'.repeat(25);

	const acrossClues: Record<
		string,
		{ clue: string; x: number; y: number; answer: string; direction: 'across' | 'down' }
	> = {};
	const downClues: Record<
		string,
		{ clue: string; x: number; y: number; answer: string; direction: 'across' | 'down' }
	> = {};

	// In a 5x5 all-white grid, clue numbers are:
	// 1-5 for rows (across), and 1-5 also start down clues
	// Clue numbering: cell (0,0) is clue 1 (both across and down)
	// cell (1,0) is clue 2 (down only), cell (2,0) is clue 3 (down only)...
	// Actually for a 5x5 all-white: row 0 starts across clue 1, and columns 0-4 start down clues 1-5
	// Row 1 has no new across number since all cells above are non-blank
	// Wait — in standard crossword numbering, a cell gets a number if:
	// - it starts an across word (leftmost in row or after a black square)
	// - it starts a down word (topmost in column or after a black square)
	// In all-white 5x5: only the top row and left column get numbers
	// (0,0) = 1 (across + down), (1,0) = 2 (down), (2,0) = 3 (down), (3,0) = 4 (down), (4,0) = 5 (down)
	// (0,1) = 6 (across), (0,2) = 7 (across), (0,3) = 8 (across), (0,4) = 9 (across)
	// Wait no. Standard numbering goes left-to-right, top-to-bottom.
	// In all-white 5x5:
	// - (0,0): starts across AND down → clue 1
	// - (1,0): starts down → clue 2
	// - (2,0): starts down → clue 3
	// - (3,0): starts down → clue 4
	// - (4,0): starts down → clue 5
	// - (0,1): starts across → clue 6
	// - (0,2): starts across → clue 7
	// - (0,3): starts across → clue 8
	// - (0,4): starts across → clue 9
	// Hmm, that's not right either. Let me think about coordinates.
	// x = column, y = row (matching existing format)
	// Numbering goes y=0 first (left to right), then y=1, etc.
	// At y=0: (x=0,y=0) starts across (x=0 means leftmost) AND down (y=0 means topmost) → 1
	//         (x=1,y=0) starts down (y=0) → 2
	//         (x=2,y=0) starts down → 3
	//         (x=3,y=0) starts down → 4
	//         (x=4,y=0) starts down → 5
	// At y=1: (x=0,y=1) starts across (x=0 means leftmost) → 6
	// At y=2: (x=0,y=2) starts across → 7
	// At y=3: (x=0,y=3) starts across → 8
	// At y=4: (x=0,y=4) starts across → 9

	// Across clues: numbered 1, 6, 7, 8, 9
	const acrossNumbers = [1, 6, 7, 8, 9];
	for (let row = 0; row < 5; row++) {
		const num = acrossNumbers[row];
		acrossClues[num] = {
			clue: clues.across[grid.across[row]] || `${grid.across[row]} clue`,
			x: 0,
			y: row,
			answer: grid.across[row],
			direction: 'across'
		};
	}

	// Down clues: numbered 1, 2, 3, 4, 5
	const downNumbers = [1, 2, 3, 4, 5];
	for (let col = 0; col < 5; col++) {
		const num = downNumbers[col];
		downClues[num] = {
			clue: clues.down[grid.down[col]] || `${grid.down[col]} clue`,
			x: col,
			y: 0,
			answer: grid.down[col],
			direction: 'down'
		};
	}

	// Build board
	const board: {
		x: number;
		y: number;
		letter: string;
		isBlank: boolean;
		acrossClue: number;
		downClue: number;
	}[][] = [];

	for (let row = 0; row < 5; row++) {
		const boardRow: {
			x: number;
			y: number;
			letter: string;
			isBlank: boolean;
			acrossClue: number;
			downClue: number;
		}[] = [];
		for (let col = 0; col < 5; col++) {
			boardRow.push({
				x: col,
				y: row,
				letter: grid.across[row][col],
				isBlank: false,
				acrossClue: acrossNumbers[row],
				downClue: downNumbers[col]
			});
		}
		board.push(boardRow);
	}

	return {
		header,
		puzzle: { solution, state },
		clues: { across: acrossClues, down: downClues },
		board
	};
}
