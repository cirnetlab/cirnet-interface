# Bắt đầu với CIRNET Interface

[English](../../en/guides/getting-started.md) · [Mục lục](../index.md)

CI của Interface 0.1.4 dùng Node 26. Hãy cài đặt bằng các gói do repository sản xuất phát hành, đã được xem xét và chọn trong [khóa gói](../../../integration/contracts-artifacts.json). Bootstrap kiểm tra gói npm Contracts chính thức, sdist Contracts dùng cho kiểm thử bổ sung và gói DEV allocator trước khi sử dụng. [Khóa npm](../../../package-lock.json) chọn tarball lúc chạy. URL do người vận hành chỉ định phải khớp URL đã được theo dõi trong Git.

## Cài đặt bằng manifest cục bộ đã được xem xét

Mở shell mới chưa có `CIRNET_ARTIFACTS_SESSION` kế thừa. Thay đường dẫn mẫu bằng đường dẫn tuyệt đối. Khi chạy kiểm tra tích hợp, đưa các thư mục gốc Git thực sự của Interface, Remote và Contracts tham gia vào `roots`. Bản sản phẩm giải nén trong phiên có đường dẫn sản phẩm riêng, còn context giữ các thư mục gốc Git thực tế.

### PowerShell

```powershell
$interfaceRoot = 'C:\path\cirnet-interface'
$manifest = 'C:\absolute\reviewed\artifacts.json'
if ($env:CIRNET_ARTIFACTS_SESSION) { throw 'Use a fresh shell.' }
$env:CIRNET_ARTIFACTS_CONTEXT = (@{
    owner = 'cirnet-interface-dev'
    roots = @($interfaceRoot)
} | ConvertTo-Json -Compress)
$env:CIRNET_ARTIFACTS_DIR = [IO.Path]::GetTempPath()
$env:CIRNET_CONTRACTS_ARTIFACT_MANIFEST = $manifest
Set-Location -LiteralPath $interfaceRoot
$bootstrapJson = & node scripts/bootstrap-contracts.mjs --manifest $manifest
if ($LASTEXITCODE -ne 0) { throw 'Artifact bootstrap failed.' }
($bootstrapJson | ConvertFrom-Json).environment.PSObject.Properties | ForEach-Object {
    [Environment]::SetEnvironmentVariable($_.Name, [string]$_.Value, 'Process')
}
npm ci --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'Locked Interface install failed.' }
```

### Bash

```bash
interface_root=/absolute/cirnet-interface
manifest=/absolute/reviewed/artifacts.json
if [ -n "${CIRNET_ARTIFACTS_SESSION:-}" ]; then
  printf '%s\n' 'Use a fresh shell.' >&2
  exit 1
fi
CIRNET_ARTIFACTS_CONTEXT="$(node -e 'process.stdout.write(JSON.stringify({owner:"cirnet-interface-dev",roots:process.argv.slice(1)}))' "$interface_root")" || exit 1
export CIRNET_ARTIFACTS_CONTEXT
export CIRNET_ARTIFACTS_DIR="${TMPDIR:-/tmp}"
export CIRNET_CONTRACTS_ARTIFACT_MANIFEST="$manifest"
cd "$interface_root" || exit 1
bootstrap_json="$(node scripts/bootstrap-contracts.mjs --manifest "$manifest")" || exit 1
environment_lines="$(printf '%s' "$bootstrap_json" | node -e 'let input="";process.stdin.on("data",chunk=>input+=chunk);process.stdin.on("end",()=>{for(const [name,value] of Object.entries(JSON.parse(input).environment)){if(/[\r\n]/.test(value))throw Error("Multiline bootstrap environment value");console.log(name+"="+value)}})')" || exit 1
while IFS= read -r entry; do export "$entry"; done <<< "$environment_lines"
npm ci --no-audit --no-fund || exit 1
```

Tiến trình bootstrap in JSON. Nạp `environment` từ kết quả vào shell cha trước khi chạy npm hoặc kiểm thử để các tiến trình con dùng chung phiên đã cấp. Các URL HTTPS đã khóa cũng có thể cung cấp đúng gói được chọn. Xem ví dụ ba checkout trong [thiết lập của repository](../../../README.md#run-and-verify).

## Khởi động môi trường phát triển

```sh
npm run dev
```

Vite phục vụ frontend và mặc định chuyển tiếp `/api` cùng `/ws` đến `127.0.0.1:8000`. Có thể chỉnh sửa đồ thị cục bộ chỉ với frontend. Hãy khởi động Remote API và các dịch vụ cần thiết để xác thực, khám phá tài nguyên từ xa, kiểm tra hợp lệ và thực thi. Đặt `CIRNET_DEV_API_TARGET` trước khi mở Vite để đổi đích proxy phát triển. `VITE_API_BASE_URL` và `VITE_WS_URL` cấu hình endpoint tường minh.

`ECONNREFUSED 127.0.0.1:8000` báo Vite không kết nối được API mặc định. Trên Windows, đóng hoặc tải lại trang có thể ngắt thao tác ghi của proxy đang chờ với `write ECONNABORTED`. Nếu trang đang mở vẫn mất kết nối, kiểm tra Network → WS trong trình duyệt và log API. Xem [hướng dẫn khởi động API](https://github.com/cirnetlab/cirnet-remote/blob/745077403f233790bdb6781c36d6502feca01642/services/api/README.md#local-run).

Tiếp tục với [hướng dẫn bàn làm việc](workbench.md) hoặc [lệnh kiểm chứng](../contributing/verification.md).
