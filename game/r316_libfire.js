// ================= R316 · 第一章夜入藏经阁：先找火折子点灯（主线里第一次教玩家「走近冒小手、点开翻找」）=================
// 作者 11-16：「主线早期安排一个类似支线这样用手去探索的东西，大家就知道了，然后引导一下玩家」
// 「藏经阁里面太黑了，需要火折子点，然后去找一下；找来之后藏经阁就亮起来了，后面就正常了」
// 「后面长老来的时候，星旋就直接把所有灯都吹灭了，火折直接吹灭了」「随便找个建筑里面放个火折子就好了」。
// 流程：上到二层 → 一片漆黑，只看得清身边一圈 → 星旋：「黑成这样你打算摸着找？」→ 提示「走近书架柜子，冒出小手就点开翻」
//       → 翻青铜经柜 / 云纹博古架 / 阅经桌（空的）、竹简架（最下层压着火折子）→ 去点灯 → 一盏点着，满层灯一盏接一盏亮起来
//       → 接原来的：星旋指出转轮经藏 → 取剑典 → 「有脚步声！」→ 星旋一口气把火折子和满屋的灯全吹灭 → 张长老摸黑进来。只进测试版。
(function () {
  const T = typeof TMAPS !== 'undefined' && TMAPS.tj_forbidden; if (!T || typeof say !== 'function') return;
  const F = () => (S.flags = S.flags || {});
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const B = T.baked;
  const here = () => world.mapName === 'tj_forbidden' && !!F().lib_ch1;
  const st = () => F().lib_fire || 0;   // 0 黑着 · 1 找到火折子 · 2 灯都亮了 · 3 被星旋吹灭
  const free = (x, y) => { if (!B) return true; const c = Math.floor(x / B.cs), r = Math.floor(y / B.cs); return c >= 0 && r >= 0 && c < B.cols && r < B.rows && B.blocked.charCodeAt(r * B.cols + c) === 48; };
  const near = (x, y) => { for (let d = 0; d < 260; d += 8) for (let a = 0; a < 16; a++) { const px = x + Math.cos(a * Math.PI / 8) * d, py = y + Math.abs(Math.sin(a * Math.PI / 8)) * d; if (free(px, py) && free(px - 14, py) && free(px + 14, py)) return [Math.round(px), Math.round(py)]; } return [x, y]; };
  const L = async arr => { for (const [w, t] of arr) await say(w, t); };
  let lit = null;   // 等「灯点着了」

  // ---------- 能翻的四处（画面里的东西直接点；走近了头顶冒小手） ----------
  const SPOTS = [
    { name: '青铜经柜', rect: [64, 798, 289, 1068], hand: [176, 860], empty: ['青铜经柜的柜门半掩着，里面一卷卷经书码得齐齐整整。……没有火折子。'] },
    { name: '云纹博古架', rect: [1435, 807, 1669, 1068], hand: [1552, 860], empty: ['博古架上摆着瓷瓶、铜镜、几方古砚。叶孤星挨个摸过去，指尖只沾了一层灰。'] },
    { name: '阅经桌', rect: [450, 1067, 708, 1163], hand: [579, 1080], empty: ['阅经桌上摊着一卷没合上的经，镇纸压着一角。抽屉里只有半截墨锭。'] },
    { name: '竹简架', rect: [1514, 502, 1643, 778], hand: [1578, 560], fire: true },
  ];
  const tip = () => { try { toast('走近书架、柜子，头顶冒出小手就点一下，翻翻看', 3600); } catch (e) {} };
  for (const s of SPOTS) {
    const [x, y] = near((s.rect[0] + s.rect[2]) / 2, s.rect[3] + 16); const [c, r] = P(x, y); s.at = [x, y];
    (T.npcs = T.npcs || []).push({ key: 'none', c, r, name: s.name, hidden: true, h: 110, tapRect: s.rect, r316: 1, talk: async () => {
      if (!here()) return say('', s.empty ? s.empty[0] : '竹简架上一卷卷竹简，最下层空着一格。');
      if (st() >= 1) return say('', s.fire ? '竹简架最下层空了一格——火折子就是从这儿拿的。' : s.empty[0]);
      if (!s.fire) { await say('', s.empty[0]); const f = F(); f.lib_fire_n = (f.lib_fire_n || 0) + 1; if (f.lib_fire_n === 1) await say('星旋', '（接着翻。守阁的弟子总不能摸黑巡阁。）'); return; }
      F().lib_fire = 1; try { playSnd('ui_confirm'); } catch (e) {}
      await say('', '竹简架最下一层，一卷竹简后面压着一只竹筒——拔开盖子，里头是一截火折子。');
      await showPanel('获得道具', ['!火折子', '守阁弟子巡夜用的，一吹就着']);
      await L([['星旋', '有火了！快把灯点上——石台边、台阶口那几盏都行。'], ['叶孤星', '（点一盏……就一盏。动静小一点。）']]);
      S.quest = '点灯：走到一盏灯旁边，点一下'; try { toast('走到一盏灯旁边，冒出小手就点一下', 2600); } catch (e) {} } });
  }
  // ---------- 六盏灯：有了火折子才点得着；点一盏，满层跟着亮 ----------
  const LAMPS = (B ? B.objs : []).filter(o => /r135_lamp/.test(o.img || '')).map(o => ({ x: o.x + o.w / 2, y: o.y + 36, foot: o.y + o.h, rect: [o.x - 10, o.y, o.x + o.w + 10, o.y + o.h + 6] }));
  let glow = 0, gt0 = 0;   // 点灯那一下：灯一盏接一盏亮（glow = 已亮几盏）
  for (const l of LAMPS) { const [x, y] = near(l.x, l.foot + 14); const [c, r] = P(x, y); l.at = [x, y];
    T.npcs.push({ key: 'none', c, r, name: '灯', hidden: true, h: 110, tapRect: l.rect, r316: 1, talk: async () => {
      if (!here() || st() === 2) return say('', '灯火安安静静地烧着。');
      if (st() === 0) return say('', '一盏落地灯，灯芯是凉的。……得先找个火。');
      if (st() === 3) return say('', '灯芯还冒着一缕青烟。');
      world.locked = true; try { sfx('chime'); } catch (e) {}
      await say('', '叶孤星晃亮火折子，凑到灯芯上。火苗一舔，灯亮了。');
      gt0 = performance.now(); glow = 1; F().lib_fire = 2;
      await new Promise(r => setTimeout(r, 1400));
      await L([['星旋', '本器灵借你一缕火引——'], ['', '一点火星从玉佩里飞出去，一盏，两盏，三盏……整层典藏一盏接一盏亮了起来。'], ['叶孤星·惊', '……原来二层是这个样子。']]);
      S.quest = ''; if (lit) { const r = lit; lit = null; r(); } } });
  }

  // ---------- 黑：整层盖一层夜色，只留身边一圈（点着的灯也照亮一圈） ----------
  let off = null;
  const DARK = () => { const s = st(); return here() && (s === 0 || s === 1 || s === 3); };
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (orig => function (TT, cam, now) { let r; const LXo = window.LIBFX, dk = DARK() && LXo && LXo.ready;   // 黑着的时候，原来那层夜里的灯光晕先不画（灯芯是凉的）
    if (dk) LXo.ready = false; try { r = orig.apply(this, arguments); } finally { if (dk) LXo.ready = true; }
    try { if (world.mapName !== 'tj_forbidden' || !F().lib_ch1) return r; const p = world.player, mw = TT.mw || 1728, mh = TT.mh || 1296, K = 4;
      // 点灯那一下：从黑慢慢褪掉
      let a = DARK() ? .86 : 0; if (st() === 2 && gt0) { const k = (performance.now() - gt0) / 2600; a = Math.max(0, .86 * (1 - k)); }
      if (a > 0.01) {
        if (!off) { off = document.createElement('canvas'); off.width = Math.ceil(mw / K); off.height = Math.ceil(mh / K); }
        const g = off.getContext('2d'); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, off.width, off.height); g.fillStyle = 'rgba(4,6,16,' + (a * .93) + ')'; g.fillRect(0, 0, off.width, off.height);
        g.globalCompositeOperation = 'destination-out';
        const hole = (x, y, rad, k) => { const gr = g.createRadialGradient(x / K, y / K, 0, x / K, y / K, rad / K); gr.addColorStop(0, 'rgba(0,0,0,' + k + ')'); gr.addColorStop(.6, 'rgba(0,0,0,' + k * .6 + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x / K, y / K, rad / K, 0, 7); g.fill(); };
        if (p) hole(p.x, p.y - 50, st() === 1 ? 250 : 200, 1);   // 身边一圈（拿着火折子亮一点）
        if (st() === 2) { const n = Math.min(LAMPS.length, Math.floor((performance.now() - gt0) / 260) + 1); for (let i = 0; i < n; i++) hole(LAMPS[i].x, LAMPS[i].y + 40, 320, 1); }
        ctx.drawImage(off, 0, 0, mw, mh);
      }
      // 走近了冒小手（和别处能翻的东西一个样子）
      if (here() && st() <= 1 && p) { const t = performance.now() / 1000, list = st() === 0 ? SPOTS.map(s => [s.hand, s.at]) : LAMPS.map(l => [[l.x, l.y - 30], l.at]);
        for (const [h, at] of list) { if (Math.hypot(at[0] - p.x, at[1] - p.y) > 175) continue; const x = h[0], y = h[1] + Math.sin(t * 3 + x * .01) * 3;
          ctx.save(); ctx.fillStyle = 'rgba(40,26,10,.85)'; ctx.strokeStyle = '#e8c878'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 15, 0, 7); ctx.fill(); ctx.stroke();
          ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffe9b0'; ctx.fillText('☝', x, y + 1); ctx.restore(); } }
    } catch (e) {} return r; })(tileAmbientHigh);

  // 灯芯是凉的：黑着的时候，落地灯的灯焰光晕不画
  const hookFX = () => { const FX = window.ForbFX; if (!FX || FX._r316) return; FX._r316 = 1; const oa = FX.afterObj;
    FX.afterObj = function (c, o) { if (o && o.id === 'o_r135_lamp' && DARK()) return; return oa.apply(this, arguments); }; };
  hookFX(); setTimeout(hookFX, 3000);
  // 夜里那层「压暗之后把灯盏重新点亮」也先不点（index.html tileDraw 夜色那段按 CXB2 里的灯画光）
  if (typeof tileDraw === 'function') tileDraw = (orig => function () {
    if (!DARK() || typeof CXB2 === 'undefined' || !CXB2.tj_forbidden) return orig.apply(this, arguments);
    const B0 = CXB2.tj_forbidden, LXo = window.LIBFX, rd = LXo && LXo.ready;
    CXB2.tj_forbidden = Object.assign({}, B0, { objs: B0.objs.filter(o => !/lamp|lotus|lantern|candle/.test(o.id || '')) }); if (rd) LXo.ready = false;
    try { return orig.apply(this, arguments); } finally { CXB2.tj_forbidden = B0; if (rd) LXo.ready = true; } })(tileDraw);
  // ---------- 接进原来的剧情：星旋指经藏之前先找火；长老来的时候吹灭 ----------
  const sv = say;
  say = function (who, text) {
    try {
      if (who === '星旋' && typeof text === 'string' && text.indexOf('别东张西望了。看见左边那座转着的经藏') === 0 && here() && st() !== 2) {
        return (async () => {
          await sv('星旋', '……先别急着找书。黑成这样，你打算摸着找？');
          await sv('叶孤星', '守阁的弟子夜里巡阁，会在这层留一个火折子。我找找。');
          await sv('星旋', '那就翻！书架、柜子、桌案——走近了，看着像能翻的就翻。');
          S.quest = '找火折子：走近书架、柜子，冒出小手就点开翻'; tip(); world.locked = false;
          await new Promise(r => { lit = r; });
          world.locked = true;
          return sv('星旋', '亮了就好找了。看见左边那座转着的经藏没有？系着青玉扣的那一卷——就是九曜剑典的残本。');
        })();
      }
      if (who === '叶孤星' && text === '不好，有脚步声！' && here() && st() === 2) {
        return (async () => {
          await sv(who, text);
          await sv('星旋', '灯！灯！——呼！');
          F().lib_fire = 3; gt0 = 0; try { S.flash = .25; S.flashColor = '#000'; sfx('whoosh'); } catch (e) {}
          await sv('', '一阵风从玉佩里卷出去，火折子连同满层的灯一齐灭了。二层又黑了下来。');
        })();
      }
      if (who === '张长老' && typeof text === 'string' && text.indexOf('奇怪，刚才明明察觉到禁制有异动') === 0 && here() && st() === 3) text = '奇怪，刚才明明察觉到禁制有异动……灯怎么全灭了？';
    } catch (e) {}
    return sv.apply(this, [who, text].concat([].slice.call(arguments, 2)));
  };
  // 每回从头夜入藏经阁，火都要重新找
  const oSet = tileSetMap;
  tileSetMap = function (name) { try { if (name === 'tj_library' && F().lib_ch1 && !world.mapName.startsWith('tj_forbidden')) { delete F().lib_fire; delete F().lib_fire_n; glow = 0; gt0 = 0; } } catch (e) {} return oSet.apply(this, arguments); };
  // 点画面里的东西就算点到（同 R315）
  if (typeof pickInteract === 'function' && !window._r315pick) { window._r315pick = 1;
    pickInteract = (o => function (wx, wy) { try { let best = null, ba = 1e12; for (const a of world.actors || []) { const r = a.npc && a.npc.tapRect; if (r && wx >= r[0] && wx <= r[2] && wy >= r[1] && wy <= r[3]) { const ar = (r[2] - r[0]) * (r[3] - r[1]); if (ar < ba) { ba = ar; best = a; } } } if (best) return { type: 'npc', a: best }; } catch (e) {} return o.apply(this, arguments); })(pickInteract); }
})();
