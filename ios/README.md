# 孤星问道 · iOS 版（WebView 外壳 + 自动更新 + 素材加扰）

和安卓版同一套思路：WKWebView 加载内置网页资源，启动时从 GitHub Pages 拉更新清单、只下有变化的加扰文件缓存到本地，读取时按同一把 KEY 还原。朋友走 TestFlight 安装，和安卓一样能自动更新。

## 一次准备（在 Mac 上）

```bash
cd ios
./build.sh
```

`build.sh` 会：
1. 跑 `prepare_web.sh` —— 生成加扰正式版网页资源到 `App/web/`（去测试面板 + 删废图 + 字节加扰 + 明文 boot.html/version.json）。需要 `python3`，建议先 `pip3 install numpy`（加扰更快）。
2. 装 `xcodegen`（没有会用 Homebrew 装）并生成 `Guxing.xcodeproj`。
3. 打开工程。

## 在 Xcode 里

1. 选 **Guxing** target → **Signing & Capabilities** → **Team** 选你的 Apple ID / 开发者账号（勾 Automatically manage signing）。
2. **先自测**：数据线连 iPhone，顶部机型选你的手机，点 ▶︎ 直接装到手机上玩。免费 Apple ID 也能装，7 天有效；不用等开发者账号审核。
3. **发给朋友（TestFlight）**：顶部机型选 **Any iOS Device** → 菜单 **Product → Archive** → **Distribute App → TestFlight & App Store** → 上传到 App Store Connect。
   - 到 [App Store Connect](https://appstoreconnect.apple.com) → TestFlight：
     - **内部测试**：把人加进你的团队，处理完（约 10–30 分钟）即可，不用审核。
     - **外部测试**：建一个测试组、开公开链接，第一次要过一次 Beta 审核（通常约 1 天），之后更新很快。把链接发给朋友，他们装个 TestFlight App 点链接就能玩。

## 游戏内容更新

改了游戏推到 main 后，`pages.yml` 会把加扰正式版发到 GitHub Pages（APK 和 iOS 共用的更新源）。
- 安卓：开 App 自动更新。
- iOS：**已装的 App** 开一下就自动更新（下增量文件）。
- 想把**新内容打进安装包本身**（给新朋友装的 TestFlight 包）：重新跑 `./build.sh` 再 Archive 上传一版即可。

## 结构

- `App/Sources/AppDelegate.swift` —— 全屏窗口、常亮不锁屏。
- `App/Sources/GameViewController.swift` —— WKWebView、boot→index 流程、`GuxingApp` JS 桥、强制本地模式。
- `App/Sources/WebAppScheme.swift` —— 自定义 `gxapp://appassets.local/*` 资源服务：更新目录优先、内置兜底、XOR 还原、支持 Range（音视频拖动）。
- `App/Sources/Updater.swift` —— 拉 version.json、下增量、校验 sha、断点续传（对齐安卓 Updater.java）。
- `App/web/` —— `prepare_web.sh` 生成的加扰资源（不入库）。
- `project.yml` —— XcodeGen 工程定义。

> 加扰 KEY 在 `WebAppScheme.swift`、安卓 `Client.java`、`tools/build_release.py` 三处必须逐字节一致。改一处要同步另外两处。
