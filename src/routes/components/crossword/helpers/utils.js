/**
 * Builds an object from an array of [key, value] pairs.
 * @template V
 * @param {[string | number, V][]} arr
 * @returns {Record<string, V>}
 */
function fromPairs(arr) {
	/** @type {Record<string, V>} */
	let res = {};
	arr.forEach((d) => {
		res[d[0]] = d[1];
	});
	return res;
}

export { fromPairs };
