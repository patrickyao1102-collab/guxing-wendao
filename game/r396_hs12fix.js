// ================= R396 · 修：后山崖顶的松树、石头被「切掉一截又放大」（只进测试版）=================
// 11-27 做落星坡时对着 Codex 的原画才看出来：后山崖顶（游戏的第一张图）上每一棵松树、每一块石头、每一盏灯，
// 都只画出了左上角的 74%，再被放大到整件的位置上——所以松树比原画大三成半，右边和下边被齐齐切掉（大松树最明显，石头的右沿是一条直线）。
// 原因：遮挡件图集是按原尺寸存的，切图那一步却用了「整张后山缩到 0.74」之后的尺寸去切。这个毛病从后山缩比例那天起就在。
// 这里把每一件按图集里的原尺寸重新切一遍（画的时候引擎会缩进 0.74 的框里，和 Codex 的原画一致）。碰撞格本来就是按原画算的，不用动。
// 主程序 index.html 没改，正式版不受影响；作者看过没问题，再把这一处并进主程序。
(function () {
  if (typeof IMG === 'undefined' || !window.HS12 || !Array.isArray(HS12.occ) || !window.HS12_ON) return;
  const D = HS12.occ; let atlas = null, done = false;
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  function fix() { if (!atlas) return false; let n = 0;
    for (let i = 0; i < D.length; i++) { const w = D[i][2], h = D[i][3], cur = IMG['hs12o_' + i]; if (cur && cur.__full) continue; if (!cur) return false;   // 原来那一步还没切完，等它
      const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(atlas, D[i][5], D[i][6], w, h, 0, 0, w, h); c.__full = 1; IMG['hs12o_' + i] = c; n++; }
    done = true; return true; }
  const im = new Image(); im.onload = () => { atlas = im; if (fix()) return; let k = 0; const t = setInterval(() => { if (fix() || ++k > 600) clearInterval(t); }, 100); };
  im.src = LOC ? 'hs12/occ.webp' : '/_blob/66123bfe62028528ab9952eb418bbe70';
  if (typeof tileSetMap === 'function') tileSetMap = (orig => function (name) { const r = orig.apply(this, arguments); if (name === 'tj_houshan' && !done) try { fix(); } catch (e) {} return r; })(tileSetMap);
  // 载入画面等这一步做完再揭开（最多多等 6 秒），免得进图头一瞬看到被切的松树
  { const o = window.MAP_EXTRA_READY, t0 = {}; window.MAP_EXTRA_READY = n => { let a = 1; try { a = o ? o(n) : 1; } catch (e) {} if (a == null) a = 1; if (n !== 'tj_houshan' || done) return a; t0.t = t0.t || performance.now(); try { fix(); } catch (e) {} return done || performance.now() - t0.t > 6000 ? a : Math.min(a, .9); }; }
  window.R396 = { get done() { return done; } };
})();
