# AI Crossword Generator Lambda

## Overview

A new Lambda function (`generatePuzzleFunction`) that runs once daily to produce one algorithmically-generated 5x5 crossword puzzle with AI-generated themed clues. Completely independent from the existing Crosshare fetcher. Output is indistinguishable from Crosshare puzzles in the database — same format, same table, same delivery path to users.

## Architecture

### New Lambda: `generatePuzzleFunction`

- **Schedule:** `every day`
- **Runtime:** Node 20
- **Timeout:** 120s (Bedrock call may take a few seconds)
- **Memory:** 512MB
- **Entry:** `amplify/function/generate-puzzle.ts`
- **Resource definition:** `amplify/function/generate-puzzle/resource.ts`

### Dependencies

- `@aws-sdk/client-bedrock-runtime` — Claude Sonnet via InvokeModel
- `@aws-sdk/client-lambda` — invoke sqlQueriesFunction for DB writes
- Bundled word list (5-letter English words, ~5000 entries)

### Integration Points

- Invokes existing `sqlQueriesFunction` with `query: 'createPuzzle'` — same path as Crosshare puzzles
- Also creates DynamoDB record via GraphQL (same as existing flow)
- No changes to frontend, SQL handler, or schema needed

## Grid Generation

### Format

- 5x5 all-white grid (no black squares)
- 5 across clues (one per row), 5 down clues (one per column)
- Every row and column is a valid 5-letter English word

### Word List

- Curated list of common 5-letter English words bundled as JSON
- Indexed at build time by letter-at-position for O(1) constraint lookups
- Example index: `index[2]['A']` = all words with 'A' at position 2

### Algorithm

1. Build position index from word list
2. Place first across word (random selection)
3. For each subsequent row, find words whose letters at each column position are compatible with existing column prefixes
4. At each step, check that every column still has at least one valid completion
5. If stuck, backtrack to previous row with a different word
6. Most-constrained-first: fill the row with fewest valid candidates first
7. On success, extract the 5 down words from the completed grid

### Retry Logic

- If backtracking exhausts options (shouldn't happen with a good word list), start over with a different seed word
- Max 10 attempts before failing the Lambda invocation

## Themed Clues via Bedrock

### Model

- Claude Sonnet via `@aws-sdk/client-bedrock-runtime` InvokeModel
- Region: us-west-2
- Model ID: `us.anthropic.claude-sonnet-4-20250514`

### Prompt Strategy

Single call with all 10 words (5 across + 5 down). The prompt asks Claude to:

1. Identify a theme that connects 2-3 of the words naturally
2. Generate a puzzle title that references the theme
3. Write clues for all 10 words, making 2-3 clues thematically connected and the rest standard crossword clues
4. Return structured JSON

### Prompt Template

```
You are a crossword puzzle constructor. Given these words that form a 5x5 crossword grid, create themed clues.

Across words: [WORD1, WORD2, WORD3, WORD4, WORD5]
Down words: [WORD1, WORD2, WORD3, WORD4, WORD5]

Instructions:
- Find a theme that naturally connects 2-3 of these words
- Create a puzzle title that hints at the theme (short, punny or clever)
- Write one clue per word. The themed words should have clues that relate to the theme. Other clues should be standard crossword style (concise, may use wordplay)
- Clues should be concise (under 50 characters each)

Return JSON only:
{
  "title": "...",
  "theme": "...",
  "clues": {
    "across": {"WORD1": "clue", "WORD2": "clue", ...},
    "down": {"WORD1": "clue", "WORD2": "clue", ...}
  }
}
```

## Output Format

Must match the structure returned by `puzToJson()`:

```typescript
{
  header: {
    width: 5,
    height: 5,
    title: string,        // from Bedrock
    author: "xwords robot",
    copyright: "",
    numberOfClues: 10,
    checksum: 0,
    fileMagic: "",
    version: "",
    scrambled: false,
    // ... other header fields set to defaults
  },
  puzzle: {
    solution: string,     // 25 chars, row-major (e.g. "HELLOWORLD...")
    state: string         // 25 chars, all '-' (unsolved)
  },
  clues: {
    across: {
      1: { clue: "...", x: 0, y: 0, answer: "HELLO", direction: "across" },
      2: { clue: "...", x: 0, y: 1, answer: "WORLD", direction: "across" },
      ...
    },
    down: {
      1: { clue: "...", x: 0, y: 0, answer: "HWXXX", direction: "down" },
      ...
    }
  },
  board: [
    [{ x: 0, y: 0, letter: "H", isBlank: false, acrossClue: 1, downClue: 1 }, ...],
    ...
  ]
}
```

### Puzzle ID

- Format: `generated-YYYY-MM-DD` (e.g., `generated-2026-06-19`)
- Serves as both `id` and `puz_key` in the puzzles table
- Natural dedup: `INSERT IGNORE` on this ID means running twice in a day is safe

## Duplicate Prevention

1. **Solution-level dedup:** Before inserting, query `SELECT id FROM puzzles WHERE puz_json LIKE '%"solution":"XXXXX..."%' LIMIT 1`. If found, regenerate grid.
2. **ID-level dedup:** Using date-based IDs + `INSERT IGNORE` means the same day's puzzle won't double-insert.
3. **Word reuse across days:** Not prevented — same words may appear in different grids on different days, which is normal crossword behavior.

## Testing Strategy

### Dry-run Mode

The Lambda accepts an optional `dryRun: true` parameter in its event payload. When set:

- Generates the grid and clues normally
- Logs the full puzzle JSON to CloudWatch
- Does NOT write to DynamoDB or MySQL
- Returns the generated puzzle in the response body

### Local Testing Script

A script at `/tmp/test-generate-puzzle.ts` that:

1. Imports the grid generation and clue formatting logic directly
2. Runs N iterations (default 5)
3. Prints each generated puzzle (title, grid, clues)
4. Checks for duplicate solutions across runs
5. Validates output matches expected format via `validateClues(createClues(...))`

### What "looks good" means

- All rows and columns are real English words
- No duplicate solutions across multiple runs
- Clues are coherent and 2-3 feel thematically connected
- Title relates to the theme
- Output passes `validateClues` validation

## File Structure

```
amplify/function/
├── generate-puzzle/
│   ├── resource.ts              # defineFunction config
│   ├── handler.ts               # Lambda entry point
│   ├── grid-generator.ts        # Backtracking grid filler
│   ├── clue-generator.ts        # Bedrock integration
│   ├── format-puzzle.ts         # Convert grid+clues to puz_json format
│   ├── word-list.json           # Curated 5-letter words
│   └── word-index.ts            # Position-based index builder
```

## Changes to Existing Files

- `amplify/function/resource.ts` — export new `generatePuzzleFunction`
- `amplify/backend.ts` — register new function, add Bedrock permissions, pass env vars, grant Lambda invoke on sqlQueriesFunction
