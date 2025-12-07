import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from './amplify/data/resource';
import config from './src/amplify_outputs.json';

Amplify.configure(config);
const client = generateClient<Schema>({ authMode: 'iam' });

const main = async () => {
	console.log('Testing Amplify Data API connection...\n');
	
	try {
		console.log('1. Listing SqlProfiles...');
		const profiles = await Promise.race([
			client.models.SqlProfile.list({ limit: 1 }),
			new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
		]);
		console.log('   Result:', profiles);
	} catch (error) {
		console.log('   Error:', error instanceof Error ? error.message : String(error));
	}
	
	try {
		console.log('\n2. Listing SqlPuzzles...');
		const puzzles = await Promise.race([
			client.models.SqlPuzzle.list({ limit: 1 }),
			new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
		]);
		console.log('   Result:', puzzles);
	} catch (error) {
		console.log('   Error:', error instanceof Error ? error.message : String(error));
	}
};

main();
