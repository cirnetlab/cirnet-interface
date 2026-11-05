# Interface release and deployment

[Tiếng Việt](../../vi/operations/deployment.md) · [Documentation](../index.md)

The product source identifies as `@cirnet/web` 0.1.4. Its [compatibility descriptor](../../../integration/compatibility.json) records the paired Remote revision, and the [artifact lock](../../../integration/contracts-artifacts.json) identifies its producer inputs. Remote owns system selection. Read the selected source revisions, URLs and digests from its [system 0.1.4 release set](https://github.com/cirnetlab/cirnet-remote/blob/38aea6120920f48cea817827ac2277cce4bef25e/integration/release-set.json).

## Build the release pair

Use the [reviewed setup](../guides/getting-started.md) and a clean committed Interface checkout. Replace the placeholder with an absolute output directory in the owned session.

```sh
python -B scripts/build_release.py --output-directory ABSOLUTE_OWNED_SESSION/interface-release
```

The builder exports the committed source, bootstraps the selected inputs, installs with the npm lock and runs a fresh production build. It produces source and static archives with source revision, source fingerprint and artifact digests. The static package serves `index.html`, `oscilloscope-preview.html` and `function-generator-preview.html` with their assets. Review the generated identity and [verification gates](../contributing/verification.md) before selecting the pair.

## Serve the selected product

Deploy the reviewed static archive alongside the services named in the system release set. Configure routing for the application and matching REST/WebSocket service endpoints. The Vite proxy is a development configuration. Building the release pair locally leaves tag, upload and system selection as separate operations. Preserve existing release bytes and digests when adding a new version.
