// ================= 安装包（安卓 / iOS 离线版）里的声音：整首读进内存再放 =================
// 作者 11-15 手机完整版实测：「背景音乐经常中断——有的地图只播一遍，播完不循环；有的地图干脆不播；跟魔族长老、烈焰妖豹打的时候连战斗音乐都没有；魔族讲话声音也不对」。
// 安装包里的声音是 App 自己从包里一段一段读出来喂给播放器的（不是网页那样从网上下）。播放器要循环、跳到高潮段、或者中途卡一下重读时，
// 都得重新要「从第几个字节开始」的那一段；这条路在部分手机上不稳，所以会出现放完一遍就停、跳不到高潮段、干脆放不出来。
// 改法：只在安装包里生效——每个声音文件先整个读进内存（压缩的 mp3，几 MB，不是解码后的几十 MB），再交给播放器，
// 循环、跳段都在内存里完成，不再回头找 App 要数据。用过的曲子留着复用；太多时把很久没放、也没在用的清掉。
(function () {
  if (location.hostname !== 'appassets.local' && !/[?&]ablob=1/.test(location.search)) return;   // ablob=1：网页上也打开，测试用
  const proto = HTMLMediaElement.prototype;
  const dSrc = Object.getOwnPropertyDescriptor(proto, 'src'), dTime = Object.getOwnPropertyDescriptor(proto, 'currentTime');
  const oPlay = proto.play, oPause = proto.pause, oLoad = proto.load;
  const CACHE = new Map(), ELS = new Set();
  const abs = u => { try { return new URL(u, location.href).href; } catch (e) { return u; } };
  function blobFor(u) {
    let e = CACHE.get(u);
    if (!e) { e = { url: null, t: 0 }; e.p = fetch(u).then(r => { if (!r.ok) throw new Error('http ' + r.status); return r.blob(); }).then(b => (e.url = URL.createObjectURL(b))); e.p.catch(() => CACHE.delete(u)); CACHE.set(u, e); }
    e.t = performance.now(); return e.p;
  }
  const mine = el => el instanceof HTMLAudioElement;
  Object.defineProperty(proto, 'src', { configurable: true, enumerable: true,
    get() { return mine(this) && this.__osrc != null ? this.__osrc : dSrc.get.call(this); },
    set(v) {
      if (!mine(this) || !v || /^(blob:|data:)/i.test(String(v))) { this.__osrc = null; this.__pend = null; return dSrc.set.call(this, v); }
      const me = this, tok = (this.__tok = (this.__tok || 0) + 1); me.__osrc = String(v); if (!me.__wr) { me.__wr = typeof WeakRef === 'function' ? new WeakRef(me) : { deref: () => me }; ELS.add(me.__wr); }
      me.__pend = blobFor(abs(v)).then(bu => { if (me.__tok !== tok) return; me.__pend = null; dSrc.set.call(me, bu); after(me); },
        () => { if (me.__tok !== tok) return; me.__pend = null; dSrc.set.call(me, v); after(me); });   // 读不到就退回原来的做法
    } });
  function after(me) { const t = me.__seek; me.__seek = null; if (t) { const go = () => { try { dTime.set.call(me, t); } catch (e) {} }; if (me.readyState >= 1) go(); else me.addEventListener('loadedmetadata', go, { once: true }); }
    if (me.__want) { me.__want = false; me.__pp = oPlay.call(me); me.__pp.catch(() => {}); } }
  Object.defineProperty(proto, 'currentTime', { configurable: true, enumerable: true,
    get() { return mine(this) && this.__pend ? (this.__seek || 0) : dTime.get.call(this); },
    set(v) { if (mine(this) && this.__pend) { this.__seek = v; return; } dTime.set.call(this, v); } });
  proto.play = function () { if (mine(this) && this.__pend) { this.__want = true; const me = this; return this.__pend.then(() => { const q = me.__pp; me.__pp = null; return q || (me.paused ? oPlay.call(me) : undefined); }); } return oPlay.apply(this, arguments); };
  proto.pause = function () { if (mine(this)) this.__want = false; return oPause.apply(this, arguments); };
  proto.load = function () { if (mine(this) && this.__pend) return; return oLoad.apply(this, arguments); };
  // new Audio(地址) 不经过上面的 src 设置，单独接一下
  const OA = window.Audio;
  const A2 = function Audio(u) { const a = new OA(); if (u !== undefined) a.src = u; return a; };
  A2.prototype = OA.prototype; window.Audio = A2;
  // 内存里的曲子太多（超过 24 首）时，清掉最久没放、而且眼下没有播放器在用的
  setInterval(() => { try { if (CACHE.size <= 24) return; const inUse = new Set(); for (const w of ELS) { const el = w.deref(); if (!el) { ELS.delete(w); continue; } const s = dSrc.get.call(el); if (s) inUse.add(s); }
    const old = [...CACHE.entries()].filter(([, e]) => e.url && !inUse.has(e.url)).sort((a, b) => a[1].t - b[1].t);
    for (const [k, e] of old.slice(0, CACHE.size - 24)) { URL.revokeObjectURL(e.url); CACHE.delete(k); } } catch (e) {} }, 60000);
  window.AUDIO_BLOB = { CACHE };
})();
