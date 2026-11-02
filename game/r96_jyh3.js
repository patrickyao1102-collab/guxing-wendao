// R96 神乐·九音灵河 v3「流萤光河」（Codex 11-02 交付，作者：时间太长 → 自己看情况剪短接入）
// 原版 15 秒：横笛引泉 → 音河回天 → 九次音雨 → 全队回生·净化 → 余音归天。这里剪成约 8 秒：
//   0–2.4s 横笛引泉 + 天幕汇流（原 0–3.65 秒，略加快）；2.4–5.05s 前三次音雨（原样）；
//   跳过中间六次音雨（0.35 秒交叉淡化）；5.05–6.65s 全队回生·净化（原样，6.18s 结算回血）；6.65–8.05s 余音归天（加快）。
// 画面是用 Codex 自己的 renderer.py 按游戏里的真实站位重新出的分帧（后层画在人物后面、前层画在人物前面），代码只按帧贴图。
(function () {
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const BLOB = {"n2_b0.webp":"7bb1f2d08e5ba6afe100b60995ad3f6f","n2_b1.webp":"ea910aebc8d75b4d7df2bc3bacaed26c","n2_b2.webp":"980f770eb596b54340308f5e82538e71","n2_b3.webp":"d531f2c50a9c48c9acb0c43d37c280e7","n2_b4.webp":"1d1abb56a4fce8e8da80807b61283bd1","n2_b5.webp":"2168e57a77fee760e8fdc67fac24468b","n2_b6.webp":"aec661002af4d4070309083d4b82c3c6","n2_b7.webp":"d054e5cefa380551c1fcb1e62613112f","n2_b8.webp":"c4110a94b564fb209911b0b583ee408f","n2_f0.webp":"a8984b84eb1c34430b3f2e1f4f675c77","n2_f1.webp":"095d03219f27c6f13edb47c707d196ee","n2_f2.webp":"14c05cada99a2cf4a4b3de0a05d19be3","n2_f3.webp":"136d4c1b73214eeaa88a7c054d7a0050","n2_f4.webp":"9f1572c94799f7788b9d69ccd2c1f9f2","n2_f5.webp":"8724054208864777c932c61ea29a17b7","n2_f6.webp":"1953bdc88e72775972b494b5dea9a03c","n2_f7.webp":"6ae119f3143f879378630fa049c91bb1","n2_f8.webp":"82f494f15733a91a8f97d8db562d0e4a","n3_b0.webp":"6dc130a23106b31d0c2e36020c8db95f","n3_b1.webp":"d49df358fe9c5cf9fe6bff2a447d5941","n3_b2.webp":"a6adc341fe200395c08c2a5b0e1b4cd9","n3_b3.webp":"54b433ac31f5c4a3aadcf7ae6fc93541","n3_b4.webp":"518f4d206e0f3abcbca0b364760208bf","n3_b5.webp":"162d1fff7b7e67e957ac9990784b622f","n3_b6.webp":"d7cbabd813a57b418a132a1d948e2d99","n3_b7.webp":"2d1080b2df6fd597392eb1abd0e1a3c8","n3_b8.webp":"1b932d9dbe0df29bc722aaa320172d5c","n3_f0.webp":"c7d7ee753b8f4987161d1c7ef96b1867","n3_f1.webp":"99904872ada8e1a7f1f3880317c5296b","n3_f2.webp":"90f4adef9ad6eb1fbaa4b0e84aa2ee41","n3_f3.webp":"37209f0d24ade01f88ef22eeddb25751","n3_f4.webp":"d79d432cca35ef531d705d23ea87b024","n3_f5.webp":"6fc358b4ce703b2173c854fd180818c5","n3_f6.webp":"771825131916b5818c9c90956887f894","n3_f7.webp":"8e1e675c528ca3459475a6f1a2a17b57","n3_f8.webp":"402e3f552655762155ae113801746b49","n4_b0.webp":"7baffeb8c6fa302b63e7c97508236c0f","n4_b1.webp":"ab63a1f61e361da8acc9db11f92a724b","n4_b2.webp":"2f5e1c03cbc70afae87d478f5dbf8e0c","n4_b3.webp":"294a9d736f4d3540fdb96b2ec54a8712","n4_b4.webp":"30073caf340a08c1a65469965ddd3e43","n4_b5.webp":"c094279c7c014ddefaa8a6ed3002c68e","n4_b6.webp":"c16f985130038be24b88e495e7781ea0","n4_b7.webp":"4f5f78ef9e8ec014fa37e67c3516a05d","n4_b8.webp":"47fd94a490fbf60fd026be5487fb8388","n4_f0.webp":"8f6c33d186c7dd4b45e3dc3f8200ab63","n4_f1.webp":"af5401c05c5965c3202e3c953feb9a67","n4_f2.webp":"d2fb59f9150ad5902b9fdc68b43d6710","n4_f3.webp":"78b15876b367003a133eb5b5c242fd78","n4_f4.webp":"d2c33431a4505a480fa5bd3f09e2e236","n4_f5.webp":"d26ea588ac5b68f4a8161a2c50bac76c","n4_f6.webp":"842db72dba1e44197be9d5c93d18960a","n4_f7.webp":"79244824d507bf07e657fa42230c3bdc","n4_f8.webp":"074b8e1aa726ded81465e0e74c2710e7"};
  const META = { 2: { box: [636, 14, 644, 680], cell: [322, 340], shenle: [1135, 505], n: 2 }, 3: { box: [538, 0, 742, 706], cell: [371, 353], shenle: [1115, 490], n: 3 }, 4: { box: [584, 0, 696, 704], cell: [348, 352], shenle: [1180, 640], n: 3 } };
  const FR = 242, FPS = 30, CH = 30, COLS = 6, DUR = 8.05, HEAL_AT = 6.18;
  const src = (k, L, c) => { const f = 'n' + k + '_' + L + c + '.webp'; return LOC || !BLOB[f] ? 'jyh3/' + f : '/_blob/' + BLOB[f]; };
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
