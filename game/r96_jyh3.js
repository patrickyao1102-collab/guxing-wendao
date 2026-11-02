// R96 神乐·九音灵河 v3「流萤光河」（Codex 11-02 交付，作者：时间太长 → 自己看情况剪短接入）
// 11-03 换成 Codex v4「精致度提升」：同一套剪辑，用 v4 的 renderer.py 按游戏站位重出分帧（jyh4/）
// 原版 15 秒：横笛引泉 → 音河回天 → 九次音雨 → 全队回生·净化 → 余音归天。这里剪成约 8 秒：
//   0–2.4s 横笛引泉 + 天幕汇流（原 0–3.65 秒，略加快）；2.4–5.05s 前三次音雨（原样）；
//   跳过中间六次音雨（0.35 秒交叉淡化）；5.05–6.65s 全队回生·净化（原样，6.18s 结算回血）；6.65–8.05s 余音归天（加快）。
// 画面是用 Codex 自己的 renderer.py 按游戏里的真实站位重新出的分帧（后层画在人物后面、前层画在人物前面），代码只按帧贴图。
(function () {
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const BLOB = {"n2_b0.webp":"90cb1f51c1a9071797288ac808bca5bc","n2_b1.webp":"27a8897d41a64e73e9ab9fefd12e39f5","n2_b2.webp":"038d1cb56edcf975de9dc7d12bb8df20","n2_b3.webp":"62ec41371cf8317b7be28807babc4d2e","n2_b4.webp":"2041eb177e7694e24b775d21b33d194f","n2_b5.webp":"ccd9afca07b2eae37f99f58c7d096b56","n2_b6.webp":"be05ca534d0374ddb1b50b8ed55b2b7c","n2_b7.webp":"5f8dc380537c0a278ad652f811a86920","n2_b8.webp":"bcbbf3bc66c05e990829fd9b1f64d186","n2_f0.webp":"e0472f0b73ef1998d2343e3c671aedd4","n2_f1.webp":"8791a3238cc7ee3fecf94d5faba54304","n2_f2.webp":"233a65ca194a52d31ebb19bcf0f86c37","n2_f3.webp":"ffa779f51b6976dda276060afe2abd4c","n2_f4.webp":"17f1597c9c94aacacc881a9eeebc78ec","n2_f5.webp":"c7d368f8fe2211ffed6b6928c114679e","n2_f6.webp":"bf8f86369a49db4948e16f0d77c1a118","n2_f7.webp":"3b5d33ef89b870191fcea40acb05955a","n2_f8.webp":"8e639361d4ca71dfb04b3b854609ac77","n3_b0.webp":"0fc7a37ce20fcf77947dbc0099071581","n3_b1.webp":"a599fd426d7e1260091a1632644830ec","n3_b2.webp":"b73e27620e856500093c868bf45eade2","n3_b3.webp":"625e8b8d15f4922b6d7f3e53e21ab1a9","n3_b4.webp":"4ee72cae166e793a32ab6cd3cdd53154","n3_b5.webp":"ae46fb4d415c9827cd5a43150cb1ec4c","n3_b6.webp":"f044b761e5238d16abd3da3ed561cb48","n3_b7.webp":"9c2620b3e4383a4ad54798d8c175f30d","n3_b8.webp":"457d617181d2adab72ec15119e84d7d4","n3_f0.webp":"17f8162b9a56d4acfbeab2258e2f89a5","n3_f1.webp":"2c14b3377259e704fd9db113ae752d71","n3_f2.webp":"3e9fa81d08e15c1202d5a802c702a6db","n3_f3.webp":"d241d933eca7551902d6058912697cb9","n3_f4.webp":"98a4cd197e19bae5612d0c446fe808fa","n3_f5.webp":"5d9d92a880784011e3f1c13602b7f89f","n3_f6.webp":"043467d9905f68a82dc9959edf6f541d","n3_f7.webp":"5c83205923e172f70b58c66f6a934a88","n3_f8.webp":"8355b68999d1f97a5e0f4bbca65839ab","n4_b0.webp":"f7734a14b71e99f183532e4c5e26edf6","n4_b1.webp":"d2d0b183f4143ca3d5b83d4d603e0019","n4_b2.webp":"a7405898c5d3ed64d246bd93df17da23","n4_b3.webp":"28b3c7e8918bf529e6332e8f6cf3156d","n4_b4.webp":"3c540bcc1fa25f64fe57a70d3b2cba3e","n4_b5.webp":"dfe9b05816a351793f9d9a21ac732522","n4_b6.webp":"e240fa4206354ba1d1a9ae3be6ccb8d4","n4_b7.webp":"3898c5debc0d5e775b1382225510de06","n4_b8.webp":"18de3a0683704fd407338e86f334eb92","n4_f0.webp":"a5e4d9cf44465f97095cbf8a9cd634a5","n4_f1.webp":"5e2759a9c975c7770ad70ca0e872be99","n4_f2.webp":"1c2a45f62f9a80d510cfecb6e51ce1de","n4_f3.webp":"4bed94eab2fab5d1b89af0d1d90ffe6d","n4_f4.webp":"71d24f9c8b37b1cd1bf5c07ea0ba7c04","n4_f5.webp":"fc58f61c42632ca0fb1c496c71a78a60","n4_f6.webp":"1d91599755340de85c2faca9634b985e","n4_f7.webp":"f68812c1ce3b3b5a54b87760db1f6806","n4_f8.webp":"dcf482bff64d093fb79567d34330cae6"};
  const META = { 2: { box: [636, 14, 644, 680], cell: [322, 340], shenle: [1135, 505], n: 2 }, 3: { box: [538, 0, 742, 706], cell: [371, 353], shenle: [1115, 490], n: 3 }, 4: { box: [584, 0, 696, 704], cell: [348, 352], shenle: [1180, 640], n: 3 } };
  const FR = 242, FPS = 30, CH = 30, COLS = 6, DUR = 8.05, HEAL_AT = 6.18;
  const src = (k, L, c) => { const f = 'n' + k + '_' + L + c + '.webp'; return LOC || !BLOB[f] ? 'jyh4/' + f : '/_blob/' + BLOB[f]; };
  const SHEETS = {}, READY = {};
  function load(k) { if (SHEETS[k]) return SHEETS[k].p; const s = { b: [], f: [] }; const ps = [];
    for (const L of ['b', 'f']) for (let c = 0; c * CH < FR; c++) { const im = new Image(); s[L][c] = im; ps.push(new Promise(r => { im.onload = () => (im.decode ? im.decode() : Promise.resolve()).catch(() => {}).then(r); im.onerror = r; })); im.src = src(k, L, c); }
    s.p = Promise.all(ps).then(() => { READY[k] = s.b.every(i => i.naturalWidth) && s.f.every(i => i.naturalWidth); }); SHEETS[k] = s; return s.p; }
  function layoutOf(P) { const hs = (battle && battle.heroes) || []; for (const k of ['2', '3', '4']) { const m = META[k]; if (hs.length === m.n && Math.hypot(P.x - m.shenle[0], P.y - m.shenle[1]) < 45) return k; } return null; }
  // 神乐在队里时提前把这一套分帧载好（约 3MB），放招时不卡
  setInterval(() => { try { if (typeof battle === 'undefined' || !battle || !battle.heroes) return; const P = battle.heroes.find(u => u.ally === 'shenle'); if (!P) return; const k = layoutOf(P); if (k) load(k); } catch (e) {} }, 1500);
  function draw(k, L, t) { const s = SHEETS[k]; if (!s) return; const i = Math.max(0, Math.min(FR - 1, Math.floor(t * FPS))), c = Math.floor(i / CH), j = i % CH, im = s[L][c]; if (!im || !im.naturalWidth) return;
    const m = META[k], [cw, chh] = m.cell, [bx, by, bw, bh] = m.box;
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(im, (j % COLS) * cw, Math.floor(j / COLS) * chh, cw, chh, bx, by, bw, bh); ctx.restore(); }
  const install = () => { const A = window.SK4 && SK4.ACT; if (!A || !A.jiuyinhe || A.jiuyinhe.__v3) return false;
    const old = A.jiuyinhe;
    A.jiuyinhe = async function (P) {
      const k = layoutOf(P); if (!k) return old.apply(this, arguments);
      await load(k); if (!READY[k]) return old.apply(this, arguments);
      const T = window.SKILL_TIER ? SKILL_TIER('shenle', 'jiuyinhe') : 1, r = .35 * (1 + [0, 0, .15, .3, .45, .6][T] || 1);
      P.pose = 'cast'; try { await portraitPop(P); } catch (e) {} try { skillBanner('九 音 灵 河', '#c8ffd8', '一河流过 · 伤复意涨'); } catch (e) {}
      const b = battle; try { dimTo(.42, 400); } catch (e) {}
      let healed = false;
      await new Promise(res => {
        const t0 = performance.now() / 1000; let done = false;
        const fin = () => { if (!done) { done = true; res(); } };
        // 音效跟着画面：笛声起 → 三次音雨落在身上 → 回生·净化
        const SFX = [[.15, 'sfx_xz_flute', .7], [2.85, 'sfx_xz_reunion', .55], [3.56, 'sfx_xz_reunion', .55], [4.27, 'sfx_xz_reunion', .55], [HEAL_AT - .05, 'sfx_xz_soul', .75], [HEAL_AT, 'sfx_heal', .6]];
        addFx({ life: DUR, layer: 0, update(f) { while (SFX.length && f.t >= SFX[0][0]) { const [, n, v] = SFX.shift(); try { playSnd(n, v); } catch (e) {} } }, draw(f) { draw(k, 'b', f.t); } });
        addFx({ life: DUR, layer: 1, update(f) {
            if (!healed && f.t >= HEAL_AT) { healed = true;
              (b.heroes || []).filter(u => u.alive).forEach((u, i) => setTimeout(() => { const h = Math.min(u.maxhp - u.hp, Math.round(u.maxhp * r)); u.hp += h; u.rage = Math.min(100, (u.rage || 0) + 20);
                try { floatText(u.x, u.y - u.h - 30, '+' + h, '#7dffa8', 42); floatText(u.x, u.y - u.h - 70, '怒气 +20', '#ffd36a', 26); } catch (e) {} }, i * 60)); }
            if (f.t >= 6.8 && P.pose) P.pose = null;
            if (f.t >= DUR - .05) fin(); },
          draw(f) { draw(k, 'f', f.t); }, onEnd: fin });
      });
      try { await dimTo(0, 250); } catch (e) {} P.pose = null;
    };
    A.jiuyinhe.__v3 = true; return true; };
  if (!install()) { const w = setInterval(() => { if (install()) clearInterval(w); }, 800); }
  window.R96_JYH3 = { load, layoutOf, ready: () => READY };
})();
