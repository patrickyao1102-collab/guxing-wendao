// ================= R469 · 万妖塔二～六层：地图局部动态（WebGL2，只进测试版）=================
// Codex 给每一苑交了一张「哪里能动、动多少」的权重图（R8 单通道）和 WebGL2 着色器，不烘焙动画帧，直接从底图上取色挪一挪：
//   二层（R447 weather）：冰面反光、烽火台的火苗和烟——原版是整屏后期，这里改成「只叠加亮光」，不重采底图，免得整屏变糊；雪花另用 Canvas 2D 画（在 r469_floors.js）。
//   三、四层（R448 motion）：水草慢摆、黑火上窜、烟横移、热浪扭曲。封炉以后那座炉的块按 disable_when 停掉。
//   五、六层（R465 scene）：五层石地「呼吸」、六层固定灯火摇曳。
// 为什么另开一块看不见的 WebGL2 画布：游戏本身是 2D 画布。只画镜头里有权重的块，画完整块贴回地图（在底图之上、法阵和人物之下）。
// 为什么分页上传：底图 5040×3600，手机贴图上限常是 4096，所以只把镜头附近 2560×1600 的一块传给 WebGL，镜头走远了再换一块（照 r457 的做法）。
// 没有 WebGL2、着色器编不过的机器：什么也不做，地图照旧是静的，不报错。
(function () {
  let G = null, failed = false;
  const WT = {};   // WT[苑键] = { tex, meta } 或 'loading' / 'bad'
  // ---------- 着色器（Codex 原样；二层的改成只出叠加亮光） ----------
  const MOTION_VS = `#version 300 es
precision highp float; precision highp int;
uniform highp sampler2D uWeights; uniform ivec4 uBlock; uniform vec4 uCamera; uniform int uKind; uniform float uPhase;
out vec2 vWorld; out vec2 vShift;
float gust(float angle){ float k=0.5+0.5*cos(angle); k*=k; k*=k; return k*k; }
void main(){
  int col=gl_VertexID/2; int row=gl_InstanceID+(gl_VertexID&1); int addr=uBlock.w+row*uBlock.z+col;
  float flex=texelFetch(uWeights,ivec2(addr&255,addr>>8),0).r;
  vec2 p=vec2(uBlock.xy+10*ivec2(col,row)); vWorld=p; vShift=vec2(0.0);
  if(flex>0.0&&uPhase!=0.0){
    float a=-0.0038*p.x+0.0041*p.y+0.42*sin(0.009*p.y-0.005*p.x); float b=0.0062*p.y-0.0080*p.x; float f=-0.0340*p.x+0.0260*p.y; float g=-0.0017*p.x-0.00038*p.y+0.7;
    float pulse=gust(uPhase+g)-gust(g); float sway=sin(3.0*uPhase+a)-sin(a); float drift=sin(2.0*uPhase+b)-sin(b); float tremble=sin(8.0*uPhase+f)-sin(f);
    vShift.x=flex*(3.65*sway+1.25*drift+3.15*pulse+0.62*tremble);
    vShift.y=flex*(0.86*(cos(3.0*uPhase+a)-cos(a))+0.34*tremble-0.32*pulse);
    if(uKind==1) vShift=flex*vec2(2.8*(sin(6.0*uPhase+a)-sin(a)),4.2*(sin(5.0*uPhase+b)-sin(b)));
    if(uKind==2) vShift=flex*vec2(5.5*(sin(2.0*uPhase+a)-sin(a)),3.1*(cos(uPhase+b)-cos(b)));
    if(uKind==3) vShift=flex*vec2(2.9*(sin(4.0*uPhase+0.035*p.y)-sin(0.035*p.y)),0.7*tremble);
  }
  vec2 s=(p-uCamera.xy)/uCamera.zw; gl_Position=vec4(s.x*2.0-1.0,1.0-s.y*2.0,0.0,1.0); }`;
  const MOTION_FS = `#version 300 es
precision highp float;
uniform sampler2D uBase; uniform vec4 uPage; uniform vec4 uCover; in vec2 vWorld; in vec2 vShift; out vec4 color;
void main(){ if(all(equal(vShift,vec2(0.0)))||any(lessThan(vWorld,uCover.xy))||any(greaterThanEqual(vWorld,uCover.zw))) discard;
  color=texture(uBase,(vWorld+vShift-uPage.xy)/uPage.zw); }`;
  const SCENE_VS = `#version 300 es
precision highp float; uniform vec4 uCamera; uniform vec4 uDraw; out vec2 world;
void main(){ vec2 c=vec2(float(gl_VertexID&1),float(gl_VertexID>>1)); world=uDraw.xy+c*uDraw.zw; vec2 s=(world-uCamera.xy)/uCamera.zw; gl_Position=vec4(s.x*2.0-1.0,1.0-s.y*2.0,0.0,1.0); }`;
  const SCENE_FS = `#version 300 es
precision highp float;
uniform sampler2D uBase; uniform sampler2D uWeights; uniform vec4 uPage; uniform vec4 uMaskWorld; uniform vec4 uMaskUV; uniform float uPhase; uniform float uAmplitude; uniform float uGain; uniform bool uFire;
in vec2 world; out vec4 color;
void main(){ vec2 maskUV=uMaskUV.xy+(world-uMaskWorld.xy)/uMaskWorld.zw*uMaskUV.zw; float w=texture(uWeights,maskUV).r; if(w<=0.0) discard;
  float wave=sin(uPhase),fast=sin(2.0*uPhase); vec2 d=vec2(0.0);
  if(uFire) d.x=w*uAmplitude*(0.76*wave+0.24*fast*sin(world.y*0.079)); else d.y=w*uAmplitude*(0.76+0.24*sin(world.x*0.0038+world.y*0.0019))*wave;
  color=texture(uBase,(world+d-uPage.xy)/uPage.zw); if(uFire) color.rgb*=1.0+w*uGain*(0.72*wave+0.28*fast); }`;
  const FULL_VS = `#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}`;
  // 二层：Codex weather.frag 的冰光、火苗两项（都是往底色上「加亮」），雪和烟的扭曲拿掉——叠加用 lighter，底图本身不重采，镜头不会糊
  const WEATHER_FS = `#version 300 es
precision highp float;
uniform sampler2D uWeights; uniform vec2 uView, uAtlas; uniform vec4 uCamera; uniform vec4 uRects[4], uWorlds[4]; uniform float uTime; out vec4 color;
float weightAt(vec2 p,int i){ vec2 uv=(p-uWorlds[i].xy)/uWorlds[i].zw; if(any(lessThan(uv,vec2(0.0)))||any(greaterThan(uv,vec2(1.0)))) return 0.0;
  vec2 t=uRects[i].xy+clamp(uv*uRects[i].zw,vec2(.5),uRects[i].zw-vec2(.5)); return texture(uWeights,t/uAtlas).r; }
void main(){ vec2 px=vec2(gl_FragCoord.x,uView.y-gl_FragCoord.y); vec2 p=uCamera.xy+px/uView*uCamera.zw;
  float ice=weightAt(p,1), flame=weightAt(p,2); if(ice+flame<=0.003) discard;
  float sh=.5+.5*sin(p.x*.025+p.y*.073+uTime*1.9+sin(p.y*.104)*.9);
  vec3 add=vec3(.054,.089,.113)*pow(sh,8.0)*ice*1.6 + vec3(.12,.065,.018)*flame*(.3+.7*sin(uTime*8.5+p.y*.12));
  add=clamp(add,vec3(0.0),vec3(1.0)); color=vec4(add,max(add.r,max(add.g,add.b))); }`;

  function boot() {
    if (G || failed) return G;
    try {
      const cv = document.createElement('canvas'); cv.width = 16; cv.height = 16;
      const gl = cv.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false, preserveDrawingBuffer: false });
      if (!gl) throw new Error('no webgl2');
      const mk = (vs, fs, names) => { const pr = gl.createProgram();
        for (const [k, s] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) { const sh = gl.createShader(k); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(pr, sh); gl.deleteShader(sh); }
        gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
        const U = {}; for (const n of names) U[n] = gl.getUniformLocation(pr, n); return { pr, U }; };
      const P = {
        motion: mk(MOTION_VS, MOTION_FS, ['uWeights', 'uBase', 'uCamera', 'uPhase', 'uPage', 'uCover', 'uBlock', 'uKind']),
        scene: mk(SCENE_VS, SCENE_FS, ['uCamera', 'uDraw', 'uBase', 'uWeights', 'uPage', 'uMaskWorld', 'uMaskUV', 'uPhase', 'uAmplitude', 'uGain', 'uFire']),
        weather: mk(FULL_VS, WEATHER_FS, ['uWeights', 'uView', 'uAtlas', 'uCamera', 'uRects[0]', 'uWorlds[0]', 'uTime']) };
      const page = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, page);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
      G = { gl, cv, P, page, pc: document.createElement('canvas'), pg: null, src: null, vao: gl.createVertexArray(), lost: false };
      cv.addEventListener('webglcontextlost', e => { e.preventDefault(); failed = true; }, false);
    } catch (e) { failed = true; console.warn('R469 动态：本机没有 WebGL2，地图保持静止', e && e.message); }
    return G;
  }
  // 权重：一苑一张 R8 纹理。换苑时把别的苑的删掉，省显存
  function weights(key, url, D) {
    const w = WT[key]; if (w && w !== 'loading') return w === 'bad' ? null : w; if (w === 'loading') return null;
    WT[key] = 'loading';
    fetch(url).then(r => { if (!r.ok) throw new Error(url); return r.arrayBuffer(); }).then(buf => {
      const gl = G.gl, tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      if (D.t === 'motion') { const [w2, h2] = D.size; const a = new Uint8Array(w2 * h2); a.set(new Uint8Array(buf).subarray(0, w2 * h2)); gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, w2, h2, 0, gl.RED, gl.UNSIGNED_BYTE, a); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); }
      else if (D.t === 'weather') { const [w2, h2] = D.atlas; gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, w2, h2, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array(buf)); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); }
      else {   // scene：稀疏小块拼成一张图集（Codex scene-pass.mjs 的做法）
        const slot = 34, ps = D.patches, cols = Math.ceil(Math.sqrt(ps.length)), W2 = cols * slot, H2 = Math.ceil(ps.length / cols) * slot;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, W2, H2, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array(W2 * H2));
        ps.forEach((p, i) => { const [off, w3, h3] = p, x = (i % cols) * slot, y = Math.floor(i / cols) * slot; gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, w3, h3, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array(buf, off, w3 * h3)); p.uv = [x / W2, y / H2, w3 / W2, h3 / H2]; });
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      for (const k in WT) if (k !== key && WT[k] && WT[k].tex) { try { gl.deleteTexture(WT[k].tex); } catch (e) {} delete WT[k]; }
      WT[key] = { tex };
    }).catch(e => { WT[key] = 'bad'; console.warn('R469 动态权重', key, e && e.message); });
    return null;
  }
  // 镜头附近换一块底图（页大小跟着镜头放大，最大 4096）
  function upload(base, cam, vw, vh, MW, MH) {
    const { gl, pc, page } = G; const PW = Math.min(MW, 4096, Math.max(2560, Math.ceil(vw + 160))), PH = Math.min(MH, 4096, Math.max(1600, Math.ceil(vh + 160)));
    if (G.pg && G.src === base && G.pg[2] === PW && G.pg[3] === PH && cam.x >= G.pg[0] + 8 && cam.y >= G.pg[1] + 8 && cam.x + vw <= G.pg[0] + PW - 8 && cam.y + vh <= G.pg[1] + PH - 8) return;
    const x = Math.max(0, Math.min(MW - PW, Math.round(cam.x + vw / 2 - PW / 2))), y = Math.max(0, Math.min(MH - PH, Math.round(cam.y + vh / 2 - PH / 2)));
    if (pc.width !== PW || pc.height !== PH) { pc.width = PW; pc.height = PH; }
    const g = pc.getContext('2d'); g.clearRect(0, 0, PW, PH); g.drawImage(base, x * base.width / MW, y * base.height / MH, PW * base.width / MW, PH * base.height / MH, 0, 0, PW, PH);
    gl.bindTexture(gl.TEXTURE_2D, page); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pc);
    G.pg = [x, y, PW, PH]; G.src = base;
  }
  const hit = (x, y, w, h, x0, y0, x1, y1) => !(x >= x1 || y >= y1 || x + w <= x0 || y + h <= y0);
  // 主入口：在地图坐标系里画（ctx 已经套好镜头）。key：苑键；D：meta 里的 dyn；flags：court_1_activated 等
  function draw(ctx, base, key, url, D, flags, now, MW, MH) {
    if (!D || failed) return false; if (!G && !boot()) return false;
    if (!base || !base.width) return false;
    const w = weights(key, url, D); if (!w) return false;
    const gl = G.gl, cv = G.cv, cam = world.cam || { x: 0, y: 0 }, zm = VZ(), vw = W / zm, vh = H / zm;
    const x0 = cam.x, y0 = cam.y, x1 = cam.x + vw, y1 = cam.y + vh;
    // 先看镜头里有没有要动的块：没有就整帧不碰 WebGL
    let any = false;
    if (D.t === 'motion') { for (const b of D.blocks) if (!(b[8] && flags[b[8]]) && hit(b[0], b[1], b[2], b[3], x0, y0, x1, y1)) { any = true; break; } }
    else if (D.t === 'scene') { for (const p of D.patches) if (hit(p[7], p[8], p[9], p[10], x0, y0, x1, y1)) { any = true; break; } }
    else any = true;
    if (!any) return false;
    const sc = Math.min(1, 1600 / vw), cw = Math.max(16, Math.round(vw * sc)), ch = Math.max(16, Math.round(vh * sc));
    if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
    gl.viewport(0, 0, cw, ch); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(G.vao); gl.disable(gl.BLEND); gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    const camv = [cam.x, cam.y, vw, vh]; let n = 0, mode = 'source-over';
    if (D.t === 'motion' || D.t === 'scene') upload(base, cam, vw, vh, MW, MH);
    const pgr = G.pg;
    if (D.t === 'motion') { const { pr, U } = G.P.motion, t = ((now % D.loop) + D.loop) % D.loop; if (!t) return false;
      gl.useProgram(pr); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, w.tex); gl.uniform1i(U.uWeights, 1);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, G.page); gl.uniform1i(U.uBase, 0);
      gl.uniform4fv(U.uCamera, camv); gl.uniform1f(U.uPhase, t * 2 * Math.PI / D.loop);
      gl.uniform4fv(U.uPage, pgr); gl.uniform4fv(U.uCover, [pgr[0] + 12, pgr[1] + 12, pgr[0] + pgr[2] - 12, pgr[1] + pgr[3] - 12]);
      for (const b of D.blocks) { if (b[8] && flags[b[8]]) continue; if (!hit(b[0], b[1], b[2], b[3], x0, y0, x1, y1)) continue;
        gl.uniform1i(U.uKind, b[7]); gl.uniform4i(U.uBlock, b[0], b[1], b[4], b[6]); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 2 * b[4], b[5] - 1); n++; } }
    else if (D.t === 'scene') { const { pr, U } = G.P.scene, t = ((now % D.period) + D.period) % D.period; if (!t) return false;
      gl.useProgram(pr); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, w.tex); gl.uniform1i(U.uWeights, 1);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, G.page); gl.uniform1i(U.uBase, 0);
      gl.uniform4fv(U.uCamera, camv); gl.uniform1f(U.uPhase, t * 2 * Math.PI / D.period); gl.uniform1f(U.uAmplitude, D.amp); gl.uniform1f(U.uGain, D.gain); gl.uniform1i(U.uFire, D.mode === 'flame' ? 1 : 0);
      gl.uniform4fv(U.uPage, pgr);
      const cl = Math.max(x0, pgr[0] + 4), ct = Math.max(y0, pgr[1] + 4), cr = Math.min(x1, pgr[0] + pgr[2] - 4), cb = Math.min(y1, pgr[1] + pgr[3] - 4);
      for (const p of D.patches) { if (!p.uv) continue; const [, , , tx, ty, tw, th, px, py, pw, ph] = p;
        const a0 = Math.max(px, cl), b0 = Math.max(py, ct), a1 = Math.min(px + pw, cr), b1 = Math.min(py + ph, cb); if (a0 >= a1 || b0 >= b1) continue;
        gl.uniform4f(U.uDraw, a0, b0, a1 - a0, b1 - b0); gl.uniform4f(U.uMaskWorld, tx, ty, tw, th); gl.uniform4fv(U.uMaskUV, p.uv); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); n++; } }
    else { const { pr, U } = G.P.weather; mode = 'lighter';
      gl.useProgram(pr); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, w.tex); gl.uniform1i(U.uWeights, 1);
      gl.uniform2f(U.uView, cw, ch); gl.uniform2fv(U.uAtlas, D.atlas); gl.uniform4fv(U.uCamera, camv);
      gl.uniform4fv(U['uRects[0]'], D.rects.flat()); gl.uniform4fv(U['uWorlds[0]'], D.worlds.flat()); gl.uniform1f(U.uTime, now % 600);
      gl.drawArrays(gl.TRIANGLES, 0, 3); n = 1; }
    if (!n) return false;
    ctx.save(); ctx.globalCompositeOperation = mode; ctx.drawImage(cv, 0, 0, cw, ch, cam.x, cam.y, vw, vh); ctx.restore();
    return true;
  }
  window.R469_DYN = { draw, boot, on: () => !failed, get G() { return G; } };
})();
