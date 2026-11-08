// @vitest-environment node
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

const dir = mkdtempSync(join(tmpdir(), 'sql-queries-'));
process.env.DB_PATH = join(dir, 'crossword.sqlite');
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe('sql-queries handler', () => {
	it('opens the DB at DB_PATH and serves the invoke contract', async () => {
		const { handler } = await import('./handler');
		const res = await handler({ query: 'leaderboard' }, {} as never, () => {});
		expect(res).toEqual({ statusCode: 200, body: JSON.stringify({ users: [], total: 0 }) });
		const bad = await handler({ query: 'nope' }, {} as never, () => {});
		expect(bad).toEqual({ statusCode: 400, body: 'Unknown query' });
	});
});
