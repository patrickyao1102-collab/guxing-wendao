// ================= 图片载入守卫 + 开局排队（最先加载）=================
// 1) 任何图片下载失败，自动重试（最多 5 次，间隔递增），不会因为一次网络抖动就缺图黑屏。
// 2) 作者 11-07：手机开局要等很久、黑屏 —— 以前一打开游戏，所有章节的地图、立绘、战斗特效（一千多张、两百多 MB）同时开始下载，
//    标题画面和第一张地图要的那几十张图被挤在后面。现在开局阶段请求的图分三档：
//      马上下：标题 / 界面 / 主角立绘和走路图 / 第一张地图（assets、ui、portraits、packs、companions…）
//      排队下：其余地图、物件图集等，等标题素材到齐后最多同时下 4 张；正在换地图时让路
//      最后下：战斗技能特效、坐骑、后期章节怪物（r83、el、fx、sx_assets…），一般在第一场战斗前早就下完了
//    任何还在排队的图，只要游戏真的要画它（drawImage），立刻插队马上下；换图时这张图要的素材按名字插队（r150），所以不会缺图。
//    开局阶段过去以后（剧情里进新地图、开新战斗时临时要的图）一律马上下，不排队。
(function () {
  const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  if (!desc || !desc.set) return;
  const HEAVY = /(^|\/)(sun_assets|skx_assets|ryx_assets|hax_assets|ha_assets|gmx_assets|sx_assets|cxfx|lc_cine)\//;
  // 开局马上要的
  // （标题画面那几十张图在 index.html 里用 IMG_GUARD.crit 包起来，连同它们所在的打包图页一起马上下）
  const CRIT = /^(\.\/)?((ui|ui_icons|fonts|walk8|walk8c|revisions\/companions|revisions\/cloth06|igf2|lvp|lvpd|r157|r155|r160|r154|r153|r164|r163|r165|r86|r87|r169|r175|r176)\/|assets2\/title_|r162\/story_)/;   // r162/story_：青竹小院专属载入插画
  // 战斗特效 / 后期内容：最后下
  const LATE = /^(\.\/)?(r83|el|fx\d*|r78lib|r79|rig|mount|r107|xlw|xl1|r100x|nayue|eqp10|r88)\//;
  const G = window.IMG_GUARD = { pending: 0, heavyQ: [], heavyActive: 0, lowQ: [], lateQ: [], lowActive: 0, bumped: 0, boot: true, crit: false,
    hold: () => !!(window.MAP_LOADING && MAP_LOADING()), fails: 0 };
  const ORG = (() => { try { return location.origin + '/'; } catch (e) { return '\u0000'; } })();
  function realSet(im, v) { desc.set.call(im, v); }
  function track(im, v, tries) {
    G.pending++;
    const done = ok => { im.removeEventListener('load', onL); im.removeEventListener('error', onE); G.pending--;
      if (im.__heavy) { im.__heavy = false; G.heavyActive--; } if (im.__low) { im.__low = false; G.lowActive--; } pump(); if (!ok) G.fails++; };
    const onL = () => done(true);
    const onE = () => { if (tries < 5) { done(true); setTimeout(() => { const u = v + (v.includes('?') ? '&' : '?') + 'retry=' + (tries + 1); track(im, v, tries + 1); realSet(im, u); }, 400 * (tries + 1)); } else done(false); };
    im.addEventListener('load', onL); im.addEventListener('error', onE);
  }
  function start(im, v) { im.__q = null; track(im, v, 0); realSet(im, v); }
  // 排队中的图被真正用到 → 插队
  function bump(im) { const q = im && im.__q; if (!q) return; const i = q.indexOf(im); if (i >= 0) q.splice(i, 1); G.bumped++; start(im, im.__qv); }
  G.bump = bump;
  // 换图时按名字插队：tokens 里任何一个出现在排队图片的路径里就马上下
  G.bumpMatch = toks => { if (!toks.length) return 0; let n = 0; for (const q of [G.lowQ, G.lateQ]) for (let i = q.length - 1; i >= 0; i--) { const im = q[i], u = im.__qv; if (toks.some(t => u.includes(t))) { q.splice(i, 1); G.bumped++; n++; start(im, u); } } return n; };
  let mapWaitT0 = 0;
  // 标题画面的图和字体到齐之前，排队的一张都不放（最多等 20 秒）
  const titleReady = () => { try { return typeof IMG !== 'undefined' && !!IMG.title_art && (!document.fonts || document.fonts.status === 'loaded'); } catch (e) { return true; } };
  const titleWait = () => performance.now() < 20000 && !titleReady();
  function pump() {
    while (G.heavyQ.length && G.heavyActive < 2 && !G.hold()) { const [im, v] = G.heavyQ.shift(); im.__heavy = true; G.heavyActive++; start(im, v); }
    if (titleWait()) return;
    let lim = 4; try { if (typeof S !== 'undefined' && !S.started) lim = 2; } catch (e) {}   // 停在标题画面时慢慢预载，别占满网速（点开始后第一张图要用）
    if (G.hold()) { if (!mapWaitT0) mapWaitT0 = performance.now(); lim = performance.now() - mapWaitT0 > 6000 ? 4 : 0; }   // 换图时排队的全部让路（这张图要的由 r150 按名字插队）；等了 6 秒还没好，说明要的东西可能还在队里没认出来，放开
    else mapWaitT0 = 0;
    while (G.lowActive < lim && (G.lowQ.length || G.lateQ.length)) {
      const q = G.lowQ.length ? G.lowQ : G.lateQ; const im = q.shift(); im.__low = true; G.lowActive++; start(im, im.__qv);
    }
  }
  setInterval(pump, 200);
  // 开局阶段：标题画面出来、页面脚本（含异步初始化）跑完后再过 3 秒结束；玩家一进剧情（S.started），等第一张地图载好再过 2 秒结束——之后请求的图都是游戏当下要的
  let domT = 0; const markDom = () => { domT = performance.now(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', markDom); else markDom();
  const bootIv = setInterval(() => { let started = false; try { started = typeof S !== 'undefined' && !!S.started; } catch (e) {}
    const t = performance.now(); if (started && !G.startT) G.startT = t;
    if ((G.startT && !G.hold() && t - G.startT > 2000) || t > 45000 || (domT && t - domT > 3000 && titleReady() && (G.titleT = G.titleT || t) && t - G.titleT > 3000)) { G.boot = false; clearInterval(bootIv); } }, 200);
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    configurable: true, enumerable: desc.enumerable,
    get() { return this.__q ? (this.__qv || '') : desc.get.call(this); },
    set(v) {
      v = String(v);
      if (this.__q) { const i = this.__q.indexOf(this); if (i >= 0) this.__q.splice(i, 1); this.__q = null; }
      if (/^(data:|blob:)/.test(v)) return realSet(this, v);
      const rel = v.startsWith(ORG) ? v.slice(ORG.length) : v;   // 同源的完整网址按相对路径归类
      if (G.boot && !G.crit && HEAVY.test(rel)) { this.__q = G.lateQ; this.__qv = v; G.lateQ.push(this); pump(); return; }
      if (HEAVY.test(v)) { G.heavyQ.push([this, v]); pump(); return; }
      if (G.boot && !G.crit && !CRIT.test(rel) && !/^(https?:)?\/\//.test(rel)) {
        const q = LATE.test(rel) ? G.lateQ : G.lowQ; this.__q = q; this.__qv = v; q.push(this); pump(); return;
      }
      start(this, v);
    },
  });
  // 要画 / 要解码 → 插队
  const DEC = HTMLImageElement.prototype.decode;
  HTMLImageElement.prototype.decode = function () {
    if (!this.__q) return DEC.call(this);
    // 还在排队：不插队（开局很多脚本会把一大批图 await decode 一遍，插队就等于全部马上下），等它排到、下完再解码
    const im = this; return new Promise((res, rej) => { const ok = () => { off(); DEC.call(im).then(res, rej); }, bad = () => { off(); rej(new Error('img load failed')); }, off = () => { im.removeEventListener('load', ok); im.removeEventListener('error', bad); };
      im.addEventListener('load', ok); im.addEventListener('error', bad); }); };
  const C2 = CanvasRenderingContext2D.prototype, DI = C2.drawImage;
  C2.drawImage = function (im) { if (im) { if (im.__q) bump(im); else if (im.__pkI !== undefined && !im.__pkB) { im.__pkB = 1; const pg = window.__PKIM && __PKIM[im.__pkI]; if (pg && pg.__q) bump(pg); } } return DI.apply(this, arguments); };
  window.addEventListener('load', () => { G.bootDone = performance.now(); });
})();
