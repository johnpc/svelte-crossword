import { defineStorage } from '@aws-amplify/backend';
import { seedPuzzleDbFunction } from '../function/resource';
import { backupSqliteFunction } from '../function/backup-sqlite/resource';

export const storage = defineStorage({
	name: 'smallCrosswordsPuzFileStorage',
	access: (allow) => ({
		'internal/*': [
			allow.resource(seedPuzzleDbFunction).to(['read', 'write']),
			// Nightly SQLite snapshots land under internal/backups/<date>.sqlite
			allow.resource(backupSqliteFunction).to(['write'])
		]
	})
});
