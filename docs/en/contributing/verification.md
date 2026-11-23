# Verify CIRNET Interface

[Tiếng Việt](../../vi/contributing/verification.md) · [Documentation](../index.md)

## GitHub Actions

**Interface Windows x64 verification** runs on pushes to `master`. It builds the dependency inputs from the exact Contracts Next and Remote Next commits pinned in the workflow.

Set the [Interface repository Actions secret](https://github.com/cirnetlab/cirnet-interface-next/settings/secrets/actions) `CIRNET_DEPENDENCIES_READ_TOKEN` to a fine-grained token with resource owner `cirnetlab` and `Contents: read` on both `cirnet-contracts-next` and `cirnet-remote-next`. Both checkouts use this secret.

For a manual run, select a Remote **Windows x64 native candidate** run ID and the reviewed `manifestSha256`. Set `CIRNET_READ_TOKEN` with Actions read access to Remote Next. Both paths run the component build, unit checks and Chromium platform tests.

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

Set `CIRNET_E2E_BROWSER_CACHE` to an absolute external directory to select the pinned Chromium installation. The platform suite exercises the actual renderer, camera, depth and browser document ownership without a server account.

## Browser against the installed native product

For the installed product, use the same browser cache. Set `CIRNET_E2E_API_TARGET` to `http://127.0.0.1:14173`, `CIRNET_E2E_STATIC_FINGERPRINT` to the selected static artifact fingerprint and `CIRNET_E2E_ADMIN_PASSWORD` to the test administrator credential.

```powershell
node scripts/e2e.mjs test-packaged --forbid-only --grep 'real login|administrator creates|actual authoring UI'
```

The launcher checks the served metadata before running. The full browser suite also requires Remote-owned restart control and test data. See the [deployment guide](../operations/deployment.md).
