import { describe, it, expect } from 'vitest';
import getSecondarilyFocusedCells from './getSecondarilyFocusedCells.js';

const cells = [
	{ x: 0, y: 0, index: 0 },
	{ x: 1, y: 0, index: 1 },
	{ x: 2, y: 0, index: 2 },
	{ x: 3, y: 0, index: 3 },
	{ x: 0, y: 1, index: 4 },
	{ x: 0, y: 2, index: 5 },
	{ x: 0, y: 3, index: 6 }
];

describe('getSecondarilyFocusedCells', () => {
	it('highlights cells in the same row for across direction', () => {
		const result = getSecondarilyFocusedCells({
			cells,
			focusedDirection: 'across',
			focusedCell: { x: 1, y: 0 }
		});
		expect(result).toContain(0);
		expect(result).toContain(1);
		expect(result).toContain(2);
		expect(result).toContain(3);
	});

	it('highlights cells in the same column for down direction', () => {
		const result = getSecondarilyFocusedCells({
			cells,
			focusedDirection: 'down',
			focusedCell: { x: 0, y: 1 }
		});
		expect(result).toContain(0);
		expect(result).toContain(4);
		expect(result).toContain(5);
		expect(result).toContain(6);
	});

	it('does not include cells from other rows in across mode', () => {
		const result = getSecondarilyFocusedCells({
			cells,
			focusedDirection: 'across',
			focusedCell: { x: 0, y: 0 }
		});
		expect(result).not.toContain(4);
		expect(result).not.toContain(5);
	});

	it('stops at gaps in cells', () => {
		const gappedCells = [
			{ x: 0, y: 0, index: 0 },
			{ x: 1, y: 0, index: 1 },
			// gap at x=2
			{ x: 3, y: 0, index: 2 },
			{ x: 4, y: 0, index: 3 }
		];
		const result = getSecondarilyFocusedCells({
			cells: gappedCells,
			focusedDirection: 'across',
			focusedCell: { x: 0, y: 0 }
		});
		expect(result).toContain(0);
		expect(result).toContain(1);
		expect(result).not.toContain(2);
		expect(result).not.toContain(3);
	});
});
