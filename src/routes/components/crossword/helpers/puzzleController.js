import { processCellUpdate, classifyKey, processKeyboardEvent } from './puzzleCellUpdate.js';
import {
	resolveFocusCellDiff,
	resolveFocusClueDiff,
	resolveFocusCell,
	resolveHistoricalChange,
	resolveMoveFocus,
	resolveFlipDirection
} from './puzzleStateResolvers.js';

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

function handleKeydown(state, detail) {
	const { value, diff, doReplaceFilledCells } = processKeyboardEvent(detail);
	return handleCellUpdate(state, state.focusedCellIndex, value, diff, doReplaceFilledCells);
}

function handleNativeKeydown(state, action) {
	const a = classifyKey(action.key, action.ctrlKey, action.altKey);
	if (!a) return null;
	const value = a.type === 'delete' ? '' : a.value;
	const diff = a.type === 'delete' ? -1 : 1;
	return handleCellUpdate(state, state.focusedCellIndex, value, diff, a.type === 'delete');
}

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

export function dispatch(state, action) {
	const handler = HANDLERS[action.type];
	return handler ? handler(state, action) : {};
}
