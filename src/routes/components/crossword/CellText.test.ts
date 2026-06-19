import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import CellText from './CellText.svelte';

describe('CellText', () => {
	it('always renders the cell number', () => {
		const { container } = render(CellText, { props: { value: '', number: 3 } });
		const number = container.querySelector('.number');
		expect(number).toHaveTextContent('3');
	});

	it('renders the value text when a value is present', () => {
		const { container } = render(CellText, { props: { value: 'A', number: 1 } });
		const value = container.querySelector('.value');
		expect(value).toHaveTextContent('A');
	});

	it('omits the value text when value is empty', () => {
		const { container } = render(CellText, { props: { value: '', number: 1 } });
		expect(container.querySelector('.value')).toBeNull();
	});
});
