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

One command runs every gate — the same one CI runs:

```bash
./scripts/quality.sh        # all gates, incl. e2e
E2E=0 ./scripts/quality.sh  # unit-level gates only
```

| Gate                                                                                    | Tool                                                        |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Lint / format                                                                           | `npm run lint` (prettier + eslint)                          |
| Types                                                                                   | `npm run check` (svelte-check)                              |
| Unit & component tests with coverage thresholds (`vite.config.ts`)                      | `npm run test:coverage` (Vitest, `@testing-library/svelte`) |
| CRAP ≤ 15 per function in the `.ts`/`.js` logic layer                                   | `node scripts/crap-check.js`                                |
| ≤ 150 lines per source file                                                             | `node scripts/check-file-lines.js`                          |
| State-machine catalogue is honest (`docs/state-machines.md`)                            | `node scripts/check-state-machines.js`                      |
| Production build                                                                        | `npm run build`                                             |
| End-to-end acceptance (Gherkin features in `e2e/features`, Playwright + playwright-bdd) | `npm run test:e2e`                                          |

Application logic belongs in `*.ts`/`*.js` helpers that are unit-tested directly;
components stay thin and are verified with render tests. Every mode/phase/status
is an explicit state machine with one owner — see `docs/state-machines.md`.
Note: test files for SvelteKit route files must **not** use the reserved `+`
prefix (name them `page.test.ts`, importing `./+page.svelte`).

### No flaky tests

There is no such thing as a flaky test here. A test that fails intermittently has
found a race — in the harness or in the app — and the race gets fixed. Nobody
re-runs to green, adds a sleep, raises a timeout, adds a retry or skips the test
(`playwright.config.ts` runs with `retries: 0`). The e2e harness waits on real
conditions (a locator, a store value, a recorded row) and never on time.
`AGENTS.md` carries the full rule.

### The fake backend (how e2e runs without AWS)

CI has no access to the production Cognito pool or the SQLite-on-EFS Lambda, and
must not depend on them. The e2e suite therefore runs against an in-process fake:

- `e2e/fixtures/amplify_outputs.e2e.json` — a fake Amplify config the CI build
  embeds (`cp` into `src/` before `npm run build`; `scripts/quality.sh` does this
  when no real file exists).
- `e2e/fake-backend/install.ts` — a Playwright `context.route` for
  `cognito-idp.*`, `cognito-identity.*` and `lambda.*.amazonaws.com`, installed by
  the `backend` auto-fixture in `e2e/fixtures.ts`, so no scenario can reach a real
  endpoint. It also offers `signInAs(user)`, which seeds Amplify's token store in
  `localStorage` so a scenario starts signed in without the login form.
- `e2e/fake-backend/fakeCognito.ts` — the User Pool actions the app uses
  (`InitiateAuth` SRP challenge, `RespondToAuthChallenge`, `GetUser`, sign-up /
  reset / sign-out) and the Identity Pool (`GetId`, `GetCredentialsForIdentity`),
  issuing unsigned JWTs Amplify decodes client-side.
- `e2e/fake-backend/fakeSql.ts` — the `sql-queries` Lambda contract over in-memory
  arrays (same payloads, same `{ statusCode, body }` envelope, same 0/1 booleans).
  Unit-tested in Vitest and covered like app code.
- `e2e/fake-backend/puzzles.ts` — the fixture puzzle set, each with the string a
  solver types to finish it. The fixture account is `ada@example.com` /
  `Password1!`.

Running `npm run test:e2e` against a real `src/amplify_outputs.json` works too:
the routes intercept by host, not by config value.

### UX walkthrough with evidence

`npm run test:walkthrough` (meant for the Mac mini) drives every flow through the
real app against the fake backend and writes screenshots, a video and timings to
`artifacts/walkthrough/`.

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

Make sure your `.env` file has `COGNITO_USER_POOL_ID` configured and `AWS_PROFILE=personal` is set;
SQL runs through the IAM-gated `admin-sql` Lambda against the SQLite database on EFS.

## Deploying

Deploy this application to your own AWS account in one click:

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/johnpc/svelte-crossword)
