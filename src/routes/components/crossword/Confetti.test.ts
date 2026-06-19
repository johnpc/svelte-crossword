import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';

import Confetti from './Confetti.svelte';

describe('Confetti', () => {
	it('renders an .confetti svg', () => {
		const { container } = render(Confetti, { props: { numberOfElements: 5 } });
		expect(container.querySelector('svg.confetti')).toBeInTheDocument();
	});

	it('renders the requested number of top-level confetti element groups', () => {
		const { container } = render(Confetti, { props: { numberOfElements: 5 } });
		// Each element is an outer <g> (scale wrapper) containing an inner <g>.
		const outerGroups = container.querySelectorAll('svg.confetti > g');
		expect(outerGroups).toHaveLength(5);
		// Each outer group wraps exactly one inner animated group.
		outerGroups.forEach((g) => {
			expect(g.querySelectorAll(':scope > g')).toHaveLength(1);
		});
	});

	it('renders no element groups when numberOfElements is 0', () => {
		const { container } = render(Confetti, { props: { numberOfElements: 0 } });
		expect(container.querySelectorAll('svg.confetti > g')).toHaveLength(0);
	});

	it('honors a different numberOfElements count', () => {
		const { container } = render(Confetti, { props: { numberOfElements: 12 } });
		expect(container.querySelectorAll('svg.confetti > g')).toHaveLength(12);
	});

	it('applies a fill color to each inner element group', () => {
		const { container } = render(Confetti, { props: { numberOfElements: 3 } });
		const innerGroups = container.querySelectorAll('svg.confetti > g > g');
		expect(innerGroups).toHaveLength(3);
		innerGroups.forEach((g) => {
			expect(g.getAttribute('fill')).toBeTruthy();
		});
	});
});
