# Sử dụng bàn làm việc CIRNET

[English](../../en/guides/workbench.md) · [Mục lục](../index.md)

## Dự án, tài khoản và bài tập

- **New** mở bản nháp cục bộ. **Projects** hoặc Ctrl/Meta+O mở Project Manager. Ctrl/Meta+S lưu tài liệu riêng đã liên kết với máy chủ hoặc mở Save As. Save xác nhận một phiên bản trên máy chủ. Khi xung đột, bản chỉnh sửa cục bộ được giữ lại và bạn có thể chọn Keep, xác nhận Reload hoặc Save As. Phản hồi muộn của phiên bản cũ vẫn để bản sửa mới ở trạng thái chưa lưu.
- **Import/Export JSON** trao đổi tệp Graph 1.0, 1.1 và 1.2 riêng với thao tác Save. Import kiểm tra giới hạn 2.000.000 byte UTF-8, hình học, ID duy nhất, tham chiếu mô-đun và dữ liệu bộ nhớ trước khi sửa tài liệu. **Undo/Redo** giữ tối đa 50 mục trong 20 MB và vẫn giữ mục mới nhất nếu riêng mục đó vượt giới hạn. Mỗi thao tác hoàn tất ghi một bước. Thao tác lỗi hoặc không đổi tài liệu giữ nguyên lịch sử.
- Điều khiển tài khoản mở phía trên canvas. Đăng nhập, đăng xuất và chuyển dữ liệu khách theo yêu cầu sử dụng phiên máy chủ. Bản nháp khôi phục trong IndexedDB có giới hạn và được tách theo tài khoản. Khi đổi danh tính, Interface lưu bản nháp cũ rồi xóa tài liệu riêng và lịch sử khỏi bàn làm việc. Đổi phiên trong cùng danh tính giữ lại tài liệu.
- Thay đổi bài tập của giảng viên và quản trị viên được lưu vào bản nháp. Chọn Publish để sinh viên xem phiên bản đã công bố. Bản dành cho sinh viên ẩn chi tiết tham chiếu bị hạn chế. Chọn lịch sử thực thi để mở bằng chứng được cấp quyền, độc lập với điều khiển Run đang hoạt động.

## Đặt, chọn và điều hướng

| Điều khiển | Cách dùng |
| --- | --- |
| Ribbon Component | Chọn linh kiện hoặc mô hình thiết bị. Với linh kiện linh hoạt được hỗ trợ, chọn chính xác cả hai lỗ. Tab Run mở điều khiển thực thi và giữ tài liệu hiện tại trên bàn làm việc. |
| Ngăn công cụ | Thu gọn Components hoặc Tools để lộ canvas phía dưới. Dùng nút nổi ở mép để mở lại. Công cụ đã chọn, mức thu phóng và bản nháp vẫn hoạt động. |
| Select | Nhấp mô hình hoặc dây để chọn. Ctrl/Meta+nhấp thêm hoặc bỏ khỏi vùng chọn. Dùng Marquee Select để chọn theo vùng, hoặc Inventory và Inspector để chọn bằng bàn phím. Kéo mô hình hoặc vùng trống để rê theo XZ trong chế độ Select. |
| Move | Kéo mô hình đang hiển thị quá bốn pixel để xem trước vị trí mới và dây nối. Thả để xác nhận một lần dịch. Mô hình giữ nguyên độ cao và góc xoay. Escape hủy bản xem trước. |
| Xoay và xóa | Chọn Rotate hoặc nhấn R để xoay 90°. Delete hoặc Backspace xóa mục đã chọn. Undo có thể khôi phục mục đó và các cạnh nối. |
| Gizmo biến đổi | Dịch bản xem trước hoặc mô hình đã chọn theo X, Z hoặc tự do trên XZ, và xoay quanh Y. Rê vào tay nắm tạm dừng việc bám con trỏ để có thể kéo. Nhấp ra ngoài để xác nhận tư thế, hoặc nhấp chuột phải hay nhấn Escape để hủy. |
| Workspace Object Snap | Căn bước dịch 0,5 đơn vị và bước xoay 90° cho mô hình cơ khí hoặc 15° cho mô hình khác. Khi tắt snap, phím mũi tên dịch 0,1 đơn vị và gizmo xoay liên tục. |
| Component Info | Xem hoặc sửa thuộc tính, mở sơ đồ chân vật lý, bật Show pins hoặc xem trước rồi áp dụng Rebuild component geometry. Add bắt đầu một bản nháp đặt linh kiện độc lập. |
| Khung nhìn | Kéo chuột phải để xoay, kéo chuột giữa để rê và dùng con lăn hoặc điều khiển ở thanh trạng thái để thu phóng. Fit căn khung toàn mạch. Với Zoom To Area, chọn nút bên cạnh rồi kéo một hình chữ nhật. Fit và Area đặt mốc 100% mới trong khoảng 50–1000% và giữ hướng nhìn. Escape hủy công cụ Area. |

Breadboard bắt đầu ở góc xoay thế giới 0°. Các mô hình đã biết khác ban đầu hướng về camera. Bản nháp đã xoay giữ tư thế khi đổi góc nhìn. Ghép bảng dùng hình học tương thích và linh kiện linh hoạt được hỗ trợ chỉ rõ các điểm tiếp xúc. Kết nối điện dựa trên cạnh trong đồ thị và topology đã khai báo của bảng mạch. Xem [hướng dẫn đặt linh kiện](https://github.com/cirnetlab/cirnet-remote/blob/13a35145b6d15644c7be10d95a5410bf69e11867/docs/COMPONENT_PLACEMENT.md) và [kiểm chứng lịch sử về góc xoay](https://github.com/cirnetlab/cirnet-remote/blob/745077403f233790bdb6781c36d6502feca01642/docs/verification/2026-10-15-placement-world-policy.md).

Trên canvas, phím mũi tên dịch đối tượng đang chọn và Escape hủy đặt linh kiện, đi dây hoặc xem trước khi dịch. Nhấn Escape để đóng cửa sổ nổi và trả focus. Khi focus ngoài biểu mẫu, dùng Ctrl/Meta+N/O/S/Z cho New, Projects, Save và Undo, và Ctrl/Meta+Shift+Z hoặc Ctrl/Meta+Y cho Redo.

## Đi dây và chỉnh bộ nhớ

1. Chọn màu dây và chế độ Free, Orthogonal hoặc Auto. Dây mới mặc định dùng Free. Dây cũ thiếu metadata hiển thị tường minh vẫn dùng Auto.
2. Nhấp điểm tiếp xúc hoặc cổng logic đầu tiên. Nhấp chuột phải để thêm góc rồi nhấp đầu mút cuối. Nhấp chuột phải lần nữa tại cùng điểm snap hoặc trước khi dịch bốn pixel để bỏ góc tạm cuối. Backspace hoặc Delete cũng bỏ góc cuối. Escape hủy dây, còn Alt bỏ qua snap ở nơi có hỗ trợ.
3. Chọn dây đã hoàn tất để kéo điểm gấp hoặc đoạn do người dùng chỉnh. Nhấp đúp đoạn dây để thêm điểm neo, hoặc chọn điểm gấp rồi nhấn Delete. Mỗi thao tác hoàn tất giữ cố định hai đầu dây và tạo một bước có thể hoàn tác.
4. Dùng Down, Up hoặc Top để chỉnh thứ tự làn hoặc giao cắt của dây đang chọn. Select next overlapping wire lần lượt chọn dây trong nhóm chồng lấp. Làn song song và cầu vượt cục bộ chỉ biểu diễn hình học. Hai đầu dây và điểm neo đã lưu chi phối chỉnh sửa và kết nối điện.

Chọn linh kiện MEMORY rồi mở **Hex Editor** để tải hoặc lưu ảnh bộ nhớ, chỉnh byte và chọn Apply. Memory v1 chứa 1–256 từ 8 bit. Linh kiện mới bắt đầu với 32 byte bằng 0.

## Chạy mạch, dùng thiết bị và đọc bản thu

Dùng **Inspector** để chọn đích thực thi và cấu hình bản thu, xung nhịp và vector kiểm thử có kiểu. Run gửi một bản chụp cấu hình bất biến. Sửa dữ liệu số không hợp lệ trước khi chọn Run hoặc Apply. Bản nháp trigger giữ cục bộ vì adapter hiện tại chưa có nguồn trigger được xác nhận. Stop có thể hủy Create đang chờ. Khi kết nối lại, ứng dụng đối soát thao tác ban đầu mà không gửi lại Run.

- **Power Supply** chỉnh điện áp, giới hạn dòng và trạng thái bật của nguồn đã chọn thông qua tài liệu. Điện áp và dòng hiển thị là giá trị yêu cầu. Công suất vẫn chưa xác định.
- **Function Generator** hiện giá trị yêu cầu và số kênh khả dụng theo profile. Apply trực tiếp cần Run của tab hiện tại đã được xác nhận, phiên thực thi đang chạy có lease thuộc tab và kênh được cấp có hỗ trợ. ACCEPTED ghi nhận lệnh đã được nhận. APPLIED cần xác nhận rõ từ trình điều khiển. Nếu mất phản hồi, ứng dụng giữ định danh thao tác cũ và chặn Apply tiếp theo cho đến khi đối soát hoặc giải phóng ngữ cảnh.
- **Signal Monitor** đọc bằng chứng số NCAP v1 đã cấp quyền, giữ thứ tự, dấu thời gian và các giá trị `0`, `1`, `X`. **Scope** giữ chức năng thu tương tự ở trạng thái tắt trong profile ảo mặc định. Trình xem tương tự có thể hiển thị bằng chứng NCAP v2 đã giải mã được cung cấp, cùng thông tin hiệu chuẩn và đồng hồ.

Mô hình trong ribbon Component là tài nguyên hiển thị. Công cụ thiết bị mở cửa sổ điều khiển. Xem [mô hình thiết bị](instrument-models.md) và [ranh giới đồ thị và dịch vụ](../architecture/workbench.md).

Xem kiểm chứng lịch sử về [điều hướng](https://github.com/cirnetlab/cirnet-remote/blob/745077403f233790bdb6781c36d6502feca01642/docs/verification/2026-10-14-workbench-ux.md) · [đi dây gọn](https://github.com/cirnetlab/cirnet-remote/blob/745077403f233790bdb6781c36d6502feca01642/docs/verification/2026-10-15-compact-wire-routing.md) · [thiết kế xếp lớp trước đây](https://github.com/cirnetlab/cirnet-remote/blob/745077403f233790bdb6781c36d6502feca01642/docs/verification/2026-10-15-wire-visual-stacking.md).
