// ================= R334 · 支线「东厢朝南」完美结局尾声：第二年开春，桃花树下（作者 11-16 定稿的 22 秒动画）（只进测试版）=================
// 作者 11-16：「你可以把这个接入我们之前预设的动画里面，就是支线做完的时候」。
// 片子：小云雀（Seedance）做的 V2/V3 精选剪辑版，22 秒，1280×720，带原声。放在 r334/dx_peach.mp4。
// 时机：结局一「东厢朝南」——中秋夜、第二天碾药之后，领奖励之前；先黑场打字幕「第二年 · 开春」，再整屏放片子。
// 放片子时先停 BGM，放完再接回；能出声就出声，浏览器不让出声就静音放；放不出来就跳过，不卡剧情。右下角可「跳过」。
(function () {
  const SRC = 'r334/dx_peach.mp4?v=1';
  let pre = null;   // 支线走到中秋夜就先把片子拉下来，到时候不用等
  const preload = () => { if (pre) return; try { pre = document.createElement('link'); pre.rel = 'preload'; pre.as = 'video'; pre.href = SRC; document.head.appendChild(pre); } catch (e) {} };
  // 先试着直接带声音放；浏览器（尤其 iPhone）不让在非点击的时候出声，就把第一帧停在那里，显示「轻触观看」，点一下再放（点的那一下里调 play，声音就有了）
  const play = () => new Promise(res => {
    let done = false, box = null, v = null, timer = 0, hint = null;
    const end = () => { if (done) return; done = true; clearTimeout(timer);
      try { v && v.pause(); } catch (e) {}
      try { box && box.remove(); } catch (e) {}
      res(); };
    try {
      box = document.createElement('div');
      box.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 1s';
      v = document.createElement('video');
      v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', ''); v.playsInline = true; v.preload = 'auto'; v.src = SRC;
      v.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#000';
      const skip = document.createElement('div'); skip.textContent = '跳过 ›';
      skip.style.cssText = 'position:absolute;right:max(18px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));padding:6px 14px;border-radius:16px;font:600 15px/1.4 serif;color:#f3e2b8;background:rgba(0,0,0,.45);border:1px solid rgba(243,226,184,.35);cursor:pointer;opacity:0;transition:opacity .4s;user-select:none';
      hint = document.createElement('div'); hint.textContent = '轻触观看';
      hint.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:10px 26px;border-radius:24px;font:600 20px/1.4 serif;letter-spacing:.3em;color:#f3e2b8;background:rgba(0,0,0,.35);border:1px solid rgba(243,226,184,.4);display:none;cursor:pointer;user-select:none';
      box.appendChild(v); box.appendChild(hint); box.appendChild(skip); document.body.appendChild(box);
      requestAnimationFrame(() => { box.style.opacity = '1'; });
      setTimeout(() => { skip.style.opacity = '1'; }, 1500);   // 一开始别让人手快点掉
      skip.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); end(); });
      v.addEventListener('ended', () => { box.style.opacity = '0'; setTimeout(end, 1000); });
      v.addEventListener('error', end);
      timer = setTimeout(end, 60000);   // 网络太慢也别卡死
      const tapPlay = e => { if (e) { e.stopPropagation(); e.preventDefault(); } hint.style.display = 'none'; v.muted = false;
        const p = v.play(); if (p && p.catch) p.catch(() => { v.muted = true; const p2 = v.play(); if (p2 && p2.catch) p2.catch(end); }); };
      const p = v.play();
      if (p && p.catch) p.catch(() => { hint.style.display = 'block'; box.addEventListener('pointerdown', tapPlay, { once: true }); });
    } catch (e) { end(); }
  });
  // 地图配乐先慢慢收掉，整段片子期间看门狗别把它接回来（CINE_PAUSE + world.locked），片子放完由下一张图自己接回配乐
  window.R334_PEACH = async function (o) {
    const h0 = S.hud;
    try { if (typeof stopBgm === 'function') stopBgm(1.8); else if (window.BGM29) BGM29.stop(); } catch (e) {}
    try { AUD.bgmName = ''; } catch (e) {}
    window.CINE_PAUSE = true; try { world.locked = true; } catch (e) {}
    try { await fadeOut(1400); } catch (e) {}
    S.hud = false;
    if (!(o && o.caption === false)) { try { await caption('第二年 · 开春', 2400); } catch (e) {} }   // 作者 11-17：不打「第二年开春」，就是中秋这一晚
    try { await play(); } catch (e) {}
    S.hud = h0; window.CINE_PAUSE = false;
    try { S.fade = 1; } catch (e) {}   // 停在黑场：接下来剧情自己切图、淡入（切到丹霞堂前堂），配乐跟着新图接回
  };
  // 测试面板「支线 · 玄天城」多一个按钮：东厢朝南直接跳到最后一步（中秋夜），传送到丹霞堂掌柜旁边，跟他说话就开演 → 第二天 → 尾声动画 → 领奖励
  // 作者 11-16：「我们点确定的时候突然切画面，我来看看到底是什么样的」
  if (window.SQ_TEST_LIST && window.SQ_GO) {
    const L0 = SQ_TEST_LIST, G0 = SQ_GO, FAKE = { id: 'dx_east_end', name: '东厢朝南·直接看结局' };
    window.SQ_TEST_LIST = () => { const out = L0(); const g = out.find(([n]) => n === '玄天城'); if (g) g[1] = g[1].concat([FAKE]); else out.push(['玄天城', [FAKE]]); return out; };
    window.SQ_GO = id => { if (id !== FAKE.id) return G0(id);
      G0('dx_east');   // 先清零、补前提、传送到掌柜旁边
      try { const f = S.flags; f.sq.dx_east = { s: 1, n: 5 }; f.ch3_report = 1; f.dx_shut = 0; preload(); } catch (e) {}
      setTimeout(() => { try { toast('东厢朝南：已到最后一步「中秋夜」—— 跟丹霞堂伙计说话，去掌柜家过中秋，最后是桃花尾声动画', 4000); } catch (e) {} }, 300); };
  }
  // 中秋夜开始时预载（F().dx_night 置 1 的时候）；进游戏后每隔一会儿看一眼，便宜
  setInterval(() => { try { if (S && S.flags && S.flags.dx_night) preload(); } catch (e) {} }, 3000);
})();
