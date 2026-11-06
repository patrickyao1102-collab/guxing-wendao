// ================= 作者 11-07：剧情对话时人物朝向跟着剧情走 =================
// 1) 剧本里写 p.face = 'up' 之类时，叶孤星的八向图还停在之前走路的斜向（face8），看起来朝向不对 → 停着时 face 一变，face8 跟着改成同一方向。
// 2) 对话时：谁说话，叶孤星就转向谁；说话的人（星旋 / 云霆 / 林雪 / 洛尘 / 神乐 / NPC）转向叶孤星。叶孤星自己说话时，转向上一个跟他说话、还在旁边的人。
//    人在走路、或剧本把人藏起来时不动；离得太远（> 700）不转。测试面板可关。
(function () {
  if (typeof say !== 'function' || typeof walkFinalDraw !== 'function') return;
  let on = true; try { on = localStorage.getItem('dlgface') !== '0'; } catch (e) {}
  const KEY = { 星旋: ['w_xingxuan'], 云霆: ['w_yunting', 'b_yunting'], 林雪: ['w_linxue', 'b_linxue'], 洛尘: ['w_luochen'], 神乐: ['w_shenle'], 叶擎苍: ['w_father'] };
  const base = who => String(who || '').split('·')[0].replace(/（.*$/, '').trim();
  const onMap = () => typeof S !== 'undefined' && S.scene === drawMap && world && world.map && world.player;
  function actorOf(name) {
    if (!name) return null; const p = world.player;
    if (name === '叶孤星') return p;
    const ks = KEY[name], acts = world.actors || [];
    let a = acts.find(a => !a.hidden && ks && ks.includes(a.key)) || acts.find(a => !a.hidden && a !== p && ((a.npc && a.npc.name === name) || a.name === name));
    if (!a && name === '星旋' && world.mapName === 'tj_houshan') {   // 后山开场：星旋是地图物件（玉佩上方的小人），不是 actor
      const T = world.map.T, o = T && (T.objs || []).find(o => o.id === 'xingxuan'); if (o && S.flags && S.flags.hs_meet) a = { x: o.ax, y: o.ay, _obj: 1 };
    }
    return a || null;
  }
  const DIAG = { 'down,left': 'down_left', 'down,right': 'down_right', 'up,left': 'up_left', 'up,right': 'up_right' };
  function faceTo(a, t) {
    if (!a || !t || a._obj || a.hidden || a.moving) return;
    const dx = t.x - a.x, dy = t.y - a.y; if (Math.hypot(dx, dy) < 8 || Math.hypot(dx, dy) > 700) return;
    const f = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
    a.face = f; if (Math.abs(dx) > 4) a.dir = dx < 0 ? -1 : 1;
    const ang = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);   // 和水平线夹角在 25°~65° 之间才算斜向
    const diag = ang > 25 && ang < 155 && Math.abs(Math.abs(ang - 90) - 45) < 20;
    a.face8 = diag ? DIAG[(dy < 0 ? 'up' : 'down') + ',' + (dx < 0 ? 'left' : 'right')] : f;
    a._dlgF = a.face;
  }
  let last = null;
  say = (o => function (who, text) {
    try {
      if (on && who && onMap()) {
        const n = base(who), p = world.player, sp = actorOf(n);
        if (sp && sp !== p) { faceTo(p, sp); faceTo(sp, p); last = n; }
        else if (sp === p && last) { const l = actorOf(last); if (l && l !== p) { faceTo(p, l); faceTo(l, p); } }
      }
    } catch (e) {}
    return o.apply(this, arguments);
  })(say);
  // 换地图就清掉「上一个说话的人」
  if (typeof tileSetMap === 'function') tileSetMap = (o => function () { last = null; return o.apply(this, arguments); })(tileSetMap);

  // 剧本改了 face（人停着）→ 八向朝向跟上
  walkFinalDraw = (o => function (a) {
    try { if (a && a.face) { if (!a.moving && a._lf !== undefined && a._lf !== a.face && a._dlgF !== a.face && a.face8 && a.face8 !== a.face) a.face8 = a.face; a._lf = a.face; a._dlgF = null; } } catch (e) {}
    return o.apply(this, arguments);
  })(walkFinalDraw);

  (function addBtn(n) {
    const pan = document.getElementById('dbgPanel'); if (!pan) { if ((n || 0) < 40) setTimeout(() => addBtn((n || 0) + 1), 500); return; }
    const h = document.createElement('h4'); h.textContent = '剧情对话 · 自动转向'; const row = document.createElement('div'); row.className = 'row';
    const b = document.createElement('button'); const lab = () => { b.textContent = on ? '对话时人物转向说话的人：开 · 点一下关' : '对话自动转向：关 · 点一下开'; }; lab();
    b.onclick = () => { on = !on; try { localStorage.setItem('dlgface', on ? '1' : '0'); } catch (e) {} lab(); pan.hidden = true; };
    row.appendChild(b); const put = () => { if (!pan.contains(row)) { lab(); pan.prepend(h, row); } };
    put(); new MutationObserver(put).observe(pan, { childList: true });
  })();
  window.DLG_FACE = { get on() { return on; }, set(v) { on = !!v; } };
})();

