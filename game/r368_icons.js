// ================= R368 · 补全 51 件新道具图标 + 头顶表情符号（Codex R366，作者 11-21：「新的道具你都找 Codex 做下图标」）（只进测试版）=================
// 图标：每件一张 96×96 透明 webp（r366i/<道具id>.webp），画法同 R290：深色圆底 + 品质外圈，图压在圆上；用到才下载。
// 表情：10 种（惊觉！/ 疑惑？/ 无语…… / 汗 / 生气 / 心动 / 哼歌 / 烦乱 / 灵光 / 难过），每种 4 帧（弹出→停住→微动→淡出前），r366e/<种类>.webp 横条 4×96。
//   用法：EMO.show(人, 'surprise', 毫秒)；人＝地图上的 actor 或 {x, y}，h＝头顶高度（默认 116）。剧情演出按《仙剑演出要点》配合动作用。
(function () {
  if (typeof itemIcon !== 'function') return;
  const IDS = new Set('a_ziyun c_foxtail cook_dan cook_danbing cook_doufu cook_guihua cook_guiyu cook_hetang cook_hongshu cook_jingua cook_jiyu cook_li cook_lianzi cook_lingguo cook_liyu cook_luobo cook_mijian cook_naicha cook_naigao cook_putao cook_shibing cook_sun cook_taogeng cook_wandou cook_xia cook_xiaoyugan cook_xigua cook_xingban cook_yinlin cook_zao cook_zhou f_carp f_scale f_star f_sword ing_0 ing_1 ing_10 ing_11 ing_2 ing_3 ing_4 ing_5 ing_6 ing_7 ing_8 ing_9 k_dx_box k_dx_cake k_xs p_tongxin '.trim().split(/\s+/));
  const IM = {}, QC = ['#9a8a70', '#5fbf73', '#5f9cf0', '#f0b43a'];
  const Q = id => /^(w_qingxiao|w_yunlei|a_ziyun|p_tongxin|a_xinghenyi)$/.test(id) ? 2 : /^(ing_|f_carp|f_scale|k_xs)/.test(id) ? 0 : 1;
  const get = id => { let o = IM[id]; if (!o) { o = IM[id] = { ok: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r366i/' + id + '.webp?v=1'; } return o.ok ? o.im : null; };
  itemIcon = (orig => function (id, x, y, r) {
    const im = IDS.has(id) && get(id); if (!im) return orig.apply(this, arguments);
    const q = Q(id); ctx.save();
    const g = ctx.createRadialGradient(x, y - r * .2, r * .1, x, y, r); g.addColorStop(0, 'rgba(70,52,34,.9)'); g.addColorStop(1, 'rgba(18,12,8,.92)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = QC[q]; ctx.stroke();
    if (q >= 2) { ctx.globalAlpha = .35; ctx.lineWidth = r * .22; ctx.beginPath(); ctx.arc(x, y, r + r * .08, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
    const s = r * 2.15; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, x - s / 2, y - s / 2, s, s); ctx.restore();
  })(itemIcon);
  // 进游戏一会儿后把这批图标先拉下来（51 张小图，几十 KB），免得第一次打开背包时还是「圆底一个字」
  setTimeout(() => { try { for (const id of IDS) get(id); } catch (e) {} }, 8000);

  // ---------- 头顶表情符号 ----------
  if (typeof tileDraw !== 'function') return;
  const KINDS = ['surprise', 'question', 'ellipsis', 'sweat', 'anger', 'heart', 'note', 'tangle', 'idea', 'tear'];
  const EI = {}; const sheet = k => { if (!EI[k]) { EI[k] = new Image(); EI[k].src = 'r366e/' + k + '.webp?v=1'; } return EI[k]; };
  const L = [];
  tileDraw = (o => function () { const r = o.apply(this, arguments);
    try { if (L.length) { const cam = world.cam || { x: 0, y: 0 }, now = performance.now(), z = typeof VZ === 'function' ? VZ() : 1;
      ctx.save(); if (z !== 1) ctx.scale(z, z); ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
      for (let i = L.length - 1; i >= 0; i--) { const e = L[i], t = now - e.t0; if (t > e.ms) { L.splice(i, 1); try { e.res(); } catch (x) {} continue; }
        const im = sheet(e.k); if (!im.complete || !im.naturalWidth) continue;
        const f = t < 120 ? 0 : t > e.ms - 150 ? 3 : (Math.floor((t - 120) / 260) % 2 ? 2 : 1);
        const s = 56, x = e.a.x + (e.dx || 22), y = e.a.y - (e.h || 116) - 10;
        ctx.drawImage(im, f * 96, 0, 96, 96, x - s / 2, y - s, s, s); }
      ctx.restore(); } } catch (x) {}
    return r; })(tileDraw);
  window.EMO = { KINDS, show(a, k, ms, o) { o = o || {}; sheet(k); return new Promise(res => { if (!a || KINDS.indexOf(k) < 0) return res(); for (const e of L) if (e.a === a) e.ms = 0; L.push({ a, k, t0: performance.now(), ms: ms || 1400, h: o.h, dx: o.dx, res }); }); } };
})();
