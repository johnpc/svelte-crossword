import { GeneratedGrid } from './grid-generator';
import { GeneratedClues } from './clue-generator';
import { SIZE } from './grid-rules';
import { findSlots } from './slot-finder';
import { buildSlotMembership, buildBoard, buildSolutionAndState } from './board-builder';
import { PuzJson, PuzClue, SlotEntry } from './puz-types';

export type { PuzJson } from './puz-types';

function buildClueMap(
	entries: SlotEntry[],
	clueLookup: Record<string, string>,
	direction: 'across' | 'down'
): Record<string, PuzClue> {
	const result: Record<string, PuzClue> = {};
	for (const entry of entries) {
		result[entry.num] = {
			clue: clueLookup[entry.answer] || `${entry.answer} clue`,
			x: entry.c,
			y: entry.r,
			answer: entry.answer,
			direction
		};
	}
	return result;
}

function buildHeader(title: string, numberOfClues: number): PuzJson['header'] {
	return {
		checksum: 0,
		fileMagic: 'ACROSS&DOWN',
		cibChecksum: 0,
		maskedLowCheckSums: '00000000',
		maskedHighCheckSums: '00000000',
		version: '1.3',
		reserved1C: '0000',
		scrambledChecksum: 0,
		reserved20: '000000000000000000000000',
		width: SIZE,
		height: SIZE,
		scrambled: false,
		numberOfClues,
		unknownBitmask: 0,
		scambledtag: 0,
		title,
		author: 'xwords robot',
		copyright: ''
	};
}

export function formatPuzzle(grid: GeneratedGrid, clues: GeneratedClues): PuzJson {
	const { across, down } = findSlots(grid.across);
	const acrossClues = buildClueMap(across, clues.across, 'across');
	const downClues = buildClueMap(down, clues.down, 'down');
	const { solution, state } = buildSolutionAndState(grid.across);
	const { acrossMembership, downMembership } = buildSlotMembership(grid.across, across, down);
	const board = buildBoard(grid.across, acrossMembership, downMembership);
	const header = buildHeader(clues.title, across.length + down.length);
	return {
		header,
		puzzle: { solution, state },
		clues: { across: acrossClues, down: downClues },
		board
	};
}
