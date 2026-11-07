# Getting started with CIRNET Interface

[Tiếng Việt](../../vi/guides/getting-started.md) · [Documentation](../index.md)

Interface 0.1.4 uses Node 26 in CI. Install from the reviewed producer artifacts selected by the [artifact lock](../../../integration/contracts-artifacts.json). Bootstrap checks the canonical Contracts npm archive, the Contracts sdist used by supplemental tests, and the DEV allocator archive before use. The [npm lock](../../../package-lock.json) selects the runtime tarball. An explicit operator URL must match the tracked URL.

## Install from a reviewed local manifest

Start a fresh shell with no inherited `CIRNET_ARTIFACTS_SESSION`. Replace the example paths with absolute paths. Include the actual Interface, Remote and Contracts Git roots in `roots` when they participate in an integrated gate. An extracted product inside a session is a product path, while the context keeps the actual Git roots.

### PowerShell

```powershell
$interfaceRoot = 'C:\path\cirnet-interface'
$manifest = 'C:\absolute\reviewed\artifacts.json'
if ($env:CIRNET_ARTIFACTS_SESSION) { throw 'Use a fresh shell.' }
$env:CIRNET_ARTIFACTS_CONTEXT = (@{
    owner = 'cirnet-interface-dev'
    roots = @($interfaceRoot)
} | ConvertTo-Json -Compress)
$env:CIRNET_ARTIFACTS_DIR = [IO.Path]::GetTempPath()
$env:CIRNET_CONTRACTS_ARTIFACT_MANIFEST = $manifest
Set-Location -LiteralPath $interfaceRoot
$bootstrapJson = & node scripts/bootstrap-contracts.mjs --manifest $manifest
if ($LASTEXITCODE -ne 0) { throw 'Artifact bootstrap failed.' }
($bootstrapJson | ConvertFrom-Json).environment.PSObject.Properties | ForEach-Object {
    [Environment]::SetEnvironmentVariable($_.Name, [string]$_.Value, 'Process')
}
npm ci --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'Locked Interface install failed.' }
```

### Bash

```bash
interface_root=/absolute/cirnet-interface
manifest=/absolute/reviewed/artifacts.json
if [ -n "${CIRNET_ARTIFACTS_SESSION:-}" ]; then
  printf '%s\n' 'Use a fresh shell.' >&2
  exit 1
fi
CIRNET_ARTIFACTS_CONTEXT="$(node -e 'process.stdout.write(JSON.stringify({owner:"cirnet-interface-dev",roots:process.argv.slice(1)}))' "$interface_root")" || exit 1
export CIRNET_ARTIFACTS_CONTEXT
export CIRNET_ARTIFACTS_DIR="${TMPDIR:-/tmp}"
export CIRNET_CONTRACTS_ARTIFACT_MANIFEST="$manifest"
cd "$interface_root" || exit 1
bootstrap_json="$(node scripts/bootstrap-contracts.mjs --manifest "$manifest")" || exit 1
environment_lines="$(printf '%s' "$bootstrap_json" | node -e 'let input="";process.stdin.on("data",chunk=>input+=chunk);process.stdin.on("end",()=>{for(const [name,value] of Object.entries(JSON.parse(input).environment)){if(/[\r\n]/.test(value))throw Error("Multiline bootstrap environment value");console.log(name+"="+value)}})')" || exit 1
while IFS= read -r entry; do export "$entry"; done <<< "$environment_lines"
npm ci --no-audit --no-fund || exit 1
```

The bootstrap process prints JSON. Adopt its `environment` in the parent shell before starting npm or tests so child processes share the owned session. The locked HTTPS URLs can also supply the selected archives. For integrated verification, set `$remoteRoot` and `$contractsRoot` (PowerShell), or `remote_root` and `contracts_root` (Bash), to the participating absolute Git roots. Before bootstrap, replace the PowerShell `roots` array with `@($remoteRoot, $interfaceRoot, $contractsRoot)`, or pass `"$remote_root" "$interface_root" "$contracts_root"` to the Bash context command. Keep that context through cleanup. See [full browser integration](../contributing/verification.md#full-browser-integration).

## Start development

```sh
npm run dev
```

Vite serves the frontend and proxies `/api` and `/ws` to `127.0.0.1:8000` by default. Local graph editing works with the frontend alone. Start the Remote API and its required services for authentication, remote discovery, validation and execution. Set `CIRNET_DEV_API_TARGET` before starting Vite to select a different development proxy target. `VITE_API_BASE_URL` and `VITE_WS_URL` configure explicit endpoints.

`ECONNREFUSED 127.0.0.1:8000` means Vite could not reach the default API. On Windows a page close or reload can interrupt a pending proxy write with `write ECONNABORTED`. If the open page remains disconnected, check the browser's Network → WS view and the API logs. See the [API startup instructions](https://github.com/cirnetlab/cirnet-remote/blob/ce84ec4cf3602ef6fd001f91877e864c8955f9c7/services/api/README.md#local-run).

Continue with the [workbench guide](workbench.md) or the [verification commands](../contributing/verification.md).
