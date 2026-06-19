const keys = (rows, page) =>
	rows.flatMap((values, row) =>
		values.map((value) => (page !== undefined ? { row, value, page } : { row, value }))
	);

export default [
	...keys([
		['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
		['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
		['Shift', 'w', 'x', 'c', 'v', 'b', 'n', 'Backspace'],
		['Page1', ',', 'Space', '.', 'Enter']
	]),
	...keys(
		[
			['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
			['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
			['-', '_', '=', '+', ';', ':', "'", '"', '<', '>'],
			['Page0', '/', '?', '[', ']', '{', '}', '|', '\\', '~']
		],
		1
	)
];
