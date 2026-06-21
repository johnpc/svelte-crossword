/**
 * Build the Bedrock prompt that asks the model to title the puzzle and
 * write themed clues. Words may contain leading/trailing spaces (the
 * encoding for black squares) — the prompt only ever sees trimmed forms.
 */
export function buildCluePrompt(acrossTrimmed: string[], downTrimmed: string[]): string {
	return `You are a top-tier crossword constructor in the style of the NYT Mini. Given these words that form a 5x5 crossword grid, write colorful, lively clues with real personality. A light theme can tie a couple of clues together, but clarity and fair, accurate clues come first.

Across words: ${acrossTrimmed.join(', ')}
Down words: ${downTrimmed.join(', ')}

Theme:
- Pick ONE light theme that naturally connects 2-3 of these words. The theme should feel like a wink, not a homework assignment.
- Create a puzzle title that hints at the theme (under 30 chars, punny / playful / evocative — think NYT Mini titles like "Pop Quiz" or "On the Move").

Theming the clues — keep it light:
- Only 2-3 clues should be theme clues: words that genuinely belong to the theme. Clue those so the theme reads naturally.
- Leave the REST of the clues alone. Write the best, clearest, most accurate clue for each word on its own merits — do NOT bend them toward the theme.
- Never sacrifice accuracy or clarity for the sake of the theme. A clue that's a stretch or only makes sense if you already know the theme is worse than a clean, unthemed clue. When in doubt, don't theme it.
- Example: if the theme is HEDGEHOGS and the word is QUILL, that's a natural theme clue — "Hedgehog's defense" or "Spike on Sonic's back".
- Example: if the theme is HEDGEHOGS and the word is FAST, just clue it well — "Quick" or "Like a sprinter" — don't force a hedgehog angle.

Style for ALL clues (themed or not):
- Be specific, vivid, and surprising. Avoid generic dictionary definitions.
- Prefer concrete examples, pop-culture references, idioms, double-meanings, or playful misdirection over dry "type of X" phrasings.
- Question marks (?) are encouraged for clues with wordplay or a punny angle.
- Vary clue style: mix straight definitions, fill-in-the-blanks ("___ in the bucket"), pop-culture, and "?-style" wordplay.
- Avoid: "Used for X", "Type of X", "Relating to X", "A kind of X". These are flat.
- 60 characters max per clue. Tighter is better.
- Never include the answer (or its plural/conjugation) inside the clue.

For across_clues and down_clues, the keys MUST be the exact uppercase words provided above.`;
}
