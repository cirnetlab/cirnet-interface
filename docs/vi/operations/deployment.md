# Dựng và đóng gói CIRNET Interface

[English](../../en/operations/deployment.md) · [Tài liệu](../index.md)

Từ [bộ đầu vào đã chọn](../guides/getting-started.md), `npm run build` tạo bàn làm việc và bản xem trước máy hiện sóng cùng bộ phát tín hiệu trong `dist/`. Remote phục vụ ứng dụng trình duyệt, `/api` và `/ws` trên cùng origin. [Mô tả tương thích](../../../integration/compatibility.json)

Sau khi cài cùng bộ đầu vào, chạy trình đóng gói từ phiên do bộ cấp phát quản lý. Dùng thư mục xuất tuyệt đối trong phiên đó.

```powershell
node scripts/build/build-release.mjs --manifest $nativeInputs --output-directory $output --verification
```

Trình dựng xuất checkout sạch vào thư mục dựng bên ngoài. Nó ghi SHA-256 cho gói nguồn, gói tĩnh, SDK, crate và OpenAPI, đồng thời ghi mã toàn vẹn npm của SDK và DEV vào gói nguồn. Ứng viên phát triển cục bộ có thể thêm `--candidate` và một `--candidate-file path` cho mỗi tệp chưa được theo dõi đã rà soát. Remote quản lý nghiệm thu và lựa chọn bản phát hành hệ thống.
