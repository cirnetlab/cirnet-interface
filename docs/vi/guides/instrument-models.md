# Bảo trì mô hình Function Generator và Oscilloscope

[English](../../en/guides/instrument-models.md) · [Mục lục](../index.md)

Hai mục thiết bị trong bảng linh kiện là mô hình hiển thị. Bàn làm việc dùng factory tạo mô hình bằng mã cùng quy trình đặt, chọn, biến đổi, Undo/Redo và lưu đồ thị hiện có. Màn hình 3D minh họa mặt trước thiết bị. Thao tác đo hoặc phát tín hiệu thực tế tách riêng và phụ thuộc profile trạm cùng trình điều khiển. Xem [hướng dẫn bàn làm việc](workbench.md).

## Quy ước tọa độ và tài nguyên

Cả hai mô hình dùng đơn vị thế giới của trình biên tập, gốc ở tâm đáy, Y hướng lên và +Z hướng ra trước. `visual_chassis` ngả vỏ, màn hình, hình vẽ và điều khiển về sau 10° quanh trục X cục bộ. Node gốc thiết bị giữ nguyên vị trí, góc xoay Y và tỷ lệ. `InstrumentChassis.ts` đo đỉnh thật của cụm lắp ráp để đặt độ cao khung, giữ cạnh sau vỏ và các giá đỡ tiếp xúc mặt phẳng Y=0. Núm xoay quanh Z cục bộ. Nút có hướng nhấn theo Z cục bộ, còn thao tác chọn thông thường chọn cả mô hình.

| Quy ước | Function Generator 2 CH | Oscilloscope 2 CH |
| --- | --- | --- |
| Loại trong bảng và kích thước hiển thị | `GENERATOR`, `[6,3.6,2.8]` | `OSCILLOSCOPE`, `[6,3.8,2.8]` |
| Nguồn chính | `FunctionGeneratorModel.ts`, `FunctionGeneratorArtwork.ts`, `GENERATOR_LAYOUT` | `OscilloscopeModel.ts`, `OscilloscopeArtwork.ts`, `SCOPE_LAYOUT` |
| Màn hình | `screen` không chịu ánh sáng, 1024×768, minh họa CH1 sin và CH2 vuông | `screen` không chịu ánh sáng, 1024×704, minh họa CH1 vuông và CH2 sin |
| Điều khiển có tên | `encoder_knob`, sáu mesh `soft_key_*`, ba hàng phím chức năng và các phím mũi tên | Bảy núm có tâm xoay, nhóm nút Horizontal và Trigger, điều khiển CH1/CH2 và đèn nguồn riêng |
| Đầu nối | `ch1_output`, `ch2_output`, `sync_counter` | `ch1_bnc`, `ch2_bnc`, `trig_out_bnc` |
| Giá đỡ | Thanh `tilt_stand` và `visual_supports` | `tilt_foot_left`, `tilt_foot_right` và `visual_supports` |
| GLB đã giao | 18.038 tam giác, 84 mesh, 1.460.816 byte | 16.926 tam giác, 94 mesh, 1.219.028 byte |

Màn hình Generator L1571979 minh họa Frequency, Amplitude, Offset, Duty và Phase cho mỗi kênh. Sync/Counter tách khỏi hai đầu ra. Oscilloscope có màn hình dạng sóng rộng cùng các nhóm Horizontal, Trigger và Vertical. Trig Out là đầu ra bên cạnh hai đầu vào. Kích thước mô hình mô tả bố cục mặt trước theo đơn vị trình biên tập. Cụm Oscilloscope ngả có chiều cao chiếu lớn hơn một chút, còn giới hạn gizmo theo toàn bộ mô hình.

[GLB Generator](../../../public/models/function-generator-2ch/function-generator-2ch.glb) và [GLB Oscilloscope](../../../public/models/oscilloscope-2ch/oscilloscope-2ch.glb) đã giao đều chứa đủ dữ liệu. Với dạng tệp ngoài, giữ glTF cùng `.bin`, `screen.png`, `legends.png` và `owl.png` tương ứng. Tệp nhập giữ tên và vật liệu ban đầu. Vật liệu và thương hiệu của mô hình tạo bằng mã hiện tại có thể khác. Xem [nguồn gốc Generator](../../../public/models/function-generator-2ch/README.md), [nguồn gốc Oscilloscope](../../../public/models/oscilloscope-2ch/README.md) và [tương thích namespace](../architecture/namespace.md).

## Kiểm tra tài nguyên đã chọn

Thực hiện [thiết lập dependency đã xem xét](getting-started.md), chạy `npm run dev` và mở `/function-generator-preview.html` hoặc `/oscilloscope-preview.html` tại origin của Vite. Cả hai trang cũng có trong bản build sản xuất. Dùng các góc nhìn Front, Side và Angled trên lưới Y=0 rồi thử điều khiển CanvasTexture. Xác nhận trang báo đã tải GLB trước khi dùng hình ảnh làm bằng chứng cho gói xuất. Khi nhập thất bại, trang dùng mô hình tạo bằng mã dự phòng.

Provider kiểm tra SHA-256 và giới hạn 2.000.000 byte của từng mô hình, dùng chung lượt tải đang chờ và giải phóng tài nguyên khi thoát. `screen` là mesh độc lập. CanvasTexture thay thế dùng `SRGBColorSpace` và `flipY = false` trên màn hình glTF đã nhập, còn màn hình tạo bằng mã dùng `flipY = true`. Dùng lại texture và đặt `needsUpdate = true` sau khi vẽ lại. Hủy map cũ khi đổi texture và giải phóng tài nguyên mô hình sở hữu khi đóng trình xem. Xem [mô tả tài nguyên](../../../src/data/instrumentAssets.ts) và [mã nguồn xem trước](../../../src/preview/instrumentPreview.ts).

## Tạo bản xuất thay thế

Chỉ chạy script tạo tài nguyên trong bản sao đã chuẩn bị khi có chủ đích làm bản thay thế. Script ghi trực tiếp vào thư mục `public/models` tương ứng và đường dẫn SVG trong bảng linh kiện của bản sao đó. Tài nguyên đã giao được chọn theo mã băm, vì vậy khi nhận bản xuất mới cần xem xét dữ liệu, mô tả phiên bản và nguồn gốc của nó. Script dùng `GLTFExporter` của Three.js và công thức hình vẽ dùng chung, với `sharp` để raster hóa ngoại tuyến. Có thể chọn bản rasterizer đã cài ở nơi khác bằng `-- --sharp-module /absolute/path/to/sharp`.

```sh
npm run export:generator
npm run export:oscilloscope
npm test
```

Script xuất GLB, glTF, BIN, decal PNG và hình minh họa SVG/PNG. Kiểm tra GLB thật bằng trang xem trước. Bộ kiểm thử bao quát bố cục, điểm xoay, giới hạn hình học, đặt mô hình, độ ngả của vỏ và tiếp xúc của giá đỡ, buffer PNG và xuất rồi tải lại bằng GLTFLoader. Giữ ảnh chụp, trace và so sánh thô trong phiên do allocator cấp. Xem [script xuất Generator](../../../scripts/export-function-generator.mjs), [script xuất Oscilloscope](../../../scripts/export-oscilloscope.mjs), [kiểm thử tài nguyên](../../../tests/gltf-assets.test.ts), [kiểm thử khung](../../../tests/instrument-chassis.test.ts) và [quy định kiểm chứng](../../VERIFICATION.md).
