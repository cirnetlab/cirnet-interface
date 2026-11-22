# Verify CIRNET Interface

[Tiếng Việt](../../vi/contributing/verification.md) · [Documentation](../index.md)

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

For the installed product, use the same browser cache. Set `CIRNET_E2E_API_TARGET` to `http://127.0.0.1:14173`, `CIRNET_E2E_STATIC_FINGERPRINT` to the selected static artifact fingerprint and `CIRNET_E2E_ADMIN_PASSWORD` to the test administrator credential.

```powershell
node scripts/e2e.mjs test-packaged --forbid-only --grep 'real login|administrator creates|actual authoring UI'
```

The launcher checks the served metadata before running. The full browser suite also requires Remote-owned restart control and test data. See the [deployment guide](../operations/deployment.md).
