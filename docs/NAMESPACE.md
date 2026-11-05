# CIRNET source names and compatibility

Current source exports identify `@cirnet/web` and `cirnet-interface`.
`CIRNET_*` environment settings take precedence over their `NETCIRCUIT_*`
aliases, including an explicitly empty canonical value. Bootstrap and allocator
adapters synchronize both spellings before invoking pinned older tooling.
CI selects artifact URLs from the tracked release lock. The read-token secret
keeps its provisioned-name fallback; explicit operator URLs must match the lock.

Interface 0.1.4 selects canonical `@cirnet/contracts@0.1.2` and
`@cirnet/artifact-paths@1.0.0-m1.0` producer packs. Its matching
`cirnet-contracts` sdist supplies supplemental test resources. Bootstrap checks
exact archive digests, package identities and the DEV resource digest before
execution; npm's lock retains the selected tarball integrity. New release builds
reject legacy package identities rather than relabeling their bytes.

Previously published 0.1.1–0.1.3 archives and their original package metadata remain
unchanged in release records and historical consumers. Canonical candidate pins
do not rewrite or republish those artifacts. Source readers derive each sdist
resource directory from its selected identity.

New browser recovery records and exported recovery data use `cirnet.recovery`.
The reader accepts the old format. On first use, a transaction copies missing
legacy IndexedDB drafts into `cirnet-document-recovery` and commits a migration
marker with the copy. Existing canonical drafts win collisions. The original
database stays intact; reopening does not resurrect deleted migrated drafts.
A failed copy leaves the migration retryable.

Pending operation observations use the canonical storage key plus a mirrored
legacy alias. The legacy Web Lock stays shared with already-open old tabs, and
the legacy value remains authoritative when present so their updates are
visible. Completed observations cannot be resurrected by the alias. These are
observation hints; migration never replays a command. Drag-and-drop writes both
component media names and reads the canonical name first.

Requests send `X-CIRNET-CSRF` and the prior generic `X-CSRF-Token` header. Capture
requests use `application/vnd.cirnet.capture; version=1`; responses may use either
namespace, with the same strict version and size checks. The narrow health
identity adapter validates `cirnet-api` through the pinned SDK's existing
`netcircuit-api` contract and returns the original payload unchanged.

Legacy names intentionally remain in immutable artifact locks, recorded release
and migration evidence, pinned source fixtures, original artwork/model metadata,
legacy compatibility readers/writers, and regressions that exercise those paths.
LICENSE, model assets, baselines and historical fixture bytes are unchanged.


## Instrument branding and retained asset identities

The live PSU, Function Generator and Oscilloscope panels draw the canonical
`CIRNET` brand using their existing two-tone text layout and anchors. This intentionally changes rendered branding text;
font, panel geometry, control behavior and stored artwork/baseline inputs remain
unchanged. The scene assertion checks the canonical printed name.

Current exporter source emits `cirnet_function_generator_2ch` and
`cirnet_oscilloscope_2ch` roots with `CIRNET` model metadata. Existing delivered
GLB/glTF files remain the exact original assets: their roots
`net_circuit_function_generator_2ch` / `net_circuit_oscilloscope_2ch` and old
model labels identify the selected historical exports. Their binary geometry,
textures, artwork, hashes and source README provenance stay unchanged. Loaded
asset tests deliberately retain those exact old-root assertions, while tests
of current procedural factories require canonical roots. Exporters were not
rerun into the approved asset tree, and no visual baseline was regenerated.
