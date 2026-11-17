# AGENTS.md — operating rules for anyone (human or agent) changing this repo

This file is the contract on top of `README.md`. Read both before touching
code. The director owns WHAT ships; implementation decisions are yours, within
these rules.

## 1. No flaky tests. Ever.

An intermittent failure is a **bug in the harness or the code**, never bad
luck. When a test fails sometimes:

- Find the race and fix it. Wait on real conditions (`expect(locator)…`,
  `expect.poll`, an event, a store value) — never on time.
- Never re-run to green, never add `sleep`/`waitForTimeout`, never raise a
  timeout to hide a slow path, never add retries, never `skip`/`only`.
- `playwright.config.ts` has `retries: 0` on purpose; keep it that way.
- The unit suite runs with fake timers where time matters; the e2e suite
  waits on DOM/network/store conditions only.

If you cannot find the race in the time you have, delete nothing, loosen
nothing — report it as a known failure with the evidence.

## 2. One mode, one owner (state machines)

Every mode/phase/status is a discriminated union written in exactly one
place; components send events and derive. The catalogue is
`docs/state-machines.md` and `scripts/check-state-machines.js` enforces it:
owners carry `@state-machine <id>` markers, every marker has a row, and the
retired hacks (`$$.ctx`, `{void …}` in markup) are banned. Adding a flag that
describes "which situation are we in" means adding a variant or a row.

## 3. Quality gates are the definition of done

`./scripts/quality.sh` is what CI runs. All of it must pass locally before a
push: prettier + eslint, svelte-check, Vitest with coverage thresholds, CRAP
≤ 15 per function, 150 lines per source file, the state-machine catalogue,
the production build and the Playwright + Gherkin e2e suite. **Fix the code,
never the gate**: no threshold lowered, no exclusion added, no step skipped.

## 4. The backend is faked in CI — on purpose

CI cannot reach the real Cognito pool or the SQLite-on-EFS Lambda, and must
not depend on them. `e2e/fake-backend/` answers every Cognito / Cognito
Identity / Lambda request in-process (see README "Testing strategy"). Keep it
honest: when the real `sql-queries` contract changes, change `fakeSql.ts`
and its tests in the same PR.

## 5. Verification happens on the Mac mini

Unit gates run anywhere, but the real-UX check runs on the mini
(`runs-on: [self-hosted, mac-mini]` is the same machine): sync the tree, run
`./scripts/quality.sh`, then `npm run test:walkthrough` for screenshots, a
video and timings under `artifacts/walkthrough/`. Look at the screenshots.
Attach them (or a link) to the PR.

## 6. Conventions

- Conventional commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`,
  `ci:`, `chore:`); PR titles `type(scope): what`.
- Logic lives in `.ts`/`.js` helpers with unit tests; `.svelte` files stay
  thin and are covered by render tests.
- Don't name test files for SvelteKit route files with the `+` prefix
  (`page.test.ts`, not `+page.test.ts`).
