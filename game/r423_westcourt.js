// ================= R423 · 青竹小院西院：换上 Codex R417 重画的地面和花圃（只进测试版）=================
// 作者 11-27 夜：「青竹小院左边新扩建那个地图好糊啊，无论是草地还有花都好糊……整个人感觉比例都没有之前好了。」
// Codex R417 照原布局把西院地面按两倍重画（缩回 1664×1792 用），三种花圃重画、都比原来小三成（花圃图留两倍，手机上清楚）。
// 正式版的 r136_west.js 不动：这里只在测试版把图换掉、把花圃摆小，花圃原来那一大块挡路改成新花台底下那一小块。
(function () {
  if (window.GX_RELEASE || !window.R136W_ON || typeof IMG === 'undefined' || typeof TMAPS === 'undefined' || !TMAPS.qingzhu_court) return;
  const COURT = 'qingzhu_court', OX = 1664;
  // 换图：西院地面这个名字以后不管谁来设，取出来的都是新图（新图没载好之前先给旧图）
  const NEW = {}, IMS = []; const ld = (k, src) => { const im = new Image(); im.onload = () => { NEW[k] = im; }; im.src = src; IMS.push(im); };
  const bump = () => { try { if (window.IMG_GUARD && IMG_GUARD.bump) for (const im of IMS) IMG_GUARD.bump(im); } catch (e) {} };
  ld('ground', 'r417/ground.webp?v=1'); for (const b of ['bed_mixed', 'bed_peony', 'bed_flowers_long']) ld(b, 'r417/' + b + '.webp?v=1');
  try { let old = IMG.r136w_ground; Object.defineProperty(IMG, 'r136w_ground', { configurable: true, enumerable: true, set(v) { old = v; }, get() { return NEW.ground || old; } }); } catch (e) {}
  for (const b of ['bed_mixed', 'bed_peony', 'bed_flowers_long']) try { Object.defineProperty(IMG, 'r417_' + b, { configurable: true, enumerable: true, get() { return NEW[b]; } }); } catch (e) {}
  // 花圃：[原 id, 新图, 新 x, 新 y, 宽, 高, 原来那块挡路(图上看得见的那一块)]——脚下中线对齐原来的花台
  const BEDS = [['r136w_garden_1', 'bed_mixed', 532, 558, 222, 104, [483, 511, 803, 662]], ['r136w_garden_2', 'bed_peony', 1111, 564, 224, 98, [1063, 515, 1383, 662]],
    ['r136w_garden_3', 'bed_flowers_long', 1300, 891, 211, 92, [1250, 844, 1561, 983]], ['r136w_garden_4', 'bed_flowers_long', 1300, 1166, 211, 92, [1250, 1119, 1561, 1258]]];
  tileSetMap = (orig => function (m) { if (m === COURT) bump(); const res = orig.apply(this, arguments);
    try { if (m === COURT && world.map && world.map.T) { const T = world.map.T, cs = T.cs, c0 = T.c0 || 0;
      for (const [id, img, x, y, w, h, R] of BEDS) { const o = (T.objs || []).find(o => o.id === id); if (!o) continue;
        Object.assign(o, { img: 'r417_' + img, ik: null, x: x - OX, y, w, h, sy: y + h - 6, r: null });
        if (!T.block) continue; const inNew = (wx, wy) => wx >= x + 10 && wx <= x + w - 10 && wy >= y + h * .45 && wy <= y + h - 4;
        for (let wy = R[1]; wy <= R[3]; wy += cs) for (let wx = R[0]; wx <= R[2]; wx += cs) { const r = Math.floor(wy / cs), c = Math.floor((wx - OX) / cs) - c0; if (!T.block[r] || c < 0 || c >= T.block[r].length) continue; T.block[r][c] = inNew(wx + cs / 2, wy + cs / 2) ? 1 : 0; } } } } catch (e) { console.warn('R423', e); }
    return res; })(tileSetMap);
})();
