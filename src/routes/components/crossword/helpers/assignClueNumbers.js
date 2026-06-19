/**
 * Assigns sequential clue numbers to clue entries,
 * reusing the same number when multiple clues share the same start position.
 *
 * @param {Array} clues - Array of clue objects with an `id` property
 * @returns {Array} Clue objects augmented with a `number` property
 */
export default function assignClueNumbers(clues) {
	const lookup = {};
	let currentNumber = 1;

	return clues.map((d) => {
		let number;
		if (lookup[d.id]) {
			number = lookup[d.id];
		} else {
			number = currentNumber;
			lookup[d.id] = number;
			currentNumber += 1;
		}
		return {
			...d,
			number
		};
	});
}
