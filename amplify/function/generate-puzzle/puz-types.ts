export interface PuzHeader {
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
}

export interface PuzClue {
	clue: string;
	x: number;
	y: number;
	answer: string;
	direction: 'across' | 'down';
}

export interface PuzBoardCell {
	x: number;
	y: number;
	letter: string;
	isBlank: boolean;
	acrossClue: number;
	downClue: number;
}

export interface PuzJson {
	header: PuzHeader;
	puzzle: { solution: string; state: string };
	clues: { across: Record<string, PuzClue>; down: Record<string, PuzClue> };
	board: PuzBoardCell[][];
}

export interface SlotEntry {
	num: number;
	r: number;
	c: number;
	answer: string;
}
