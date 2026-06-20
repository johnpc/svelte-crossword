/**
 * Build the Bedrock prompt that asks the model to title the puzzle and
 * write themed clues. Words may contain leading/trailing spaces (the
 * encoding for black squares) — the prompt only ever sees trimmed forms.
 */
export function buildCluePrompt(acrossTrimmed: string[], downTrimmed: string[]): string {
	return `You are a top-tier crossword constructor in the style of the NYT Mini. Given these words that form a 5x5 crossword grid, write colorful, lively clues with real personality — and lean HARD into a single theme so the puzzle feels like a coherent little world.

Across words: ${acrossTrimmed.join(', ')}
Down words: ${downTrimmed.join(', ')}

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
}
