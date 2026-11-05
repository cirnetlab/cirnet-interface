# Using the CIRNET workbench

[Tiếng Việt](../../vi/guides/workbench.md) · [Documentation](../index.md)

## Edit and move components

Select a component to inspect its properties. Move mode supports direct dragging after a four-pixel threshold. The transform gizmo stays at the selected component's pivot. The Tools ribbon and Component drawer overlay the workspace. Collapsing them leaves the underlying canvas dimensions alone. Keyboard focus and reduced-motion behavior follow the controls' visible state.

Use arrows to nudge, `R` to rotate, Delete to remove and Escape to cancel an active gesture. Snap uses a 0.5-unit translation step and 90° mechanical or 15° general rotation. With snap off, an arrow nudge moves 0.1 units. Breadboard docking uses the board pose and compatible holes. A placement preview preserves rotation, and the document changes when you commit the placement. Fit, Home and Area establish the 100% zoom reference. The workspace supports 50–1000% zoom relative to that reference.

One committed gesture makes one history entry. Undo/Redo retains up to 50 entries within a 20 MB budget and retains the immediate entry if it alone exceeds the budget. Import accepts a validated UTF-8 graph up to 2 MB. Export saves a graph separately from server persistence. Use the [editor reference](../../../README.md) for the full input table and model details.

## Route and edit wires

New wires default to Free routing, while legacy wires without an explicit mode retain Auto. Free, Orthogonal and Auto are available with ten wire colors. Select endpoints with the primary button and add bends with the secondary button. Repeating the secondary click at the same snapped point or within four pixels undoes the last bend. Escape cancels the active route. Alt temporarily bypasses snap where supported.

Existing bend and segment edits keep endpoints fixed and preserve unedited anchors. Parallel lanes and crossing order are visual aids derived from the original wire geometry. Electrical connectivity follows the graph endpoints. The memory component uses a version 1, 8-bit image of 1–256 bytes and starts with 32 zero bytes.

## Open instruments and inspect a capture

The instrument windows use typed clocks, test vectors and captures. Supported digital captures use `0`, `1` and `X`. Apply leases a channel when the selected profile supports it. Scope and Generator hardware actions are unavailable by default in the virtual profile. The availability state follows the selected driver and profile. See [architecture](../architecture/workbench.md) for the graph and service boundaries.
