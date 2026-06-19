/**
 * Creates cell objects for each letter in a clue's answer,
 * computing position, numbering, and metadata for each cell.
 *
 * @template {{ answer: string; direction: import('./types').Direction; x: number; y: number; number: number; custom?: string }} T
 * @param {T[]} clues - Array of clue objects with answer, direction, x, y, number, and optional custom
 * @returns {(T & { cells: import('./types').Cell[] })[]} Clue objects augmented with a `cells` array
 */
export default function buildCluesCells(clues) {
	return clues.map((d) => {
		const chars = d.answer.split('');
		const cells = chars.map((answer, i) => {
			const x = d.x + (d.direction === 'across' ? i : 0);
			const y = d.y + (d.direction === 'down' ? i : 0);
			/** @type {number | string} */
			const number = i === 0 ? d.number : '';
			/** @type {import('./types').ClueNumbers} */
			const clueNumbers = { [d.direction]: d.number };
			const id = `${x}-${y}`;
			const value = '';
			const custom = d.custom || '';
			const cell = {
				id,
				number,
				clueNumbers,
				x,
				y,
				value,
				answer: answer.toUpperCase(),
				custom
			};
			return /** @type {import('./types').Cell} */ (/** @type {unknown} */ (cell));
		});
		return {
			...d,
			cells
		};
	});
}
