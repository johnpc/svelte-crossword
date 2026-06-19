import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import CluesContainer from './CluesContainer.svelte';

describe('CluesContainer', () => {
	it('applies stacked and is-loaded classes from props', () => {
		const { container } = render(CluesContainer, { props: { stacked: true, isLoaded: true } });
		const section = container.querySelector('section');
		expect(section).toHaveClass('stacked');
		expect(section).toHaveClass('is-loaded');
	});

	it('omits the classes when props are false', () => {
		const { container } = render(CluesContainer, { props: { stacked: false, isLoaded: false } });
		const section = container.querySelector('section');
		expect(section).not.toHaveClass('stacked');
		expect(section).not.toHaveClass('is-loaded');
	});
});
