import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

export interface SqlInvoker {
	(payload: Record<string, unknown>): Promise<string>;
}

/**
 * Returns a function that invokes the project's SQL queries Lambda with the
 * given payload and returns its JSON-string `body`. Decoupled from handler
 * so tests can pass in a mock invoker without touching the AWS SDK.
 */
export function createSqlInvoker(client: LambdaClient, functionName: string): SqlInvoker {
	return async (payload) => {
		const command = new InvokeCommand({
			FunctionName: functionName,
			Payload: JSON.stringify(payload)
		});
		const response = await client.send(command);
		const result = new TextDecoder().decode(response.Payload);
		const parsed = JSON.parse(result);
		return parsed.body || 'null';
	};
}
