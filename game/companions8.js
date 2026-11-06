// ================= 作者 11-07：林雪 / 云霆 / 洛尘 / 神乐 换成 Codex 新画的八向行走（和叶孤星同一套步态）=================
// 每人一张 2016×1200 图集：五行 = 下 / 左下 / 左 / 左上 / 上，第 0 格站立，第 1–8 格行走；右、右下、右上由左侧镜像。
// 格子 224×240，脚底 (112,232)，每帧 160ms，一轮 1.28 秒；转向不重置步子。人物倍率沿用各自在游戏里原来的大小（保留身高差）。
// 朝向按实际移动方向算 8 向；停下时跟着剧情设的 face。测试面板可关掉换回原来的走路图。
(function () {
  if (typeof walkFinalDraw !== 'function') return;
  const DEF = { w_linxue: ['linxue', 95 / 224], w_yunting: ['yunting', 95 / 224], w_luochen: ['luochen', .47], w_shenle: ['shenle', .45] };
  const ALIAS = { b_yunting: 'w_yunting', b_linxue: 'w_linxue' };   // 剧情里用战斗立绘站着的云霆 / 林雪：一走动就用行走图
  const ROW = { down: [0, 0], downleft: [1, 0], left: [2, 0], upleft: [3, 0], up: [4, 0], downright: [1, 1], right: [2, 1], upright: [3, 1] };
  const IM = {}, OK = {};
  for (const k in DEF) { const id = DEF[k][0], im = new Image(); im.onload = () => { OK[id] = 1; }; im.src = 'walk8c/' + id + '.webp'; IM[id] = im; }
  let on = true; try { on = localStorage.getItem('comp8') !== '0'; } catch (e) {}
  const keyOf = a => DEF[a.key] ? a.key : (ALIAS[a.key] && (a.moving || a._c8m) ? ALIAS[a.key] : null);
  const active = a => { if (!on || !a || a.hidden) return null; const k = keyOf(a); return k && OK[DEF[k][0]] ? k : null; };
  const DIRS = ['right', 'downright', 'down', 'downleft', 'left', 'upleft', 'up', 'upright'];

  function draw(a, now) {
    const k = active(a); if (!k) return false;
    const [id, sc] = DEF[k], s = a._c8 || (a._c8 = { dir: a.face === 'up' || a.face === 'left' || a.face === 'right' ? a.face : 'down', px: a.x, py: a.y, t0: 0, mv: false, mt: 0, face: a.face, lt: now });
    const dx = a.x - s.px, dy = a.y - s.py; s.px = a.x; s.py = a.y;
    const ms = performance.now();
    if (a.moving && Math.hypot(dx, dy) > .05) { s.dir = DIRS[(Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8]; s.mt = ms; a._c8m = 1; }
    else if (!a.moving && a.face !== s.face && a.face) { s.dir = a.face === 'up' || a.face === 'left' || a.face === 'right' ? a.face : 'down'; }
    s.face = a.face;
    const mv = !!a.moving || ms - s.mt < 120;   // 路点间一瞬间的停顿不算停下
    if (!mv) a._c8m = 0;
    if (mv && !s.mv) s.t0 = ms; s.mv = mv;
    const f = mv ? 1 + Math.floor((ms - s.t0) / 160) % 8 : 0, r = ROW[s.dir] || ROW.down;
    ctx.save(); ctx.globalAlpha *= a.alpha ?? 1; ctx.translate(a.x, a.y); if (r[1]) ctx.scale(-1, 1);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(IM[id], f * 224, r[0] * 240, 224, 240, -112 * sc, -232 * sc, 224 * sc, 240 * sc);
    ctx.restore(); return true;
  }

  // 林雪 / 云霆：原来走 walkFinalDraw（WalkLab 三向）；洛尘 / 神乐：原来在 NEW_CHAR_SHEET 里走三向图集 —— 开着新八向时让它跳过，落到 walkFinalDraw
  walkFinalDraw = (o => function (a, now) { try { if (draw(a, now)) return true; } catch (e) { console.warn('companions8', e); } return o.apply(this, arguments); })(walkFinalDraw);
  const SHEET = window.NEW_CHAR_SHEET;
  if (SHEET) for (const k of ['w_luochen', 'w_shenle']) { const v = SHEET[k]; if (!v) continue;
    Object.defineProperty(SHEET, k, { configurable: true, enumerable: true, get() { return on && OK[DEF[k][0]] ? undefined : v; } }); }

  (function addBtn(n) {
    const pan = document.getElementById('dbgPanel'); if (!pan) { if ((n || 0) < 40) setTimeout(() => addBtn((n || 0) + 1), 500); return; }
    const h = document.createElement('h4'); h.textContent = '四伙伴 · 新八向行走'; const row = document.createElement('div'); row.className = 'row';
    const b = document.createElement('button'); const lab = () => { b.textContent = on ? '林雪/云霆/洛尘/神乐 新八向：开 · 点一下换回原来的' : '四伙伴新八向：关（原来的走路图）· 点一下开'; }; lab();
    b.onclick = () => { on = !on; try { localStorage.setItem('comp8', on ? '1' : '0'); } catch (e) {} lab(); pan.hidden = true; try { toast(on ? '四伙伴已换成新八向行走' : '四伙伴已换回原来的走路图', 2200); } catch (e) {} };
    row.appendChild(b);
    const put = () => { if (!pan.contains(row)) { lab(); pan.prepend(h, row); } };
    put(); new MutationObserver(put).observe(pan, { childList: true });
  })();
  window.COMP8 = { get on() { return on; }, set(v) { on = !!v; try { localStorage.setItem('comp8', on ? '1' : '0'); } catch (e) {} }, ready: () => Object.keys(OK) };
})();

