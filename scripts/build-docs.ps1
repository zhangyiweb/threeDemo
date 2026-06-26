# 将 zhtml 同步到 docs（GitHub Pages 部署目录）
$root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path "$root\zhtml\index.html")) {
  Write-Error "未找到 zhtml/index.html，请从仓库根目录运行 scripts/build-docs.ps1"
  exit 1
}

Write-Host "构建 docs <- zhtml ($root)"

New-Item -ItemType Directory -Force -Path "$root\docs\assets\cover" | Out-Null
Copy-Item "$root\zhtml\*.html" "$root\docs\" -Force
Copy-Item "$root\assets\cover\*" "$root\docs\assets\cover\" -Force

$index = Get-Content "$root\docs\index.html" -Raw -Encoding UTF8
$index = $index -replace '\.\./assets/cover/', './assets/cover/'
Set-Content "$root\docs\index.html" $index -Encoding UTF8 -NoNewline

if (-not (Test-Path "$root\docs\.nojekyll")) {
  New-Item "$root\docs\.nojekyll" -ItemType File | Out-Null
}

Write-Host "完成：docs 已更新"
