// ================= R167 · 人物比例统一（作者 11-08：主角团比别人小很多）=================
// 实测（同一缩放下、人物本体像素高度）：叶孤星 99 · 云霆 97 · 林雪 89 · 林逸 99；
// 而青阳镇路人 / 守卫、天剑宗弟子这类通用 NPC 是 112~127 —— 比主角团高出 15%~25%。
// 以主角团（青阳镇里作者走着舒服的那个大小）为基准：每个 NPC 第一次出现时量一下它本体画出来多高，
// 比主角高的（>99）就缩回到 ~100~106（高个子守卫仍然略高一点，保留身形差别）；本来就和主角差不多或更矮（小孩、侍女）的不动。
// 不动：主角、队友、剧情主要角色（w_ / b_ 开头、正式行走帧的人）、地图上的怪。
(function () {
  if (typeof drawActorT !== 'function' || typeof frameInner !== 'function') return;
  const REF = 99, KEEP = .25;
  const isMain = a => {
    if (!a || a === world.player || a.follower || (world.followers || []).includes(a) || a.mob || a.fire) return true;
    const k = a.key || '';
    if (/^(w_|b_)/.test(k) || k === 'n_linyi' || k === 'w_xingxuan') return true;
    if (typeof WALK_FINAL !== 'undefined' && WALK_FINAL[k]) return true;
    if (typeof WALK_ALIAS !== 'undefined' && WALK_ALIAS[k]) return true;
    return false;
  };
  const kOf = a => (a && !isMain(a) && a._r167k) || 1;
  window.R167_K_OF = kOf;   // 头顶名字 / 任务标记跟着落下来
  let raw = null;
  drawActorT = (o => { raw = o; return function (a, now) {
    const k = kOf(a); if (k === 1) return o.apply(this, arguments);
    ctx.save(); ctx.translate(a.x, a.y); ctx.scale(k, k); ctx.translate(-a.x, -a.y);
    try { return o.apply(this, arguments); } finally { ctx.restore(); }
  }; })(drawActorT);

  // 量身高：不在画面上画——把这个人这一帧要画的贴图（drawImage）记下来，到离屏小画布里找贴图最上面不透明的那一行，换算成脚底以上多高
  const TOPC = new WeakMap(), pc = document.createElement('canvas'), pg = pc.getContext('2d', { willReadFrequently: true });
  function opaqueTop(img, sx, sy, sw, sh) {
    let m = TOPC.get(img); if (!m) TOPC.set(img, m = new Map());
    const key = sx + ',' + sy + ',' + sw + ',' + sh; if (m.has(key)) return m.get(key);
    const w = Math.max(1, Math.min(256, Math.round(sw))), h = Math.max(1, Math.min(384, Math.round(sh)));
    pc.width = w; pc.height = h; pg.clearRect(0, 0, w, h); pg.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    const d = pg.getImageData(0, 0, w, h).data; let t = -1;
    outer: for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 60) { t = y / h; break outer; }
    m.set(key, t); return t;
  }
  function probe(a) {
    const rec = [], ox = a.x, oy = a.y, mv = a.moving;
    ctx.save();
    ctx.drawImage = function (img, ...g) { rec.push([img, g, ctx.getTransform()]); };
    try { a.x = 0; a.y = 0; a.moving = false; ctx.setTransform(1, 0, 0, 1, 0, 0); raw(a, performance.now() / 1000); }
    catch (e) {} finally { delete ctx.drawImage; a.x = ox; a.y = oy; a.moving = mv; ctx.restore(); }
    let top = 0, any = false, bad = false;
    for (const [img, g, M] of rec) {
      if (!img || !(img.naturalWidth || img.width)) { bad = true; continue; }
      if (img.complete === false) { bad = true; continue; }
      const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
      let sx = 0, sy = 0, sw = iw, sh = ih, dx, dy, dw, dh;
      if (g.length >= 8) [sx, sy, sw, sh, dx, dy, dw, dh] = g; else if (g.length >= 4) [dx, dy, dw, dh] = g; else { [dx, dy] = g; dw = iw; dh = ih; }
      if (dh < 40) continue;                              // 小图标 / 光点不算身高
      let t; try { t = opaqueTop(img, sx, sy, sw, sh); } catch (e) { continue; }
      if (t < 0) continue;
      const yy = dy + dh * t, y1 = M.b * (dx + dw / 2) + M.d * yy + M.f, y2 = M.d < 0 ? M.b * (dx + dw / 2) + M.d * (dy + dh * (1 - t)) + M.f : y1;
      const y = Math.min(y1, y2); if (!any || y < top) top = y; any = true;
    }
    if (bad && !any) return 0;                            // 图还没载好：下次再量
    if (!any) return (a._r167n = (a._r167n || 0) + 1) > 90 ? 1 : 0;   // 还没画出贴图（图没载好时是占位小人）：过会儿再量，一直没有就不动
    const nat = -top;
    return nat > REF ? (REF + (nat - REF) * KEEP) / nat : 1;
  }
  window.R167_PROBE = probe;
  frameInner = (o => function () {
    const r = o.apply(this, arguments);
    try {
      if (world && world.map && world.map.tile && world.actors && !battle) {
        let n = 0;
        for (const a of world.actors) { if (n >= 4) break; if (a.hidden || a._r167k || isMain(a)) continue; const k = probe(a); n++; if (k) a._r167k = k; }
      }
    } catch (e) {}
    return r;
  })(frameInner);
})();
