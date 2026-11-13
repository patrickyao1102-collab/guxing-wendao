// 测试版游戏页的开场检查。发布时由 tools/build_play.py 整段塞进 game.html 最前面，并把下面 B 里的两个占位符换成这次发布的提交号和时间。
// 作者 11-13：「测试版经常加载不出来更新过后的版本，务必修好。」这里管四件事：
//   ① 这一页要是没被加载程序（Service Worker）管着（比如按了强制刷新），或者管着它的是旧的加载程序 → 自动回加载页重新接上；
//   ② 进游戏时顶上亮几秒「测试版 · 几月几日 几点几分 的版本」，一眼看得出是不是最新的；
//   ③ 开着游戏的时候每分钟问一句有没有新版本，有就在顶上出一行「有新版本 · 点这里更新」；
//   ④ 真有文件没取到（网络不稳），顶上明说「有 N 个文件没加载出来 · 点这里重新加载」，不再悄悄拿旧样子顶上。
(function () {
  var B = { b: '__GX_SHA__', t: '__GX_TIME__' }, NEED = 3, sw = navigator.serviceWorker, q = '';
  try { q = location.search || ''; } catch (e) {}
  window.GX_PLAY = B;
  // 给 Claude 在作者电脑上验收用：网址带 qa_mute=1 时全程不出声。不存任何设置，去掉这个参数就恢复。
  if (/[?&]qa_mute=1/.test(q)) { try { var mp = HTMLMediaElement.prototype, p0 = mp.play; mp.play = function () { try { this.muted = true; this.volume = 0; } catch (e) {} return p0.apply(this, arguments); };
    var AN = window.AudioNode, AD = window.AudioDestinationNode; if (AN && AD) { var c0 = AN.prototype.connect; AN.prototype.connect = function (d) { if (d instanceof AD) return d; return c0.apply(this, arguments); }; } } catch (e) {} }

  var home = function () { location.replace('./' + q + location.hash); };
  // 回加载页重新接上；一分钟内最多两次，免得来回转圈
  var bounce = function () { try { var k = 'gx_bounce', a = JSON.parse(sessionStorage.getItem(k) || '[]').filter(function (t) { return Date.now() - t < 60000; }); if (a.length >= 2) return false; a.push(Date.now()); sessionStorage.setItem(k, JSON.stringify(a)); } catch (e) {} home(); return true; };

  // ---- 顶上的小提示（页面还在加载时就能出：先挂在 <html> 上，不等 <body>） ----
  var host = null, items = {}, pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var fmt = function (t) { var d = new Date(t); return isNaN(d) ? '' : (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  var loaded = function (fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); };
  var hide = function (id) { var el = items[id]; if (!el) return; delete items[id]; el.style.opacity = '0'; setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 700); };
  var tip = function (id, text, o) { o = o || {};
    if (!host) { host = document.createElement('div'); host.style.cssText = 'position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:2147483000;display:flex;flex-direction:column;gap:6px;align-items:center;pointer-events:none;font:15px/1.4 "Songti SC","Noto Serif SC",serif'; (document.body || document.documentElement).appendChild(host); }
    var el = items[id];
    if (!el) { el = items[id] = document.createElement('div');
      el.style.cssText = 'pointer-events:auto;cursor:pointer;padding:7px 16px;border-radius:8px;border:1px solid ' + (o.warn ? '#e08a6a' : '#c9a45a') + ';background:rgba(18,14,10,.93);color:' + (o.warn ? '#ffd9c8' : '#f5e6c4') + ';box-shadow:0 3px 12px rgba(0,0,0,.5);white-space:nowrap;transition:opacity .6s;opacity:1';
      ['pointerdown', 'mousedown', 'touchstart', 'pointerup', 'mouseup', 'touchend', 'click'].forEach(function (ev) { el.addEventListener(ev, function (e) { e.stopPropagation(); if (ev === 'click' && el._go) el._go(); }); });
      host.appendChild(el); }
    el.textContent = text; el._go = o.go || function () { hide(id); }; };

  // ① 没被管着 / 被旧的加载程序管着
  var noSw = function () { tip('sw', '加载程序没接上，画面可能不全 · 点这里重试', { warn: true, go: function () { try { sessionStorage.removeItem('gx_bounce'); } catch (e) {} home(); } }); };
  if (!sw || !sw.controller) { if (bounce()) return; noSw(); }
  else fetch('__sw', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (p) { if (!p || !(p.v >= NEED)) { if (!bounce()) noSw(); } });

  // ② 这是哪一版
  var when = fmt(B.t); if (when) { tip('ver', '测试版 · ' + when + ' 的版本'); loaded(function () { setTimeout(function () { hide('ver'); }, 7000); }); }   // 加载时一直亮着，进到标题画面后再留几秒

  // ③ 有没有新版本
  var newer = false;
  var check = function () { if (newer || document.hidden) return;
    fetch('build.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (!j || !j.b || (j.b === B.b && j.t === B.t) || newer) return; newer = true;
      var s = fmt(j.t); tip('new', '有新版本' + (s ? '（' + s + '）' : '') + ' · 点这里更新（会回到标题画面）', { go: home }); }).catch(function () {}); };
  setTimeout(check, 20000); setInterval(check, 60000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) check(); });

  // ④ 有文件没取到。脚本没取到的只有重新加载才好得了；图片 / 声音之类游戏自己会再要，后来取到了就从提示里划掉
  var fails = {}, failT = 0;
  var show = function () { var n = Object.keys(fails).length; if (!n) { hide('fail'); return; }
    tip('fail', '有 ' + n + ' 个文件没加载出来（网络不稳）· 点这里重新加载（会回到标题画面）', { warn: true, go: function () { location.reload(); } }); };
  var failed = function (name, hard) { if (!name) return; if (fails[name] && !hard) return; fails[name] = hard ? 2 : (fails[name] || 1); clearTimeout(failT); failT = setTimeout(show, 1500); };
  var fine = function (name) { if (fails[name] !== 1) return; delete fails[name]; clearTimeout(failT); failT = setTimeout(show, 1500); };
  window.addEventListener('error', function (e) { var t = e && e.target; if (t && t.tagName === 'SCRIPT' && t.src) { var nm = String(t.src).split('/play/').pop().split('?')[0]; try { nm = decodeURIComponent(nm); } catch (x) {} failed(nm, true); } }, true);
  if (sw) { sw.addEventListener('message', function (e) { var d = (e && e.data) || {}; if (d.type === 'gx-fail') failed(d.rel); else if (d.type === 'gx-ok') fine(d.rel); else if (d.type === 'gx-newer') check(); });
    try { if (sw.startMessages) sw.startMessages(); } catch (e) {} }   // 页面还在加载时就收消息（不然要等整页加载完才知道有文件没取到）
  window.GX_PLAY_FAILS = fails;
})();
