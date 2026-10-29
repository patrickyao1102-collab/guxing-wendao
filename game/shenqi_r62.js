// ================= 神器页 · 九曜星盘 R62（Codex 分层素材 → Claude 代码合成旋转）=================
// 渲染顺序（按 Codex 接入说明）：底盘 → 外圈(顺 60s) → 中圈(逆 40s) → 内圈(顺 25s, screen) → 星尘(逆 80s, screen)
//   → 已点亮星线 → 星核(按收集数 0 / 少量 / 9) → 星核呼吸光 → 神器图标 → 槽位(封印 / 可解封 / 已收集) → 槽位呼吸 → 文字（由神器页画）
(function () {
  const SLOT_C = [[512, 162], [736.976, 243.884], [856.683, 451.223], [815.11, 686.995], [631.71, 840.893], [392.29, 840.893], [208.89, 686.995], [167.317, 451.223], [287.024, 243.884]];
  const COLORS = ['#FF6B73', '#70D7FF', '#38E1CD', '#FFD36A', '#E9F6FF', '#FF9D42', '#B487FF', '#78E58B', '#FF8ED1'];
  const LAYERS = [['01_base', 0, 0, 'source-over', 1], ['02_outer_ticks', 1, 60, 'source-over', .9], ['03_middle_runes', -1, 40, 'source-over', .85], ['04_inner_orbits', 1, 25, 'screen', .65], ['06_stardust', -1, 80, 'screen', .42]];
  const BLOB = {"connections_core_to_t01": "3beee747d1a6b0765874df364c55a9bc", "connections_core_to_t02": "6776d4fb7493a6d18510df912e441f21", "connections_core_to_t03": "c8bd3059efb239eddd0aad1da4d045b8", "connections_core_to_t04": "343b1c35fd9231ac8b987a8852319782", "connections_core_to_t05": "edf85e08dffc4199f288343312bae98a", "connections_core_to_t06": "bc7eb99d688bbd87b3230fe584542261", "connections_core_to_t07": "8765b75e468e33c84b22f87eb09b23c9", "connections_core_to_t08": "f398a101ac1a7112d9b81e21ee664b66", "connections_core_to_t09": "5241599c526e1043ec963fa6a384d3c4", "connections_t01_to_t02": "b087af870dee7a4f512b5001553d3b8e", "connections_t02_to_t03": "c2f3a84c991f58300cc4f904b519a35c", "connections_t03_to_t04": "dfe17e2dd2a1cc12c6d8f79522b9c557", "connections_t04_to_t05": "3f28af17fcf4af8bb4787eb855ec28de", "connections_t05_to_t06": "a1488127747e6e833fed917563ebe1a0", "connections_t06_to_t07": "2ff44a28cbb37f81c8ae60200a85c21d", "connections_t07_to_t08": "27b0d020e11d141c2cc5ec8c5d578363", "connections_t08_to_t09": "11f55fbc382e10e34d63168775d3c920", "connections_t09_to_t01": "49654493107764928320146c244b33fa", "core_core_0": "f3bac7a3c2bbce6801e648525683ee65", "core_core_9": "95a6559554687ffa2c3e937201bda7f1", "core_core_few": "289028871313aa40087538cc170ca613", "layers_01_base": "32c6dabfed6b09baea576caed8b4f1ae", "layers_02_outer_ticks": "f08c8f4ca26d6203655926e0f05483fd", "layers_03_middle_runes": "6b2ab14cb0fcc5f06bed28c6c438b199", "layers_04_inner_orbits": "6739e81830c9aea5f35ddadbfbd3bebf", "layers_05_core_glow": "292509343b49b052f9052144b1704bc7", "layers_06_stardust": "664020ec7ee1c77a25247c628ec14f99", "slots_t01_collected": "8aeaffedcaa647d45b409cd274d5c67b", "slots_t01_sealed": "01ef2d1c10c49c8e50c4663c0a051554", "slots_t01_unlockable": "f87960ec1aeda8190783819ba85672e7", "slots_t02_collected": "5391809ecff6aa723401604314729c04", "slots_t02_sealed": "179f0f522a475e2dfe0b94519bad3e09", "slots_t02_unlockable": "7dabdda5db32b3af6b3f5f097c6c1987", "slots_t03_collected": "3447cc3def220a00b48f52ba855bb2ad", "slots_t03_sealed": "26c0785c73066b4c225331ff71ac953b", "slots_t03_unlockable": "37538c428119afad0be230701ced7b06", "slots_t04_collected": "599b04d8a720d2698a9b6be92ba5809f", "slots_t04_sealed": "e4c3b512cf388f06941c206f17321cdd", "slots_t04_unlockable": "a9367555fcacee820d75f1f40fd99f00", "slots_t05_collected": "2ea99db778fafa8476b5f78e1be2dd43", "slots_t05_sealed": "d894d435a465c575505d0a7458a146c5", "slots_t05_unlockable": "c0fe6ef87c1d7d5e5aa5d355428342a4", "slots_t06_collected": "2dde5238a53c8ac2b8f4007e5f8d1a5d", "slots_t06_sealed": "e0e0f93eec87274ab4fd52b2f9494daf", "slots_t06_unlockable": "ef3f861d0cdb61bb61fa8792b8763813", "slots_t07_collected": "daabb758f48a881c7acc727a0befe27d", "slots_t07_sealed": "7b4531fec49248bbbb25fc9b2329732e", "slots_t07_unlockable": "934cfe87a2ca83293e203384d7ee0fff", "slots_t08_collected": "be6dd81d5e1d37c34d5e3e9398b685db", "slots_t08_sealed": "e173ecae7f488b90cea54100c733d529", "slots_t08_unlockable": "e43cf66f4ca29ecfbd9845be601ad9c9", "slots_t09_collected": "4f81af69ac3418ae56d7a605b338eaed", "slots_t09_sealed": "aefa397880a770bc9e1676990f5b9f39", "slots_t09_unlockable": "ba6e9836184aa29e60c9fd1422ce5c55"};   // 素材放在作品的素材库（发布包已近上限）
  Object.assign(BLOB, {"glow_t01": "5b6a377bb73bb8a454127b7cc60f1841", "glow_t02": "f581ec45c28f10c3799fa88932183211", "glow_t03": "3e7c60337425cbe479381973ce30cb2c", "glow_t04": "fa30d69b7060c99cd7821c2cab677d1a", "glow_t05": "ae70bcc8679e1a909a6d738838302712", "glow_t06": "4e98917ba2be2c398416860c160bb726", "glow_t07": "bd5256d5626e0114db2168cc1d14172d", "glow_t08": "ddd2860c4214b36f6d10ef4013842ee5", "glow_t09": "5673feaf28f850ceee588764c811c9b0", "slots_t01_sealed2": "6b5a2b035ea1f50a7b6a2b1eca000593", "slots_t02_sealed2": "8d850ddf24376ca732ab973ce23cf304", "slots_t03_sealed2": "390e7a08c7aabcc823eb57cb9c2cf057", "slots_t04_sealed2": "e95b9813d29ff0061dff9b0edf5eda12", "slots_t05_sealed2": "563be49b2425c35e70431d01bfc93d50", "slots_t06_sealed2": "03ae8252638177a813876bc016b2f084", "slots_t07_sealed2": "96b588d8266e2171f5dd1a34c4394544", "slots_t08_sealed2": "78dc85865af4b1772acc57e9917b99b4", "slots_t09_sealed2": "395ae7c10b830a5204457850de707312"});   // 典雅版：金色锁链封印 + 锁链发光层（Claude 重新着色）
  const BLOB63 = {"connections_core_to_t01": "694181963135ed499985963c79e05616", "connections_core_to_t02": "3971534c71902028acc70f8c047df953", "connections_core_to_t03": "9b9b08cf14d361fefd656ed240b13db8", "connections_core_to_t04": "6b0ab38819f6e3e184706c664dfca475", "connections_core_to_t05": "2d6ee5929601d0847b11ae69e8aa630d", "connections_core_to_t06": "4d35970b54f611d5e1148e4638e68c2e", "connections_core_to_t07": "52e41fc35ecd560f29f4b27281785509", "connections_core_to_t08": "8059143817703d25f1d675b9c9ebea56", "connections_core_to_t09": "53daec32cc2ea14cbb7e71d0b85b4938", "connections_t01_to_t02": "5cce6f6924fb0a0296b35a432a2dd99f", "connections_t02_to_t03": "a9f4d97068dc5cd7d2002e2213991bb7", "connections_t03_to_t04": "4ebc4ca57095a6b2856085870333a2c7", "connections_t04_to_t05": "361d17f2f41662cddab234e7a6036413", "connections_t05_to_t06": "d312bc40fd8ca76dba76b744871d0792", "connections_t06_to_t07": "c7ae75b834e3c735cb1efccff4735a7e", "connections_t07_to_t08": "ff5632ccb20adf254507a9183f871bad", "connections_t08_to_t09": "cd6ce0c48b0fd7fbf39053a44126d0ef", "connections_t09_to_t01": "38e5c36501cf2e1344d363c8024cd463", "core_core_0": "4281ab15c5ef5841234ba6db8246e3cb", "core_core_9": "1dbad8883f823489c3e039b441b1f320", "core_core_few": "c3527ed5dfe9f0b9af49636c9ddd927d", "layers_00_frame": "00a70c3c5e5388cc2a6273e979a07937", "layers_01_base": "7cd1c7d58f1660b1e47301939e567124", "layers_02_outer_ticks": "6d2577fcb7489b9beee359e7d4fef8b4", "layers_03_middle_runes": "3ceae83b049c742868c983e7850ff1ff", "layers_04_inner_orbits": "6930f333d1a66f1a3d6f350be0d90990", "layers_05_core_glow": "df4c9993d95210ae0d74c1ea8999c2bf", "layers_06_stardust": "ebb8268f0535edc5048f7d826cec5c65", "slots_t01_collected": "36b13cca9f2d54a741db2fee839b899e", "slots_t01_sealed": "636641035a1942d59d48d64e88d93c97", "slots_t01_unlockable": "31dfb3c7d8a085cf03410cfdd98a8f26", "slots_t02_collected": "8b2692fbebfa6d1616e6f39173ad2225", "slots_t02_sealed": "c3aaad540e59330d413b40df7f91b0c0", "slots_t02_unlockable": "f699cc6680a0040377a83fe6f917269b", "slots_t03_collected": "79e4efff6e3a5002f21592f83d9b64b6", "slots_t03_sealed": "08cfc08d63a3da62aa55744e080d10f7", "slots_t03_unlockable": "7d406caec5b9ec2841d2f6715383bd05", "slots_t04_collected": "0501ed4bba4e7f720300b65353c93d27", "slots_t04_sealed": "2e477a22255e9fa0321338456b3f0de8", "slots_t04_unlockable": "9604099379c1f366953248e1a71bd157", "slots_t05_collected": "f5c7d202ec41786118c05ca3270d735e", "slots_t05_sealed": "afa0bd9e18e0ced6349f3b1a561f9576", "slots_t05_unlockable": "907fe4442ff0ac325287c7cc018932d2", "slots_t06_collected": "088a0885cb39a574c57ea2b822715806", "slots_t06_sealed": "d25487f89291cd0dd409036dde78bf67", "slots_t06_unlockable": "230024e1f09398983403ebc019f9ad9d", "slots_t07_collected": "dee774171ed411fe01e2d69cd51edee2", "slots_t07_sealed": "e2a9369c5684f290ba4f3e213c0d25ab", "slots_t07_unlockable": "79e26e1b7a84162c549f56fb8ab0a1b3", "slots_t08_collected": "cbcb351e874c788952ca8e315b577f84", "slots_t08_sealed": "2f8834ec6fa9bd654fc4521e92a14621", "slots_t08_unlockable": "e4c873251fafe1391cbd64ada78e8146", "slots_t09_collected": "fcb4c82d41eff578ebd9c37ba3fc634a", "slots_t09_sealed": "e6f592b100f4bfef6305d51e2a606fab", "slots_t09_unlockable": "6a1e90a8d609aa22cf409207d3de7350"};
  const local = (window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:');
  // 两版素材：r62 典雅版 / r63 华贵版（多一层 00_frame 金框，中圈不透明）。神器页左上角可切换
  const VAR = { r62: { dir: 'ui3/r62/', blob: BLOB, IM: {}, need: [], name: '典雅版' }, r63: { dir: 'ui3/r63/', blob: BLOB63, IM: {}, need: [], name: '华贵版', frame: true } };
  // R63 白色仙侠五版（Codex 整盘概念图，未拆层）：整图直接铺，九槽按 12 点起每 40° 一格，半径按各图量出
  const WB = { w1: 'a770a1136a237a6b5f12ab4dea5bad3e', w2: '314a0bc59aab70abca7a84e59240ab15', w3: 'e88804a3ab34f54619f59358b2b405a9', w4: '18f6d1a117623c57e8aca2bc82011fc5', w5: 'ade7b41f236a23196eec655bbac30372' };
  const WN = { w1: '白玉清辉', w2: '霜月银盘', w3: '水墨白境', w4: '云上天仪', w5: '白金镇天' }, WR = { w1: 366, w2: 356, w3: 352, w4: 362, w5: 360 }, WK = .88;   // 整图缩到 .88，盘边不顶到面板
  for (const k in WB) VAR[k] = { full: k, blob: WB[k], IM: {}, need: [], name: WN[k], r: WR[k] * WK };
  const ORDER = ['r62', 'r63', 'w1', 'w2', 'w3', 'w4', 'w5'];
  const cur = () => VAR[(S.flags && S.flags.disc_var) || 'r62'] || VAR.r62;
  function loadVar(v) { if (v.started) return; v.started = 1;
    if (v.full) { const im = new Image(); im.onload = () => { v.IM.full = im; }; im.src = (!local && v.blob) ? '/_blob/' + v.blob : 'ui3/r63w/' + v.full + '.webp'; return; }
    const load = n => { v.need.push(n); const im = new Image(); im.onload = () => { v.IM[n] = im; }; im.src = (!local && v.blob[n]) ? '/_blob/' + v.blob[n] : v.dir + n + '.webp'; };
    for (const [n] of LAYERS) load('layers_' + n); if (v.frame) load('layers_00_frame');
    load('layers_05_core_glow'); for (const c of ['0', 'few', '9']) load('core_core_' + c);
    for (let i = 1; i <= 9; i++) { const t = 't0' + i; if (!v.frame) { load('slots_' + t + '_sealed2'); load('glow_' + t); } for (const st of ['sealed', 'unlockable', 'collected']) load('slots_' + t + '_' + st); load('connections_core_to_' + t); load('connections_' + t + '_to_t0' + (i % 9 + 1)); } }
  loadVar(VAR.r62); setTimeout(() => loadVar(VAR.r63), 4000);
  let IM = VAR.r62.IM;
  const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
  // 星位名牌：深色小牌 + 本色细边，已收集时字用本色、未收集用暖白
  function label(x, y, text, i, on) {
    const col = COLORS[i]; ctx.save(); ctx.font = `700 15px ${FONT}`; const w = ctx.measureText(text).width + 22, h = 22;
    ctx.fillStyle = 'rgba(14,10,34,.86)'; ctx.strokeStyle = hexA(col, on ? .95 : .7); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - w / 2, y - h / 2, w, h, 11) : ctx.rect(x - w / 2, y - h / 2, w, h); ctx.fill(); ctx.stroke();
    ctx.fillStyle = hexA(col, 1); ctx.beginPath(); ctx.arc(x - w / 2 + 8, y, 2.4, 0, 7); ctx.arc(x + w / 2 - 8, y, 2.4, 0, 7); ctx.fill();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = on ? col : '#fff1cf'; ctx.shadowColor = hexA(col, .8); ctx.shadowBlur = 8; ctx.fillText(text, x, y + 1); ctx.restore();
  }
  const T0 = performance.now();
  function draw(cx, cy, size, own, opts = {}) {
    const V = cur(); loadVar(V); IM = V.IM; const R63 = !!V.frame;
    const k = size / 1024, t = (performance.now() - T0) / 1000, n = own.filter(Boolean).length;
    ctx.save(); ctx.translate(cx - 512 * k, cy - 512 * k); ctx.scale(k, k);
    if (V.full) {   // 概念整图：盘面 + 槽内图标 + 封印/可解封标记 + 选中圈
      if (V.IM.full) { ctx.save(); ctx.shadowColor = 'rgba(40,30,10,.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; ctx.drawImage(V.IM.full, 512 - 512 * WK, 512 - 512 * WK, 1024 * WK, 1024 * WK); ctx.restore(); }
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI / 2 + i * Math.PI * 2 / 9, x = 512 + Math.cos(a) * V.r, y = 512 + Math.sin(a) * V.r, col = COLORS[i], rr = 46;
        if (own[i]) { if (opts.icon) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, rr - 4, 0, 7); ctx.clip(); opts.icon(i, x, y, rr - 4); ctx.restore(); }
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(x, y); ctx.rotate(t * .8 + i); const g = ctx.createConicGradient ? ctx.createConicGradient(0, 0, 0) : null;
          if (g) { g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(.08, 'rgba(255,236,190,.85)'); g.addColorStop(.16, 'rgba(255,220,150,0)'); g.addColorStop(1, 'rgba(255,220,150,0)'); ctx.strokeStyle = g; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, rr + 6, 0, 7); ctx.stroke(); } ctx.restore(); }
        else { const p = .5 + .5 * Math.sin(t * 2.2 + i * .9); ctx.save(); ctx.beginPath(); ctx.arc(x, y, rr - 2, 0, 7); ctx.clip();
          ctx.fillStyle = opts.unlockable ? hexA(col, .22 + .18 * p) : 'rgba(40,36,70,.42)'; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
          ctx.font = `700 ${opts.unlockable ? 26 : 30}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = opts.unlockable ? '#fff6dc' : hexA(col, .9); ctx.shadowColor = hexA(col, .9); ctx.shadowBlur = 12; ctx.fillText(opts.unlockable ? '解' : '封', x, y + 1); ctx.restore(); }
        if (opts.sel === i) { const p = .7 + .3 * Math.sin(t * 4); ctx.strokeStyle = `rgba(255,240,196,${p})`; ctx.lineWidth = 6; ctx.shadowColor = col; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(x, y, rr + 14, 0, 7); ctx.stroke(); ctx.shadowBlur = 0; }
      }
      ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; return;
    }
    const img = (nm, a = 1, op = 'source-over') => { const im = IM[nm]; if (!im) return; ctx.globalAlpha = a; ctx.globalCompositeOperation = op; ctx.drawImage(im, 0, 0, 1024, 1024); };
    // 华贵感（Claude）：盘外一圈暖金光晕 + 落地阴影，把星盘从宣纸上托起来
    { const g = ctx.createRadialGradient(512, 530, 440, 512, 530, 560); g.addColorStop(0, 'rgba(60,30,0,.38)'); g.addColorStop(1, 'rgba(60,30,0,0)'); ctx.fillStyle = g; ctx.fillRect(-60, -40, 1144, 1144);
      const h = ctx.createRadialGradient(512, 512, 455, 512, 512, 540), hp = .55 + .25 * Math.sin(t * 1.3); h.addColorStop(0, `rgba(255,214,120,${.45 * hp})`); h.addColorStop(1, 'rgba(255,200,90,0)'); ctx.fillStyle = h; ctx.fillRect(-40, -40, 1104, 1104); }
    for (const [nm, dir, per, op, a0] of LAYERS) { const a = R63 && nm === '03_middle_runes' ? 1 : a0; ctx.save(); if (dir) { ctx.translate(512, 512); ctx.rotate(dir * Math.PI * 2 * t / per); ctx.translate(-512, -512); } img('layers_' + nm, a, op); ctx.restore(); }
    // 星线
    for (let i = 0; i < 9; i++) { if (!own[i]) continue; img('connections_core_to_t0' + (i + 1), .95, 'screen'); if (own[(i + 1) % 9]) img('connections_t0' + (i + 1) + '_to_t0' + ((i + 1) % 9 + 1), .95, 'screen'); }
    // 星核 + 呼吸光
    img(n >= 9 ? 'core_core_9' : n ? 'core_core_few' : 'core_core_0', 1);
    const [lo, hi] = n >= 9 ? [.5, .8] : n ? [.22 + (n - 1) * .2 / 7, .44 + (n - 1) * .24 / 7] : [.04, .10];
    const br = .5 - .5 * Math.cos(Math.PI * 2 * t / (8 / 3)); img('layers_05_core_glow', lo + (hi - lo) * br, 'screen'); if (R63) img('layers_00_frame', 1);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    // 金边流光：两道亮光沿外圈金边缓缓扫过（6 秒一圈）
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [ph, a0] of [[0, 1], [Math.PI, .55]]) { const ang = t * Math.PI * 2 / 6 + ph;
      for (let k = 0; k < 14; k++) { const aa = ang - k * .035, x = 512 + Math.cos(aa) * 466, y = 512 + Math.sin(aa) * 466, r = 34 - k * 1.6, al = a0 * (1 - k / 14) * .55;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,248,220,${al})`); g.addColorStop(.4, `rgba(255,214,120,${al * .6})`); g.addColorStop(1, 'rgba(255,200,90,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); } }
    // 宝石星芒：外圈装饰上一颗颗闪烁的十字星芒
    for (let i = 0; i < 16; i++) { const aa = i / 16 * Math.PI * 2 + .2, rr = i % 2 ? 486 : 452, x = 512 + Math.cos(aa) * rr, y = 512 + Math.sin(aa) * rr, tw = Math.max(0, Math.sin(t * 1.7 + i * 2.3)) ** 6;
      if (tw < .02) continue; const L = 30 * tw + 6; ctx.globalAlpha = tw; ctx.fillStyle = '#fff6da';
      ctx.beginPath(); ctx.moveTo(x - L, y); ctx.lineTo(x, y - 2.2); ctx.lineTo(x + L, y); ctx.lineTo(x, y + 2.2); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, y - L); ctx.lineTo(x + 2.2, y); ctx.lineTo(x, y + L); ctx.lineTo(x - 2.2, y); ctx.closePath(); ctx.fill();
      const g = ctx.createRadialGradient(x, y, 0, x, y, 16); g.addColorStop(0, 'rgba(255,240,200,.9)'); g.addColorStop(1, 'rgba(255,210,120,0)'); ctx.fillStyle = g; ctx.fillRect(x - 16, y - 16, 32, 32); }
    // 金粉：盘面上缓缓上浮、闪烁的金色微尘
    for (let i = 0; i < 42; i++) { const sd = Math.sin(i * 91.7) * .5 + .5, sd2 = Math.sin(i * 37.3) * .5 + .5, u = (t * (.035 + sd * .03) + sd2) % 1;
      const aa = sd * Math.PI * 2 + t * .05, rr = 80 + sd2 * 360, x = 512 + Math.cos(aa) * rr, y = 512 + Math.sin(aa) * rr - u * 60, al = Math.sin(u * Math.PI) * (.5 + .5 * Math.sin(t * 3 + i));
      ctx.globalAlpha = al * .9; ctx.fillStyle = i % 4 ? '#ffd98a' : '#fff4d6'; ctx.beginPath(); ctx.arc(x, y, 1.6 + (i % 3), 0, 7); ctx.fill(); }
    ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    // 槽位（位置固定，不随环转）
    for (let i = 0; i < 9; i++) {
      const [x, y] = SLOT_C[i], st = own[i] ? 'collected' : (opts.unlockable ? 'unlockable' : 'sealed'), nm = 'slots_t0' + (i + 1) + '_' + st, im = (st === 'sealed' && IM[nm + '2']) || IM[nm];
      if (own[i] && opts.icon) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, 47 * 190 / 256, 0, 7); ctx.clip(); opts.icon(i, x, y, 47 * 190 / 256); ctx.restore(); }
      const locked = !own[i], col = COLORS[i];
      // 封印锁：底下一圈本色灵光呼吸（Claude）
      if (locked) { const p = .5 + .5 * Math.sin(t * 2.2 + i * .9); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 40, x, y, 112); g.addColorStop(0, hexA(col, .55 * (.55 + .45 * p))); g.addColorStop(.6, hexA(col, .18 * (.5 + .5 * p))); g.addColorStop(1, hexA(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - 115, y - 115, 230, 230); ctx.restore(); }
      if (im) { ctx.drawImage(im, x - 95, y - 95, 190, 190);
        const ph = t / (8 / 3) + i * .11, b = .5 - .5 * Math.cos(Math.PI * 2 * ph), [l, h] = st === 'unlockable' ? [.02, .15] : st === 'collected' ? [.015, .10] : [0, 0];
        if (h) { ctx.globalAlpha = l + (h - l) * b; ctx.globalCompositeOperation = 'screen'; ctx.drawImage(im, x - 95, y - 95, 190, 190); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; } }
      const gim = st === 'sealed' && IM['glow_t0' + (i + 1)];
      if (gim) { const p = .5 + .5 * Math.sin(t * 2.6 + i * 1.3); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .18 + .42 * p; ctx.drawImage(gim, x - 95, y - 95, 190, 190); ctx.restore(); }
      if (locked && im) { // 锁面流光 + 锁链上的星点闪烁
        ctx.save(); ctx.beginPath(); ctx.arc(x, y, 64, 0, 7); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
        const u = ((t + i * .37) % 3.4) / 3.4, bx = x - 120 + u * 240; const lg = ctx.createLinearGradient(bx - 30, y - 30, bx + 30, y + 30);
        lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(.5, 'rgba(255,246,220,.55)'); lg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = lg;
        ctx.beginPath(); ctx.moveTo(bx - 40, y - 90); ctx.lineTo(bx + 4, y - 90); ctx.lineTo(bx + 40, y + 90); ctx.lineTo(bx - 4, y + 90); ctx.closePath(); ctx.fill(); ctx.restore();
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let j = 0; j < 3; j++) { const ph = t * 1.3 + j * 2.1 + i * 1.7, tw = Math.max(0, Math.sin(ph)) ** 4; if (tw < .03) continue; const sd = Math.floor(ph / Math.PI / 2) * 7 + j * 3 + i, ang = (Math.sin(sd * 12.9) * .5 + .5) * 6.283, rr = 20 + (Math.sin(sd * 7.3) * .5 + .5) * 42, sx = x + Math.cos(ang) * rr, sy = y + Math.sin(ang) * rr, L = 6 + 16 * tw;
          ctx.globalAlpha = tw; ctx.fillStyle = '#fffbe8'; ctx.beginPath(); ctx.moveTo(sx - L, sy); ctx.lineTo(sx, sy - 1.8); ctx.lineTo(sx + L, sy); ctx.lineTo(sx, sy + 1.8); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(sx, sy - L); ctx.lineTo(sx + 1.8, sy); ctx.lineTo(sx, sy + L); ctx.lineTo(sx - 1.8, sy); ctx.closePath(); ctx.fill();
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 12); g.addColorStop(0, hexA(col, .9)); g.addColorStop(1, hexA(col, 0)); ctx.fillStyle = g; ctx.fillRect(sx - 12, sy - 12, 24, 24); }
        ctx.restore(); ctx.globalAlpha = 1; }
      if (own[i]) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(x, y); ctx.rotate(t * .8 + i); const g = ctx.createConicGradient ? ctx.createConicGradient(0, 0, 0) : null;
        if (g) { g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(.08, 'rgba(255,236,190,.85)'); g.addColorStop(.16, 'rgba(255,220,150,0)'); g.addColorStop(1, 'rgba(255,220,150,0)'); ctx.strokeStyle = g; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 86, 0, 7); ctx.stroke(); } ctx.restore(); }
      if (opts.sel === i) { const p = .7 + .3 * Math.sin(t * 4); ctx.strokeStyle = `rgba(255,240,196,${p})`; ctx.lineWidth = 6; ctx.shadowColor = COLORS[i]; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(x, y, 104, 0, 7); ctx.stroke(); ctx.shadowBlur = 0; }
    }
    ctx.restore();
  }
  let TBTN = null;
  function drawToggle(x, y) {
    const V = cur(), w = 168, h = 34; TBTN = { x, y, w, h };
    ctx.save(); ctx.fillStyle = 'rgba(20,12,40,.72)'; ctx.strokeStyle = 'rgba(255,214,120,.85)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, 17) : ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke();
    ctx.font = `600 15px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffe7b0'; ctx.fillText('星盘：' + V.name + '  ⇄', x + w / 2, y + h / 2 + 1); ctx.restore();
  }
  const hitToggle = t => { if (!TBTN || !t) return false; const b = TBTN; if (t.x < b.x || t.x > b.x + b.w || t.y < b.y || t.y > b.y + b.h) return false; S.flags.disc_var = ORDER[(ORDER.indexOf(S.flags.disc_var || 'r62') + 1) % ORDER.length]; loadVar(cur()); return true; };
  window.R62_DISC = { drawToggle, hitToggle, label, ready: () => { const V = cur(); loadVar(V); return V.full ? !!V.IM.full : !!(V.IM.layers_01_base && V.IM['slots_t01_sealed']); }, draw, SLOT_C, COLORS, scaleFor: R => R * 1024 / (cur().r || 350) };
})();
