import { processCellUpdate, classifyKey, processKeyboardEvent } from './puzzleCellUpdate.js';
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
		doReplaceFilledCells: doReplace
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
 * @param {import('./types').PuzzleState} state
 * @param {string} detail
 * @returns {import('./types').StatePatch}
 */
function handleKeydown(state, detail) {
	const { value, diff, doReplaceFilledCells } = processKeyboardEvent(detail);
	return handleCellUpdate(state, state.focusedCellIndex, value, diff, doReplaceFilledCells);
}

/**
 * @param {import('./types').PuzzleState} state
 * @param {{ key: string, ctrlKey?: boolean, altKey?: boolean }} action
 * @returns {import('./types').StatePatch | null}
 */
function handleNativeKeydown(state, action) {
	const a = classifyKey(action.key, action.ctrlKey, action.altKey);
	if (!a) return null;
	const value = a.type === 'delete' ? '' : a.value;
	const diff = a.type === 'delete' ? -1 : 1;
	return handleCellUpdate(state, state.focusedCellIndex, value, diff, a.type === 'delete');
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
