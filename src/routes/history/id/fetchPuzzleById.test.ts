import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInvoke = vi.fn();
vi.mock('../../helpers/sql/invokeSqlQuery', () => ({
	invokeSqlQuery: (...args: unknown[]) => mockInvoke(...args)
}));

import { fetchPuzzleById } from './fetchPuzzleById';

describe('fetchPuzzleById', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('fetches the user puzzle then its puzzle and flattens clues', async () => {
		const userPuzzle = {
			time_in_seconds: 30,
			used_check: 0,
			used_clear: 0,
			used_reveal: 0,
			puzzle_id: 'puz-1'
		};
		const puzJson = {
			clues: {
				across: { 1: { answer: 'CAT', clue: 'Feline' } },
				down: { 2: { answer: 'COP', clue: 'Officer' } }
			}
		};
		mockInvoke
			.mockResolvedValueOnce(userPuzzle)
			.mockResolvedValueOnce({ puz_json: JSON.stringify(puzJson) });

		const result = await fetchPuzzleById('up-1');

		expect(mockInvoke).toHaveBeenNthCalledWith(1, {
			query: 'getUserPuzzle',
			userPuzzleId: 'up-1'
		});
		expect(mockInvoke).toHaveBeenNthCalledWith(2, { query: 'getPuzzle', puzzleId: 'puz-1' });
		expect(result.userPuzzle).toEqual(userPuzzle);
		expect(result.clues).toHaveLength(2);
		expect(result.clues[0].answer).toBe('CAT');
		expect(result.clues[1].answer).toBe('COP');
	});
});
