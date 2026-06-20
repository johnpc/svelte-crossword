import { describe, it, expect } from 'vitest';
import { buildCluePrompt } from './clue-prompt';

describe('buildCluePrompt', () => {
	it('lists the across and down words inline', () => {
		const prompt = buildCluePrompt(['POSER', 'APPLE'], ['PASTE', 'OPERA']);
		expect(prompt).toContain('Across words: POSER, APPLE');
		expect(prompt).toContain('Down words: PASTE, OPERA');
	});

	it('mentions the theme expectation', () => {
		const prompt = buildCluePrompt(['ABC'], ['DEF']);
		expect(prompt).toContain('theme');
		expect(prompt).toContain('CORE THEME clues');
	});

	it('mentions the 60-character clue length cap', () => {
		const prompt = buildCluePrompt(['ABC'], ['DEF']);
		expect(prompt).toContain('60 characters');
	});

	it('handles empty word lists without crashing', () => {
		const prompt = buildCluePrompt([], []);
		expect(prompt).toContain('Across words: ');
		expect(prompt).toContain('Down words: ');
	});
});
