package com.guxing.wendao;

import android.content.res.AssetFileDescriptor;
import android.content.res.AssetManager;
import android.net.Uri;
import android.webkit.MimeTypeMap;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * https://appassets.local/xxx → 先找已下载的更新目录 files/update/xxx，没有就读 APK 自带的 assets/xxx。
 * 支持 Range 请求（<video>/<audio> 在安卓上必须要有 206 + Content-Range 才能播放和拖动）。
 */
public class Client extends WebViewClient {
    private final AssetManager assets;
    private final File updateDir;

    public Client(AssetManager assets, File updateDir) { this.assets = assets; this.updateDir = updateDir; }

    // 素材加扰 KEY：和 tools/build_release.py 的 KEY 逐字节一致（正式版把素材字节 XOR 打乱，这里读取时还原）
    private static final byte[] SCRAMBLE_KEY = {
        (byte)0x9A,(byte)0x3C,(byte)0x51,(byte)0xE7,(byte)0x22,(byte)0xB8,(byte)0x6D,(byte)0x14,(byte)0xF0,(byte)0x7B,(byte)0x29,(byte)0xC5,
        (byte)0x88,(byte)0x3E,(byte)0xA1,(byte)0x5F,(byte)0xD2,(byte)0x0C,(byte)0x97,(byte)0x46,(byte)0xBB,(byte)0x71,(byte)0x1D,(byte)0xE4,
        (byte)0x58,(byte)0x33,(byte)0xA6,(byte)0xCF,(byte)0x62,(byte)0x09,(byte)0x8D,(byte)0x4B,(byte)0xF7,(byte)0x25,(byte)0xB0,(byte)0x6E,
        (byte)0x12,(byte)0xA9,(byte)0x5C,(byte)0xD5,(byte)0x37,(byte)0xE0,(byte)0x7A,(byte)0x1E,(byte)0x93,(byte)0x48,(byte)0xBD,(byte)0x66,
        (byte)0x0A,(byte)0x8F,(byte)0x41,(byte)0xF2,(byte)0x28,(byte)0xB4,(byte)0x6B,(byte)0x17,(byte)0xCC,(byte)0x54,(byte)0xD9,
    };
    // boot.html 在游戏前直接加载、version.json 更新器按明文读——这两个不加扰；其余 appassets 文件都要还原
    private static boolean scrambled(String path) { return !"boot.html".equals(path) && !"version.json".equals(path); }

    /** 读取时按绝对字节偏移 XOR 还原（支持 Range：从 startOffset 处对齐 KEY）*/
    static class XorStream extends InputStream {
        private final InputStream in; private long pos;
        XorStream(InputStream in, long startOffset) { this.in = in; this.pos = startOffset; }
        @Override public int read() throws java.io.IOException { int b = in.read(); if (b < 0) return -1; int o = (b ^ (SCRAMBLE_KEY[(int)(pos % SCRAMBLE_KEY.length)] & 0xFF)) & 0xFF; pos++; return o; }
        @Override public int read(byte[] buf, int off, int len) throws java.io.IOException { int n = in.read(buf, off, len); for (int i = 0; i < n; i++) { buf[off + i] = (byte)(buf[off + i] ^ SCRAMBLE_KEY[(int)(pos % SCRAMBLE_KEY.length)]); pos++; } return n; }
        @Override public void close() throws java.io.IOException { in.close(); }
    }


    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
        Uri u = req.getUrl();
        if (!"appassets.local".equals(u.getHost())) return null;
        String path = u.getPath();
        if (path == null || path.isEmpty() || "/".equals(path)) path = "/index.html";
        path = path.substring(1);
        try {
            InputStream in; long total;
            File f = new File(updateDir, path);
            if (f.isFile()) { in = new FileInputStream(f); total = f.length(); }
            else {
                try (AssetFileDescriptor fd = assets.openFd(path)) { total = fd.getLength(); }
                catch (Exception e) { total = -1; }   // 被压缩的 asset 拿不到长度
                in = assets.open(path);
            }
            Map<String, String> h = new HashMap<>();
            h.put("Access-Control-Allow-Origin", "*");
            h.put("Cache-Control", "no-cache");
            h.put("Accept-Ranges", "bytes");
            String range = req.getRequestHeaders() != null ? req.getRequestHeaders().get("Range") : null;
            if (range != null && range.startsWith("bytes=") && total > 0) {
                String[] parts = range.substring(6).split("-", 2);
                long start = parts[0].isEmpty() ? 0 : Long.parseLong(parts[0]);
                long end = parts.length > 1 && !parts[1].isEmpty() ? Long.parseLong(parts[1]) : total - 1;
                if (end >= total) end = total - 1;
                if (start > end) { in.close(); return new WebResourceResponse(mime(path), null, 416, "Range Not Satisfiable", h, new ByteArrayInputStream(new byte[0])); }
                skipFully(in, start);
                h.put("Content-Range", "bytes " + start + "-" + end + "/" + total);
                h.put("Content-Length", String.valueOf(end - start + 1));
                return new WebResourceResponse(mime(path), null, 206, "Partial Content", h, new LimitedStream(scrambled(path) ? new XorStream(in, start) : in, end - start + 1));
            }
            if (total > 0) h.put("Content-Length", String.valueOf(total));
            return new WebResourceResponse(mime(path), isText(path) ? "utf-8" : null, 200, "OK", h, scrambled(path) ? new XorStream(in, 0) : in);
        } catch (Exception e) {
            return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", new HashMap<>(), new ByteArrayInputStream(new byte[0]));
        }
    }

    private static void skipFully(InputStream in, long n) throws Exception { while (n > 0) { long s = in.skip(n); if (s <= 0) { if (in.read() < 0) break; s = 1; } n -= s; } }

    /** 只吐出 Range 要求的那一段 */
    static class LimitedStream extends InputStream {
        private final InputStream in; private long left;
        LimitedStream(InputStream in, long left) { this.in = in; this.left = left; }
        @Override public int read() throws java.io.IOException { if (left <= 0) return -1; int b = in.read(); if (b >= 0) left--; return b; }
        @Override public int read(byte[] buf, int off, int len) throws java.io.IOException { if (left <= 0) return -1; int n = in.read(buf, off, (int) Math.min(len, left)); if (n > 0) left -= n; return n; }
        @Override public void close() throws java.io.IOException { in.close(); }
    }

    static boolean isText(String path) { String m = mime(path); return m.startsWith("text/") || m.equals("application/json"); }

    static String mime(String path) {
        int i = path.lastIndexOf('.');
        String ext = i >= 0 ? path.substring(i + 1).toLowerCase() : "";
        switch (ext) {
            case "js": return "text/javascript";
            case "mjs": return "text/javascript";
            case "html": return "text/html";
            case "css": return "text/css";
            case "json": return "application/json";
            case "webp": return "image/webp";
            case "png": return "image/png";
            case "jpg": case "jpeg": return "image/jpeg";
            case "mp3": return "audio/mpeg";
            case "mp4": return "video/mp4";
            case "wasm": return "application/wasm";
        }
        String m = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext);
        return m != null ? m : "application/octet-stream";
    }
}
