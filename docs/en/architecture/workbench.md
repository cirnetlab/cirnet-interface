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

The virtual profile returns supported digital capture payloads as NCAP. Physical and analog capabilities depend on the selected profile and implemented driver. The default virtual profile leaves Scope and Generator unavailable as hardware actions. See the [canonical Lab-First architecture](https://github.com/cirnetlab/cirnet-remote/blob/13a35145b6d15644c7be10d95a5410bf69e11867/docs/ARCHITECTURE.md).

The [Remote system guide](https://github.com/cirnetlab/cirnet-remote/blob/13a35145b6d15644c7be10d95a5410bf69e11867/docs/en/architecture/system.md) describes the published Python service layout. The [native migration record](https://github.com/cirnetlab/cirnet-remote/blob/13a35145b6d15644c7be10d95a5410bf69e11867/docs/en/architecture/native-migration.md) separately records the Windows Gate 4 candidate and the open release gates. The [0.1.4 release lock](https://github.com/cirnetlab/cirnet-remote/blob/38aea6120920f48cea817827ac2277cce4bef25e/integration/release-set.json) selects the published combination.

## Document and scene ownership

The pure document core owns commands, history, serialization and revision tracking. The Pinia circuit facade coordinates those operations with the mounted Vue shell. Authentication, projects, workspace, station, execution, instruments and UI keep separate lifetimes. The execution and instrument stores coordinate through an application controller. Server routes enable Save, Save As and Export only after the requested document hydrates. [Route hydration verification](../../../migration/server-route-hydration.md)

Scene resources stay outside Pinia. The renderer coalesces graph, camera and gesture updates into animation frames. Hidden, zero-sized and context-lost scenes pause. Resize and context restoration redraw. Unmount releases observers, controls, frames and GPU resources. The asset provider checks the preview models by revision and falls back to procedural visuals on import failure. [Instrument model guide](../guides/instrument-models.md)

See the [workbench guide](../guides/workbench.md) for editor behavior and [verification](../contributing/verification.md) for the two browser test boundaries.
