# svelte-crossword

This is an app for playing unlimited crossword minis, built with Svelte and AWS Amplify.

## Installing dependencies

To install dependencies, run:

```bash
npm ci
```

## Set up environment

You'll need to configure your environment variables. First copy from the example

```bash
cp .env.example .env
```

Then fill in the desired environment variable values. There should be comments in the `.env.example` file that indicate how to get the values that you should set.

## Developing with Amplify

First, you'll want to set up a development sandbox in your AWS account. You can do that by running:

```bash
npm run sandbox
```

in a terminal tab. This process will watch for changes in the `amplify/` directory and apply them to your AWS backend resources. This includes auth (Cognito), storage (S3), and api (AppSync/DynamoDb) resources.

Once your resources are deployed, a file named `src/amplify_outputs.json` will be written. Now your app will use the AWS resources you've just deployed.

Start by seeding your database:

```bash
npm run seed
```

## Developing Svelte

Start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Now you can open http://localhost:5175/ to see your app in action (including hot reloading as you update the source code).

## Testing strategy

Quality gates run in CI (`.github/workflows/ci.yml`) and locally via the npm scripts:

- **Unit & component tests** (`npm run test`) — Vitest, colocated as `*.test.ts`/`*.test.js`.
  Components are rendered with `@testing-library/svelte` (`vitest-setup.ts` wires up the
  jest-dom matchers and a Web Animations API stub for transitions).
- **Coverage** (`npm run test:coverage`) — Istanbul over `src/**/*.{js,ts,svelte}` with
  enforced thresholds in `vite.config.ts`. `all: true` instruments every included file so
  an untested file cannot pass at an implicit 100%.
- **CRAP score** (`node scripts/crap-check.js`) — flags complex, poorly-covered functions
  in the `.ts`/`.js` logic layer. (`.svelte` files are excluded: Svelte compiles each
  component into one synthetic instance function, so per-function complexity there reflects
  compiled-template size, not authored logic. Components are gated by coverage instead.)
- **Max file length** — 150 lines per source file (enforced in CI). Keeps components small.
- **E2E** (`npm run test:e2e`) — Playwright + Gherkin features in `e2e/`.

Application logic belongs in `*.ts`/`*.js` helpers that are unit-tested directly;
components stay thin and are verified with render tests. New components and helpers
should ship with a test — both the logic layer and `.svelte` components are gated by the
coverage thresholds. Note: test files for SvelteKit route files must **not** use the
reserved `+` prefix (name them `page.test.ts`, importing `./+page.svelte`), or the build
will reject them as malformed routes.

## Deleting User Accounts

To delete a user account (for GDPR/privacy requests):

```bash
# Dry-run mode (shows what would be deleted, but doesn't delete):
npx tsx scripts/delete-user-account.ts user@example.com

# Actually delete the account:
DRY_RUN=false npx tsx scripts/delete-user-account.ts user@example.com
```

This script will:

1. Find the user in Cognito by email
2. Find their profile and completed puzzles in the SQL database
3. Show what will be deleted (dry-run mode by default)
4. Delete all user data when `DRY_RUN=false` (puzzles first, then profile, then Cognito account)

Make sure your `.env` file has `SQL_CONNECTION_STRING` and `COGNITO_USER_POOL_ID` configured.

## Deploying

Deploy this application to your own AWS account in one click:

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/johnpc/svelte-crossword)
