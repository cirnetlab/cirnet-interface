# Bắt đầu với CIRNET Interface

[English](../../en/guides/getting-started.md) · [Tài liệu](../index.md)

Dùng Node 26 và các phụ thuộc npm đã khóa. Từ cùng một lần dựng Contracts và Remote đã chọn, lấy SDK, gói npm DEV, crate native và OpenAPI của Remote đã dùng để sinh SDK. [Hồ sơ đầu vào](../../../integration/contracts-artifacts.json) ghi danh tính gói dự kiến.

Tạo manifest JSON bên ngoài kho với các mục `npm`, `dev_npm`, `native_crate` và `remote_openapi`. Mỗi mục có `path` tuyệt đối và `sha256` đã rà soát của nội dung được chọn. Lưu các manifest bản dựng và mã băm nguồn cùng bộ đầu vào.

```powershell
$bootstrap = node scripts/bootstrap-contracts.mjs --manifest $nativeInputs | ConvertFrom-Json -AsHashtable
foreach ($entry in $bootstrap.environment.GetEnumerator()) {
    [Environment]::SetEnvironmentVariable($entry.Key, $entry.Value, 'Process')
}
npm ci --ignore-scripts --no-audit --no-fund
npm run dev
```

Dùng bản sao làm việc mới hoặc dọn cache artifact bị Git bỏ qua khi chọn bản dựng khác. Đặt `CIRNET_DEV_API_TARGET` thành origin của Remote khi phát triển với API native. Vite chuyển tiếp `/api` và `/ws`; bản dựng sản phẩm dùng cùng origin cho cả hai.
