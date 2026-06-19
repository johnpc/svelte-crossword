const keys = (rows, page) =>
	rows.flatMap((values, row) =>
		values.map((v) => {
			const value = v.length === 1 ? v.toUpperCase() : v;
			return page !== undefined ? { row, value, page } : { row, value };
		})
	);

export default [
	...keys([
		['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
		['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
		['z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
		['Page1']
	]),
	...keys(
		[
			['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
			['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
			['-', '_', '=', '+', ';', ':', "'", '"', 'Backspace'],
			['Page0']
		],
		1
	)
];
