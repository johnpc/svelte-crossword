import type { DatabaseSync } from 'node:sqlite';

/** Fixtures mirroring real rows: a valid AI puzzle, a double-encoded legacy puzzle, a corrupt one. */
export const aiPuzzle = {
	header: { title: 'Themed', author: 'xwords robot' },
	puzzle: { solution: 'PODXXEROSXREUPSXOSAYXXETD', state: '' },
	clues: {
		across: { '1': { clue: 'Pea holder', answer: 'POD' } },
		down: { '2': { clue: 'x', answer: 'PE' } }
	}
};
export const legacyPuzzle = {
	header: { title: null, numberOfClues: 10 },
	puzzle: { solution: 'POD..EROS.REUPS.OSAY..ETD', state: '' },
	details: { clues: new Array(10).fill({}) },
	clues: { across: { '1': {} }, down: { '2': {} } }
};
export const blackMini = {
	header: { title: 'Black Mini', numberOfClues: 0 },
	puzzle: { solution: '.........................', state: '' },
	clues: { across: {}, down: {} },
	details: { clues: [] }
};

export const PROFILE = { id: 'user-1', user_id: 'user-1', name: 'Ada', email: 'ada@example.com' };
export const OTHER_PROFILE = {
	id: 'user-2',
	user_id: 'user-2',
	name: 'Bob',
	email: 'bob@example.com'
};

export function seedFixtures(db: DatabaseSync) {
	const profile = db.prepare(
		'INSERT INTO profiles (id, user_id, name, email, created_at) VALUES (?, ?, ?, ?, ?)'
	);
	profile.run(PROFILE.id, PROFILE.user_id, PROFILE.name, PROFILE.email, '2026-01-01T00:00:00.000Z');
	profile.run(
		OTHER_PROFILE.id,
		OTHER_PROFILE.user_id,
		OTHER_PROFILE.name,
		OTHER_PROFILE.email,
		'2026-01-02T00:00:00.000Z'
	);

	const puzzle = db.prepare(
		'INSERT INTO puzzles (id, puz_json, puz_key, title, author, created_at) VALUES (?, ?, ?, ?, ?, ?)'
	);
	puzzle.run(
		'legacy-1',
		JSON.stringify(JSON.stringify(legacyPuzzle)),
		'legacy-1',
		null,
		null,
		'2026-01-01T00:00:00.000Z'
	);
	puzzle.run(
		'ai-1',
		JSON.stringify(aiPuzzle),
		'ai-1',
		'Themed',
		'xwords robot',
		'2026-02-01T00:00:00.000Z'
	);
	puzzle.run(
		'black-1',
		JSON.stringify(blackMini),
		'black-1',
		'Black Mini',
		null,
		'2026-03-01T00:00:00.000Z'
	);
	puzzle.run(
		'ai-2',
		JSON.stringify(aiPuzzle),
		'ai-2',
		'Themed',
		'xwords robot',
		'2026-02-15T00:00:00.000Z'
	);

	const played = db.prepare(
		`INSERT INTO user_puzzles (id, profile_id, puzzle_id, used_check, used_reveal, used_clear, time_in_seconds, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
	);
	played.run('up-1', PROFILE.id, 'ai-2', 1, 0, 0, 95, '2026-02-16T10:00:00.000Z');
	played.run('up-2', PROFILE.id, 'legacy-1', 0, 1, 0, 200, '2026-02-17T10:00:00.000Z');
}
