// ================= R397 · 测试面板：11-27 白天新加的东西各给一个直达按钮（只进测试版）=================
(function addBtn(n) { const pan = document.getElementById('dbgPanel'); if (!pan || !window.R389 || !window.R394 || !window.R392) { if ((n || 0) < 60) setTimeout(() => addBtn((n || 0) + 1), 500); return; }
  const F = () => (S.flags = S.flags || {}), h = document.createElement('h4'); h.textContent = '11-27 白天新加 · 五行 / 落星坡 / 装备面板 / 剑炉 / 三铺新内景'; const row = document.createElement('div'); row.className = 'row';
  const ready = () => { try { dialog = null; choice = null; sysPanel = null; } catch (e) {} S.scene = drawMap; S.started = true; S.hud = true; S.fade = 0; world.locked = false; };
  const go = m => { const st = TMAPS[m].start; tileSetMap(m, st[0], st[1], 'up'); ready(); };
  const sword = () => { try { const w = S.hero.equip && S.hero.equip.weapon; if (!w || w === 'w_wood') { addItem('w_hanxing', 1); equipItem('w_hanxing'); try { if (sysPanel && sysPanel.eqp) sysPanel = null; } catch (e) {} } } catch (e) {} };
  const mk = (t, fn) => { const b = document.createElement('button'); b.textContent = t; b.onclick = () => { pan.hidden = true; try { fn(); } catch (e) { console.warn('R397 test', e); } }; row.appendChild(b); };
  mk('去落星坡（没剑的话先给寒星剑）', () => { F().hs_explored = 1; F().hs_chest = 1; sword(); go('tj_luoxing'); });
  mk('去后山崖顶东口（看去落星坡的传送阵）', () => { F().hs_explored = 1; F().hs_chest = 1; sword(); tileSetMap('tj_houshan', 1470 / 64 - .5, 990 / 64 - .8, 'right'); ready(); });
  mk('打开装备面板（平时点左上角头像）', () => { if (!world.map) go('tj_luoxing'); setTimeout(() => R389.open('hero'), 300); });
  mk('去云海大亭找铸剑师（剑炉）', () => { const [c, r] = [700 / 64 - .5, 1010 / 64 - .8]; tileSetMap('qingzhu_upper_pavilion', c, r, 'up'); ready(); });
  mk('直接打开剑炉', () => { if (!world.map) go('tj_luoxing'); setTimeout(() => R394.open(), 300); });
  mk('五行之精各 8 枚 + 2000 灵石（试炉用）', () => { for (const el of WX5.ORDER) addItem('m_wx_' + el, 8); S.hero.gold = (S.hero.gold || 0) + 2000; toast('五行之精和灵石到手', 1800); });
  mk('打开玉佩（任务 / 宝库）', () => { if (!world.map) go('tj_luoxing'); F().xlw_seen = 1; setTimeout(() => R386.open(), 300); });
  mk('星辰点 +200（试宝库用）', () => { S.hero.points = (S.hero.points || 0) + 200; toast('星辰点 ' + S.hero.points, 1600); });
  mk('云霆、林雪入队（看八折和套装）', () => { joinParty('yunting'); joinParty('linxue'); toast('云霆、林雪入队：点左上角头像看各人的装备', 2400); });
  mk('去锦云坊（新内景）', () => go('xt_chengyi')); mk('去裁月记（新内景）', () => go('xt_caifeng')); mk('去点绛铺（新内景）', () => go('xt_yanzhi'));
  const put = () => { if (!pan.contains(row)) pan.prepend(h, row); }; put(); new MutationObserver(put).observe(pan, { childList: true });
})();
