import { describe, it, expect, vi, beforeEach } from 'vitest';

// The handler module constructs a real LambdaClient at import time. Replace
// it with a no-op so importing handler.ts doesn't reach into AWS.
vi.mock('@aws-sdk/client-lambda', () => ({
	LambdaClient: class {
		send() {
			return Promise.resolve({});
		}
	},
	InvokeCommand: class {
		input: unknown;
		constructor(input: unknown) {
			this.input = input;
		}
	}
}));

// Mock the SQL invoker so the default deps wired at module load don't reach AWS.
vi.mock('./sql-invoker', () => ({
	createSqlInvoker: vi.fn().mockReturnValue(vi.fn().mockResolvedValue('null'))
}));

// Mock the Bedrock-fronted clue generator at module load.
vi.mock('./clue-generator', () => ({
	generateClues: vi.fn().mockResolvedValue({ title: 'D', theme: '', across: {}, down: {} })
}));

import { handler, runHandler, HandlerDeps } from './handler';
import type { GeneratedClues } from './clue-generator';

vi.mock('./puzzle-builder', () => ({
	todayDateString: () => '2026-06-21',
	puzzleIdFor: (d: string) => `generated-${d}`,
	generateUniqueGrid: vi.fn(),
	buildPuzzleJson: vi.fn(() => ({
		header: { title: 'Themed', author: 'xwords robot' },
		puzzle: { solution: 's', state: '-' },
		clues: { across: {}, down: {} },
		board: []
	}))
}));

import { generateUniqueGrid } from './puzzle-builder';

const mockGrid = {
	across: ['A', 'B', 'C', 'D', 'E'],
	down: ['A', 'B', 'C', 'D', 'E'],
	solution: 'sol'
};

const mockClues: GeneratedClues = {
	title: 'Themed',
	theme: 't',
	across: {},
	down: {}
};

function makeDeps(overrides: Partial<HandlerDeps> = {}): HandlerDeps {
	return {
		invokeSql: vi.fn().mockResolvedValue('null'),
		generateClues: vi.fn().mockResolvedValue(mockClues),
		region: 'us-west-2',
		words: ['ANY'],
		...overrides
	};
}

describe('runHandler', () => {
	beforeEach(() => {
		vi.mocked(generateUniqueGrid).mockReturnValue(mockGrid);
	});

	it('skips if a puzzle for the date already exists', async () => {
		const deps = makeDeps({
			invokeSql: vi.fn().mockResolvedValueOnce(JSON.stringify({ id: 'exists' }))
		});
		const result = await runHandler({ date: '2026-06-21' }, deps);
		expect(result).toEqual({ skipped: true, puzzleId: 'generated-2026-06-21' });
	});

	it('returns dryRun output without writing to DB', async () => {
		const deps = makeDeps();
		const result = (await runHandler({ dryRun: true, date: '2026-06-21' }, deps)) as {
			dryRun: boolean;
			puzJson: unknown;
		};
		expect(result.dryRun).toBe(true);
		expect(result.puzJson).toBeDefined();
		expect(deps.invokeSql).not.toHaveBeenCalled();
	});

	it('writes the puzzle and returns success when not a dry run', async () => {
		const invokeSql = vi
			.fn()
			.mockResolvedValueOnce('null') // dedup check
			.mockResolvedValueOnce('null'); // create write
		const deps = makeDeps({ invokeSql });
		const result = await runHandler({ date: '2026-06-21' }, deps);
		expect(result).toEqual({
			success: true,
			puzzleId: 'generated-2026-06-21',
			title: 'Themed'
		});
		expect(invokeSql).toHaveBeenCalledTimes(2);
	});

	it('throws if no grid can be generated', async () => {
		vi.mocked(generateUniqueGrid).mockReturnValueOnce(null);
		const deps = makeDeps();
		await expect(runHandler({ dryRun: true }, deps)).rejects.toThrow(
			'Failed to generate a valid grid'
		);
	});

	it('falls back to today when no date is supplied', async () => {
		const deps = makeDeps();
		const result = (await runHandler({ dryRun: true }, deps)) as { puzzleId: string };
		expect(result.puzzleId).toBe('generated-2026-06-21');
	});

	it('exported handler routes through runHandler with default deps', async () => {
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		const result = (await handler({ dryRun: true })) as { dryRun?: boolean };
		expect(result.dryRun).toBe(true);
		consoleSpy.mockRestore();
	});

	it('passes forceBlackSquares through to generateUniqueGrid', async () => {
		const deps = makeDeps();
		await runHandler({ dryRun: true, forceBlackSquares: true }, deps);
		expect(vi.mocked(generateUniqueGrid)).toHaveBeenCalledWith(
			deps.words,
			expect.objectContaining({ requireBlackSquares: true })
		);
	});

	it('defaults requireBlackSquares to false when flag is omitted', async () => {
		const deps = makeDeps();
		await runHandler({ dryRun: true }, deps);
		expect(vi.mocked(generateUniqueGrid)).toHaveBeenCalledWith(
			deps.words,
			expect.objectContaining({ requireBlackSquares: false })
		);
	});
});
