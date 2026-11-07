// 浏览器试玩版（/play/）：站点根目录是加扰正式版（给手机 App 更新用），这里的 Service Worker 把 /play/ 下的请求
// 转到根目录对应文件，按同一把 KEY 还原再交给页面。测试版页面 game.html（带测试面板）本身是明文。
// 作者 11-08：测试版要保留全部素材 —— 手游正式版剔掉的旧配乐 / 旧图（release_drop.txt）在根目录找不到时，改从 GitHub 仓库原文件（明文）取。
const RAW = 'https://raw.githubusercontent.com/patrickyao1102-collab/guxing-wendao/__REF__/game/';
const KEY = new Uint8Array([154,60,81,231,34,184,109,20,240,123,41,197,136,62,161,95,210,12,151,70,187,113,29,228,88,51,166,207,98,9,141,75,247,37,176,110,18,169,92,213,55,224,122,30,147,72,189,102,10,143,65,242,40,180,107,23,204,84,217]);
const PLAIN = /\/play\/(index\.html|game\.html|sw\.js)?$/;
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
  const rel = u.pathname.slice(base.length), real = base.replace(/play\/$/, '') + rel + u.search.replace(/[?&]retry=\d+/, '');
  e.respondWith((async () => {
    let r = await fetch(real, { cache: 'default' }), plain = false;
    if (r.status === 404) { const r2 = await fetch(RAW + rel.split('/').map(encodeURIComponent).join('/'), { cache: 'default', mode: 'cors' }).catch(() => null); if (r2 && r2.ok) { r = r2; plain = true; } }
    if (!r.ok) return r;
    const buf = await r.arrayBuffer(), body = plain ? new Uint8Array(buf) : xor(buf), ext = (rel.split('.').pop() || '').toLowerCase(), type = TYPES[ext] || 'application/octet-stream';
    const range = e.request.headers.get('range');
    if (range) { const m = /bytes=(\d*)-(\d*)/.exec(range); if (m) { const s = m[1] ? +m[1] : 0, end = m[2] ? Math.min(+m[2], body.length - 1) : body.length - 1;
      return new Response(body.slice(s, end + 1), { status: 206, headers: { 'Content-Type': type, 'Content-Range': `bytes ${s}-${end}/${body.length}`, 'Accept-Ranges': 'bytes', 'Content-Length': String(end - s + 1) } }); } }
    return new Response(body, { status: 200, headers: { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': String(body.length) } });
  })());
});
