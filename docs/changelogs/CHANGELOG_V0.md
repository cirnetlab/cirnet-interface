# CIRNET Interface v0

## 0.3.0-dev.1 (development)

- Migrate the Vue and Three.js workbench, browser tests and assets. Select native Contracts and Remote build inputs by digest.
- Chuyển mã bàn làm việc Vue và Three.js, bộ kiểm thử trình duyệt và tài nguyên. Chọn đầu vào Contracts và Remote native theo mã băm.
- Add an Interface verification workflow that selects a Remote candidate by run ID and checks all four build inputs against its reviewed manifest.
- Thêm workflow kiểm chứng Interface chọn bản ứng viên Remote theo mã lượt chạy và đối chiếu cả bốn đầu vào bản dựng với manifest đã duyệt.
- Link the workbench safety boundary to CIRNET Lab-First.
- Liên kết ranh giới an toàn của bàn làm việc với CIRNET Lab-First.
- Run Interface CI on master pushes using generated inputs from pinned sources, and allocate manual candidate paths after the runner starts.
- Chạy CI Interface khi push lên master bằng đầu vào được tạo từ nguồn đã ghim và thiết lập đường dẫn ứng viên thủ công sau khi runner khởi động.
- Limit the private dependency secret to the Contracts checkout.
- Chỉ dùng secret đọc phụ thuộc private ở bước checkout Contracts.
