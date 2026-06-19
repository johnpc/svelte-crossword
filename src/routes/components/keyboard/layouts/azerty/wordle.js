/**
 * @param {string[][]} rows
 * @returns {import('../../keyboardLogic.js').KeyDef[]}
 */
const keys = (rows) => rows.flatMap((values, row) => values.map((value) => ({ row, value })));

export default keys([
	['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
	['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
	['Enter', 'w', 'x', 'c', 'v', 'b', 'n', 'Backspace']
]);
