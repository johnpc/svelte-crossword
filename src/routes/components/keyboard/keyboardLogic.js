export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

export const SWAPS = {
	Page0: 'abc',
	Page1: '?123',
	Space: ' ',
	Shift: 'abc'
};

export const unique = (arr) => [...new Set(arr)];

/**
 * Process a key press and determine the result.
 * Returns { type: 'page', page } | { type: 'shift', shifted } | { type: 'key', output }
 */
export const processKeyStart = (value, shifted) => {
	if (value.includes('Page')) {
		return { type: 'page', page: +value.substr(-1) };
	} else if (value === 'Shift') {
		return { type: 'shift', shifted: !shifted };
	} else {
		let output = value;
		if (shifted && ALPHABET.includes(value)) output = value.toUpperCase();
		return { type: 'key', output };
	}
};

/**
 * Transform raw layout data into display-ready format.
 */
export const transformKeyData = (rawData, swaps, noSwap, shifted) => {
	return rawData.map((d) => {
		let display = d.display;
		const s = swaps[d.value];
		const shouldSwap = s && !noSwap.includes(d.value) && !d.noSwap;
		if (shouldSwap) display = s;
		if (!display) display = shifted ? d.value.toUpperCase() : d.value;
		if (d.value === 'Shift') display = shifted ? s : s.toUpperCase();
		return { ...d, display };
	});
};

/**
 * Split transformed data into pages and rows.
 * Returns an array of two pages, each containing arrays of row data.
 */
export const getRowData = (data) => {
	const page0 = data.filter((d) => !d.page);
	const page1 = data.filter((d) => d.page);

	const rows0 = unique(page0.map((d) => d.row)).sort((a, b) => a - b);
	const rows1 = unique(page1.map((d) => d.row)).sort((a, b) => a - b);

	const rowData0 = rows0.map((r) => page0.filter((k) => k.row === r));
	const rowData1 = rows1.map((r) => page1.filter((k) => k.row === r));

	return [rowData0, rowData1];
};
