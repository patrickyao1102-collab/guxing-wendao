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
                return new WebResourceResponse(mime(path), null, 206, "Partial Content", h, new LimitedStream(in, end - start + 1));
            }
            if (total > 0) h.put("Content-Length", String.valueOf(total));
            return new WebResourceResponse(mime(path), isText(path) ? "utf-8" : null, 200, "OK", h, in);
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
