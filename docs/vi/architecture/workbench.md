# Kiến trúc Interface

[English](../../en/architecture/workbench.md) · [Mục lục](../index.md)

Một bàn làm việc Vue 3 đang hoạt động phối hợp tài liệu mạch hiện tại, trạng thái Pinia và cảnh Three.js. Lệnh đồ thị quản lý chỉnh sửa tài liệu và lịch sử. Cảnh biểu diễn đồ thị và có trạng thái tương tác, dựng hình tạm thời. Điểm gấp dây, giao cắt hiển thị, panel phủ và vị trí camera không thể tạo hoặc đổi kết nối điện.

## Ranh giới đồ thị và hợp đồng

- Tài liệu Graph 1.0 và 1.1 giữ nguyên ý nghĩa. Các thao tác bổ sung của Graph 1.2 mang cụm lắp ráp linh hoạt và descriptor vật lý tự do đã ghim. Kết nối bảng mạch linh hoạt chỉ rõ cả hai lỗ. Interface chịu trách nhiệm kiểm tra ngữ nghĩa và chuẩn hóa trước khi ghi nhận chỉnh sửa.
- DTO sinh tự động và bộ kiểm tra lúc chạy từ `@cirnet/contracts` định nghĩa ranh giới REST và WebSocket. Gói npm Contracts và tài nguyên kiểm thử lấy từ khóa gói đã xem xét. DEV allocator chỉ dùng trong công cụ build và kiểm thử.
- Interface nhập danh mục và dữ liệu linh kiện từ gói đã chọn. Mô hình Three.js và mô hình tạo bằng mã dự phòng là tài nguyên trình bày. Tệp mô hình gốc giữ tên xuất, mã băm và hồ sơ nguồn gốc. Xem [tương thích namespace](namespace.md) và [hướng dẫn mô hình thiết bị](../guides/instrument-models.md).
- Biến đổi ribbon và drawer cập nhật bố cục DOM mà không vẽ thêm canvas khi cảnh không đổi. Thay đổi thực sự của cảnh hoặc camera vẫn được vẽ. Kiểm tra trình duyệt độc lập dùng cảnh thật và giữ nguyên chuẩn đối chiếu pixel.

## Dịch vụ ứng dụng và lưu trữ

Remote cung cấp xác thực, dự án riêng, xuất bản bài tập, hàng đợi thực thi và lịch sử. API cấp cookie phiên HttpOnly. Interface giữ trạng thái CSRF trong bộ nhớ và tách bản khôi phục theo danh tính. Chuyển dữ liệu khách cần thao tác rõ ràng. Xung đột phiên bản giữ bản chỉnh sửa cục bộ, còn Import và Export là hai thao tác riêng. IndexedDB lưu bản nháp khôi phục. Xuất bản bài tập tách khỏi chỉnh sửa bản nháp. Quan sát và lịch sử có thể báo cáo thao tác mà không chạy lại.

Profile ảo trả payload bản thu số được hỗ trợ dưới dạng NCAP. Tính năng vật lý và tương tự phụ thuộc profile đã chọn và trình điều khiển đã triển khai. Profile ảo mặc định chưa có thao tác phần cứng Scope và Generator. Xem [kiến trúc Lab-First chuẩn](https://github.com/cirnetlab/cirnet-remote/blob/13a35145b6d15644c7be10d95a5410bf69e11867/docs/ARCHITECTURE.md).

[Hướng dẫn hệ thống Remote](https://github.com/cirnetlab/cirnet-remote/blob/13a35145b6d15644c7be10d95a5410bf69e11867/docs/vi/architecture/system.md) mô tả bố cục dịch vụ Python đã phát hành. [Hồ sơ chuyển đổi native](https://github.com/cirnetlab/cirnet-remote/blob/13a35145b6d15644c7be10d95a5410bf69e11867/docs/vi/architecture/native-migration.md) ghi riêng ứng viên Windows Gate 4 và các cổng phát hành còn mở. [Khóa phát hành 0.1.4](https://github.com/cirnetlab/cirnet-remote/blob/38aea6120920f48cea817827ac2277cce4bef25e/integration/release-set.json) chọn bộ gói đã phát hành.

## Quyền quản lý tài liệu và cảnh

Lõi tài liệu thuần quản lý lệnh, lịch sử, tuần tự hóa và theo dõi phiên bản. Lớp Pinia của mạch phối hợp các thao tác này với giao diện Vue đang mở. Xác thực, dự án, bàn làm việc, trạm, thực thi, thiết bị và UI có vòng đời riêng. Store thực thi và thiết bị phối hợp qua bộ điều khiển ứng dụng. Tuyến dự án máy chủ bật Save, Save As và Export sau khi tài liệu yêu cầu tải xong. [Kiểm chứng tải tài liệu theo tuyến](../../../migration/server-route-hydration.md)

Tài nguyên cảnh nằm ngoài Pinia. Bộ dựng hình gộp thay đổi đồ thị, camera và thao tác vào khung hình. Cảnh ẩn, kích thước bằng không hoặc mất ngữ cảnh sẽ tạm dừng. Đổi kích thước và khôi phục ngữ cảnh sẽ vẽ lại. Khi tháo cảnh, ứng dụng giải phóng bộ quan sát, điều khiển, khung hình và tài nguyên GPU. Bộ cung cấp tài nguyên kiểm tra phiên bản của mô hình xem trước và dùng mô hình tạo bằng mã khi nhập thất bại. [Hướng dẫn mô hình thiết bị](../guides/instrument-models.md)

Xem [hướng dẫn bàn làm việc](../guides/workbench.md) về cách chỉnh sửa và [kiểm chứng](../contributing/verification.md) về hai phạm vi kiểm thử trình duyệt.
