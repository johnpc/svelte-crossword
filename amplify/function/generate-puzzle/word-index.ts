export type WordIndex = Map<number, Map<string, string[]>>;

export function buildWordIndex(words: string[]): WordIndex {
	const index: WordIndex = new Map();
	for (let pos = 0; pos < 5; pos++) {
		const posMap = new Map<string, string[]>();
		for (const word of words) {
			const letter = word[pos];
			const list = posMap.get(letter) || [];
			list.push(word);
			posMap.set(letter, list);
		}
		index.set(pos, posMap);
	}
	return index;
}

/** Words at `pos` whose letter equals `letter`, or [] if none. */
function wordsAtPosition(index: WordIndex, pos: number, letter: string): string[] {
	return index.get(pos)?.get(letter) ?? [];
}

/** Filter `pool` down to entries that also appear in `next`. */
function intersect(pool: Set<string>, next: string[]): Set<string> {
	const filtered = new Set<string>();
	for (const w of next) {
		if (pool.has(w)) filtered.add(w);
	}
	return filtered;
}

/**
 * Words consistent with all positional constraints. `null` at a position
 * means "anything." Returns [] if any constrained position has zero matches
 * or if no positions are constrained (caller is expected to seed at least
 * one constraint).
 */
export function getCandidates(index: WordIndex, constraints: (string | null)[]): string[] {
	let candidates: Set<string> | null = null;
	for (let pos = 0; pos < 5; pos++) {
		const letter = constraints[pos];
		if (letter === null) continue;
		const wordsAtPos = wordsAtPosition(index, pos, letter);
		if (wordsAtPos.length === 0) return [];
		candidates = candidates === null ? new Set(wordsAtPos) : intersect(candidates, wordsAtPos);
	}
	return candidates ? Array.from(candidates) : [];
}
