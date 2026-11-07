// ================= R146 · 松伯的传送玉符：地图点选式（作者 11-07 选定 Codex 第五轮「①素白玉」）=================
// 入口不变：青竹小院 / 管事房找松伯 →「传送到去过的地方」。
// 左栏五个地区，中间是该地区的手绘小地图，地图上的点是传送点：去过的亮玉菱形可传，没去过的上锁；
// 右栏是选中地点的小插画、介绍、解锁状态，点「传送」走。界面文字全由代码写（切图上不带字）。
// 切图到位前，所有部件都有代码画的素白玉替身，功能完整可用；R146 切图到了只换 ART。
(function () {
  if (typeof choose !== 'function' || typeof tileSetMap !== 'function') return;
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const F = () => S.flags || (S.flags = {});
  const visited = () => F().visited || (F().visited = {});

  // ---------------- 地区与地点（x,y 是在 1280×720 画面里的位置，地图插画到了按 Codex 的坐标表覆盖）----------------
  // tp:false = 只做地图上的地名，不能传送（剧情据点 / 首领处，和旧版传送列表的排除规则一致）
  const REGIONS = [
    { key: 'tianjian', name: '天剑宗', nodes: [
      { id: 'qingzhu_upper_pavilion', name: '云海大亭', x: 406, y: 236, d: ['青竹小院后的观云高亭。', '云海翻涌，群峰尽收眼底。'] },
      { id: 'tj_houshan', name: '天剑后山', x: 740, y: 232, d: ['后山崖顶，云深林密。', '寻常弟子少有人来。'] },
      { id: 'tj_hall', name: '天剑大殿', x: 587, y: 331, d: ['天剑宗主殿，群峰拱卫。', '宗门议事与授业之所。'] },
      { id: 'tj_scripture', name: '藏经阁', x: 771, y: 348, d: ['天剑宗典籍收藏之地。', '外院可借阅寻常功法。'] },
      { id: 'tj_front', name: '演武广场', x: 574, y: 441, d: ['弟子晨昏练剑之地。', '剑鸣终日不绝。'] },
      { id: 'tj_market', name: '天剑宗集市', x: 759, y: 500, d: ['仙市琳琅，丹符器物俱全。', '典籍阁也设在这里。'] },
      { id: 'qingzhu_court', name: '青竹小院', x: 405, y: 525, d: ['少爷自小长大的院子。', '松伯他们都在这里。'] },
      { id: 'tj_shanmen', name: '天剑山门', x: 570, y: 552, d: ['天剑宗正门与送别台。', '由此下山，便入红尘。'] },
    ] },
    { key: 'qingyang', name: '青阳镇', nodes: [
      { id: 'tj_xiashan', name: '松风林道', x: 470, y: 250, d: ['天剑山下的松林小道。', '上山下山的必经之路。'] },
      { id: 'qy_town', name: '青阳镇', x: 600, y: 400, d: ['山下最热闹的小镇。', '客栈、药铺、铁匠铺都在。'] },
      { id: 'lin_manor', name: '林府', x: 750, y: 300, d: ['青阳镇林家的宅邸。', '庭院曲水，花木扶疏。'] },
      { id: 'lin_forest', name: '山外树林', x: 450, y: 520, d: ['云霄山脉外的密林。', '林中常有妖兽出没。'] },
    ] },
    { key: 'heifeng', name: '黑风谷', nodes: [
      { id: 'hf_valley', name: '黑风谷口', x: 470, y: 470, d: ['黑风谷的入口，阴风阵阵。', '谷中深处盘踞着匪寨。'] },
      { id: 'hf_camp', name: '黑风寨', x: 720, y: 300, tp: false },
    ] },
    { key: 'xuantian', name: '玄天城', nodes: [
      { id: 'xt_city', name: '南城', x: 590, y: 480, d: ['玄天城南城大街。', '车马如流，繁华无双。'] },
      { id: 'xt_manor', name: '城主府', x: 590, y: 280, d: ['玄天城城主的府邸。', '门禁森严，气象恢宏。'] },
      { id: 'xt_auction', name: '玄元拍卖场', x: 420, y: 360, d: ['玄天城最大的拍卖场。', '奇珍异宝，价高者得。'] },
      { id: 'xt_wanbao', name: '万宝楼', x: 770, y: 380, d: ['城里的老字号宝楼。', '丹药法器一应俱全。'] },
    ] },
    { key: 'luoyun', name: '落云岭', nodes: [
      { id: 'ly_ridge', name: '松溪外岭', x: 450, y: 480, d: ['落云岭外岭，松溪潺潺。', '山势渐起，雾气渐浓。'] },
      { id: 'ly_midnorth', name: '中北乱林', x: 620, y: 330, d: ['落云岭腹地的乱林。', '林深路杂，容易迷路。'] },
      { id: 'ly_valley', name: '落云谷', x: 770, y: 230, tp: false },
    ] },
  ];
  const NODE = {}; REGIONS.forEach(R => R.nodes.forEach(n => { n.reg = R; NODE[n.id] = n; }));
  // 当前所在：松伯在青竹小院和管事房，管事房也算青竹小院
  const hereId = () => { const m = world.mapName; return m === 'qingzhu_steward_room' ? 'qingzhu_court' : m; };
  const canTp = n => n.tp !== false && !!TMAPS[n.id] && !!visited()[n.id];
  const regOpen = R => R.nodes.some(n => visited()[n.id]);

  // 落点：和旧版传送列表同一套（地图自带 start / arrive，否则取场景 spawn）
  const spawnOf = id => { const d = TMAPS[id]; if (!d) return null; if (d.start) return d.start; if (d.arrive) { const v = Object.values(d.arrive)[0]; if (v) return v; }
    const B = typeof CXB2 !== 'undefined' && CXB2[id]; if (B && typeof atIn === 'function') return atIn(id, ...(B.spawn || [B.w / 2, B.h * .7])); return null; };

  // ---------------- 切图（R146 到位后填；缺哪张就用代码替身画哪张）----------------
  const ART = window.TP146_ART = window.TP146_ART || {};
  const imgs = {}; const im = k => { const p = ART[k]; if (!p) return null; const c = imgs[k]; if (c) return c.complete && c.naturalWidth ? c : null; const i = new Image(); i.src = LOC ? p : (ART._blob && ART._blob[k]) || p; imgs[k] = i; return null; };
  const has = k => !!im(k);
  const frames = (k, n) => { for (let i = 0; i < n; i++) im(k + '_' + i); };

  // ---------------- 版面（Codex 效果图 01_素白玉 的位置）----------------
  const P = { x: 112, y: 66, w: 1056, h: 586 };
  const CLOSE = { x: 1108, y: 74, w: 48, h: 46 };
  const TAB = i => ({ x: 128, y: 188 + i * 59, w: 165, h: 46 });
  const MAP = { x: 318, y: 174, w: 544, h: 434 };
  const THUMB = { x: 888, y: 188, w: 265, h: 147 };
  const GO = { x: 892, y: 566, w: 255, h: 57 };
  const NODE_R = 30;   // 点击半径

  const TF = typeof BRUSH === 'string' ? BRUSH : '"Ma Shan Zheng",serif';
  const NF = '"LXGW WenKai","ZCOOL XiaoWei",' + (typeof FONT === 'string' ? FONT : 'serif');
  const C = { ink: '#2b2a25', soft: '#7d7a70', jade: '#5f9e8c', jadeD: '#2f6a5c', jadeL: '#d8eee6', line: 'rgba(120,128,118,.35)', red: '#b8402f', panel: '#f6f5f0', col: '#fbfaf6' };

  let TP = null;

  function panelBase() {
    if (has('frame')) { ctx.drawImage(im('frame'), P.x, P.y, P.w, P.h); return; }
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 6;
    ctx.fillStyle = C.panel; roundRect(P.x, P.y, P.w, P.h, 14); ctx.fill(); ctx.restore();
    ctx.save(); ctx.strokeStyle = 'rgba(150,160,150,.55)'; ctx.lineWidth = 2; roundRect(P.x + 1, P.y + 1, P.w - 2, P.h - 2, 13); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1; roundRect(P.x + 6, P.y + 6, P.w - 12, P.h - 12, 10); ctx.stroke();
    // 标题栏分隔
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(P.x + 14, P.y + 62); ctx.lineTo(P.x + P.w - 14, P.y + 62); ctx.stroke();
    // 三栏底板
    ctx.fillStyle = C.col; roundRect(P.x + 12, P.y + 70, 184, P.h - 82, 8); ctx.fill(); roundRect(P.x + 760, P.y + 70, P.w - 772, P.h - 82, 8); ctx.fill();
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; roundRect(P.x + 12, P.y + 70, 184, P.h - 82, 8); ctx.stroke(); roundRect(P.x + 760, P.y + 70, P.w - 772, P.h - 82, 8); ctx.stroke();
    ctx.restore();
  }
  function headings(R) {
    ctx.save(); ctx.textBaseline = 'middle';
    if (!has('frame')) { ctx.textAlign = 'left'; ctx.font = `46px ${TF}`; ctx.fillStyle = '#223c34'; try { ctx.letterSpacing = '4px'; } catch (e) {} ctx.fillText('传送玉符', P.x + 28, P.y + 32); try { ctx.letterSpacing = '0px'; } catch (e) {} }
    ctx.textAlign = 'left'; ctx.font = `600 21px ${NF}`; ctx.fillStyle = C.ink;
    ctx.fillText('地区', 134, 156); ctx.fillText('地点详情', 892, 154);
    ctx.font = `600 25px ${NF}`; ctx.fillText(R.name, 323, 154);
    ctx.font = `15px ${NF}`; ctx.fillStyle = C.soft; ctx.fillText('点击地图上的传送点', 440, 156);
    // 左下：当前所在
    ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(130, 560); ctx.lineTo(290, 560); ctx.stroke();
    ctx.font = `15px ${NF}`; ctx.fillStyle = C.soft; ctx.fillText('当前所在', 136, 580);
    const hn = NODE[hereId()]; ctx.font = `600 22px ${NF}`; ctx.fillStyle = C.ink; ctx.fillText(hn ? hn.name : (TMAPS[world.mapName] && TMAPS[world.mapName].title) || '', 136, 608);
    ctx.restore();
  }
  function closeBtn() {
    const k = TP.press === 'close' ? 'close_p' : 'close';
    if (has(k)) { ctx.drawImage(im(k), CLOSE.x, CLOSE.y, CLOSE.w, CLOSE.h); return; }
    ctx.save(); ctx.strokeStyle = TP.press === 'close' ? C.jadeD : '#3b3a34'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    const cx = CLOSE.x + CLOSE.w / 2, cy = CLOSE.y + CLOSE.h / 2, s = 11; ctx.beginPath(); ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy + s); ctx.moveTo(cx + s, cy - s); ctx.lineTo(cx - s, cy + s); ctx.stroke(); ctx.restore();
  }
  function lockGlyph(x, y, s, col) {
    ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = s * .16;
    ctx.beginPath(); ctx.arc(x, y - s * .2, s * .28, Math.PI, 0); ctx.stroke(); roundRect(x - s * .4, y - s * .2, s * .8, s * .62, s * .12); ctx.fill(); ctx.restore();
  }
  function tabs() {
    REGIONS.forEach((R, i) => { const r = TAB(i), open = regOpen(R), on = TP.reg === i, k = !open ? 'tab_lock' : on ? 'tab_on' : 'tab_off';
      if (has(k)) ctx.drawImage(im(k), r.x, r.y, r.w, r.h);
      else { ctx.save(); ctx.fillStyle = on ? C.jadeL : open ? '#efeee8' : '#e6e5df'; roundRect(r.x, r.y, r.w, r.h, 6); ctx.fill();
        ctx.strokeStyle = on ? C.jade : 'rgba(140,140,130,.45)'; ctx.lineWidth = on ? 2 : 1; roundRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1, 6); ctx.stroke(); ctx.restore(); }
      ctx.save(); ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.font = `${on ? 600 : 500} 23px ${NF}`; try { ctx.letterSpacing = '2px'; } catch (e) {}
      ctx.fillStyle = !open ? '#77756d' : on ? '#1f4d42' : C.ink;
      if (!open) { if (!has('tab_lock')) lockGlyph(r.x + 34, r.y + r.h / 2, 20, '#77756d'); ctx.fillText(R.name, r.x + r.w / 2 + 12, r.y + r.h / 2 + 1); }
      else ctx.fillText(R.name, r.x + r.w / 2, r.y + r.h / 2 + 1);
      ctx.restore(); });
  }
  function mapArt(R) {
    const k = 'map_' + R.key;
    if (has(k)) { ctx.drawImage(im(k), MAP.x, MAP.y, MAP.w, MAP.h); return; }
    // 替身：淡墨山势 + 连路
    ctx.save(); ctx.beginPath(); roundRect(MAP.x, MAP.y, MAP.w, MAP.h, 10); ctx.clip();
    const g = ctx.createLinearGradient(0, MAP.y, 0, MAP.y + MAP.h); g.addColorStop(0, '#f3f5ef'); g.addColorStop(1, '#e8eee4'); ctx.fillStyle = g; ctx.fillRect(MAP.x, MAP.y, MAP.w, MAP.h);
    ctx.strokeStyle = 'rgba(120,140,125,.25)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 7; i++) { const y = MAP.y + 40 + i * 58, ox = (i * 97) % 200; ctx.beginPath(); for (let x = 0; x <= MAP.w; x += 24) { const yy = y + Math.sin((x + ox) / 46) * 10; x ? ctx.lineTo(MAP.x + x, yy) : ctx.moveTo(MAP.x, yy); } ctx.stroke(); }
    const ns = R.nodes; ctx.strokeStyle = 'rgba(200,190,165,.9)'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    for (let i = 1; i < ns.length; i++) { ctx.beginPath(); ctx.moveTo(ns[i - 1].x, ns[i - 1].y); ctx.quadraticCurveTo((ns[i - 1].x + ns[i].x) / 2 + 30, (ns[i - 1].y + ns[i].y) / 2, ns[i].x, ns[i].y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 3;
    for (let i = 1; i < ns.length; i++) { ctx.beginPath(); ctx.moveTo(ns[i - 1].x, ns[i - 1].y); ctx.quadraticCurveTo((ns[i - 1].x + ns[i].x) / 2 + 30, (ns[i - 1].y + ns[i].y) / 2, ns[i].x, ns[i].y); ctx.stroke(); }
    ctx.restore();
  }
  function diamond(x, y, s, fill, stroke) { ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * .78, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s * .78, y); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  function plate(n, x, y, lit, on) {
    ctx.save(); ctx.font = `600 17px ${NF}`; const tw = ctx.measureText(n.name).width, w = tw + (lit ? 26 : 46), h = 28, px = x - w / 2, py = y + 20;
    const k = on ? 'plate_on' : lit ? 'plate' : 'plate_lock';
    if (has(k)) ctx.drawImage(im(k), px, py, w, h);
    else { ctx.fillStyle = on ? '#2f5f55' : lit ? 'rgba(252,250,242,.96)' : 'rgba(236,234,226,.95)'; roundRect(px, py, w, h, 5); ctx.fill(); ctx.strokeStyle = on ? '#5fb39d' : 'rgba(150,140,115,.7)'; ctx.lineWidth = 1.2; roundRect(px + .5, py + .5, w - 1, h - 1, 5); ctx.stroke(); }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = on ? '#f2fbf7' : lit ? C.ink : '#6c6a62';
    if (!lit) { lockGlyph(px + 15, py + h / 2, 15, '#6c6a62'); ctx.fillText(n.name, x + 10, py + h / 2 + 1); } else ctx.fillText(n.name, x, py + h / 2 + 1);
    ctx.restore();
  }
  function nodes(R, t) {
    const here = hereId();
    // 先画选中光环（压在地名牌下）
    const sel = TP.sel && NODE[TP.sel];
    if (sel && sel.reg === R) { const nf = ART.ring_n || 0;
      if (nf && has('ring_' + (Math.floor(t * 12) % nf))) { const i0 = im('ring_' + (Math.floor(t * 12) % nf)), s = 112; ctx.drawImage(i0, sel.x - s / 2, sel.y - s / 2, s, s); }
      else { ctx.save(); ctx.strokeStyle = `rgba(95,180,155,${.55 + .25 * Math.sin(t * 4)})`; ctx.shadowColor = 'rgba(110,210,180,.9)'; ctx.shadowBlur = 16; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(sel.x, sel.y, 44, 30, 0, 0, 7); ctx.stroke(); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(sel.x, sel.y, 54, 37, 0, 0, 7); ctx.stroke(); ctx.restore(); } }
    R.nodes.forEach(n => { const lit = canTp(n), on = TP.sel === n.id, isHere = n.id === here;
      if (n.tp !== false) {
        if (lit) { const nf = ART.gem_n || 0;
          if (nf && has('gem_' + (Math.floor(t * 8) % nf))) { const g0 = im('gem_' + (Math.floor(t * 8) % nf)); ctx.drawImage(g0, n.x - 16, n.y - 16, 32, 32); }
          else { ctx.save(); ctx.shadowColor = 'rgba(90,210,175,.9)'; ctx.shadowBlur = 8 + 5 * Math.sin(t * 3 + n.x); diamond(n.x, n.y, 12, '#7fd8c0', '#2f7a68'); ctx.restore(); diamond(n.x, n.y - 3, 4, 'rgba(255,255,255,.85)', 'rgba(0,0,0,0)'); } }
        else if (has('lock')) ctx.drawImage(im('lock'), n.x - 13, n.y - 13, 26, 26); else lockGlyph(n.x, n.y, 22, '#6c6a62');
      }
      plate(n, n.x, n.y, lit || n.tp === false, on);
      if (isHere) { // 你在这里：朱砂定位针 + 小牌
        const px = n.x + 18, py = n.y - 8;
        if (has('pin')) ctx.drawImage(im('pin'), px - 12, py - 34, 24, 34);
        else { ctx.save(); ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(px, py - 22, 9, Math.PI, 0); ctx.lineTo(px, py); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px, py - 22, 3.5, 0, 7); ctx.fill(); ctx.restore(); }
        ctx.save(); ctx.font = `600 14px ${NF}`; const w = ctx.measureText('你在这里').width + 16; ctx.fillStyle = '#fff6f2'; roundRect(px - w / 2, py - 62, w, 22, 5); ctx.fill(); ctx.strokeStyle = C.red; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.fillStyle = C.red; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('你在这里', px, py - 51); ctx.restore();
      } });
  }
  function legend() {
    ctx.save(); ctx.textBaseline = 'middle'; ctx.font = `15px ${NF}`; ctx.fillStyle = C.ink; const y = 626;
    diamond(430, y, 7, '#7fd8c0', '#2f7a68'); ctx.fillStyle = C.ink; ctx.fillText('可传送', 444, y);
    ctx.fillStyle = C.line; ctx.fillRect(516, y - 8, 1, 16); lockGlyph(549, y, 15, '#55534c'); ctx.fillStyle = C.ink; ctx.fillText('未解锁', 562, y);
    ctx.fillStyle = C.line; ctx.fillRect(634, y - 8, 1, 16); ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(667, y - 3, 5.5, Math.PI, 0); ctx.lineTo(667, y + 7); ctx.closePath(); ctx.fill(); ctx.fillStyle = C.ink; ctx.fillText('你在这里', 680, y);
    ctx.restore();
  }
  function detail() {
    const n = TP.sel && NODE[TP.sel]; ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (!n) { ctx.font = `17px ${NF}`; ctx.fillStyle = C.soft; ctx.fillText('点击地图上的地点', 1020, 300); ctx.fillText('查看详情', 1020, 326); ctx.restore(); drawGo(false); return; }
    const k = 'thumb_' + n.id;
    if (has(k)) { ctx.save(); roundRect(THUMB.x, THUMB.y, THUMB.w, THUMB.h, 6); ctx.clip(); ctx.drawImage(im(k), THUMB.x, THUMB.y, THUMB.w, THUMB.h); ctx.restore(); }
    else { const g = ctx.createLinearGradient(0, THUMB.y, 0, THUMB.y + THUMB.h); g.addColorStop(0, '#dfeaf0'); g.addColorStop(1, '#cfdfd6'); ctx.fillStyle = g; roundRect(THUMB.x, THUMB.y, THUMB.w, THUMB.h, 6); ctx.fill();
      ctx.font = `38px ${TF}`; ctx.fillStyle = 'rgba(60,90,80,.35)'; ctx.fillText(n.name, THUMB.x + THUMB.w / 2, THUMB.y + THUMB.h / 2); }
    ctx.strokeStyle = 'rgba(140,150,140,.6)'; ctx.lineWidth = 1.5; roundRect(THUMB.x, THUMB.y, THUMB.w, THUMB.h, 6); ctx.stroke();
    ctx.font = `600 30px ${NF}`; try { ctx.letterSpacing = '3px'; } catch (e) {} ctx.fillStyle = C.ink; ctx.fillText(n.name, 1020, 363); try { ctx.letterSpacing = '0px'; } catch (e) {}
    ctx.font = `17px ${NF}`; ctx.fillStyle = '#3e3c35'; const d = n.d || ['', '']; ctx.fillText(d[0] || '', 1020, 404); ctx.fillText(d[1] || '', 1020, 431);
    const lit = canTp(n), here = n.id === hereId(), label = here ? '你在这里' : lit ? '已解锁' : n.tp === false ? '无法传送' : '未解锁';
    const tk = lit && !here ? 'tag_on' : 'tag_off';
    ctx.font = `600 16px ${NF}`; const tw = ctx.measureText(label).width + 30, tx = 1020 - tw / 2, ty = 458;
    if (has(tk)) ctx.drawImage(im(tk), tx, ty, tw, 28); else { ctx.fillStyle = lit && !here ? C.jadeL : '#ecebe5'; roundRect(tx, ty, tw, 28, 5); ctx.fill(); ctx.strokeStyle = lit && !here ? C.jade : 'rgba(140,140,130,.5)'; ctx.lineWidth = 1.2; ctx.stroke(); }
    ctx.fillStyle = here ? C.red : lit ? C.jadeD : '#6c6a62'; ctx.fillText(label, 1020, ty + 15);
    ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(892, 515); ctx.lineTo(1148, 515); ctx.stroke();
    ctx.textAlign = 'left'; ctx.font = `16px ${NF}`; ctx.fillStyle = C.ink; ctx.fillText('消耗：无', 898, 539);
    ctx.restore(); drawGo(lit && !here);
  }
  function drawGo(can) {
    const k = !can ? 'go_off' : TP.press === 'go' ? 'go_p' : 'go';
    if (has(k)) { ctx.drawImage(im(k), GO.x, GO.y, GO.w, GO.h); if (ART.go_has_text) return; }
    else { ctx.save(); const g = ctx.createLinearGradient(0, GO.y, 0, GO.y + GO.h); if (can) { g.addColorStop(0, TP.press === 'go' ? '#9bd3c1' : '#bfe9da'); g.addColorStop(1, TP.press === 'go' ? '#6fb39e' : '#8ccab5'); } else { g.addColorStop(0, '#e8e8e3'); g.addColorStop(1, '#d6d6d0'); }
      ctx.fillStyle = g; roundRect(GO.x, GO.y, GO.w, GO.h, 8); ctx.fill(); ctx.strokeStyle = can ? '#4f927f' : 'rgba(140,140,130,.6)'; ctx.lineWidth = 1.5; roundRect(GO.x + .5, GO.y + .5, GO.w - 1, GO.h - 1, 8); ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `600 32px ${NF}`; try { ctx.letterSpacing = '8px'; } catch (e) {} ctx.fillStyle = can ? '#1f4d42' : '#8a8880'; ctx.fillText('传送', GO.x + GO.w / 2 + 4, GO.y + GO.h / 2 + 2); ctx.restore();
  }
  function drawTP() {
    if (!TP) return; const t = Date.now() / 1000, R = REGIONS[TP.reg];
    ctx.save(); ctx.fillStyle = 'rgba(12,16,20,.45)'; ctx.fillRect(0, 0, W, H);
    panelBase(); headings(R); closeBtn(); tabs(); mapArt(R); nodes(R, t); legend(); detail();
    if (TP.msg && t < TP.msgT) { ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `600 18px ${NF}`; const w = ctx.measureText(TP.msg).width + 40; ctx.fillStyle = 'rgba(40,44,40,.82)'; roundRect(590 - w / 2, 120, w, 34, 8); ctx.fill(); ctx.fillStyle = '#f5f2e8'; ctx.fillText(TP.msg, 590, 138); }
    ctx.restore();
  }
  if (S.overlay) S.overlay.push({ draw() { try { drawTP(); } catch (e) {} } });

  // 输入：面板打开时独占点击（捕获阶段，不让点击漏到地图上走路）
  try {
    cv.addEventListener('pointerdown', e => { if (!TP) return; const q = toLogical(e); TP.down = q; TP.press = inR(q, GO) ? 'go' : inR(q, CLOSE) ? 'close' : null; e.stopImmediatePropagation(); e.preventDefault(); }, true);
    window.addEventListener('pointerup', e => { if (!TP || !TP.down) return; TP.tap = TP.down; TP.down = null; TP.press = null; }, true);
  } catch (e) {}
  const say2 = (m) => { TP.msg = m; TP.msgT = Date.now() / 1000 + 2.2; };

  function pick(t) {
    const R = REGIONS[TP.reg];
    for (const n of R.nodes) { if (Math.hypot(t.x - n.x, t.y - n.y) < NODE_R || inR(t, { x: n.x - 50, y: n.y + 18, w: 100, h: 32 })) return n; }
    return null;
  }
  async function tpMap() {
    // 默认打开：当前所在的地区
    const hn = NODE[hereId()]; let reg = hn ? REGIONS.indexOf(hn.reg) : 0; if (reg < 0) reg = 0;
    TP = { reg, sel: hn ? hn.id : null, tap: null, down: null, press: null, msg: '', msgT: 0 };
    world.locked = true; const hud0 = S.hud; S.hud = false; let go = null;
    try { playSnd('ui_open'); } catch (e) {}
    for (;;) {
      await nextFrame(); const t = TP.tap; if (!t) continue; TP.tap = null;
      if (inR(t, CLOSE) || (t.x < P.x || t.x > P.x + P.w || t.y < P.y || t.y > P.y + P.h)) break;
      const ti = REGIONS.findIndex((R, i) => inR(t, TAB(i)));
      if (ti >= 0) { if (!regOpen(REGIONS[ti])) { say2('还没去过' + REGIONS[ti].name + '，松伯记不住那边的路'); continue; }
        if (ti !== TP.reg) { TP.reg = ti; const R = REGIONS[ti]; TP.sel = (R.nodes.find(n => n.id === hereId()) || R.nodes.find(canTp) || {}).id || null; try { playSnd('ui_click'); } catch (e) {} } continue; }
      if (inR(t, GO)) { const n = TP.sel && NODE[TP.sel]; if (!n) continue;
        if (n.id === hereId()) { say2('您就在这里'); continue; } if (!canTp(n)) { say2(n.tp === false ? '那里没法直接传送' : '还没去过这里'); continue; }
        go = n; break; }
      if (inR(t, MAP)) { const n = pick(t); if (n) { if (TP.sel === n.id && canTp(n) && n.id !== hereId()) { go = n; break; } TP.sel = n.id; try { playSnd('ui_click'); } catch (e) {} } }
    }
    TP = null; S.hud = hud0;
    if (!go) { world.locked = false; return; }
    const sp = spawnOf(go.id); if (!sp) { world.locked = false; toast('那里暂时去不了'); return; }
    await flashOut();
    tileSetMap(go.id, sp[0], sp[1], 'down'); S.scene = drawMap; S.hud = true;
    await fadeIn(400); world.locked = false; toast('已传送到：' + go.name, 1600);
  }
  // 传送光效：R146 序列帧到位就在人物身上播，否则用白光闪
  async function flashOut() {
    try { playSnd('sfx_star', .6); } catch (e) {}
    const nf = ART.flash_n || 0, p = world.player;
    if (nf && p && has('flash_0')) { frames('flash', nf); let i = 0; const o = { draw() { const k = 'flash_' + Math.min(nf - 1, i); if (!has(k) || !world.player) return; const g = im(k), c = world.cam || { x: 0, y: 0 }, s = ART.flash_scale || 1;
        const sx = (world.player.x - (c.x || 0)) * (world.zoom || 1), sy = (world.player.y - (c.y || 0)) * (world.zoom || 1);
        ctx.drawImage(g, sx - g.width * s / 2, sy - g.height * s * (ART.flash_ay || .85), g.width * s, g.height * s); } };
      S.overlay.push(o); for (; i < nf; i++) { await nextFrame(); await nextFrame(); await nextFrame(); } const j = S.overlay.indexOf(o); if (j >= 0) S.overlay.splice(j, 1); await fadeOut(300); return; }
    S.flash = .5; S.flashColor = '#e6f6ef'; await fadeOut(400);
  }
  window.TP146 = tpMap;
  setTimeout(() => { try { im('map_tianjian'); } catch (e) {} }, 1500);

  // 松伯对话里的「传送到去过的地方」→ 新界面（拦在最外层；r139 的列表版不再弹出）
  choose = (o => function (title, opts) {
    // Codex R146 地图插画到位前（或 TP146_FORCE 测试开关没开）照旧用 r139 的列表版，免得给朋友们看到空白替身
    try { if ((window.TP146_FORCE || has('map_tianjian')) && (title === '管家' || title === '松伯') && Array.isArray(opts) && opts[0] === '传送到去过的地方') {
      const o2 = opts.slice(); o2[0] = '传送到去过的地方​';   // 让里层（r139 列表版）认不出，照常弹选项
      return o.call(this, '松伯', o2).then(i => i === 0 ? tpMap().then(() => opts.length - 1) : i); } } catch (e) {}
    return o.apply(this, arguments);
  })(choose);
})();
