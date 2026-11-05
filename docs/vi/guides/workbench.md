# Sử dụng bàn làm việc CIRNET

[English](../../en/guides/workbench.md) · [Mục lục](../index.md)

## Chỉnh sửa và di chuyển linh kiện

Chọn linh kiện để xem thuộc tính. Chế độ Move cho phép kéo trực tiếp sau ngưỡng bốn pixel. Gizmo biến đổi nằm tại điểm xoay của linh kiện đã chọn. Ribbon Tools và drawer Component phủ lên vùng làm việc. Thu gọn chúng giữ nguyên kích thước canvas bên dưới. Focus bàn phím và chế độ giảm chuyển động tuân theo trạng thái hiển thị của điều khiển.

Dùng phím mũi tên để dịch, `R` để xoay, Delete để xóa và Escape để hủy thao tác đang thực hiện. Bước dịch khi bật snap là 0,5 đơn vị, bước xoay cơ khí là 90° và bước xoay thông thường là 15°. Khi tắt snap, mỗi lần nhấn mũi tên dịch 0,1 đơn vị. Gắn vào breadboard dựa vào tư thế bảng mạch và lỗ tương thích. Bản xem trước giữ góc xoay và tài liệu thay đổi khi xác nhận vị trí. Fit, Home và Area đặt mức tham chiếu thu phóng 100%. Bàn làm việc hỗ trợ từ 50–1000% so với mức tham chiếu đó.

Mỗi thao tác đã xác nhận tạo một mục lịch sử. Undo/Redo giữ tối đa 50 mục trong giới hạn 20 MB và vẫn giữ mục mới nhất nếu riêng mục đó vượt giới hạn. Import nhận đồ thị UTF-8 đã kiểm tra hợp lệ, tối đa 2 MB. Export lưu đồ thị riêng với thao tác lưu lên máy chủ. Xem [tài liệu trình biên tập](../../../README.md) để tra bảng điều khiển và chi tiết mô hình.

## Đi dây và chỉnh sửa dây

Dây mới dùng chế độ Free mặc định. Dây cũ chưa có chế độ tường minh vẫn dùng Auto. Có ba chế độ Free, Orthogonal và Auto với mười màu dây. Dùng nút chuột chính để chọn đầu dây và nút phụ để thêm điểm gấp. Nhấn lại nút phụ tại cùng điểm snap hoặc trong phạm vi bốn pixel sẽ hoàn tác điểm gấp cuối. Escape hủy đường dây đang vẽ. Alt tạm bỏ qua snap ở nơi có hỗ trợ.

Chỉnh điểm gấp hoặc đoạn dây giữ cố định hai đầu và giữ các điểm neo không chỉnh sửa. Làn song song và thứ tự giao cắt là chỉ dẫn trực quan suy ra từ hình học dây gốc. Kết nối điện theo các đầu mút trong đồ thị. Linh kiện bộ nhớ dùng ảnh dữ liệu 8 bit phiên bản 1, từ 1–256 byte, khởi tạo với 32 byte bằng 0.

## Mở thiết bị đo và xem bản thu

Cửa sổ thiết bị dùng cấu trúc có kiểu cho xung nhịp, vector kiểm thử và bản thu. Bản thu số được hỗ trợ dùng `0`, `1` và `X`. Apply xin quyền sử dụng kênh khi profile đã chọn hỗ trợ. Profile ảo mặc định chưa có thao tác phần cứng Scope và Generator. Trạng thái khả dụng theo trình điều khiển và profile được chọn. Xem [kiến trúc](../architecture/workbench.md) về ranh giới đồ thị và dịch vụ.
