# Duy trì tài liệu Interface

[English](../../en/contributing/writing-documentation.md) · [Mục lục](../index.md) · [Chỉ dẫn repo](../../../AGENTS.md)

Giữ hướng dẫn hiện hành ở cùng đường dẫn tương đối trong `docs/en/` và `docs/vi/`. Cập nhật hai bản cùng nhau, thống nhất định danh, ví dụ, ràng buộc và trạng thái năng lực. Kiến trúc bàn làm việc mô tả triển khai trình duyệt và bộ Contracts đã chọn. Remote phụ trách tích hợp hệ thống.

Dùng [changelog](../../changelogs/README.md) cho thay đổi phiên bản đã xác minh. Ghi thay đổi kể từ bản phát hành mới nhất dưới mục Unreleased. Mỗi bản phát hành có tiêu đề SemVer, liên kết trong mục lục và nguồn cho ngày công bố.

Mỗi công việc AI lưu kế hoạch trong `.superpowers/plans/` và đặc tả tương ứng, tiêu chí nghiệm thu, checklist trong `.superpowers/specs/`. Chỉ đánh dấu mục đã kiểm chứng. Git bỏ qua hai thư mục này trong checkout.

Giữ [bằng chứng chuyển đổi và kiểm chứng](../history/index.md) tại đường dẫn và revision đã ghi. Giữ `migration/verification.md` tại đường dẫn mà quy tắc fingerprint phát hành sử dụng. Sau khi kiểm chứng, cập nhật cặp tài liệu kỹ thuật và changelog liên quan, rồi kiểm tra liên kết cục bộ, Git diff và phạm vi của kết quả trình duyệt được nêu.
