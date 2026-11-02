// 地图缩放测试（作者 11-02）：人物大小不变，整张地图按比例缩小，让一屏能看到完整的建筑（参照青阳镇的比例）。
// 测试面板「地图缩放」：给当前所在的地图挑一个比例，记在本机；正式定下来以后写进 MAP_ZOOM。
(function () {
  let T = {}; try { T = JSON.parse(localStorage.getItem('zoomTest') || '{}') || {}; } catch (e) {}
  window.ZOOM_TEST = T;
  const save = () => { try { localStorage.setItem('zoomTest', JSON.stringify(T)); } catch (e) {} };
  const LV = [1, .85, .75, .65, .55];
  (function addBtn(n) {
    const pan = document.getElementById('dbgPanel'); if (!pan) { if ((n || 0) < 40) setTimeout(() => addBtn((n || 0) + 1), 500); return; }
    const h = document.createElement('h4'); const row = document.createElement('div'); row.className = 'row';
    const tag = document.createElement('span'); tag.className = 'tag';
    const lab = () => { const m = (typeof world !== 'undefined' && world.mapName) || ''; const nm = m && TMAPS[m] ? (TMAPS[m].title || m) : '（不在地图上）';
      h.textContent = '地图缩放 · ' + nm; h.appendChild(tag); tag.textContent = '人物大小不变，地图整体缩小';
      const cur = (m && (T[m] || MAP_ZOOM[m])) || 1; for (const b of row.children) b.className = Math.abs(+b.dataset.z - cur) < .001 ? 'on' : ''; };
    for (const z of LV) { const b = document.createElement('button'); b.dataset.z = z; b.textContent = Math.round(z * 100) + '%' + (z === 1 ? '（原样）' : '');
      b.onclick = () => { const m = world.mapName; if (!m) return; if (z === 1 && !MAP_ZOOM[m]) delete T[m]; else T[m] = z; save(); lab(); world.cam = null; pan.hidden = true;
        try { toast((TMAPS[m].title || m) + ' 地图缩放 ' + Math.round(z * 100) + '%', 1600); } catch (e) {} };
      row.appendChild(b); }
    const put = () => { if (!pan.contains(row)) { lab(); pan.prepend(h, row); } else lab(); };
    put(); new MutationObserver(() => { if (!pan.contains(row)) put(); }).observe(pan, { childList: true });
  })();
})();
