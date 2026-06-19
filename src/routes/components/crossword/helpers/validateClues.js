/**
 * Validates enriched clues: required prop types and consistent cell answers.
 *
 * @param {import('./types').Clue[]} data - Enriched clues with a `cells` array
 * @returns {boolean} true when all clues pass validation
 */
export default function validateClues(data) {
	/** @type {{ prop: string; type: string }[]} */
	const props = [
		{
			prop: 'clue',
			type: 'string'
		},
		{
			prop: 'answer',
			type: 'string'
		},
		{
			prop: 'x',
			type: 'number'
		},
		{
			prop: 'y',
			type: 'number'
		}
	];

	// only store if they fail
	let failedProp = false;
	data.forEach(
		(d) =>
			!!props.map((p) => {
				const f = typeof d[p.prop] !== p.type;
				if (f) {
					failedProp = true;
					console.error(`"${p.prop}" is not a ${p.type}\n`, d);
				}
			})
	);

	let failedCell = false;
	/** @type {import('./types').Cell[]} */
	const cells = /** @type {import('./types').Cell[]} */ ([]).concat(...data.map((d) => d.cells));

	/** @type {Record<string, string>} */
	let dict = {};
	cells.forEach((d) => {
		if (!dict[d.id]) {
			dict[d.id] = d.answer;
		} else {
			if (dict[d.id] !== d.answer) {
				failedCell = true;
				console.error(`cell "${d.id}" has two different values\n`, `${dict[d.id]} and ${d.answer}`);
			}
		}
	});

	return !failedProp && !failedCell;
}
