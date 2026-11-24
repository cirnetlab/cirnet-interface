# Get started with CIRNET Interface

[Tiếng Việt](../../vi/guides/getting-started.md) · [Documentation](../index.md)

Use Node 26 and the locked npm dependencies. From one selected Contracts and Remote build, obtain the SDK, DEV npm package, native crate and exact Remote OpenAPI used by the SDK generator. The [input profile](../../../integration/contracts-artifacts.json) gives the expected package identities.

Create an external JSON manifest with `npm`, `dev_npm`, `native_crate` and `remote_openapi` entries. Each has an absolute `path` and the reviewed `sha256` of the selected bytes. Keep the build's manifests and source fingerprints with the selection.

```powershell
$bootstrap = node scripts/bootstrap-contracts.mjs --manifest $nativeInputs | ConvertFrom-Json -AsHashtable
foreach ($entry in $bootstrap.environment.GetEnumerator()) {
    [Environment]::SetEnvironmentVariable($entry.Key, $entry.Value, 'Process')
}
npm ci --ignore-scripts --no-audit --no-fund
npm run dev
```

Use a fresh working copy or clear the ignored artifact cache when selecting a different build. Set `CIRNET_DEV_API_TARGET` to the Remote origin when developing against the native API. Vite proxies `/api` and `/ws`; the production build keeps both same-origin.
