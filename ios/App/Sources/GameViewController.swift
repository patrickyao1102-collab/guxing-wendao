import UIKit
import WebKit

// 启动流程（对齐安卓 MainActivity）：先显示 boot.html（检查 / 下载更新进度），
// 更新完成或用户跳过后再进入游戏 index.html。全屏、静音自动播放、禁止长按选择与缩放。
final class GameViewController: UIViewController, WKScriptMessageHandler, WKNavigationDelegate {
    private var webView: WKWebView!
    private var updater: Updater!
    private var gameLoaded = false
    private var installedVersion = "?"

    override var prefersStatusBarHidden: Bool { true }
    override var prefersHomeIndicatorAutoHidden: Bool { true }
    override var preferredScreenEdgesDeferringSystemGestures: UIRectEdge { .all }

    private var webRoot: URL { Bundle.main.resourceURL!.appendingPathComponent("web") }
    private var updateDir: URL {
        let d = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0].appendingPathComponent("update")
        try? FileManager.default.createDirectory(at: d, withIntermediateDirectories: true)
        return d
    }

    override func loadView() {
        let cfg = WKWebViewConfiguration()
        let scheme = WebAppScheme(webRoot: webRoot, updateDir: updateDir)
        cfg.setURLSchemeHandler(scheme, forURLScheme: WebAppScheme.scheme)
        cfg.allowsInlineMediaPlayback = true
        cfg.mediaTypesRequiringUserActionForPlayback = []          // 允许静音自动播放（对齐安卓 setMediaPlaybackRequiresUserGesture(false)）
        cfg.suppressesIncrementalRendering = false
        if #available(iOS 14.0, *) { cfg.defaultWebpagePreferences.allowsContentJavaScript = true }

        // 读取已装版本，注入 window.GuxingApp（skip / version），对齐安卓 JS 桥
        installedVersion = Updater.readInstalledVersion(webRoot: webRoot, updateDir: updateDir)
        let bridge = """
        window.FORCE_LOCAL = true;   // 强制本地模式，素材走内置相对路径（双保险，和 appassets.local host 同效）
        window.GuxingApp = {
          skip: function(){ try{ window.webkit.messageHandlers.guxing.postMessage({a:'skip'}); }catch(e){} },
          version: function(){ return '\(installedVersion)'; }
        };
        """
        let userJS = WKUserScript(source: bridge, injectionTime: .atDocumentStart, forMainFrameOnly: false)
        cfg.userContentController.addUserScript(userJS)
        cfg.userContentController.add(self, name: "guxing")

        let wv = WKWebView(frame: .zero, configuration: cfg)
        wv.isOpaque = false
        wv.backgroundColor = .black
        wv.scrollView.backgroundColor = .black
        wv.scrollView.isScrollEnabled = false
        wv.scrollView.bounces = false
        wv.scrollView.contentInsetAdjustmentBehavior = .never
        wv.scrollView.maximumZoomScale = 1; wv.scrollView.minimumZoomScale = 1
        wv.allowsBackForwardNavigationGestures = false
        wv.allowsLinkPreview = false
        if #available(iOS 16.4, *) { wv.isInspectable = true }   // 连 Mac 的 Safari 可调试
        wv.navigationDelegate = self
        self.webView = wv
        self.view = wv
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        webView.load(URLRequest(url: URL(string: "\(WebAppScheme.scheme)://\(WebAppScheme.host)/boot.html")!))
        updater = Updater(webRoot: webRoot, updateDir: updateDir,
            onStatus: { [weak self] text, done, total, bytes in
                self?.callBoot(text, done, total, bytes)
            },
            onFinished: { [weak self] _, note in
                self?.callBoot(note, 1, 1, 0); self?.startGame()
            })
        updater.start()
    }

    private func callBoot(_ text: String, _ done: Int, _ total: Int, _ bytes: Int64) {
        DispatchQueue.main.async {
            let t = text.replacingOccurrences(of: "\\", with: "\\\\")
                        .replacingOccurrences(of: "\"", with: "\\\"")
                        .replacingOccurrences(of: "\n", with: " ")
            self.webView.evaluateJavaScript("window.onBoot && onBoot(\"\(t)\",\(done),\(total),\(bytes))", completionHandler: nil)
        }
    }

    private func startGame() {
        DispatchQueue.main.async {
            if self.gameLoaded { return }; self.gameLoaded = true
            self.webView.load(URLRequest(url: URL(string: "\(WebAppScheme.scheme)://\(WebAppScheme.host)/index.html")!))
        }
    }

    // boot.html 的「跳过更新」
    func userContentController(_ uc: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "guxing", let body = message.body as? [String: Any], (body["a"] as? String) == "skip" {
            updater?.cancel(); startGame()
        }
    }
}
