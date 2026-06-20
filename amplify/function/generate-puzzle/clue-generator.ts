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

	const prompt = `You are a top-tier crossword constructor in the style of the NYT Mini. Given these words that form a 5x5 crossword grid, write colorful, lively clues with real personality.

Across words (rows 1-5): ${acrossWords.join(', ')}
Down words (columns 1-5): ${downWords.join(', ')}

Theme:
- Find a theme that naturally connects 2-3 of these words. The theme should feel like a wink, not a homework assignment.
- Create a puzzle title that hints at the theme (under 30 chars, punny / playful / evocative — think NYT Mini titles like "Pop Quiz" or "On the Move")
- Themed clues should reference the theme cleverly — could be wordplay, a pop-culture nod, or a clever misdirection.

Style for ALL clues:
- Be specific, vivid, and surprising. Avoid generic dictionary definitions.
- Prefer concrete examples, pop-culture references, idioms, double-meanings, or playful misdirection over dry "type of X" phrasings.
- Question marks (?) are encouraged for clues with wordplay or a punny angle.
- Vary clue style: mix straight definitions, fill-in-the-blanks ("___ in the bucket"), pop-culture, and "?-style" wordplay.
- Avoid: "Used for X", "Type of X", "Relating to X", "A kind of X". These are flat.
- 50 characters max per clue. Tighter is better.
- Never include the answer (or its plural/conjugation) inside the clue.

Examples of the vibe:
- APPLE → "Forbidden fruit, in Eden" (not "Common red fruit")
- EAGER → "Champing at the bit" (not "Very enthusiastic")
- SERIF → "Times New Roman flourish" (not "Font feature")
- TRITE → "Like the saying 'It is what it is'" (not "Overused")

For across_clues and down_clues, the keys MUST be the exact uppercase words provided above.`;

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
