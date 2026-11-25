#Requires -Version 7.4
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true

$interface = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).Path
$sources = Split-Path -Parent $interface
$contracts = Join-Path $sources 'cirnet-contracts'
$remote = Join-Path $sources 'cirnet-remote'
$allocator = Join-Path $contracts 'tools/artifact-paths/cirnet_artifact_paths/artifact-paths.mjs'
$env:CIRNET_ARTIFACTS_CONTEXT = @{
    owner = 'cirnet-interface-ci'
    roots = @($interface, $contracts, $remote)
} | ConvertTo-Json -Compress
$env:CIRNET_ARTIFACTS_SESSION = node $allocator --directory $env:CIRNET_ARTIFACTS_DIR
$session = $env:CIRNET_ARTIFACTS_SESSION
$env:CIRNET_ARTIFACT_PATHS_MODULE = [Uri]::new($allocator).AbsoluteUri
$env:CARGO_TARGET_DIR = Join-Path $session 'target'
if (!$env:npm_config_cache) { $env:npm_config_cache = Join-Path $session 'npm-cache' }
$env:TEMP = $env:TMP = $env:TMPDIR = Join-Path $session 'tmp'
$null = New-Item -ItemType Directory -Path $env:TEMP

$vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio/Installer/vswhere.exe'
$vs = & $vswhere -latest -products '*' -version '[17.0,18.0)' -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
if (!$vs) { throw 'Visual Studio 2022 x64 build tools are required.' }
& (Join-Path $vs 'Common7/Tools/Launch-VsDevShell.ps1') -Arch amd64 -HostArch amd64 -SkipAutomaticLocation

function Get-Sha256([string] $path) {
    (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
}

$target = 'x86_64-pc-windows-msvc'
$bundle = Join-Path $session 'contracts'
node (Join-Path $contracts 'scripts/package-native.mjs') $bundle
$receiptPath = Join-Path $bundle 'contracts-native-manifest.json'
$receipt = Get-Content -LiteralPath $receiptPath -Raw | ConvertFrom-Json
$crate = Join-Path $env:CARGO_TARGET_DIR ('package/' + $receipt.crate.filename)
node (Join-Path $contracts 'scripts/check-native-package.mjs') $bundle $crate

$openapi = Join-Path $session 'remote-openapi.json'
$env:CIRNET_CONTRACTS_ROOT = Join-Path $bundle 'resources'
$env:CARGO_ENCODED_RUSTFLAGS = "-C$([char]31)target-feature=+crt-static"
Push-Location -LiteralPath $remote
try {
    cargo.exe build --locked --release --target $target --bin cirnet-remote
    & (Join-Path $env:CARGO_TARGET_DIR "$target/release/cirnet-remote.exe") --export-openapi > $openapi
} finally {
    Pop-Location
}

$tools = (New-Item -ItemType Directory -Path (Join-Path $session 'sdk-tools')).FullName
$sdkSource = Join-Path $contracts 'packages/public-sdk'
foreach ($file in @('package.json', 'package-lock.json')) {
    Copy-Item -LiteralPath (Join-Path $sdkSource $file) -Destination $tools
}
npm.cmd --prefix $tools ci --ignore-scripts --no-audit --no-fund
$sdk = Join-Path $session 'sdk'
node (Join-Path $contracts 'scripts/check_public_sdk.mjs') --native-bundle $bundle --native-bundle-sha256 (Get-Sha256 $receiptPath) --native-crate $crate --remote-openapi $openapi --node-tools $tools --output $sdk

$allocatorPackage = Join-Path $contracts 'tools/artifact-paths'
npm.cmd pack $allocatorPackage --ignore-scripts --pack-destination $sdk
$dev = Join-Path $sdk ("cirnet-artifact-paths-$($receipt.version).tgz")
$public = Join-Path $sdk ("cirnet-contracts-$($receipt.version).tgz")
$selectionPath = Join-Path $session 'interface-input.json'
@{
    npm = @{ path = $public; sha256 = Get-Sha256 $public }
    dev_npm = @{ path = $dev; sha256 = Get-Sha256 $dev }
    native_crate = @{ path = $crate; sha256 = Get-Sha256 $crate }
    remote_openapi = @{ path = $openapi; sha256 = Get-Sha256 $openapi }
} | ConvertTo-Json | Set-Content -LiteralPath $selectionPath -Encoding utf8

"CIRNET_CONTRACTS_ARTIFACT_MANIFEST=$selectionPath" >> $env:GITHUB_ENV
"CIRNET_ARTIFACTS_CONTEXT=$env:CIRNET_ARTIFACTS_CONTEXT" >> $env:GITHUB_ENV
"CIRNET_ARTIFACTS_SESSION=$session" >> $env:GITHUB_ENV
