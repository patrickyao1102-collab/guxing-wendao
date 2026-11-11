// ================= R207 · 聚光引导（作者 11-11：所有教程都要有「跳过」）=================
// SPOT.run(steps)：压暗全屏，只挖出当前要点的位置（金框呼吸 + 箭头），顶上一条说明；除了挖空处和「跳过」，别处点了没反应。
// 步骤：{ title, text, rect: () => [x,y,w,h] | null, done: () => bool, tap: true（点到挖空处就算完成）}
// 返回 'done' 或 'skip'
(function () {
  const now = () => performance.now() / 1000;
  const SK = [W - 150, 22, 124, 46];
  let CUR = null;
  const inRect = (p, r) => r && p.x >= r[0] && p.x <= r[0] + r[2] && p.y >= r[1] && p.y <= r[1] + r[3];
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  // 输入：抢在画布之前看一眼
  let blockedDown = false;
  window.addEventListener('pointerdown', e => {
    if (!CUR) return; const c = document.querySelector('canvas'); if (!c || e.target !== c) return;
    const r = c.getBoundingClientRect(), p = { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
    if (inRect(p, SK)) { CUR.skip = true; blockedDown = true; e.stopImmediatePropagation(); e.preventDefault(); try { playSnd('ui_click'); } catch (_) {} return; }
    const st = CUR.steps[CUR.i], R = st && st.rect && st.rect();
    if (R && inRect(p, [R[0] - 10, R[1] - 10, R[2] + 20, R[3] + 20])) { if (st.tap) CUR.tapAt = now(); return; }
    if (!R && (dialog || sysPanel || choice)) return;   // 这一步正在讲话 / 弹面板：放行
    blockedDown = true; e.stopImmediatePropagation(); e.preventDefault();
  }, { capture: true });
  window.addEventListener('pointerup', e => { if (blockedDown) { blockedDown = false; e.stopImmediatePropagation(); } }, { capture: true });
  window.addEventListener('keydown', e => { if (CUR && (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape')) { e.stopImmediatePropagation(); } }, { capture: true });

  const hudWillDraw = () => { try { return S.hud && !(typeof battle !== 'undefined' && battle) && !dialog && !choice && !sysPanel; } catch (e) { return false; } };
  if (typeof drawMapHud === 'function') drawMapHud = (o => function () { const r = o.apply(this, arguments); try { if (hudWillDraw()) ov.paint(); } catch (e) {} return r; })(drawMapHud);   // 菜单在 HUD 里画，引导要盖在菜单上面
  const ov = { draw() { if (!hudWillDraw()) this.paint(); }, paint() {
    if (!CUR) return; const st = CUR.steps[CUR.i]; if (!st) return; const t = now(), R = st.rect && st.rect();
    if (dialog || choice) return;   // 剧情台词在讲：先让台词说完
    ctx.save();
    ctx.fillStyle = 'rgba(6,8,14,.6)'; ctx.beginPath(); ctx.rect(0, 0, W, H);
    if (R) { const [x, y, w, h] = R, m = 8; ctx.moveTo(x - m, y - m); ctx.lineTo(x - m, y + h + m); ctx.lineTo(x + w + m, y + h + m); ctx.lineTo(x + w + m, y - m); ctx.closePath(); }
    ctx.fill('evenodd');
    if (R) { const [x, y, w, h] = R, p = .5 + .5 * Math.sin(t * 5);
      ctx.save(); ctx.shadowColor = '#ffc24a'; ctx.shadowBlur = 18 + 10 * p; ctx.lineWidth = 3 + p * 1.5; ctx.strokeStyle = '#ffd77a'; rr(x - 8, y - 8, w + 16, h + 16, 12); ctx.stroke(); ctx.restore();
      // 箭头：从说明条那边指过来
      const cx = x + w / 2, top = y > H * .45, ay = top ? y - 22 - 8 * p : y + h + 22 + 8 * p;
      ctx.save(); ctx.translate(cx, ay); if (!top) ctx.rotate(Math.PI); ctx.fillStyle = '#ffe08a'; ctx.strokeStyle = 'rgba(60,36,8,.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-16, -22); ctx.lineTo(-6, -22); ctx.lineTo(-6, -40); ctx.lineTo(6, -40); ctx.lineTo(6, -22); ctx.lineTo(16, -22); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore(); }
    // 说明条：放在挖空处的另一半屏
    const bw = 620, bx = (W - bw) / 2, by = R && R[1] + R[3] / 2 < H * .5 ? H - 150 : 96;
    ctx.save(); rr(bx, by, bw, 86, 14); ctx.fillStyle = 'rgba(18,16,24,.92)'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(232,194,122,.8)'; ctx.stroke();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = `26px ${BRUSH}`; ctx.fillStyle = '#ffd77a'; ctx.fillText(st.title || '', bx + 22, by + 26);
    ctx.font = `600 17px ${FONT}`; ctx.fillStyle = '#f1e6cc'; const tx = typeof st.text === 'function' ? st.text() : st.text || ''; ctx.fillText(tx, bx + 22, by + 60);
    ctx.textAlign = 'right'; ctx.font = `600 13px ${FONT}`; ctx.fillStyle = 'rgba(232,210,160,.7)'; ctx.fillText((CUR.i + 1) + ' / ' + CUR.steps.length, bx + bw - 18, by + 26); ctx.restore();
    // 跳过
    ctx.save(); const [sx, sy, sw, sh] = SK; rr(sx, sy, sw, sh, 23); ctx.fillStyle = 'rgba(20,16,12,.85)'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(232,194,122,.9)'; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `22px ${BRUSH}`; ctx.fillStyle = '#ffe9b8'; ctx.fillText('跳 过 ›', sx + sw / 2, sy + sh / 2 + 1); ctx.restore();
    ctx.restore();
  } };
  window.SPOT = {
    active: () => !!CUR,
    run(steps) { return new Promise(res => {
      if (CUR) { CUR.res('skip'); }
      CUR = { steps, i: 0, res, skip: false, tapAt: 0, t0: now() }; if (S.overlay.indexOf(ov) < 0) S.overlay.push(ov);
      const iv = setInterval(() => { const C = CUR; if (!C || C.res !== res) { clearInterval(iv); return; }
        const end = r => { clearInterval(iv); CUR = null; const k = S.overlay.indexOf(ov); if (k >= 0) S.overlay.splice(k, 1); res(r); };
        if (C.skip) return end('skip');
        const st = C.steps[C.i]; let ok = false; try { ok = st.done ? !!st.done() : false; } catch (e) {}
        if (!ok && st.tap && C.tapAt && now() - C.tapAt > .25) ok = true;
        if (ok) { C.i++; C.tapAt = 0; try { playSnd('ui_click'); } catch (e) {} if (C.i >= C.steps.length) return end('done'); }
      }, 100); }); } };

  // ---------- 九天神雷：买下秘卷 → 行囊 → 技能 → 云霆 → 九天神雷 → 参悟（跳过＝直接学会）----------
  const F = () => (S.flags = S.flags || {});
  const tabIx = n => MTABS.indexOf(n);
  const tabR = n => { try { const L = menuLayout(), b = L.tabs[tabIx(n)]; return b ? [b.x, b.y, b.w, b.h] : null; } catch (e) { return null; } };
  const memR = k => { try { const m = menuLayout().members.find(m => m.k === k); return m ? [m.x, m.y, m.w, m.h] : null; } catch (e) { return null; } };
  const nodeR = (who, pred) => { try { if (!S.menu || S.menu.who !== who) return null; const G = window.SKT_GEO && SKT_GEO(); const o = G && G.nodes.find(pred); return o ? [o.x - o.r, o.y - o.r, o.r * 2, o.r * 2 + 22] : null; } catch (e) { return null; } };
  const btnR = () => { try { const G = SKT_GEO(); return [G.btn.x, G.btn.y, G.btn.w, G.btn.h]; } catch (e) { return null; } };
  const BAG = [W - 128, H - 112, 112, 104];
  const isTab = n => S.menu && MTABS[S.menu.tab] === n;
  window.SPOT_STEPS = { tabR, memR, nodeR, btnR, BAG, isTab };
  window.R207_JT_TUT = async function () {
    if (F().yt_jiutian) return;
    await say('星旋', '秘卷到手了——别光揣着，得让云霆参悟了才算数。我教你一遍：');
    const isJT = o => o.n && o.n.name === '九天神雷';
    const r = await SPOT.run([
      { title: '打开行囊', text: '点右下角的「行囊」。', rect: () => S.menu ? null : BAG, done: () => !!S.menu },
      { title: '技能页', text: '点左边的「技能」。', rect: () => tabR('技能'), done: () => isTab('技能') },
      { title: '换到云霆', text: '点上面云霆的头像，看他的技能。', rect: () => memR('yunting'), done: () => isTab('技能') && S.menu.who === 'yunting' },
      { title: '找到九天神雷', text: '「秘传」一列里就是九天神雷，点一下它。', rect: () => nodeR('yunting', isJT), done: () => window.SKT_SEL && /^yunting\.ult$/.test(SKT_SEL() || '') },
      { title: '参悟', text: '右下角「参悟」——用掉秘卷，云霆就学会了。', rect: () => btnR(), done: () => !!F().yt_jiutian },
    ]);
    if (r === 'skip' && !F().yt_jiutian && window.R134_YT_LEARN) { try { if (S.menu && typeof closeMenu === 'function') closeMenu(); } catch (e) {} await R134_YT_LEARN(); }
  };
})();
