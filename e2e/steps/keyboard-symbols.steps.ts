import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

When('the user toggles the on-screen keyboard to symbols mode', async ({ page }) => {
	await page.locator('.svelte-keyboard .key--Page1').first().click();
	await expect(page.locator('.svelte-keyboard .key--1').first()).toBeVisible();
});

When('the user toggles the on-screen keyboard to alphabet mode', async ({ page }) => {
	await page.locator('.svelte-keyboard .key--Page0').first().click();
	await expect(page.locator('.svelte-keyboard .key--T').first()).toBeVisible();
});

When('the user taps the on-screen key {string}', async ({ page }, value: string) => {
	await page.locator(`.svelte-keyboard .key--${value}`).first().click();
});

Then('the focused cell should contain {string}', async ({ page }, value: string) => {
	const focused = page.locator('g.cell.is-focused, g.cell-0-0').first();
	await expect(focused.locator('text').first()).toHaveText(value);
});

Then('the second cell of the puzzle should contain {string}', async ({ page }, value: string) => {
	const cell = page.locator('g.cell-1-0').first();
	await expect(cell.locator('text').first()).toHaveText(value);
});
