// ================= R457 · 万妖塔一层外苑：彼岸花随风摆（Codex R452，只进测试版）=================
// 作者 11-28：「能不能让 Codex 让那花动起来啊？」
// Codex 交的是一张「哪里能弯、弯多少」的权重图 + 一对 WebGL2 着色器：不烘焙动画帧，直接从底图上取色、按风向把花头挪一挪。
// 游戏是 2D 画布，所以另开一块看不见的 WebGL2 画布，只画镜头里的花，再整块贴回地图（在底图之上、栏杆前景和人物之下）。
// 底图太大（5040×3600，手机贴图上限常是 4096），只把镜头附近 2560×1600 的一块传给 WebGL，镜头走远了再换一块。
// 没有 WebGL2 的机器什么也不做，花照旧是静的。只在 B 版生效（权重图是照 B 版三苑的花圃位置做的）。
// 11-28 14:00：中苑、内苑也到了；外苑按 R453 修整后的底图重出了一份（避开新栏杆）。三苑共用一个 WebGL 画布和着色器，各自一张权重图。
(function () {
  const DIR = 'r457/';
  let ready = null, failed = false, P = null; const ZW = {};   // ZW[苑] = { L, mask } 或 'loading'
  const PW = 2560, PH = 1600;   // 传给 WebGL 的那一块底图
  function boot() {
    if (ready || failed) return ready;
    ready = (async () => {
      try {
        const cv = document.createElement('canvas'); cv.width = 16; cv.height = 16;
        const gl = cv.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false, preserveDrawingBuffer: false });
        if (!gl) throw new Error('no webgl2');
        const get = n => fetch(DIR + n + '?v=2').then(r => { if (!r.ok) throw new Error(n); return r; });
        const [vs, fs] = await Promise.all([get('a/flower.vert').then(r => r.text()), get('a/flower.frag').then(r => r.text())]);
        const prog = gl.createProgram();
        for (const [k, s] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) { const sh = gl.createShader(k); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(prog, sh); }
        gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
        const U = {}; for (const n of ['uWeights', 'uBase', 'uCamera', 'uPhase', 'uPage', 'uCover', 'uBlock']) U[n] = gl.getUniformLocation(prog, n);
        const page = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, page);
        for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
        const pc = document.createElement('canvas'); pc.width = PW; pc.height = PH;
        P = { gl, cv, prog, U, page, pc, pg: null, src: null, vao: gl.createVertexArray() };
        return P;
      } catch (e) { failed = true; console.warn('R457 花', e); return null; }
    })();
    return ready;
  }
  function zoneW(z) { if (ZW[z]) return ZW[z] === 'loading' ? null : ZW[z]; ZW[z] = 'loading';
    Promise.all([fetch(DIR + z + '/flowers.json?v=2').then(r => r.json()), fetch(DIR + z + '/flex.r8?v=2').then(r => r.arrayBuffer())]).then(([L, W8]) => {
      const gl = P.gl, [ww, wh] = L.weightTextureSize, mask = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, mask); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, ww, wh, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array(W8));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      ZW[z] = { L, mask }; }).catch(e => { console.warn('R457 花 ' + z, e); });
    return null; }
  // 镜头附近换一块底图
  function upload(base, cx, cy, vw, vh) {
    const { gl, pc, page } = P, MW = 5040, MH = 3600;
    if (P.pg && P.src === base && cx >= P.pg[0] + 8 && cy >= P.pg[1] + 8 && cx + vw <= P.pg[0] + PW - 8 && cy + vh <= P.pg[1] + PH - 8) return;
    const x = Math.max(0, Math.min(MW - PW, Math.round(cx + vw / 2 - PW / 2))), y = Math.max(0, Math.min(MH - PH, Math.round(cy + vh / 2 - PH / 2)));
    const g = pc.getContext('2d'); g.clearRect(0, 0, PW, PH); g.drawImage(base, x * base.width / MW, y * base.height / MH, PW * base.width / MW, PH * base.height / MH, 0, 0, PW, PH);
    gl.bindTexture(gl.TEXTURE_2D, page); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pc);
    P.pg = [x, y]; P.src = base;
  }
  // 在地图坐标系里画（ctx 已经套好镜头）
  function draw(ctx, base, now, z = 'a') {
    if (!P) { boot(); return; }
    const Z = zoneW(z); if (!Z) return;
    if (!base || !base.width) return;
    const cam = world.cam || { x: 0, y: 0 }, zm = VZ(), vw = W / zm, vh = H / zm;
    const sc = Math.min(1, 1600 / vw), cw = Math.max(16, Math.round(vw * sc)), ch = Math.max(16, Math.round(vh * sc));
    const { gl, cv, U, prog, page } = P, L = Z.L, mask = Z.mask;
    if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
    upload(base, cam.x, cam.y, vw, vh);
    const t = ((now % L.loopSeconds) + L.loopSeconds) % L.loopSeconds; if (t === 0) return;
    gl.viewport(0, 0, cw, ch); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog); gl.bindVertexArray(P.vao); gl.disable(gl.BLEND); gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, mask); gl.uniform1i(U.uWeights, 1);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, page); gl.uniform1i(U.uBase, 0);
    const camv = [cam.x, cam.y, vw, vh]; gl.uniform4fv(U.uCamera, camv); gl.uniform1f(U.uPhase, t * 2 * Math.PI / L.loopSeconds);
    const [px, py] = P.pg; gl.uniform4fv(U.uPage, [px, py, PW, PH]); gl.uniform4fv(U.uCover, [px + 12, py + 12, px + PW - 12, py + PH - 12]);
    const x0 = cam.x, y0 = cam.y, x1 = cam.x + vw, y1 = cam.y + vh; let n = 0;
    for (const b of L.blocks) { if (b.x >= x1 || b.y >= y1 || b.x + b.w <= x0 || b.y + b.h <= y0) continue; gl.uniform4i(U.uBlock, b.x, b.y, b.cols, b.offset); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 2 * b.cols, b.rows - 1); n++; }
    if (n) ctx.drawImage(cv, 0, 0, cw, ch, cam.x, cam.y, vw, vh);
  }
  window.R457 = { draw, boot, on: () => !failed };
})();
