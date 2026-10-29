package com.guxing.wendao;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;

import java.io.File;

/** 启动流程：先显示 boot.html（检查 / 下载更新进度），更新完成或没网时再进入游戏 index.html。 */
public class MainActivity extends Activity {
    private WebView web;
    private Updater updater;
    private volatile boolean gameLoaded = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        hideBars();
        File updateDir = new File(getFilesDir(), "update");
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setTextZoom(100);                                  // 不随系统字体放大，避免 UI 错位
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        s.setOffscreenPreRaster(true);
        web.setLayerType(View.LAYER_TYPE_HARDWARE, null);    // 画布走 GPU
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setVerticalScrollBarEnabled(false); web.setHorizontalScrollBarEnabled(false);
        web.setHapticFeedbackEnabled(false);
        web.setLongClickable(false); web.setOnLongClickListener(v -> true); // 长按不弹选择菜单
        if (android.os.Build.VERSION.SDK_INT >= 28) {        // 刘海屏也铺满
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }
        web.setWebViewClient(new Client(getAssets(), updateDir));
        web.setBackgroundColor(0xFF000000);
        web.addJavascriptInterface(new Bridge(), "GuxingApp");
        setContentView(web);
        web.loadUrl("https://appassets.local/boot.html");
        updater = new Updater(this, updateDir, new Updater.Listener() {
            @Override public void onStatus(final String text, final int done, final int total, final long bytes) {
                runOnUiThread(() -> js("window.onBoot && onBoot(" + Updater.q(text) + "," + done + "," + total + "," + bytes + ")"));
            }
            @Override public void onFinished(final boolean updated, final String note) {
                runOnUiThread(() -> { js("window.onBoot && onBoot(" + Updater.q(note) + ",1,1,0)"); startGame(); });
            }
        });
        updater.start();
    }

    private void js(String code) { try { web.evaluateJavascript(code, null); } catch (Exception ignored) {} }

    private synchronized void startGame() {
        if (gameLoaded) return; gameLoaded = true;
        web.loadUrl("https://appassets.local/index.html");
    }

    /** 页面里可调用：GuxingApp.version() 当前已安装的游戏版本；GuxingApp.skip() 跳过更新直接进游戏 */
    class Bridge {
        @JavascriptInterface public String version() { return updater == null ? "" : updater.installedVersion(); }
        @JavascriptInterface public void skip() { if (updater != null) updater.cancel(); runOnUiThread(MainActivity.this::startGame); }
    }

    private void hideBars() {
        View v = getWindow().getDecorView();
        v.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }

    @Override public void onWindowFocusChanged(boolean hasFocus) { super.onWindowFocusChanged(hasFocus); if (hasFocus) hideBars(); }
    @Override protected void onPause() { super.onPause(); if (web != null) web.onPause(); }
    @Override protected void onResume() { super.onResume(); if (web != null) web.onResume(); hideBars(); }
    @Override public void onBackPressed() { /* 游戏内不响应返回键退出，避免误触 */ }
}
