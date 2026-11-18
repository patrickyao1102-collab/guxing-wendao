// ================= R134 · 手机端左下角 360° 摇杆（作者 11-07）=================
// 只在触屏设备上、地图自由行走时（地图 HUD 显示时）出现。按住左下角圆盘拖动，任意方向行走；松手停下。
// 走路仍用原来的移动 / 碰撞逻辑：摇杆只是给出方向（input.joy），和方向键同一条路径，所以不会穿墙。
(function () {
  if (typeof drawMapHud !== 'function' || typeof cv === 'undefined') return;
  const TOUCH = (() => { try { return matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0; } catch (e) { return false; } })() || /[?&]joy=1/.test(location.search);
  if (!TOUCH) return;
  const C = { x: 150, y: H - 160 }, R = 92, KR = 40;   // 逻辑坐标（1280×720）
  let pid = null, kx = 0, ky = 0, shown = 0, tap0 = null, holdTimer = null;
  const free = () => S.hud && S.scene === drawMap && !battle && !dialog && !choice && !sysPanel && !S.menu && !(window.MM_API && MM_API.MM.big) && world.map && !world.locked && !window.CINE_PAUSE;
  function setVec(p) {
    const dx = p.x - C.x, dy = p.y - C.y, distance = Math.hypot(dx, dy), radius = Math.min(distance, R);
    const ux = dx / (distance || 1), uy = dy / (distance || 1);
    kx = ux * radius; ky = uy * radius;
    input.joy = radius < R * .18 ? null : { x: ux, y: uy, m: radius / R };
  }
  function release() {
    clearTimeout(holdTimer); holdTimer = null; tap0 = null;
    pid = null; kx = 0; ky = 0; input.joy = null;
  }
  function engage(p) {
    clearTimeout(holdTimer); holdTimer = null; tap0 = null;
    world.path = null; world.walkTarget = null; world.pending = null;
    setVec(p);
  }
  // 点到摇杆下的 NPC 时先等一拍：轻触交给地图处理；拖动或按住才接管移动。
  window.addEventListener('pointerdown', e => {
    if (pid !== null || !free() || e.target !== cv || e.button !== 0) return;
    const p = toLogical(e);
    if (Math.hypot(p.x - C.x, p.y - C.y) > R + 14) return;
    pid = e.pointerId; e.stopPropagation(); e.preventDefault();
    try { cv.setPointerCapture(pid); } catch (err) {}
    const cam = world.cam || { x: 0, y: 0 };
    if (pickInteract(p.x / VZ() + cam.x, p.y / VZ() + cam.y)) {
      tap0 = { p, last: p };
      holdTimer = setTimeout(() => { if (tap0 && free()) engage(tap0.last); else release(); }, 250);
    } else engage(p);
  }, true);
  window.addEventListener('pointermove', e => {
    if (e.pointerId !== pid) return;
    e.stopPropagation();
    if (!free()) { release(); return; }
    const p = toLogical(e);
    if (tap0) {
      tap0.last = p;
      if (Math.hypot(p.x - tap0.p.x, p.y - tap0.p.y) * SCALE < 8) return;
      engage(p);
    } else setVec(p);
  }, true);
  window.addEventListener('pointerup', e => {
    if (e.pointerId !== pid) return;
    e.stopPropagation();
    const tap = tap0 && free() ? tap0.p : null;
    release();
    if (tap) input.tapped = tap;
  }, true);
  const cancel = e => { if (e.pointerId === pid) release(); };
  window.addEventListener('pointercancel', cancel, true);
  cv.addEventListener('lostpointercapture', cancel);
  window.addEventListener('blur', release);
  document.addEventListener('visibilitychange', () => { if (document.hidden) release(); });
  drawMapHud = (o => function () { const r = o.apply(this, arguments); try { draw(); } catch (e) {} return r; })(drawMapHud);
  function draw() {
    const available = free(); if (!available && pid !== null) release();
    const act = pid !== null; shown += ((available ? 1 : 0) - shown) * .2; if (shown < .02) return;
    // 有人站在摇杆底下时，摇杆淡一点，看得见那个人（作者 11-15）
    let under = 0; if (!act) try { const cam = world.cam || { x: 0, y: 0 }, z = VZ(); for (const a of world.actors || []) { if (!a.npc || a.hidden) continue; const sx = (a.x - cam.x) * z, sy = (a.y - 40 - cam.y) * z; if (Math.hypot(sx - C.x, sy - C.y) < R + 30) { under = 1; break; } } } catch (er) {}
    ctx.save(); ctx.globalAlpha = shown * (act ? .95 : under ? .32 : .6);
    const g = ctx.createRadialGradient(C.x, C.y, R * .2, C.x, C.y, R); g.addColorStop(0, 'rgba(20,16,10,.25)'); g.addColorStop(1, 'rgba(20,16,10,.5)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(C.x, C.y, R, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(232,196,120,.75)'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.strokeStyle = 'rgba(232,196,120,.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(C.x, C.y, R - 10, 0, 7); ctx.stroke();
    // 四个方向的小三角
    ctx.fillStyle = 'rgba(240,214,150,.7)'; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.save(); ctx.translate(C.x + Math.cos(a) * (R - 22), C.y + Math.sin(a) * (R - 22)); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-5, -7); ctx.lineTo(-5, 7); ctx.closePath(); ctx.fill(); ctx.restore(); }
    // 摇杆头
    const x = C.x + kx, y = C.y + ky, kg = ctx.createRadialGradient(x - 10, y - 12, 4, x, y, KR); kg.addColorStop(0, 'rgba(255,240,205,.95)'); kg.addColorStop(.6, 'rgba(222,180,102,.9)'); kg.addColorStop(1, 'rgba(150,104,42,.9)');
    ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 10; ctx.fillStyle = act ? kg : 'rgba(232,196,120,.15)'; ctx.beginPath(); ctx.arc(x, y, KR, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = act ? 'rgba(90,56,18,.8)' : 'rgba(247,225,180,.85)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }
  window.JOY = { C, R };
})();
