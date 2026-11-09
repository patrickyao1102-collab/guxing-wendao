// ================= R145 · 存档 / 读档（作者 11-07：给读者朋友试玩的正式版，要能存能读）=================
// 存的是游戏进度本身：S.flags（全部剧情进度）+ S.hero（属性 / 背包 / 装备 / 灵石 / 技能）+ 队伍 + 技能重数 + 当前地图和位置。
// 只在「地图上自由走动」这种安全点存档；读档就带着这份状态重新进地图——和测试面板跳转同一条路径，彻底避开「存在过场里读不出来」的 bug。
// 界面全部用游戏自带的 choose() 弹窗画，不另造渲染 / 输入，稳。四个档：自动 + 手动 1/2/3。
(function () {
  if (typeof choose !== 'function' || typeof tileSetMap !== 'function' || typeof world === 'undefined') return;
  const KEYS = { auto: 'gx_save_auto', 1: 'gx_save_1', 2: 'gx_save_2', 3: 'gx_save_3' };
  const SLOTS = ['auto', '1', '2', '3'];
  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  const T = () => (typeof toast === 'function' ? toast : () => {});

  // 只有在地图上自由走动时才是安全存档点
  function safeNow() {
    try {
      return !!(S.started && world.map && world.player && S.scene === drawMap
        && !(typeof battle !== 'undefined' && battle) && !dialog && !choice && !sysPanel
        && !world.locked && !world.hold && !window.CINE_PAUSE);
    } catch (e) { return false; }
  }
  const clone = o => { try { return JSON.parse(JSON.stringify(o)); } catch (e) { return null; } };
  function snapshot() {
    const p = world.player;
    return {
      v: 1, t: Date.now(),
      map: world.mapName, x: p ? Math.round(p.x) : 0, y: p ? Math.round(p.y) : 0, face: p ? p.face : 'down',
      hero: clone(S.hero), flags: clone(S.flags || {}), party: clone(S.party || []),
      sk4: clone(S.sk4 || {}), skillLv: clone(S.skillLv || {}),
      quest: S.quest || '', uiTheme: S.uiTheme || 'paper',
      title: (TMAPS[world.mapName] && TMAPS[world.mapName].title) || world.mapName || '',
    };
  }
  function readSlot(s) { const raw = ls.get(KEYS[s]); if (!raw) return null; try { const d = JSON.parse(raw); return d && d.hero ? d : null; } catch (e) { return null; } }
  const anySave = () => SLOTS.some(s => readSlot(s));
  window.GX_HAS_SAVE = anySave;

  function writeSlot(s) {
    if (!safeNow()) { T()('打斗或剧情里不能存档，回到地图上走动时再存', 2200); return false; }
    const snap = snapshot(); if (!snap.hero) { T()('这一刻不能存档', 1800); return false; }
    const ok = ls.set(KEYS[s], JSON.stringify(snap));
    T()(ok ? (s === 'auto' ? '已自动存档' : '已存到存档 ' + s) : '存档失败（手机存储空间可能不足）', 1800);
    return ok;
  }
  // 自动存档：原来各处 saveGame() 的调用现在生效；只在有世界时写、安全点才覆盖
  window.saveGame = function (slot) {
    if (slot && slot !== 'auto') return writeSlot(slot);
    try { if (!(S.started && world.map && world.player)) return; const snap = snapshot(); if (snap.hero) ls.set(KEYS.auto, JSON.stringify(snap)); } catch (e) {}
  };

  const META = s => {
    const d = readSlot(s); const head = s === 'auto' ? '自动存档' : '存档 ' + s;
    if (!d) return head + ' · 空';
    const h = d.hero || {}, t = new Date(d.t || 0);
    const two = n => String(n).padStart(2, '0');
    const when = (t.getMonth() + 1) + '月' + t.getDate() + '日 ' + two(t.getHours()) + ':' + two(t.getMinutes());
    return head + ' · ' + (d.title || '') + ' · ' + (h.realm || ('Lv' + (h.lv || '?'))) + ' · ' + when;
  };

  // 开机时各模块挂进 S.overlay 的都是常驻层（自己判断画不画），标成 _keep；之后临时推进来的弹层读档时照旧清掉
  { const tag = () => { try { for (const o of S.overlay) if (o) o._keep = 1; } catch (e) {} }; if (document.readyState === 'complete') setTimeout(tag, 0); else window.addEventListener('load', () => setTimeout(tag, 0)); }
  function applyLoad(d) {
    try { if (typeof battle !== 'undefined' && battle) { try { endBattle(true); } catch (e) {} battle = null; } } catch (e) {}
    try { dialog = null; } catch (e) {} try { choice = null; } catch (e) {} try { sysPanel = null; } catch (e) {}
    S.hero = d.hero; S.flags = d.flags || {}; S.party = d.party || []; S.sk4 = d.sk4 || {}; S.skillLv = d.skillLv || {};
    S.quest = d.quest || ''; if (d.uiTheme) S.uiTheme = d.uiTheme; S.started = true; S.menu = null;
    S.fade = 0; S.flash = 0; S.hud = true; for (let i = S.overlay.length - 1; i >= 0; i--) if (!(S.overlay[i] && S.overlay[i]._keep)) S.overlay.splice(i, 1);   // 11-10：模块开机时挂上的常驻层（钓鱼、菜园布置、竹牌、厨房……）读档后要留着，只清临时弹层
    world.hold = false; world.locked = false; world.path = null; world.walkTarget = null; world.pending = null;
    try { (S.party || []).forEach(k => { if (typeof allyState === 'function') allyState(k); }); } catch (e) {}
    const name = d.map && TMAPS[d.map] ? d.map : 'qingzhu_court';
    tileSetMap(name, d.x / 64 - .5, d.y / 64 - .8, d.face || 'down');
    S.scene = drawMap;
    const pl = world.player; if (pl) { pl.x = d.x; pl.y = d.y; pl.moving = false; pl.face = d.face || 'down'; }
    world.cam = null;
    setTimeout(() => { try { const p = world.player; if (p) { p.x = d.x; p.y = d.y; } world.cam = null; } catch (e) {} }, 60);
    T()('读取存档：' + (d.title || name), 1800);
  }
  window.loadGame = function (s) { const d = readSlot(s); if (!d) { T()('这个存档是空的', 1600); return false; } applyLoad(d); return true; };

  // ---------------- 菜单里：存档 / 读档 ----------------
  async function slotMenu() {
    if (S.menu) { try { closeMenu(); } catch (e) { S.menu = null; world.locked = false; } }
    while (true) {
      const i = await choose('存档 / 读档', SLOTS.map(META).concat(['返回']));
      if (i == null || i >= SLOTS.length) return;
      const s = SLOTS[i], has = !!readSlot(s);
      const acts = [], keys = [];
      if (s !== 'auto') { acts.push('存到这里'); keys.push('save'); }
      if (has) { acts.push('读取这个存档'); keys.push('load'); }
      if (has && s !== 'auto') { acts.push('删除这个存档'); keys.push('del'); }
      acts.push('返回'); keys.push('back');
      const j = await choose(META(s), acts); const a = keys[j];
      if (a === 'save') writeSlot(s);
      else if (a === 'load') { if (loadGame(s)) return; }
      else if (a === 'del') { ls.del(KEYS[s]); T()('已删除存档 ' + s, 1400); }
    }
  }
  window.GX_SLOTMENU = slotMenu;

  // 菜单右上角加一个「存档」按钮（在「换肤」左边）
  if (typeof menuLayout === 'function') {
    menuLayout = (orig => function () { const L = orig(); if (L.skin) L.save = { x: L.skin.x - 96, y: L.skin.y, w: 84, h: L.skin.h }; return L; })(menuLayout);
    menuUpdate = (orig => function () {
      const t = input.tapped;
      if (t && !t.key) { const L = menuLayout(); if (L.save && inR(t, L.save)) { consumeTap(); try { playSnd('ui_click'); } catch (e) {} const f = window.GX_SLOTMENU; Promise.resolve(f && f !== slotMenu ? f() : undefined).then(v => { if (v === undefined) slotMenu(); }); return; }   /* R187 整页存档界面接管，图没到时退回旧弹窗 */ }
      return orig.apply(this, arguments);
    })(menuUpdate);
    drawMenu = (orig => function () { orig(); try { const L = menuLayout(); if (L.save) { ctx.save(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; sealText('存档', L.save.x, L.save.y, L.save.w, L.save.h, false); ctx.restore(); } } catch (e) {} })(drawMenu);   // 补画前重置画笔（前面留下的半透明会让按钮看着像不能点）
  }

  // ---------------- 标题画面：有存档就先问「继续 / 重新开始」 ----------------
  // main() 在 index.html 内联脚本里早于本文件就跑了，直接包装 titleScreen 来不及；
  // 所以标题里留了 GX_CONTINUE 钩子，由这里实现：返回 true = 已读档（标题挂起），false = 重新开始（照常进章节选择）。
  const titleBg = () => {
    const now = performance.now() / 1000;
    if (typeof has === 'function' && has('title_art')) { const z = 1.04 + Math.sin(now * .15) * .02; ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); drawImageFit(IMG.title_art, -W / 2, -H / 2, W, H); ctx.restore(); }
    else { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#060a1e'); g.addColorStop(1, '#1b2a4a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    const gg = ctx.createLinearGradient(0, 0, W * .6, 0); gg.addColorStop(0, 'rgba(5,8,25,.55)'); gg.addColorStop(1, 'rgba(5,8,25,0)'); ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.textAlign = 'center'; ctx.font = `150px ${BRUSH}`; textOutline('孤星问道', W * .3, 250, '#ffe08a', '#2a0f00', 10);
    ctx.font = `600 30px ${FONT}`; ctx.fillStyle = '#e8dcc0'; ctx.fillText('卷一 · 九曜剑典', W * .3, 320); ctx.restore();
  };
  window.GX_CONTINUE = async function () {
    if (!anySave()) return false;
    S.scene = titleBg;
    const i = await choose('孤星问道 · 卷一', ['继续游戏', '重新开始']);
    if (i !== 0) return false;
    const ne = SLOTS.filter(readSlot); let s = ne[0];
    if (ne.length > 1) { const j = await choose('读取哪个存档？', ne.map(META).concat(['返回'])); if (j == null || j >= ne.length) return window.GX_CONTINUE(); s = ne[j]; }
    try { await fadeOut(400); } catch (e) {}
    loadGame(s); return true;
  };

  // R168 标题「前尘再续」：列出有内容的存档（地点 · 修为 · 时间）挑一个读；返回 true = 已读档
  window.GX_PICKLOAD = async function () {
    const ne = SLOTS.filter(readSlot); if (!ne.length) return false;
    const j = await choose('前尘再续 · 选择存档', ne.map(META).concat(['返回']));
    if (j == null || j >= ne.length) return false;
    try { playSnd('ui_confirm'); } catch (e) {}
    try { await fadeOut(400); } catch (e) {}
    loadGame(ne[j]); return true;
  };

  // 自由走动时每 20 秒滚动自动存档（最近进度），外加原有的升级 / 领悟后 saveGame()
  setInterval(() => { try { if (safeNow()) window.saveGame(); } catch (e) {} }, 20000);
})();
