// ================= R189 Codex 交付：周虎重做 / 神秘魔族撕斗篷变身真身 / 槐柳双魂 / 同心衣图标（作者 11-10）=================
// 作者：「周虎模型不合格」「神秘魔族剧情突破以后变身——斗篷撕下，变成魔族真身，也是个帅哥，攻击力大幅提升」
// 战斗模型都是三张静态图：待机 / 出手 / 受击（400 宽，脚底贴底边居中，朝右）。敌人出手（pose = 'atk'）换出手图，挨打（hurt）换受击图。
(function () {
  if (typeof drawUnit !== 'function' || typeof IMG === 'undefined') return;
  const IM = {}, load = (k, src, cb) => { const im = new Image(); im.onload = () => { IM[k] = im; cb && cb(im); }; im.src = src; };
  // ---------- 三姿态敌人 ----------
  // 作者 11-10 看过：周虎、男女魂不合格，先只接魔族真身（周虎 / 男女魂的接法留着，Codex 重画后把这两组加回 SETS 就行）
  const SETS = { e_mozu2: 'mozu2' };
  for (const key in SETS) for (const p of ['idle', 'atk', 'hit']) load(key + '__' + p, 'r189/b_' + SETS[key] + '_' + p + '.webp', im => { IMG[key + '__' + p] = im; });
  // 周虎：原来的战斗图是光膀子虎皮围裙的山贼、和对话立绘对不上 → 换成照立绘画的（黑褐兽毛披肩、旧铁护肩、暗红腰封、发髻络腮胡、鬼头刀）
  //   原来那条即梦逐帧视频也是旧形象，一起停掉；地图上剧情里的小人（IMG.e_zhouhu）也用新待机图
  for (const key of []) { let old = IMG[key]; Object.defineProperty(IMG, key, { configurable: true, enumerable: true, get: () => IMG[key + '__idle'] || old, set: v => { old = v; } }); }
  for (const key of ['e_mozu2']) Object.defineProperty(IMG, key, { configurable: true, enumerable: true, get: () => IMG[key + '__idle'], set: () => {} });
  const dropVS = () => { try { if (window.VSPRITES) delete VSPRITES.e_zhouhu; if (window.RIG_MAP) delete RIG_MAP.e_zhouhu; } catch (e) {} };
  // dropVS(); setTimeout(dropVS, 3000);   // 周虎新模型接进来时再打开
  if (window.BATTLE_SIZE) Object.assign(BATTLE_SIZE, { e_mozu2: BATTLE_SIZE.e_mozu || 300, e_yyq_m: 240, e_yyq_f: 228 });
  // 待机可见高（px，原画 720 高里人物占的高度）+ 出手 / 受击相对待机的绘制倍率（R191 战斗模型参数.json）
  const REL = { e_mozu2: { idleH: 707, idle: 1, atk: 2.1352, hit: 1.44898 } };
  { const c = document.createElement('canvas'); c.width = c.height = 1; IMG.__r189_none = c; }
  const pose = u => u.hurt > .15 ? 'hit' : (u.pose === 'atk' || u.pose === 'cast') ? 'atk' : 'idle';

  // ---------- 魔族撕斗篷变身（30 帧 · 15fps · 2 秒；图集缩到一半：每格 336×384，6 列，脚底锚点 168,372）----------
  const TF = { cols: 6, n: 30, fps: 15, fw: 336, fh: 384, ax: 168, ay: 372, src: 2 /* 图集像素 → 原画像素 */, idleH: 707 };
  load('tf', 'r189/mozu2_tf.webp');
  for (const n of ['default', 'angry', 'grin']) load('p_' + n, 'r189/p_mozu2_' + n + '.webp', im => { IMG['p_mozu2_' + n] = im; if (typeof MEDAL_FACE !== 'undefined') MEDAL_FACE['p_mozu2_' + n] = { fx: .5, fy: .22, span: .4 }; });
  function drawTF(u, t) {
    const im = IM.tf; if (!im) return false;
    const f = Math.min(TF.n - 1, Math.floor(t * TF.fps)), s = u.h / TF.idleH * TF.src;   // 和真身待机图同一缩放
    const w = TF.fw * s, h = TF.fh * s, x = u.x + u.ox - TF.ax * s, y = u.y + u.oy - TF.ay * s;
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(u.x + u.ox, u.y + u.oy, u.h * .26, u.h * .06, 0, 0, 7); ctx.fill();
    ctx.drawImage(im, (f % TF.cols) * TF.fw, Math.floor(f / TF.cols) * TF.fh, TF.fw, TF.fh, x, y, w, h); ctx.restore(); return true;
  }
  drawUnit = (o => function (u) {
    if (u && u._tf != null && u.alive) { const t = performance.now() / 1000 - u._tf; if (drawTF(u, t)) return; }
    const set = u && u.side === 'enemy' && SETS[u.key], ps = set && pose(u), k = set && u.key + '__' + ps;
    if (!k || !IMG[k]) return o(u);
    // R191：三张姿态都是 400×720 整幅、脚底在底边中点；出手 / 受击按 Codex 给的「相对待机倍率」画（招式伸展大、人缩在画幅里）
    const R = REL[u.key]; if (R && u.alive) {
      const im = IMG[k], now = performance.now() / 1000, sc = u.h / R.idleH * (R[ps] || 1), w = im.width * sc * (720 / im.height), h = 720 * sc;
      const x = u.x + u.ox + (u.hurt > 0 ? Math.sin(now * 80) * 8 * u.hurt : 0), y = u.y + u.oy;
      const k0 = u.key; u.key = '__r189_none'; try { o(u); } finally { u.key = k0; }   // 影子、血条、名字照旧（本体不画）
      ctx.save(); if (u.hurt > .5) ctx.filter = 'brightness(2.2)'; ctx.drawImage(im, x - w / 2, y - h, w, h); ctx.restore(); return;
    }
    const k0 = u.key; u.key = k; try { return o(u); } finally { u.key = k0; }
  })(drawUnit);

  // 对话立绘：变身之后「魔族高手」说话用真身立绘（default / 怒 / 坏笑），这一战打完、黑风寨收尾演完就换回斗篷版
  const SPK = { '魔族高手': 'p_mozu2_default', '魔族高手·怒': 'p_mozu2_angry', '魔族高手·坏笑': 'p_mozu2_grin' }, OLDP = {};
  const truePortraits = on => { try { for (const n in SPK) { const sp = SPEAKERS[n]; if (!sp) continue; if (on) { if (!(n in OLDP)) OLDP[n] = sp.p; if (IMG[SPK[n]]) sp.p = SPK[n]; } else if (n in OLDP) { sp.p = OLDP[n]; delete OLDP[n]; } } } catch (e) {} };
  async function transform(e) {
    truePortraits(true);
    e.pose = null; e._tf = performance.now() / 1000; S.shake = 14; try { playSnd('sfx_ult', .75); } catch (er) {}
    fx('fx3_orb_violet', { life: 1.2, layer: 0, x: e.x, y: e.y - e.h * .45, scale: k => 1.8 * Math.min(1, k * 2.5), alpha: 1.1, fadeOut: .5 });
    await sleep(620); S.shake = 20; S.flash = .5; S.flashColor = '#b07aff'; try { playSnd('sfx_hit_heavy', .8); } catch (er) {}   // 第 9–18 帧：斗篷撕裂四散
    await sleep(1400);
    e._tf = null; e.key = 'e_mozu2'; e.name = '魔族真身'; floatText(e.x, e.y - e.h - 70, '魔族真身', '#ff8ad0', 58);
    await say('魔族高手·坏笑', '……很久没有人，逼本座现出这副模样了。');
  }
  window.R189M = { transform, truePortraits, IM };
  if (typeof ch2After === 'function') ch2After = (o => async function () { truePortraits(false); return o.apply(this, arguments); })(ch2After);
  // 打输了 / 跳过战斗也换回来
  startBattle = (o => function (cfg) { const pr = o.apply(this, arguments); try { if (!(cfg && (cfg.enemies || []).some(x => x && x.key === 'e_mozu'))) truePortraits(false); } catch (e) {} return pr; })(startBattle);

  // ---------- 同心衣图标（R128 物品图标那套样式）----------
  load('i_tongxin', 'r189/i_tongxin.webp');
  if (typeof itemIcon === 'function') itemIcon = (o => function (id, x, y, r) {
    if (id !== 'a_tongxin' || !IM.i_tongxin) return o.apply(this, arguments);
    ctx.save(); const g = ctx.createRadialGradient(x, y - r * .2, r * .1, x, y, r); g.addColorStop(0, 'rgba(70,52,34,.9)'); g.addColorStop(1, 'rgba(18,12,8,.92)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = '#8fd0a8'; ctx.stroke();
    const s = r * 2.15; ctx.drawImage(IM.i_tongxin, x - s / 2, y - s / 2, s, s); ctx.restore();
  })(itemIcon);
})();
