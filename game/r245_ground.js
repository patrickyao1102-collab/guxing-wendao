// ================= R245 · 天剑宗集市地面纹样（作者 11-13：原先的地板别动，在上面加图案）=================
// Codex 画的透明纹样贴花（六家店徽、南入口双剑、长桥桥心云剑、主路流云），已经合进一张和原地面一样大的图里；这里只把地面换成这张。
// 建筑、栏杆、碰撞一概不动。只进测试版。
(function () {
  if (typeof IMG === 'undefined') return;
  const im = new Image();
  const put = () => { const g = window.R80_GROUND; if (!im.naturalWidth || !g || g._r245) return;
    if (g.getContext) { if (g.width !== im.naturalWidth || g.height !== im.naturalHeight) return; g.getContext('2d').drawImage(im, 0, 0); g._r245 = 1; }   // 已经是画布：直接画进去，不另开一张大画布
    else { if (im._r245) return; im._r245 = 1; window.R80_GROUND = im; IMG.cx2g_tj_market = im; }
    try { if (window.MM_CLEAR) MM_CLEAR('tj_market'); } catch (e) {} };
  im.onload = put; im.src = 'r245/ground.webp';
  setInterval(() => { try { const g = window.R80_GROUND; if (g && g.getContext && !g._r245 && im._r245) g._r245 = 1; put(); } catch (e) {} }, 500);
})();
