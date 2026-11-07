import Foundation
import WebKit
import MobileCoreServices
import UniformTypeIdentifiers

// gxapp://local/xxx → 先找已下载的更新目录 Caches/update/xxx，没有就读 App 内置的 web/xxx。
// 除 boot.html / version.json 外，所有文件都是 XOR 加扰的，读取时按同一把 KEY 还原（和 tools/build_release.py、安卓 Client.java 逐字节一致）。
// 支持 Range 请求：iOS 上 <audio>/<video> 必须有 206 + Content-Range 才能播放和拖动。
final class WebAppScheme: NSObject, WKURLSchemeHandler {
    static let scheme = "gxapp"
    // 用和安卓一模一样的 host：游戏里判断「本地模式」看的是 location.hostname==='appassets.local'，
    // 这样 r144 等按本地相对路径取素材（否则会去找远程 /_blob/… 导致素材加载失败）。
    static let host = "appassets.local"

    // 加扰 KEY（59 字节，和安卓 / Python 完全一致）
    static let KEY: [UInt8] = [
        0x9A,0x3C,0x51,0xE7,0x22,0xB8,0x6D,0x14,0xF0,0x7B,0x29,0xC5,
        0x88,0x3E,0xA1,0x5F,0xD2,0x0C,0x97,0x46,0xBB,0x71,0x1D,0xE4,
        0x58,0x33,0xA6,0xCF,0x62,0x09,0x8D,0x4B,0xF7,0x25,0xB0,0x6E,
        0x12,0xA9,0x5C,0xD5,0x37,0xE0,0x7A,0x1E,0x93,0x48,0xBD,0x66,
        0x0A,0x8F,0x41,0xF2,0x28,0xB4,0x6B,0x17,0xCC,0x54,0xD9,
    ]
    // boot.html 直接加载、version.json 更新器按明文读——这两个不加扰
    static func scrambled(_ path: String) -> Bool { path != "boot.html" && path != "version.json" }

    // 就地按绝对偏移还原：buf[i] ^= KEY[(startOffset+i) % 59]
    static func descramble(_ data: inout Data, startOffset: Int) {
        let n = KEY.count
        data.withUnsafeMutableBytes { raw in
            guard let p = raw.bindMemory(to: UInt8.self).baseAddress else { return }
            for i in 0..<raw.count { p[i] ^= KEY[(startOffset + i) % n] }
        }
    }

    private let webRoot: URL      // 内置资源 web/
    private let updateDir: URL    // Caches/update/
    private var cancelled = NSMutableSet()
    private let lock = NSLock()
    private let queue = DispatchQueue(label: "guxing.scheme", qos: .userInitiated, attributes: .concurrent)

    init(webRoot: URL, updateDir: URL) { self.webRoot = webRoot; self.updateDir = updateDir }

    private func isCancelled(_ task: WKURLSchemeTask) -> Bool {
        lock.lock(); defer { lock.unlock() }; return cancelled.contains(ObjectIdentifier(task).hashValue)
    }

    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {
        lock.lock(); cancelled.add(ObjectIdentifier(task).hashValue); lock.unlock()
    }

    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        let req = task.request
        var path = req.url?.path ?? "/"
        if path.hasPrefix("/") { path.removeFirst() }
        if path.isEmpty { path = "index.html" }
        let rangeHeader = req.value(forHTTPHeaderField: "Range")
        let id = ObjectIdentifier(task).hashValue
        let webRoot = self.webRoot, updateDir = self.updateDir

        queue.async { [weak self] in
            guard let self = self else { return }
            // 更新目录优先，否则内置资源
            var fileURL = updateDir.appendingPathComponent(path)
            if !FileManager.default.fileExists(atPath: fileURL.path) {
                fileURL = webRoot.appendingPathComponent(path)
            }
            guard let fh = try? FileHandle(forReadingFrom: fileURL) else {
                self.fail(task, id: id, path: path); return
            }
            defer { try? fh.close() }
            let total: Int = (try? FileManager.default.attributesOfItem(atPath: fileURL.path)[.size] as? Int) ?? 0 ?? 0
            let mime = WebAppScheme.mime(path)
            let doScramble = WebAppScheme.scrambled(path)

            // Range：只读要求的那一段，按 start 对齐 KEY 还原
            if let rh = rangeHeader, rh.hasPrefix("bytes="), total > 0 {
                let spec = String(rh.dropFirst(6))
                let parts = spec.split(separator: "-", maxSplits: 1, omittingEmptySubsequences: false)
                let start = Int(parts.first.map(String.init) ?? "") ?? 0
                var end = (parts.count > 1 ? Int(parts[1]) : nil) ?? (total - 1)
                if end >= total { end = total - 1 }
                if start > end || start < 0 {
                    self.respond416(task, id: id, mime: mime, total: total); return
                }
                let len = end - start + 1
                try? fh.seek(toOffset: UInt64(start))
                var data = (try? fh.read(upToCount: len)) ?? Data()
                if doScramble { WebAppScheme.descramble(&data, startOffset: start) }
                let headers = [
                    "Content-Type": mime,
                    "Content-Length": String(data.count),
                    "Accept-Ranges": "bytes",
                    "Content-Range": "bytes \(start)-\(end)/\(total)",
                    "Access-Control-Allow-Origin": "*",
                    "Cache-Control": "no-cache",
                ]
                guard !self.isCancelled(task) else { return }
                let resp = HTTPURLResponse(url: req.url!, statusCode: 206, httpVersion: "HTTP/1.1", headerFields: headers)!
                self.send(task, id: id, resp: resp, data: data)
                return
            }

            // 整文件 200
            var data = (try? fh.readToEnd()) ?? Data()
            if doScramble { WebAppScheme.descramble(&data, startOffset: 0) }
            let headers = [
                "Content-Type": mime,
                "Content-Length": String(data.count),
                "Accept-Ranges": "bytes",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache",
            ]
            guard !self.isCancelled(task) else { return }
            let resp = HTTPURLResponse(url: req.url!, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: headers)!
            self.send(task, id: id, resp: resp, data: data)
        }
    }

    private func send(_ task: WKURLSchemeTask, id: Int, resp: URLResponse, data: Data) {
        DispatchQueue.main.async {
            guard !self.isCancelled(task) else { return }
            task.didReceive(resp); task.didReceive(data); task.didFinish()
        }
    }
    private func respond416(_ task: WKURLSchemeTask, id: Int, mime: String, total: Int) {
        let headers = ["Content-Type": mime, "Content-Range": "bytes */\(total)"]
        let resp = HTTPURLResponse(url: task.request.url!, statusCode: 416, httpVersion: "HTTP/1.1", headerFields: headers)!
        DispatchQueue.main.async { guard !self.isCancelled(task) else { return }; task.didReceive(resp); task.didFinish() }
    }
    private func fail(_ task: WKURLSchemeTask, id: Int, path: String) {
        DispatchQueue.main.async {
            guard !self.isCancelled(task) else { return }
            let resp = HTTPURLResponse(url: task.request.url!, statusCode: 404, httpVersion: "HTTP/1.1",
                                       headerFields: ["Content-Type": "text/plain"])!
            task.didReceive(resp); task.didReceive("Not Found: \(path)".data(using: .utf8)!); task.didFinish()
        }
    }

    static func mime(_ path: String) -> String {
        let ext = (path as NSString).pathExtension.lowercased()
        switch ext {
        case "js", "mjs": return "text/javascript"
        case "html": return "text/html"
        case "css": return "text/css"
        case "json": return "application/json"
        case "webp": return "image/webp"
        case "png": return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        case "gif": return "image/gif"
        case "svg": return "image/svg+xml"
        case "mp3": return "audio/mpeg"
        case "m4a": return "audio/mp4"
        case "ogg": return "audio/ogg"
        case "wav": return "audio/wav"
        case "mp4": return "video/mp4"
        case "webm": return "video/webm"
        case "ttf": return "font/ttf"
        case "otf": return "font/otf"
        case "woff": return "font/woff"
        case "woff2": return "font/woff2"
        case "wasm": return "application/wasm"
        default: return "application/octet-stream"
        }
    }
}
