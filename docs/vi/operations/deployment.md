# Phát hành và triển khai Interface

[English](../../en/operations/deployment.md) · [Mục lục](../index.md)

Mã nguồn sản phẩm có định danh `@cirnet/web` 0.1.4. [Mô tả tương thích](../../../integration/compatibility.json) ghi bản sửa đổi Remote tương ứng, còn [khóa gói](../../../integration/contracts-artifacts.json) xác định đầu vào do repository sản xuất phát hành. Remote quản lý việc chọn phiên bản hệ thống. Xem bản sửa đổi nguồn, URL và mã băm được chọn trong [bộ phát hành hệ thống 0.1.4](https://github.com/cirnetlab/cirnet-remote/blob/38aea6120920f48cea817827ac2277cce4bef25e/integration/release-set.json).

## Tạo cặp gói phát hành

Dùng [thiết lập bằng gói đã xem xét](../guides/getting-started.md) và checkout Interface sạch đã commit. Thay chỗ giữ chỗ bằng thư mục đầu ra tuyệt đối trong phiên sở hữu.

```sh
python -B scripts/build_release.py --output-directory ABSOLUTE_OWNED_SESSION/interface-release
```

Script xuất mã nguồn đã commit, bootstrap đầu vào đã chọn, cài đặt theo khóa npm và chạy build sản xuất mới. Kết quả là gói mã nguồn và gói tĩnh kèm bản sửa đổi nguồn, dấu vân tay mã nguồn và mã băm gói. Gói tĩnh phục vụ `index.html`, `oscilloscope-preview.html`, `function-generator-preview.html` và tài nguyên đi kèm. Xem định danh đã sinh và [các bước kiểm chứng](../contributing/verification.md) trước khi chọn cặp gói.

## Phục vụ sản phẩm đã chọn

Triển khai gói tĩnh đã xem xét cùng các dịch vụ trong bộ phát hành hệ thống. Cấu hình định tuyến cho ứng dụng và các endpoint REST/WebSocket tương ứng. Proxy Vite dùng cho môi trường phát triển. Tạo cặp gói cục bộ là bước riêng với tạo tag, tải gói lên và chọn bản phát hành hệ thống. Giữ nguyên byte và mã băm của các bản đã phát hành khi thêm phiên bản mới.
