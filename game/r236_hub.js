// ================= R236 · 护城灵枢的光效（作者 11-12：灵枢可以加动效和光效，夜晚散发出光芒护住城池）=================
// 白天：灵石一呼一吸地发光，几粒光点绕着它转，隔几秒荡开一圈很淡的涟漪。
// 夜晚：灵石大亮，一道光柱冲天；光点从灵枢飘向十盏灵灯；一圈一圈很柔的光晕从灵枢荡向全城；城的外沿罩着一层淡淡的光幕。（第二版：去掉了所有硬线条，只留柔光。）
// 全是画在地图上的光（不改图、不挡路、不影响点击）。只进测试版。Codex 的转动帧到了再把浑天仪换成会转的。
(function () {
  if (typeof tileAmbientHigh !== 'function' || typeof TMAPS === 'undefined' || !TMAPS.xt_city) return;
  const HX = 2240, HY = 1575, R_CITY = 2350;
  const LAMPS = (TMAPS.xt_city.baked.objs || []).filter(o => o.id === 'xt_spirit_lamp_r18').map(o => [o.ax, o.ay - 215]);
  const night = () => { try { const f = S.flags || {}; return f.res_tod === 'night' || !!f.auc_night || window.R236_FORCE === 'night'; } catch (e) { return false; } };
  const glow = (x, y, r, c0, c1) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  tileAmbientHigh = (orig => function (T, cam, now) {
    orig(T, cam, now);
    try { if (world.mapName !== 'xt_city' || window.R236_OFF) return;
      const N = night(), z = (typeof VZ === 'function' ? VZ() : 1), vw = W / z, vh = H / z, cx = cam.x + vw / 2, cy = cam.y + vh / 2, far = Math.hypot(cx - HX, cy - HY), see = far < Math.hypot(vw, vh) / 2 + 420;
      const br = .5 + .5 * Math.sin(now * 1.6);   // 呼吸
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      if (see) {
        glow(HX, HY, N ? 260 : 120, `rgba(150,255,225,${(N ? .50 : .22) + .12 * br})`, 'rgba(120,230,255,0)');
        glow(HX, HY, N ? 54 : 44, `rgba(255,255,240,${(N ? .50 : .40) + .15 * br})`, 'rgba(200,255,240,0)');
        for (let i = 0; i < (N ? 9 : 5); i++) { const a = now * (.5 + i * .06) + i * 2.1, rx = 92 + i * 9, ry = 34 + i * 3, x = HX + Math.cos(a) * rx, y = HY + Math.sin(a) * ry - 6 * Math.sin(now * 2 + i); glow(x, y, N ? 11 : 8, `rgba(210,255,240,${N ? .9 : .6})`, 'rgba(160,240,255,0)'); }
        if (N) { const g = ctx.createLinearGradient(HX, HY, HX, HY - 900); g.addColorStop(0, `rgba(190,255,235,${.42 + .1 * br})`); g.addColorStop(.5, 'rgba(150,230,255,.16)'); g.addColorStop(1, 'rgba(150,230,255,0)'); ctx.fillStyle = g; for (const [w0, al] of [[58, .22], [36, .32], [18, .46]]) { ctx.globalAlpha = al; ctx.beginPath(); ctx.moveTo(HX - w0, HY); ctx.lineTo(HX + w0, HY); ctx.lineTo(HX + w0 * 2.4, HY - 900); ctx.lineTo(HX - w0 * 2.4, HY - 900); ctx.fill(); } ctx.globalAlpha = 1; }
      }
      // 柔光带：不画硬线，用几层很淡的宽笔叠出一圈「晕」（作者 11-12：光的线条感太重）
      const band = (r, al, w) => { for (const [k, a] of [[1, .28], [.55, .34], [.22, .38]]) { ctx.lineWidth = w * k; ctx.strokeStyle = `rgba(165,245,235,${al * a})`; ctx.beginPath(); ctx.ellipse(HX, HY + 150, r, r * .62, 0, 0, 7); ctx.stroke(); } };
      // 荡开的光波：白天小而淡，夜里一直荡到城墙
      const per = N ? 9 : 6, maxR = N ? R_CITY : 280;
      for (let k = 0; k < (N ? 2 : 1); k++) { const p = ((now / per) + k / 2) % 1, r = 40 + p * maxR, al = (N ? .30 : .16) * (1 - p) * (1 - p);
        if (Math.abs(far - r) > Math.hypot(vw, vh) / 2 + 120 && far > r) continue; band(r, al, N ? 70 + 90 * p : 46); }
      if (N) {
        // 九灯拱一枢：不拉线，只有几粒光点从灵枢飘向每盏灯，后面拖一小段淡尾
        LAMPS.forEach(([lx, ly], i) => { const mx = (HX + lx) / 2, my = Math.min(HY, ly) - 260 - 30 * Math.sin(now * .7 + i);
          for (let q = 0; q < 5; q++) { const t = ((now * .16 + i * .37) % 1) - q * .022; if (t < 0) continue; const u = 1 - t, x = u * u * HX + 2 * u * t * mx + t * t * lx, y = u * u * HY + 2 * u * t * my + t * t * ly;
            if (Math.abs(x - cx) < vw / 2 + 40 && Math.abs(y - cy) < vh / 2 + 40) glow(x, y, 13 - q * 1.8, `rgba(225,255,245,${.8 - q * .15})`, 'rgba(160,240,255,0)'); }
          if (Math.abs(lx - cx) < vw / 2 + 160 && Math.abs(ly - cy) < vh / 2 + 160) glow(lx, ly, 130, `rgba(170,250,230,${.26 + .07 * Math.sin(now * 2 + i)})`, 'rgba(150,230,255,0)'); });
        // 城外沿的光幕：一圈很宽、很淡的晕，没有线
        band(R_CITY + 60, .16 + .05 * br, 150);
      }
      ctx.restore();
      if (N) { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(120,235,225,.10)'; ctx.fillRect(cam.x, cam.y, vw, vh); ctx.restore(); }   // 整座城笼着一层极淡的灵光
    } catch (e) {}
  })(tileAmbientHigh);
  window.R236 = { night };
})();
