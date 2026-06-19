const keys = (rows) =>
	rows.flatMap((values, row) =>
		values.map((v) => ({ row, value: v.length === 1 ? v.toUpperCase() : v }))
	);

export default keys([
	['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
	['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
	['z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace']
]);
