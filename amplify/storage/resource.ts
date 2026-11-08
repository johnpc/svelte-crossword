import { defineStorage } from '@aws-amplify/backend';
import { seedPuzzleDbFunction } from '../function/resource';

export const storage = defineStorage({
	name: 'smallCrosswordsPuzFileStorage',
	access: (allow) => ({
		// backup-sqlite also writes internal/backups/<date>.sqlite, but it is granted
		// in backend.ts: allow.resource() would inject an SSM-resolved env var, and
		// that Lambda runs in the VPC where SSM is unreachable (no NAT).
		'internal/*': [allow.resource(seedPuzzleDbFunction).to(['read', 'write'])]
	})
});
