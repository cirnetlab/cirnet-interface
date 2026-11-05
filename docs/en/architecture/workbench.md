# Interface architecture

[Tiếng Việt](../../vi/architecture/workbench.md) · [Documentation](../index.md)

One mounted Vue 3 workspace coordinates the active circuit document, Pinia state and the Three.js scene. Graph commands own document edits and history. The scene projects the graph and has transient interaction and rendering state. Wire bends, visual crossings, panel overlays and camera positions cannot create or change electrical connectivity.

## Graph and contract boundaries

- Graph 1.0 and 1.1 documents retain their meaning. Additive Graph 1.2 operations carry flexible assemblies and pinned free physical descriptors. A flexible board connection names both exact holes. Interface owns semantic validation and normalization before committing an edit.
- Generated DTOs and runtime validators from `@cirnet/contracts` define the REST and WebSocket boundaries. The selected Contracts npm package and test resources come from the reviewed artifact lock. The DEV allocator stays in build and test tooling.
- Interface imports the editor catalog and part data from the selected package. Its Three.js models and procedural fallbacks remain presentation assets. The original model files retain their export names, hashes and provenance. See [namespace compatibility](namespace.md) and the [instrument model guide](../guides/instrument-models.md).
- Ribbon and drawer transforms update DOM layout without an extra draw of an unchanged canvas. Genuine scene or camera changes still draw. The native browser checks exercise the real scene and preserve the pixel oracle.

## Application services and persistence

Remote supplies authentication, private projects, assignment publication, execution queues and history. The API issues HttpOnly session cookies. Interface keeps CSRF state in memory and partitions browser recovery by principal. Guest transfer is explicit. Revision conflicts preserve local edits, and Import and Export are separate user actions. IndexedDB stores recovery drafts. Publishing an assignment is separate from editing its draft. Observation and history can report an operation without replaying it.

The real virtual profile routes supported digital captures through the NCAP. Physical and analog capabilities depend on the selected profile and implemented driver. The default virtual profile leaves Scope and Generator unavailable as hardware actions. See the [system architecture at the selected Remote revision](https://github.com/cirnetlab/cirnet-remote/blob/ce84ec4cf3602ef6fd001f91877e864c8955f9c7/docs/ARCHITECTURE.md).

See the [workbench guide](../guides/workbench.md) for editor behavior and [verification](../contributing/verification.md) for the two browser test boundaries.
