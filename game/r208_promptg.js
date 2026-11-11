// ================= R208 · 剧情提示框换成 Codex R204「G 星盘授印」（作者 11-11：那个绿色的框、领悟框都换掉）=================
// 星旋 / 玉佩 / 传音（原来的墨玉绿框）和所有「领悟……」框 → 灵雾横框 + 左侧星盘；1～4 行自动定高，多于 4 行分页。拆件尺寸、坐标按 R204 layout.json。
(function () {
  const N = ['mist_panel_9', 'astrolabe', 'continue_normal', 'continue_pressed'], IM = {}; let n = 0;
  for (const k of N) { const im = new Image(); im.onload = () => { IM[k] = im; n++; }; im.src = 'r204g/' + k + '.webp'; }
  const ok = () => n >= N.length;
  const C = { title: '#FBE0A9', body: '#F6E9D1', gold: '#F1CC87', red: '#F08F83', hint: '#C4B7A3', special: '#C7E4E1' };
  const DF = '"GuxingDF",' + BRUSH;
  const WANT = p => /星旋|玉佩|传音|黑玉|领悟|吞噬之力|封印/.test(String(p.title || '')) && !p.eqp;
  function nine(im, x, y, w, h, l, t, r, b) { const s = 2, sw = im.width, sh = im.height, SX = [0, l * s, sw - r * s, sw], SY = [0, t * s, sh - b * s, sh], DX = [x, x + l, x + w - r, x + w], DY = [y, y + t, y + h - b, y + h];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const a = SX[i + 1] - SX[i], bb = SY[j + 1] - SY[j], c = DX[i + 1] - DX[i], d = DY[j + 1] - DY[j]; if (a > 0 && bb > 0 && c > 0 && d > 0) ctx.drawImage(im, SX[i], SY[j], a, bb, DX[i], DY[j], c, d); } }
  function wrap(s, w) { const out = []; let line = ''; for (const ch of s) { if (ctx.measureText(line + ch).width > w && line) { out.push(line); line = ch; } else line += ch; } if (line) out.push(line); return out; }
  // 把面板的行拆成物理行（已按字体宽度折好）
  function rows(p) { if (p._g208) return p._g208; const R = [];
    for (const raw of (p.lines || []).filter(Boolean)) { const s0 = String(raw), hl = s0.startsWith('!'), s = hl ? s0.slice(1) : s0, hint = /^[（(].*[）)]$/.test(s);
      const size = hl ? 29 : hint ? 25 : 27, col = hl ? C.gold : hint ? (/星旋/.test(p.title) ? C.special : C.hint) : C.body;
      ctx.save(); ctx.font = `${size}px ${DF}`; for (const l of wrap(s, 420)) R.push({ t: l, size, col }); ctx.restore(); }
    return (p._g208 = R); }
  const pages = p => Math.max(1, Math.ceil(rows(p).length / 4));
  const prev = window.R169_DRAWPANEL;
  window.R169_DRAWPANEL = function (p, k) {
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
    ctx.font = `42px ${DF}`; ctx.fillStyle = C.title; ctx.fillText(String(p.title || ''), cx, y + 48 + 23);
    cur.forEach((r, i) => { ctx.font = `${r.size}px ${DF}`; ctx.fillStyle = r.col; ctx.fillText(r.t, cx, y + 108 + i * 38 + 17); });
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    if (p.t > .4) { const by = y + 108 + nl * 38; ctx.globalAlpha = k * (.75 + .25 * Math.sin(performance.now() / 300)); ctx.drawImage(IM.continue_normal, x + 372, by, 160, 40);
      if (pages(p) > 1) { ctx.globalAlpha = k * .8; ctx.font = `18px ${DF}`; ctx.fillStyle = C.hint; ctx.fillText((pg + 1) + ' / ' + pages(p), x + w - 90, by + 20); } }
    ctx.restore(); return true;
  };
  // 领悟技能（剧情、升级、技能页参悟）也用这个横框，左边换成技能图标
  const hook = () => { if (!window.SKWIN || SKWIN.__g208) return false; SKWIN.__g208 = 1; const old = SKWIN.learn;
    SKWIN.learn = function (o) { if (!ok()) return old.apply(this, arguments); o = o || {}; try { playSnd('sfx_sword_ring'); } catch (e) {} S.flash = .3; S.flashColor = '#cfe6ff';
      const k = o.k || (SKWIN.keyOf && SKWIN.keyOf(o.name)), lines = ['!' + (o.name || ''), o.desc || '', o.meta ? '（' + String(o.meta).replace(/^（|）$/g, '') + '）' : ''].filter(Boolean);
      return new Promise(res => { sysPanel = { title: (o.note ? o.note + ' · ' : '') + '领悟技能', lines, t: 0, ms: 0, res: () => res(true), _g208icon: k }; }); };
    return true; };
  if (!hook()) { const iv = setInterval(() => { if (hook()) clearInterval(iv); }, 300); }
  // 多于 4 行：点一下翻下一页，最后一页再点才关
  if (typeof updatePanel === 'function') updatePanel = (o => function (dt) {
    const p = sysPanel; if (p && WANT(p) && ok() && p.t + dt > .4 && input.tapped) { const pg = p._g208p || 0; if (pg + 1 < pages(p)) { consumeTap(); p._g208p = pg + 1; p.t = .2; try { playSnd('ui_click'); } catch (e) {} return; } }
    return o.apply(this, arguments);
  })(updatePanel);
})();
