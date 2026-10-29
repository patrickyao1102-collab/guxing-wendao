package com.guxing.wendao;

import android.content.Context;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * 启动时的热更新：拉远端 version.json（每个文件的 sha256 + 大小），和本地已装的清单比对，
 * 只下载有变化的文件到 files/update/，全部下完再把清单写成本地版本（半途断网不会留下半套文件）。
 * 远端地址 BASE 指向 GitHub Pages；以后换成自己的域名只改这一处。
 */
public class Updater extends Thread {
    public static final String BASE = "https://patrickyao1102-collab.github.io/guxing-wendao/";
    private static final int CONNECT_TIMEOUT = 6000, READ_TIMEOUT = 20000;

    public interface Listener { void onStatus(String text, int done, int total, long bytes); void onFinished(boolean updated, String note); }

    private final Context ctx; private final File dir; private final Listener l;
    private volatile boolean cancelled = false;

    public Updater(Context ctx, File dir, Listener l) { this.ctx = ctx; this.dir = dir; this.l = l; setDaemon(true); }
    public void cancel() { cancelled = true; }

    /** 本地清单：优先 files/update/version.json，没有就用 APK 自带的 assets/version.json */
    private JSONObject localManifest() {
        try { File f = new File(dir, "version.json"); if (f.isFile()) return new JSONObject(readAll(new java.io.FileInputStream(f))); } catch (Exception ignored) {}
        try { return new JSONObject(readAll(ctx.getAssets().open("version.json"))); } catch (Exception ignored) {}
        return new JSONObject();
    }
    public String installedVersion() { return localManifest().optString("version", "?"); }

    @Override public void run() {
        try {
            l.onStatus("正在检查更新…", 0, 0, 0);
            String remoteText = fetchText(BASE + "version.json?t=" + System.currentTimeMillis());
            JSONObject remote = new JSONObject(remoteText);
            JSONObject local = localManifest();
            String rv = remote.optString("version", ""), lv = local.optString("version", "");
            JSONObject rf = remote.getJSONObject("files"), lf = local.optJSONObject("files");
            if (lf == null) lf = new JSONObject();
            List<String> todo = new ArrayList<>(); long total = 0;
            for (Iterator<String> it = rf.keys(); it.hasNext();) {
                String p = it.next(); JSONObject e = rf.getJSONObject(p); JSONObject le = lf.optJSONObject(p);
                boolean same = le != null && le.optString("sha").equals(e.optString("sha"));
                // 已在更新目录里且哈希一致的不用再下；APK 自带且一致的也不用下
                if (same) continue;
                todo.add(p); total += e.optLong("size", 0);
            }
            if (todo.isEmpty()) { l.onFinished(false, rv.equals(lv) ? "已是最新版本" : "已是最新版本"); return; }
            dir.mkdirs(); File tmp = new File(dir, "_tmp"); tmp.mkdirs();
            long got = 0; int n = 0;
            for (String p : todo) {
                if (cancelled) { l.onFinished(false, "已跳过更新"); return; }
                n++; l.onStatus("正在下载更新 " + n + " / " + todo.size() + "　" + mb(got) + " / " + mb(total), n, todo.size(), got);
                File out = new File(tmp, p); out.getParentFile().mkdirs();
                got += download(BASE + encode(p), out);
            }
            // 全部下完：把临时文件搬到正式目录，再写清单
            for (String p : todo) { File src = new File(tmp, p), dst = new File(dir, p); dst.getParentFile().mkdirs(); if (dst.exists()) dst.delete(); if (!src.renameTo(dst)) copy(src, dst); }
            // 远端清单里没有的旧文件删掉（避免越积越多）
            for (Iterator<String> it = lf.keys(); it.hasNext();) { String p = it.next(); if (!rf.has(p)) new File(dir, p).delete(); }
            writeText(new File(dir, "version.json"), remoteText);
            deleteDir(tmp);
            l.onFinished(true, "更新完成（" + rv + "），正在启动");
        } catch (Exception e) {
            l.onFinished(false, "暂时无法检查更新，使用本地版本");
        }
    }

    private static String mb(long b) { return String.format(java.util.Locale.CHINA, "%.1fMB", b / 1048576.0); }
    private static String encode(String p) { StringBuilder sb = new StringBuilder(); for (String seg : p.split("/")) { if (sb.length() > 0) sb.append('/'); try { sb.append(java.net.URLEncoder.encode(seg, "UTF-8").replace("+", "%20")); } catch (Exception e) { sb.append(seg); } } return sb.toString(); }

    private static String fetchText(String url) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(CONNECT_TIMEOUT); c.setReadTimeout(READ_TIMEOUT); c.setUseCaches(false);
        try { if (c.getResponseCode() != 200) throw new RuntimeException("http " + c.getResponseCode()); return readAll(c.getInputStream()); } finally { c.disconnect(); }
    }
    private static long download(String url, File out) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(CONNECT_TIMEOUT); c.setReadTimeout(READ_TIMEOUT);
        try (InputStream in = c.getInputStream(); OutputStream o = new FileOutputStream(out)) {
            if (c.getResponseCode() != 200) throw new RuntimeException("http " + c.getResponseCode());
            byte[] buf = new byte[65536]; long n = 0; int r; while ((r = in.read(buf)) > 0) { o.write(buf, 0, r); n += r; } return n;
        } finally { c.disconnect(); }
    }
    private static String readAll(InputStream in) throws Exception {
        try (BufferedReader r = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) { StringBuilder sb = new StringBuilder(); char[] b = new char[8192]; int n; while ((n = r.read(b)) > 0) sb.append(b, 0, n); return sb.toString(); }
    }
    private static void writeText(File f, String s) throws Exception { try (OutputStream o = new FileOutputStream(f)) { o.write(s.getBytes(StandardCharsets.UTF_8)); } }
    private static void copy(File a, File b) throws Exception { try (InputStream in = new java.io.FileInputStream(a); OutputStream o = new FileOutputStream(b)) { byte[] buf = new byte[65536]; int r; while ((r = in.read(buf)) > 0) o.write(buf, 0, r); } a.delete(); }
    private static void deleteDir(File d) { File[] fs = d.listFiles(); if (fs != null) for (File f : fs) { if (f.isDirectory()) deleteDir(f); else f.delete(); } d.delete(); }
    static String q(String s) { return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ") + "\""; }
}
