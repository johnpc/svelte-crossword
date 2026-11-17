# UX walkthrough evidence — 2026-11-16

Recorded on the Mac mini (the CI runner) by `npm run test:walkthrough`
(`e2e/walkthrough/walkthrough.spec.ts`) against the fake backend, Chromium
1280×900. Screenshots are numbered in flow order; each `video-*.webm` is one
Playwright `recordVideo` of a flow; `timings.json` holds wall-clock waits for
the moments a person actually waits on (all under 300 ms).

| #   | Screenshot                       | What it shows                                                   |
| --- | -------------------------------- | --------------------------------------------------------------- |
| 01  | preview-loaded                   | Signed-out preview puzzle                                       |
| 02  | preview-check-marks-wrong-letter | `checking` tool mode: wrong letter slashed, Check highlighted   |
| 03  | preview-solved                   | `solved` phase: completion card + confetti, Continue in toolbar |
| 04  | preview-continue-toast           | Continue → sign-in toast (single toast container)               |
| 05  | login-form                       | Sign-in screen of the `auth-flow` machine                       |
| 06  | home-first-puzzle                | Signed in; newest unplayed fixture puzzle with title/author     |
| 07  | home-first-puzzle-solved         | Solved; one completion recorded                                 |
| 08  | home-second-puzzle               | Continue served the next puzzle                                 |
| 09  | home-all-puzzles-done            | `exhausted` phase                                               |
| 10  | history                          | `history-load` ready                                            |
| 11  | history-detail-revealed          | `history-detail-load` ready (bug fix: decoded `puz_json`)       |
| 12  | leaderboard                      | `leaderboard-load` ready                                        |
