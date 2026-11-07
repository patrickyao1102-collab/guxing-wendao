import Foundation
import CryptoKit

// 启动时的热更新（对齐安卓 Updater.java）：拉远端 version.json（每个文件 sha256 前 20 位 + 大小），
// 和本地已装清单比对，只下有变化的加扰文件到 Caches/update/，下好的先用上、按文件合并清单，
// 没下完的下次启动接着下。远端地址 BASE 指向 GitHub Pages（和安卓同一个站点、同一份加扰包）。
final class Updater {
    static let BASE = "https://patrickyao1102-collab.github.io/guxing-wendao/"
    private let timeout: TimeInterval = 20

    private let webRoot: URL
    private let updateDir: URL
    private let onStatus: (String, Int, Int, Int64) -> Void
    private let onFinished: (Bool, String) -> Void
    private var cancelled = false

    init(webRoot: URL, updateDir: URL,
         onStatus: @escaping (String, Int, Int, Int64) -> Void,
         onFinished: @escaping (Bool, String) -> Void) {
        self.webRoot = webRoot; self.updateDir = updateDir
        self.onStatus = onStatus; self.onFinished = onFinished
    }

    func cancel() { cancelled = true }

    // 本地清单：优先 Caches/update/version.json，没有就用内置 web/version.json
    static func localManifest(webRoot: URL, updateDir: URL) -> [String: Any] {
        for u in [updateDir.appendingPathComponent("version.json"), webRoot.appendingPathComponent("version.json")] {
            if let d = try? Data(contentsOf: u), let j = try? JSONSerialization.jsonObject(with: d) as? [String: Any] { return j }
        }
        return [:]
    }
    static func readInstalledVersion(webRoot: URL, updateDir: URL) -> String {
        (localManifest(webRoot: webRoot, updateDir: updateDir)["version"] as? String) ?? "?"
    }

    func start() {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in self?.run() }
    }

    private func run() {
        onStatus("正在检查更新…", 0, 0, 0)
        guard let remoteText = fetchText(Updater.BASE + "version.json?t=\(Int(Date().timeIntervalSince1970 * 1000))"),
              let remote = try? JSONSerialization.jsonObject(with: Data(remoteText.utf8)) as? [String: Any],
              let rf = remote["files"] as? [String: Any] else {
            onFinished(false, "暂时无法检查更新，使用本地版本"); return
        }
        let local = Updater.localManifest(webRoot: webRoot, updateDir: updateDir)
        let rv = (remote["version"] as? String) ?? ""
        let lv = (local["version"] as? String) ?? ""
        let lf = (local["files"] as? [String: Any]) ?? [:]

        var todo: [String] = []; var total: Int64 = 0
        for (p, ev) in rf {
            guard let e = ev as? [String: Any] else { continue }
            let rsha = (e["sha"] as? String) ?? ""
            let lsha = ((lf[p] as? [String: Any])?["sha"] as? String) ?? ""
            if !lsha.isEmpty && lsha == rsha { continue }       // 本地（内置或已下）哈希一致 → 跳过
            todo.append(p); total += Int64((e["size"] as? Int) ?? 0)
        }
        if todo.isEmpty { onFinished(false, "已是最新版本"); return }

        let tmp = updateDir.appendingPathComponent("_tmp")
        try? FileManager.default.createDirectory(at: tmp, withIntermediateDirectories: true)

        var okList: [String] = [], badList: [String] = []
        var got: Int64 = 0; var n = 0
        for p in todo {
            if cancelled { break }
            n += 1
            onStatus("正在下载更新 \(n) / \(todo.count)　\(mb(got)) / \(mb(total))", n, todo.count, got)
            let want = ((rf[p] as? [String: Any])?["sha"] as? String) ?? ""
            let out = tmp.appendingPathComponent(p)
            try? FileManager.default.createDirectory(at: out.deletingLastPathComponent(), withIntermediateDirectories: true)
            var fine = FileManager.default.fileExists(atPath: out.path) && (want.isEmpty || want == sha20(out))
            var tryN = 0
            while !fine && tryN < 3 {
                if download(Updater.BASE + encode(p), to: out) { fine = want.isEmpty || want == sha20(out) } else { fine = false }
                if !fine { try? FileManager.default.removeItem(at: out); Thread.sleep(forTimeInterval: 0.4 * Double(tryN + 1)) }
                tryN += 1
            }
            if fine { okList.append(p); got += fileSize(out) } else { badList.append(p) }
        }

        if okList.isEmpty { onFinished(false, cancelled ? "已跳过更新" : "更新下载失败，使用本地版本"); return }

        // 下好的搬进正式目录
        for p in okList {
            let src = tmp.appendingPathComponent(p), dst = updateDir.appendingPathComponent(p)
            try? FileManager.default.createDirectory(at: dst.deletingLastPathComponent(), withIntermediateDirectories: true)
            try? FileManager.default.removeItem(at: dst)
            if (try? FileManager.default.moveItem(at: src, to: dst)) == nil { try? FileManager.default.copyItem(at: src, to: dst) }
        }
        // 清单按文件合并：没下好的保留旧记录，下次再补
        var merged = remote
        var mf = rf
        for p in badList {
            if let le = lf[p] { mf[p] = le } else { mf.removeValue(forKey: p) }
        }
        merged["files"] = mf
        if !badList.isEmpty || cancelled {
            merged["version"] = lv.isEmpty ? "\(rv)-部分" : "\(lv)→\(rv)(\(badList.count)个未完成)"
        }
        // 远端没有的旧文件删掉
        for (p, _) in lf where rf[p] == nil { try? FileManager.default.removeItem(at: updateDir.appendingPathComponent(p)) }

        if let data = try? JSONSerialization.data(withJSONObject: merged, options: []) {
            try? data.write(to: updateDir.appendingPathComponent("version.json"))
        }
        if badList.isEmpty && !cancelled {
            try? FileManager.default.removeItem(at: tmp)
            onFinished(true, "更新完成（\(rv)），正在启动")
        } else {
            onFinished(true, (cancelled ? "已跳过剩余更新" : "还有 \(badList.count) 个文件没下完，下次启动继续") + "（已更新 \(okList.count) 个）")
        }
    }

    // sha256 前 20 位十六进制（和 make_manifest.py 一致）
    private func sha20(_ url: URL) -> String {
        guard let data = try? Data(contentsOf: url) else { return "" }
        let digest = SHA256.hash(data: data)
        return digest.map { String(format: "%02x", $0) }.joined().prefix(20).description
    }
    private func fileSize(_ url: URL) -> Int64 {
        (try? FileManager.default.attributesOfItem(atPath: url.path)[.size] as? Int64) ?? 0
    }
    private func mb(_ b: Int64) -> String { String(format: "%.1fMB", Double(b) / 1048576.0) }
    private func encode(_ p: String) -> String {
        p.split(separator: "/", omittingEmptySubsequences: false)
            .map { $0.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? String($0) }
            .joined(separator: "/")
    }

    private func fetchText(_ urlStr: String) -> String? {
        guard let url = URL(string: urlStr) else { return nil }
        var req = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalAndRemoteCacheData, timeoutInterval: timeout)
        req.setValue("no-cache", forHTTPHeaderField: "Cache-Control")
        let sem = DispatchSemaphore(value: 0); var out: String?
        URLSession.shared.dataTask(with: req) { data, resp, _ in
            if let http = resp as? HTTPURLResponse, http.statusCode == 200, let d = data { out = String(data: d, encoding: .utf8) }
            sem.signal()
        }.resume()
        _ = sem.wait(timeout: .now() + timeout + 5)
        return out
    }
    private func download(_ urlStr: String, to out: URL) -> Bool {
        guard let url = URL(string: urlStr) else { return false }
        let req = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalAndRemoteCacheData, timeoutInterval: timeout)
        let sem = DispatchSemaphore(value: 0); var ok = false
        URLSession.shared.downloadTask(with: req) { tmpURL, resp, _ in
            defer { sem.signal() }
            guard let http = resp as? HTTPURLResponse, http.statusCode == 200, let tmpURL = tmpURL else { return }
            try? FileManager.default.removeItem(at: out)
            do { try FileManager.default.moveItem(at: tmpURL, to: out); ok = true } catch { ok = false }
        }.resume()
        _ = sem.wait(timeout: .now() + 180)
        return ok
    }
}
