// ================= R134 · 手机端左下角 360° 摇杆（作者 11-07）=================
// 只在触屏设备上、地图自由行走时（地图 HUD 显示时）出现。按住左下角圆盘拖动，任意方向行走；松手停下。
// 走路仍用原来的移动 / 碰撞逻辑：摇杆只是给出方向（input.joy），和方向键同一条路径，所以不会穿墙。
(function () {
  if (typeof drawMapHud !== 'function' || typeof cv === 'undefined') return;
  const TOUCH = (() => { try { return matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0; } catch (e) { return false; } })() || /[?&]joy=1/.test(location.search);
  if (!TOUCH) return;
  const C = { x: 150, y: H - 160 }, R = 92, KR = 40;   // 逻辑坐标（1280×720）
  let pid = null, kx = 0, ky = 0, shown = 0, act = 0;
  const free = () => typeof S !== 'undefined' && S.hud && S.scene === drawMap && !battle && !dialog && !choice && !sysPanel && world && world.map && !world.locked && !window.CINE_PAUSE;
  const toL = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; };
  function setVec(p) { let dx = p.x - C.x, dy = p.y - C.y; const d = Math.hypot(dx, dy); if (d > R) { dx = dx / d * R; dy = dy / d * R; } kx = dx; ky = dy;
    const m = Math.min(1, d / R); input.joy = m < .18 ? null : { x: dx / (Math.hypot(dx, dy) || 1), y: dy / (Math.hypot(dx, dy) || 1), m }; }
  // 抢在画布自己的点击（点哪走哪）之前接住：按在圆盘范围里就归摇杆
  window.addEventListener('pointerdown', e => { if (pid !== null || !free() || e.target !== cv) return; const p = toL(e); if (Math.hypot(p.x - C.x, p.y - C.y) > R + 40) return;
    pid = e.pointerId; act = 1; e.stopPropagation(); e.preventDefault(); try { cv.setPointerCapture(pid); } catch (er) {} if (world) { world.path = null; world.walkTarget = null; world.pending = null; } setVec(p); }, { capture: true });
  window.addEventListener('pointermove', e => { if (e.pointerId !== pid) return; e.stopPropagation(); setVec(toL(e)); }, { capture: true });
  const end = e => { if (e.pointerId !== pid) return; e.stopPropagation(); pid = null; kx = ky = 0; input.joy = null; act = 0; };
  window.addEventListener('pointerup', end, { capture: true }); window.addEventListener('pointercancel', end, { capture: true });
  // 进剧情 / 对话 / 战斗时立刻松开，免得角色一直走
  setInterval(() => { if (pid !== null && !free()) { pid = null; kx = ky = 0; input.joy = null; act = 0; } }, 100);
  drawMapHud = (o => function () { const r = o.apply(this, arguments); try { draw(); } catch (e) {} return r; })(drawMapHud);
  function draw() {
    shown += ((free() ? 1 : 0) - shown) * .2; if (shown < .02) return;
    ctx.save(); ctx.globalAlpha = shown * (act ? .95 : .6);
    const g = ctx.createRadialGradient(C.x, C.y, R * .2, C.x, C.y, R); g.addColorStop(0, 'rgba(20,16,10,.25)'); g.addColorStop(1, 'rgba(20,16,10,.5)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(C.x, C.y, R, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(232,196,120,.75)'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.strokeStyle = 'rgba(232,196,120,.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(C.x, C.y, R - 10, 0, 7); ctx.stroke();
    // 四个方向的小三角
    ctx.fillStyle = 'rgba(240,214,150,.7)'; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.save(); ctx.translate(C.x + Math.cos(a) * (R - 22), C.y + Math.sin(a) * (R - 22)); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-5, -7); ctx.lineTo(-5, 7); ctx.closePath(); ctx.fill(); ctx.restore(); }
    // 摇杆头
    const x = C.x + kx, y = C.y + ky, kg = ctx.createRadialGradient(x - 10, y - 12, 4, x, y, KR); kg.addColorStop(0, 'rgba(255,240,205,.95)'); kg.addColorStop(.6, 'rgba(222,180,102,.9)'); kg.addColorStop(1, 'rgba(150,104,42,.9)');
    ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 10; ctx.fillStyle = kg; ctx.beginPath(); ctx.arc(x, y, KR, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(90,56,18,.8)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }
  window.JOY = { C, R };
})();
