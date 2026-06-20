import { describe, it, expect } from 'vitest';
import { buildClueSchema } from './clue-schema';

interface ClueSchema {
	type: 'object';
	properties: {
		title: { type: 'string'; description: string };
		theme: { type: 'string'; description: string };
		across_clues: { properties: Record<string, { type: 'string' }>; required: string[] };
		down_clues: { properties: Record<string, { type: 'string' }>; required: string[] };
	};
	required: string[];
	additionalProperties: false;
}

describe('buildClueSchema', () => {
	it('keys across_clues and down_clues by the supplied trimmed words', () => {
		const schema = buildClueSchema(['POSER', 'APPLE'], ['PASTE']) as unknown as ClueSchema;
		expect(Object.keys(schema.properties.across_clues.properties).sort()).toEqual([
			'APPLE',
			'POSER'
		]);
		expect(Object.keys(schema.properties.down_clues.properties)).toEqual(['PASTE']);
	});

	it('marks every supplied word as required', () => {
		const schema = buildClueSchema(['A', 'B'], ['C']) as unknown as ClueSchema;
		expect(schema.properties.across_clues.required).toEqual(['A', 'B']);
		expect(schema.properties.down_clues.required).toEqual(['C']);
	});

	it('includes the four top-level required fields', () => {
		const schema = buildClueSchema([], []) as unknown as ClueSchema;
		expect(schema.required).toEqual(['title', 'theme', 'across_clues', 'down_clues']);
	});

	it('disallows additional properties at the top level', () => {
		const schema = buildClueSchema([], []) as unknown as ClueSchema;
		expect(schema.additionalProperties).toBe(false);
	});
});
