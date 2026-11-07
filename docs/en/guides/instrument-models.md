# Maintain the Function Generator and Oscilloscope models

[Tiếng Việt](../../vi/guides/instrument-models.md) · [Documentation](../index.md)

The two instrument palette entries are visual models. The workbench uses the procedural factories and its existing placement, selection, transforms, Undo/Redo and graph persistence. The 3D screens illustrate the front panels. Actual instrument actions are separate and depend on the station profile and driver. See the [workbench guide](workbench.md).

## Coordinate and asset contracts

Both models use editor world units, a center-bottom origin, Y up and +Z forward. `visual_chassis` pitches the case, screen, artwork and controls backward 10° around its local X axis. The instrument root retains its position, Y rotation and scale. `InstrumentChassis.ts` measures actual assembly vertices to set the chassis height, keeping the rear of the case and the ground-aligned supports at Y=0. Knobs rotate around local Z. Buttons have a local Z press direction, while ordinary picking selects the complete model.

| Contract | Function Generator 2 CH | Oscilloscope 2 CH |
| --- | --- | --- |
| Palette type and visual size | `GENERATOR`, `[6,3.6,2.8]` | `OSCILLOSCOPE`, `[6,3.8,2.8]` |
| Main sources | `FunctionGeneratorModel.ts`, `FunctionGeneratorArtwork.ts`, `GENERATOR_LAYOUT` | `OscilloscopeModel.ts`, `OscilloscopeArtwork.ts`, `SCOPE_LAYOUT` |
| Display | Unlit `screen`, 1024×768, CH1 sine and CH2 square previews | Unlit `screen`, 1024×704, CH1 square and CH2 sine previews |
| Named controls | `encoder_knob`, six `soft_key_*` meshes, three rows of function keys and arrow keys | Seven centered knob pivots, Horizontal and Trigger button groups, CH1/CH2 controls and separate power indicator |
| Connectors | `ch1_output`, `ch2_output`, `sync_counter` | `ch1_bnc`, `ch2_bnc`, `trig_out_bnc` |
| Supports | `tilt_stand` bail and `visual_supports` | `tilt_foot_left`, `tilt_foot_right` and `visual_supports` |
| Delivered GLB | 18,038 triangles, 84 meshes, 1,460,816 bytes | 16,926 triangles, 94 meshes, 1,219,028 bytes |

The Generator L1571979 screen illustrates Frequency, Amplitude, Offset, Duty and Phase for each channel. Sync/Counter is separate from its two outputs. The Oscilloscope shows a wide waveform screen with Horizontal, Trigger and Vertical sections. Trig Out is an output alongside the two inputs. The model dimensions describe the front layout in editor units. The pitched Oscilloscope assembly has a slightly greater projected height, and gizmo bounds follow the full model.

The delivered [Generator GLB](../../../public/models/function-generator-2ch/function-generator-2ch.glb) and [Oscilloscope GLB](../../../public/models/oscilloscope-2ch/oscilloscope-2ch.glb) are self-contained. Keep the glTF, matching `.bin`, `screen.png`, `legends.png` and `owl.png` together for the external form. The imported files preserve their original names and materials. Current procedural materials and branding may differ. See [Generator provenance](../../../public/models/function-generator-2ch/README.md), [Oscilloscope provenance](../../../public/models/oscilloscope-2ch/README.md) and [namespace compatibility](../architecture/namespace.md).

## Inspect the selected assets

Use the [reviewed dependency setup](getting-started.md), start `npm run dev` and open `/function-generator-preview.html` or `/oscilloscope-preview.html` on the Vite origin. Both pages are also production build entries. Use Front, Side and Angled views over the Y=0 grid and try the CanvasTexture control. Confirm the page reports a loaded GLB before treating the view as exported asset evidence. It uses a procedural fallback if the import fails.

The provider checks each model's SHA-256 and 2,000,000-byte limit, shares pending loads and releases its resources on exit. The `screen` is an independent mesh. A replacement CanvasTexture uses `SRGBColorSpace` and `flipY = false` on the imported glTF screen, while the procedural screen uses `flipY = true`. Reuse the texture and set `needsUpdate = true` after repainting. Dispose the replaced map when switching textures and release owned model resources when the viewer closes. See the [asset descriptors](../../../src/data/instrumentAssets.ts) and [preview source](../../../src/preview/instrumentPreview.ts).

## Author a replacement export

Run the authoring scripts only in a prepared authoring copy when intentionally creating a replacement. They write directly to the corresponding `public/models` directory and palette SVG path in that copy. The existing delivered assets are selected by digest, so adopting an export also requires reviewing its bytes, revision descriptor and provenance. The scripts use Three.js `GLTFExporter` and the shared artwork recipes, with `sharp` as an offline rasterizer. An alternate installed rasterizer can be selected with `-- --sharp-module /absolute/path/to/sharp`.

```sh
npm run export:generator
npm run export:oscilloscope
npm test
```

The exporters write GLB, glTF, BIN, PNG decals and SVG/PNG illustrations. Review the actual GLB through the preview. The tests exercise layout, pivots, geometry budgets, placement, enclosure pitch and physical support contact, PNG buffers and GLTFLoader round trips. Keep raw screenshots, traces and comparisons in the allocator-owned session. See the [Generator exporter](../../../scripts/export-function-generator.mjs), [Oscilloscope exporter](../../../scripts/export-oscilloscope.mjs), [asset tests](../../../tests/gltf-assets.test.ts), [chassis tests](../../../tests/instrument-chassis.test.ts) and [verification policy](../contributing/verification.md).
