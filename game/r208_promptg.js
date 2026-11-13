// ================= R208 · 剧情提示框换成 Codex R204「G 星盘授印」（作者 11-11：那个绿色的框换掉）=================
// 星旋 / 玉佩 / 传音（原来的墨玉绿框）→ 灵雾横框 + 左侧星盘；1～4 行自动定高，多于 4 行分页。拆件尺寸、坐标按 R204 layout.json。
// 作者 11-13：「新的蓝色的框只是九曜剑典提示而已，没有太多的情况需要使用」——领悟技能不用这个蓝框，用回之前认可的黑金领悟窗（r160_popups.js）。
//   所以这里不再接管 SKWIN.learn，标题里带「领悟」的面板也不归这个框管；蓝框只留给玉佩 / 星旋 / 九曜剑典这一类提示。
(function () {
  const N = ['mist_panel_9', 'astrolabe', 'continue_normal', 'continue_pressed'], IM = {}; let n = 0;
  { const ps = N.map(k => new Promise(res => { const im = new Image(); im.onload = () => { IM[k] = im; n++; res(); }; im.onerror = () => res(); im.src = 'r204g/' + k + '.webp'; }));
    /* 作者 11-12 真机：手机上这四张图没载完时会退回旧的墨玉绿框 → 进游戏前就载好；万一还没到，也只退到宣纸卷轴，绝不再出绿框 */
    try { window.PRELOAD && PRELOAD('剧情提示框', Promise.all(ps)); } catch (e) {} }
  const ok = () => n >= N.length;
  const C = { title: '#FBE0A9', body: '#F6E9D1', gold: '#F1CC87', red: '#F08F83', hint: '#C4B7A3', special: '#C7E4E1' };
  window.R208_NOJADE = true;   /* 墨玉绿框整体停用 */
  const DF = '"GuxingDF",' + BRUSH;
  /* 作者 11-12：这个提示框的字也换成 Codex 那套（行囊里用的）：标题马善政，正文霞鹜文楷 */
  const TF = '"R201MS","GuxingWKB",' + BRUSH, BF = '"GuxingKai","R201WK",' + FONT, BW = 400;   /* 作者 11-12 真机：常规体在手机上太细 → 换成霞鹜文楷 Medium（比粗体细、比常规体实） */   /* 作者 11-12：之前的字太粗 → 正文用霞鹜文楷常规字重 */
  const WANT = p => /星旋|玉佩|传音|黑玉|吞噬之力|封印/.test(String(p.title || '')) && !/领悟/.test(String(p.title || '')) && !p.eqp;
  function nine(im, x, y, w, h, l, t, r, b) { const s = 2, sw = im.width, sh = im.height, SX = [0, l * s, sw - r * s, sw], SY = [0, t * s, sh - b * s, sh], DX = [x, x + l, x + w - r, x + w], DY = [y, y + t, y + h - b, y + h];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const a = SX[i + 1] - SX[i], bb = SY[j + 1] - SY[j], c = DX[i + 1] - DX[i], d = DY[j + 1] - DY[j]; if (a > 0 && bb > 0 && c > 0 && d > 0) ctx.drawImage(im, SX[i], SY[j], a, bb, DX[i], DY[j], c, d); } }
  function wrap(s, w) { const out = []; let line = ''; for (const ch of s) { if (ctx.measureText(line + ch).width > w && line && !/[%％，。、；：！？）」』》0-9]/.test(ch)) { out.push(line); line = ch; } else line += ch; }   /* 行首不放标点、百分号，数字不拆开 */ if (line) out.push(line); return out; }
  // 把面板的行拆成物理行（已按字体宽度折好）
  function rows(p) { if (p._g208) return p._g208; const R = [];
    for (const raw of (p.lines || []).filter(Boolean)) { const s0 = String(raw), hl = s0.startsWith('!'), s = hl ? s0.slice(1) : s0, hint = /^[（(].*[）)]$/.test(s);
      const size = hl ? 28 : hint ? 21 : 25, col = hl ? C.gold : hint ? (/星旋/.test(p.title) ? C.special : C.hint) : C.body;
      ctx.save(); ctx.font = `${BW} ${size}px ${BF}`; for (const l of wrap(s, 420)) R.push({ t: l, size, col }); ctx.restore(); }
    return (p._g208 = R); }
  const pages = p => Math.max(1, Math.ceil(rows(p).length / 4));
  const prev = window.R169_DRAWPANEL;
  window.R169_DRAWPANEL = function (p, k) {
    if (p && WANT(p) && !ok()) p._nojade = true;
    if (!p || !WANT(p) || !ok()) return prev ? prev.apply(this, arguments) : false;
    const R = rows(p), pg = p._g208p || 0, cur = R.slice(pg * 4, pg * 4 + 4), nl = Math.max(1, cur.length), h = 186 + 38 * nl, w = 720, x = (W - w) / 2, y = (H - h) / 2;
    ctx.save(); ctx.fillStyle = `rgba(0,0,0,${.38 * k})`; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = k; ctx.translate(W / 2, H / 2); const z = .94 + .06 * k; ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
    nine(IM.mist_panel_9, x, y, w, h, 90, 90, 90, 85);
    const bob = Math.sin(performance.now() / 900) * 2;
    if (p._g208icon && window.SKILL_ICON) { const ix = x + 112, iy = y + h / 2 + bob, r = 52; ctx.save(); const g = ctx.createRadialGradient(ix, iy - r * .3, r * .1, ix, iy, r); g.addColorStop(0, '#2c4a8a'); g.addColorStop(1, '#0b1634'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ix, iy, r, 0, 7); ctx.fill();
      try { SKILL_ICON(p._g208icon, ix, iy, r * .8, { glow: false }); } catch (e) {} ctx.lineWidth = 3; ctx.strokeStyle = '#d9b46a'; ctx.beginPath(); ctx.arc(ix, iy, r, 0, 7); ctx.stroke(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(241,204,135,.5)'; ctx.beginPath(); ctx.arc(ix, iy, r + 6, 0, 7); ctx.stroke(); ctx.restore(); }
    else ctx.drawImage(IM.astrolabe, x + 40, y + (h - 192) / 2 + bob, 144, 192);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = '#04090E'; ctx.shadowBlur = 2; ctx.shadowOffsetY = 1;
    const cx = x + 220 + 210;
    ctx.font = `44px ${TF}`; ctx.fillStyle = C.title; ctx.fillText(String(p.title || ''), cx, y + 48 + 21);
    /* 作者 11-12：要有层次 —— 标题（毛笔大字）→ 细金线分隔 → 每行「名目：」小号淡色 + 内容正常字号亮色 */
    { const tw = Math.min(300, ctx.measureText(String(p.title || '')).width + 60), ly = y + 48 + 50; ctx.save(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; const g = ctx.createLinearGradient(cx - tw / 2, 0, cx + tw / 2, 0); g.addColorStop(0, 'rgba(241,204,135,0)'); g.addColorStop(.5, 'rgba(241,204,135,.75)'); g.addColorStop(1, 'rgba(241,204,135,0)'); ctx.fillStyle = g; ctx.fillRect(cx - tw / 2, ly, tw, 1.2); ctx.translate(cx, ly + .6); ctx.rotate(Math.PI / 4); ctx.fillStyle = '#F1CC87'; ctx.fillRect(-3, -3, 6, 6); ctx.restore(); }
    cur.forEach((r, i) => { const yy = y + 112 + i * 38 + 17, m = /^(.{1,8}?[：:])\s*(.+)$/.exec(r.t);
      if (m) { const ls = Math.round(r.size * .8); ctx.font = `${ls}px ${BF}`; const lw = ctx.measureText(m[1]).width; ctx.font = `${BW} ${r.size}px ${BF}`; const vw = ctx.measureText(m[2]).width, x0 = cx - (lw + 6 + vw) / 2;
        ctx.textAlign = 'left'; ctx.font = `${ls}px ${BF}`; ctx.fillStyle = C.hint; ctx.fillText(m[1], x0, yy + 1); ctx.font = `${BW} ${r.size}px ${BF}`; ctx.fillStyle = r.col === C.hint ? C.body : r.col; ctx.fillText(m[2], x0 + lw + 6, yy); ctx.textAlign = 'center'; }
      else { ctx.font = `${BW} ${r.size}px ${BF}`; ctx.fillStyle = r.col; ctx.fillText(r.t, cx, yy); } });
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    if (p.t > .4) { const by = y + 108 + nl * 38; ctx.globalAlpha = k * (.75 + .25 * Math.sin(performance.now() / 300)); ctx.drawImage(IM.continue_normal, x + 372, by, 160, 40);
      if (pages(p) > 1) { ctx.globalAlpha = k * .8; ctx.font = `18px ${BF}`; ctx.fillStyle = C.hint; ctx.fillText((pg + 1) + ' / ' + pages(p), x + w - 90, by + 20); } }
    ctx.restore(); return true;
  };
  // 多于 4 行：点一下翻下一页，最后一页再点才关
  if (typeof updatePanel === 'function') updatePanel = (o => function (dt) {
    const p = sysPanel; if (p && WANT(p) && ok() && p.t + dt > .4 && input.tapped) { const pg = p._g208p || 0; if (pg + 1 < pages(p)) { consumeTap(); p._g208p = pg + 1; p.t = .2; try { playSnd('ui_click'); } catch (e) {} return; } }
    return o.apply(this, arguments);
  })(updatePanel);
})();
