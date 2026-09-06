import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import config from '../src/amplify_outputs.json';

// Runs parameterized SQL against the private crossword DB via the IAM-gated
// admin-sql Lambda (the DB has no public IP and only admits in-VPC callers).
// Requires admin AWS credentials, e.g. AWS_PROFILE=personal. Returns a
// mysql2-shaped [rows] tuple so call sites read like conn.execute().
const lambda = new LambdaClient({ region: 'us-west-2' });

export async function execute(sql: string, params: unknown[] = []): Promise<[unknown[]]> {
	const functionName = (config as { custom?: { adminSqlFunctionName?: string } }).custom
		?.adminSqlFunctionName;
	if (!functionName) {
		throw new Error(
			'adminSqlFunctionName missing from src/amplify_outputs.json — run `npm run prod-config`'
		);
	}

	const response = await lambda.send(
		new InvokeCommand({
			FunctionName: functionName,
			Payload: JSON.stringify({ sql, params })
		})
	);
	const payload = JSON.parse(new TextDecoder().decode(response.Payload));
	if (response.FunctionError) {
		throw new Error(`admin-sql failed: ${payload?.errorMessage ?? response.FunctionError}`);
	}
	return [payload.rows];
}
