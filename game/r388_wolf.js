// ================= R388 · 落星坡的头目「衔星 · 赤焰狼王」（只进测试版）=================
// 作者 11-27 晨：「前十五分钟一定要吸引住玩家」「妖王讨伐是非常大的进步，诸如此类还有呢」。
// 开场那颗流星砸在后山落星坡。一头老妖狼咬住坑心的星核碎片，被星力烧成了浑身带火的狼王，守在坑里。
// 它是玩家头十分钟里能遇到的第一只头目：火性——玩家这时手里是水属性的寒星剑，水克火，正好尝到「克」的甜头。
// 本体是 Codex R388 画的十四帧（平时 / 蓄力 / 出手 / 力竭），打法走妖王那一套（三手一嚎，嚎完那一扑要防御，扑完力竭）。不上讨伐榜。
(function () {
  const META = window.R388_META; if (!META || !META.xingwolf || !window.R370_YW || typeof VSPRITE_ADD !== 'function' || typeof IMG === 'undefined') return;
  const M = META.xingwolf, key = 'yw_xingwolf', K = .8, MAPK = .54, F = () => (S.flags = S.flags || {});
  const y = { id: 'xingwolf', mini: true, hidden: true, ep: '衔星', name: '赤焰狼王', type: 'wolf', map: 'tj_luoxing', pos: [1400, 760], lv: 7, hp: 780, atk: 36, def: 8, spd: 12, exp: 280, gold: 120, fabao: null, bg: 'bg_night', scale: 1, fxColor: '#ff8a3a',
    where: '天剑宗后山 · 落星坡 · 陨星坑', tip: '它仰头长嚎就是要扑了——那一下防御。扑完它会趴下喘，那是出手的时候。', extra: ['p_small', 'p_small', 'p_mp'],
    cond: () => { try { const w = S.hero.equip && S.hero.equip.weapon; return !!w && w !== 'w_wood'; } catch (e) { return false; } },   // 手里有了真剑才露面
    after: async () => { await say('星旋', '头一只头目。记住这个滋味——往后的，只会更凶。'); await say('星旋', '它肩上那两块星晶你收好，是打好东西的料。这一桩本神仙给你记上，回头到玉佩里来交。'); } };
  R370_YW.push(y);
  VSPRITE_ADD(key, '../r388/xingwolf', M.main, M.h, false, false);
  if (M.charge) VSPRITE_ADD(key + '_c', '../r388/xingwolf_charge', M.charge, M.h, false, false);
  if (M.break) VSPRITE_ADD(key + '_b', '../r388/xingwolf_break', M.break, M.h, false, false);
  try { let v = null, pic = null; Object.defineProperty(IMG, key, { configurable: true, enumerable: true, set(x) { v = x; }, get() { if (v) return v; if (!pic) { pic = new Image(); pic.src = 'r388/xingwolf_pic.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(pic); } catch (e) {} } return pic.complete && pic.naturalWidth ? pic : undefined; } }); } catch (e) {}
  (window.VS_SCALE = window.VS_SCALE || {})[key] = K;
  y.vkey = key; y.vh = Math.round(M.bodyH * .92 * K); y.mh = Math.round(M.h * .56 * MAPK); y.bpos = [300, 632]; y.apos = [[572, 652], [668, 606], [455, 680]]; y.sslots = y.apos;
  try { const m = MOB_DB.wolf; if (m && typeof DROPS !== 'undefined' && DROPS[m.key] && !DROPS[key]) DROPS[key] = DROPS[m.key]; } catch (e) {}
  try { if (window.WX5) WX5.YW.xingwolf = 'huo'; } catch (e) {}
  try { if (window.BESTIARY && BESTIARY.NAME) BESTIARY.NAME[key] = '衔星 · 赤焰狼王'; } catch (e) {}
  if (typeof startBattle === 'function') startBattle = (orig => function (cfg) { try { if (cfg && cfg.yw === 'xingwolf') for (const n of ['charge', 'break']) { const im = new Image(); im.src = 'rig/../r388/xingwolf_' + n + '.webp'; } } catch (e) {} return orig.apply(this, arguments); })(startBattle);
  window.R388 = { y };
})();
