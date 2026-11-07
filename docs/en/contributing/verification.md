# Verify CIRNET Interface

[Tiếng Việt](../../vi/contributing/verification.md) · [Documentation](../index.md)

Use the [reviewed artifact setup](../guides/getting-started.md) first. Keep caches, temporary data, raw logs and traces in the allocator-owned session.

## Source and production build

Run from the Interface root with the CI Node version.

```sh
npm run check:boundaries
npm test -- --all-script-tests
npx tsc --noEmit -p tsconfig.e2e.json
npm run build
```

The test command covers unit and script tests. The build type-checks the application and builds the workbench and the two instrument previews.

## Standalone native browser

```sh
npm run test:e2e:install
npm run test:e2e:platform -- --forbid-only
```

Playwright 1.64.1 installs its pinned Chromium in `.runtime/playwright`. CI adds `--with-deps` to the installation command on Ubuntu. The standalone launcher uses an OS-assigned loopback origin, an owned Vite cache, a fresh browser copy and the actual renderer. The depth checks and the two-tab Web Locks case run without Remote services or credentials.

## Full browser integration

Set the context for the participating Git roots before bootstrap, keep the environment returned by bootstrap, and install Chromium from Interface. From Remote, explicitly select both the prepared API Python and Interface product. In Bash, with absolute paths in the two variables below, run the following.

```bash
export CIRNET_E2E_PYTHON="$remote_root/services/api/.venv/bin/python"
(cd "$remote_root" && node scripts/e2e-interface.mjs --interface-root "$interface_root" --forbid-only)
```

In PowerShell, continue with the absolute roots from [setup](../guides/getting-started.md).

```powershell
Set-Location -LiteralPath $interfaceRoot
npm run test:e2e:install
if ($LASTEXITCODE -ne 0) { throw 'Pinned Chromium installation failed.' }
$env:CIRNET_E2E_PYTHON = Join-Path $remoteRoot 'services/api/.venv/Scripts/python.exe'
Set-Location -LiteralPath $remoteRoot
node scripts/e2e-interface.mjs --interface-root $interfaceRoot --forbid-only
```

Alternatively, use the same interpreter to run `scripts/check_release.py --group browser --interface-root ABSOLUTE_INTERFACE_PRODUCT` from Remote. Remote owns API, RPC, Simulator, authentication and private test state, controlled restarts and shutdown. The integrated gate uses ports 14173, 15151 and 18181, one worker and zero retries.

Browser runs use a complete copy of the pinned installation in a unique `br-<8hex>` child selected by `PLAYWRIGHT_BROWSERS_PATH`. The copy dereferences browser links and excludes `.links` and old debug logs. Keep Windows `.exe` paths at or below the launcher's 259 UTF-16 unit limit. If the copy would exceed the limit, set a shorter absolute external `CIRNET_ARTIFACTS_DIR` and allocate a fresh session. Chromium may write GPU logs beside its executable on Windows. Inspect the copied runtime, screenshots and traces in the session, and confirm Chromium, FFmpeg and helpers exit before cleanup. Copy failures stop the launcher.

Review current policy and dated results in the [verification record](../../VERIFICATION.md). After inspecting evidence and confirming owned processes stopped, run `node scripts/cleanup-contracts.mjs` in the same context to clean the owning session.
