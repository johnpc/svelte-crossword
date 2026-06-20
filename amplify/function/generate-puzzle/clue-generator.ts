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

	const prompt = `You are a top-tier crossword constructor in the style of the NYT Mini. Given these words that form a 5x5 crossword grid, write colorful, lively clues with real personality — and lean HARD into a single theme so the puzzle feels like a coherent little world.

Across words (rows 1-5): ${acrossWords.join(', ')}
Down words (columns 1-5): ${downWords.join(', ')}

Theme:
- Pick ONE strong theme that naturally connects 2-3 of these words. The theme should feel like a wink, not a homework assignment.
- Create a puzzle title that hints at the theme (under 30 chars, punny / playful / evocative — think NYT Mini titles like "Pop Quiz" or "On the Move").

Theming the clues — this is the most important part:
- 2-3 clues are CORE THEME clues: the word genuinely belongs to the theme. Clue them so the theme is unmistakable.
- For the OTHER clues, lean toward theme-flavored clues whenever the word can plausibly carry the flavor — even if it's a stretch or a loose reference. Aim for ~half of all clues to nod at the theme in some way.
- A theme-flavored clue does NOT need to be the most accurate clue for the word — it just needs to be a valid clue that also evokes the theme. Wordplay, fill-in-the-blanks set in the theme world, "?"-style misdirection that lands on the theme, and oblique references all count.
- Don't force every clue. If a word truly can't carry the theme without becoming nonsensical, write a great non-themed clue instead.
- Example: if the theme is HEDGEHOGS and the word is FAST, instead of "Speedy" you might write "Sonic the ___" — still a valid clue, but now hedgehog-flavored.
- Example: if the theme is HEDGEHOGS and the word is BALL, instead of "Sphere" you might write "Shape a hedgehog curls into when scared" — direct theme reference.
- Example: if the theme is HEDGEHOGS and the word is QUILL, that's a CORE theme clue — make it unmistakable: "Hedgehog's defense" or "Spike on Sonic's back".

Style for ALL clues (themed or not):
- Be specific, vivid, and surprising. Avoid generic dictionary definitions.
- Prefer concrete examples, pop-culture references, idioms, double-meanings, or playful misdirection over dry "type of X" phrasings.
- Question marks (?) are encouraged for clues with wordplay or a punny angle.
- Vary clue style: mix straight definitions, fill-in-the-blanks ("___ in the bucket"), pop-culture, and "?-style" wordplay.
- Avoid: "Used for X", "Type of X", "Relating to X", "A kind of X". These are flat.
- 60 characters max per clue. Tighter is better.
- Never include the answer (or its plural/conjugation) inside the clue.

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
