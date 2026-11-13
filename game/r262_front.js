// ================= R262 · 守门的人正面站（作者 11-13：「守卫、看大门的人，都正面朝外站，像在守门，有威势」）=================
// 作者 11-13 晚上又问「要正面的还是斜着的」——Codex R262 v2 早就交了正面的两种人，一直没接进来，这里接上：
//   玄天城 · 天剑宗据点大门两位「守门弟子」：正面拄剑（剑连鞘竖在身前，双手按剑柄）；
//   青阳镇 · 林府仪门两位「林府门房」：正面站，双手交叠垂在腹前。
// 每人 6 帧待机（轻呼吸，衣摆微动，脚和头不动），每帧 240ms；左右两人共用一张图、不镜像，呼吸错开半拍。只进测试版。
(function () {
  if (typeof TMAPS === 'undefined' || typeof IMG === 'undefined') return;
  const SET = [
    { k: 'sect_guard', map: 'xt_city', name: '守门弟子' },
    { k: 'lin_gatekeeper', map: 'qy_town', name: '林府门房' },
  ];
  const FR = {};
  for (const s of SET) { const im = new Image(); im.onload = () => { const a = []; for (let i = 0; i < 6; i++) { const c = document.createElement('canvas'); c.width = 256; c.height = 488; c.getContext('2d').drawImage(im, i * 256, 0, 256, 488, 0, 0, 256, 488); a.push(c); } FR[s.k] = a; }; im.src = 'r262/' + s.k + '_idle6.webp'; }
  // 每个人一把钥匙（相位不同）；图没到之前还画原来的样子
  const keyOf = (s, i) => 'r262_' + s.k + '_' + i;
  const def = (s, i, fallback) => { const key = keyOf(s, i); if (Object.getOwnPropertyDescriptor(IMG, key)) return key;
    try { Object.defineProperty(IMG, key, { configurable: true, enumerable: true, set: () => {},
      get: () => { const a = FR[s.k]; if (!a) return fallback ? IMG[fallback] : undefined; return a[(Math.floor(performance.now() / 240) + i * 3) % 6]; } }); } catch (e) { return null; }
    return key; };
  // 帧画布 488 高、头顶空 8px：人要和原来一样高，整帧就画高一点
  const H = h => Math.round((h || 116) * 488 / 480);
  const fix = (n, s, i) => { if (!n || n._r262) return; const fb = n.key && n.key !== 'none' ? n.key : null; const key = def(s, i, fb); if (!key) return;
    n._r262 = 1; n._r262h = n.h; n.key = key; delete n.cx; delete n.ws; n.flip = false; n.mirror = false; n.face = 'down'; n.sidePose = false; n.h = H(n.h); };
  const patchDefs = () => { for (const s of SET) { const T = TMAPS[s.map]; if (!T || !T.npcs) continue; let i = 0;
    for (const n of T.npcs) if (n.name === s.name && !n.hidden && !n.wander) fix(n, s, i++); } };
  // 已经站在眼前的人（进图时从定义复制出来的）也换掉
  const patchActors = () => { try { if (typeof world === 'undefined' || !world.actors) return;
    for (const s of SET) { if (world.mapName !== s.map) continue; let i = 0;
      for (const a of world.actors) { const n = a.npc; if (!n || n.name !== s.name || a.hidden || n.wander) continue;
        fix(n, s, i); const key = keyOf(s, i++); if (a.key !== key) { a.key = key; a.h = n.h; a.dir = 1; delete a.cx; } } } } catch (e) {} };
  patchDefs(); setTimeout(patchDefs, 0); setInterval(() => { patchDefs(); patchActors(); }, 500);
  window.R262F = { patchDefs, patchActors, ready: () => Object.keys(FR) };
})();
