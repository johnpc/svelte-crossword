/**
 * Guards against serving corrupt puzzles (e.g. all-black grids with no clues,
 * such as the "Black Mini" rows that slipped in from the crosshare seed feed).
 *
 * Puzzle JSON reaches us in two historical shapes, and `puz_json` may be
 * double-encoded (a JSON string holding JSON), so we fully decode first:
 *   - AI/generated shape: { clues: { across: {...}, down: {...} }, ... }
 *   - legacy seed shape:   { details: { clues: [...] }, header: {...}, ... }
 */

/** Parse repeatedly until we reach a non-string value (handles double-encoding). */
export function fullyDecode(raw: unknown): unknown {
	let value = raw;
	for (let i = 0; i < 4 && typeof value === 'string'; i++) {
		try {
			value = JSON.parse(value);
		} catch {
			return null;
		}
	}
	return value;
}

/** Number of own keys in an object, or 0 for anything that isn't one. */
function keyCount(value: unknown): number {
	return value && typeof value === 'object' ? Object.keys(value).length : 0;
}

/** Clues in the AI shape: { clues: { across: {...}, down: {...} } }. */
function countMapClues(clues: unknown): number {
	if (!clues || Array.isArray(clues) || typeof clues !== 'object') return 0;
	const { across, down } = clues as Record<string, unknown>;
	return keyCount(across) + keyCount(down);
}

/** Count clues across both known puzzle shapes. */
export function countClues(pj: any): number {
	if (!pj || typeof pj !== 'object') return 0;
	const mapClues = Array.isArray(pj.clues) ? pj.clues.length : countMapClues(pj.clues);
	const detailClues = Array.isArray(pj.details?.clues) ? pj.details.clues.length : 0;
	return Math.max(mapClues, detailClues);
}

/**
 * A puzzle is playable when it decodes, has at least one clue, and its solution
 * grid contains real letters (not an all-black `.`/`-` grid).
 */
export function isValidPuzzle(rawPuzJson: unknown): boolean {
	const pj: any = fullyDecode(rawPuzJson);
	if (!pj || typeof pj !== 'object') return false;
	if (countClues(pj) === 0) return false;
	const solution: string = pj.puzzle?.solution ?? '';
	if (solution.length > 0 && /^[.\-\s]+$/.test(solution)) return false;
	return true;
}
