# Kiểm chứng CIRNET Interface

[English](../../en/contributing/verification.md) · [Mục lục](../index.md)

Trước hết thực hiện [thiết lập bằng gói đã xem xét](../guides/getting-started.md). Giữ cache, dữ liệu tạm, log thô và trace trong phiên do allocator cấp.

## Mã nguồn và bản build sản xuất

Chạy từ thư mục gốc Interface bằng phiên bản Node của CI.

```sh
npm run check:boundaries
npm test -- --all-script-tests
npx tsc --noEmit -p tsconfig.e2e.json
npm run build
```

Lệnh test chạy kiểm thử đơn vị và kiểm thử script. Lệnh build kiểm tra kiểu ứng dụng, rồi tạo bàn làm việc và hai trang xem trước thiết bị.

## Trình duyệt độc lập

```sh
npm run test:e2e:install
npm run test:e2e:platform -- --forbid-only
```

Playwright 1.64.1 cài bản Chromium đã ghim vào `.runtime/playwright`. Trên Ubuntu, CI thêm `--with-deps` vào lệnh cài. Bộ chạy độc lập dùng origin loopback với cổng do hệ điều hành cấp, cache Vite thuộc phiên, bản sao trình duyệt mới và renderer thật. Kiểm tra độ sâu và trường hợp Web Locks hai tab chạy mà không cần dịch vụ Remote hay thông tin xác thực.

## Trình duyệt tích hợp đầy đủ

Đặt context chứa các thư mục gốc Git tham gia trước khi bootstrap, giữ môi trường bootstrap trả về và cài Chromium từ Interface. Từ Remote, chọn tường minh trình thông dịch Python API đã chuẩn bị và sản phẩm Interface. Trong Bash, đặt đường dẫn tuyệt đối cho hai biến bên dưới rồi chạy lệnh sau.

```bash
export CIRNET_E2E_PYTHON="$remote_root/services/api/.venv/bin/python"
(cd "$remote_root" && node scripts/e2e-interface.mjs --interface-root "$interface_root" --forbid-only)
```

Trên Windows, trình thông dịch venv đã chuẩn bị thường nằm ở `services/api/.venv/Scripts/python.exe` trong Remote. Cũng có thể dùng chính trình thông dịch đó chạy `scripts/check_release.py --group browser --interface-root ABSOLUTE_INTERFACE_PRODUCT` từ Remote. Remote quản lý API, RPC, Simulator, xác thực và trạng thái kiểm thử riêng, khởi động lại có kiểm soát và dừng dịch vụ. Kiểm tra tích hợp dùng các cổng 14173, 15151 và 18181, một worker và không chạy lại khi lỗi.

Mỗi lần chạy trình duyệt dùng bản sao đầy đủ của bản đã ghim trong thư mục con `br-<8hex>` riêng, được chọn bằng `PLAYWRIGHT_BROWSERS_PATH`. Khi sao chép, bộ chạy lấy nội dung từ liên kết trình duyệt và bỏ qua `.links` cùng log debug cũ. Giữ đường dẫn `.exe` trên Windows trong giới hạn 259 đơn vị UTF-16 của bộ chạy. [README của repository](../../../README.md) có thêm chi tiết sao chép và hướng dẫn PowerShell.

Xem quy định hiện hành và kết quả theo thời điểm trong [hồ sơ kiểm chứng](../../VERIFICATION.md). Sau khi xem bằng chứng và xác nhận các tiến trình thuộc phiên đã dừng, chạy `node scripts/cleanup-contracts.mjs` trong cùng context để dọn phiên sở hữu.
