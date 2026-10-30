// ================= 坐骑系统 =================
// 行囊新增「坐骑」页：收藏一览、选择乘用、起飞 / 落地。真正的飞行骑乘由 mount.js（御风白虎 / 星海灵鲲 八向扇翅帧）负责，这里只做页面和入口。
// 立绘：Codex 坐骑01 仙鹤（单帧审阅稿）+ 神兽坐骑十款选型 R1；有骑乘帧的两只直接用游戏里的骑乘帧（左向悬停）。
(function () {
  if (typeof MTABS === 'undefined') return;
  const LOC = !!(window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:');
  const BLOB = {"m00_crane":"83129ec8b76fda487f4a29b2f25cc3e5","m01":"b9b213ff71c311bd17043268f1f6f42c","m02":"7e096264ac795f49bb671358219b57be","m03":"9639fea1fd182079e520caa5ea569d6a","m04":"ef6d198f0c9b5108231473d610991d90","m05":"77f81c61ebb2fd05019664fc25064cd4","m06":"cb48a9463b2182f59937ed8bf5464be1","m07":"fea42bcbe210f078ae44a58ecabcd1fc","m08":"92aff70acb5dc5491e39f85b749bc435","m09":"3157be791a7691579b63d7ebe631706b","m10":"5fffd0146d641739c4a977e08f1d5f95"};
  // face：素材里坐骑头朝哪边（left/right/down），向另一边走时镜像
  const MOUNTS = [
    { id: 'xianhe', f: 'm00_crane', name: '九霄仙鹤', sub: '丹顶灵焰 · 羽缘星光', face: 'down', desc: '天剑宗后山云海里养的灵鹤，羽缘带着蓝白灵光。性子温顺，最认叶孤星。', how: '' },
    { id: 'qilin', f: 'm01', name: '踏雷麒麟', sub: '玉青鳞甲 · 金色雷纹', face: 'left', desc: '踏雷而行的瑞兽，鳞甲如玉，四足生云，所过之处雷光隐隐。', how: '' },
    { id: 'baihu', f: 'm02', name: '御风白虎', sub: '银白巨翼 · 蓝焰踏风', face: 'left', desc: '生有双翼的白虎，踏着蓝焰御风而行，威压百兽。', how: '' },
    { id: 'zhuque', f: 'm03', name: '赤金朱雀', sub: '赤羽金焰 · 三翎长尾', face: 'left', desc: '南方神鸟，赤羽燃金焰，长尾三翎拖出漫天火光。', how: '' },
    { id: 'kun', f: 'm04', name: '星海灵鲲', sub: '深蓝星纹 · 水光长鳍', face: 'left', desc: '游于星海的灵鲲，背负星纹，长鳍拨动处水光流转。', how: '' },
    { id: 'lu', f: 'm05', name: '月华玄鹿', sub: '墨玉鹿身 · 银枝月冠', face: 'left', desc: '月下才现身的玄鹿，银枝鹿角挂着月华，步步生云。', how: '' },
    { id: 'hu9', f: 'm06', name: '九尾天狐', sub: '霜白九尾 · 绯金狐火', face: 'left', desc: '霜白九尾的天狐，尾梢燃着绯金狐火，灵慧通人性。', how: '' },
    { id: 'suanni', f: 'm07', name: '鎏金狻猊', sub: '厚重狮身 · 琉璃金火', face: 'left', desc: '龙生九子之一，狮身鎏金，周身琉璃金火，好坐镇守。', how: '' },
    { id: 'longgui', f: 'm08', name: '玄甲龙龟', sub: '墨绿玄甲 · 碧玉云环', face: 'left', desc: '龙首龟身的玄武后裔，背甲如山，碧玉云环护身。', how: '' },
    { id: 'longma', f: 'm09', name: '紫电龙马', sub: '玄黑骏马 · 紫电鬃尾', face: 'left', desc: '鬃尾缠紫电的龙马，奔行如雷，一日千里。', how: '' },
    { id: 'qinglong', f: 'm10', name: '沧溟青龙', sub: '东方龙身 · 金鬃流云', face: 'left', desc: '东方神龙，金鬃流云，腾于沧溟之上。', how: '' },
  ];
  const BY = Object.fromEntries(MOUNTS.map(m => [m.id, m]));
  const IM = {};
  const CROP = {};
  function rideFrame(m) { const sh = window.IMG && IMG['mount_duo_' + m.ride], C = window.MOUNT_DUO_CATALOG && MOUNT_DUO_CATALOG[m.ride]; if (!sh || !C) return null; if (CROP[m.id]) return CROP[m.id];
    const [cw, ch] = C.cell, row = C.directionRows.left ?? 2, c = document.createElement('canvas'); c.width = cw; c.height = ch; c.getContext('2d').drawImage(sh, 0, row * ch, cw, ch, 0, 0, cw, ch);
    try { const d = c.getContext('2d').getImageData(0, 0, cw, ch).data; let x0 = cw, y0 = ch, x1 = 0, y1 = 0; for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (d[(y * cw + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 > x0) { const o = document.createElement('canvas'); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1; o.getContext('2d').drawImage(c, -x0, -y0); return CROP[m.id] = o; } } catch (e) {}
    return CROP[m.id] = c; }
  function img(m) { if (m.ride) { const r = rideFrame(m); if (r) return r; } if (IM[m.f] !== undefined) return IM[m.f] || null; IM[m.f] = false; const im = new Image(); im.onload = () => { IM[m.f] = im; }; im.src = (!LOC && BLOB[m.f]) ? '/_blob/' + BLOB[m.f] : 'mount/' + m.f + '.webp'; return null; }
  setTimeout(() => MOUNTS.forEach(img), 2500);

  // ---------- 接现有坐骑系统（mount.js：御风白虎 / 星海灵鲲，八向扇翅帧、飞行、起落）----------
  // 有骑乘动作帧的：ride 字段对应 mount.js 的 id；其余只有定稿立绘，先进图鉴式收藏，动作帧画好再开放骑乘
  BY.baihu.ride = 'white_tiger'; BY.kun.ride = 'star_kun';
  const F = () => (S.flags = S.flags || {});
  const rideOwned = id => { const f = F(); return !!(f['mount_' + id] || (f.mount_duo && !['white_tiger', 'star_kun'].some(k => f['mount_' + k]))); };
  const owns = m => m.ride ? rideOwned(m.ride) : !!(F().mt_own || {})[m.id];
  const curRide = () => { const st = window.MOUNT_DUO_STATUS && MOUNT_DUO_STATUS(); return st ? st.mountId : null; };
  const isRiding = () => !!(window.RIDE && RIDE.on);
  // 坐骑系统正式开放：开局就有御风白虎、星海灵鲲两只（获取剧情待定）
  function grantStarters() { const f = F(); if (f.mt_start) return; f.mt_start = 1; if (window.MOUNT_GIVE) { MOUNT_GIVE('white_tiger'); MOUNT_GIVE('star_kun'); } }
  if (typeof tileUpdate === 'function') tileUpdate = (orig => function () { if (S.started && S.flags && !S.flags.mt_start) grantStarters(); return orig.apply(this, arguments); })(tileUpdate);
  window.MOUNT_SYS = { MOUNTS, owns, giveAll() { const f = F(); f.mt_own = f.mt_own || {}; MOUNTS.forEach(m => { if (m.ride) MOUNT_GIVE && MOUNT_GIVE(m.ride); else f.mt_own[m.id] = 1; }); } };
  const own = () => { const o = {}; for (const m of MOUNTS) if (owns(m)) o[m.id] = 1; return o; };
  const cur = () => { const r = curRide(); const m = MOUNTS.find(x => x.ride === r); return m ? m.id : null; };
  const F2 = F;

  // ---------- 行囊「坐骑」页 ----------
  MTABS.push('坐骑');
  menuLayout = (orig => function () { const L = orig(); if (MTABS.length > 8) L.tabs = MTABS.map((t, i) => ({ x: MB.x + 26, y: MB.y + 108 + i * 60, w: 132, h: 52 })); return L; })(menuLayout);
  sealText = (orig => function (t, x, y, w, h, active) { if (t !== '坐骑' || w < 110) return orig.apply(this, arguments);
    orig.call(this, '', x, y, w, h, active); const im = img(BY.xianhe); ctx.save();
    if (im) { const k = h * .92 / im.height; ctx.drawImage(im, x + 30 - im.width * k / 2, y + h / 2 - im.height * k / 2, im.width * k, im.height * k); }
    ctx.font = `${Math.round(h * .5)}px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = active ? '#fff2cc' : UI.sub; ctx.fillText(t, x + w / 2 + 18, y + h / 2 + 2); ctx.restore(); })(sealText);
  const isTab = () => S.menu && MTABS[S.menu.tab] === '坐骑';
  function lay(B) { const cols = 4, gw = 116, gh = 116, gx = B.x + 14, gy = B.y + 56;
    const cells = MOUNTS.map((m, i) => ({ m, x: gx + (i % cols) * (gw + 8), y: gy + Math.floor(i / cols) * (gh + 8), w: gw, h: gh }));
    const D = { x: gx + cols * (gw + 8) + 8, y: B.y + 12, w: B.x + B.w - (gx + cols * (gw + 8) + 8) - 12, h: B.h - 24 };
    return { cells, D, btn: { x: D.x + D.w / 2 - 110, y: D.y + D.h - 74, w: 220, h: 58 } }; }
  function drawMounts(B) { grantStarters(); const m0 = S.menu, o = own(); if (!m0.mt || !BY[m0.mt]) m0.mt = cur() || 'baihu';
    const { cells, D, btn } = lay(B), sel = BY[m0.mt], t = performance.now() / 1000;
    ctx.save(); ctx.textBaseline = 'middle';
    ctx.font = `30px ${BRUSH}`; ctx.textAlign = 'left'; ctx.fillStyle = UI.title || UI.gold2; ctx.fillText('坐 骑', B.x + 18, B.y + 28);
    ctx.font = `600 16px ${FONT}`; ctx.fillStyle = UI.sub; ctx.fillText('已获得 ' + Object.keys(o).length + ' / ' + MOUNTS.length, B.x + 104, B.y + 30);
    for (const c of cells) { const got = !!o[c.m.id], on = m0.mt === c.m.id, im = img(c.m);
      roundRect(c.x, c.y, c.w, c.h, 12); ctx.fillStyle = on ? 'rgba(142,42,28,.32)' : UI.slot; ctx.fill(); ctx.lineWidth = on ? 2.5 : 1; ctx.strokeStyle = on ? UI.gold2 : UI.line; ctx.stroke();
      if (im) { ctx.save(); roundRect(c.x + 2, c.y + 2, c.w - 4, c.h - 4, 10); ctx.clip(); const k = (c.h - 26) / im.height, w = im.width * k; if (!got) ctx.filter = 'grayscale(1) brightness(.35) opacity(.55)'; ctx.drawImage(im, c.x + c.w / 2 - w / 2, c.y + 2, w, c.h - 26); ctx.restore(); }
      ctx.font = `600 14px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = got ? UI.text : UI.dim; ctx.fillText(got ? c.m.name : '？？？', c.x + c.w / 2, c.y + c.h - 12);
      if (got && cur() === c.m.id) { ctx.font = `600 12px ${FONT}`; roundRect(c.x + 6, c.y + 6, 38, 20, 10); ctx.fillStyle = 'rgba(142,42,28,.9)'; ctx.fill(); ctx.fillStyle = '#fff2cc'; ctx.fillText('乘用', c.x + 25, c.y + 16); } }
    // 右侧详情
    lacquer(D.x, D.y, D.w, D.h, { r: 14, thin: true, top: UI.cTop, bot: UI.cBot });
    const got = !!o[sel.id], im = img(sel);
    if (im) { const maxH = D.h - 262, k = Math.min(maxH / im.height, (D.w - 40) / im.width), w = im.width * k, h = im.height * k, bob = Math.sin(t * 2.2) * 5;
      ctx.save(); ctx.fillStyle = 'rgba(40,24,10,.18)'; ctx.beginPath(); ctx.ellipse(D.x + D.w / 2, D.y + 26 + maxH, w * .32, 12, 0, 0, 7); ctx.fill(); ctx.restore();
      ctx.save(); if (!got) ctx.filter = 'grayscale(1) brightness(.3) opacity(.6)'; ctx.drawImage(im, D.x + D.w / 2 - w / 2, D.y + 14 + maxH - h + bob, w, h); ctx.restore(); }
    let y = D.y + D.h - 206; ctx.textAlign = 'left';
    ctx.font = `34px ${BRUSH}`; ctx.fillStyle = UI.title || UI.gold2; ctx.fillText(got ? sel.name : '？？？', D.x + 24, y);
    ctx.font = `600 15px ${FONT}`; ctx.fillStyle = UI.gold; ctx.textAlign = 'right'; ctx.fillText(got ? sel.sub : '尚未获得', D.x + D.w - 24, y + 2);
    ctx.textAlign = 'left'; ctx.font = `600 16px ${FONT}`; ctx.fillStyle = UI.text; y += 36;
    const desc = got ? sel.desc : '尚未收录。', note = !sel.ride ? '骑乘动作正在绘制，画好就能骑。' : got ? '户外大地图可骑：飞越房屋、树木和水面，速度 ×1.6，飞着不遇怪。' : '获取方式待开放。';
    const para = (txt, col) => { ctx.fillStyle = col; let line = ''; for (const ch of txt) { if (ctx.measureText(line + ch).width > D.w - 48) { ctx.fillText(line, D.x + 24, y); y += 24; line = ch; } else line += ch; } if (line) { ctx.fillText(line, D.x + 24, y); y += 24; } };
    para(desc, UI.text); y += 4; ctx.font = `600 15px ${FONT}`; para(note, UI.id === 'paper' ? '#7a4a1c' : UI.gold);
    if (got && sel.ride) { const isCur = cur() === sel.id; sealText(!isCur ? '设为乘用' : isRiding() ? '落地' : '骑乘', btn.x, btn.y, btn.w, btn.h, true); }
    ctx.restore(); }
  drawQuest = (orig => function (B) { if (isTab()) return drawMounts(B); return orig.apply(this, arguments); })(drawQuest);
  menuUpdate = (orig => function () {
    const t = input.tapped; if (!isTab() || !t || t.key) return orig.apply(this, arguments);
    const L = menuLayout(); if (inR(t, L.close) || L.tabs.some(r => inR(t, r)) || L.members.some(r => inR(t, r)) || (L.skin && inR(t, L.skin))) return orig.apply(this, arguments);
    const { cells, btn } = lay(L.body), m0 = S.menu;
    for (const c of cells) if (inR(t, c)) { consumeTap(); m0.mt = c.m.id; playSnd('ui_click'); return; }
    const sm = BY[m0.mt]; if (inR(t, btn) && sm.ride && owns(sm)) { consumeTap();
      if (cur() !== sm.id) { if (isRiding()) { toast && toast('先落地再换坐骑'); return; } if (window.MOUNT_DUO_SELECT && MOUNT_DUO_SELECT(sm.ride)) { playSnd('ui_confirm'); toast && toast('乘用坐骑：' + sm.name); } else toast && toast('坐骑素材还在加载，稍等'); return; }
      closeMenu(); setTimeout(() => { try { const before = isRiding(); window.MOUNT_TOGGLE && MOUNT_TOGGLE(); setTimeout(() => { if (!before && !isRiding()) toast && toast('这里不能骑乘（室内 / 剧情地图）'); }, 80); } catch (e) {} }, 60); return; }
    return orig.apply(this, arguments);
  })(menuUpdate);
})();

// ================= 大地图「队友跟随」开关（行囊 · 出战页右上角）=================
// 关掉后大地图上队友不跟在身后（剧情、对话、过场时照常出现）。队友仍在队伍里、照常出战。
(function () {
  if (typeof MTABS === 'undefined') return;
  const F = () => (S.flags = S.flags || {});
  const off = () => !!F().noFollow;
  const R = B => ({ x: B.x + B.w - 232, y: B.y + 12, w: 218, h: 40 });
  if (typeof drawActorT === 'function') drawActorT = (orig => function (a) {
    if (a && a.follower && off() && !dialog && !choice && !world.scripted && !world.locked) return;
    return orig.apply(this, arguments);
  })(drawActorT);
  drawQuest = (orig => function (B) { const r = orig.apply(this, arguments); if (!(S.menu && MTABS[S.menu.tab] === '出战')) return r;
    const b = R(B), on = !off(); ctx.save(); roundRect(b.x, b.y, b.w, b.h, 20); ctx.fillStyle = on ? 'rgba(142,42,28,.85)' : UI.slot; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = on ? UI.gold2 : UI.line; ctx.stroke();
    ctx.font = `600 16px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = on ? '#fff2d6' : UI.text; ctx.fillText('大地图队友跟随：' + (on ? '开' : '关'), b.x + b.w / 2, b.y + b.h / 2 + 1); ctx.restore(); return r; })(drawQuest);
  menuUpdate = (orig => function () { const m = S.menu, t = input.tapped;
    if (m && t && !t.key && MTABS[m.tab] === '出战') { const L = menuLayout(); if (inR(t, R(L.body))) { input.tapped = null; F().noFollow = off() ? 0 : 1; try { playSnd('ui_click'); } catch (e) {} try { toast(off() ? '队友不再在大地图上跟随' : '队友恢复跟随'); } catch (e) {} return; } }
    return orig.apply(this, arguments); })(menuUpdate);
})();
