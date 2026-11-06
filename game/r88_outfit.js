// R88 叶孤星换装：菜单「换装」页切换服装，战斗建模三姿势 + 状态页立绘一起换，记在本机
(function () {
  const LOC = !!(window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:');
  const src = (f, b) => LOC ? 'r88/' + f + '.webp' : '/_blob/' + b;
  const OUTFITS = [
    { id: 'baipao', name: '白袍正蓝', desc: '白袍配正蓝衣缘飘带（默认）',
      img: { b_yegx: src('b_yegx_baipao', 'aa08190ef1f8cecc1e006c85154ab9aa'), b_yegx_atk: src('b_yegx_baipao_atk', '0f4a3d35971dd952a41657262c302c65'), b_yegx_cast: src('b_yegx_baipao_cast', 'd9ebe54f3561a36ecb178040718ec6dc') },
      portrait: src('p_yegx_baipao', '306a503cff30fd19e874cb9b6375c6e4') },
    { id: 'orig', name: '原版劲装', desc: '最初的白蓝劲装', img: null, portrait: null },
    // R88 另外四套（Codex 交付：战斗三姿势 + 全身立绘 + 对话表情；地图行走用 R92 五套换装八向里对应那套）
    { id: 'heiyao', name: '白衣黑腰封', desc: '白衣配黑色腰封、蓝色衣缘',
      img: { b_yegx: src('b_yegx_heiyao', 'f61e1deb2fa68f2aeb06014fec5c5106'), b_yegx_atk: src('b_yegx_heiyao_atk', 'a4e277939dd68442131ba95c9f10cf5a'), b_yegx_cast: src('b_yegx_heiyao_cast', '43febb4657e3755376d7fbab1d51efa0') },
      portrait: src('p_yegx_heiyao', '6efbb8b9074282e7b84b3ef0821c627b') },
    { id: 'jiaoling', name: '蓝白交领', desc: '蓝白交领长衫、深蓝长裤',
      img: { b_yegx: src('b_yegx_jiaoling', '6db5b2cb70f850c2f91c14d40c4c3280'), b_yegx_atk: src('b_yegx_jiaoling_atk', 'db8988891fb200cea099de28958f12c1'), b_yegx_cast: src('b_yegx_jiaoling_cast', '4c45a7560e0fea9178d73bb3cb2e89a1') },
      portrait: src('p_yegx_jiaoling', '82b06a546d22c73fc9d2446993d1ea1f') },
    { id: 'guxing', name: '孤星白衣', get desc() { return window.R134_OUTFIT_OK && !R134_OUTFIT_OK() ? '🔒 取得流云仙衣后解锁 · 一身素白、金线滚边' : '流云仙衣幻化的白衣 · 一身素白、金线滚边'; },
      img: { b_yegx: src('b_yegx_guxing', '76e277edac07023fa6832dd1e87b86ed'), b_yegx_atk: src('b_yegx_guxing_atk', 'e241d4eb932275ad80beefbc6252cc87'), b_yegx_cast: src('b_yegx_guxing_cast', '4b08acea606e63d9325fa4eac4df695c') },
      portrait: src('p_yegx_guxing', '3e25319522296fca6e33d536203e7ac9') },
    { id: 'tianjian', name: '天剑少主', desc: '米金长袍、黑金腰带',
      img: { b_yegx: src('b_yegx_tianjian', '087576d969665841077a9cae28796bfe'), b_yegx_atk: src('b_yegx_tianjian_atk', '9927aa23dad2d2422934b33c93df012c'), b_yegx_cast: src('b_yegx_tianjian_cast', '0099a42a998ab9684ca6c0fe4edfdd5e') },
      portrait: src('p_yegx_tianjian', 'f24e60bcbcec66d8b505bd030a27bd6a') },
  ];
  const ORIG = {}, LOADED = {};
  const load = (k, s) => new Promise(r => { if (LOADED[s]) return r(LOADED[s]); const im = new Image(); im.onload = () => { LOADED[s] = im; r(im); }; im.onerror = () => r(null); im.src = s; });
  let cur = 'baipao'; try { cur = localStorage.getItem('yegx_outfit') || 'baipao'; } catch (e) {}
  if (!OUTFITS.some(o => o.id === cur)) cur = 'baipao';
  let want = {};          // 当前服装要求的 IMG
  async function apply(id, quiet) {
    const o = OUTFITS.find(x => x.id === id); if (!o) return; cur = id; try { localStorage.setItem('yegx_outfit', id); } catch (e) {}
    if (window.S && S.hero) S.hero.outfit = id;
    want = {};
    if (o.img) { for (const k in o.img) { const im = await load(k, o.img[k]); if (im) want[k] = im; } }
    if (o.portrait) { const im = await load('p', o.portrait); if (im) want.__portrait = im; }
    enforce(); if (!quiet && window.toast) toast('已换装：' + o.name, 1300);
  }
  function enforce() {
    if (typeof IMG === 'undefined') return;
    for (const k of ['b_yegx', 'b_yegx_atk', 'b_yegx_cast']) {
      if (IMG[k] && !ORIG[k] && !Object.values(LOADED).includes(IMG[k])) ORIG[k] = IMG[k];
      const t = want[k] || ORIG[k]; if (t && IMG[k] !== t) IMG[k] = t;
    }
  }
  setInterval(enforce, 800);   // 原版图异步加载完会覆盖，这里拉回来
  apply(cur, true); for (const o of OUTFITS) if (o.portrait) load('p', o.portrait);
  window.YEGX_OUTFIT = { list: OUTFITS, get: () => cur, set: id => apply(id) };

  // ---- 行囊加「换装」页（仿坐骑页）----
  if (typeof MTABS === 'undefined') return;
  MTABS.push('换装');
  menuLayout = (orig => function () { const L = orig(); if (MTABS.length > 9) L.tabs = MTABS.map((t, i) => ({ x: MB.x + 26, y: MB.y + 104 + i * 55, w: 132, h: 48 })); return L; })(menuLayout);
  const isTab = () => S.menu && MTABS[S.menu.tab] === '换装';
  const thumb = {}; for (const o of OUTFITS) if (o.img) load('t', o.img.b_yegx).then(im => { thumb[o.id] = im; });
  const WT = {};
  function walkThumb(id) { if (WT[id]) return WT[id]; const W5 = window.WALK5; if (!W5) return null; const m = W5.pic(id); if (!m.ok) return null;
    const c = document.createElement('canvas'); c.width = 224; c.height = 240; c.getContext('2d').drawImage(m, 8 * 224, 0, 224, 240, 0, 0, 224, 240);
    const g = c.getContext('2d').getImageData(0, 0, 224, 240).data; let y0 = 0; for (let y = 0; y < 240 && !y0; y++) for (let x = 0; x < 224; x++) if (g[(y * 224 + x) * 4 + 3] > 40) { y0 = y; break; }
    const t = document.createElement('canvas'); t.width = 140; t.height = 236 - y0; t.getContext('2d').drawImage(c, 42, y0, 140, 236 - y0, 0, 0, 140, 236 - y0); return (WT[id] = t); }
  function lay(B) { const gw = 104, gh = 150, gx = B.x + 14, gy = B.y + 56;
    const cells = OUTFITS.map((o, i) => ({ o, x: gx + (i % 3) * (gw + 8), y: gy + Math.floor(i / 3) * (gh + 10), w: gw, h: gh }));
    const D = { x: gx + 3 * (gw + 8) + 8, y: B.y + 12, w: B.x + B.w - (gx + 3 * (gw + 8) + 8) - 12, h: B.h - 24 };
    return { cells, D, btn: { x: D.x + D.w - 250, y: D.y + D.h - 74, w: 220, h: 58 } }; }
  function drawOutfits(B) { const m0 = S.menu; if (!m0.of || !OUTFITS.some(o => o.id === m0.of)) m0.of = cur;
    const { cells, D, btn } = lay(B), sel = OUTFITS.find(o => o.id === m0.of), t = performance.now() / 1000;
    ctx.save(); ctx.textBaseline = 'middle';
    ctx.font = `30px ${BRUSH}`; ctx.textAlign = 'left'; ctx.fillStyle = UI.title || UI.gold2; ctx.fillText('换 装', B.x + 18, B.y + 28);
    ctx.font = `600 16px ${FONT}`; ctx.fillStyle = UI.sub; ctx.fillText('叶孤星 · ' + OUTFITS.length + ' 套', B.x + 104, B.y + 30);
    for (const c of cells) { const on = m0.of === c.o.id, im = c.o.img ? thumb[c.o.id] : (c.o.walkOnly ? walkThumb(c.o.id) : ORIG.b_yegx);
      roundRect(c.x, c.y, c.w, c.h, 12); ctx.fillStyle = on ? 'rgba(142,42,28,.32)' : UI.slot; ctx.fill(); ctx.lineWidth = on ? 2.5 : 1; ctx.strokeStyle = on ? UI.gold2 : UI.line; ctx.stroke();
      if (im) { ctx.save(); roundRect(c.x + 2, c.y + 2, c.w - 4, c.h - 4, 10); ctx.clip(); const k = Math.min((c.h - 30) / im.height, (c.w - 8) / im.width), w = im.width * k, h = im.height * k; ctx.drawImage(im, c.x + c.w / 2 - w / 2, c.y + c.h - 28 - h, w, h); ctx.restore(); }
      ctx.font = `600 14px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = UI.text; ctx.fillText(c.o.name, c.x + c.w / 2, c.y + c.h - 13);
      if (cur === c.o.id) { ctx.font = `600 12px ${FONT}`; roundRect(c.x + 6, c.y + 6, 50, 20, 10); ctx.fillStyle = 'rgba(142,42,28,.9)'; ctx.fill(); ctx.fillStyle = '#fff2cc'; ctx.fillText('穿着中', c.x + 31, c.y + 16); } }
    lacquer(D.x, D.y, D.w, D.h, { r: 14, thin: true, top: UI.cTop, bot: UI.cBot });
    const big = sel.portrait ? LOADED[sel.portrait] : sel.walkOnly ? walkThumb(sel.id) : (IMG.p_yegx || ORIG.b_yegx);
    if (big) { const maxH = D.h - 40, k = Math.min(maxH / big.height, (D.w * .55) / big.width), w = big.width * k, h = big.height * k, bob = Math.sin(t * 1.8) * 3;
      ctx.drawImage(big, D.x + D.w - 30 - w, D.y + 20 + maxH - h + bob, w, h); }
    let y = D.y + 60; ctx.textAlign = 'left';
    ctx.font = `40px ${BRUSH}`; ctx.fillStyle = UI.title || UI.gold2; ctx.fillText(sel.name, D.x + 30, y); y += 46;
    ctx.font = `600 17px ${FONT}`; ctx.fillStyle = UI.text; ctx.fillText(sel.desc, D.x + 30, y); y += 30;
    ctx.font = `600 15px ${FONT}`; ctx.fillStyle = UI.id === 'paper' ? '#7a4a1c' : UI.gold; ctx.fillText(sel.walkOnly ? '地图上的行走造型更换（战斗建模、立绘暂用原版）' : '战斗建模、立绘、地图行走一起更换', D.x + 30, y);
    const bb = { x: D.x + 30, y: D.y + D.h - 84, w: 220, h: 58 }; sealText(cur === sel.id ? '穿着中' : '换上', bb.x, bb.y, bb.w, bb.h, cur !== sel.id);
    ctx.restore(); }
  drawQuest = (orig => function (B) { if (isTab()) return drawOutfits(B); return orig.apply(this, arguments); })(drawQuest);
  menuUpdate = (orig => function () {
    const t = input.tapped; if (!isTab() || !t || t.key) return orig.apply(this, arguments);
    const L = menuLayout(); if (inR(t, L.close) || L.tabs.some(r => inR(t, r)) || L.members.some(r => inR(t, r)) || (L.skin && inR(t, L.skin))) return orig.apply(this, arguments);
    const { cells, D } = lay(L.body), m0 = S.menu;
    for (const c of cells) if (inR(t, c)) { consumeTap(); m0.of = c.o.id; playSnd('ui_click'); return; }
    const bb = { x: D.x + 30, y: D.y + D.h - 84, w: 220, h: 58 };
    if (inR(t, bb) && m0.of !== cur && m0.of === 'guxing' && window.R134_OUTFIT_OK && !R134_OUTFIT_OK()) { consumeTap(); playSnd('ui_cancel'); toast('取得九曜神器「流云仙衣」后解锁这套白衣', 2200); return; }   // 作者 11-07
    if (inR(t, bb) && m0.of !== cur) { consumeTap(); playSnd('ui_confirm'); apply(m0.of); return; }
    return orig.apply(this, arguments);
  })(menuUpdate);
  // 状态页右侧立绘跟随服装
  if (typeof drawStatus === 'function') drawStatus = (orig => function (B, mi) { const w = want.__portrait; if (!w || !mi || mi.ally || !mi.p) return orig.apply(this, arguments); const keep = IMG[mi.p]; IMG[mi.p] = w; try { return orig.apply(this, arguments); } finally { IMG[mi.p] = keep; } })(drawStatus);
})();
