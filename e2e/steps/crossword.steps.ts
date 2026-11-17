import { expect } from '@playwright/test';
import { Given, Then, When } from '../fixtures';

Given('the user navigates to the home page', async ({ page }) => {
	await page.goto('/');
});

Given('the user navigates to the about page', async ({ page }) => {
	await page.goto('/about');
});

Given('the user navigates to the preview page', async ({ page }) => {
	await page.goto('/preview');
});

Given('the user navigates to the leaderboard page', async ({ page }) => {
	await page.goto('/leaderboard');
});

When('the user follows the {string} header link', async ({ page }, name: string) => {
	await page.getByRole('navigation').getByRole('link', { name }).click();
});

Then('the page should load successfully', async ({ page }) => {
	await expect(page).toHaveTitle(/Small Crosswords/);
	await expect(page.getByRole('heading', { name: 'Small Crosswords' })).toBeVisible();
});

Then('the about page should display content', async ({ page }) => {
	await expect(page.getByRole('heading', { name: 'About Small Crosswords' })).toBeVisible();
});

Then('the crossword grid should be visible', async ({ page }) => {
	await expect(page.locator('article.svelte-crossword section.puzzle svg').first()).toBeVisible();
});
