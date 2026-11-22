# Kiểm chứng CIRNET Interface

[English](../../en/contributing/verification.md) · [Tài liệu](../index.md)

## GitHub Actions

Chạy **Interface verification from a native candidate** với mã lượt chạy workflow **Windows x64 native candidate** của Remote và giá trị `manifestSha256` đã duyệt trong biên nhận đóng gói. Cấu hình `CIRNET_READ_TOKEN` có quyền đọc Actions của `cirnetlab/cirnet-remote-next`. Workflow Interface xác minh manifest và mã băm của cả bốn đầu vào trước khi bootstrap, rồi chạy build, bộ kiểm thử thành phần và kiểm thử nền tảng Chromium. Remote chạy smoke test đầu cuối trên ứng dụng đã đóng gói.

## Kiểm tra cục bộ

Chuẩn bị [đúng đầu vào bản dựng](../guides/getting-started.md) trong bản sao mới. Áp dụng ngữ cảnh và phiên sở hữu từ JSON bootstrap trước khi kiểm tra. Giữ cache npm, thông tin trình duyệt, gói kiểm thử và nhật ký thô trong phiên đó.

```powershell
npm run check:boundaries
npm test -- --all-script-tests
npx tsc --noEmit -p tsconfig.e2e.json
npm run build
npm run test:e2e:install
npm run test:e2e:platform -- --forbid-only
```

Đặt `CIRNET_E2E_BROWSER_CACHE` thành thư mục tuyệt đối bên ngoài để chọn bản Chromium đã ghim. Bộ kiểm thử nền tảng chạy trình kết xuất thật, camera, độ sâu và quyền sở hữu tài liệu trong trình duyệt mà không cần tài khoản máy chủ.

## Kiểm thử trình duyệt với bản native đã cài đặt

Với sản phẩm đã cài đặt, dùng cùng cache trình duyệt. Đặt `CIRNET_E2E_API_TARGET` thành `http://127.0.0.1:14173`, `CIRNET_E2E_STATIC_FINGERPRINT` thành mã băm nguồn của gói tĩnh đã chọn và `CIRNET_E2E_ADMIN_PASSWORD` thành thông tin xác thực quản trị dùng để kiểm thử.

```powershell
node scripts/e2e.mjs test-packaged --forbid-only --grep 'real login|administrator creates|actual authoring UI'
```

Trình chạy kiểm tra metadata được phục vụ trước khi chạy. Bộ kiểm thử trình duyệt đầy đủ còn cần cơ chế khởi động lại và dữ liệu kiểm thử do Remote quản lý. Xem [hướng dẫn triển khai](../operations/deployment.md).
