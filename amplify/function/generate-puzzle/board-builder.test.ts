import { describe, it, expect } from 'vitest';
import { findSlots } from './slot-finder';
import { buildSlotMembership, buildBoard, buildSolutionAndState } from './board-builder';

const ALL_WHITE = ['ABCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXY'];
const TL_BR_BLACK = [' BCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWX '];

describe('board-builder', () => {
	describe('buildSolutionAndState', () => {
		it('emits the 25-char solution for an all-white grid', () => {
			const { solution, state } = buildSolutionAndState(ALL_WHITE);
			expect(solution).toBe('ABCDEFGHIJKLMNOPQRSTUVWXY');
			expect(state).toBe('-'.repeat(25));
		});

		it('encodes black cells as . in both solution and state', () => {
			const { solution, state } = buildSolutionAndState(TL_BR_BLACK);
			expect(solution[0]).toBe('.');
			expect(solution[24]).toBe('.');
			expect(state[0]).toBe('.');
			expect(state[24]).toBe('.');
			expect(state[1]).toBe('-');
		});
	});

	describe('buildSlotMembership', () => {
		it('maps each white cell to its containing across+down slot numbers', () => {
			const { across, down } = findSlots(ALL_WHITE);
			const { acrossMembership, downMembership } = buildSlotMembership(ALL_WHITE, across, down);
			// Cell (0,0) is in across slot 1 and down slot 1
			expect(acrossMembership[0][0]).toBe(1);
			expect(downMembership[0][0]).toBe(1);
			// Cell (0,4) is in across slot 1 and down slot 5
			expect(acrossMembership[0][4]).toBe(1);
			expect(downMembership[0][4]).toBe(5);
		});

		it('leaves blank cells with 0 membership', () => {
			const { across, down } = findSlots(TL_BR_BLACK);
			const { acrossMembership, downMembership } = buildSlotMembership(TL_BR_BLACK, across, down);
			expect(acrossMembership[0][0]).toBe(0);
			expect(downMembership[0][0]).toBe(0);
		});
	});

	describe('buildBoard', () => {
		it('produces a 5x5 board with letter, isBlank, and clue numbers', () => {
			const { across, down } = findSlots(ALL_WHITE);
			const { acrossMembership, downMembership } = buildSlotMembership(ALL_WHITE, across, down);
			const board = buildBoard(ALL_WHITE, acrossMembership, downMembership);
			expect(board.length).toBe(5);
			expect(board[0].length).toBe(5);
			expect(board[0][0].letter).toBe('A');
			expect(board[0][0].isBlank).toBe(false);
			expect(board[0][0].acrossClue).toBe(1);
			expect(board[0][0].downClue).toBe(1);
		});

		it('marks blank corner cells with isBlank=true and letter "."', () => {
			const { across, down } = findSlots(TL_BR_BLACK);
			const { acrossMembership, downMembership } = buildSlotMembership(TL_BR_BLACK, across, down);
			const board = buildBoard(TL_BR_BLACK, acrossMembership, downMembership);
			expect(board[0][0].isBlank).toBe(true);
			expect(board[0][0].letter).toBe('.');
			expect(board[4][4].isBlank).toBe(true);
		});
	});
});
