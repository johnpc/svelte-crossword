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

Return ONLY valid JSON with no other text:
{
  "title": "...",
  "theme": "brief theme description",
  "clues": {
    "across": {"${acrossWords[0]}": "clue", "${acrossWords[1]}": "clue", "${acrossWords[2]}": "clue", "${acrossWords[3]}": "clue", "${acrossWords[4]}": "clue"},
    "down": {"${downWords[0]}": "clue", "${downWords[1]}": "clue", "${downWords[2]}": "clue", "${downWords[3]}": "clue", "${downWords[4]}": "clue"}
  }
}`;

	const body = JSON.stringify({
		anthropic_version: 'bedrock-2023-05-31',
		max_tokens: 1024,
		messages: [{ role: 'user', content: prompt }]
	});

	const command = new InvokeModelCommand({
		modelId: MODEL_ID,
		contentType: 'application/json',
		accept: 'application/json',
		body: new TextEncoder().encode(body)
	});

	const response = await client.send(command);
	const responseBody = JSON.parse(new TextDecoder().decode(response.body));
	const text = responseBody.content[0].text;

	const jsonMatch = text.match(/\{[\s\S]*\}/);
	if (!jsonMatch) {
		throw new Error(`Failed to parse clue response: ${text}`);
	}

	const parsed = JSON.parse(jsonMatch[0]);

	return {
		title: parsed.title,
		theme: parsed.theme,
		across: parsed.clues.across,
		down: parsed.clues.down
	};
}
