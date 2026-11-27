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

Bộ kiểm tra phụ thuộc AST thực thi ranh giới của domain và application thuần, ranh giới truyền tải của bộ dựng hình, danh sách điểm truy cập công khai được duyệt của SDK và quy tắc cấm vòng lặp import lúc chạy giữa các store. [Bộ kiểm tra phụ thuộc](../../../scripts/verification/check-boundaries.mjs)

Trong layer giao diện, thanh công cụ, bảng linh kiện, điều khiển thực thi và điều khiển dây của bàn làm việc có nhóm riêng. Cửa sổ chỉnh sửa, thiết bị và Lab được nhóm theo trách nhiệm UI. Cơ chế cửa sổ nổi dùng chung nằm trong `components/windows/`.

Chọn đối tượng và tương tác đặt linh kiện nằm trong `editor/selection/` và `editor/interaction/`. Kết nối điện và lắp linh kiện tách nhóm, còn hình học cơ khí phân biệt breadboard và thao tác đặt. Three.js nhóm scene, camera, breadboard, lựa chọn, nhãn, package, thiết bị và dây dưới ranh giới bộ dựng hình. Pinia nhóm trạng thái tài liệu, Lab và bàn làm việc. REST và WebSocket giữ các điểm vào hiện có bên trong thư mục dịch vụ tương ứng.

## Ranh giới đồ thị và hợp đồng

- Tài liệu Graph 1.0 và 1.1 giữ nguyên ý nghĩa. Các thao tác bổ sung của Graph 1.2 mang cụm lắp ráp linh hoạt và descriptor vật lý tự do đã ghim. Kết nối bảng mạch linh hoạt chỉ rõ cả hai lỗ. Interface chịu trách nhiệm kiểm tra ngữ nghĩa và chuẩn hóa trước khi ghi nhận chỉnh sửa.
- DTO sinh tự động và bộ kiểm tra lúc chạy từ `@cirnet/contracts` định nghĩa ranh giới REST và WebSocket. Gói npm Contracts và tài nguyên kiểm thử lấy từ khóa gói đã xem xét. DEV allocator chỉ dùng trong công cụ build và kiểm thử.
- Biến đổi ribbon và drawer cập nhật bố cục DOM mà không vẽ thêm canvas khi cảnh không đổi. Thay đổi thực sự của cảnh hoặc camera vẫn được vẽ. Kiểm tra trình duyệt độc lập dùng cảnh thật và giữ nguyên chuẩn đối chiếu pixel.

## Dịch vụ ứng dụng và lưu trữ

Remote cung cấp xác thực, dự án riêng, xuất bản bài tập, hàng đợi thực thi và lịch sử. API cấp cookie phiên HttpOnly. Interface giữ trạng thái CSRF trong bộ nhớ và tách bản khôi phục theo danh tính. Chuyển dữ liệu khách cần thao tác rõ ràng. Xung đột phiên bản giữ bản chỉnh sửa cục bộ, còn Import và Export là hai thao tác riêng. IndexedDB lưu bản nháp khôi phục. Xuất bản bài tập tách khỏi chỉnh sửa bản nháp. Quan sát và lịch sử có thể báo cáo thao tác mà không chạy lại.

Profile ảo trả payload bản thu số được hỗ trợ dưới dạng NCAP. Tính năng vật lý và tương tự phụ thuộc profile đã chọn và trình điều khiển đã triển khai. Profile ảo mặc định chưa có thao tác phần cứng Scope và Generator. Remote và Hardware quyết định thí nghiệm có thể chạy an toàn hay không. Xem [kiến trúc Lab-First](https://github.com/cirnetlab/cirnet-rules/blob/master/docs/tai-lieu-kien-tuc-he-thong/cirnet-architecture-lab-first-vi.md).

Trang xem trước thiết bị đo độc lập và thao tác chỉnh sửa cục bộ kiểm tra hành vi trình duyệt. Kiểm thử trình duyệt E2E cho gói sản phẩm dùng Remote đã cài, gói Interface tương ứng và luồng Hardware và Simulator thật. [Kiểm chứng](../contributing/verification.md)


## Quyền quản lý tài liệu và cảnh

Lõi tài liệu thuần quản lý lệnh, lịch sử, tuần tự hóa và theo dõi phiên bản. Lớp Pinia của mạch phối hợp các thao tác này với giao diện Vue đang mở. Xác thực, dự án, bàn làm việc, trạm, thực thi, thiết bị và UI có vòng đời riêng. Store thực thi và thiết bị phối hợp qua bộ điều khiển ứng dụng. Tuyến dự án máy chủ bật Save, Save As và Export sau khi tài liệu yêu cầu tải xong.

Tài nguyên cảnh nằm ngoài Pinia. Bộ dựng hình gộp thay đổi đồ thị, camera và thao tác vào khung hình. Cảnh ẩn, kích thước bằng không hoặc mất ngữ cảnh sẽ tạm dừng. Đổi kích thước và khôi phục ngữ cảnh sẽ vẽ lại. Khi tháo cảnh, ứng dụng giải phóng bộ quan sát, điều khiển, khung hình và tài nguyên GPU. Bộ cung cấp tài nguyên kiểm tra phiên bản của mô hình xem trước và dùng mô hình tạo bằng mã khi nhập thất bại. [Hướng dẫn mô hình thiết bị](../guides/instrument-models.md)

Mã nguồn hiện tại bỏ qua cấu hình camera định sẵn nếu góc nhìn tương đương. Khi lần vẽ trước mất ít nhất bằng thời lượng chuyển cảnh, bộ dựng hình áp dụng trực tiếp tư thế cuối. Hai quy tắc giảm lượt vẽ dư thừa và giữ lệnh đồ thị cùng kết nối điện độc lập với trạng thái hiển thị. [Bộ quản lý cảnh](../../../src/three/scene/SceneManager.ts)

Xem [hướng dẫn bàn làm việc](../guides/workbench.md) về cách chỉnh sửa và [kiểm chứng](../contributing/verification.md) về hai phạm vi kiểm thử trình duyệt.

## Workbench giao diện sáng

`src/workbench-light.css` sở hữu token cho khung sáng. Navy `#102c50` tạo
khung ứng dụng, cyan `#5ce6fb` nhận diện CIRNET và xanh `#184f9d` đánh dấu
điều khiển tương tác. Panel trung tính và nền 3D xanh xám giúp tập trung vào
mạch. Segoe UI cục bộ hỗ trợ tiếng Việt. Số đo và ô nhập dùng chữ số đều chiều
rộng khi hữu ích. Lệnh chung và lệnh kỹ thuật dùng nét SVG chung trong
`WorkbenchIcon`. Hình thư viện và thiết bị giữ manifest và nguồn gốc hiện có.

Title Bar có lối tắt File, thông báo, Focus Mode và chế độ toàn màn hình nếu
trình duyệt hỗ trợ. Ribbon nhóm các lệnh trong File, View, Component, Simulate,
Library, Window và Help. Activity Bar mở điều hướng dự án, chỉnh sửa mạch,
thư viện, kết quả và điều khiển Lab.

Project Explorer hiển thị linh kiện trong đồ thị, các chế độ xem và bản nháp
trong phiên. PropertyManager sửa đối tượng đang chọn qua lệnh đồ thị hiện có.
Mỗi panel nhớ trạng thái ghim và chiều rộng trong phiên. Panel được ghim chiếm
một phần bố cục. Panel bỏ ghim phủ lên vùng làm việc và đóng khi nhấp bên
ngoài hoặc nhấn Escape. Kéo mép trong, dùng phím mũi tên hoặc nhấp đúp để
đặt lại chiều rộng. Focus Mode ẩn các panel, Activity Bar và Ribbon, rồi
khôi phục cách hiển thị trước đó.

Các tab trình biên tập dùng chung đồ thị và đối tượng đang chọn. 3D Simulation
giữ canvas, camera và cảnh khi chuyển sang Schematic. Bộ dựng hình tạm dừng
vẽ cho đến khi quay lại 3D Simulation. Schematic hiển thị các liên kết đã khai
báo trong đồ thị, hỗ trợ chọn đối tượng, thu phóng và cuộn độc lập. Chỉnh sửa
sơ đồ và khai triển kết nối chân vật lý hoặc breadboard nằm ngoài chế độ này.
Ctrl+Q tìm lệnh File, chỉnh sửa, Ribbon và bố cục.

### Biểu tượng Workbench

Dùng bộ biểu tượng chung [WorkbenchIcon](../../../src/components/workbench/chrome/WorkbenchIcon.vue)
cho các lệnh. Biểu tượng nét dùng viewBox 24 × 24, nét đầu tròn rộng 1,6 đơn vị
và `currentColor`. Search và Project Explorer thể hiện phong cách điều hướng.
Wire, Probe và Scope áp dụng cùng phong cách cho lệnh kỹ thuật. Đặt nhãn cho
nút hoặc điều khiển và giữ SVG ở vai trò trang trí. Dùng hình minh họa hiện có
để xem trước linh kiện và thiết bị, với nguồn gốc ghi trong [manifest tài sản](../../../src/assets/icons/manifest.json).
