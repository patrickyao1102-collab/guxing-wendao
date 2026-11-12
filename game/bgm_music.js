// ================= 背景音乐整理（作者自己下载的曲子）=================
// 以前全游戏只有 4 首合成配乐，地图上永远是同一首「山门」。现在按场景分：
//   标题：仙剑赋（伴奏）　宗门（青竹小院、演武广场、藏经阁…）：枫林　城镇（青阳镇、玄天城、林府…）：喜悦
//   城镇街市（青阳镇大街、玄天城街市）：江南庙会（即梦）　城里的店铺 / 客栈 / 茶楼 / 万宝楼 / 藏经阁：喜悦（即梦）　林府、城主府仍用原来的喜悦
//   野外 / 后山 / 有兽火的地图：古箫吟风曲（雨声氛围）　普通战斗：武侠快打（即梦，只截了高潮段，约 82 秒循环）　首领战：剑风疾·对决（作者 11-03 定，景天不再用）
// 曲子按需下载（进到对应场景才下），不拖慢开局。
(function () {
  if (typeof playBgm !== 'function' || typeof AUD === 'undefined') return;
  // 2026-10-29 即梦新曲（bgm29_*）：标题曲换成「星河遥」（不再用仙剑赋），演武广场（tj_front）用恢弘的「宗风」。
  // 候选曲都接进来了，测试面板「即梦配乐」可以试听、一键换标题曲 / 广场曲（记在本机 localStorage）。
  // 2026-10-29 作者：即梦歌曲全部 AI 人声分离，只留伴奏
  const J29 = { bgm29_yunkongyao: '云空遥·纯乐', bgm29_yunjianxing: '云间行·纯乐', bgm29_zongfeng: '宗风', bgm29_zongfeng2: '宗风·二', bgm29_xingyeyin: '星夜吟·纯乐', bgm29_xingyeguxing: '星夜孤行·纯乐', bgm29_xingheyao: '星河遥·纯乐', bgm29_yejingxingling: '夜径星铃·纯乐' };
  // 所有代码合成的程序音全部换成即梦音效库（作者：不要再出现"叮"的程序音）
  const SDEF = { jingle_bx1: 'lib_bx1', jingle_bx2: 'lib_bx2', jingle_bx5: 'lib_bx5',   // 作者 11-03：获得宝物改用音效「宝光」三选一（编钟一响 / 灵光上扬接编钟 / 光罩风铃），不再用曲子开头
    ui_click: 'lib_s00', ui_open: 'lib_s00', ui_confirm: 'lib_s00',   // 对话提示音 lib_u0–u3 是代码合成的，全部不用
    sfx_swing: 'lib_s01', sfx_hurt: 'lib_s02', sfx_star: 'lib_s03', sfx_buff: 'lib_s04', sfx_wind: 'lib_s05', sfx_ice: 'lib_s06', sfx_thunder: 'lib_s07',
    sfx_heal: 'lib_s08', sfx_ult: 'lib_s09', sfx_boom: 'lib_s10', sfx_beam: 'lib_s11', sfx_charge: 'lib_s12', sfx_crit: 'lib_s13', sfx_hit: 'lib_s14', sfx_sword_ring: 'lib_s15',
    sfx_claw: 'lib_s14', sfx_rock: 'lib_s10', sfx_vine: 'lib_s05', sfx_hit_heavy: 'lib_s13', ui_cancel: 'lib_s00', sfx_wolf_howl: 'lib_s16', sfx_dp_bed: 'lib_dp00', sfx_dx_bed: 'lib_dx00', sfx_xz_flute: 'lib_xz00', sfx_xz_array: 'lib_xz01', sfx_xz_slot: 'lib_xz02', sfx_xz_condense: 'lib_xz03', sfx_xz_burst: 'lib_xz04', sfx_xz_reunion: 'lib_xz05', sfx_xz_pillar: 'lib_xz06', sfx_xz_soul: 'lib_xz07', sfx_dx_prelude: 'lib_dx01', sfx_dx_cloud: 'lib_dx07', sfx_dx_array: 'lib_dx02', sfx_dx_storm: 'lib_dx03', sfx_dx_freeze: 'lib_dx04', sfx_dx_shatter: 'lib_dx05', sfx_dx_tinkle: 'lib_dx06', sfx_dp_array: 'lib_dp01', sfx_dp_pierce: 'lib_dp02', sfx_dp_soul: 'lib_dp03', sfx_dp_eye: 'lib_dp04', sfx_dp_eyeclose: 'lib_dp05', sfx_dp_growl: 'lib_dp06', sfx_dp_return: 'lib_dp07' };
  // 混音分层（2026-10-31）：库里的 vol 已按响度对齐，再乘上用途权重——界面点击轻、挥砍/蓄力居中、雷/爆/大招最重
  const ROLE = { ui_click: .5, ui_open: .5, ui_confirm: .55, ui_cancel: .5, sfx_swing: .75, sfx_charge: .78, sfx_buff: .7, sfx_heal: .7, sfx_star: .72, sfx_wind: .8, sfx_vine: .75, sfx_claw: .85, sfx_hurt: .85, sfx_hit: .9 };
  // 作者 11-02：「疾锋·快打（喜庆）」难听，永远不准再出现在游戏里——文件和条目已删，旧存档里选过它的也作废
  const BANNED = new Set(['lib_nk1']);
  let PICK = {}; try { PICK = JSON.parse(localStorage.getItem('bgm29_pick') || '{}') || {}; } catch (e) {}
  if (window.GX_TRIAL) PICK = {};   // 11-12：纯净版没有曲库面板，也不带弃用的备选曲子——一律用默认配乐，不认以前手选的
  for (const k in PICK) if (BANNED.has(PICK[k])) delete PICK[k];
  // 作者 11-07：问剑坪（演武广场）换成「清正高远」——以前在曲库里给广场手选过别的曲子的，作废一次，让新曲生效
  // 作者 11-07：「最喜欢的就是纳月降临（测试战）那首」= 首领战默认「剑风疾·对决」(lib_nk2)。手机上赵师弟一战放的不是它 → 那台设备在曲库里给首领战另指定过别的；清一次，所有设备回到默认
  // 作者 11-12：天剑宗后山（开局那张）换成青竹菜园现在用的「古筝独奏·悠闲」；以前在曲库里给后山手选过别的，作废一次
  try { if (!localStorage.getItem('bgm29_mig_houshan1112')) { if (PICK.houshan) { delete PICK.houshan; localStorage.setItem('bgm29_pick', JSON.stringify(PICK)); } localStorage.setItem('bgm29_mig_houshan1112', '1'); } } catch (e) {}
  try { if (!localStorage.getItem('bgm29_mig_boss1107')) { if (PICK.boss) { delete PICK.boss; localStorage.setItem('bgm29_pick', JSON.stringify(PICK)); } localStorage.setItem('bgm29_mig_boss1107', '1'); } } catch (e) {}
  try { if (!localStorage.getItem('bgm29_mig_plaza1107b')) { if (PICK.plaza) { delete PICK.plaza; localStorage.setItem('bgm29_pick', JSON.stringify(PICK)); } localStorage.setItem('bgm29_mig_plaza1107b', '1'); } } catch (e) {}
  try { if (!localStorage.getItem('bgm29_mig_plaza1107')) { if (PICK.plaza) { delete PICK.plaza; localStorage.setItem('bgm29_pick', JSON.stringify(PICK)); } localStorage.setItem('bgm29_mig_plaza1107', '1'); } } catch (e) {}
  const DEF = { title: 'bgm29_xingheyao', plaza: 'bgm29_yunkongyao', sect: 'bgm_sect_fenglin', town: 'bgm_town_xiyue', houshan: 'lib_xyq_cy13', xiashan: 'lib_m27', wild: 'bgm29_yunjianxing', battle: 'bgm_battle_kuaida', boss: 'lib_nk2', fair: 'lib_xm1', qytown: 'lib_xm2', shop: 'bgm_town_jiyue', xtcity: 'lib_qgs_inst', qingzhu: 'lib_qgs_inst', garden: 'lib_xyq_cy13', yicui: 'lib_m33', changle: 'lib_m32', xtinn: 'lib_xp1', xtcase: 'lib_m32', room: 'lib_jp1', linfu: 'lib_xp1', manor: 'lib_m09', hall: 'lib_tsy1', youying: 'lib_xyq_youying', nuwa: 'lib_xyq_nuwa', nwtemple: 'lib_xyq_nwg06', cellar1: 'lib_xyq_cellar1', cellar2: 'lib_xyq_cellar2' };   // 作者 11-06：幽影林 / 女娲秘境 / 地下一二层各自一首（小云雀生成）   // 作者 11-03：天剑大殿换自作「天剑殿钟」（仿天圣原，对味了）   // 作者 11-02：青竹小院还是清光升（作者说原来就挺好）；居室剑畔朝光；林府溪畔晴光；城主府镇间闲；天剑大殿宗风；野外云间行
  const T = {}; for (const k in DEF) T[k] = (PICK[k] && (J29[PICK[k]] || (window.BGM_LIB && BGM_LIB.tracks[PICK[k]]) || /^bgm_/.test(PICK[k]))) ? PICK[k] : DEF[k];
  const NEW = new Set([...Object.values(T), ...Object.keys(J29), ...Object.keys((window.BGM_LIB && BGM_LIB.tracks) || {})]);
  try { BGM_LIST.splice(0); } catch (e) {}   // 旧的 4 首合成配乐不再预先下载解码
  // 长曲子不能整首解码进内存（一首 4 分钟解码后近 90MB，手机会崩）：用 <audio> 边下边放，接到配乐音量上
  // 曲子放在作品的素材库里（发布包已经快满 256MB）；本地测试时读 audio/ 下的 mp3
  const BLOB = { bgm_title_xianjianfu: '9019a6180152835b9d446df91eb1fe27', bgm_sect_fenglin: 'c905771d1a22ad50ba95ad828e293f1f', bgm_town_xiyue: '8f0ac82253a0b932a9d5c5e9a2105b73',
    bgm_explore_guxiao: '44e975707583ff3300c5bb30d2940f24', bgm_battle_jianwu: '84bbc6ba581ebc8535b72b36f3272951', bgm_boss_jingtian: 'd5328d56d4a91eec068c7c380e9dea50',
    bgm_town_miaohui: 'd89a9e8a47114a32ae65deb5a3a86a4b', bgm_town_jiyue: 'd4d8ac63f5df23fc32e6baab71bc17d1',
    bgm_battle_kuaida: '6dd1ac264189708b6f5e88fbdb7b2af0',
    bgm29_yunkongyao: '3dd22daaa4cc98b78e92ef9e59930cad', bgm29_yunjianxing: 'f9bdc1852efa6cd0a1744225d6799cdf', bgm29_zongfeng: 'c0dd6a64b695ed3c1b17b99271824052', bgm29_zongfeng2: '527a45fb2284a8781ff27f6d07921f2f',
    bgm29_xingyeyin: '8d9487cb686bf8af0153139f25cd4a09', bgm29_xingyeguxing: 'adeab58e565570fe7515fc2e57bd73bc', bgm29_xingheyao: '675947de585d0532f311f62a4d79b9b8', bgm29_yejingxingling: '945319ca8fd16ad14577bde8a8dc83db' };
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
    a.addEventListener('error', () => { o.err = 1; });   // 文件缺失 / 网络失败：载入画面不再等它
    // 高潮段循环：库里标了 loop:[起,止] 的曲子（战斗 / 首领战），只在高潮段里循环，开打就燃
    const lp = LIBT[n] && LIBT[n].loop;
    if (lp) { o.loop = lp; a.addEventListener('timeupdate', () => { if (a.currentTime >= lp[1] - .05) { try { a.currentTime = lp[0]; } catch (e) {} } }); a.addEventListener('ended', () => { try { a.currentTime = lp[0]; a.play(); } catch (e) {} }); }
    try { if (typeof AC !== 'undefined' && AC && AUD.musicGain) { const src = AC.createMediaElementSource(a); o.g = AC.createGain(); o.g.gain.value = 0; src.connect(o.g); o.g.connect(AUD.musicGain); } } catch (e) { o.g = null; }
    return o;
  }
  // 作者 11-07：手机开局没有背景音乐、而且很卡 —— 以前第一次点屏幕会把曲库里全部 170 多首曲子同时建好、静音播放一下来“解锁”，
  // 等于一口气下载几百 MB 的 mp3，手机网络和解码全被占满，真正该放的那首反而出不来。
  // 现在不再批量解锁：只放当前该放的那一首；如果浏览器因为“不是点击触发”拦下了播放，下一次点屏幕时在点击里补放（手机上走路本来就要点屏幕）。
  // App 版（iOS / 安卓）本身就允许自动播放，不受影响。
  window.addEventListener('pointerdown', () => { try { if (!AUD.mode || AUD.muted) return; const b = AUD.bgm && AUD.bgm.a; if (b && b.paused && !b.__stopped) b.play().then(() => { const o = EL[AUD.bgmName]; if (o) o.blocked = 0; }, () => {}); } catch (e) {} }, { capture: true });
  function playNew(k, force) {
    AUD.want = k; if (!AUD.mode) return;
    if (AUD.bgmName === k && !force && AUD.bgm) return;
    stopBgm(.8); AUD.bgmName = k; if (AUD.muted) return;
    const o = el(k), a = o.a; a.volume = o.g ? 1 : 0; try { a.currentTime = o.loop ? o.loop[0] : 0; } catch (e) {}
    o.blocked = 0; a.play().then(() => { o.blocked = 0; }, () => { o.blocked = 1; });   // 被浏览器拦下（不是点击触发）：载入画面不再等它，下次点屏幕补放
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
    if (m === 'tj_front') return 'plaza';   // 演武广场（问剑坪）：作者 11-07 夜：天剑大殿 04 太闷，换回原来的「云空遥·纯乐」
    if (m === 'tj_houshan') return 'houshan';
    // 作者 11-08：叶擎苍在演武广场送别后「剑鸣」响起（热血男儿初出茅庐），走出山门接着放不重来；云阶松径、天剑山门本来就用剑鸣；到松风林道才换回地图配乐
    if (/^tj_(yunjie|shanmen)$/.test(m)) return 'xiashan';   // 作者 11-08：云阶松径、天剑山门平时也是「剑鸣」
    if (S.flags && S.flags.ch2_jm && m === 'tj_front') return 'xiashan';
    if (m === 'tj_room') return 'room';   // 作者：卧室原来的枫林太难听
    if (/^xt_city/.test(m)) return 'xtcity';   // 玄天城：清光升·纯乐
    if (/^qy_yicui/.test(m)) return 'yicui';   // 作者 11-12 青阳镇支线：倚翠楼用「月夜离箫」（古琴洞箫，离别），长乐坊用「夜弦潜行」（悬疑）
    if (/^qy_changle/.test(m)) return 'changle';
    if (m === 'xt_inn_hall') return 'xtinn';   // 玄天城探案支线：客栈大堂轻快，案发的客房悬疑
    if (m === 'xt_inn_room3' || m === 'xt_inn_corr' || m === 'xt_dyeyard' || /^xt_wanbao_/.test(m)) return 'xtcase';
    if (/^qingzhu_garden/.test(m)) return 'garden';   // 作者 11-11：青竹菜园用小云雀第二批 13「古筝独奏·悠闲」（第一批 03 作者嫌难听）
    if (/^qingzhu_/.test(m)) return 'qingzhu';   // 青竹小院：清光升·纯乐   // 后山：夜径星铃（古琴、箫、风铃，幽静带点紧张）
    if (m === 'tj_hall') return 'hall';
    if (/^xt_manor/.test(m)) return 'manor';
    if (/^(m_yy_|yy_)/.test(m)) return 'youying';   // 作者 11-06：幽影林、女娲秘境（含旧月界秘境）、地下一二层各自的曲子
    if (m === 'm_nw_temple') return 'nwtemple';   // 作者 11-06 深夜：千丝织天殿单独用「神殿·天宫织锦」，秘境其他图不变
    if (/^(m_nw_|mijing)/.test(m)) return 'nuwa';
    if (/^m_xx_b1/.test(m)) return 'cellar1';
    if (/^m_xx_b2/.test(m)) return 'cellar2';
    if (WILD.test(m) || /^qy_(escape|defense|rescue)/.test(m) || (def && def.mobs)) return 'wild';
    if (m === 'qy_town') return 'qytown';   // 作者 11-02：青阳镇用云间集，集市用仙市闲声
    if (FAIR.test(m)) return 'fair';
    if (SHOP.test(m)) return 'shop';
    if (/^lin_/.test(m)) return 'linfu';
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
    try { const boss = cfg && (cfg.boss || /赵|寨主|首领|Boss|boss|城主|魔/.test(cfg.title || '') || (cfg.enemies || []).some(e => /^b_/.test(e.key || ''))); if (boss && !cfg.normalBgm) playBgm('bgm_boss'); } catch (e) {}   // 作者 11-10：cfg.normalBgm = 先用普通战斗曲（黑风寨周虎方烈、魔族高手半血变身前）
    return r;
  })(startBattle);
  // 测试面板用：试听 / 指定标题曲、广场曲、野外曲
  window.BGM29 = { list: J29, T, DEF, PICK, SDEF, src,
    // 作者 11-06：「每次加载进度条的时候音乐也必须加载出来」——载入画面问这里：本地图的曲子缓冲够了没有
    ready() { try { if (!AUD.mode || AUD.muted) return true; if (typeof battle !== 'undefined' && battle) return true; const k = T[mapKind()]; if (!NEW.has(k)) return true; const o = EL[k]; if (!o) { sync(); return false; } return !!o.err || !!o.blocked || o.a.readyState >= 3; } catch (e) { return true; } },
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
    else { if (AUD.real) delete AUD.real[name]; return; }   // 没有实录顶替的就不放（原件是合成音）
    if (!ORIG[name] && AUD.buf[name]) ORIG[name] = AUD.buf[name];
    fetch(u).then(r => r.arrayBuffer()).then(b => AC.decodeAudioData(b)).then(buf => { AUD.buf[name] = buf; (AUD.real || (AUD.real = {}))[name] = 1; if (typeof SFX_VOL !== 'undefined') SFX_VOL[name] = (L && L.vol != null ? L.vol : (JB[name] && LIBT[name + '29'] ? LIBT[name + '29'].vol : .9)) * (ROLE[name] != null ? ROLE[name] : 1); }).catch(() => {});
  }
  function loadJingles() { const names = [...new Set([...Object.keys(JB), ...Object.keys(SDEF), ...Object.keys(PICK).filter(k => !(k in DEF))])]; let i = 0; const next = () => { if (i >= names.length) return; loadOne(names[i++]); setTimeout(next, 120); }; setTimeout(next, 1500); }   // 一首一首慢慢解码，不和开局的配乐、地图抢网速
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
