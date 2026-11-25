# Verify CIRNET Interface

[Tiếng Việt](../../vi/contributing/verification.md) · [Documentation](../index.md)

## GitHub Actions

**Interface Windows x64 verification** runs on pushes to `master`. It builds the dependency inputs from the exact Contracts and Remote commits pinned in the workflow.

Set the [Interface repository Actions secret](https://github.com/cirnetlab/cirnet-interface/settings/secrets/actions) `CIRNET_DEPENDENCIES_READ_TOKEN` to a fine-grained token with resource owner `cirnetlab` and `Contents: read` on both `cirnet-contracts` and `cirnet-remote`. Both checkouts use this secret.

For a manual run, select a Remote **Windows x64 native candidate** run ID and the reviewed `manifestSha256`. Set `CIRNET_READ_TOKEN` with Actions read access to Remote. Both paths run the component build, unit checks and Chromium platform tests.

## Local checks

Prepare the [exact build inputs](../guides/getting-started.md) in a fresh copy. Apply the ownership context and session from the bootstrap JSON before running checks. Keep npm cache, browser traces, test bundles and raw logs in that session.

```powershell
npm run check:boundaries
npm test -- --all-script-tests
npx tsc --noEmit -p tsconfig.e2e.json
npm run build
npm run test:e2e:install
npm run test:e2e:platform -- --forbid-only
```

The runner discovers `*.test.ts` recursively in [tests](../../../tests) and preserves each feature path in its build output. [Shared helpers](../../../tests/helpers) and [historical fixtures](../../../tests/fixtures/historical) stay at stable paths. Select a test by suite-relative path, repository-relative path or unique filename. Ambiguous and unknown selections fail before executing tests.

```powershell
npm test -- tests/instruments/oscilloscope.test.ts
node scripts/test.mjs scripts/verification/test-runner.test.mjs
```

`--all-script-tests` includes all recursively discovered `*.test.mjs` files. [Scripts](../../../scripts) separate build and packaging, Contracts bootstrap, verification, browser execution, benchmarks, asset export and utilities. The root launchers keep existing integration commands available. [Browser specs and harnesses](../../../e2e) group auth, projects, workbench, rendering and lab; Playwright discovers the nested specs from the same configuration.

Set `CIRNET_E2E_BROWSER_CACHE` to an absolute external directory to select the pinned Chromium installation. The platform suite exercises the actual renderer, camera, depth and browser document ownership without a server account.

The component-palette benchmark verifies and loads the checked-in source fixtures named in its [baseline manifest](../../../tests/fixtures/historical/40a4cad80be76a5b08943fab51ee2218cb7d7012/manifest.json). The original Git revision identifies provenance.

## Browser against the installed native product

For the installed product, use the same browser cache. Set `CIRNET_E2E_API_TARGET` to `http://127.0.0.1:14173`, `CIRNET_E2E_STATIC_FINGERPRINT` to the selected static artifact fingerprint and `CIRNET_E2E_ADMIN_PASSWORD` to the test administrator credential.

```powershell
node scripts/e2e.mjs test-packaged --forbid-only --grep 'real login|administrator creates|actual authoring UI'
```

The launcher checks the served metadata before running. The full browser suite also requires Remote-owned restart control and test data. See the [deployment guide](../operations/deployment.md).
