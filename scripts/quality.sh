#!/usr/bin/env bash
# The full quality gate — what CI runs, and what you run before pushing.
# Every step must pass; fix the code, never loosen a gate.
#   E2E=0 ./scripts/quality.sh   skips the Playwright suite (unit gates only)
set -euo pipefail
cd "$(dirname "$0")/.."

step() { printf '\n\033[1;35m== %s ==\033[0m\n' "$*"; }

# The build embeds src/amplify_outputs.json. Without a real one (CI, fresh
# clones) the e2e fixture config is used: the fake backend answers everything.
if [ ! -f src/amplify_outputs.json ]; then
	cp e2e/fixtures/amplify_outputs.e2e.json src/amplify_outputs.json
	echo "Using e2e fixture amplify_outputs.json (fake backend)"
fi

step "Lint (prettier + eslint)";            npm run lint
step "Type check (svelte-check)";           npm run check
step "Unit tests + coverage thresholds";    npm run test:coverage
step "CRAP score";                          node scripts/crap-check.js
step "File length (150 lines)";             node scripts/check-file-lines.js
step "State-machine catalogue";             node scripts/check-state-machines.js
step "Build";                               npm run build
if [ "${E2E:-1}" != "0" ]; then
	step "E2E (Playwright + Gherkin, fake backend)"; npm run test:e2e
fi
printf '\n\033[1;32mAll quality gates passed.\033[0m\n'
