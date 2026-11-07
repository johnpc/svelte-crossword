import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createDatabaseProvider } from '../db/open-database';
import { backupDatabase, type S3Putter } from './backup';

// Nightly SQLite backup to S3. Runs inside the VPC (to mount EFS) which has no
// NAT, so S3 is reached through the VPC's S3 gateway endpoint; the short
// connection timeout makes a missing endpoint fail loudly instead of hanging.
const getDb = createDatabaseProvider(process.env.DB_PATH ?? '/mnt/db/crossword.sqlite');
const s3 = new S3Client({
	maxAttempts: 2,
	requestHandler: { connectionTimeout: 5_000, requestTimeout: 60_000 }
});
const putter: S3Putter = { putObject: (input) => s3.send(new PutObjectCommand(input)) };

export const handler = async () => {
	const bucket = process.env.SMALL_CROSSWORDS_PUZ_FILE_STORAGE_BUCKET_NAME;
	if (!bucket) throw new Error('SMALL_CROSSWORDS_PUZ_FILE_STORAGE_BUCKET_NAME is not set');
	const result = await backupDatabase({ db: getDb(), s3: putter, bucket });
	console.log(JSON.stringify({ msg: 'sqlite backup uploaded', ...result }));
	return result;
};
