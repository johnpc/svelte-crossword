/**
 * Creates cell objects for each letter in a clue's answer,
 * computing position, numbering, and metadata for each cell.
 *
 * @param {Array} clues - Array of clue objects with answer, direction, x, y, number, and optional custom
 * @returns {Array} Clue objects augmented with a `cells` array
 */
export default function buildCluesCells(clues) {
	return clues.map((d) => {
		const chars = d.answer.split('');
		const cells = chars.map((answer, i) => {
			const x = d.x + (d.direction === 'across' ? i : 0);
			const y = d.y + (d.direction === 'down' ? i : 0);
			const number = i === 0 ? d.number : '';
			const clueNumbers = { [d.direction]: d.number };
			const id = `${x}-${y}`;
			const value = '';
			const custom = d.custom || '';
			return {
				id,
				number,
				clueNumbers,
				x,
				y,
				value,
				answer: answer.toUpperCase(),
				custom
			};
		});
		return {
			...d,
			cells
		};
	});
}
