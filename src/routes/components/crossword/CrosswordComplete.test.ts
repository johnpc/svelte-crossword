import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import CrosswordComplete from './CrosswordComplete.svelte';

const base = {
	isComplete: true,
	isRevealing: false,
	showCompleteMessage: true,
	showConfetti: false,
	hasSlot: false
};

describe('CrosswordComplete', () => {
	it('shows the completion message with default copy when complete', () => {
		const { getByText } = render(CrosswordComplete, { props: base });
		expect(getByText('You solved it!')).toBeInTheDocument();
	});

	it('renders nothing while still revealing', () => {
		const { container } = render(CrosswordComplete, {
			props: { ...base, isRevealing: true }
		});
		expect(container.querySelector('.completed')).toBeNull();
	});

	it('renders nothing when not complete', () => {
		const { container } = render(CrosswordComplete, {
			props: { ...base, isComplete: false }
		});
		expect(container.querySelector('.completed')).toBeNull();
	});

	it('renders nothing when showCompleteMessage is false', () => {
		const { container } = render(CrosswordComplete, {
			props: { ...base, showCompleteMessage: false }
		});
		expect(container.querySelector('.completed')).toBeNull();
	});
});
