// ================= R263 · 叶孤星居室：床后那扇三扇大窗会开会关（作者 11-13）=================
// 作者：「把后面那个靠床的三个大窗设计成可以打开可以关的样子吧，即便有床作为遮挡」「不要撑杆的，就是推开、拉回来那种」。
//   白天：两边两扇往外推开（中间一扇不动），窗外是屋后的竹林、天光、远山，竹叶轻轻摇；
//   黄昏：还开着，窗外橙金色的天，竹子成了暖色的剪影；
//   夜里：拉回关上，窗纸被月光照得微微发蓝白。
//   夜 → 早：两扇窗往外推开（0.78 秒）；黄昏 → 夜：拉回关上。进屋时直接是当时的样子，不放动画。
//   白天 / 黄昏有一层从窗口斜照进来的光（越过床顶落在床上和床前地上），夜里没有。
// 素材：Codex R263 v2（2 倍图；1 倍坐标 x100 y27，340×193，整块盖在墙上那扇窗的位置；床照旧画在它前面）。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.tj_room || typeof tileAmbientHigh !== 'function') return;
  const B = TMAPS.tj_room.baked; if (!B || !B.objs) return;
  const X = 100, Y = 27, W1 = 340, H1 = 193, W2 = 680, H2 = 386;
  const FR = { day: [], dusk: [], night: [], open: [], openDusk: [] };
  const cut = (k, f, n) => { const im = new Image(); im.onload = () => { const out = []; for (let i = 0; i < n; i++) { const c = document.createElement('canvas'); c.width = W2; c.height = H2; c.getContext('2d').drawImage(im, i * W2, 0, W2, H2, 0, 0, W2, H2); out.push(c); } FR[k] = out; }; im.src = 'r263/' + f + '.webp'; };
  cut('day', 'window_day_6', 6); cut('dusk', 'window_dusk_6', 6); cut('night', 'window_night', 1); cut('open', 'window_open_6', 6); cut('openDusk', 'window_open_dusk_6', 6);
  const LI = {}; for (const k of ['day', 'dusk']) { const im = new Image(); im.onload = () => { LI[k] = im; }; im.src = 'r263/light_' + k + '.webp'; }
  const LR = { day: [110, 60, 350, 350], dusk: [110, 60, 440, 400] };

  // 现在该是哪种样子：青竹的五时辰优先（卯 / 午 → 开，酉 → 黄昏，戌 / 子 → 关），没开时辰就看全局昼夜
  const F = () => S.flags || {};
  const want = () => { const s = F().qz_shi; if (s) return s === '酉' ? 'dusk' : (s === '戌' || s === '子') ? 'night' : 'day';
    let t = ''; try { t = window.TOD ? TOD() : (F().res_tod || ''); } catch (e) {}
    return t === 'night' || t === 'midnight' ? 'night' : (t === 'dusk' || t === 'evening') ? 'dusk' : 'day'; };

  const DUR = [120, 120, 120, 120, 120, 180], TOT = 780;
  let cur = null, anim = null, loop0 = 0, lastMap = '';
  const tick = now => {
    const here = world.mapName === 'tj_room', w = want();
    if (!here) { lastMap = world.mapName; cur = w; anim = null; return; }
    if (lastMap !== 'tj_room') { lastMap = 'tj_room'; cur = w; anim = null; loop0 = now; return; }   // 刚进屋：直接是当时的样子
    if (anim) { if (now - anim.t0 >= TOT) { cur = anim.to; anim = null; loop0 = now; } return; }
    if (w === cur) return;
    if (S.fade) return;   // 换时辰时屏幕正黑着：等亮起来再推窗 / 关窗，让人看得见
    if (cur === 'night') anim = { k: w === 'dusk' ? 'openDusk' : 'open', dir: 1, t0: now, to: w };
    else if (w === 'night') anim = { k: cur === 'dusk' ? 'openDusk' : 'open', dir: -1, t0: now, to: w };
    else { cur = w; loop0 = now; }   // 白天 ↔ 黄昏：窗一直开着，直接换窗外的天
  };
  const frame = now => {
    if (anim) { const f = FR[anim.k]; if (f.length === 6) { const el = now - anim.t0; let i = 0, acc = DUR[0]; while (i < 5 && el >= acc) acc += DUR[++i]; return f[anim.dir > 0 ? i : 5 - i]; } }
    const f = FR[cur === 'dusk' ? 'dusk' : cur === 'night' ? 'night' : 'day']; if (!f.length) return null;
    return f.length === 1 ? f[0] : f[Math.floor((now - loop0) / 200) % 6];
  };
  // 光：开窗时跟着亮起来，关窗时跟着暗下去
  const light = now => { if (anim) { const p = Math.min(1, (now - anim.t0) / TOT), k = anim.k === 'openDusk' ? 'dusk' : 'day'; return [k, anim.dir > 0 ? p : 1 - p]; } return cur === 'night' || !cur ? null : [cur, 1]; };

  // 墙上那块窗：插在北墙后面、床前面（墙 sy -10，床 361）
  const blank = document.createElement('canvas'); blank.width = 2; blank.height = 2;
  try { Object.defineProperty(IMG, 'r263_win', { configurable: true, enumerable: true, set: () => {}, get: () => frame(performance.now()) || blank }); } catch (e) { return; }
  const wi = B.objs.findIndex(o => o.id === 'bedroom_wall_hd_r28');
  B.objs.splice(wi >= 0 ? wi + 1 : 0, 0, { id: 'r263_window', uid: 'r263_window', img: 'r263_win', x: X, y: Y, w: W1, h: H1, sy: -9, ax: X + W1 / 2, ay: -9, flat: false, flip: false, noBlock: true, noPre: true });

  tileAmbientHigh = (orig => function (T, cam, now) {
    orig(T, cam, now);
    try { const t = performance.now(); tick(t); if (world.mapName !== 'tj_room' || window.R263_OFF) return;
      const L = light(t); if (!L || L[1] <= 0) return; const im = LI[L[0]], r = LR[L[0]]; if (!im) return;
      ctx.save(); ctx.globalAlpha = L[1]; ctx.drawImage(im, r[0], r[1], r[2], r[3]); ctx.restore();
    } catch (e) {}
  })(tileAmbientHigh);
  window.R263W = { want, state: () => ({ cur, anim: anim && { k: anim.k, dir: anim.dir } }) };
})();
