// @vitest-environment node
import { existsSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestDatabase } from '../db/test-db';
import { backupDatabase, backupKeyFor, type S3Putter } from './backup';

let t: ReturnType<typeof createTestDatabase>;
beforeEach(() => {
	t = createTestDatabase();
	t.db.exec("INSERT INTO puzzles (id, puz_json) VALUES ('a','{}'), ('b','{}')");
});
afterEach(() => t.cleanup());

describe('backupKeyFor', () => {
	it('names the object by UTC date', () => {
		expect(backupKeyFor(new Date('2026-11-07T23:59:59Z'))).toBe(
			'internal/backups/2026-11-07.sqlite'
		);
	});
});

describe('backupDatabase', () => {
	it('uploads a consistent VACUUM INTO snapshot and cleans up the temp file', async () => {
		const puts: { Bucket: string; Key: string; Body: Uint8Array }[] = [];
		const s3: S3Putter = { putObject: async (input) => void puts.push(input) };
		const now = new Date('2026-11-07T05:00:00Z');
		const result = await backupDatabase({ db: t.db, s3, bucket: 'bkt', now, tmpDir: t.dir });

		expect(result).toEqual({
			bucket: 'bkt',
			key: 'internal/backups/2026-11-07.sqlite',
			bytes: puts[0].Body.byteLength
		});
		expect(result.bytes).toBeGreaterThan(0);
		expect(readdirSync(t.dir).filter((f) => f.startsWith('backup-'))).toEqual([]);

		// The uploaded bytes are a complete database with the same rows.
		const snapshotPath = `${t.dir}/restored.sqlite`;
		await import('node:fs/promises').then((fs) => fs.writeFile(snapshotPath, puts[0].Body));
		const restored = new DatabaseSync(snapshotPath);
		expect(restored.prepare('SELECT COUNT(*) AS n FROM puzzles').get()).toEqual({ n: 2 });
		restored.close();
	});

	it('removes the temp file even when the upload fails', async () => {
		const s3: S3Putter = { putObject: () => Promise.reject(new Error('no route to S3')) };
		await expect(backupDatabase({ db: t.db, s3, bucket: 'bkt', tmpDir: t.dir })).rejects.toThrow(
			'no route to S3'
		);
		expect(existsSync(`${t.dir}/backup-`)).toBe(false);
		expect(readdirSync(t.dir).filter((f) => f.startsWith('backup-'))).toEqual([]);
	});
});
