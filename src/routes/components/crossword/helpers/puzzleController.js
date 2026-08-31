import { processCellUpdate, classifyKey } from './puzzleCellUpdate.js';
import { getNextCellInDirection, isLockedCell } from './puzzleNavigation.js';
import {
	resolveFocusCellDiff,
	resolveFocusClueDiff,
	resolveFocusCell,
	resolveHistoricalChange,
	resolveMoveFocus,
	resolveFlipDirection
} from './puzzleStateResolvers.js';

/**
 * @param {import('./types').PuzzleState} state
 * @param {number} index
 * @param {string} value
 * @param {number} diff
 * @param {boolean} doReplace
 * @returns {import('./types').StatePatch}
 */
function handleCellUpdate(state, index, value, diff, doReplace) {
	const r = processCellUpdate({
		cells: state.cells,
		cellsHistory: state.cellsHistory,
		cellsHistoryIndex: state.cellsHistoryIndex,
		focusedDirection: state.focusedDirection,
		focusedCellIndex: state.focusedCellIndex,
		index,
		newValue: value,
		diff,
		doReplaceFilledCells: doReplace,
		isChecking: state.isChecking
	});
	const patch = {
		cells: r.cells,
		cellsHistory: r.cellsHistory,
		cellsHistoryIndex: r.cellsHistoryIndex
	};
	const updated = { ...state, ...patch };
	const nav = r.navigationAction;
	const navPatch =
		nav.type === 'clueDiff'
			? resolveFocusClueDiff(updated, nav.diff)
			: resolveFocusCellDiff(updated, nav.diff, nav.doReplace);
	return { ...patch, ...(navPatch || {}) };
}

/**
 * NYT backspace semantics: clear the focused square in place if it holds an
 * (unlocked) letter; otherwise step back one square and clear that one.
 * @param {import('./types').PuzzleState} state
 * @returns {import('./types').StatePatch}
 */
function handleDelete(state) {
	const current = state.cells[state.focusedCellIndex];
	if (current.value && !isLockedCell(current, state.isChecking)) {
		return handleCellUpdate(state, state.focusedCellIndex, '', 0, true);
	}
	const prev = getNextCellInDirection({
		sortedCellsInDirection: state.sortedCellsInDirection,
		focusedCellIndex: state.focusedCellIndex,
		diff: -1,
		doReplaceFilledCells: true,
		isChecking: state.isChecking
	});
	if (prev == null) return {};
	const moved = { ...state, focusedCellIndex: prev, focusedCell: state.cells[prev] };
	return handleCellUpdate(moved, prev, '', 0, true);
}

/**
 * @param {import('./types').PuzzleState} state
 * @param {string} detail
 * @returns {import('./types').StatePatch}
 */
function handleKeydown(state, detail) {
	if (detail === 'Backspace') return handleDelete(state);
	return handleCellUpdate(state, state.focusedCellIndex, detail, 1, false);
}

/**
 * @param {import('./types').PuzzleState} state
 * @param {{ key: string, ctrlKey?: boolean, altKey?: boolean }} action
 * @returns {import('./types').StatePatch | null}
 */
function handleNativeKeydown(state, action) {
	const a = classifyKey(action.key, action.ctrlKey, action.altKey);
	if (!a) return null;
	if (a.type === 'delete') return handleDelete(state);
	return handleCellUpdate(state, state.focusedCellIndex, a.value, 1, false);
}

/**
 * A dispatched action. `type` selects the handler; remaining fields are
 * read by the individual handlers and vary by action type.
 * @typedef {{ type: string } & Record<string, any>} PuzzleAction
 */

/** @type {Record<string, (s: import('./types').PuzzleState, a: any) => import('./types').StatePatch | null>} */
const HANDLERS = {
	cellUpdate: (s, a) => handleCellUpdate(s, a.index, a.value, a.diff, a.doReplace),
	historicalChange: (s, a) => resolveHistoricalChange(s, a.diff),
	focusCell: (s, a) => resolveFocusCell(s, a.index, s.isPuzzleFocused, s.numberOfStatesInHistory),
	focusClueDiff: (s, a) => resolveFocusClueDiff(s, a.diff),
	moveFocus: (s, a) => resolveMoveFocus(s, a),
	flipDirection: (s) => resolveFlipDirection(s),
	keydown: (s, a) => handleKeydown(s, a.detail),
	nativeKeydown: (s, a) => handleNativeKeydown(s, a)
};

/**
 * @param {import('./types').PuzzleState} state
 * @param {PuzzleAction} action
 * @returns {import('./types').StatePatch | null}
 */
export function dispatch(state, action) {
	const handler = HANDLERS[action.type];
	return handler ? handler(state, action) : {};
}
