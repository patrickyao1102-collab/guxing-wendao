// ================= R249 · 天剑集市地面整张重铺（作者 11-13：原来的地砖没质感，像厕所瓷砖、线条也不对；贴花方案否了 → 整张重铺，浅暖白玉）=================
// Codex 八个分区原尺寸出图再拼：大小不一的错缝大石板、顺路长板甬道、席纹收边；六家店门前各有一块石质浅浮雕店徽。
// 只换地面这一层（5120×4480，原点不变），草地、湖、土路、台阶、建筑、栏杆、影子都还是原来的。只进测试版。
(function () {
  if (!window.R80_ON || typeof IMG === 'undefined') return;
  const im = new Image();
  im.onload = () => { const put = () => { if (!window.R80_GROUND || !window.R80_GROUND.width) return setTimeout(put, 200);   // 等原地面先到位（它到了以后会把 IMG 槽占住），再整张换掉
      const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); c._r91 = 1; c._r249 = 1;
      window.R80_GROUND = c; IMG.cx2g_tj_market = c; try { if (window.MM_CLEAR) MM_CLEAR('tj_market'); } catch (e) {} };
    put(); };
  im.src = 'r249/ground.webp'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(im); } catch (e) {}
  // 原地面晚到的话会把槽抢回去：盯着，抢了就再换回来
  setInterval(() => { const g = window.R80_GROUND; if (g && !g._r249 && im.complete && im.width) { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); c._r91 = 1; c._r249 = 1; window.R80_GROUND = c; IMG.cx2g_tj_market = c; try { if (window.MM_CLEAR) MM_CLEAR('tj_market'); } catch (e) {} } }, 1000);
})();
