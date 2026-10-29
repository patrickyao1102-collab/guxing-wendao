package com.guxing.wendao;

import android.content.res.AssetManager;
import android.net.Uri;
import android.webkit.MimeTypeMap;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/** https://appassets.local/xxx → 先找已下载的更新目录 files/update/xxx，没有就读 APK 自带的 assets/xxx */
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
            InputStream in;
            File f = new File(updateDir, path);
            if (f.isFile()) in = new FileInputStream(f); else in = assets.open(path);
            WebResourceResponse r = new WebResourceResponse(mime(path), "utf-8", in);
            Map<String, String> h = new HashMap<>();
            h.put("Access-Control-Allow-Origin", "*");
            h.put("Cache-Control", "no-cache");
            r.setResponseHeaders(h);
            return r;
        } catch (Exception e) {
            return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", new HashMap<>(), new java.io.ByteArrayInputStream(new byte[0]));
        }
    }

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
