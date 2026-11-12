// 浏览器试玩版（/play/）：站点根目录是加扰正式版（给手机 App 更新用），这里的 Service Worker 把 /play/ 下的请求
// 转到根目录对应文件，按同一把 KEY 还原再交给页面。测试版页面 game.html（带测试面板）本身是明文。
// 作者 11-08：测试版要保留全部素材 —— 手游正式版剔掉的旧配乐 / 旧图（release_drop.txt）在根目录找不到时，改从 GitHub 仓库原文件（明文）取。
// 作者 11-13：推了更新，测试版里只进测试版的东西（新楼、新支线、新配乐）还是旧的——因为这里原先钉死在「装这个 Service Worker 那次的提交」上，
// 浏览器里的 Service Worker 一旧，取回来的就全是旧文件。改成永远取 main 分支最新的，不再钉提交。（本次构建：__REF__）
const RAW = 'https://raw.githubusercontent.com/patrickyao1102-collab/guxing-wendao/main/game/';
const KEY = new Uint8Array([154,60,81,231,34,184,109,20,240,123,41,197,136,62,161,95,210,12,151,70,187,113,29,228,88,51,166,207,98,9,141,75,247,37,176,110,18,169,92,213,55,224,122,30,147,72,189,102,10,143,65,242,40,180,107,23,204,84,217]);
const PLAIN = /\/play\/(index\.html|sw\.js)?$/;
const TYPES = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml', js: 'text/javascript; charset=utf-8', json: 'application/json; charset=utf-8', css: 'text/css; charset=utf-8', html: 'text/html; charset=utf-8',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', ogg: 'audio/ogg', wav: 'audio/wav', mp4: 'video/mp4', webm: 'video/webm', woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf', txt: 'text/plain; charset=utf-8' };
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
function xor(buf) { const a = new Uint8Array(buf), n = a.length, k = KEY, L = k.length; for (let i = 0; i < n; i++) a[i] ^= k[i % L]; return a; }
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return;
  const base = location.pathname.replace(/sw\.js$/, '');          // …/play/
  if (!u.pathname.startsWith(base) || PLAIN.test(u.pathname)) return;
  // 作者 11-08：刚推送的更新要马上看得到 —— 一律带 no-cache 去问服务器（没变就是 304，不重下），不吃浏览器 10 分钟的旧缓存
  if (/\/play\/game\.html$/.test(u.pathname)) { e.respondWith(fetch(e.request.url, { cache: 'no-cache' })); return; }
  const rel = u.pathname.slice(base.length), real = base.replace(/play\/$/, '') + rel + u.search.replace(/[?&]retry=\d+/, '');
  e.respondWith((async () => {
    // 作者 11-12 夜：GitHub Pages 报「Rate limit exceeded」——每开一次游戏，几百个素材都带 no-cache 去问一遍服务器，连刷几次就被限流。
    // 改成：只有脚本 / 数据（js、json、html）每次都问新不新；图片、音乐、视频用浏览器缓存（最多旧 10 分钟），请求数少一大半。
    const fresh = /\.(js|json|html|txt)$/i.test(rel);
    let r = await fetch(real, { cache: fresh ? 'no-cache' : 'default' }), plain = false;
    if (r.status === 404 || r.status === 429 || r.status === 403) { const path = rel.split('/').map(encodeURIComponent).join('/');
      const r2 = await fetch(RAW + path, { cache: fresh ? 'no-cache' : 'default', mode: 'cors' }).catch(() => null);
      if (r2 && r2.ok) { r = r2; plain = true; } }
    if (!r.ok) return r;
    const buf = await r.arrayBuffer(), body = plain ? new Uint8Array(buf) : xor(buf), ext = (rel.split('.').pop() || '').toLowerCase(), type = TYPES[ext] || 'application/octet-stream';
    const range = e.request.headers.get('range');
    if (range) { const m = /bytes=(\d*)-(\d*)/.exec(range); if (m) { const s = m[1] ? +m[1] : 0, end = m[2] ? Math.min(+m[2], body.length - 1) : body.length - 1;
      return new Response(body.slice(s, end + 1), { status: 206, headers: { 'Content-Type': type, 'Content-Range': `bytes ${s}-${end}/${body.length}`, 'Accept-Ranges': 'bytes', 'Content-Length': String(end - s + 1) } }); } }
    return new Response(body, { status: 200, headers: { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': String(body.length) } });
  })());
});
