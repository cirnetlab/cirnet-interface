# Interface architecture

[Tiếng Việt](../../vi/architecture/workbench.md) · [Documentation](../index.md)

One mounted Vue 3 workspace coordinates the active circuit document, Pinia state and the Three.js scene. Graph commands own document edits and history. The scene projects the graph and has transient interaction and rendering state. Wire bends, visual crossings, panel overlays and camera positions cannot create or change electrical connectivity.

| Owner | Boundary |
| --- | --- |
| Interface | Browser workbench, `CircuitGraph` commands and history, the Three.js breadboard projection, instrument panels and typed Lab client. |
| Contracts | Canonical schemas and catalog data, plus the packaged SDK used by the browser. |
| Remote and station services | Remote authorizes Lab actions and owns the execution API and leases. Hardware enforces local protection and owns private FPGA access. The browser displays the service decisions. |

## Source ownership

Interface groups related features within layers that already have distinct dependencies.

| Source | Responsibility |
| --- | --- |
| [`src/components/workbench/`](../../../src/components/workbench) and [`src/components/windows/`](../../../src/components/windows) | Vue workbench shell, viewport, ribbon and window presentation. Instrument windows render controls and observations. |
| [`src/composables/`](../../../src/composables) and [`src/editor/`](../../../src/editor) | UI bindings and editor gestures for placement, selection, editing and wire routing. |
| [`src/domain/document/`](../../../src/domain/document) and [`src/domain/capture/`](../../../src/domain/capture) | Pure graph commands, history, revisions and document formats, plus capture decoding and validation. |
| [`src/electrical/`](../../../src/electrical), [`src/geometry/`](../../../src/geometry) and [`src/wires/`](../../../src/wires) | Electrical topology and connectivity, mechanical poses and constraints, and wire routing and appearance. |
| [`src/three/`](../../../src/three) | Scene projection, rendering, picking and resource lifecycle. [`three/package/`](../../../src/three/package) owns procedural component packages. [`three/instruments/`](../../../src/three/instruments) owns the procedural supply, oscilloscope and generator visuals and shared artwork and chassis. |
| [`src/application/`](../../../src/application) | Project, assignment, execution and instrument workflows. Application ports express the services these workflows need. |
| [`src/stores/`](../../../src/stores) | Pinia facades and browser state for the document, workspace, UI, session, projects, assignments, station, execution and instruments. |
| [`src/services/`](../../../src/services) | Browser adapters for Remote REST and WebSocket, session scope, files, recovery, captures and model loading. |
| [`src/contracts/`](../../../src/contracts), [`src/data/`](../../../src/data) and [`src/types/`](../../../src/types) | Browser validation and projections of the Contracts SDK, editor catalogs, local presentation data and types. Contracts publishes the shared schemas and canonical catalogs. |

The AST dependency check enforces the pure domain and application boundaries, the renderer transport boundary, approved public SDK entrypoints and acyclic store runtime imports. [Dependency checker](../../../scripts/verification/check-boundaries.mjs)

Within the UI layer, workbench chrome, palette, execution and wire controls have separate homes. Editor, instrument and lab windows are grouped with their UI responsibilities. Shared floating-window mechanics stay in `components/windows/`.

Selection and pointer placement live under `editor/selection/` and `editor/interaction/`. Electrical connectivity and mounting are separate, and mechanical geometry groups breadboard and placement functions. Three.js groups scene, camera, breadboard, selection, labels, packages, instruments and wires beneath its renderer boundary. Pinia groups document, lab and workbench state. REST and WebSocket services expose their existing entrypoints from their own directories.

## Graph and contract boundaries

- Graph 1.0 and 1.1 documents retain their meaning. Additive Graph 1.2 operations carry flexible assemblies and pinned free physical descriptors. A flexible board connection names both exact holes. Interface owns semantic validation and normalization before committing an edit.
- Generated DTOs and runtime validators from `@cirnet/contracts` define the REST and WebSocket boundaries. The selected Contracts npm package and test resources come from the reviewed artifact lock. The DEV allocator stays in build and test tooling.
- Ribbon and drawer transforms update DOM layout without an extra draw of an unchanged canvas. Genuine scene or camera changes still draw. The native browser checks exercise the real scene and preserve the pixel oracle.

## Application services and persistence

Remote supplies authentication, private projects, assignment publication, execution queues and history. The API issues HttpOnly session cookies. Interface keeps CSRF state in memory and partitions browser recovery by principal. Guest transfer is explicit. Revision conflicts preserve local edits, and Import and Export are separate user actions. IndexedDB stores recovery drafts. Publishing an assignment is separate from editing its draft. Observation and history can report an operation without replaying it.

The virtual profile returns supported digital capture payloads as NCAP. Physical and analog capabilities depend on the selected profile and implemented driver. The default virtual profile leaves Scope and Generator unavailable as hardware actions. Remote and Hardware decide whether an experiment can run safely. See the [Lab-First Architecture](https://github.com/cirnetlab/cirnet-rules/blob/master/docs/tai-lieu-kien-tuc-he-thong/cirnet-architecture-lab-first-en.md).

Standalone instrument previews and local editing exercise browser behavior. Packaged browser E2E exercises an installed Remote with the matching Interface archive and the real Hardware and Simulator chain. [Verification](../contributing/verification.md#browser-against-the-installed-native-product)


## Document and scene ownership

The pure document core owns commands, history, serialization and revision tracking. The Pinia circuit facade coordinates those operations with the mounted Vue shell. Authentication, projects, workspace, station, execution, instruments and UI keep separate lifetimes. The execution and instrument stores coordinate through an application controller. Server routes enable Save, Save As and Export only after the requested document hydrates.

Scene resources stay outside Pinia. The renderer coalesces graph, camera and gesture updates into animation frames. Hidden, zero-sized and context-lost scenes pause. Resize and context restoration redraw. Unmount releases observers, controls, frames and GPU resources. The asset provider checks the preview models by revision and falls back to procedural visuals on import failure. [Instrument model guide](../guides/instrument-models.md)

The current source skips an equivalent camera preset. When the previous draw took at least as long as the transition, the renderer applies the final pose directly. Both choices limit redundant rendering while keeping graph commands and electrical connectivity independent of view state. [Scene manager](../../../src/three/scene/SceneManager.ts)

See the [workbench guide](../guides/workbench.md) for editor behavior and [verification](../contributing/verification.md) for the two browser test boundaries.

## Light Workbench

`src/workbench-light.css` owns the light chrome tokens. Navy `#102c50` frames
the app, cyan `#5ce6fb` identifies CIRNET, and blue `#184f9d` identifies
interactive controls. Neutral panels and a slate 3D background keep focus on
the circuit. Local Segoe UI supports Vietnamese glyphs. Measurements and inputs
use tabular figures where useful. Generic and custom commands use the shared
`WorkbenchIcon` SVG paths. Library and instrument artwork retains its existing
asset manifest and provenance.

Project Explorer selects graph components and opens the existing libraries
and experiment history. The Inspector button opens the right-hand PropertyManager.
Sections are collapsible and edits still use the existing document commands. Header buttons restore either
panel. Focus Mode temporarily hides the docks, tools and Ribbon and restores
their previous visibility. Dock widths adapt to the viewport. The canvas
stays mounted and the fit command uses the unobstructed work area. Ctrl+Q
opens search for the available File commands.

The seven CIRNET LAB concepts guide the layout. The current editor provides
a 3D Workbench. Schematic editing requires a product model and rendering
surface. The concept circuits and instrument readings are visual references.

### Workbench icons

Use the shared [WorkbenchIcon](../../../src/components/workbench/chrome/WorkbenchIcon.vue)
registry for commands. Its outline icons use a 24 × 24 viewBox, a 1.6-unit
rounded stroke and `currentColor`. Search and Project Explorer show the
shared style for navigation, and Wire, Probe and Scope show the same style
for engineering actions. Label the button or control, then keep its SVG
decorative. Use the existing illustrated artwork separately for part and
instrument previews, with provenance recorded in the [asset manifest](../../../src/assets/icons/manifest.json).
