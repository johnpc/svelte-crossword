// @vitest-environment node
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it, vi } from 'vitest';

const sent: unknown[] = [];
vi.mock('@aws-sdk/client-s3', () => ({
	S3Client: class {
		send(command: { input: unknown }) {
			sent.push(command.input);
			return Promise.resolve({});
		}
	},
	PutObjectCommand: class {
		constructor(public input: unknown) {}
	}
}));

const dir = mkdtempSync(join(tmpdir(), 'backup-sqlite-'));
process.env.DB_PATH = join(dir, 'crossword.sqlite');
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe('backup-sqlite handler', () => {
	it('fails fast without a bucket name', async () => {
		delete process.env.SMALL_CROSSWORDS_PUZ_FILE_STORAGE_BUCKET_NAME;
		const { handler } = await import('./handler');
		await expect(handler()).rejects.toThrow(/BUCKET_NAME is not set/);
	});

	it('snapshots the EFS database into the storage bucket', async () => {
		process.env.SMALL_CROSSWORDS_PUZ_FILE_STORAGE_BUCKET_NAME = 'puz-bucket';
		vi.spyOn(console, 'log').mockImplementation(() => {});
		const { handler } = await import('./handler');
		const result = await handler();
		expect(result.bucket).toBe('puz-bucket');
		expect(result.key).toMatch(/^internal\/backups\/\d{4}-\d{2}-\d{2}\.sqlite$/);
		expect(sent).toHaveLength(1);
		expect(sent[0]).toMatchObject({ Bucket: 'puz-bucket', Key: result.key });
	});
});
