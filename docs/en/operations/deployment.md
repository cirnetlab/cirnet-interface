# Build and package CIRNET Interface

[Tiếng Việt](../../vi/operations/deployment.md) · [Documentation](../index.md)

From the [selected input set](../guides/getting-started.md), `npm run build` produces the workbench and oscilloscope and function generator previews in `dist/`. Remote serves the browser app, `/api` and `/ws` on one origin. [Compatibility descriptor](../../../integration/compatibility.json)

With the same inputs installed, run the archive builder from an allocator-owned session. Use an absolute output directory within that session.

```powershell
node scripts/build/build-release.mjs --manifest $nativeInputs --output-directory $output --verification
```

The builder exports the clean checkout to an external build directory. It records SHA-256 for source, static, SDK, crate and OpenAPI, and captures selected SDK and DEV npm integrities in the source archive. A local development candidate can add `--candidate` and one `--candidate-file path` per reviewed untracked file. Remote owns system acceptance and release selection.
