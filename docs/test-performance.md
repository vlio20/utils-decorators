# Unit-test timer conversion (issue #186)

Measured on 2026-10-16, on branch `codex/3.0.0-documentation`, starting from
revision `39e87f051eec80d01fc899c49861d7576be6892b`.
Environment: macOS (Darwin arm64), Node v24.16.0, npm 11.16.0;
installed dependencies were unchanged between measurements.

Both measurements used `/usr/bin/time -p npm run test:unit`, with the default
Jest worker configuration. This command includes clean, TypeScript checks,
ESLint, Jest cache clearing, and Jest. Both Jest runs therefore started with
an empty transform cache. These are single local runs, not CI measurements
or incremental mutation runs.

| Measurement | Before | After | Saved |
| --- | ---: | ---: | ---: |
| Full `test:unit` command (wall time) | 7.68 s | 4.46 s | 3.22 s (41.9%) |
| Jest-reported time | 3.753 s | 1.283 s | 2.470 s (65.8%) |
| Passing suites / tests | 42 / 164 | 42 / 164 | — |

Converted retry, rate-limit, memoize, memoize-async, debounce, throttle,
throttle-async, timeout, delay, and task-exec tests to modern Jest fake timers.
Refreshable already used fake timers and explicit cleanup. The converted
suites discard remaining timers and restore mocks and real timers after each
test. Asynchronous timer advancement lets promise continuations run between
timer callbacks; sleeps inside simulated asynchronous methods remain timers.

Tests now check exact timing boundaries for retry delays, cache expiration,
debounce, throttle, delay, timeout, and task ordering. Nested callback tests
were rewritten as awaited assertions, including rejection handling before
advancing timers. The debounce instance test now spies on each separate
instance, and the rejected-cache test retries before expiry to check eviction.

Mutation tests were deferred during the initial timer conversion, per request.
No pre-optimization mutation baseline was recorded. The 95% score threshold
remains unchanged. Other test suites still using real timers are outside this
initial conversion group. Subsequent authorized mutation results appear below.

## Per-test coverage analysis

The next optimization changes `coverageAnalysis` from `off` to `perTest` in
`stryker.conf.js`. This allows the Jest runner to select individual tests
covering each mutant, in addition to its existing related-file filtering.
See the [Stryker Jest runner documentation](https://stryker-mutator.io/docs/stryker-js/jest-runner/#coverage-analysis).

Compatibility was checked with the installed Stryker Jest runner 10.0.0 and
Jest 30.5.2. A temporary Node harness applied the runner's own
`withCoverageAnalysis` configuration to the existing Jest configuration and
ran ordinary, unmutated tests in process. All 164 tests in 42 suites passed
using the existing TypeScript transformer. The harness observed all 164 test
start/end pairs through Stryker's `currentTestId` hooks and confirmed that
the test ID was cleared afterward. No repository test harness was added.

This compatibility check alone covered the environment and test lifecycle
integration. The subsequently authorized full mutation run below exercises
instrumentation and per-test selection as well.

## Incremental mutation results

`npm run test:mutation` now reuses results from
`reports/stryker-incremental.json`. The existing `clean` command removes only
`dist` and `.stryker-tmp`, so it preserves this file. The reports directory
remains ignored by Git.

Use `npm run test:mutation:full` to force all mutants to run and refresh the
incremental results. Run this after changing local dependencies, Node,
configuration, environment variables, or supporting files outside the source
and test files: Stryker's incremental comparison does not detect all such
changes. The initial unmutated test run is required even when all previous
mutant results can be reused.

CI restores and saves only the incremental JSON file. Its cache compatibility
prefix includes the runner OS and architecture, exact installed Node version,
and a hash of package metadata/lockfile, Jest configuration and transformer,
Stryker configuration, TypeScript configuration, and the workflow itself.
Source revisions and run IDs are included only in the unique save key, after
the compatibility prefix, so subsequent source revisions can reuse results.
Stryker compares changed source and tests against the restored report. There
is no broader restore prefix across incompatible configurations. A cache miss
falls back to a full run. Completed results are saved even when the mutation
score fails the threshold, provided a report exists and the job is not canceled.

Push and pull request workflows use incremental mode. No periodic checks or
additional workflow triggers are configured. Full runs remain available locally
through `npm run test:mutation:full`. CI behavior was initially checked by
parsing the workflow and checking matching cache prefixes and report paths.


## Authorized mutation measurements

Measured on the same local environment as above after implementing all three
optimization stages, with the 95% threshold unchanged. Both commands added
`--reporters progress,clear-text,html,json` to write local reports without
publishing to the dashboard. Times include npm and Stryker startup; these are
single runs, not CI measurements.

| Run | Command | Wall time | Results reused | Score |
| --- | --- | ---: | ---: | ---: |
| Full, no incremental results present | `npm run test:mutation:full` | 90.31 s | 0 / 587 | 96.55% |
| Warm, unchanged source and tests | `npm run test:mutation` | 3.78 s | 587 / 587 | 96.55% |

The unchanged incremental run saved **86.53 seconds (95.8%)** versus the
optimized full run. Both initial unmutated runs passed all 164 tests.
The complete file/ID/status lists matched between full and incremental reports:
524 killed, 36 timed out, 19 survived, 1 uncovered, and 7 runtime errors.

The runtime errors came from deliberately invalid mutations in task-exec
(4: invalid task objects or removing the empty-queue guard) and rate-limit
(3: validation failures while defining the suite's decorated class). Some
of the task-exec mutations crashed workers, which Stryker restarted. Runtime
errors are excluded from Stryker's score; they are not counted as killed.
They remain visible in the HTML/JSON reports rather than being suppressed.
There is no earlier mutation report to establish whether these outcomes
changed because of the timer conversions or per-test coverage analysis.

The full and incremental runs both exited successfully and exceeded the 95%
threshold. No claim is made about full-run improvement versus the original
revision, because mutation testing was initially deferred and no baseline
exists. The HTML report is at `reports/mutation/mutation.html`; the JSON
report is at `reports/mutation/mutation.json`.
