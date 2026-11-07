import { readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';

export interface S3Putter {
	putObject(input: { Bucket: string; Key: string; Body: Uint8Array }): Promise<unknown>;
}

export interface BackupOptions {
	db: DatabaseSync;
	s3: S3Putter;
	bucket: string;
	now?: Date;
	tmpDir?: string;
}

export const backupKeyFor = (now: Date) =>
	`internal/backups/${now.toISOString().slice(0, 10)}.sqlite`;

/**
 * Takes a consistent snapshot of the live database with VACUUM INTO (which
 * holds a read transaction, so a concurrent write can't tear the copy), then
 * uploads it to the puzzle storage bucket as internal/backups/<date>.sqlite.
 */
export async function backupDatabase(options: BackupOptions) {
	const { db, s3, bucket, now = new Date(), tmpDir = '/tmp' } = options;
	const localPath = join(tmpDir, `backup-${now.getTime()}.sqlite`);
	rmSync(localPath, { force: true });
	db.prepare('VACUUM INTO ?').run(localPath);
	try {
		const body = readFileSync(localPath);
		const key = backupKeyFor(now);
		await s3.putObject({ Bucket: bucket, Key: key, Body: body });
		return { bucket, key, bytes: body.byteLength };
	} finally {
		rmSync(localPath, { force: true });
	}
}
