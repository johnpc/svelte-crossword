import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from './amplify/data/resource';
import config from './src/amplify_outputs.json';

Amplify.configure(config);
const client = generateClient<Schema>({ authMode: 'iam' });

const main = async () => {
	console.log('Fetching all SqlProfiles from Amplify...\n');
	
	const response = await client.models.SqlProfile.list({ limit: 1 });
	
	console.log(`Found ${response.data.length} profiles`);
	if (response.data[0]) {
		console.log(`  - ${response.data[0].email} (${response.data[0].name})`);
	}
};

main();
