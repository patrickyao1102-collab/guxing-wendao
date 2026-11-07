#!/usr/bin/env bash
# 在 Mac 上一键准备：生成内置网页资源，然后打开已经做好的 Xcode 工程。
# 不需要 Homebrew、不需要 xcodegen —— 工程文件(Guxing.xcodeproj)已经在仓库里了。
# 只需要 python3（装了 Xcode 命令行工具就自带）。
set -e
cd "$(dirname "$0")"

echo "==> 生成加扰正式版网页资源到 App/web/（第一次会慢一点，要处理全部素材）"
bash prepare_web.sh

echo "==> 打开 Xcode 工程"
open Guxing.xcodeproj || {
  echo "没能自动打开，请手动双击 ios/Guxing.xcodeproj"; exit 0;
}

cat <<'TIP'

接下来在 Xcode 里（点几下，不用敲命令）：
  1. 左侧选 Guxing → Signing & Capabilities → Team 选你的 Apple ID / 开发者账号（勾自动签名）。
  2. 先自测：数据线连 iPhone，顶部选你的手机，点 ▶︎ 运行 → 直接装到手机上玩（免费账号也行，7 天有效）。
  3. 发朋友：顶部选 Any iOS Device → Product → Archive → Distribute App → TestFlight & App Store。
     上传后在 App Store Connect：内部测试员即时可用；外部组开公开链接（首次约 1 天 Beta 审核），两者可同时配。
TIP
