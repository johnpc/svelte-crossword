// @vitest-environment node
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

const dir = mkdtempSync(join(tmpdir(), 'admin-sqlite-'));
process.env.DB_PATH = join(dir, 'crossword.sqlite');
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe('admin-sqlite handler', () => {
	it('opens the DB at DB_PATH and executes the payload', async () => {
		const { handler } = await import('./handler');
		const result = await handler(
			{ sql: 'SELECT COUNT(*) AS n FROM puzzles' },
			{} as never,
			() => {}
		);
		expect(result).toEqual({ rows: [{ n: 0 }] });
	});
});
