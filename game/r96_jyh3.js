// R96 神乐·九音灵河 v3「流萤光河」（Codex 11-02 交付，作者：时间太长 → 自己看情况剪短接入）
// 11-03 换成 Codex v4「精致度提升」：同一套剪辑，用 v4 的 renderer.py 按游戏站位重出分帧（jyh4/）
// 原版 15 秒：横笛引泉 → 音河回天 → 九次音雨 → 全队回生·净化 → 余音归天。这里剪成约 8 秒：
//   0–2.4s 横笛引泉 + 天幕汇流（原 0–3.65 秒，略加快）；2.4–5.05s 前三次音雨（原样）；
//   跳过中间六次音雨（0.35 秒交叉淡化）；5.05–6.65s 全队回生·净化（原样，6.18s 结算回血）；6.65–8.05s 余音归天（加快）。
// 画面是用 Codex 自己的 renderer.py 按游戏里的真实站位重新出的分帧（后层画在人物后面、前层画在人物前面），代码只按帧贴图。
(function () {
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const BLOB = {"n2_b0.webp":"1174a6ff494d8b4b82013aed7bbc1edb","n2_b1.webp":"a0126b15594fa1d9be37e29fb3bfc9a7","n2_b2.webp":"c9d7a0c47cb828ccce033d6d0a2f8dde","n2_b3.webp":"2488e32538fc8b8a0adbe6dfea55238f","n2_b4.webp":"7119ac532e12c0d2127e5353b71c371c","n2_b5.webp":"530e9bfdf84b69e33b9c954412648a95","n2_b6.webp":"08d0e38b3a7666b6f0d42dc0e095e8f4","n2_b7.webp":"4e4bc6af8f465a3015975b94985e6bee","n2_b8.webp":"379c918130f8edae4e0af5daa99defdf","n2_f0.webp":"1e2b9574ccddc45009dff466a89de8ae","n2_f1.webp":"7a7bfaa83c6a94332df2b674f4f3e32a","n2_f2.webp":"a3feca3a4488776ea43044f88781e60a","n2_f3.webp":"3a6c20298fda2c73b257cefefb6fe6aa","n2_f4.webp":"e93f7c6b6e05c6a2fd18ccc8241e1c24","n2_f5.webp":"ecf2ed7ca660fd0d26e12ed30145d1ff","n2_f6.webp":"7101356b8ff8c4f48d2aaa826a058ce8","n2_f7.webp":"199d9d87b96af6eacc41fb2e2b485572","n2_f8.webp":"6304869310740844bdad607099c87f39","n3_b0.webp":"c2b62ddbd808a3b7651a27687bd54d9b","n3_b1.webp":"53cea8e20a3b910f6b49029c7ecbfa44","n3_b2.webp":"fb091876a3efe93f01a33f54b5990bf0","n3_b3.webp":"8560bcafa10d9825c72371ad9e63bb3e","n3_b4.webp":"233396f8b2f816c9244e8ae122a1b336","n3_b5.webp":"3a1316e61fc9f6a6505a271be8cdf122","n3_b6.webp":"bd71b0247163a01b0b5336952d678157","n3_b7.webp":"9549f26d135f65095a7f351fef8773d8","n3_b8.webp":"0a03913da688ee8a7fb701a387501706","n3_f0.webp":"1963fddb26244c690ea4e99174562868","n3_f1.webp":"3559418ffcc713ba16a826977837d19e","n3_f2.webp":"c3aeef8f37a5ccf351adb27b0e53eaaa","n3_f3.webp":"4c71af218afc64a3d3f71610944792c4","n3_f4.webp":"a346d9349ad1d947e1e314c94317c0eb","n3_f5.webp":"0c4ffd06fe08ee41bd9cd85a9347b766","n3_f6.webp":"992acacbedc78b352218a7ed7e70a3d5","n3_f7.webp":"2a247ea4bfecef90cd785337893388d0","n3_f8.webp":"976cd2302bbd3d25897c7204e3b5ecec","n4_b0.webp":"23936a60b33a413f6069a044688a13bb","n4_b1.webp":"8417990abff6c13419f66159a1ac245b","n4_b2.webp":"3aec37454679949a6637274f987a4d08","n4_b3.webp":"feff7e43ae8b6a3a158931b7a762e422","n4_b4.webp":"43b1798561b50a70bf6967d0f6d21f88","n4_b5.webp":"b860558ad1a36a4c7f44da2d6eb13820","n4_b6.webp":"a132115f53f77e09446c9b040842fde5","n4_b7.webp":"2387c31d38a2135846e5f21678309d28","n4_b8.webp":"62c74b2e3120842cc9aca970cd2712bd","n4_f0.webp":"644011631bfd4b3011f272c5b1553254","n4_f1.webp":"dc6df828309863e02536a88b7593260f","n4_f2.webp":"1d137013f57d9ae5007fede19ec8e2df","n4_f3.webp":"d59daceb02648e2b3420d850ff6d66a9","n4_f4.webp":"8fedc57f1b79dd94ea0730ae820e38d2","n4_f5.webp":"90dbd6c4322b178a7a918a74adfefa10","n4_f6.webp":"fd53e0180cf908a9cc9db430ca210b52","n4_f7.webp":"12b0b5277fb4c8e78c07aea3318dbb1f","n4_f8.webp":"8fdadef1d582eadea7457bd11f330d72"};
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
