import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import config from '../src/amplify_outputs.json';

// Runs parameterized SQL against the private crossword DB via an IAM-gated
// admin Lambda (the DB has no public endpoint and only admits in-VPC callers).
// Requires admin AWS credentials, e.g. AWS_PROFILE=personal. Returns a
// mysql2-shaped [rows] tuple so call sites read like conn.execute().
const lambda = new LambdaClient({ region: 'us-west-2' });

export type AdminFunctionKey = 'adminSqlFunctionName' | 'adminSqliteFunctionName';
export type Executor = (sql: string, params?: unknown[]) => Promise<[unknown[]]>;

const functionNameFor = (key: AdminFunctionKey): string => {
	const name = (config as { custom?: Partial<Record<AdminFunctionKey, string>> }).custom?.[key];
	if (!name) {
		throw new Error(`${key} missing from src/amplify_outputs.json — run \`npm run prod-config\``);
	}
	return name;
};

export function createExecutor(key: AdminFunctionKey): Executor {
	return async (sql, params = []) => {
		const response = await lambda.send(
			new InvokeCommand({
				FunctionName: functionNameFor(key),
				Payload: JSON.stringify({ sql, params })
			})
		);
		const payload = JSON.parse(new TextDecoder().decode(response.Payload));
		if (response.FunctionError) {
			throw new Error(`${key} failed: ${payload?.errorMessage ?? response.FunctionError}`);
		}
		return [payload.rows];
	};
}

/** Default executor: the function `adminSqlFunctionName` points at. */
export const execute: Executor = createExecutor('adminSqlFunctionName');
