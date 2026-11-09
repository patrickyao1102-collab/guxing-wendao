// ================= 换图载入画面：地面 / 物件没载好之前不再露出绿底，显示载入进度条；并提前预载相邻地图 =================
(function () {
  if (typeof S === 'undefined' || !S.overlay) return;
  let shown = 0, prog = 0, mapAt = null, t0 = 0, forced = null;
  // 当前地图还差多少图没载好（0~1）
  // 作者 11-06：进度条走满之前，本地图的配乐也要缓冲好（最多等 8 秒，网络太慢就先进图，曲子随后接上）
  const aw = { m: null, t: 0 };
  function musicOk() { if (!window.BGM29 || !BGM29.ready) return true; if (aw.m !== world.mapName) { aw.m = world.mapName; aw.t = performance.now(); } if (performance.now() - aw.t > 30000) return true; return BGM29.ready(); }
  // 作者 11-07：手机上图早就到齐了，还要再干等配乐好几秒 → 图到齐后最多再等 3 秒配乐，曲子随后接上
  let imgOkMap = null, imgOkT = 0;
  // 作者 11-08：「我不怕时间长，一定要把所有东西准备好、保证玩的时候不卡，才可以加载完毕」
  // → 弹窗拆件（领悟 / 升级 / 战斗结算）、字体等登记进 PRELOAD，没下完就一直停在载入插画上；配乐也等缓冲好（最多 30 秒防死等）
  let pend = 0; const pendList = new Set();
  window.PRELOAD = (name, p) => { if (!p || !p.then) return p; pend++; pendList.add(name); const done = () => { pend--; pendList.delete(name); };
    Promise.race([p, new Promise(r => setTimeout(r, 60000))]).then(done, done); return p; };
  window.PRELOAD_PENDING = () => [...pendList];
  // 游戏字体（r86 装的霞鹜文楷 / 东方大楷）：装进 document.fonts 才算好（最多等 20 秒）
  try { const has = n => { try { for (const f of document.fonts) if (f.family.replace(/"/g, '') === n && f.status === 'loaded') return true; } catch (e) {} return false; };
    PRELOAD('字体', new Promise(res => { const t0 = performance.now(); const iv = setInterval(() => { if ((has('GuxingKai') && has('GuxingDF')) || performance.now() - t0 > 20000) { clearInterval(iv); res(); } }, 150); })); } catch (e) {}
  // R163 书法题名：换图时先把这张图的两版题名下好（最多等 8 秒，没有就用电脑字）
  const TIM = {}, TIT = {};
  const titleLoad = m => { if (!m || TIM[m]) return; TIM[m] = {}; TIT[m] = performance.now();
    for (const v of ['light', 'dark']) { const im = new Image(); im.onload = () => { TIM[m][v] = im; }; im.onerror = () => { TIM[m][v] = null; }; im.src = 'r163/' + m + '_' + v + '.webp'; } };
  const TITLE_IM = (m, v) => { titleLoad(m); return TIM[m] && TIM[m][v] || null; };
  const titleReady = () => { const m = world.mapName; titleLoad(m); const t = TIM[m]; return !t || ('light' in t && 'dark' in t) || performance.now() - TIT[m] > 8000; };
  const extraReady = () => { try { const e = window.MAP_EXTRA_READY ? MAP_EXTRA_READY(world.mapName) : 1; return e == null ? 1 : e; } catch (e) { return 1; } };
  function readiness() { const r = Math.min(imgReady(), extraReady() < 1 ? .9 * extraReady() + .05 : 1); if (r < 1) { imgOkMap = null; return r; }
    if (forced === world.mapName || S.scene !== drawMap) return r;
    if (pend > 0 || !titleReady()) return .96;
    if (imgOkMap !== world.mapName) { imgOkMap = world.mapName; imgOkT = performance.now(); }
    return performance.now() - imgOkT < 30000 && !musicOk() ? .97 : r; }
  function imgReady() {
    const m = world.map; if (!m || S.scene !== drawMap) return 1;
    if (forced === world.mapName) return 1;   // 玩家在“网络很慢”提示里点了继续
    // 老式整图地图（藏经阁、后山等）：底图必须到齐
    if (!m.tile) { const k = m.img; if (!k) return 1; return IMG[k] && IMG[k].width > 8 ? 1 : 0; }
    const d = m.def; if (!d || !d.baked) return 1;
    const g = d.baked.ground, objs = d.baked.objs || [];
    if (window.CX2_LAZY_LD && /^cx2g_/.test(g || '') && !IMG[g]) CX2_LAZY_LD(g.slice(5));
    let n = 0, ok = 0; for (const o of objs) { if (!o.img) continue; n++; if (IMG[o.img]) ok++; }
    return (IMG[g] ? .65 : 0) + .35 * (n ? ok / n : 1);
  }
  window.MAP_READY = () => readiness() >= 1;
  // 同一张图里换场面（比如青竹小院床边换时辰）也要过一次载入插画：下一帧当成刚进图
  window.LOADING_KICK = () => { mapAt = null; shown = 1; };
  window.MAP_LOADING = () => { try { return readiness() < 1; } catch (e) { return false; } };
  // 作者 11-08：载入画面换成 Codex R157 十款插画（每次换图随机抽一张，整个载入过程用同一张）+ 黑金进度条
  const LB = { im: [], idx: -1, parts: {}, tip: '' };
  // 作者 11-08：换成作者勾选的 22 张（R157 作者已选合集：主选 8 + 人物特写 14）。[编号, 左上亮(1)=墨黑题名 / 暗(0)=米白金题名, 角色]
  const SEL = [["01",0,""],["03",0,""],["04A",1,""],["04B",1,""],["05",0,""],["06",0,""],["08",0,""],["09",0,""],["LC02",0,"luochen"],["LC03",0,"luochen"],["LC04",0,"luochen"],["YG01",0,""],["YG02",0,""],["YT01",0,"yunting"],["YT02",0,"yunting"],["YT03",0,"yunting"],["LX01",0,"linxue"],["LX02",0,"linxue"],["LX03",0,"linxue"],["SL01",0,"shenle"],["SL03",0,"shenle"],["E2",0,"luochen"]];
  const LCOL = SEL.map(s => s[1] ? '#25292A' : '#FFF2D5');
  // 作者 11-09：小提示每 7 秒自动换一条（加载久了也不会一直是同一句），点一下马上换下一条；玩法和剧情穿插着放
  const TIPS = ["【玩法】点地面行走，点人说话；地图边缘的光阵通往别处", "【玩法】野外的鬼火、兽火碰到就开打：绿弱、蓝同级、紫精英、红越级", "【玩法】行囊里的技能页，点一下已选中的招式就能看详情、参悟升重", "【玩法】卷册在天剑集市 · 典籍阁有售，参悟升重要用", "【玩法】打不过就先去别处历练，等级上去了再回来", "【玩法】按 M 或点左上角小地图，可以看整张地图", "【玩法】宝箱多藏在不起眼的角落", "【玩法】星旋偶尔会多嘴两句，听听也许有用", "【玩法】战斗里怒气攒满 100，就能施展必杀", "【玩法】青竹小院里的东西，点一点会有作者留下的彩蛋", "【玩法】菜单右上角的「存档」能手动存三个档；在地图上走动时也会自动存档", "【玩法】青竹小院的小池可以垂钓——点池水就行", "【玩法】商铺里能买也能卖，用不上的东西换成灵石", "【剧情】叶孤星生来便被断为「天煞孤星」，修炼多年仍困在练气，受尽同门冷眼", "【剧情】十八岁生辰之夜，一颗流星坠入后山——半块黑玉里，沉睡万古的星魂星旋就此醒来", "【剧情】残本《九曜剑典》重现人间，孤星自此问道九天", "【剧情】游戏改编自原著小说《孤星问道》，标题画面的「原著小说」里有更多故事"];
  let tipOrder = [], tipT = 0;
  const nextTip = () => { if (!tipOrder.length) { tipOrder = TIPS.map((t, i) => i).sort(() => Math.random() - .5); if (TIPS[tipOrder[0]] === LB.tip) tipOrder.push(tipOrder.shift()); } LB.tip = TIPS[tipOrder.shift()]; tipT = performance.now(); return LB.tip; };
  const lbLoad = i => { if (LB.im[i]) return; const im = new Image(); LB.im[i] = { im, ok: false }; im.onload = () => { LB.im[i].ok = true; }; im.src = 'r157/sel/' + SEL[i][0] + '.webp'; };
  for (const k of ['track', 'fill_left', 'fill_mid', 'fill_right', 'head']) { const im = new Image(); im.onload = () => { LB.parts[k] = im; }; im.src = 'r157/progress/' + k + '.webp'; }
  { const im = new Image(); im.onload = () => { LB.parts.tw = im; }; im.src = 'r157/anim/head_twinkle_8f.webp'; }
  // 人物特写：这个角色已经认识（入过队）才会抽到，免得剧透
  const metOk = k => { if (!k) return true; try { const F0 = S.flags || {}; return !!((F0.met || {})[k] || (S.party || []).includes(k)); } catch (e) { return false; } };
  try { if (typeof joinParty === 'function') joinParty = (o => function (k) { try { (S.flags.met = S.flags.met || {})[k] = 1; } catch (e) {} return o.apply(this, arguments); })(joinParty); } catch (e) {}
  const USEf = () => SEL.map((s, i) => metOk(s[2]) ? i : -1).filter(i => i >= 0), pickU = () => { const U = USEf(); return U[Math.floor(Math.random() * U.length)]; };
  // 作者 11-08：「换地图会黑很久才出现插画，黑屏绝对不允许」→ 一开游戏就把全部 22 张载入插画下下来（每张约 200KB，共约 4.6MB），并登记进 PRELOAD：插画没下完不放行进第一张图
  let lbNext = pickU();
  { const all = SEL.map((s, i) => i); all.sort((a, b) => (a === lbNext ? -1 : b === lbNext ? 1 : 0));
    const ps = all.map(i => { lbLoad(i); const o = LB.im[i]; return new Promise(r => { if (o.ok) return r(); o.im.addEventListener('load', r); o.im.addEventListener('error', r); }); });
    setTimeout(() => { try { window.PRELOAD && PRELOAD('载入插画', Promise.all(ps)); } catch (e) {} }, 0); }
  window.LOADING_ART_READY = () => LB.im.some(o => o && o.ok);
  const lbPick = () => { const ready = LB.im.map((o, i) => o && o.ok ? i : -1).filter(i => i >= 0 && i !== LB.idx); LB.idx = ready.length ? ready[Math.floor(Math.random() * ready.length)] : -1; nextTip();
    lbNext = pickU(); lbLoad(lbNext); };   // 每次换图后再预载一张，下次就有新图可抽
  function lbBar(p, now) { const P = LB.parts; if (!P.track) return false;
    ctx.drawImage(P.track, 160, 648, 960, 34);
    const w = 884 * Math.max(0, Math.min(1, p));
    if (w > 0 && P.fill_left && P.fill_mid && P.fill_right) {
      if (w >= 14) { ctx.drawImage(P.fill_left, 198, 661, 7, 8); for (let x = 205; x < 198 + w - 7; x += 12) { const cw = Math.min(12, 198 + w - 7 - x); ctx.drawImage(P.fill_mid, 0, 0, cw * 2, 16, x, 661, cw, 8); } ctx.drawImage(P.fill_right, 198 + w - 7, 661, 7, 8); }
      else { ctx.drawImage(P.fill_left, 198, 661, w / 2, 8); ctx.drawImage(P.fill_right, 198 + w / 2, 661, w / 2, 8); }
      const tw = P.tw; if (tw) { const f = Math.floor(now / 125) % 8; ctx.drawImage(tw, f * 96, 0, 96, 64, 198 + w - 24, 665 - 16, 48, 32); } else if (P.head) ctx.drawImage(P.head, 198 + w - 24, 649, 48, 32);
    }
    return true; }
  // 作者 11-08：「换图会黑一下再出现图片，这个绝对不准出现！」—— 过图不再先黑屏：旧地图上直接淡入这次要用的载入插画，换完图插画接着盖着，地图好了再淡出
  const COVER = { on: false, to: null, from: null, t0: 0, ms: 220, idx: -1, qz: null };
  const anyArt = () => { const rd = LB.im.map((o, i) => o && o.ok ? i : -1).filter(i => i >= 0); return rd.length ? rd[Math.floor(Math.random() * rd.length)] : -1; };
  function coverStart(to, ms) {
    let qz = null; try { qz = window.QZ_LOAD_ART ? QZ_LOAD_ART(to, world.mapName) : null; } catch (e) {} if (qz && !qz.ok) qz = null;
    const idx = anyArt(); if (!qz && idx < 0) return false;   // 一张插画都还没下好（刚开机）：照旧
    Object.assign(COVER, { on: true, to, from: world.mapName, t0: performance.now(), ms: ms || 220, idx, qz }); return true; }
  function coverPaint() { if (!COVER.on || world.mapName !== COVER.from) return false;   // 只在换图之前（还停在旧图）画；一换图就交给下面的载入画面
    const B = COVER.qz ? COVER.qz.im : COVER.idx >= 0 && LB.im[COVER.idx] ? LB.im[COVER.idx].im : null; if (!B) return false;
    const a = Math.min(1, (performance.now() - COVER.t0) / COVER.ms); ctx.save(); ctx.globalAlpha = a; ctx.drawImage(B, 0, 0, W, H);
    const gb = ctx.createLinearGradient(0, H - 150, 0, H); gb.addColorStop(0, 'rgba(4,6,10,0)'); gb.addColorStop(1, 'rgba(4,6,10,.72)'); ctx.fillStyle = gb; ctx.fillRect(0, H - 150, W, 150); ctx.restore(); return true; }
  const layer = { draw(force) {
    if (coverPaint()) return;
    if (world.mapName !== mapAt) { const pv = mapAt; mapAt = world.mapName; t0 = performance.now(); prog = 0;
      if (COVER.on) { LB.idx = COVER.idx; LB.qz = COVER.qz; nextTip(); lbNext = pickU(); lbLoad(lbNext); shown = 1; }   // 过图前已经盖上的那张插画接着用，不换图
      else { lbPick(); try { LB.qz = window.QZ_LOAD_ART ? QZ_LOAD_ART(mapAt, pv) : null; } catch (e) { LB.qz = null; } }
      if (LB.qz && !LB.qz.ok) LB.qz = null;   // 青竹专属插画还没下好：这一次就用 R157 插画，中途不再换图
      COVER.on = false; }
    let r = force != null ? Math.min(.97, force) : readiness();
    if (LB.qz && LB.qz.min && LB.qz.ok && performance.now() - t0 < LB.qz.min && forced !== world.mapName) r = Math.min(r, .99);   // 作者 11-08：从外面走进青竹，专属载入图至少露个脸
    // 兜底：只要这一帧地面画的还是绿色占位（不管哪条剧情路径进的图），就盖上载入画面
    if (window.__GPH && performance.now() - window.__GPH < 250 && forced !== world.mapName) r = Math.min(r, .6);
    if (r >= 1) { shown = Math.max(0, shown - .08); if (!shown) return; } else shown = 1;
    prog += (r - prog) * .15; if (r < 1) prog = Math.min(prog, .97);
    const a = shown;
    ctx.save(); ctx.globalAlpha = a;
    if (!(LB.idx >= 0 && LB.im[LB.idx] && LB.im[LB.idx].ok)) { const rd = LB.im.map((o, i) => o && o.ok ? i : -1).filter(i => i >= 0); if (rd.length) LB.idx = rd[Math.floor(Math.random() * rd.length)]; }   // 换图那一刻插画还没下好：下好一张就马上换上
    const QA = LB.qz && LB.qz.ok ? LB.qz : null;   // 作者 11-08：青竹一带用 R144 十二件小事插画，轮流放
    let B = QA ? QA.im : LB.idx >= 0 && LB.im[LB.idx] && LB.im[LB.idx].ok ? LB.im[LB.idx].im : null;
    if (!B && typeof IMG !== 'undefined' && IMG.title_art && IMG.title_art.width) B = IMG.title_art;   // 万一插画还没到：先铺标题封面，绝不露黑屏
    if (B) {   // R157 插画版
      if (QA) QA.use();
      const now = performance.now(), title0 = (world.map && world.map.def && world.map.def.title) || '', title = title0.replace(/^.*·\s*/, '') || title0, i = LB.idx;
      ctx.drawImage(B, 0, 0, W, H);
      const gb = ctx.createLinearGradient(0, H - 150, 0, H); gb.addColorStop(0, 'rgba(4,6,10,0)'); gb.addColorStop(1, 'rgba(4,6,10,.72)'); ctx.fillStyle = gb; ctx.fillRect(0, H - 150, W, 150);
      const four = false, col = QA ? '#FFF2D5' : LCOL[i], dark = col !== '#FFF2D5';
      const TI = TITLE_IM(world.mapName, dark ? 'dark' : 'light');
      if (TI) {   // 作者 11-08：地图名换成 Codex R163「云开长卷」书法题名（米白金 / 墨黑两版按插画亮暗选）
        const sc = Math.min(1.3, (four ? 185 : 520) / TI.width), dw = TI.width * sc, dh = TI.height * sc;
        ctx.drawImage(TI, four ? 30 : 44, four ? 26 : 44, dw, dh);
      } else {
      ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.font = `${four ? 42 : 50}px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`;
      ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = dark ? 'rgba(255,248,232,.55)' : 'rgba(10,8,6,.6)'; ctx.strokeText(title, four ? 42 : 72, four ? 43 : 70); ctx.fillStyle = col; ctx.fillText(title, four ? 42 : 72, four ? 43 : 70);
      }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `600 22px ${typeof FONT !== 'undefined' ? FONT : 'sans-serif'}`; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.7)'; if (now - tipT > 7000) nextTip(); ctx.strokeText(LB.tip, 640, 618); ctx.fillStyle = '#f3e4c2'; ctx.fillText(LB.tip, 640, 618); ctx.font = `14px ${typeof FONT !== 'undefined' ? FONT : 'sans-serif'}`; ctx.fillStyle = 'rgba(243,228,194,.55)'; ctx.textAlign = 'left'; ctx.fillText('点击屏幕换一条提示', 166, 700); ctx.textAlign = 'center';
      if (!lbBar(prog, now)) { ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(198, 661, 884, 8); ctx.fillStyle = '#e8c27a'; ctx.fillRect(198, 661, 884 * prog, 8); }
      ctx.textAlign = 'right'; ctx.font = `600 16px ${typeof FONT !== 'undefined' ? FONT : 'sans-serif'}`; ctx.fillStyle = 'rgba(243,228,194,.85)'; ctx.fillText(Math.round(prog * 100) + '%', 1114, 700);
      const waited = (now - t0) / 1000;
      if (force == null && r < 1 && waited > 12) { ctx.textAlign = 'center'; ctx.font = `600 15px ${typeof FONT !== 'undefined' ? FONT : 'sans-serif'}`; ctx.fillStyle = 'rgba(243,228,194,.8)'; ctx.fillText(waited > 40 ? '网络较慢，素材仍在下载。点击屏幕可先进入（可能缺图）' : '网络较慢，正在重试下载……', W / 2, 590); }
      if (r < 1 && typeof input !== "undefined" && input.tapped) { if (force == null && waited > 40) forced = world.mapName; else nextTip(); input.tapped = null; }
      ctx.restore(); return;
    }
    // 作者 11-08：老版载入画面（深蓝底 + 地图名 + 细进度条）全部取消。插画还没下好的那一小会儿只铺黑底 + R157 进度条，插画一到马上换上
    ctx.fillStyle = '#05060a'; ctx.fillRect(0, 0, W, H);
    { const now = performance.now(); if (!lbBar(prog, now)) { ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(198, 661, 884, 8); ctx.fillStyle = '#e8c27a'; ctx.fillRect(198, 661, 884 * prog, 8); } }
    if (r < 1 && typeof input !== 'undefined' && input.tapped) input.tapped = null;
    ctx.restore();
  } };
  S.overlay.push(layer);
  window.LOADING_LAYER = layer;
  // 黑幕（S.fade）画在所有图层最上面：载入插画还盖着的时候，黑幕上面再把插画画一遍——换图时看到的永远是插画，不是黑屏
  let lastForce; layer.draw = (o => function (force) { lastForce = force; return o.call(this, force); })(layer.draw);
  window.LOADING_ON_TOP = () => { try { if (coverPaint()) return; if (shown > 0) { const s0 = shown, p0 = prog; layer.draw(lastForce); shown = s0; prog = p0; } } catch (e) {} };
  // 过图（goMap）：原来是 fadeOut 变黑 → 换图 → fadeIn；改成 旧图上直接淡入插画 → 换图 → 插画一直盖着到新图准备好 → 淡出到新图
  let GO = 0, PEND = null, USED = 0;
  const late = () => { try {
    if (typeof goMap !== 'function' || goMap.__noBlack) return;
    const g = goMap; goMap = async function (name) { if (!GO) { PEND = name; USED = 0; } GO++;
      try { return await g.apply(this, arguments); } finally { GO--; if (!GO) { USED = 0; PEND = null; setTimeout(() => { if (COVER.on && world.mapName === COVER.from) COVER.on = false; }, 80); } } };
    goMap.__noBlack = 1;
    const fo = fadeOut; fadeOut = async function (ms) { if (GO && !USED && !(S.fade > .01) && PEND && PEND !== world.mapName && coverStart(PEND, Math.min(ms || 220, 260))) { USED = 1; await new Promise(r => setTimeout(r, COVER.ms)); return; } return fo.apply(this, arguments); };
    const fi = fadeIn; fadeIn = async function (ms) { if (GO && USED === 1) { USED = 2; S.fade = 0; return; } /* 只跳过过图自己的那一次 fadeIn；进图剧情里自己要的黑幕照旧 */ return fi.apply(this, arguments); };
  } catch (e) { console.warn('loading goMap', e); } };
  // 作者 11-08 体检：原来等 window load（手机上要等所有图下完，可能几十秒），这期间过图照旧黑屏 → 改成脚本都跑完（DOMContentLoaded）就装上
  if (document.readyState !== 'loading') setTimeout(late, 0); else document.addEventListener('DOMContentLoaded', () => setTimeout(late, 0));
  // 作者 11-08：「没有加载完毕不允许出现任何游戏东西，只能是我们的插画」——载入中：对话 / 选项 / 面板一律不推进、不响应点击（r158 也不会把它们画到黑幕上）
  const loadingNow = () => { try { return S.scene === drawMap && world.map && readiness() < 1 && forced !== world.mapName; } catch (e) { return false; } };
  window.MAP_BLOCKING = loadingNow;
  for (const fn of ['updateDialog', 'updateChoice', 'updatePanel']) {
    if (typeof window[fn] !== 'function' && typeof eval(fn) !== 'function') continue;
    const o = eval(fn); const w = function () { if (loadingNow() || (window.FXW_BLOCKING && FXW_BLOCKING())) { if (typeof input !== 'undefined') input.tapped = null; return; } return o.apply(this, arguments); };
    if (fn === 'updateDialog') updateDialog = w; else if (fn === 'updateChoice') updateChoice = w; else updatePanel = w;
  }
  // 载入画面期间：收起地图 HUD、不让角色乱走
  drawMapHud = (orig => function () { if (shown >= .99) return; return orig.apply(this, arguments); })(drawMapHud);
  updateMap = (orig => function (dt) { if (readiness() < 1) { if (world.player) world.player.moving = false; return; } return orig(dt); })(updateMap);
  // 预载相邻地图（出口 / 门通向的图），下一次换图就不用等
  function preloadNear(name) {
    const d = TMAPS[name]; if (!d) return;
    for (const e of (d.exits || []).concat(d.doors || [])) { const to = e && e.to; if (!to || !TMAPS[to]) continue; const B = TMAPS[to].baked; if (B && /^cx2g_/.test(B.ground || '') && !IMG[B.ground] && window.CX2_LAZY_LD) CX2_LAZY_LD(B.ground.slice(5)); }   // 按地面图的 id 预载（原来传的是地图名，玄天城南门外那张会去要一张不存在的 g_yy_forest）
  }
  tileSetMap = (orig => function (name) { const r = orig.apply(this, arguments); setTimeout(() => { try { preloadNear(name); } catch (e) {} }, 1200); return r; })(tileSetMap);
})();
