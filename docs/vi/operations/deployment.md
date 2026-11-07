# Phát hành và triển khai Interface

[English](../../en/operations/deployment.md) · [Mục lục](../index.md)

Mã nguồn khai báo `@cirnet/web` 0.1.4. [Mô tả tương thích](../../../integration/compatibility.json) ghi revision Remote tương ứng, còn [khóa gói](../../../integration/contracts-artifacts.json) chọn đầu vào từ các repo cung cấp. [Bộ phát hành hệ thống 0.1.4 của Remote](https://github.com/cirnetlab/cirnet-remote/blob/38aea6120920f48cea817827ac2277cce4bef25e/integration/release-set.json) ghim gói mã nguồn và gói tĩnh Interface tại `f1fe0c4738e105727aff1a331327caf7172cdf5f` và API tại `ce84ec4cf3602ef6fd001f91877e864c8955f9c7`, cùng URL và mã băm. Checkout ở commit sau vẫn có thể giữ cùng phiên bản gói. Nghiệm thu ứng viên được ghi riêng trong [hồ sơ chuyển đổi native](https://github.com/cirnetlab/cirnet-remote/blob/13a35145b6d15644c7be10d95a5410bf69e11867/docs/vi/architecture/native-migration.md).

## Tạo cặp gói phát hành

Dùng [thiết lập bằng gói đã xem xét](../guides/getting-started.md) và checkout Interface sạch đã commit. Thay chỗ giữ chỗ bằng thư mục đầu ra tuyệt đối trong phiên sở hữu.

```sh
python -B scripts/build_release.py --output-directory ABSOLUTE_OWNED_SESSION/interface-release
```

Script xuất mã nguồn đã commit, bootstrap đầu vào đã chọn, cài đặt theo khóa npm và chạy build sản xuất mới. Kết quả là gói mã nguồn và gói tĩnh kèm bản sửa đổi nguồn, dấu vân tay mã nguồn và mã băm gói. Gói tĩnh phục vụ `index.html`, `oscilloscope-preview.html`, `function-generator-preview.html` và tài nguyên đi kèm. Xem định danh đã sinh và [các bước kiểm chứng](../contributing/verification.md) trước khi chọn cặp gói.

Bộ dựng lấy nội dung Git khi đã tắt chuyển đổi xuống dòng và dựng từ bản xuất mới. Bộ dựng từ chối tệp gói đầu ra đã có và đường dẫn gói mã nguồn trùng gói tĩnh. Bộ dựng ghi `artifacts.json` với mã SHA-256 và giữ dữ liệu dựng tạm cùng log trong phiên bên ngoài. Xem [kiểm chứng nguồn gốc bản dựng](../../../migration/interface-build-provenance.md).

## Phục vụ sản phẩm đã chọn

Triển khai gói tĩnh đã xem xét cùng các dịch vụ trong bộ phát hành hệ thống. Cấu hình định tuyến cho ứng dụng và các endpoint REST/WebSocket tương ứng. Proxy Vite dùng cho môi trường phát triển. Tạo cặp gói cục bộ là bước riêng với tạo tag, tải gói lên và chọn bản phát hành hệ thống. [Các gói v0.1.3 đã phát hành](https://github.com/cirnetlab/cirnet-interface/releases/tag/v0.1.3) giữ dữ liệu phát hành và bằng chứng kiểm thử trình duyệt.
