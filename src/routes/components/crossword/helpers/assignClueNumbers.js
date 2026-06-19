/**
 * Assigns sequential clue numbers to clue entries,
 * reusing the same number when multiple clues share the same start position.
 *
 * @template {{ id: string }} T
 * @param {T[]} clues - Array of clue objects with an `id` property
 * @returns {(T & { number: number })[]} Clue objects augmented with a `number` property
 */
export default function assignClueNumbers(clues) {
	/** @type {Record<string, number>} */
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
