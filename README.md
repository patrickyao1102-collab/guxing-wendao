# 孤星问道 · 发布仓库

- `game/` 游戏本体（网页版）。推送到 main 后自动发布到 GitHub Pages，并生成 `version.json`（每个文件的哈希）。
- `android/` 安卓壳：启动时拉 Pages 上的 `version.json`，只下载有变化的文件到手机本地，再进入游戏；没网就用本地版本。
- `.github/workflows/pages.yml` 发布网页版；`apk.yml` 打 APK 并挂到 Releases 的 `latest`。
- `tools/make_manifest.py` 生成版本清单。
