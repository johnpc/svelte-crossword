import getCellAfterDiff from './getCellAfterDiff.js';

export function getNextCellInDirection({
	sortedCellsInDirection,
	focusedCellIndex,
	diff,
	doReplaceFilledCells = true
}) {
	const filtered = sortedCellsInDirection.filter((d) => (doReplaceFilledCells ? true : !d.value));
	const currentIdx = filtered.findIndex((d) => d.index === focusedCellIndex);
	const nextCell = filtered[currentIdx + diff];
	return nextCell ? nextCell.index : null;
}

function findCandidateClues(clues, focusedDirection, currentNumber, allFilled, diff) {
	let candidates = clues.filter(
		(clue) =>
			(allFilled || !clue.isFilled) &&
			(diff > 0 ? clue.number > currentNumber : clue.number < currentNumber) &&
			clue.direction === focusedDirection
	);
	if (diff < 0) candidates = candidates.reverse();
	return candidates;
}

function resolveNextClue(candidates, diff, clues, focusedDirection) {
	const nextClue = candidates[Math.abs(diff) - 1];
	if (nextClue) return { clue: nextClue, direction: focusedDirection };
	const newDirection = focusedDirection === 'across' ? 'down' : 'across';
	return { clue: clues.filter((c) => c.direction === newDirection)[0], direction: newDirection };
}

function findCellForClue(sortedCells, clueNumber, focusedDirection, allFilled) {
	return (
		sortedCells.find(
			(cell) => (allFilled || !cell.value) && cell.clueNumbers[focusedDirection] === clueNumber
		) ||
		sortedCells.find((cell) => cell.clueNumbers[focusedDirection] === clueNumber) ||
		{}
	);
}

export function getNextClueCell({
	clues,
	focusedCell,
	focusedDirection,
	sortedCellsInDirection,
	diff = 1
}) {
	const currentNumber = focusedCell.clueNumbers[focusedDirection];
	const allFilled = clues.filter((c) => c.direction === focusedDirection).every((c) => c.isFilled);
	const candidates = findCandidateClues(clues, focusedDirection, currentNumber, allFilled, diff);
	const { clue: nextClue, direction: newDirection } = resolveNextClue(
		candidates,
		diff,
		clues,
		focusedDirection
	);
	const nextCell = findCellForClue(
		sortedCellsInDirection,
		nextClue.number,
		focusedDirection,
		allFilled
	);
	return { focusedCellIndex: nextCell.index || 0, focusedDirection: newDirection };
}

export function getMoveFocusResult({ direction, diff, cells, focusedDirection, focusedCell }) {
	if (focusedDirection !== direction) return { focusedDirection: direction };
	const nextCell = getCellAfterDiff({ diff, cells, direction, focusedCell });
	if (!nextCell) return null;
	return { focusedCellIndex: nextCell.index };
}

export function getFlippedDirection({ focusedDirection, focusedCell }) {
	const newDirection = focusedDirection === 'across' ? 'down' : 'across';
	return focusedCell.clueNumbers[newDirection] ? newDirection : null;
}
