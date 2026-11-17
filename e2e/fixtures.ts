/**
 * Playwright test base for every Gherkin step file. The fake backend is an
 * `auto` fixture: it is installed on the browser context before any step
 * runs, so no scenario can accidentally reach a real AWS endpoint.
 */
import { test as base } from 'playwright-bdd';
import { createBdd } from 'playwright-bdd';
import { installFakeBackend, type FakeBackend } from './fake-backend/install';

type Fixtures = {
	backend: FakeBackend;
	/** Messages of every alert()/confirm() the page raised (auto-dismissed). */
	dialogs: string[];
};

export const test = base.extend<Fixtures>({
	backend: [
		async ({ context }, use) => {
			await use(await installFakeBackend(context));
		},
		{ auto: true }
	],
	dialogs: [
		async ({ page }, use) => {
			const messages: string[] = [];
			page.on('dialog', (dialog) => {
				messages.push(dialog.message());
				void dialog.dismiss();
			});
			await use(messages);
		},
		{ auto: true }
	]
});

export const { Given, When, Then } = createBdd(test);
