import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { buildCluePrompt } from './clue-prompt';
import { buildClueSchema } from './clue-schema';

export interface GeneratedClues {
	title: string;
	theme: string;
	across: Record<string, string>;
	down: Record<string, string>;
}

const MODEL_ID = 'us.anthropic.claude-haiku-4-5-20251001-v1:0';
const MAX_TOKENS = 1024;

/** Words may contain leading/trailing spaces (encoding black squares) — strip them. */
export function trimWords(words: string[]): string[] {
	return words.map((w) => w.trim()).filter((w) => w.length > 0);
}

/** Build the wire payload Bedrock expects for an Anthropic invoke call. */
export function buildBedrockBody(prompt: string, schema: object): string {
	return JSON.stringify({
		anthropic_version: 'bedrock-2023-05-31',
		max_tokens: MAX_TOKENS,
		messages: [{ role: 'user', content: prompt }],
		output_config: { format: { type: 'json_schema', schema } }
	});
}

/** Pull the JSON-schema-validated clue payload out of Bedrock's response envelope. */
export function parseBedrockResponse(bytes: Uint8Array): GeneratedClues {
	const responseBody = JSON.parse(new TextDecoder().decode(bytes));
	const parsed = JSON.parse(responseBody.content[0].text);
	return {
		title: parsed.title,
		theme: parsed.theme,
		across: parsed.across_clues,
		down: parsed.down_clues
	};
}

export async function generateClues(
	acrossWords: string[],
	downWords: string[],
	region: string
): Promise<GeneratedClues> {
	const acrossTrimmed = trimWords(acrossWords);
	const downTrimmed = trimWords(downWords);
	const prompt = buildCluePrompt(acrossTrimmed, downTrimmed);
	const schema = buildClueSchema(acrossTrimmed, downTrimmed);
	const body = buildBedrockBody(prompt, schema);

	const client = new BedrockRuntimeClient({ region });
	const response = await client.send(
		new InvokeModelCommand({
			modelId: MODEL_ID,
			contentType: 'application/json',
			accept: 'application/json',
			body: new TextEncoder().encode(body)
		})
	);
	return parseBedrockResponse(response.body!);
}
