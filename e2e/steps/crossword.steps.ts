import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, Then } = createBdd();

Given('the user navigates to the home page', async ({ page }) => {
	await page.goto('/');
});

Given('the user navigates to the about page', async ({ page }) => {
	await page.goto('/about');
});

Given('the user navigates to the preview page', async ({ page }) => {
	await page.goto('/preview');
});

Then('the page should load successfully', async ({ page }) => {
	await expect(page).toHaveTitle(/.*/);
	const body = page.locator('body');
	await expect(body).toBeVisible();
});

Then('the about page should display content', async ({ page }) => {
	const body = page.locator('body');
	await expect(body).toBeVisible();
});

Then('the crossword grid should be visible', async ({ page }) => {
	const grid = page.locator('svg, .crossword, [class*="crossword"]').first();
	await expect(grid).toBeVisible({ timeout: 10000 });
});
