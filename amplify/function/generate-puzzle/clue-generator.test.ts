import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trimWords, buildBedrockBody, parseBedrockResponse, generateClues } from './clue-generator';

const sendMock = vi.hoisted(() => vi.fn());
vi.mock('@aws-sdk/client-bedrock-runtime', () => ({
	BedrockRuntimeClient: class {
		send(...args: unknown[]) {
			return sendMock(...args);
		}
	},
	InvokeModelCommand: class {
		input: unknown;
		constructor(input: unknown) {
			this.input = input;
		}
	}
}));

describe('clue-generator', () => {
	beforeEach(() => sendMock.mockReset());

	describe('trimWords', () => {
		it('strips leading and trailing spaces', () => {
			expect(trimWords([' WORD', 'WORD ', 'PLAIN'])).toEqual(['WORD', 'WORD', 'PLAIN']);
		});

		it('drops entries that trim to empty', () => {
			expect(trimWords([' ', '   ', 'X'])).toEqual(['X']);
		});
	});

	describe('buildBedrockBody', () => {
		it('produces JSON with anthropic_version and json_schema format', () => {
			const body = JSON.parse(buildBedrockBody('hi', { type: 'object' }));
			expect(body.anthropic_version).toBe('bedrock-2023-05-31');
			expect(body.output_config.format.type).toBe('json_schema');
			expect(body.messages[0].content).toBe('hi');
		});
	});

	describe('parseBedrockResponse', () => {
		it('returns the title/theme/across/down from a valid envelope', () => {
			const inner = { title: 'T', theme: 'h', across_clues: { A: 'a' }, down_clues: { B: 'b' } };
			const envelope = { content: [{ text: JSON.stringify(inner) }] };
			const bytes = new TextEncoder().encode(JSON.stringify(envelope));
			expect(parseBedrockResponse(bytes)).toEqual({
				title: 'T',
				theme: 'h',
				across: { A: 'a' },
				down: { B: 'b' }
			});
		});
	});

	describe('generateClues', () => {
		it('invokes Bedrock and returns parsed clues', async () => {
			const inner = {
				title: 'T',
				theme: 'h',
				across_clues: { POSER: 'a' },
				down_clues: { PASTE: 'b' }
			};
			const envelope = { content: [{ text: JSON.stringify(inner) }] };
			sendMock.mockResolvedValueOnce({
				body: new TextEncoder().encode(JSON.stringify(envelope))
			});
			const result = await generateClues(['POSER'], ['PASTE'], 'us-west-2');
			expect(result.title).toBe('T');
			expect(sendMock).toHaveBeenCalledOnce();
		});

		it('strips spaces from words before sending to Bedrock', async () => {
			const inner = { title: 'T', theme: 'h', across_clues: { WORD: 'a' }, down_clues: {} };
			const envelope = { content: [{ text: JSON.stringify(inner) }] };
			sendMock.mockResolvedValueOnce({
				body: new TextEncoder().encode(JSON.stringify(envelope))
			});
			await generateClues([' WORD'], [], 'us-west-2');
			const callArg = sendMock.mock.calls[0][0];
			const body = JSON.parse(new TextDecoder().decode(callArg.input.body));
			// The "Across words:" line should list trimmed words only.
			const acrossLine = body.messages[0].content
				.split('\n')
				.find((l: string) => l.startsWith('Across words: '));
			expect(acrossLine).toBe('Across words: WORD');
		});
	});
});
