# Interface verification and external evidence

Interface CI runs `npm test -- --all-script-tests` to execute each script
suite once before the typed runtime tests. Plain `npm test` runs the Contracts
consumer and bootstrap checks before the runtime tests. The AST checker and
clean release export remain separate gates.

## 2026-11-05 canonical 0.1.4 source verification

A fresh external copy of the reviewed working tree selects canonical
`@cirnet/contracts@0.1.2`, its same-source `cirnet-contracts` sdist and independent
`@cirnet/artifact-paths@1.0.0-m1.0`. All three SHA256 pins were checked against
producer bytes before bootstrap; both npm SHA512 integrity values were
recomputed from their tarballs. Regenerating the npm lock preserved every
third-party package record. Published earlier artifacts were not modified.

A separate fresh bootstrap downloaded all three inputs from the published
Contracts 0.1.2 numeric asset URLs now recorded in the lock; their SHA256 values
and package identities match the selected producer bytes. CI no longer selects
these URLs through repository variables. Explicit operator URLs must match a
tracked URL, and the authentication/redirect transport regressions pass.
The compatibility descriptor pins Remote API source
`ce84ec4cf3602ef6fd001f91877e864c8955f9c7` and its exact OpenAPI digest.
Both complete npm archives, all 203 generated test/helper `.mjs` bundles, four
native helper `.mjs` bundles and the Git-exported candidate static payload were
scanned with no former-owner package-scope references.

On Windows, Node 26.12.1, bundled npm 11.20.0 and Python 3.14.4, fresh bootstrap
and `npm ci` pass. All **31/31 script tests**, **1,498/1,498 runtime tests**,
unit types, E2E types and **229-module AST boundaries** pass with no test skips
or failures. The production build passes and includes all three entrypoints.
The script suite includes clean-export reproducibility and rejects stale product
versions, alternate package identities, arbitrary static roots and missing pages.
Browser workflow source imports are covered by the canonical dependency scan.
The official clean-export builder also passes from an owned synthetic Git
snapshot, including a second fresh install and all three static entrypoints.
That snapshot revision is verification provenance only; publication requires
rebuilding from the real reviewed product commit.

These results describe the reviewed working tree and an isolated build, not a
new full browser acceptance run or published release. Historical committed
release and browser evidence below retains its original versions and hashes.

## 2026-11-04 complete committed-artifact Ubuntu acceptance

The frozen functional source is `6c150f34193bb3b009046cbaa586fae0260560f4`.
Two independent official clean Git-export/bootstrap/locked-install/production
builds produce the same 0.1.3 source/static bytes. Source SHA256 is
`41273280dfc3934c33f7d6ae7fb5c0d4f76d92a9e8b31dd4b6c50c164449b2e3`
(2,425,434 bytes); static SHA256 is
`5a4e53f118a9195fae27f55bb9a886fef229991cff835699aaf6e257c1341089`
(2,193,267 bytes). Fingerprint:
`b7d0c0e4485a4b8906377d920c6850b820aae063abbba07cb98c301bb2848a3a`.
All 581 committed payload files plus generated source metadata match Git; the
582 source/35 static members are regular and root-safe, with three entrypoints.
Build receipt SHA256:
`333a1da7bbdb665e53cabf07a9ca183f793bb65bba6e183c19a9cd94037a609c`.

The complete fresh Node 22.23.3 suite passes **1,497/1,497** runtime tests, ten
Contracts prechecks, unit types and 184 freshly compiled bundles, with zero
failures/skips. All 517 compiler/source inputs remain unchanged. The focused
cookie regressions, E2E types, prior 27 script checks, 229-module boundaries and
production builds pass. Final unit receipt SHA256:
`39ba8d0ba2b0ba7c3043b31063106e6f6de68085fc5ec61f25ee33e24419d531`.

Remote's standard browser group uses these exact committed archives with exact
published API/Contracts/Simulator/Hardware 0.1.1 wheels on Ubuntu 24.04.5,
Python 3.12.3, Node 22.23.4, four CPUs and pinned Playwright 1.64.1 / Chromium
1248. All three commands pass, exit zero, in 2,415.2 seconds. JUnit reports
**57 PASS, 0 FAIL/ERROR, 1 original optional historical capture SKIP**, 58 tests
total. The interval is 2026-11-04 12:14:55–12:55:10 UTC
(19:14:55–19:55:10 UTC+07), within the original 90-minute job envelope.

Both current depth matrices execute all 30 poses with zero pixel changes:
2,349,652 tested positions at DPR 1 and 9,399,115 at DPR 2. All five formerly
failing cases pass in the same full run: DPR 2 202.094 s / 360 s, multiview
130.932 s, component closeups 110.195 s, Cancel 10.929 s and release 11.327 s.
The corrected authentication case passes against the immutable legacy API.
Workers, retries, deadlines, DPR, rendering assertions, tracing, assets and
baselines are unchanged; the explicit cookie-name boundary correction below
retains every original privacy/security assertion for every recognized alias.

All source/static/Remote/API payloads and selected archive hashes are unchanged
afterward. API shutdown exits zero; no active owned services or test listeners
remain. JUnit SHA256:
`38db5ac27ebdf66f5f526fda92c4fabc21026759deaaa4080f3e4b836c658909`.
Log SHA256:
`7e0351b2005a081e4be0c7fbdd31e5eca552d671c0641b77eda5c9fdaf00dad5`.
These completed local software results do not claim a later hosted Actions
outcome, physical hardware capability or deployment acceptance.

Six representative success visuals were inspected and final acceptance receipt
SHA256 is `ba6f5958951219c7c8fcfd85a7e790a6a9e71bd82fa6f8a97f4e267c31f90ba2`.
[Interface v0.1.3](https://github.com/CIRNETLAB/CIRNET-Interface/releases/tag/v0.1.3)
is published at the frozen functional source; source/static asset IDs are
`709523575` / `709523651`. Anonymous re-downloads match both sizes/digests and
pass Remote's strict source/static provenance and extraction checks. Existing
0.1.1/0.1.2 assets remain immutable. This documentation continuation preserves
the tested source commit and archive bytes.

## 2026-11-04 published-API cookie compatibility

The complete-suite attempt on committed candidate `595d25f` exposed an additional
auth assertion error: login and explicit guest transfer succeed, but the test
looks only for `cirnet_session`. The immutable selected API 0.1.1 wheel emits
`netcircuit_session`; current Remote source emits both aliases with the same
credential. The trace confirms the legacy cookie is HttpOnly, SameSite=Lax and
Path=/, and its successful administrator screenshot was inspected. The failed
candidate was stopped through normal Playwright teardown rather than promoted;
its full gate is NOT_COMPLETED, not PASS.

The test now selects every reviewed alias without changing cookies or their
attributes. It rejects absent/unrelated-only, duplicate, empty and mismatched
dual credentials. Every selected cookie still receives the original HttpOnly,
Lax, root-path, no-JavaScript-exposure and no-storage-credential assertions.
The selector regression was RED (one PASS/eight FAIL against the canonical-only
predicate), then all nine cases and two existing namespace tests pass, together
with ten Contracts prechecks and E2E types. Weak attributes remain visible to the
real assertions. This changes the supported cookie-name boundary only; no API,
backend, timeout, DPR, retry, rendering assertion or baseline changes.

## 2026-11-04 initial 0.1.3 artifact builds (superseded candidate)

Two independent local builds from clean Interface commit
`2fe7cba5252087af033202183ef242a4be5152cc` produced byte-identical source and
static archives with Node 22.23.3 and Python 3.14.6. Each invocation of the
committed `scripts/build_release.py` used a separate fresh Git export,
digest-verified Contracts 0.1.1/DEV archives, a clean locked `npm ci` and the
three-entrypoint production build. Existing checkout dependencies, ignored
bundles and the earlier source overlays were not build inputs.

| Superseded candidate archive | Bytes | SHA256 |
| --- | ---: | --- |
| `cirnet-interface-0.1.3-source.tar.gz` | 2,421,634 | `b46cb91aca33f38a3c355ba5074fb2673a822e936e7a7ec5ca2dbcc9f9029dee` |
| `cirnet-interface-0.1.3-static.tar.gz` | 2,193,267 | `5d9e4f12302d6205c794741d86a49080e33b6b08472550db3c994f9532ccfc7a` |

Both archives identify Interface 0.1.3 and Contracts 0.1.1, with source
fingerprint
`08e30b6d5afffadc9f26d9eaf1e49b7b7caeb59b9e62f2870c60030e4722d27d`.
Inspection verifies 580 source and 35 static regular, root-safe members. The
579 source payload files match the exact committed Git archive; the additional
file is generated provenance metadata. All three HTML entrypoints are present.
The clean checkout and three read-only SDK input digests remain unchanged.
The deterministic-build receipt SHA256 is
`a618dad644240e1841228658651b70dfd3bbefd24c9dc6b64bde9d63a4b0dd0e`;
the first local artifact-manifest SHA256 is
`a1061346e4d0c259e18c1bdc81bc1e80e45fb4c9032c1a2d947672cef05911b6`.
Raw build logs and both artifact sets started in the shared external session
owned by `cirnet-browser-actions-20261104`.

A subsequent metadata audit found that this commit's product compatibility
self-descriptor and CI artifact label still identify 0.1.2. These local bytes
are therefore superseded; the descriptor/label correction requires a new clean
committed build before the complete 58-case Ubuntu gate. The hashes above do
not identify that replacement candidate. Complete committed-artifact browser
acceptance and publication remain pending. Existing published 0.1.2 assets and
tags retain their original bytes and provenance.

## 2026-11-04 browser CI responsiveness candidate

Remote [browser job 126472787919](https://github.com/CIRNETLAB/CIRNET-Remote/actions/runs/41799887701/job/126472787919)
used Remote `685c365770b9831f3f0fd24cc7bae6496a79bae4` and the immutable
Interface 0.1.2 source at `a14d0950e71a997e2219a32f7268fd0e9d6502b3`.
It completed with 52 PASS, 5 FAIL and 1 SKIP. The downloaded failure artifact's
SHA256 is `e8cadc965011e6b70dbc1954dfb71ff09b16b708b1c7d22a4e5748b71bd50bab`.
Its traces, error contexts and failure screenshots were inspected outside Git.
These are historical hosted results, not results for Remote `a46db65`.

Both ribbon cases initially reach Cancel. Their held physical-preview request
then aborts after 12,088.8 ms while native Run-tab interactions take 3.95–7.92 s.
The unchanged API timeout is 10 s; the delayed timer clears `preparing`, so the
second loop finds Run and the existing timeout alert instead of Cancel. The
expanded failure drawer rules out lost toolbar ownership. Both placement cases
also show render backpressure: their inspected final snapshots contain the
correct TOP/isometric orientation, after the 10 s assertion budget expired.

The candidate removes native redraws for DOM-only drawer obstacle/reserve
changes. Post-commit watches and the drawer observer refresh layout data
immediately. Navigation still receives its current reserve and report; actual
graph/camera frames, camera/projection, pivot-anchored gizmos and disposal are
preserved. Independent source review found no actionable issue.

The new scene regression was RED before the fix (one unexpected queued draw).
Focused verification passes 78 cases. The complete compiled runtime suite then
passes all 1,477 tests with no failures/skips, using verified Node 22.23.3 and
the unchanged 182 bundles and `--test --test-concurrency=2` command. A preceding
restricted run remains recorded as FAIL (1,470 PASS, six loopback failures,
one privilege skip); native execution resolves those host restrictions without
changing tests. Types, AST boundaries and all three production entrypoints pass.

A separate physical copy of the reviewed product received only the recorded
source overlays and truthful `uncommittedMigration=true` candidate metadata.
Its original four UI cases pass through the standard Remote integrated runner:
multiview 96.526 s, closeups 70.803 s, Cancel 7.929 s and release 8.192 s; zero
failures/errors/skips. This run used Windows, Python 3.14.6, Node 22.23.3 and the
exact Playwright 1.64.1 Chromium 1248 runtime. The complete owned browser copy's
ten executable hashes match its input, with a maximum path of 222 UTF-16 units.
The 1920-wide multiview and standing-resistor screenshots were inspected.
All 572 baseline source members and all 26 E2E/config payloads remain unchanged.
The owned backend/browser/helper processes exited and all three test ports were
free afterwards. This is unpublished functional-candidate evidence; it does not
change the selected release or establish hosted/physical hardware acceptance.

The API timeout, original E2E assertions, viewport/DPR matrices, deadlines,
workers, retries, tracing, render quality, source assets and baselines remain
unchanged. Raw diagnostics use the shared external session owned by
`cirnet-browser-actions-20261104`, protecting Remote and Interface. Only this
canonical Markdown evidence belongs in source.

The depth observer's PSU closeup also spends most CPU time in native triangle
intersections. A mesh-world-box spike preserved all 172,706 first hits but saved
only 4.2%, so it was not adopted. The retained optimization uses conservative
contiguous 64-triangle blocks, calls Three's unchanged native raycast kernel in
original order, and restores each original geometry draw range in `finally`.
Custom/deformed/instanced/skinned/material-array/unsafe inputs retain the native
fallback. Bounds are observer-owned; null shared geometry bounds and later
prototype overrides have explicit regressions. Independent review identified
those two edge cases before adoption; both were reproduced RED and corrected.
The focused real-geometry suite passes all 11 tests.

The full-analysis reference, GPU captures, all pixel positions, foreground rays,
edge erosion and full-framebuffer restoration remain authoritative. The native
proof passes all 78 cases: 11,850,288 tested pixel positions match exactly,
every full restored framebuffer is identical, and 194,249 first hits match the
native object, distance, point and face index. Both positive controls still
detect the original 11/328 leaks. All four exception/scissor/material/callback
restoration guards pass; restored DPR 1/2 screenshots were inspected. The proof
receipt SHA256 is
`948652299e96a371ea405953e016f7912657475d93f7f13d791c74899acb4834`.
An independent six-pose PSU oracle measured 40.39% / 41.27% less ray CPU time at
DPR 1/2, with 172,706 exact native hit comparisons. This is bounded diagnostic
performance evidence, not a substitute for the original 360 s DPR 2 gate.

Patch packaging advances only Interface to 0.1.3; Contracts remains 0.1.1.
The clean-export builder regression was RED (four failures/one pass), then
passes all five cases, including deterministic source/static archives, stale
output exclusion, clean committed provenance and all three entrypoints. The
published 0.1.2 bytes/tag remain immutable. The user's prior post-Ubuntu
promotion/publication authorization applies to a new patch, never replacement
of an existing asset; final promotion remains gated on actual Ubuntu acceptance.

The unchanged original native DPR 2 regression also passes independently:
30 poses, zero leaks, one PASS/no FAIL or SKIP in 209.772 s within 360 s. Its
standard real-service runner exits zero and closes all owned processes/ports.
JUnit SHA256:
`f9d8266952308ebe1576759308621b2fcf302700251f57850417cd19a1366c02`.

The full current 0.1.3 working tree then passes the five original failing cases
on genuine Ubuntu 24.04.5, Python 3.12.3, Node 22.23.4 and exactly four CPUs
(0–3), using the selected published API/Contracts/Simulator/Hardware wheels and
owned Playwright 1.64.1/Chromium 1248 copies. The original settings/assertions
are unchanged: five PASS, no failures, runner exit zero, clean API shutdown;
wall interval 2026-11-04 11:30:05–11:39:07 UTC (18:30:05–18:39:07 UTC+07).
This is explicit unpublished-candidate verification. The separate complete
browser gate on the exact committed source archive remains a promotion check.

Final combined Node 22.23.3 verification passes the complete fresh `npm test`:
unit types, ten Contracts prechecks, 183 rebuilt bundles and all 1,488 runtime
cases (zero failures/skips). All 27 script tests, 229-module AST boundaries,
E2E types and the three-entrypoint production build also pass. An initial
unit-type TS2352 failure in the new private-kernel regression remains recorded;
only its explicit type assertion was corrected before the full successful
rerun. The final receipt SHA256 is
`e3c2e6c48f48e52e3d2a6484641a023824ece1a2126213fb604d5a9eef0dd230`.

Ubuntu JUnit confirms five tests, zero failures/errors/skips: DPR 2 246.198 s
within 360 s, multiview 138.317 s, closeups 125.094 s, Cancel 10.908 s and release
10.827 s. JUnit SHA256:
`b0680a0071c571b61f139472a4ecccf07b8a89e3d2451ae7b8769fe5c5e4d501`.

## 2026-10-29 wire-edit hover continuation

`hoverWireEdit(null)` still scheduled a draw on every canvas leave, including
when no wire, bend or segment hover changed. WireLayer now reports semantic
changes while retaining its existing outline, handle and segment updates;
SceneManager calls all three updates and schedules only when one changed.
Selection resets remain authoritative. Graph/camera frames already pending
remain scheduled; geometry, graph data and camera state are preserved.

The focused regression was RED against `f6c8d273`: four failures exposed repeated
idle, bend, segment and cleared-wire draws. After the repair all nine focused
tests pass, together with ten Contracts checks. AST boundaries (229 modules) and
E2E types pass. RED log SHA-256
`96771dd03dd26c1dadc280a2cf16756dac322992bfa4f6c87c33b518d08008a1`;
GREEN `f18c84b89ba5e60ea1b78e9796a736e7bde82cc0d4537ab5ab196d248ce16c06`.
Independent review found no blocking issue. All 7,569 original ignored files
retain their recorded size/mtime inventory; browser cases/configuration,
assertions, DPR, deadlines, retries, traces and baselines are unchanged.

Full type/unit execution collected 1,470 cases: 1,463 passed, six loopback
fixtures failed with sandbox `EACCES`, and one directory-symlink fixture skipped
for host privilege. The unchanged three affected test files then passed all
19 cases with zero skips outside those restrictions (log SHA-256
`88ca3fa01bd45478d34271c0c88ce73cf1fce6f5ab7ea1811c40cd6e05b10715`).
All cases are covered across these invocations; the first run remains recorded
as failed. All 16 managed Markdown files and the worktree/index artifact guard
also pass. Existing ignored installation/output directories were not inputs.

Evidence originates in the fresh shared session owned by
`cirnet-m6-release-20261029`, outside all six Git roots. This focused result does
not establish full native acceptance. The unchanged full Chromium comparison
also failed the original LED export deadline, so no channel change is adopted.
Fresh committed artifacts and actual Ubuntu acceptance are tracked in Remote's
existing M6 verification ledger. The user's latest sequencing decision permits
ordinary promotion/publication after that local acceptance without waiting for
further Actions; pending or earlier failed hosted results remain explicit.

Authority: [Remote Lab-First architecture](https://github.com/CIRNETLAB/CIRNET-Remote/blob/745077403f233790bdb6781c36d6502feca01642/docs/ARCHITECTURE.md). [Remote output policy](https://github.com/CIRNETLAB/CIRNET-Remote/blob/745077403f233790bdb6781c36d6502feca01642/docs/VERIFICATION.md) governs this extraction.

Bootstrap the reviewed versioned artifacts before installing dependencies or running checks. Node and Git are required by the canonical allocator. Interface `scripts/artifact-paths.mjs` delegates to the independently versioned DEV package; it has no separate path algorithm. Diagnostic files must start outside every checkout/worktree/Git directory, including aliases. Only Markdown evidence belongs in source. Preserve source assets, historical evidence, protected markers and baselines.

For integrated work supply `NETCIRCUIT_ARTIFACTS_CONTEXT` JSON with an owner and all participating absolute Git roots before allocating; children and cleanup inherit it. A standalone checkout needs its own Git root. Reuse `NETCIRCUIT_ARTIFACTS_SESSION`; set TMP/TEMP and npm cache to owned children. Configuration/permission failures fail closed; never write temporary evidence into source. The ignored `.artifacts` files are digest-verified dependency archives, not diagnostic logs.

Required checks are clean bootstrap/npmci, unit/type checks, AST boundaries and multipage production build. E2E TypeScript includes base/camera/depth configs. Remote starts the real backend with an explicit Interface product path; Interface receives an explicit API target/admin secret and an owned restart-control directory. Keep origin127.0.0.1:14173 and the same-origin proxy so cookies, CSRF and WebSockets retain meaning. Missing backend/hardware does not become simulated success.

Before launching, physically copy the complete installed Playwright cache into the owned external session, dereferencing links and excluding only old debug logs and `.links`. Preserve binaries/resources/helpers and exact revision. Windows executable paths must be at most259UTF-16 units (260rejects before copy/launch). Select only the owned copy through PLAYWRIGHT_BROWSERS_PATH. Base, camera and depth outputs/reporters use the shared allocator. Do not run a browser directly from the installation cache: executable-adjacent GPU logs can ignore log flags.

Inspect real screenshots/traces/logs before making claims. Record source revision/dirty state, scenario, commands, environment/browser/executable hash, PASS/FAIL/SKIP/NOT_RUN, limits and physical before/after output inventory. Functional software tests do not establish electrical safety, analog acquisition or deployment. Use actionlint1.7.12 for workflow syntax. After all owned browser/API/helper processes exit, clean only the owning session with `node scripts/artifact-paths.mjs --cleanup ABSOLUTE_SESSION`; keep installation caches and source artifacts. Do not delete or relocate historical Markdown/evidence without the user's decision.

Server-route document command regression and its focused RED/GREEN evidence: [2026-10-28 hydration correction](../migration/server-route-hydration.md). Full browser acceptance remains a separate gate.

Working-copy text loss during unrelated renders: [2026-10-28 input-draft correction](../migration/input-draft-rerender.md). It preserves change-time validation/history and records native focused results separately from full artifact acceptance.

Linux compositing flag selection and its partial diagnostic result: [2026-10-28 browser compositor diagnostic](../migration/linux-browser-compositing.md). The [depth observer proof](../migration/depth-observer-roi.md) records 78 exact pixel-equivalence cases, four restoration guards and the unchanged original DPR 2 test passing within 360 seconds. Hosted Linux and full committed-candidate acceptance remain separate gates.

## 2026-10-29 CIRNET namespace candidate

The current repository is `CIRNETLAB/CIRNET-Interface`; current authority links, product display titles, package repository metadata and the integration owner use the confirmed six-repository namespace. Local checkout directories, `@net-circuit/web@0.1.1`, `@tinihi-labs/contracts@0.1.1`, DEV tooling, imports, `NETCIRCUIT_*`, protocol identifiers and artifact filenames retain their compatibility identities. Historical migration records, pinned revisions, LICENSE, original model artwork and baselines retain their recorded bytes and names. CI checkout is repository-relative and artifact URLs come from configuration; workflow identity and read-only permissions are unchanged.

The release downloader regression reproduced a real rename path: a GitHub asset request returns HTTP 301 to `/repositories/<numeric-id>/releases/assets/<numeric-id>`, where dropping binary Accept returns JSON metadata and fails the reviewed checksum. The new existing-suite regression was RED before the fix and GREEN afterward. The downloader preserves `Accept: application/octet-stream` only for validated HTTPS GitHub API asset routes; every redirect drops credentials. Manual redirects, bounds, digest validation and cross-origin credential stripping remain enforced. RED log SHA256 `138d5a09b6a415819599cea25ce06856e1e8d8064ea660395d1d2cc730b061a1`; GREEN `2d4680716a5225d94b2053a44e5416640c03c74a12378c5358782fda2441ca7c`.

Verification used a physical export of the uncommitted candidate based on `7a266d15b510d840ad3146515a3699760564ed32`, outside every Git root, with local Node 24.20.0 and exact local Contracts artifacts. Hosted CI pins Node 22. Clean bootstrap/npmci, all 22 script tests, AST boundaries, the 10 Contracts checks and 1461 TypeScript/unit tests, E2E TypeScript, and all three production entrypoints PASS. An initial full run had 1460 PASS and one old display-name assertion failure; that existing ownership assertion now checks the approved CIRNET title and the complete rerun has 0 FAIL/0 SKIP. Actual anonymous downloads from the canonical CIRNET-Contracts namespace verify all three locked SDK/DEV artifacts; the historical 301 path also returns the exact locked archive. This proves public package reads, without claiming the identity of a hosted CI secret. Fresh committed-source and native browser acceptance remain separate gates.

Raw evidence is owned by `m6-promotion-20261028-f79860e8` under `C:/Users/trann/AppData/Local/Temp/netcircuit-t9FxuU/interface-rename-validation/1dccaacb`. Initial script/boundary receipt SHA256 `b1d4b400cfb9ae6924f4827b0ce452860cea65858450eb9359644f415d3653b8`; successful full rerun receipt `cecf3cbd97460575af9b7d7505d53146489db59a4cb8e3e242fc16baff611482`; actual public download receipt `582118a13443ce2b8243349357dd07ba6c2c12c05cc05e610f9b2a25d5b6c0f0`. Temporary diagnostics and dependencies were created in that owned physical export; original ignored installation/output directories are not verification inputs.

The candidate static output differs from the immutable published 0.1.1 static artifact: both contain 34 product files, 24 remain byte-identical, 8 retained paths change and two hashed chunk paths replace two previous names. All three HTML titles show CIRNET. Comparison receipt SHA256 `0e3cdd042c2d1383f50c7eb9149624644e2409ef3e082e7622ac5af683abab10`. These are candidate bytes, not a rebuilt or published release. Existing 0.1.1 assets/tags remain unchanged; publishing new bytes requires the user's explicit release/version decision.

The preceding hosted Windows baseline [run 40725519551](https://github.com/CIRNETLAB/CIRNET-Remote/actions/runs/40725519551) used Remote `23ca0827d94d54bff34ffd2d47286d414553bf26` and the old published Interface `7a266d15b510d840ad3146515a3699760564ed32`. It was CANCELLED after 90m39s; the log contains eight reported failures and starts 55/58 cases, with no final JUnit emitted. Its 4-CPU/16-GiB resource record and 606134998-byte artifact were collected and a native QUAD screenshot inspected. Collector receipt SHA256 `2effc3c6124ffee4d77dfcec4fd82f478a21a083ff150dad7855e9e7d2dd22ee`; artifact SHA256 `e7c3f06ecd0bcd96fb2ce89f3e8e1405cca27288dcbcb8ed14c84d31526501d1`; inspection `d0a5fdfe3f4db771aa8694a7feb47f0939326e1de9da2fa0b1049675cd1b1614`. This is failed historical evidence, not acceptance of the current namespace candidate. Rendering assertions, DPR, budgets, workers, retries, flags and baselines were not changed by this work.

## 2026-10-29 unchanged hover rendering

Idle pointer movement previously requested a full GPU frame for every unchanged endpoint, wire and gizmo hover. The fix preserves picking, placement capture/reset, gizmo paint and wire-outline refresh; it schedules a frame when their effective hover identity changes. An empty endpoint clear returns only when no pin highlight or contact marker is active. Existing graph/camera frames stay scheduled. No shaders, shadows, render flags, DPR, test budgets/retries, screenshots or historical baselines change.

The six focused regressions were RED against Interface `631d41b36f0cdbaf1aafe6510baf2ddd514f306c`: five failures exposed 20 redundant frames or one redundant placement-clear frame; the pending graph/camera control passed. All six pass with the fix. Genuine wire/contact/gizmo enter/exit appearances, physical pin clearing, placement capture and graph truth retain their behavior. Source and differential driver received independent review with no actionable findings.

A bounded native differential compared the reference and candidate in separate real WebGL pages using production renderer defaults: `preserveDrawingBuffer=false`, `shadowMap.autoUpdate=true`, DPR 2 and the unchanged SwiftShader/trace settings. Two full normal warm frames were stable in each page. All 17 scenarios matched every full 2560x1440 RGBA byte, camera state, owned resources and actual renderer counters. Twenty real trusted empty-pointer events caused 20 reference draws and 0 candidate draws. Across the measured scenarios, actual SceneManager draws were 74 versus 12; this is a draw-count result, not a measured wall-clock improvement. Genuine hover transitions still drew; repeated wire/handle identity did not. Pending graph/camera frames and invisible placement-capture/reset behavior remained intact. The native screenshot was inspected.

Raw receipt: `C:/Users/trann/AppData/Local/Temp/netcircuit-t9FxuU/hover-native-parity/cef213a2/HOVER_NATIVE_RECEIPT.json`, SHA256 `f1222de253957422797724da2ce36c7c68e12e88b8fef440009b1a7bccef34c3`; inspection `26d9084115290b98fbd7a7a6a32e6a0652c95b87be238d6c503c48bf167f8b47`. The process closed successfully; all diagnostics began outside Git. This bounded SceneManager proof does not establish the full 58-case editor/API browser gate or release acceptance.

Fresh public-artifact bootstrap and clean `npm ci` also pass in a physical export based on `631d41b36f0cdbaf1aafe6510baf2ddd514f306c`, with local Node 24.20.0 and Python 3.12 release tooling. All 22 script tests, the 10 Contracts checks and 1467 TypeScript/unit tests pass with 0 FAIL/0 SKIP; AST boundaries, E2E TypeScript and all three production entrypoints pass. Gate receipt: `C:/Users/trann/AppData/Local/Temp/netcircuit-t9FxuU/interface-hover-validation/9449ef91/GATES.json`, SHA256 `752b614c12eff66bf1ffde095c60bcca0577ebdf6eb47bbdaa036df25cfa28b6`. Only Markdown evidence was added to source; fresh committed-candidate packaging and the full browser gate remain subsequent checks.

The separate ray-memoization experiment was rejected: normal PSU/BOARD cases preserved pixels but provided no speed benefit. Its additional BOARD positive-control full-frame mismatch remains recorded, without relaxing that assertion. The proposed bounding-box acceleration was also rejected because the existing recursive pose bounds already enable Three's mesh bounding-box checks. Neither experiment is part of this source change. Existing 0.1.1 published assets/tags remain immutable; new candidate artifacts require a separate release/version decision.

## 2026-10-29 integrated post-commit browser verification

The original full three-command browser gate passed against committed API `28221a5ca19d04225e9399895764a12149188681` and Interface `461b0870dbe7975d6bfdf336c6d5ef87e72c8970`: **58 collected, 57 PASS, 0 FAIL, one unchanged historical optional NOT_RUN** (`retained pre-fix native WebGL evidence`). Exact original case IDs and order matched. The explicit unpublished local selection retains published Contracts/SDK/Simulator/Hardware/FPGA/DEV and all 15 rollback artifacts; strict Interface SDK pins are unchanged. Fresh isolated Python/npm installs and the official artifact installer selected the new API wheel/source product directly. No source overlay or retained API fallback was used.

Local environment: Windows, 16 logical CPUs, 34049417216 bytes physical RAM, Node 24.20.0, Python 3.12.12 and Playwright 1.64.1. Chromium executed only from its complete owned physical copy (binary SHA256 `f77d8e27c8db1e4ac0399459a00e0c97bb9417adc393474cabaffebe2314ecb0`). All 26 original E2E/config payloads remained byte-identical; worker 1, retries 0, DPR, case deadlines, trace, native rendering and baseline assertions were unchanged. The original DPR 2 test completed all 30 zero-leak poses in 128.492s within its existing 360s deadline. Earlier hosted 4-CPU failures/cancellation remain separate historical evidence; this local result does not establish a new hosted outcome or a hover-induced depth speed gain.

Actual JUnit: 2166.553819s; complete three-command gate: 2281.0s. JUnit SHA256 `1787018335722eb9299a8cc1d9264771b75009f319bbb2fab321645e757918c0`; gate log `de4faa35f1a66415d8fe1e72e2f3d99c3ab3a387fb9a66ae83c1252bc2a8f988`; adjudication `a7ef9d245cadd3cae59ebc8c2693e74d668d47e08fc0597fd7147c0db35f41b3`. Real API/RPC restart and final shutdown completed successfully. Native CIRNET Label/Unicode and molded DIP screenshots were inspected. All owned full-run processes/service ports closed; selected API 69 files and the complete selected Interface source payload still match their archives. Post-run inspection SHA256 `943a0d9b2c7baa3cc2c47e739012c44be74570971dbc373a54f8c740411ee2f9`; source/index/license/tag/worktree and ignored-path inventory guard `1422b38fbd5a734531a16ed8a6c2fb8e515e3dd438a6882cb5d1424c5aecfeb2` (the ignored baseline records paths, not historical file-content hashes).

Repeatable local selection: `C:/Users/trann/.codex/migration-release-artifacts/cirnet-compatible-current-browser-20261029-28221a5-461b0870-0cb4f345/release-set.local.json`, SHA256 `e9c753fb68bd2d4fde327f7f641184b0ac627ab4f6cf717d5cc143c680e8e7bf`; companion `BROWSER_VERIFICATION.json` SHA256 `e304d9921863d6373c385f2a10c87316c5a97ffc1a9fa2a1e187ce7dbb9ba5ef`. Raw owned evidence remains under `C:/Users/trann/AppData/Local/Temp/netcircuit-t9FxuU/browser-current-candidate/0d95a052` until session cleanup. The built Interface candidate remains truthfully sourced at 461b0870; a later documentation-only commit is not relabeled as its build source. Existing published 0.1.1 tags/assets remain unchanged; these candidate bytes require the user's separate release/version decision.

## 2026-10-29 approved Interface 0.1.2 preparation

The user approved Interface 0.1.2 and Remote Integration 0.1.2 while API, Contracts, Simulator, Hardware and FPGA remain 0.1.1. The Interface package and root lock identity, compatibility entry and CI artifact label now select 0.1.2. The release builder records Interface 0.1.2 and independently verifies Contracts 0.1.1 in source metadata, static metadata and its artifact manifest. Technical package/import/environment identifiers, all third-party dependency locks, exact published SDK/DEV digests, API/graph/protocol identities, LICENSE, source assets and historical evidence retain their meaning and bytes.

The clean committed-export regression was RED against the old builder: its required Interface 0.1.2 fixture was rejected as requiring 0.1.1. With product and dependency versions separated, it builds twice from fresh committed exports and verifies equal source/static digests, all three generated entrypoints, Interface 0.1.2 and Contracts 0.1.1. Negative cases reject stale Interface 0.1.1 product metadata and a bootstrap incorrectly reporting Contracts 0.1.2. The existing dirty-source, ignored-static-output, arbitrary-static-root and missing-entrypoint guards remain enforced. RED log SHA256 `2297e20ebb08bfb6117e1c0e01bbdac7256b51e76ddc0f813dcf93ef9b504b3f`.

Fresh verification used a physical export of reviewed uncommitted changes based on `a7de79a938a0df910641421e97607d71bcefcb8c`, Node 24.20.0 and Python 3.14.4 standard-library release-fixture tooling. Exact published Contracts/SDK/DEV archives were selected explicitly and digest-verified; no retained installation or sibling source supplied dependencies. Bootstrap and clean npm ci PASS; all 24 script checks, 10 Contracts checks and 1467 TypeScript/unit tests PASS with 0 FAIL/0 SKIP. AST boundaries, E2E TypeScript, all three production entrypoints and actionlint 1.7.12 PASS. Complete dependency and compatibility comparisons confirm that only the Interface product version changed. The existing native browser assertions, renderer behavior, DPR, deadlines, retries, traces and baselines are unchanged by this preparation.

Raw outputs started outside Git in the shared session owned by `m6-v012-20261029-a83f41d6`, child `interface-v012-prep`; inspected gate receipt SHA256 `580b9f7960e6291a5a1b9d6e39951fb2edf4b720197cc3ff86f0dcac6de25567`. This verifies the reviewed candidate and packaging logic. The new release still requires a clean committed-source build, exact selected artifact installation and actual integrated/hosted browser acceptance; the earlier 57-pass local browser result retains its original source/version scope. Existing immutable 0.1.1 assets and tags are untouched.


## 2026-11-04 canonical source names

The uncommitted candidate based on `9853814a103638e3130b58b740c8789582b8ef40`
uses `@cirnet/web`, `cirnet-interface` and canonical environment settings with
legacy compatibility. See [the migration boundaries](NAMESPACE.md). Published
artifact locks, original artwork, historical fixtures and baselines are intact.

Verification used a fresh physical export outside all six Git roots, a clean
locked npm installation, Node 24.20.0 and the exact pinned SDK/DEV/Chromium.
All 25 script tests pass. The complete typed unit collection reports 1,475
cases: 1,468 pass, six loopback fixtures fail with sandbox `EACCES`, and the
existing directory-link fixture skips for host privilege. A native rerun of
those files plus the current namespace/recovery/pending/capture/drag-and-drop
regressions passes all 50 cases with zero failures or skips. Together the
invocations cover the full collection; the restricted run remains recorded as
failed. Final unit types, E2E types, AST boundaries and all production entrypoints
pass. Actionlint 1.7.12 validates both Interface and FPGA workflows.

A separate native Chromium 156.0.8078.4 check uses the application's real
recovery code and IndexedDB. It reads an old-format draft, preserves its graph,
returns the canonical format, removes the migrated draft without resurrection
on reopening, and verifies the original legacy database remains intact. The
browser runs from a complete fresh owned runtime copy and closes afterward.
This focused browser check does not claim the integrated application browser
release gate, hosted CI or publication.

Raw evidence starts in the shared external session owned by
`cirnet-six-repo-name-migration-20261104`, under its `interface` child.
Script log SHA256 `4061672c06d2e407cbc2383356725f369cdb7a1a310ce5aa68a3cc997567b0ad`;
restricted unit log `c54afdd74373205a908bb9b15187e4389505e74310ef489dd1a348184566020b`;
native regression log `51166168a81e9c3037796525d2137e602406afe6f2cff02d6d6a8ff7d112ce4e`;
final build `1c6c857ce11a50436651ae5bc4eb573a1d7324124818dfd8208d748107324ae1`;
real IndexedDB browser check `28ad8b8a39851ed0b2c62e5698ba02b944c85c986fe6e46412f766f390a364f6`.
No rendering baseline, worker, retry, timeout or electrical capability changed.


The final active-brand audit also canonicalizes metadata in both model exporter
sources and the live PSU/Function Generator/Oscilloscope printed text. The live
branding intentionally changes to CIRNET, retaining the existing two-tone layout,
fonts, colors and anchors. All 57 focused scene/model/chassis/supply regressions
pass; the final typed multipage build passes. Delivered model/artwork files,
their revision pins, loaded-old-root assertions and every visual baseline remain
unchanged; no exporter or baseline generator writes into the asset tree.
Brand regression log SHA256
`f55f32b9bb1481e5390a15d8d47084110bc94ca3276c79c9bcbc78ee8198c51a`;
final brand build `a58ec78b9ec803f0fda43434b046d1ed9d82f66e0bcb8baf994405e974160f7c`.

### Allocator alias follow-up (2026-11-04)

Two native regression tests pass for the pinned DEV allocator adapter. An explicit separate allocation retains the inherited active session; an empty canonical session setting allocates once and synchronizes both output prefixes before reuse. Each fixture cleans only its own children. Frozen artifacts and baselines remain unchanged. The source CI requires both manifest aliases to be cleared when selecting the Interface release SDK.

## 2026-11-05 Node 26 LTS compatibility

Current CI selects Node 26 LTS. A clean physical export of
`b2fd6ed6cc797113c70f70678395be55366bf316` passed on Windows x64 with official
Node 26.13.0 and its bundled npm 11.20.0. The Windows ZIP SHA256 was
`dcc60d59a0746999f99064a01c020445d54d84228c691cdbf25b49ac3b59150a`, checked
against the official release checksums. The live Node release index identified
this version as Lithium LTS on 2026-11-05. Verification made no global tool installation.

| Gate | Result |
| --- | --- |
| Reviewed SDK/DEV bootstrap, then clean `npm ci --no-audit --no-fund` | PASS, 92 packages |
| `node --test scripts/*.test.mjs` in the clean export | PASS, 27/27 |
| `npm run check:boundaries` | PASS, 229 modules |
| `npm test` | PASS, 10 Contracts prechecks and 1,497/1,497 runtime tests, no skips |
| `npm exec -- tsc --noEmit -p tsconfig.e2e.json` | PASS |
| `npm run build` | PASS, all three production entrypoints |
| Native Sharp PNG encode/decode and Vue Demi/Vue 3 smoke | PASS |
| New checkout CI toolchain selection/order regression | PASS, 1/1 |

All 33 installed dependency engine declarations admit Node 26. npm's existing
install-script restrictions remained enabled; the existing build chunk-size
warning requires no dependency upgrade. All 581 exported tracked files, the
lockfile and the three original SDK/DEV archives remained byte-identical.
The source export predates this task's workflow/README/toolchain-test changes;
those changes affect CI policy and documentation, not application runtime code.
Minimum package engines and `@types/node` are preserved for consumer compatibility.

The initial restricted-filesystem install failed with `EPERM`; the unchanged
native install and all complete gates above then passed. Full browser acceptance,
hosted Actions, publication and physical hardware verification are NOT_RUN for
this toolchain change. Historical Node 22/24 results retain their original
inputs and meaning. Raw diagnostics started in the shared external allocator
session; only this Markdown evidence belongs in source.

Receipt SHA256: `ad8e6372ae06b2ee0049aa5bdbe3353137297cb70223d0c99e9d32ea4aab10cb`.
Full `npm test` log SHA256:
`7a41dd9ff340911724f13d889b902fdf8d96112d71c5b8a9e000ad02fb8f72ef`.

## 2026-11-05 Python 3.14 CI baseline

Interface's archive-export CI selects Python 3.14 while Node remains 26.
The Python archive exporter compiles cleanly under CPython 3.14.6; both CI
toolchain selection/order regressions pass and actionlint 1.7.12 accepts the
workflow. Runtime Web source, dependency locks, model assets and published
archives are unchanged. The full Web/browser and production-export gates are
NOT_RUN for this Python policy change; their preceding Node 26 results retain
their recorded inputs. The fresh Remote Python 3.14.6 package and integration
gates exercise the versioned backend/Contracts boundary separately. Raw
diagnostics are outside Git in the session owned by
`cirnet-python314-compat-20261105`; no hosted Actions or publication is claimed.
