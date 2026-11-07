# Use the CIRNET workbench

[Tiếng Việt](../../vi/guides/workbench.md) · [Documentation](../index.md)

## Projects, accounts and assignments

- **New** opens a local draft. **Projects** or Ctrl/Meta+O opens Project Manager. Ctrl/Meta+S saves the bound private server document or opens Save As. Save acknowledges one server revision. A conflict keeps local edits and offers Keep, confirmed Reload or Save As. A late acknowledgement for an older revision leaves newer edits unsaved.
- **Import/Export JSON** exchanges Graph 1.0, 1.1 and 1.2 files separately from server Save. Import checks the UTF-8 size limit of 2,000,000 bytes, geometry, unique IDs, module references and memory data before changing the document. **Undo/Redo** retains up to 50 entries within 20 MB, keeping the newest entry if it alone exceeds that budget. Each completed edit records one step. Failed and unchanged gestures leave history intact.
- Account controls open above the canvas. Sign-in, sign-out and explicit guest transfer use the server session. Recovery drafts are bounded and partitioned by account in IndexedDB. Switching principals checkpoints the previous draft and clears its private document and history. Session rotation for the same principal keeps the document.
- Instructor and administrator assignment edits save a draft. Use Publish to expose a revision to students. The student view omits restricted reference details. Selecting execution history opens authorized evidence independently of the live Run controls.

## Place, select and navigate

| Control | Use |
| --- | --- |
| Component ribbon | Choose a component or instrument visual. For a supported flexible part, select both exact board holes. The Run tab opens execution controls and leaves the current document mounted. |
| Drawers | Collapse Components or Tools to reveal the canvas underneath. Use the floating edge buttons to reopen them. The selected tool, zoom and draft stay active. |
| Select | Click a model or wire to select it. Ctrl/Meta-click toggles multi-selection. Use Marquee Select to select an area, or the Inventory and Inspector for keyboard selection. Drag a model or empty space to pan XZ in Select mode. |
| Move | Drag a visible model after the four-pixel threshold to preview its new position and attached wires. Release commits one move. The model retains its elevation and rotation. Escape cancels the preview. |
| Rotate and delete | Rotate or press R for a quarter turn. Delete or Backspace removes the selection. Undo can restore it with its connected edges. |
| Transform gizmo | Move a placement preview or selected model along X, Z or free XZ, and rotate around Y. Hovering a handle pauses placement follow so you can grab it. Click outside to commit the preview pose, or right-click or press Escape to cancel it. |
| Workspace Object Snap | Snap movement to 0.5 world units and rotation to 90° for mechanical models or 15° for other models. With snap off, arrows move 0.1 units and the gizmo rotates continuously. |
| Component Info | View or edit properties, open the physical pinout, enable Show pins, or preview and apply Rebuild component geometry. Add starts an independent placement draft. |
| View | Right-drag to orbit, middle-drag to pan and use the wheel or status-bar controls to zoom. Fit frames the circuit. For Zoom To Area, select the adjacent button and drag a rectangle. Fit and Area establish a new 100% reference within the 50–1000% range and preserve heading. Escape cancels the Area tool. |

Breadboards start at world yaw 0°. Other known models initially face the camera. A rotated draft retains its pose while you navigate. Docking uses compatible geometry and supported flexible attachments identify exact contacts. Electrical connectivity comes from graph edges and declared board topology. See the [placement guide](https://github.com/cirnetlab/cirnet-remote/blob/13a35145b6d15644c7be10d95a5410bf69e11867/docs/COMPONENT_PLACEMENT.md) and [historical rotation verification](https://github.com/cirnetlab/cirnet-remote/blob/745077403f233790bdb6781c36d6502feca01642/docs/verification/2026-10-15-placement-world-policy.md).

On the canvas, the arrow keys move the selected object and Escape cancels placement, wiring or a move preview. Floating windows support Escape to close and return focus. Outside form fields, use Ctrl/Meta+N/O/S/Z for New, Projects, Save and Undo, and Ctrl/Meta+Shift+Z or Ctrl/Meta+Y for Redo.

## Route wires and edit memory

1. Choose a jumper color and Free, Orthogonal or Auto routing. New wires default to Free. Legacy wires without explicit visual metadata retain Auto.
2. Click the first exact contact or logical port. Right-click to add corners, then click the last endpoint. Right-click again at the same snapped point or before moving four pixels to remove the last provisional corner. Backspace or Delete also removes the last corner. Escape cancels the wire and Alt bypasses snap where supported.
3. Select a finished wire to drag its user bends or spans, double-click a span to add an anchor, or select a bend and press Delete. Each completed gesture keeps the endpoints fixed and commits one undoable edit.
4. Use Down, Up or Top to adjust the selected wire's lane or crossing order. Select next overlapping wire cycles through the conflict group. Parallel lanes and local bridges are visual projections. The saved endpoints and user anchors govern edits and connectivity.

Select a generic MEMORY component and open **Hex Editor** to load or save an image, edit bytes and Apply. Memory v1 stores 1–256 eight-bit words. A new instance starts with 32 zero bytes.

## Run, use instruments and read captures

Use **Inspector** to choose the execution target and configure typed capture, clock and test vectors. Run submits an immutable snapshot. Correct invalid numeric input before Run or Apply. Trigger drafts remain local because current adapters expose no confirmed trigger producer. Stop can cancel a pending Create, and reconnect reconciles the original operation without resubmitting Run.

- **Power Supply** edits the selected source's voltage, current limit and power state through the document. Displayed voltage and current are requested settings. Power stays unknown.
- **Function Generator** shows requested settings and the selected profile's channel availability. Live Apply requires the current tab's acknowledged Run, an owned running execution with a lease, and a supported allocated channel. ACCEPTED records acceptance. APPLIED requires explicit driver acknowledgement. A lost acknowledgement keeps the original operation identity and blocks another Apply until reconciliation or context teardown.
- **Signal Monitor** reads authorized digital NCAP v1 evidence, preserving ordering, timestamps and `0`, `1` and `X`. **Scope** keeps analog acquisition disabled in the default virtual profile. Its analog viewer can display supplied, decoded NCAP v2 evidence with calibration and clock information.

The bench models in the Component ribbon are visual assets. The tools open the control windows. See [instrument models](instrument-models.md) and the [graph and service boundaries](../architecture/workbench.md).

See the historical verification for [navigation](https://github.com/cirnetlab/cirnet-remote/blob/745077403f233790bdb6781c36d6502feca01642/docs/verification/2026-10-14-workbench-ux.md) · [compact routing](https://github.com/cirnetlab/cirnet-remote/blob/745077403f233790bdb6781c36d6502feca01642/docs/verification/2026-10-15-compact-wire-routing.md) · [earlier stacking design](https://github.com/cirnetlab/cirnet-remote/blob/745077403f233790bdb6781c36d6502feca01642/docs/verification/2026-10-15-wire-visual-stacking.md).
