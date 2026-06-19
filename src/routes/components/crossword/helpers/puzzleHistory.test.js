import { describe, it, expect } from 'vitest';
import { applyHistoricalChange } from './puzzleHistory.js';

describe('applyHistoricalChange', () => {
	const newestCells = [{ value: 'C' }];
	const middleCells = [{ value: 'B' }];
	const oldestCells = [{ value: 'A' }];
	const cellsHistory = [newestCells, middleCells, oldestCells];

	it('undoes one step (diff = -1 adds +1 to index)', () => {
		const result = applyHistoricalChange({
			diff: -1,
			cells: newestCells,
			cellsHistory,
			cellsHistoryIndex: 0,
			focusedCellIndex: 2,
			focusedCellIndexHistory: [2, 1, 0],
			focusedCellIndexHistoryIndex: 0
		});
		expect(result.cells).toEqual(middleCells);
		expect(result.cellsHistoryIndex).toBe(1);
	});

	it('redoes one step (diff = 1 subtracts 1 from index)', () => {
		const result = applyHistoricalChange({
			diff: 1,
			cells: middleCells,
			cellsHistory,
			cellsHistoryIndex: 1,
			focusedCellIndex: 1,
			focusedCellIndexHistory: [2, 1, 0],
			focusedCellIndexHistoryIndex: 1
		});
		expect(result.cells).toEqual(newestCells);
		expect(result.cellsHistoryIndex).toBe(0);
	});

	it('returns current cells when history index is out of bounds', () => {
		const result = applyHistoricalChange({
			diff: -1,
			cells: newestCells,
			cellsHistory: [],
			cellsHistoryIndex: 0,
			focusedCellIndex: 0,
			focusedCellIndexHistory: [],
			focusedCellIndexHistoryIndex: 0
		});
		expect(result.cells).toEqual(newestCells);
	});

	it('returns current focusedCellIndex when history is empty', () => {
		const result = applyHistoricalChange({
			diff: -1,
			cells: newestCells,
			cellsHistory: [],
			cellsHistoryIndex: 0,
			focusedCellIndex: 5,
			focusedCellIndexHistory: [],
			focusedCellIndexHistoryIndex: 0
		});
		expect(result.focusedCellIndex).toBe(5);
	});
});
