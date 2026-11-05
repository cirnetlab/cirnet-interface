# CIRNET namespace compatibility

[Tiếng Việt](../../vi/architecture/namespace.md) · [Documentation](../index.md)

Current source uses `cirnet-interface` for the product repository and `@cirnet/web` for the application package. Interface 0.1.4 imports runtime contracts from `@cirnet/contracts@0.1.2` and diagnostic allocation from the independent DEV package `@cirnet/artifact-paths@1.0.0-m1.0`. The `cirnet-contracts` Python sdist supplies supplemental Interface test resources. Its resource path is derived from the selected distribution identity.

The reviewed inputs are `cirnet-contracts-0.1.2.tgz`, `cirnet_contracts-0.1.2.tar.gz` and `cirnet-artifact-paths-1.0.0-m1.0.tgz`. Bootstrap verifies archive digests and package identities, plus the DEV module digest before running it. The npm lock keeps the selected tarball integrity. Release builds require canonical identities. See the [artifact lock](../../../integration/contracts-artifacts.json) and [npm lock](../../../package-lock.json).

## Environment

For the scripts using the compatibility adapter, `CIRNET_*` wins over `NETCIRCUIT_*` for the same suffix. An explicitly empty canonical value also wins. If only the legacy value exists, the adapter accepts it. The adapter synchronizes both spellings for child tooling. The allocator adapter reflects session and context values written by the pinned allocator back into the canonical names.

| Purpose | Canonical | Accepted legacy alias |
| --- | --- | --- |
| Diagnostic allocation | `CIRNET_ARTIFACTS_CONTEXT`, `CIRNET_ARTIFACTS_DIR`, `CIRNET_ARTIFACTS_SESSION` | `NETCIRCUIT_ARTIFACTS_CONTEXT`, `NETCIRCUIT_ARTIFACTS_DIR`, `NETCIRCUIT_ARTIFACTS_SESSION` |
| Reviewed local manifest | `CIRNET_CONTRACTS_ARTIFACT_MANIFEST` | `NETCIRCUIT_CONTRACTS_ARTIFACT_MANIFEST` |
| Producer URLs | `CIRNET_CONTRACTS_NPM_URL`, `CIRNET_CONTRACTS_SDIST_URL`, `CIRNET_ARTIFACT_PATHS_NPM_URL` | `NETCIRCUIT_CONTRACTS_NPM_URL`, `NETCIRCUIT_CONTRACTS_SDIST_URL`, `NETCIRCUIT_ARTIFACT_PATHS_NPM_URL` |
| Artifact request token | `CIRNET_ARTIFACTS_TOKEN` | `NETCIRCUIT_ARTIFACTS_TOKEN` |
| Development API proxy | `CIRNET_DEV_API_TARGET` | `NETCIRCUIT_DEV_API_TARGET` |
| Full browser target and private test inputs | `CIRNET_E2E_API_TARGET`, `CIRNET_E2E_ADMIN_PASSWORD`, `CIRNET_E2E_DATA_DIR` | `NETCIRCUIT_E2E_API_TARGET`, `NETCIRCUIT_E2E_ADMIN_PASSWORD`, `NETCIRCUIT_E2E_DATA_DIR` |

CI chooses URLs from the tracked lock. Any nonempty explicit operator URL must match it. The workflow reads `CIRNET_ARTIFACTS_READ_TOKEN` with a fallback to the provisioned `NETCIRCUIT_ARTIFACTS_READ_TOKEN` secret. See the [environment adapter](../../../scripts/environment.mjs), [allocator adapter](../../../scripts/artifact-paths.mjs) and [workflow](../../../.github/workflows/frontend.yml).

## Browser data and protocol

| Boundary | Compatibility behavior |
| --- | --- |
| Recovery records and exports | New recovery records and exports use `cirnet.recovery` version 1. The reader accepts `netcircuit.recovery` version 1 and normalizes it to the canonical format. |
| Recovery IndexedDB | Uses `cirnet-document-recovery`. On first use, a transaction copies missing drafts from `netcircuit-document-recovery` and records `migration:netcircuit-document-recovery:v1` with the copy. Canonical drafts win collisions. The legacy database stays intact. A failed migration can retry, and reopening does not restore deleted migrated drafts. |
| Pending observations | Writes both `cirnet.pending-observations.v1` and `netcircuit.pending-observations.v1`. The legacy value wins when present so old tabs can still write. The Web Lock also uses `netcircuit.pending-observations.v1`. These records are observation hints. A completed observation cannot be resurrected through the alias, and recovery of observations never replays a command. |
| Component drag and drop | Writes `application/x-cirnet-component` and `application/x-netcircuit-component`. Reads the canonical name first. |
| CSRF and sessions | Sends the same CSRF value in `X-CIRNET-CSRF` and `X-CSRF-Token` when present. The real-browser test recognizes `cirnet_session` and `netcircuit_session`, requires at least one reviewed cookie, checks every recognized cookie, and requires matching credentials when both names are present. |
| Capture | Requests `application/vnd.cirnet.capture; version=1`. Accepts `application/vnd.cirnet.capture` and `application/vnd.netcircuit.capture` responses with the same strict version and size checks. |
| API health | The selected schema accepts `cirnet-api` and `netcircuit-api`. The adapter validates the original payload first. If a validator rejects the canonical identity, it can retry validation with the legacy identity and still returns the original payload. |

See the [recovery reader](../../../src/application/projects/recovery.ts), [IndexedDB adapter](../../../src/services/recovery/indexedDb.ts), [observation storage](../../../src/services/recovery/pendingObservations.ts), [API client](../../../src/services/api/client.ts), [health validation](../../../src/contracts/structural.ts) and [session cookie checks](../../../e2e/session-cookies.ts).

## Historical identity and asset evidence

Previously published Interface 0.1.1–0.1.3 archives keep their original package metadata and digests in release records and historical consumers. Canonical pins select new inputs and leave historical archives intact. Release locks, pinned fixtures, dated verification entries and original artwork retain the names that identify their recorded bytes. Compatibility readers, writers and tests continue to handle both generations. The license, delivered model assets, baseline inputs and historical fixture bytes were preserved in the [namespace migration](../../VERIFICATION.md#2026-11-04-canonical-source-names).

### Instrument branding and retained asset identities

Live PSU, Function Generator and Oscilloscope panel text uses `CIRNET`. The branding update kept the existing two-tone layout, anchors, fonts, panel geometry and control behavior. The [scene test](../../../tests/scene.test.ts) checks the printed name.

Current procedural factories and exporters use `cirnet_function_generator_2ch` and `cirnet_oscilloscope_2ch`. The exporters write `CIRNET` model metadata. Delivered GLB/glTF files retain `net_circuit_function_generator_2ch` and `net_circuit_oscilloscope_2ch`, with their original geometry, textures, artwork, model labels, hashes and adjacent README provenance. Loader tests check the delivered names, and factory tests check the canonical roots. The branding update preserved the approved exports and visual baselines byte for byte. See the [instrument model guide](../guides/instrument-models.md) and [dated verification record](../../VERIFICATION.md#2026-11-04-canonical-source-names).
