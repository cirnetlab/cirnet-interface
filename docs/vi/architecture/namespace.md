# Tương thích namespace CIRNET

[English](../../en/architecture/namespace.md) · [Mục lục](../index.md)

`cirnet-interface` chứa `@cirnet/web` 0.1.4. Ứng dụng dùng `@cirnet/contracts@0.1.2` khi chạy. Kiểm thử bổ sung dùng tài nguyên từ sdist Python `cirnet-contracts` đã chọn. Môi trường phát triển và CI cấp thư mục chẩn đoán qua `@cirnet/artifact-paths@1.0.0-m1.0`. Build phát hành yêu cầu định danh gói chính thức. [Khóa gói](../../../integration/contracts-artifacts.json) · [Khóa npm](../../../package-lock.json) · [Thiết lập đã kiểm chứng](../guides/getting-started.md)

## Môi trường

Với các script dùng adapter tương thích, `CIRNET_*` được ưu tiên hơn `NETCIRCUIT_*` cho cùng hậu tố. Giá trị chính thức được đặt tường minh là rỗng vẫn được ưu tiên. Nếu chỉ có giá trị cũ, adapter chấp nhận giá trị đó. Adapter đồng bộ hai cách viết cho công cụ con. Adapter allocator chuyển giá trị phiên và context do allocator đã ghim ghi về các tên chính thức.

| Mục đích | Tên chính thức | Bí danh cũ được chấp nhận |
| --- | --- | --- |
| Cấp thư mục chẩn đoán | `CIRNET_ARTIFACTS_CONTEXT`, `CIRNET_ARTIFACTS_DIR`, `CIRNET_ARTIFACTS_SESSION` | `NETCIRCUIT_ARTIFACTS_CONTEXT`, `NETCIRCUIT_ARTIFACTS_DIR`, `NETCIRCUIT_ARTIFACTS_SESSION` |
| Manifest cục bộ đã xem xét | `CIRNET_CONTRACTS_ARTIFACT_MANIFEST` | `NETCIRCUIT_CONTRACTS_ARTIFACT_MANIFEST` |
| URL gói nguồn | `CIRNET_CONTRACTS_NPM_URL`, `CIRNET_CONTRACTS_SDIST_URL`, `CIRNET_ARTIFACT_PATHS_NPM_URL` | `NETCIRCUIT_CONTRACTS_NPM_URL`, `NETCIRCUIT_CONTRACTS_SDIST_URL`, `NETCIRCUIT_ARTIFACT_PATHS_NPM_URL` |
| Token yêu cầu gói | `CIRNET_ARTIFACTS_TOKEN` | `NETCIRCUIT_ARTIFACTS_TOKEN` |
| Proxy API phát triển | `CIRNET_DEV_API_TARGET` | `NETCIRCUIT_DEV_API_TARGET` |
| Đích và đầu vào riêng của kiểm thử trình duyệt đầy đủ | `CIRNET_E2E_API_TARGET`, `CIRNET_E2E_ADMIN_PASSWORD`, `CIRNET_E2E_DATA_DIR` | `NETCIRCUIT_E2E_API_TARGET`, `NETCIRCUIT_E2E_ADMIN_PASSWORD`, `NETCIRCUIT_E2E_DATA_DIR` |

CI chọn URL từ khóa trong Git. URL không rỗng do người vận hành chỉ định phải khớp khóa. Workflow đọc `CIRNET_ARTIFACTS_READ_TOKEN` và dùng secret `NETCIRCUIT_ARTIFACTS_READ_TOKEN` đã cấp làm phương án dự phòng. Xem [adapter môi trường](../../../scripts/environment.mjs), [adapter allocator](../../../scripts/artifact-paths.mjs) và [workflow](../../../.github/workflows/frontend.yml).

## Dữ liệu trình duyệt và giao thức

| Ranh giới | Hành vi tương thích |
| --- | --- |
| Bản ghi và bản xuất khôi phục | Bản ghi và bản xuất mới dùng `cirnet.recovery` phiên bản 1. Bộ đọc chấp nhận `netcircuit.recovery` phiên bản 1 và chuẩn hóa về định dạng chính thức. |
| IndexedDB khôi phục | Dùng `cirnet-document-recovery`. Trong lần đầu sử dụng, một giao dịch sao chép các bản nháp còn thiếu từ `netcircuit-document-recovery` và ghi `migration:netcircuit-document-recovery:v1` cùng dữ liệu sao chép. Bản nháp ở cơ sở dữ liệu mới được ưu tiên khi trùng. Cơ sở dữ liệu cũ giữ nguyên. Có thể thử lại nếu chuyển đổi thất bại, và mở lại không khôi phục bản nháp đã xóa sau chuyển đổi. |
| Quan sát đang chờ | Ghi cả `cirnet.pending-observations.v1` và `netcircuit.pending-observations.v1`. Giá trị cũ được ưu tiên khi có mặt để các tab cũ còn ghi được. Web Lock cũng dùng `netcircuit.pending-observations.v1`. Các bản ghi này dùng để theo dõi quan sát. Bí danh không làm xuất hiện lại quan sát đã hoàn tất. Khôi phục quan sát không chạy lại lệnh. |
| Kéo thả linh kiện | Ghi `application/x-cirnet-component` và `application/x-netcircuit-component`. Đọc tên chính thức trước. |
| CSRF và phiên | Khi có giá trị CSRF, gửi cùng giá trị trong `X-CIRNET-CSRF` và `X-CSRF-Token`. Kiểm thử trình duyệt thật nhận `cirnet_session` và `netcircuit_session`, yêu cầu ít nhất một cookie đã xem xét, kiểm tra từng cookie nhận diện được và yêu cầu thông tin xác thực khớp nhau khi có cả hai tên. |
| Bản thu | Yêu cầu `application/vnd.cirnet.capture; version=1`. Chấp nhận phản hồi `application/vnd.cirnet.capture` và `application/vnd.netcircuit.capture` với cùng kiểm tra nghiêm ngặt về phiên bản và kích thước. |
| Trạng thái API | Schema đã chọn chấp nhận `cirnet-api` và `netcircuit-api`. Adapter kiểm tra payload gốc trước. Nếu bộ kiểm tra từ chối định danh chính thức, adapter có thể thử với định danh cũ và vẫn trả payload gốc. |

Xem [bộ đọc khôi phục](../../../src/application/projects/recovery.ts), [adapter IndexedDB](../../../src/services/recovery/indexedDb.ts), [lưu trữ quan sát](../../../src/services/recovery/pendingObservations.ts), [API client](../../../src/services/api/client.ts), [kiểm tra trạng thái](../../../src/contracts/structural.ts) và [kiểm tra cookie phiên](../../../e2e/session-cookies.ts).

## Định danh lịch sử và bằng chứng tài nguyên

Các gói Interface 0.1.1–0.1.3 đã phát hành giữ metadata gói và mã băm ban đầu trong hồ sơ phát hành và các phiên bản từng sử dụng chúng. Các bản ghim chính thức chọn đầu vào mới và giữ nguyên gói lịch sử. Khóa phát hành, fixture đã ghim, mục kiểm chứng theo thời điểm và hình vẽ gốc giữ tên nhận diện đúng dữ liệu đã ghi. Bộ đọc, bộ ghi và kiểm thử tương thích tiếp tục xử lý cả hai thế hệ. [Đợt chuyển đổi namespace](../../en/history/verification-ledger.md#2026-11-04-canonical-source-names) giữ nguyên byte của giấy phép, tài nguyên mô hình đã giao, đầu vào baseline và fixture lịch sử.

### Thương hiệu thiết bị và định danh tài nguyên được giữ lại

Chữ trên mặt PSU, Function Generator và Oscilloscope đang chạy dùng `CIRNET`. Lần cập nhật thương hiệu giữ nguyên bố cục hai màu, điểm neo, font, hình học mặt thiết bị và hành vi điều khiển. [Kiểm thử cảnh](../../../tests/scene.test.ts) kiểm tra tên in trên mặt thiết bị.

Factory tạo mô hình bằng mã và script xuất hiện tại dùng `cirnet_function_generator_2ch` và `cirnet_oscilloscope_2ch`. Script xuất ghi metadata mô hình `CIRNET`. Tệp GLB/glTF đã giao giữ `net_circuit_function_generator_2ch` và `net_circuit_oscilloscope_2ch`, cùng hình học, texture, hình vẽ, nhãn mô hình, mã băm và README nguồn gốc đi kèm. Kiểm thử tải mô hình kiểm tra tên đã giao, còn kiểm thử factory kiểm tra node gốc chính thức. Lần cập nhật thương hiệu giữ nguyên từng byte của gói xuất đã duyệt và baseline hình ảnh. Xem [hướng dẫn mô hình thiết bị](../guides/instrument-models.md) và [hồ sơ kiểm chứng theo thời điểm](../../en/history/verification-ledger.md#2026-11-04-canonical-source-names).
