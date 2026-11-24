# Kiến trúc Interface

[English](../../en/architecture/workbench.md) · [Mục lục](../index.md)

Một bàn làm việc Vue 3 đang hoạt động phối hợp tài liệu mạch hiện tại, trạng thái Pinia và cảnh Three.js. Lệnh đồ thị quản lý chỉnh sửa tài liệu và lịch sử. Cảnh biểu diễn đồ thị và có trạng thái tương tác, dựng hình tạm thời. Điểm gấp dây, giao cắt hiển thị, panel phủ và vị trí camera không thể tạo hoặc đổi kết nối điện.

| Bên sở hữu | Ranh giới |
| --- | --- |
| Interface | Bàn làm việc trên trình duyệt, lệnh và lịch sử `CircuitGraph`, biểu diễn breadboard bằng Three.js, panel thiết bị đo và client Lab có kiểu dữ liệu. |
| Contracts | Schema và dữ liệu danh mục chuẩn, cùng gói SDK trình duyệt sử dụng. |
| Remote và dịch vụ trạm | Remote phân quyền thao tác Lab và sở hữu API thực thi cùng lease. Hardware áp dụng bảo vệ cục bộ và sở hữu truy cập FPGA nội bộ. Trình duyệt hiển thị quyết định của dịch vụ. |

## Trách nhiệm trong mã nguồn

Interface gom các tính năng liên quan trong từng lớp có ranh giới phụ thuộc riêng.

| Mã nguồn | Trách nhiệm |
| --- | --- |
| [`src/components/workbench/`](../../../src/components/workbench) và [`src/components/windows/`](../../../src/components/windows) | Khung bàn làm việc Vue, vùng quan sát, ribbon và phần hiển thị cửa sổ. Cửa sổ thiết bị hiển thị điều khiển và kết quả quan sát. |
| [`src/composables/`](../../../src/composables) và [`src/editor/`](../../../src/editor) | Kết nối giao diện và xử lý thao tác đặt, chọn, chỉnh sửa linh kiện và đi dây. |
| [`src/domain/document/`](../../../src/domain/document) và [`src/domain/capture/`](../../../src/domain/capture) | Lệnh đồ thị thuần, lịch sử, phiên bản và định dạng tài liệu, cùng phần giải mã và kiểm tra bản thu. |
| [`src/electrical/`](../../../src/electrical), [`src/geometry/`](../../../src/geometry) và [`src/wires/`](../../../src/wires) | Tô pô và kết nối điện, tư thế và ràng buộc cơ khí, cùng đường đi và hình thức dây. |
| [`src/three/`](../../../src/three) | Biểu diễn cảnh, dựng hình, chọn đối tượng và quản lý vòng đời tài nguyên. [`three/package/`](../../../src/three/package) tạo vỏ linh kiện bằng mã. [`three/instruments/`](../../../src/three/instruments) quản lý mô hình tạo bằng mã của bộ cấp nguồn, oscilloscope và generator cùng hình vẽ và khung thiết bị dùng chung. |
| [`src/application/`](../../../src/application) | Luồng nghiệp vụ dự án, bài tập, thực thi và thiết bị. Các cổng ứng dụng khai báo dịch vụ mà những luồng này cần. |
| [`src/stores/`](../../../src/stores) | Lớp Pinia và trạng thái trình duyệt của tài liệu, bàn làm việc, UI, phiên, dự án, bài tập, trạm, thực thi và thiết bị. |
| [`src/services/`](../../../src/services) | Adapter trình duyệt cho REST và WebSocket của Remote, phạm vi phiên, tệp, khôi phục, bản thu và nạp mô hình. |
| [`src/contracts/`](../../../src/contracts), [`src/data/`](../../../src/data) và [`src/types/`](../../../src/types) | Kiểm tra dữ liệu trình duyệt, biểu diễn từ SDK Contracts, danh mục trình biên tập, dữ liệu hiển thị cục bộ và kiểu dữ liệu. Contracts công bố schema dùng chung và danh mục chuẩn. |

Bộ kiểm tra phụ thuộc AST thực thi ranh giới của domain và application thuần, ranh giới truyền tải của bộ dựng hình, danh sách điểm truy cập công khai được duyệt của SDK và quy tắc cấm vòng lặp import lúc chạy giữa các store. [Bộ kiểm tra phụ thuộc](../../../scripts/check-boundaries.mjs)

## Ranh giới đồ thị và hợp đồng

- Tài liệu Graph 1.0 và 1.1 giữ nguyên ý nghĩa. Các thao tác bổ sung của Graph 1.2 mang cụm lắp ráp linh hoạt và descriptor vật lý tự do đã ghim. Kết nối bảng mạch linh hoạt chỉ rõ cả hai lỗ. Interface chịu trách nhiệm kiểm tra ngữ nghĩa và chuẩn hóa trước khi ghi nhận chỉnh sửa.
- DTO sinh tự động và bộ kiểm tra lúc chạy từ `@cirnet/contracts` định nghĩa ranh giới REST và WebSocket. Gói npm Contracts và tài nguyên kiểm thử lấy từ khóa gói đã xem xét. DEV allocator chỉ dùng trong công cụ build và kiểm thử.
- Biến đổi ribbon và drawer cập nhật bố cục DOM mà không vẽ thêm canvas khi cảnh không đổi. Thay đổi thực sự của cảnh hoặc camera vẫn được vẽ. Kiểm tra trình duyệt độc lập dùng cảnh thật và giữ nguyên chuẩn đối chiếu pixel.

## Dịch vụ ứng dụng và lưu trữ

Remote cung cấp xác thực, dự án riêng, xuất bản bài tập, hàng đợi thực thi và lịch sử. API cấp cookie phiên HttpOnly. Interface giữ trạng thái CSRF trong bộ nhớ và tách bản khôi phục theo danh tính. Chuyển dữ liệu khách cần thao tác rõ ràng. Xung đột phiên bản giữ bản chỉnh sửa cục bộ, còn Import và Export là hai thao tác riêng. IndexedDB lưu bản nháp khôi phục. Xuất bản bài tập tách khỏi chỉnh sửa bản nháp. Quan sát và lịch sử có thể báo cáo thao tác mà không chạy lại.

Profile ảo trả payload bản thu số được hỗ trợ dưới dạng NCAP. Tính năng vật lý và tương tự phụ thuộc profile đã chọn và trình điều khiển đã triển khai. Profile ảo mặc định chưa có thao tác phần cứng Scope và Generator. Remote và Hardware quyết định thí nghiệm có thể chạy an toàn hay không. Xem [kiến trúc Lab-First](https://github.com/cirnetlab/cirnet-remote/blob/master/docs/cirnet-architecture-lab-first-vi.md).

Trang xem trước thiết bị đo độc lập và thao tác chỉnh sửa cục bộ kiểm tra hành vi trình duyệt. Kiểm thử trình duyệt E2E cho gói sản phẩm dùng Remote đã cài, gói Interface tương ứng và luồng Hardware và Simulator thật. [Kiểm chứng](../contributing/verification.md)


## Quyền quản lý tài liệu và cảnh

Lõi tài liệu thuần quản lý lệnh, lịch sử, tuần tự hóa và theo dõi phiên bản. Lớp Pinia của mạch phối hợp các thao tác này với giao diện Vue đang mở. Xác thực, dự án, bàn làm việc, trạm, thực thi, thiết bị và UI có vòng đời riêng. Store thực thi và thiết bị phối hợp qua bộ điều khiển ứng dụng. Tuyến dự án máy chủ bật Save, Save As và Export sau khi tài liệu yêu cầu tải xong.

Tài nguyên cảnh nằm ngoài Pinia. Bộ dựng hình gộp thay đổi đồ thị, camera và thao tác vào khung hình. Cảnh ẩn, kích thước bằng không hoặc mất ngữ cảnh sẽ tạm dừng. Đổi kích thước và khôi phục ngữ cảnh sẽ vẽ lại. Khi tháo cảnh, ứng dụng giải phóng bộ quan sát, điều khiển, khung hình và tài nguyên GPU. Bộ cung cấp tài nguyên kiểm tra phiên bản của mô hình xem trước và dùng mô hình tạo bằng mã khi nhập thất bại. [Hướng dẫn mô hình thiết bị](../guides/instrument-models.md)

Mã nguồn hiện tại bỏ qua cấu hình camera định sẵn nếu góc nhìn tương đương. Khi lần vẽ trước mất ít nhất bằng thời lượng chuyển cảnh, bộ dựng hình áp dụng trực tiếp tư thế cuối. Hai quy tắc giảm lượt vẽ dư thừa và giữ lệnh đồ thị cùng kết nối điện độc lập với trạng thái hiển thị. [Bộ quản lý cảnh](../../../src/three/SceneManager.ts)

Xem [hướng dẫn bàn làm việc](../guides/workbench.md) về cách chỉnh sửa và [kiểm chứng](../contributing/verification.md) về hai phạm vi kiểm thử trình duyệt.
