#!/usr/bin/env bash
# 一键准备 iOS 工程（在 Mac 上跑）：生成加扰资源 → 生成 Xcode 工程 → 打开。
# 之后在 Xcode 里选你的开发者账号签名，Archive 上传 TestFlight。
set -e
cd "$(dirname "$0")"

# 1) 生成内置网页资源（加扰正式版 + 清单 + boot.html）
bash prepare_web.sh

# 2) 需要 xcodegen（把 project.yml 变成 .xcodeproj）。没装就用 Homebrew 装。
if ! command -v xcodegen >/dev/null 2>&1; then
  echo "没检测到 xcodegen，正在用 Homebrew 安装…"
  if ! command -v brew >/dev/null 2>&1; then
    echo "！没有 Homebrew。请先装 Homebrew（https://brew.sh），或手动：brew install xcodegen"; exit 1
  fi
  brew install xcodegen
fi

# 3) 生成工程
xcodegen generate
echo "完成。正在打开 Guxing.xcodeproj …"
open Guxing.xcodeproj || true
cat <<'TIP'

接下来在 Xcode 里：
  1. 左侧选 Guxing target → Signing & Capabilities → Team 选你的 Apple ID / 开发者账号（自动签名）。
  2. 先自测：数据线连上 iPhone，顶部选你的手机，点 ▶︎ 运行，直接装到手机上玩（免费账号也行，7 天有效）。
  3. 发给朋友：顶部机型选「Any iOS Device」→ 菜单 Product → Archive → Distribute App → TestFlight & App Store，
     上传到 App Store Connect，在 TestFlight 里加测试员、发链接。
TIP
