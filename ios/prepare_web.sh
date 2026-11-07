#!/usr/bin/env bash
# 在 Mac 上打包前先跑这个：生成「加扰正式版」网页资源，放进 iOS 工程的内置资源 App/web/。
#   1) tools/build_release.py  —— 去测试面板 + 删废图 + 素材字节加扰（和安卓 / Pages 完全同一套、同一把 KEY）
#   2) tools/make_manifest.py  —— 生成 version.json（明文，更新器按它比对）
#   3) 复制到 ios/App/web/，并补一份明文 boot.html（启动进度页，和安卓同一份）
# 需要 python3 + numpy（加扰加速）。没有 numpy 会自动退回纯 Python（慢但一样对）。
set -e
cd "$(dirname "$0")/.."                      # 仓库根目录
VER="$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d-%H%M)"

echo "[1/3] 构建加扰正式版 release/ …"
python3 tools/build_release.py release

echo "[2/3] 生成更新清单 version.json（版本 $VER）…"
python3 tools/make_manifest.py release "$VER"

echo "[3/3] 复制到 ios/App/web/ …"
WEB="ios/App/web"
rm -rf "$WEB"; mkdir -p "$WEB"
cp -R release/. "$WEB"/
cp android/app/src/main/assets/boot.html "$WEB"/boot.html     # 启动页保持明文（和安卓一致）

echo "完成：$(du -sh "$WEB" | cut -f1) → $WEB（版本 $VER）"
