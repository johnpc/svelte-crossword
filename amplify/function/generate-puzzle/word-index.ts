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

export function getCandidates(index: WordIndex, constraints: (string | null)[]): string[] {
	let candidates: Set<string> | null = null;

	for (let pos = 0; pos < 5; pos++) {
		const letter = constraints[pos];
		if (letter === null) continue;

		const posMap = index.get(pos);
		if (!posMap) return [];

		const wordsAtPos = posMap.get(letter);
		if (!wordsAtPos || wordsAtPos.length === 0) return [];

		if (candidates === null) {
			candidates = new Set(wordsAtPos);
		} else {
			const filtered = new Set<string>();
			for (const w of wordsAtPos) {
				if (candidates.has(w)) filtered.add(w);
			}
			candidates = filtered;
		}
	}

	return candidates ? Array.from(candidates) : [];
}
