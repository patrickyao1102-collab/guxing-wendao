// ================= R66 · 集市 NPC 多样化（二）：各不相同的访客 / 旁观者，六位店主定点站柜、呼吸待机、脚下灵光 =================
// 访客 12 套行走图（7 列 × 3 行：下 / 上 / 左，右为左镜像）、旁观者 7 张单帧、店主 8 帧呼吸待机 + 灵光层，全部由本文件自己加载、自己画。
// 店主不再在店前来回走，站在店前正中；脚下各有一圈颜色不同的灵光（丹药铺琥珀橙 / 典籍阁青金 / 兵甲坊冷银蓝 / 符阵坊朱砂红 / 灵兽苑翠绿 / 五曜商阁紫金），
// 身后一道淡光柱、几粒上飘的小星，一眼看出谁是店家。
(function () {
  const D = window.R60; if (!D || !D.life || typeof drawBaked !== 'function' || !window.R66) return;
  const L = D.life, KEYS = ['alchemist', 'storyteller', 'artificer', 'peddler', 'beast_keeper', 'board_keeper'];
  const BLOB = {"visitor_ashi": "0f3055bd93e865f080ffc112f149a3c1", "visitor_zhaopopo": "e603ff95be60ee74966134466271f65f", "visitor_xuyan": "9cfa2290667464b5a2bf5ce9ac1732e9", "visitor_qinxiaowan": "ac7135e12fd03d0263ecaeb5e3e9a7a3", "visitor_laozhou": "dd9e625db5d624b84052769d8086f67b", "visitor_suling": "b215072f792b53fbeef4966a6fd79e11", "visitor_daniu": "ca071d5f0f7209c39d8247454ea7b10d", "visitor_afu": "56fcced703b05f39146a2dc6257d7884", "visitor_qingfeng": "55ff057a1182b3df4144fb0caf7c2592", "visitor_liuniang": "f7090064961c2061ddabb42e49d45592", "visitor_laoqiaofu": "77ef693466e7e8aae5b194606186a927", "visitor_xiaohe": "58efe5a14e07df58ed6f91add7b46524",
    "guest_chenfuzi": "66df5c7f1411d263adbbc35d2c9eecce", "guest_shenzhi": "dc91712219364069e8b86e6838cc359c", "guest_hanping": "be432b824e49c5e4e69725d931532b94", "guest_lulao": "cac3d3167b233abd04e674e60c24866a", "guest_aheng": "97817ad7bebbe9414111c883506dc0c2", "guest_qianduoduo": "825afe75bf717fb646e0fdef8b8df339", "guest_wanglaobo": "a072726405f84b4d90a01ed014bc8270",
    "keeper_alchemist": "ef5c914177e2b281e2f522e22a3a45a3", "keeper_storyteller": "3275bc78d0aefe01c46c13f7a4c7c8af", "keeper_artificer": "670a4c5e742c96699665bfbee53984e9", "keeper_peddler": "7b45c992f4b3ee3e5f1c690e8b665ee2", "keeper_beast_keeper": "8c3c14dac0d000b642438423cdcdbebe", "keeper_board_keeper": "17a514ceab384e9db4251e43fa7e19aa",
    "keeper_alchemist_aura": "0b75e16adfe225e550021c5d6efb1056", "keeper_storyteller_aura": "1a1af1266c6930d015f37dfe2c1f6cc7", "keeper_artificer_aura": "1a5d1e6de4557899e161a2890982f3eb", "keeper_peddler_aura": "d21692c219f20ba8d4484f3a4b6f5f4f", "keeper_beast_keeper_aura": "2c1cb79568f7d0f034d456aa1eb0b6b9", "keeper_board_keeper_aura": "39524171927ba9de9fc55941cc5079c8"};
  const local = (window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:');
  const src = n => (!local && BLOB[n]) ? '/_blob/' + BLOB[n] : (/_aura$/.test(n) ? 'ui3/r66/' + n + '.webp' : 'cx2/r60_life_' + n + '.webp');
  const IM = {}; function img(n) { if (IM[n] !== undefined) return IM[n] || null; IM[n] = null; const im = new Image(); im.onload = () => { IM[n] = im; }; im.src = src(n); return null; }
  for (const n of Object.keys(BLOB)) img(n);
  const MINE = new Set(Object.keys(BLOB).filter(n => !/_aura$/.test(n)));
  // 店主站到店前正中（原来是从左端走到右端），不再走动
  for (const n of L.npcs || []) if (KEYS.includes(n.key)) { const mid = [(n.home[0] + n.end[0]) / 2, n.home[1]]; n.home = mid; n.end = [...mid]; }
  const COL = { alchemist: '255,176,70', storyteller: '110,215,225', artificer: '160,200,255', peddler: '255,105,80', beast_keeper: '110,230,140', board_keeper: '200,140,255' };
  const PH = {}; KEYS.forEach((k, i) => { PH[k] = i * 1.7; });
  const S = .5, W = 160, H = 240, AX = 80, AY = 232;
  function aura(kind, ax, ay) {
    const t = performance.now() / 1000 + PH[kind], col = COL[kind], pulse = .5 + .5 * Math.sin(t * 2.2), im = img('keeper_' + kind + '_aura');
    ctx.save(); ctx.translate(ax, ay);
    { const r = 62 + 4 * pulse; const g = ctx.createRadialGradient(0, -4, 4, 0, -4, r); g.addColorStop(0, `rgba(${col},${.62 + .18 * pulse})`); g.addColorStop(.5, `rgba(${col},${.38 + .12 * pulse})`); g.addColorStop(1, `rgba(${col},0)`);
      ctx.save(); ctx.scale(1, .38); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -4 / .38, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.save(); ctx.scale(1, .38); ctx.strokeStyle = `rgba(${col},${.7 + .3 * pulse})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -4 / .38, 44 + 3 * pulse, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    { ctx.globalCompositeOperation = 'screen'; const g = ctx.createLinearGradient(0, -8, 0, -150); g.addColorStop(0, `rgba(${col},${.5 + .15 * pulse})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -78, 36, 74, 0, 0, Math.PI * 2); ctx.fill(); }
    if (im) { ctx.globalAlpha = .85 + .15 * pulse; const s = 1.25 + .04 * Math.sin(t * 1.4); ctx.scale(s, s); ctx.drawImage(im, -80, -148, 160, 160); }
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let k = 0; k < 4; k++) { const ph = (t / 2.6 + k / 4) % 1; ctx.globalAlpha = Math.sin(Math.PI * ph) * .9; const sx = ax + [-26, 18, -8, 30][k] + 4 * Math.sin(t * 1.3 + k), sy = ay - 10 - ph * 120; ctx.fillStyle = `rgb(${col})`; ctx.beginPath(); ctx.arc(sx, sy, 1.6 + (k % 2), 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  function draw(o) {
    const [ax, ay] = o.anchor; let tex = o.texture, col = 0, row = 0, flip = !!o.flip;
    const keeper = KEYS.includes(o.kind) && o.uid === 'npc_' + o.kind;
    if (keeper) { aura(o.kind, ax, ay); tex = 'keeper_' + o.kind; col = Math.floor((performance.now() / 1000 + PH[o.kind]) * 6) % 8; row = 0; flip = false; }
    else if (/^visitor_/.test(tex)) { col = o.frame; row = o.row; }
    const im = img(tex); if (!im) return;
    ctx.save(); ctx.translate(ax, ay);
    if (o.shadow !== false) { ctx.fillStyle = 'rgba(36,53,45,.15)'; ctx.beginPath(); ctx.ellipse(0, -2, 16, 5, 0, 0, Math.PI * 2); ctx.fill(); }
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(im, col * W, row * H, W, H, -AX * S, -AY * S, W * S, H * S); ctx.restore();
    if (o.title && !(window.R60_NPC && R60_NPC.hidden(o))) { const nm = o.title.split('·').pop().trim(); ctx.save(); ctx.font = `600 18px ${FONT}`; ctx.textAlign = 'center'; textOutline(nm, ax, ay - AY * S - 8, '#ffe08a', '#1a0c00', 4); ctx.restore(); }
    const lb = window.R60_NPC && R60_NPC.label(o);
    if (lb) { const top = ay - AY * S; ctx.save(); ctx.textAlign = 'center'; if (lb.name) { ctx.font = `600 17px ${FONT}`; textOutline(lb.name, ax, top - 8, '#fff4d8', '#1a0c00', 4); } if (lb.mark) { const b = Math.sin(performance.now() / 250) * 5; ctx.font = `900 34px ${FONT}`; textOutline(lb.mark, ax, top - (o.title || lb.name ? 34 : 10) + b, '#ffd34a', '#5a2a00', 5); } ctx.restore(); }
  }
  drawBaked = (orig => function (o, now) {
    const p = o && o.r60 && o.pose;
    if (p && (MINE.has(p.texture) || (KEYS.includes(p.kind) && p.uid === 'npc_' + p.kind))) { draw(p); return; }
    return orig.apply(this, arguments);
  })(drawBaked);
  window.R66_NPC = { IM, img };
})();
// ================= R66 · 续：玄天城 / 青阳镇 街上也走着各式各样的人 =================
// 集市那 12 套访客行走图（赵婆婆、挑夫大牛、绣娘阿芙、老樵夫、卖花姑娘小荷、散修老周……）在大城里也用上：
// 进玄天城随机撒 9 个、青阳镇 4 个，各自在原地附近闲逛，走近能搭话（都是闲话）。站位每次进图随机，但只落在能走的路面上。
(function () {
  if (typeof tileSetMap !== 'function' || typeof addActor !== 'function' || !window.R66_NPC || !window.R66) return;
  const img = R66_NPC.img;
  const FOLK = {
    zhaopopo: ['赵婆婆', ['这城里的米价，比我们镇上贵了一倍……', '孩子，看你面生，是外地来的吧？']],
    daniu: ['挑夫·大牛', ['这一担是送去城主府的，少说也有两百斤。', '力气活不丢人，挣的是干净钱。']],
    afu: ['绣娘·阿芙', ['城里的小姐们都爱绣云纹，说是仙气。', '这副帕子绣了三天，你看看针脚。']],
    laoqiaofu: ['老樵夫', ['山里的柴越来越难砍了，妖物多。', '天剑宗的仙长们要是肯下山清一清就好了。']],
    xiaohe: ['卖花姑娘·小荷', ['新摘的栀子花，三文一枝～', '买一枝送心上人吧，少侠。']],
    laozhou: ['散修·老周', ['听说万宝楼新到了一批灵材，价钱吓死人。', '像我这样的散修，一辈子也摸不到凝丹的门槛。']],
    xuyan: ['青年·许言', ['我在城里找活干，哪儿都要会写字的。', '你是天剑宗的？那可了不得。']],
    liuniang: ['柳娘', ['我家那口子去城外送货，三天了还没回。', '这城门口的卫兵越来越多，是不是要出事？']],
    suling: ['女弟子·苏铃', ['师父让我来城里采买，顺便看看热闹。', '这城里真大，我都转迷路了。']],
    ashi: ['外门弟子·阿石', ['我来替师兄们跑腿买东西。', '城里的糖画真好看，就是舍不得买。']],
    qingfeng: ['小师弟·清风', ['我偷偷溜下山的，别告诉执事！', '城里的人好多呀……']],
    qinxiaowan: ['秦小婉', ['娘说城里不安全，让我早点回去。', '你见过那么高的塔吗？就在城中间。']],
  };
  const PLAN = { xt_city: ['zhaopopo', 'daniu', 'afu', 'laoqiaofu', 'xiaohe', 'laozhou', 'xuyan', 'liuniang', 'suling'], qy_town: ['daniu', 'xiaohe', 'xuyan', 'qinxiaowan'] };
  const S = .5;
  function spots(T, n, actors) {
    const out = [], cs = CS, cols = T.cols, rows = T.rows; let tries = 0;
    const far = (x, y) => actors.every(a => Math.hypot(a.x - x, a.y - y) > 110) && out.every(([ox, oy]) => Math.hypot(ox - x, oy - y) > 150);
    while (out.length < n && tries++ < 4000) {
      const c = Math.floor(cols * (.12 + Math.random() * .76)), r = Math.floor(rows * (.12 + Math.random() * .76));
      const x = (c + .5) * cs, y = (r + .8) * cs;
      let ok = true; for (let dc = -2; dc <= 2 && ok; dc++) for (let dr = -1; dr <= 2 && ok; dr++) if (!walkable(T, c + dc, r + dr)) ok = false;   // 周围一圈都能走，才不会卡在墙边
      if (ok && canStand(T, x, y) && far(x, y)) out.push([x, y]);
    }
    return out;
  }
  tileSetMap = (orig => function (name) {
    const r = orig.apply(this, arguments);
    try {
      const list = PLAN[name]; const T = world.map && world.map.T;
      if (list && T && !world.actors.some(a => a.npc && a.npc.r66)) {
        const pts = spots(T, list.length, world.actors);
        list.forEach((k, i) => { const p = pts[i]; if (!p) return; const [nm, talk] = FOLK[k];
          const a = addActor('n_villager', p[0], p[1], nm, '#c9a86a');
          a.npc = { key: 'n_villager', r66: 'visitor_' + k, name: nm, talk, random: true, wander: true, h: 118 }; a.h = 118; a.dir = Math.random() < .5 ? 1 : -1; a.home = [a.x, a.y]; a.wait = 1 + Math.random() * 4; });
      }
    } catch (e) { console.warn('r66_town', e); }
    return r;
  })(tileSetMap);
  // 画：和集市访客同一套 7×3 行走图
  drawActorT = (orig => function (a, now) {
    const k = a.npc && a.npc.r66; if (!k || a.hidden) return orig(a, now);
    const im = img(k); if (!im) return orig(a, now);
    let dx = (a.tx ?? a.x) - a.x, dy = (a.ty ?? a.y) - a.y;
    if (a._lx != null && Math.hypot(a.x - a._lx, a.y - a._ly) > .2) { dx = a.x - a._lx; dy = a.y - a._ly; }
    a._lx = a.x; a._ly = a.y;
    let row, flip = false; if (Math.abs(dx) > Math.abs(dy) * .8) { row = 2; flip = dx > 0; } else row = dy < 0 ? 1 : 0;
    if (Math.abs(dx) + Math.abs(dy) < .01) { row = a._row ?? 0; flip = !!a._flip; } a._row = row; a._flip = flip;
    const col = a.moving ? 1 + Math.floor(now * 8 + (a.x * .013 % 1) * 6) % 6 : 0;
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.30)'; ctx.beginPath(); ctx.ellipse(a.x, a.y, 20, 6, 0, 0, 7); ctx.fill();
    ctx.globalAlpha *= a.alpha ?? 1; ctx.translate(a.x, a.y); if (flip) ctx.scale(-1, 1); ctx.scale(S, S);
    ctx.drawImage(im, col * 160, row * 240, 160, 240, -80, -232, 160, 240); ctx.restore();
  })(drawActorT);
})();

// ================= 建筑碰撞修正：按物件贴图的实际轮廓补阻挡（铺子的台子、柜台、花坛、树干……不能再穿过去）=================
// Codex 的阻挡格是手画的，集市里好几家铺子的前台和侧台没挡住，人能走进柜台里。这里在进图时按每个物件贴图的不透明像素，
// 在它脚底往上一段（建筑取高度的 50%，树只取树干 14%，栏杆 85%……）把有像素的格子都标成不能走；出口和落脚点周围留空。
// 集市访客的巡游路线也按新的阻挡重新寻路，店主站位若落在阻挡里就挪到最近的空地。
(function () {
  if (typeof CXB2 === 'undefined' || typeof tileSetMap !== 'function' || typeof IMG === 'undefined') return;
  const BAND = id => /gate|arch|torii|paifang/i.test(id) ? .3 : /pine|cherry|tree|willow|bamboo|peach|plum|maple/i.test(id) ? .14 : /rail|fence|balustrade/i.test(id) ? .85 : /rock|stone|flower|bench|trough|perch|lantern|well|stall|cart|crate|barrel|pot|statue/i.test(id) ? .7 : /wall/i.test(id) ? .95 : .5;
  const done = {}, cache = {};
  function alphaOf(im) { if (im._ad) return im._ad; const w = im.width || im.naturalWidth, h = im.height || im.naturalHeight; if (!w || !h) return null; const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0); try { im._ad = { d: g.getImageData(0, 0, w, h).data, w, h }; } catch (e) { im._ad = null; } return im._ad; }
  function refine(id) {
    const B = CXB2[id]; if (!B || done[id]) return false;
    const cs = B.cs, cols = B.cols, rows = B.rows, b = B.blocked.split(''); let changed = 0, missing = 0;
    for (const o of B.objs || []) {
      if (o.flat || !o.img || o.noBlock) continue; const im = IMG[o.img]; if (!im) { missing++; continue; }
      const A = alphaOf(im); if (!A) continue;
      // 排序脚点改到贴图真正的底边（Codex 的贴图底下常留几十像素透明边，脚点偏低会让站在台子前面的人被画到台子后面去）
      if (!o._sb) { let bot = -1; for (let y = A.h - 1; y >= 0 && bot < 0; y--) { let n = 0; for (let x = 0; x < A.w; x += 2) if (A.d[(y * A.w + x) * 4 + 3] > 40) n++; if (n >= 3) bot = y; }
        if (bot >= 0) { const base = o.y + o.h * (bot + 1) / A.h; if (base < o.sy - 3) { o._sb = o.sy; o.sy = base; if (world.mapName === id && world.map && world.map.T) { const t = world.map.T.objs.find(q => q.uid === o.uid && !q.r60); if (t) t.sy = base; } } else o._sb = o.sy; } }
      const F = BAND(o.id || o.img_id || ''), y0 = o.sy - o.h * F, y1 = o.sy + 2;
      const c0 = Math.max(0, Math.floor(o.x / cs)), c1 = Math.min(cols - 1, Math.floor((o.x + o.w) / cs)), r0 = Math.max(0, Math.floor(y0 / cs)), r1 = Math.min(rows - 1, Math.floor(y1 / cs));
      for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
        const i = r * cols + c; if (b[i] === '1') continue; let hit = 0;
        for (const [fx, fy] of [[.25, .25], [.75, .25], [.25, .75], [.75, .75]]) { const x = (c + fx) * cs, y = (r + fy) * cs; if (y < y0 || y > y1) continue;
          let u = (x - o.x) / o.w; if (o.flip) u = 1 - u; const px = Math.floor(u * A.w), py = Math.floor((y - o.y) / o.h * A.h);
          if (px < 0 || py < 0 || px >= A.w || py >= A.h) continue; if (A.d[(py * A.w + px) * 4 + 3] > 110) hit++; }
        if (hit >= 3) { b[i] = '1'; changed++; }
      }
    }
    if (missing) return false;   // 图还没到齐，下次再算
    // 出口 / 落脚点周围留空（别把门堵死）
    const open = (x, y, k) => { const c0 = Math.floor(x / cs), r0 = Math.floor(y / cs); for (let dr = -k; dr <= k; dr++) for (let dc = -k; dc <= k; dc++) { const c = c0 + dc, r = r0 + dr; if (c >= 0 && r >= 0 && c < cols && r < rows) b[r * cols + c] = '0'; } };
    for (const e of B.exits || []) if (e.region) open(e.region.x + e.region.w / 2, e.region.y + e.region.h / 2, Math.ceil(40 / cs));
    if (B.spawn) open(B.spawn[0], B.spawn[1], Math.ceil(24 / cs));
    B.blocked = b.join(''); done[id] = changed;
    // 当前就在这张图上：直接改碰撞表
    if (world.mapName === id && world.map && world.map.T && world.map.T.block) { const T = world.map.T; for (let r = 0; r < rows && r < T.block.length; r++) for (let c = 0; c < cols; c++) T.block[r][c] = b[r * cols + c] === '1' ? 1 : 0; }
    return true;
  }
  // ---- 集市访客按新阻挡重新寻路 ----
  function reroute() {
    const D = window.R60; if (!D || !D.life) return; const B = CXB2.tj_market; if (!B) return;
    const cs = B.cs, cols = B.cols, rows = B.rows, bl = B.blocked;
    const free = (c, r) => { if (c < 2 || r < 2 || c >= cols - 2 || r >= rows - 2) return false; for (let dc = -2; dc <= 2; dc++) for (let dr = -1; dr <= 1; dr++) if (bl.charCodeAt((r + dr) * cols + c + dc) !== 48) return false; return true; };
    const snap = (x, y) => { const c0 = Math.floor(x / cs), r0 = Math.floor(y / cs); for (let d = 0; d < 40; d++) for (let dr = -d; dr <= d; dr++) for (let dc = -d; dc <= d; dc++) { if (Math.max(Math.abs(dc), Math.abs(dr)) !== d) continue; if (free(c0 + dc, r0 + dr)) return [c0 + dc, r0 + dr]; } return null; };
    function path(a, b) {   // 网格 BFS（4 邻），返回简化后的像素点列
      const key = (c, r) => r * cols + c, prev = new Int32Array(cols * rows).fill(-1), q = [key(a[0], a[1])]; prev[q[0]] = q[0]; const goal = key(b[0], b[1]); let found = false;
      for (let i = 0; i < q.length && i < 200000; i++) { const k = q[i]; if (k === goal) { found = true; break; } const c = k % cols, r = (k - c) / cols;
        for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nc = c + dc, nr = r + dr; if (!free(nc, nr)) continue; const nk = key(nc, nr); if (prev[nk] >= 0) continue; prev[nk] = k; q.push(nk); } }
      if (!found) return null; const pts = []; let k = goal; while (k !== prev[k]) { pts.push(k); k = prev[k]; } pts.push(k); pts.reverse();
      const out = []; for (let i = 0; i < pts.length; i++) { const c = pts[i] % cols, r = (pts[i] - c) / cols; if (i > 0 && i < pts.length - 1) { const p = pts[i - 1], n = pts[i + 1]; const pc = p % cols, pr = (p - pc) / cols, nc = n % cols, nr = (n - nc) / cols; if ((pc === c && nc === c) || (pr === r && nr === r)) continue; } out.push([(c + .5) * cs, (r + .5) * cs]); }
      return out;
    }
    let fixed = 0;
    for (const v of D.life.visitors || []) { for (const leg of v.legs) { const P = leg.points; const a = snap(P[0][0], P[0][1]), b = snap(P[P.length - 1][0], P[P.length - 1][1]); if (!a || !b) continue;
        const bad = P.some(([x, y]) => !free(Math.floor(x / cs), Math.floor(y / cs))); if (!bad) continue;
        const np = path(a, b); if (np && np.length >= 2) { leg.points = np; fixed++; } } delete v._c; }
    for (const n of D.life.npcs || []) { const s = snap(n.home[0], n.home[1]); if (s && !free(Math.floor(n.home[0] / cs), Math.floor(n.home[1] / cs))) { n.home = [(s[0] + .5) * cs, (s[1] + .5) * cs]; n.end = [...n.home]; } }
    for (const o of D.life.onlookers || []) { const s = snap(o.anchor[0], o.anchor[1]); if (s && !free(Math.floor(o.anchor[0] / cs), Math.floor(o.anchor[1] / cs))) o.anchor = [(s[0] + .5) * cs, (s[1] + .5) * cs]; }
    return fixed;
  }
  const PEND = new Set(); let rerouted = false;
  function tryAll() { for (const id of [...PEND]) { if (refine(id)) { PEND.delete(id); if (id === 'tj_market' && !rerouted) { rerouted = true; try { reroute(); if (world.mapName === id) tileSetMap(id, world.player.x / TS - .5, world.player.y / TS - .8, world.player.face); } catch (e) { console.warn('reroute', e); } } } } }
  tileSetMap = (orig => function (name) {
    if (CXB2[name] && !done[name]) { PEND.add(name); try { refine(name); if (name === 'tj_market' && done[name] != null && !rerouted) { rerouted = true; reroute(); } } catch (e) { console.warn('refine', e); } }
    const r = orig.apply(this, arguments);
    return r;
  })(tileSetMap);
  setInterval(() => { if (PEND.size) try { tryAll(); } catch (e) {} }, 1500);
  window.R66_COLLIDE = { refine, reroute, done };
})();

// ================= 建筑落地感：每个大物件脚下补一层柔和的接地阴影 =================
// 集市的地面图上没有烘焙物件的影子，铺子、石台、大树像是浮在石板上。这里在画每个非平铺物件之前，先在它脚下画一片
// 椭圆的软阴影（按贴图底部不透明像素的实际宽度算），正片叠底，建筑重一点、树和花坛轻一点。放在物件自己前面画，才不会被平铺的地面装饰盖住。
(function () {
  if (typeof drawBaked !== 'function' || typeof CXB2 === 'undefined' || typeof IMG === 'undefined') return;
  const MAPS = new Set(['tj_market']);
  const ext = {};   // 贴图底部的不透明范围（相对宽度）
  function footprint(o) {   // 返回 { bot: 最低一行不透明像素的相对位置, runs: [[左,右],...] 底部不透明像素的横向分段（牌坊的两根柱子就是两段）}
    const k = o.img; if (ext[k] !== undefined) return ext[k]; const im = IMG[k]; if (!im) return null;
    const w = im.width || im.naturalWidth, h = im.height || im.naturalHeight; if (!w || !h) return null;
    try { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, w, h).data;
      let bot = -1; for (let y = h - 1; y >= 0 && bot < 0; y--) { let n = 0; for (let x = 0; x < w; x += 2) if (d[(y * w + x) * 4 + 3] > 40) n++; if (n >= 3) bot = y; }
      if (bot < 0) { ext[k] = null; return null; }
      const y0 = Math.max(0, bot - Math.round(h * .07)), col = new Uint8Array(w); for (let y = y0; y <= bot; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) col[x] = 1;
      const runs = []; let st = -1, gap = 0; for (let x = 0; x <= w; x++) { const on = x < w && col[x]; if (on) { if (st < 0) st = x; gap = 0; } else if (st >= 0) { if (++gap > Math.max(10, w * .02) || x === w) { runs.push([st / w, (x - gap + 1) / w]); st = -1; gap = 0; } } }
      ext[k] = { bot: (bot + 1) / h, runs: runs.filter(r => (r[1] - r[0]) * w >= 10) }; } catch (e) { ext[k] = null; }
    return ext[k];
  }
  function shadow(o) {
    const fp = footprint(o); if (!fp || !fp.runs.length) return;
    const tree = /pine|cherry|tree|willow|bamboo|peach|plum/i.test(o.id || '');
    const base = o.y + o.h * fp.bot;
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    for (let [l, r] of fp.runs) {
      if (o.flip) { const t = l; l = 1 - r; r = 1 - t; }
      const x0 = o.x + o.w * l, x1 = o.x + o.w * r, ww = x1 - x0, big = ww > 400;
      const cx = (x0 + x1) / 2 + Math.min(8, ww * .05), rx = Math.max(24, ww / 2 + 12), ry = Math.min(tree ? 18 : big ? 60 : 38, rx * .2), cy = base + (tree ? 2 : 6);
      const a = tree ? .38 : big ? .7 : .55;
      ctx.save(); ctx.translate(cx, cy);
      const g = ctx.createRadialGradient(0, 0, rx * .2, 0, 0, rx); g.addColorStop(0, `rgba(45,34,22,${a})`); g.addColorStop(.6, `rgba(45,34,22,${a * .55})`); g.addColorStop(1, 'rgba(45,34,22,0)');
      ctx.save(); ctx.scale(1, ry / rx); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, 7); ctx.fill(); ctx.restore();
      if (!tree) { const g2 = ctx.createRadialGradient(0, 0, rx * .1, 0, 0, rx * .96); g2.addColorStop(0, `rgba(30,22,14,${a * .8})`); g2.addColorStop(.75, `rgba(30,22,14,${a * .35})`); g2.addColorStop(1, 'rgba(30,22,14,0)'); ctx.save(); ctx.translate(0, -2); ctx.scale(1, Math.max(6, ry * .3) / rx); ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(0, 0, rx * .96, 0, 7); ctx.fill(); ctx.restore(); }
      ctx.restore();
    }
    ctx.restore();
  }
  drawBaked = (orig => function (o, now) {
    if (o && !o.flat && !o.r60 && !o.noBlock && o.img && o.w >= 120 && MAPS.has(world.mapName)) { try { shadow(o); } catch (e) {} }
    return orig.apply(this, arguments);
  })(drawBaked);
  // 店主站到自家柜台正前方（台子底边下面一点），不再站在广场中间
  const KS = { alchemist: 'medicine', storyteller: 'skills', artificer: 'armory', peddler: 'talismans', beast_keeper: 'beasts', board_keeper: 'special' };
  let placed = false;
  function placeKeepers() {
    const D = window.R60; const B = CXB2.tj_market; if (!D || !B || placed) return;
    let all = true;
    for (const n of D.life.npcs || []) { const shop = KS[n.key]; if (!shop || shop === 'beasts') continue;
      const o = B.objs.find(x => x.id === 'r60-' + shop), t = B.inter.find(x => x.shop === shop); if (!o || !t) continue;
      const fp = footprint(o); if (!fp) { all = false; continue; }
      const base = o.y + o.h * fp.bot; n.home = [t.p[0], base + 34]; n.end = [...n.home]; }
    if (all) placed = true;
  }
  tileSetMap = (orig => function (name) { if (name === 'tj_market') try { placeKeepers(); } catch (e) {} return orig.apply(this, arguments); })(tileSetMap);
  setInterval(() => { if (!placed && world.mapName === 'tj_market') try { placeKeepers(); } catch (e) {} }, 1500);
})();
