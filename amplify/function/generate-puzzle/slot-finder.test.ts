import { describe, it, expect } from 'vitest';
import { isWhite, startsAcross, startsDown, readSlotAnswer, findSlots } from './slot-finder';

const ALL_WHITE = ['ABCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXY'];
const TL_BR_BLACK = [' BCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWX '];

describe('slot-finder', () => {
	describe('isWhite', () => {
		it('returns false for out-of-bounds cells', () => {
			expect(isWhite(ALL_WHITE, -1, 0)).toBe(false);
			expect(isWhite(ALL_WHITE, 0, 5)).toBe(false);
			expect(isWhite(ALL_WHITE, 5, 0)).toBe(false);
		});

		it('returns false for black-square cells', () => {
			expect(isWhite(TL_BR_BLACK, 0, 0)).toBe(false);
			expect(isWhite(TL_BR_BLACK, 4, 4)).toBe(false);
		});

		it('returns true for letters', () => {
			expect(isWhite(ALL_WHITE, 0, 0)).toBe(true);
		});
	});

	describe('startsAcross / startsDown', () => {
		it('starts across when left is off-grid and right is white', () => {
			expect(startsAcross(ALL_WHITE, 0, 0)).toBe(true);
		});
		it('starts down when top is off-grid and bottom is white', () => {
			expect(startsDown(ALL_WHITE, 0, 0)).toBe(true);
		});
		it('does not start across when left neighbor is white', () => {
			expect(startsAcross(ALL_WHITE, 0, 1)).toBe(false);
		});
		it('does not start when at a black cell', () => {
			expect(startsAcross(TL_BR_BLACK, 0, 0)).toBe(false);
			expect(startsDown(TL_BR_BLACK, 0, 0)).toBe(false);
		});
	});

	describe('readSlotAnswer', () => {
		it('walks right across a row until a black cell', () => {
			expect(readSlotAnswer(TL_BR_BLACK, 0, 1, 'across')).toBe('BCDE');
		});
		it('walks down a column until end of grid', () => {
			expect(readSlotAnswer(ALL_WHITE, 0, 0, 'down')).toBe('AFKPU');
		});
	});

	describe('findSlots', () => {
		it('produces 5 across and 5 down slots for an all-white 5x5', () => {
			const { across, down } = findSlots(ALL_WHITE);
			expect(across.length).toBe(5);
			expect(down.length).toBe(5);
		});

		it('numbers slots in reading order, deduping when one cell starts both', () => {
			const { across, down } = findSlots(ALL_WHITE);
			expect(across.map((a) => a.num)).toEqual([1, 6, 7, 8, 9]);
			expect(down.map((d) => d.num)).toEqual([1, 2, 3, 4, 5]);
		});

		it('skips corner-black cells when assigning numbers', () => {
			const { across, down } = findSlots(TL_BR_BLACK);
			// Corner blacks remove one across (the slot the corner would have started)
			// and one down on each side.
			expect(across.every((a) => !(a.r === 0 && a.c === 0))).toBe(true);
			expect(across.every((a) => a.answer.length >= 4)).toBe(true);
			expect(down.every((d) => d.answer.length >= 4)).toBe(true);
		});

		it('extracts the right answer string for each slot', () => {
			const { across } = findSlots(ALL_WHITE);
			expect(across[0].answer).toBe('ABCDE');
			expect(across[1].answer).toBe('FGHIJ');
		});
	});
});
