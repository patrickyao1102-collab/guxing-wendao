// ================= R336 · 丹霞堂师兄弟的地图小人换成定稿（作者 11-16）（只进测试版）=================
// 作者：「阿澈的那个地图行走帧太丑了，平时的行走帧是个老头啊」。
// 原来：百草轩掌柜（阿澈）用的是通用「采药老头」，丹霞堂掌柜（阿焰）用的是通用男村民。
// 换成 Codex R316 第二步修订 v2 已通过的四向行走：阿澈＝青绿日常袍，阿焰＝红袍；图集 4 行（下 / 上 / 左 / 右）× 4 帧，每格 320×480（@2x），脚点 (160,464)，按一半画，站立约 116px。
// 站着：阿澈用 R316 的日常待机四帧（朝下，轻轻呼吸）；阿焰用行走第 2 帧（最接近站姿）。
// 中秋夜的「厚围巾提笼」那一身另有剧情动作帧，不在这里换。
(function () {
  if (typeof TMAPS === 'undefined' || typeof walkFinalDraw !== 'function') return;
  const WHO = { '百草轩掌柜': 'ache', '丹霞堂掌柜': 'ayan' };
  const SH = {};
  const load = (k, src) => { const im = new Image(); im.onload = () => { SH[k] = im; }; im.src = src; };
  load('ache', 'r336/ache_walk.webp?v=1'); load('ayan', 'r336/ayan_walk.webp?v=1'); load('ache_idle', 'r336/ache_idle.webp?v=1');
  const ROW = { down: 0, up: 1, left: 2, right: 3 };
  const mark = () => { for (const k in TMAPS) for (const n of (TMAPS[k] && TMAPS[k].npcs) || []) if (n && WHO[n.name]) n._r336 = WHO[n.name]; };
  mark();
  if (typeof tileSetMap === 'function') tileSetMap = (o => function () { mark(); return o.apply(this, arguments); })(tileSetMap);
  walkFinalDraw = (o => function (a, now) {
    try {
      const who = a && a.npc && a.npc._r336, im = who && SH[who];
      if (im) {
        let f = a.face || (a.npc && a.npc.face) || 'down';
        if (a.moving && a.tx != null) { const dx = a.tx - a.x, dy = a.ty - a.y; f = Math.abs(dx) > Math.abs(dy) * 1.2 ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
        else if (a.moving && a.dir) f = a.dir < 0 ? 'left' : 'right';
        if (!(f in ROW)) f = 'down';
        const t = now || performance.now() / 1000;
        ctx.save(); ctx.globalAlpha *= a.alpha ?? 1;
        if (!a.moving && f === 'down' && who === 'ache' && SH.ache_idle) {
          const c = Math.floor(t / .32) % 4; ctx.drawImage(SH.ache_idle, c * 320, 0, 320, 480, a.x - 80, a.y - 232, 160, 240);
        } else {
          const c = a.moving ? Math.floor(t / .16) % 4 : 1; ctx.drawImage(im, c * 320, ROW[f] * 480, 320, 480, a.x - 80, a.y - 232, 160, 240);
        }
        ctx.restore(); return true;
      }
    } catch (e) { console.warn('R336', e); }
    return o.apply(this, arguments);
  })(walkFinalDraw);
})();
