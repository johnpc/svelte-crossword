import {
	getNextCellInDirection,
	getNextClueCell,
	getMoveFocusResult,
	getFlippedDirection
} from './puzzleNavigation.js';
import { applyHistoricalChange } from './puzzleHistory.js';

export function resolveFocusCellDiff(state, diff, doReplace) {
	const i = getNextCellInDirection({
		sortedCellsInDirection: state.sortedCellsInDirection,
		focusedCellIndex: state.focusedCellIndex,
		diff,
		doReplaceFilledCells: doReplace
	});
	if (i != null) return resolveFocusCell(state, i, false, state.numberOfStatesInHistory);
	return null;
}

export function resolveFocusClueDiff(state, diff) {
	const r = getNextClueCell({
		clues: state.clues,
		cells: state.cells,
		focusedCell: state.focusedCell,
		focusedDirection: state.focusedDirection,
		sortedCellsInDirection: state.sortedCellsInDirection,
		diff
	});
	const patch = { focusedCellIndex: r.focusedCellIndex };
	if (r.focusedDirection !== state.focusedDirection) patch.focusedDirection = r.focusedDirection;
	return patch;
}

export function resolveFocusCell(state, index, isPuzzleFocused, numberOfStatesInHistory) {
	if (isPuzzleFocused && index == state.focusedCellIndex) {
		const d = getFlippedDirection({
			focusedDirection: state.focusedDirection,
			focusedCell: state.focusedCell
		});
		return { focusedDirection: d || state.focusedDirection, _focusHidden: true };
	}
	let focusedDirection = state.focusedDirection;
	if (!state.cells[index].clueNumbers[focusedDirection]) {
		focusedDirection = focusedDirection === 'across' ? 'down' : 'across';
	}
	return {
		focusedCellIndex: index,
		focusedDirection,
		focusedCellIndexHistory: [
			index,
			...state.focusedCellIndexHistory.slice(0, numberOfStatesInHistory)
		],
		focusedCellIndexHistoryIndex: 0,
		_focusHidden: true
	};
}

export function resolveHistoricalChange(state, diff) {
	return applyHistoricalChange({
		diff,
		cells: state.cells,
		cellsHistory: state.cellsHistory,
		cellsHistoryIndex: state.cellsHistoryIndex,
		focusedCellIndex: state.focusedCellIndex,
		focusedCellIndexHistory: state.focusedCellIndexHistory,
		focusedCellIndexHistoryIndex: state.focusedCellIndexHistoryIndex
	});
}

export function resolveMoveFocus(state, action) {
	const r = getMoveFocusResult({
		direction: action.direction,
		diff: action.diff,
		cells: state.cells,
		focusedDirection: state.focusedDirection,
		focusedCell: state.focusedCell
	});
	if (!r) return {};
	if (r.focusedDirection) return { focusedDirection: r.focusedDirection };
	return resolveFocusCell(state, r.focusedCellIndex, false, state.numberOfStatesInHistory);
}

export function resolveFlipDirection(state) {
	const d = getFlippedDirection({
		focusedDirection: state.focusedDirection,
		focusedCell: state.focusedCell
	});
	return d ? { focusedDirection: d, _focusHidden: true } : {};
}
