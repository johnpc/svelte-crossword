import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export interface GeneratedClues {
	title: string;
	theme: string;
	across: Record<string, string>;
	down: Record<string, string>;
}

const MODEL_ID = 'us.anthropic.claude-haiku-4-5-20251001-v1:0';

export async function generateClues(
	acrossWords: string[],
	downWords: string[],
	region: string
): Promise<GeneratedClues> {
	const client = new BedrockRuntimeClient({ region });

	const prompt = `You are a crossword puzzle constructor. Given these words that form a 5x5 crossword grid, create themed clues.

Across words (rows 1-5): ${acrossWords.join(', ')}
Down words (columns 1-5): ${downWords.join(', ')}

Instructions:
- Find a theme that naturally connects 2-3 of these words
- Create a puzzle title that hints at the theme (short, punny or clever, under 30 characters)
- Write one clue per word. The themed words should have clues that relate to the theme. Other clues should be standard crossword style (concise, may use wordplay)
- Clues should be concise (under 50 characters each)
- Do not include the answer in the clue
- For across_clues and down_clues, the keys must be the exact uppercase words provided above`;

	const schema = {
		type: 'object' as const,
		properties: {
			title: {
				type: 'string' as const,
				description: 'Short puzzle title hinting at the theme'
			},
			theme: {
				type: 'string' as const,
				description: 'Brief description of the theme'
			},
			across_clues: {
				type: 'object' as const,
				description: 'Map of each across word to its clue',
				additionalProperties: false,
				properties: Object.fromEntries(acrossWords.map((w) => [w, { type: 'string' as const }])),
				required: acrossWords
			},
			down_clues: {
				type: 'object' as const,
				description: 'Map of each down word to its clue',
				additionalProperties: false,
				properties: Object.fromEntries(downWords.map((w) => [w, { type: 'string' as const }])),
				required: downWords
			}
		},
		required: ['title', 'theme', 'across_clues', 'down_clues'] as string[],
		additionalProperties: false
	};

	const body = JSON.stringify({
		anthropic_version: 'bedrock-2023-05-31',
		max_tokens: 1024,
		messages: [{ role: 'user', content: prompt }],
		output_config: {
			format: {
				type: 'json_schema',
				schema
			}
		}
	});

	const command = new InvokeModelCommand({
		modelId: MODEL_ID,
		contentType: 'application/json',
		accept: 'application/json',
		body: new TextEncoder().encode(body)
	});

	const response = await client.send(command);
	const responseBody = JSON.parse(new TextDecoder().decode(response.body));
	const parsed = JSON.parse(responseBody.content[0].text);

	return {
		title: parsed.title,
		theme: parsed.theme,
		across: parsed.across_clues,
		down: parsed.down_clues
	};
}
