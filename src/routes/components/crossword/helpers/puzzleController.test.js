import { describe, it, expect } from 'vitest';
import { dispatch } from './puzzleController.js';

/** @returns {import('./types').Cell[]} */
const makeCells = () =>
	/** @type {any} */ ([
		{
			x: 0,
			y: 0,
			index: 0,
			value: '',
			answer: 'A',
			isFilled: false,
			clueNumbers: { across: 1, down: 1 }
		},
		{
			x: 1,
			y: 0,
			index: 1,
			value: '',
			answer: 'B',
			isFilled: false,
			clueNumbers: { across: 1 }
		},
		{
			x: 0,
			y: 1,
			index: 2,
			value: '',
			answer: 'C',
			isFilled: false,
			clueNumbers: { down: 1 }
		}
	]);

/** @returns {import('./types').PuzzleState} */
const makeState = () => {
	const cells = makeCells();
	return /** @type {any} */ ({
		cells,
		cellsHistory: [],
		cellsHistoryIndex: 0,
		focusedDirection: 'across',
		focusedCellIndex: 0,
		focusedCell: cells[0],
		focusedCellIndexHistory: [0],
		focusedCellIndexHistoryIndex: 0,
		sortedCellsInDirection: cells,
		clues: [
			{
				direction: 'across',
				number: 1,
				isFilled: false,
				cells: [{ index: 0 }, { index: 1 }]
			},
			{
				direction: 'down',
				number: 1,
				isFilled: false,
				cells: [{ index: 0 }, { index: 2 }]
			}
		],
		isPuzzleFocused: false,
		numberOfStatesInHistory: 10
	});
};

describe('dispatch', () => {
	it('handles cellUpdate action', () => {
		const r = dispatch(makeState(), {
			type: 'cellUpdate',
			index: 0,
			value: 'A',
			diff: 1,
			doReplace: false
		});
		expect(r).toBeDefined();
		expect(r?.cells).toBeDefined();
	});

	it('handles historicalChange action', () => {
		const state = {
			...makeState(),
			cellsHistory: [makeCells(), makeCells()],
			cellsHistoryIndex: 1
		};
		const r = dispatch(state, { type: 'historicalChange', diff: -1 });
		expect(r).toBeDefined();
	});

	it('handles focusCell action', () => {
		const r = dispatch(makeState(), { type: 'focusCell', index: 1 });
		expect(r).toBeDefined();
		expect(r?.focusedCellIndex).toBe(1);
	});

	it('handles focusClueDiff action', () => {
		const r = dispatch(makeState(), { type: 'focusClueDiff', diff: 1 });
		expect(r).toBeDefined();
	});

	it('handles moveFocus action', () => {
		const r = dispatch(makeState(), { type: 'moveFocus', direction: 'across', diff: 1 });
		expect(r).toBeDefined();
	});

	it('handles flipDirection action', () => {
		const r = dispatch(makeState(), { type: 'flipDirection' });
		expect(r).toBeDefined();
	});

	it('handles keydown action with letter', () => {
		const r = dispatch(makeState(), { type: 'keydown', detail: 'a' });
		expect(r).toBeDefined();
	});

	it('handles nativeKeydown for letter key', () => {
		const r = dispatch(makeState(), {
			type: 'nativeKeydown',
			key: 'a',
			ctrlKey: false,
			altKey: false
		});
		expect(r).toBeDefined();
	});

	it('returns null for nativeKeydown unknown key', () => {
		const r = dispatch(makeState(), {
			type: 'nativeKeydown',
			key: 'F1',
			ctrlKey: false,
			altKey: false
		});
		expect(r).toBeNull();
	});

	it('handles nativeKeydown for delete key', () => {
		const state = makeState();
		state.cells[0].value = 'X';
		const r = dispatch(state, {
			type: 'nativeKeydown',
			key: 'Backspace',
			ctrlKey: false,
			altKey: false
		});
		expect(r).toBeDefined();
	});

	it('returns empty object for unknown action type', () => {
		const r = dispatch(makeState(), { type: 'unknownActionType' });
		expect(r).toEqual({});
	});
});
