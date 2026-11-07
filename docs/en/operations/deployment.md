# Interface release and deployment

[Tiếng Việt](../../vi/operations/deployment.md) · [Documentation](../index.md)

The product source identifies as `@cirnet/web` 0.1.4. Its [compatibility descriptor](../../../integration/compatibility.json) records the paired Remote revision, and the [artifact lock](../../../integration/contracts-artifacts.json) identifies its producer inputs. Remote owns system selection. Read the selected source revisions, URLs and digests from its [system 0.1.4 release set](https://github.com/cirnetlab/cirnet-remote/blob/38aea6120920f48cea817827ac2277cce4bef25e/integration/release-set.json).

The checkout source identifies as `@cirnet/web` 0.1.4. Remote's published system selection pins the Interface source and static artifacts at `f1fe0c4738e105727aff1a331327caf7172cdf5f` and the API at `ce84ec4cf3602ef6fd001f91877e864c8955f9c7`. A checkout at a later commit can still declare 0.1.4. The [native migration record](https://github.com/cirnetlab/cirnet-remote/blob/13a35145b6d15644c7be10d95a5410bf69e11867/docs/en/architecture/native-migration.md) tracks candidate acceptance separately from the published selection.

## Build the release pair

Use the [reviewed setup](../guides/getting-started.md) and a clean committed Interface checkout. Replace the placeholder with an absolute output directory in the owned session.

```sh
python -B scripts/build_release.py --output-directory ABSOLUTE_OWNED_SESSION/interface-release
```

The builder exports the committed source, bootstraps the selected inputs, installs with the npm lock and runs a fresh production build. It produces source and static archives with source revision, source fingerprint and artifact digests. The static package serves `index.html`, `oscilloscope-preview.html` and `function-generator-preview.html` with their assets. Review the generated identity and [verification gates](../contributing/verification.md) before selecting the pair.

The builder uses Git bytes with checkout newline conversion disabled and builds from a fresh export. It rejects existing output archives and source/static path aliases. It writes `artifacts.json` with SHA-256 digests and retains staging and logs in the owned external session. See the [build provenance verification](../../../migration/interface-build-provenance.md).

## Serve the selected product

Deploy the reviewed static archive alongside the services named in the system release set. Configure routing for the application and matching REST/WebSocket service endpoints. The Vite proxy is a development configuration. Building the release pair locally leaves tag, upload and system selection as separate operations. The [published v0.1.3 artifacts](https://github.com/cirnetlab/cirnet-interface/releases/tag/v0.1.3) retain their release bytes and browser evidence.
