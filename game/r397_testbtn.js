// ================= R397 · 测试面板：11-27 白天新加的东西各给一个直达按钮（只进测试版）=================
(function addBtn(n) { const pan = document.getElementById('dbgPanel'); if (!pan || !window.R389 || !window.R394 || !window.R392 || (!window.R399 && (n || 0) < 16)) { if ((n || 0) < 60) setTimeout(() => addBtn((n || 0) + 1), 500); return; }
  const F = () => (S.flags = S.flags || {}), h = document.createElement('h4'); h.textContent = '11-27 白天新加 · 五行 / 落星坡 / 装备面板 / 剑炉（合成 · 强化 · 镶嵌 · 精炼）/ 三铺新内景 / 两只头目'; const row = document.createElement('div'); row.className = 'row';
  const ready = () => { try { dialog = null; choice = null; sysPanel = null; } catch (e) {} S.scene = drawMap; S.started = true; S.hud = true; S.fade = 0; world.locked = false; };
  const go = m => { const st = TMAPS[m].start; tileSetMap(m, st[0], st[1], 'up'); ready(); };
  const sword = () => { try { const w = S.hero.equip && S.hero.equip.weapon; if (!w || w === 'w_wood') { addItem('w_hanxing', 1); equipItem('w_hanxing'); try { if (sysPanel && sysPanel.eqp) sysPanel = null; } catch (e) {} } } catch (e) {} };
  const mk = (t, fn) => { const b = document.createElement('button'); b.textContent = t; b.onclick = () => { pan.hidden = true; try { fn(); } catch (e) { console.warn('R397 test', e); } }; row.appendChild(b); };
  mk('去落星坡（没剑的话先给寒星剑）', () => { F().hs_explored = 1; F().hs_chest = 1; sword(); go('tj_luoxing'); });
  mk('去后山崖顶东口（看去落星坡的传送阵）', () => { F().hs_explored = 1; F().hs_chest = 1; sword(); tileSetMap('tj_houshan', 1470 / 64 - .5, 990 / 64 - .8, 'right'); ready(); });
  mk('打开装备面板（平时点左上角头像）', () => { if (!world.map) go('tj_luoxing'); setTimeout(() => R389.open('hero'), 300); });
  mk('去云海大亭找铸剑师（剑炉）', () => { const [c, r] = [700 / 64 - .5, 1010 / 64 - .8]; tileSetMap('qingzhu_upper_pavilion', c, r, 'up'); ready(); });
  mk('直接打开剑炉', () => { if (!world.map) go('tj_luoxing'); setTimeout(() => R394.open(), 300); });
  mk('一批合成材料 + 3000 灵石（试炉用，含三样珍稀料）', () => { const give = { m_fang: 8, m_tooth: 6, m_horn: 4, m_thorn: 6, m_yanjing: 6, m_gupian: 1, m_hide: 8, m_yingpi: 5, m_silk: 6, m_wing: 5, m_shike: 5, m_xingjing: 2, m_songxin: 2, m_tiejia: 2 };
    for (const k in give) if (ITEM_DB[k]) addItem(k, give[k]); for (const el of WX5.ORDER) addItem('m_wx_' + el, 8); S.hero.gold = (S.hero.gold || 0) + 3000; toast('材料和灵石到手：去剑炉试试', 2000); });
  mk('打开玉佩（任务 / 宝库）', () => { if (!world.map) go('tj_luoxing'); F().xlw_seen = 1; setTimeout(() => R386.open(), 300); });
  mk('星辰点 +200（试宝库用）', () => { S.hero.points = (S.hero.points || 0) + 200; toast('星辰点 ' + S.hero.points, 1600); });
  mk('云霆、林雪入队（看八折和套装）', () => { joinParty('yunting'); joinParty('linxue'); toast('云霆、林雪入队：点左上角头像看各人的装备', 2400); });
  // R399 两只头目：十级、带云霆和星痕剑去看 / 直接打
  const duo = lv => { window.R395_SKIP = 1; try { let g = 0; while (S.hero.lv < lv && g++ < 400) gainExp(expNeed(S.hero.lv)); S.hero.learnQ = []; } catch (e) {} window.R395_SKIP = 0; joinParty('yunting'); try { if (!S.hero.bag.w_xinghen && S.hero.equip.weapon !== 'w_xinghen' && S.hero.equip.weapon !== 'w_xinghen2') { addItem('w_xinghen', 1); equipItem('w_xinghen'); } const o = WX5.XH(); o.pick = 1; } catch (e) {} try { partyRest(); } catch (e) {} Object.assign(F(), { hs_explored: 1, hs_chest: 1, xlw_seen: 1, r370_tut0: 1 }); try { dialog = null; choice = null; sysPanel = null; } catch (e) {} };
  if (window.R399) {
  mk('去松风林道看头目「老松魈」（十级 · 带云霆）', () => { duo(10); F().ch2_depart = 1; const y = R399.BY.songxiao; tileSetMap(y.map, (y.pos[0] - 10) / 64 - .5, (y.pos[1] - 330) / 64 - .8, 'down'); ready(); });
  mk('去山外树林看头目「铁鳞穿山甲」（十一级 · 带云霆）', () => { duo(11); Object.assign(F(), { ch2_depart: 1, ch2_forest: 1, ch2_linyi: 1, r399_csj: 1 }); const y = R399.BY.chuanshanjia; tileSetMap(y.map, (y.pos[0] + 330) / 64 - .5, (y.pos[1] + 20) / 64 - .8, 'left'); ready(); });
  mk('直接打老松魈', () => { duo(10); if (!world.map) go('tj_luoxing'); ready(); setTimeout(() => R370_FIGHT('songxiao'), 300); });
  mk('直接打铁鳞穿山甲', () => { duo(11); if (!world.map) go('tj_luoxing'); ready(); setTimeout(() => R370_FIGHT('chuanshanjia'), 300); });
  }
  mk('去锦云坊（新内景）', () => go('xt_chengyi')); mk('去裁月记（新内景）', () => go('xt_caifeng')); mk('去点绛铺（新内景）', () => go('xt_yanzhi'));
  // R402 新商店：直接开几家店看；切回旧的青瓷窗柜比着看
  const shopOf = name => { for (const k in TMAPS) for (const n of (TMAPS[k].npcs || [])) if (n && n.shop && n.name === name) return n.shop; return null; };
  const openS = (ids, who) => { if (!world.map) go('tj_luoxing'); ready(); setTimeout(async () => { window.__r336ShopOk = 1; try { await openShop(ids, who); } finally { window.__r336ShopOk = 0; } }, 300); };
  mk('开店：玄兵阁（新商店界面）', () => { S.hero.gold = Math.max(S.hero.gold || 0, 2000); openS(R370_STOCK.xuanbing, '玄兵阁掌柜'); });
  mk('开店：丹霞堂', () => { S.hero.gold = Math.max(S.hero.gold || 0, 2000); openS(shopOf('丹霞堂伙计') || ['p_small', 'p_big', 'p_mp'], '丹霞堂伙计'); });
  mk('开店：锦云坊', () => { S.hero.gold = Math.max(S.hero.gold || 0, 2000); openS(R370_STOCK.chengyi, '云娘'); });
  mk('商店界面：新版 ↔ 旧版（青瓷窗柜）', () => { const f = F(); f.r402_old = f.r402_old ? 0 : 1; toast(f.r402_old ? '商店换回旧版（青瓷窗柜）' : '商店用新版', 2000); });
  const put = () => { if (!pan.contains(row)) pan.prepend(h, row); }; put(); new MutationObserver(put).observe(pan, { childList: true });
})();
