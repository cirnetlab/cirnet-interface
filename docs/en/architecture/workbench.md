# Interface architecture

[Tiếng Việt](../../vi/architecture/workbench.md) · [Documentation](../index.md)

One mounted Vue 3 workspace coordinates the active circuit document, Pinia state and the Three.js scene. Graph commands own document edits and history. The scene projects the graph and has transient interaction and rendering state. Wire bends, visual crossings, panel overlays and camera positions cannot create or change electrical connectivity.

| Owner | Boundary |
| --- | --- |
| Interface | Browser workbench, `CircuitGraph` commands and history, the Three.js breadboard projection, instrument panels and typed Lab client. |
| Contracts | Canonical schemas and catalog data, plus the packaged SDK used by the browser. |
| Remote and station services | Remote authorizes Lab actions and owns the execution API and leases. Hardware enforces local protection and owns private FPGA access. The browser displays the service decisions. |

## Graph and contract boundaries

- Graph 1.0 and 1.1 documents retain their meaning. Additive Graph 1.2 operations carry flexible assemblies and pinned free physical descriptors. A flexible board connection names both exact holes. Interface owns semantic validation and normalization before committing an edit.
- Generated DTOs and runtime validators from `@cirnet/contracts` define the REST and WebSocket boundaries. The selected Contracts npm package and test resources come from the reviewed artifact lock. The DEV allocator stays in build and test tooling.
- Ribbon and drawer transforms update DOM layout without an extra draw of an unchanged canvas. Genuine scene or camera changes still draw. The native browser checks exercise the real scene and preserve the pixel oracle.

## Application services and persistence

Remote supplies authentication, private projects, assignment publication, execution queues and history. The API issues HttpOnly session cookies. Interface keeps CSRF state in memory and partitions browser recovery by principal. Guest transfer is explicit. Revision conflicts preserve local edits, and Import and Export are separate user actions. IndexedDB stores recovery drafts. Publishing an assignment is separate from editing its draft. Observation and history can report an operation without replaying it.

The virtual profile returns supported digital capture payloads as NCAP. Physical and analog capabilities depend on the selected profile and implemented driver. The default virtual profile leaves Scope and Generator unavailable as hardware actions. Remote and Hardware decide whether an experiment can run safely. See the [Lab-First Architecture](https://github.com/cirnetlab/cirnet-remote-next/blob/master/docs/cirnet-architecture-lab-first-en.md).

Standalone instrument previews and local editing exercise browser behavior. Packaged browser E2E exercises an installed Remote with the matching Interface archive and the real Hardware and Simulator chain. [Verification](../contributing/verification.md#browser-against-the-installed-native-product)


## Document and scene ownership

The pure document core owns commands, history, serialization and revision tracking. The Pinia circuit facade coordinates those operations with the mounted Vue shell. Authentication, projects, workspace, station, execution, instruments and UI keep separate lifetimes. The execution and instrument stores coordinate through an application controller. Server routes enable Save, Save As and Export only after the requested document hydrates.

Scene resources stay outside Pinia. The renderer coalesces graph, camera and gesture updates into animation frames. Hidden, zero-sized and context-lost scenes pause. Resize and context restoration redraw. Unmount releases observers, controls, frames and GPU resources. The asset provider checks the preview models by revision and falls back to procedural visuals on import failure. [Instrument model guide](../guides/instrument-models.md)

The current source skips an equivalent camera preset. When the previous draw took at least as long as the transition, the renderer applies the final pose directly. Both choices limit redundant rendering while keeping graph commands and electrical connectivity independent of view state. [Scene manager](../../../src/three/SceneManager.ts)

See the [workbench guide](../guides/workbench.md) for editor behavior and [verification](../contributing/verification.md) for the two browser test boundaries.
