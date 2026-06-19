import { describe, it, expect } from 'vitest';
import getCellAfterDiff from './getCellAfterDiff.js';

const cells = [
	{ x: 0, y: 0, index: 0 },
	{ x: 1, y: 0, index: 1 },
	{ x: 2, y: 0, index: 2 },
	{ x: 3, y: 0, index: 3 },
	{ x: 0, y: 1, index: 4 },
	{ x: 0, y: 2, index: 5 }
];

describe('getCellAfterDiff', () => {
	it('returns the next cell in across direction with positive diff', () => {
		const result = getCellAfterDiff({
			diff: 1,
			cells,
			direction: 'across',
			focusedCell: { x: 0, y: 0 }
		});
		expect(result.x).toBe(1);
		expect(result.y).toBe(0);
	});

	it('returns the cell 2 positions ahead in across direction', () => {
		const result = getCellAfterDiff({
			diff: 2,
			cells,
			direction: 'across',
			focusedCell: { x: 0, y: 0 }
		});
		expect(result.x).toBe(2);
		expect(result.y).toBe(0);
	});

	it('returns the previous cell in across direction with negative diff', () => {
		const result = getCellAfterDiff({
			diff: -1,
			cells,
			direction: 'across',
			focusedCell: { x: 2, y: 0 }
		});
		expect(result.x).toBe(1);
		expect(result.y).toBe(0);
	});

	it('returns the next cell in down direction with positive diff', () => {
		const result = getCellAfterDiff({
			diff: 1,
			cells,
			direction: 'down',
			focusedCell: { x: 0, y: 0 }
		});
		expect(result.x).toBe(0);
		expect(result.y).toBe(1);
	});

	it('returns undefined when no cell exists at that diff', () => {
		const result = getCellAfterDiff({
			diff: 5,
			cells,
			direction: 'across',
			focusedCell: { x: 0, y: 0 }
		});
		expect(result).toBeUndefined();
	});

	it('only considers cells in the same row for across', () => {
		const result = getCellAfterDiff({
			diff: 1,
			cells,
			direction: 'across',
			focusedCell: { x: 0, y: 1 }
		});
		expect(result).toBeUndefined();
	});

	it('only considers cells in the same column for down', () => {
		const result = getCellAfterDiff({
			diff: 1,
			cells,
			direction: 'down',
			focusedCell: { x: 1, y: 0 }
		});
		expect(result).toBeUndefined();
	});
});
