/**
 * Build the JSON Schema Bedrock validates the response against. The schema
 * pins required keys to the exact (trimmed) words for this puzzle so the
 * model can't omit one or invent extras.
 */
export function buildClueSchema(acrossTrimmed: string[], downTrimmed: string[]): object {
	return {
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
				properties: Object.fromEntries(acrossTrimmed.map((w) => [w, { type: 'string' as const }])),
				required: acrossTrimmed
			},
			down_clues: {
				type: 'object' as const,
				description: 'Map of each down word to its clue',
				additionalProperties: false,
				properties: Object.fromEntries(downTrimmed.map((w) => [w, { type: 'string' as const }])),
				required: downTrimmed
			}
		},
		required: ['title', 'theme', 'across_clues', 'down_clues'] as string[],
		additionalProperties: false
	};
}
