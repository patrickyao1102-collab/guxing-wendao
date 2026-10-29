// ================= 背景音乐整理（作者自己下载的曲子）=================
// 以前全游戏只有 4 首合成配乐，地图上永远是同一首「山门」。现在按场景分：
//   标题：仙剑赋（伴奏）　宗门（青竹小院、演武广场、藏经阁…）：枫林　城镇（青阳镇、玄天城、林府…）：喜悦
//   城镇街市（青阳镇大街、玄天城街市）：江南庙会（即梦）　城里的店铺 / 客栈 / 茶楼 / 万宝楼 / 藏经阁：喜悦（即梦）　林府、城主府仍用原来的喜悦
//   野外 / 后山 / 有兽火的地图：古箫吟风曲（雨声氛围）　普通战斗：武侠快打（即梦，只截了高潮段，约 82 秒循环）　首领战：景天
// 曲子按需下载（进到对应场景才下），不拖慢开局。
(function () {
  if (typeof playBgm !== 'function' || typeof AUD === 'undefined') return;
  // 2026-10-29 即梦新曲（bgm29_*）：标题曲换成「星河遥」（不再用仙剑赋），演武广场（tj_front）用恢弘的「宗风」。
  // 候选曲都接进来了，测试面板「即梦配乐」可以试听、一键换标题曲 / 广场曲（记在本机 localStorage）。
  // 2026-10-29 作者：带人声的即梦歌曲（星河遥、星夜吟、星夜孤行、云空遥、云间行、清光升原版、夜径星铃、月夜离箫）全部删掉，只留纯音乐
  const J29 = { bgm29_zongfeng: '宗风', bgm29_zongfeng2: '宗风·二' };
  // 所有代码合成的程序音全部换成即梦音效库（作者：不要再出现"叮"的程序音）
  const SDEF = { ui_text: 'lib_u0', ui_click: 'lib_u1', ui_open: 'lib_u2', ui_confirm: 'lib_s00',
    sfx_swing: 'lib_s01', sfx_hurt: 'lib_s02', sfx_star: 'lib_s03', sfx_buff: 'lib_s04', sfx_wind: 'lib_s05', sfx_ice: 'lib_s06', sfx_thunder: 'lib_s07',
    sfx_heal: 'lib_s08', sfx_ult: 'lib_s09', sfx_boom: 'lib_s10', sfx_beam: 'lib_s11', sfx_charge: 'lib_s12', sfx_crit: 'lib_s13', sfx_hit: 'lib_s14', sfx_sword_ring: 'lib_s15',
    sfx_claw: 'lib_s14', sfx_rock: 'lib_s10', sfx_vine: 'lib_s05' };
  let PICK = {}; try { PICK = JSON.parse(localStorage.getItem('bgm29_pick') || '{}') || {}; } catch (e) {}
  const DEF = { title: 'bgm_title_xianjianfu', plaza: 'bgm29_zongfeng', sect: 'bgm_sect_fenglin', town: 'bgm_town_xiyue', houshan: 'bgm_explore_guxiao', wild: 'bgm_explore_guxiao', battle: 'bgm_battle_kuaida', boss: 'bgm_boss_jingtian', fair: 'bgm_town_miaohui', shop: 'bgm_town_jiyue', xtcity: 'lib_qgs_inst', qingzhu: 'lib_qgs_inst' };
  const T = {}; for (const k in DEF) T[k] = (PICK[k] && (J29[PICK[k]] || (window.BGM_LIB && BGM_LIB.tracks[PICK[k]]) || /^bgm_/.test(PICK[k]))) ? PICK[k] : DEF[k];
  const NEW = new Set([...Object.values(T), ...Object.keys(J29), ...Object.keys((window.BGM_LIB && BGM_LIB.tracks) || {})]);
  try { BGM_LIST.splice(0); } catch (e) {}   // 旧的 4 首合成配乐不再预先下载解码
  // 长曲子不能整首解码进内存（一首 4 分钟解码后近 90MB，手机会崩）：用 <audio> 边下边放，接到配乐音量上
  // 曲子放在作品的素材库里（发布包已经快满 256MB）；本地测试时读 audio/ 下的 mp3
  const BLOB = { bgm_title_xianjianfu: '9019a6180152835b9d446df91eb1fe27', bgm_sect_fenglin: 'c905771d1a22ad50ba95ad828e293f1f', bgm_town_xiyue: '8f0ac82253a0b932a9d5c5e9a2105b73',
    bgm_explore_guxiao: '44e975707583ff3300c5bb30d2940f24', bgm_battle_jianwu: '84bbc6ba581ebc8535b72b36f3272951', bgm_boss_jingtian: 'd5328d56d4a91eec068c7c380e9dea50',
    bgm_town_miaohui: 'd89a9e8a47114a32ae65deb5a3a86a4b', bgm_town_jiyue: 'd4d8ac63f5df23fc32e6baab71bc17d1',
    bgm_battle_kuaida: '6dd1ac264189708b6f5e88fbdb7b2af0',
    bgm29_yunkongyao: 'bad4b772e3fd47c715a987772fbcc452', bgm29_yunjianxing: 'e30027f6c93d95d8c50021af0abd41f6', bgm29_zongfeng: 'c0dd6a64b695ed3c1b17b99271824052', bgm29_zongfeng2: '527a45fb2284a8781ff27f6d07921f2f',
    bgm29_xingyeyin: '57dab773847d3e31a5fcbd0f2deb1415', bgm29_xingyeguxing: '9d33e907982dcf1106370f018f1ca311', bgm29_xingheyao: '10c5dfa64dd76ad9aaa16fd49d5f4945', bgm29_qingguangsheng: '5c7b3cc9b20b0d90c4ee81e794ccac44', bgm29_yejingxingling: '92bcc8cb2e3cbab511c811090f0774cb' };
  const LIBT = (window.BGM_LIB && BGM_LIB.tracks) || {};
  for (const k in LIBT) if (LIBT[k].blob) BLOB[k] = LIBT[k].blob;
  // 即梦的曲子响度比旧曲高约 6dB，接进来时压低一点
  const VOL = n => LIBT[n] && LIBT[n].vol != null ? LIBT[n].vol : (/^bgm29_/.test(n) ? .55 : 1);
  const local = (window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:');
  const src = n => local || !BLOB[n] ? (LIBT[n] && LIBT[n].file ? LIBT[n].file : /^bgm29_/.test(n) ? 'bgm29/' + n.slice(6) + '.mp3' : 'audio/' + n + '.mp3') : '/_blob/' + BLOB[n];
  const EL = {}, primed = {};
  function el(n) {
    if (EL[n]) return EL[n];
    const a = new Audio(src(n)); a.loop = true; a.preload = 'auto'; a.crossOrigin = 'anonymous';
    const o = EL[n] = { a, g: null };
    // 高潮段循环：库里标了 loop:[起,止] 的曲子（战斗 / 首领战），只在高潮段里循环，开打就燃
    const lp = LIBT[n] && LIBT[n].loop;
    if (lp) { o.loop = lp; a.addEventListener('timeupdate', () => { if (a.currentTime >= lp[1] - .05) { try { a.currentTime = lp[0]; } catch (e) {} } }); a.addEventListener('ended', () => { try { a.currentTime = lp[0]; a.play(); } catch (e) {} }); }
    try { if (typeof AC !== 'undefined' && AC && AUD.musicGain) { const src = AC.createMediaElementSource(a); o.g = AC.createGain(); o.g.gain.value = 0; src.connect(o.g); o.g.connect(AUD.musicGain); } } catch (e) { o.g = null; }
    return o;
  }
  // 第一次点屏幕时把几首曲子“解锁”（iOS 只允许在点击里第一次播放）
  window.addEventListener('pointerdown', () => { if (!AUD.mode) return; for (const n of NEW) { if (primed[n]) continue; primed[n] = 1; const o = el(n); if (AUD.bgm && AUD.bgm.a === o.a) continue; const v = o.a.volume; o.a.muted = true; o.a.play().then(() => { if (!(AUD.bgm && AUD.bgm.a === o.a)) o.a.pause(); o.a.muted = false; o.a.volume = v; }).catch(() => { o.a.muted = false; }); } }, { capture: true });
  function playNew(k, force) {
    AUD.want = k; if (!AUD.mode) return;
    if (AUD.bgmName === k && !force && AUD.bgm) return;
    stopBgm(.8); AUD.bgmName = k; if (AUD.muted) return;
    const o = el(k), a = o.a; a.volume = o.g ? 1 : 0; try { a.currentTime = o.loop ? o.loop[0] : 0; } catch (e) {}
    a.play().catch(() => {});
    if (o.g) { const t = AC.currentTime; o.g.gain.cancelScheduledValues(t); o.g.gain.setValueAtTime(0, t); o.g.gain.linearRampToValueAtTime(VOL(k), t + 1.2); }
    else { const t0 = performance.now(), id = setInterval(() => { const k2 = Math.min(1, (performance.now() - t0) / 1200); a.volume = .45 * VOL(k) * k2; if (k2 >= 1) clearInterval(id); }, 50); }
    AUD.bgm = { a };
  }
  const WILD = /^(lin_forest|hf_|yy_|ly_|seal_field|tj_houshan|mijing|qy_outer|qy_wild|qy_shelter|xt_wild)/;
  const TOWN = /^(qy_|xt_|lin_|bl_|market|jishi)/;
  const FAIR = /^(qy_town|xt_city|tj_market|market|jishi)/;
  const SHOP = /^(qy_(inn|tea|tavern|smith|herb|grocery|treasure|house)|xt_(inn|teahouse|apothecary|wanbao|auction)|lin_teahouse|tj_scripture|tj_library|tj_forbidden)/;
  function mapKind() {
    const m = (typeof world !== 'undefined' && world.mapName) || '', def = world && world.map && world.map.def;
    if (m === 'tj_front') return 'plaza';   // 演武广场：恢弘大气的宗风
    if (m === 'tj_houshan') return 'houshan';
    if (/^xt_city/.test(m)) return 'xtcity';   // 玄天城：清光升·纯乐
    if (/^qingzhu_/.test(m)) return 'qingzhu';   // 青竹小院：清光升·纯乐   // 后山：夜径星铃（古琴、箫、风铃，幽静带点紧张）
    if (WILD.test(m) || (def && def.mobs)) return 'wild';
    if (FAIR.test(m)) return 'fair';
    if (SHOP.test(m)) return 'shop';
    if (TOWN.test(m)) return 'town';
    return 'sect';
  }
  const prev = playBgm;
  let bossNow = false;
  playBgm = function (n, force) {
    let k = n;
    if (n === 'bgm_title') k = T.title;
    else if (n === 'bgm_battle') k = T.battle;
    else if (n === 'bgm_boss') k = T.boss;
    else if (n === 'bgm_shanmen') k = T[mapKind()];
    if (NEW.has(k)) return playNew(k, force);
    return prev.call(this, k, force);
  };
  // 进新地图：等地图换好再按地图类型选曲（原来的挂钩在换图之前就调用了）
  const sync = () => { if (typeof battle !== 'undefined' && battle) return; if (!(world && world.map)) return; const k = T[mapKind()]; if (AUD.bgmName !== k || !AUD.bgm) playBgm(k, !AUD.bgm); };
  // 看门狗：在地图上自由走动时，如果配乐被剧情 / 升级音效 / 战斗结束停掉了没接回来（后山就是这样一直没声），3 秒后自动接回本地图的曲子
  let quiet = 0; setInterval(() => { try { const free = typeof battle !== 'undefined' && !battle && world && world.map && S.scene === drawMap && !world.locked && !dialog && !choice && !(window.CINE_PAUSE);
    if (free && AUD.mode && !AUD.muted && !AUD.bgm) { if (++quiet >= 3) { quiet = 0; sync(); } } else quiet = 0; } catch (e) {} }, 1000);
  if (typeof tileSetMap === 'function') tileSetMap = (orig => function () { const r = orig.apply(this, arguments); setTimeout(sync, 0); return r; })(tileSetMap);
  if (typeof setMap === 'function') setMap = (orig => function () { const r = orig.apply(this, arguments); setTimeout(sync, 0); return r; })(setMap);
  // 首领战：赵师弟 / 寨主 / 带 boss 标记的战斗
  startBattle = (orig => function (cfg) {
    const r = orig.apply(this, arguments);
    try { const boss = cfg && (cfg.boss || /赵|寨主|首领|Boss|boss|城主|魔/.test(cfg.title || '') || (cfg.enemies || []).some(e => /^b_/.test(e.key || ''))); if (boss) playBgm('bgm_boss'); } catch (e) {}
    return r;
  })(startBattle);
  // 测试面板用：试听 / 指定标题曲、广场曲、野外曲
  window.BGM29 = { list: J29, T, DEF, PICK, SDEF, src,
    pick(slot, k) { PICK[slot] = k; save(); if (slot in DEF) { T[slot] = k; NEW.add(k); if (slot === 'title' && (typeof S === 'undefined' || !S.started)) playBgm(k, true); else sync(); } else loadOne(slot); },
    unpick(slot) { delete PICK[slot]; save(); if (slot in DEF) { T[slot] = DEF[slot]; sync(); } else loadOne(slot); },
    reset() { for (const k in PICK) delete PICK[k]; save(); Object.assign(T, DEF); sync(); loadJingles(); },
    audition(k) { playNew(k, true); }, stop() { stopBgm(.3); AUD.bgmName = ''; }, resume() { AUD.bgmName = ''; if (typeof S !== 'undefined' && !S.started) playBgm('bgm_title', true); else sync(); } };
  function save() { try { localStorage.setItem('bgm29_pick', JSON.stringify(PICK)); } catch (e) {} }
  // 升级 / 胜利的小段音效换成即梦曲子的开头（清光升 / 宗风·二），解码成 AudioBuffer 直接顶替原来合成的叮叮叮
  // 配乐库里也可以把任何短曲 / 音效指定给某个音效名（PICK[音效名] = 库 id），同样解码顶替
  const JB = { jingle_levelup: ['47b134f1439be73289590f4806e0f608', 'bgm29/jingle_levelup29.mp3'], jingle_win: ['ad94c9a724fa096da2796ad09120ace9', 'bgm29/jingle_win29.mp3'] };
  const ORIG = {};
  function loadOne(name) {
    if (typeof AC === 'undefined' || !AC || !AUD.buf) return;
    const lib = window.BGM_LIB || { tracks: {}, sfx: {} }; const pk = PICK[name] || SDEF[name]; const L = pk && (lib.sfx[pk] || lib.tracks[pk]);
    let u = null;
    if (L) u = local ? L.file : '/_blob/' + L.blob;
    else if (JB[name]) u = local ? JB[name][1] : '/_blob/' + JB[name][0];
    else { if (ORIG[name]) AUD.buf[name] = ORIG[name]; return; }
    if (!ORIG[name] && AUD.buf[name]) ORIG[name] = AUD.buf[name];
    fetch(u).then(r => r.arrayBuffer()).then(b => AC.decodeAudioData(b)).then(buf => { AUD.buf[name] = buf; if (typeof SFX_VOL !== 'undefined') SFX_VOL[name] = L && L.vol != null ? L.vol : .9; }).catch(() => {});
  }
  function loadJingles() { const names = new Set([...Object.keys(JB), ...Object.keys(SDEF), ...Object.keys(PICK).filter(k => !(k in DEF))]); for (const n of names) loadOne(n); }
  let tries = 0; const jt = setInterval(() => { if (typeof AC !== 'undefined' && AC && AUD.mode === 'webaudio') { clearInterval(jt); loadJingles(); } else if (++tries > 600) clearInterval(jt); }, 500);
})();
// 调试：连点屏幕右上角三下（2 秒内），左下角显示配乐状态
(function () {
  let taps = [], on = /audiodebug/.test(location.hash || '');
  window.addEventListener('pointerdown', e => { if (e.clientX > innerWidth - 50 && e.clientY < 50) { const t = performance.now(); taps = taps.filter(x => t - x < 2000); taps.push(t); if (taps.length >= 3) { on = !on; taps = []; const el = document.getElementById('__ad'); if (el && !on) el.remove(); } } }, { capture: true });
  setInterval(() => { if (!on) return; try {
    const b = AUD.bgm && AUD.bgm.a; let el = document.getElementById('__ad'); if (!el) { el = document.createElement('div'); el.id = '__ad'; el.style.cssText = 'position:fixed;left:4px;bottom:4px;z-index:99999;background:rgba(0,0,0,.75);color:#0f0;font:12px monospace;padding:4px;white-space:pre;pointer-events:none'; document.body.appendChild(el); }
    el.textContent = 'mode=' + AUD.mode + ' ac=' + (typeof AC !== 'undefined' && AC ? AC.state : '-') + ' want=' + AUD.want + ' name=' + AUD.bgmName + '\n' + (b ? ('src=' + b.currentSrc.slice(-60) + '\nready=' + b.readyState + ' paused=' + b.paused + ' t=' + b.currentTime.toFixed(1) + ' dur=' + (b.duration || 0).toFixed(0) + ' err=' + (b.error ? b.error.code : 0) + ' vol=' + b.volume.toFixed(2)) : 'no bgm element');
  } catch (e) {} }, 500);
})();
