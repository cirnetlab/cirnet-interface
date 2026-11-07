# CIRNET Interface changelog for major version 0

[Changelog index](README.md) · [Historical verification](../en/history/index.md)

## Contents

- [Unreleased](#unreleased)
- [v0.1.4](#v014)
- [v0.1.3](#v013)
- [v0.1.2](#v012)
- [v0.1.1](#v011)

## Unreleased

### Added

- Added a standalone Chromium gate for the real renderer and two-tab Web Locks. It runs independently of the full Remote service gate. [Test runner source](https://github.com/cirnetlab/cirnet-interface/commit/879c6fdbff34462df6e112c8dd7afc3a96ff9933)

### Changed

- Organized release notes by major and separated agent work records from bilingual documentation and historical evidence. [Documentation conventions](../en/contributing/writing-documentation.md)

### Fixed

- Avoided redundant camera preset draws and applied the target pose directly when a draw would consume the transition. [Renderer change](https://github.com/cirnetlab/cirnet-interface/commit/66845b01f9b02b70e6ec28ececd163133cdcdfa2)

## v0.1.4

Published **2026-11-05** at `16:08:53 +07:00`. Tag target `f1fe0c4`. [GitHub release](https://github.com/cirnetlab/cirnet-interface/releases/tag/v0.1.4) · [Tagged artifact lock](https://github.com/cirnetlab/cirnet-interface/blob/f1fe0c4738e105727aff1a331327caf7172cdf5f/integration/contracts-artifacts.json)

### Changed

- Released the canonical `cirnet-interface` source and static archives for system 0.1.4. Build and verification tooling moved to Node 26 and the Python 3.14 CI baseline. [Release source](https://github.com/cirnetlab/cirnet-interface/commit/f1fe0c4738e105727aff1a331327caf7172cdf5f) · [Verification record](../en/history/verification-ledger.md#2026-11-05-canonical-014-source-verification)

### Breaking Changes

- Consumers building Interface 0.1.4 must use `@cirnet/contracts@0.1.2` and the canonical `@cirnet/artifact-paths` development package. Use the tagged lock for earlier source releases. Browser data and wire compatibility aliases are documented separately. [Namespace compatibility](../en/architecture/namespace.md)

## v0.1.3

Published **2026-11-04** at `20:00:35 +07:00`. Tag target `6c150f3`. [GitHub release](https://github.com/cirnetlab/cirnet-interface/releases/tag/v0.1.3) · [Tagged package](https://github.com/cirnetlab/cirnet-interface/blob/6c150f34193bb3b009046cbaa586fae0260560f4/package.json)

### Changed

- Adopted the `@cirnet/web` package name while retaining the selected Contracts 0.1.1 artifacts. Added compatibility for both canonical and legacy recovery records. Browser verification checks both API session-cookie names. [Namespace migration record](../en/history/verification-ledger.md#2026-11-04-canonical-source-names) · [Browser acceptance](../en/history/verification-ledger.md#2026-11-04-complete-committed-artifact-ubuntu-acceptance)

### Fixed

- Avoided DOM-only canvas draws. The native browser depth harness conservatively accelerates triangle queries using the original raycast kernel. [Implementation](https://github.com/cirnetlab/cirnet-interface/commit/2fe7cba5252087af033202183ef242a4be5152cc)

## v0.1.2

Published **2026-11-03** at `21:42:21 +07:00`. Tag target `a14d095`. [GitHub release](https://github.com/cirnetlab/cirnet-interface/releases/tag/v0.1.2) · [Tagged source](https://github.com/cirnetlab/cirnet-interface/commit/a14d0950e71a997e2219a32f7268fd0e9d6502b3)

### Changed

- Published revised Interface source and static archives with Contracts 0.1.1. The release records the local Ubuntu browser result of 57 passes and one optional historical case not run. [Release record](https://github.com/cirnetlab/cirnet-interface/releases/tag/v0.1.2)

### Fixed

- Avoided requesting another render when the wire-edit hover target was unchanged. [Wire hover verification](../en/history/verification-ledger.md#2026-10-29-wire-edit-hover-continuation)

## v0.1.1

Published **2026-10-28** at `22:51:15 +07:00`. Tag target `7a266d1`. [GitHub release](https://github.com/cirnetlab/cirnet-interface/releases/tag/v0.1.1) · [Tagged package](https://github.com/cirnetlab/cirnet-interface/blob/7a266d15b510d840ad3146515a3699760564ed32/package.json)

### Added

- Published the independent browser workbench as committed source and a built static archive. It uses the selected Contracts 0.1.1 SDK and provides circuit editing, project documents and experiment views. [M2 extraction evidence](../../migration/verification.md) · [Build provenance](../../migration/interface-build-provenance.md)

### Fixed

- Kept form drafts and single-step editor history. Enabled document save and export after route hydration. [Draft and history change](https://github.com/cirnetlab/cirnet-interface/commit/7a266d15b510d840ad3146515a3699760564ed32) · [Route hydration record](../../migration/server-route-hydration.md)
