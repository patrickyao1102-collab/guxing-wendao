// 浏览器测试版（/play/）的 Service Worker。
// 站点根目录是加扰正式版（给手机 App 更新用）；只进测试版的文件（新楼、新支线、新人物……）加扰后放在 /play/t/ 下；游戏页 /play/game.html 是明文。
// 这里把 /play/ 下的请求转到对应文件，按同一把 KEY 还原再交给页面。
//
// 作者 11-13：「测试版经常加载不出来更新过后的版本，这一点最为严重，务必修好。」
// 病根：只进测试版的文件原先不在站点里，是从 raw.githubusercontent.com 现取的——那台服务器对没登录的访问限流（中文浏览器尤其容易中），
//   取不到时游戏不报错，直接拿旧样子顶上（听雨楼的茶娘变回大婶就是这么来的）；另外每开一次游戏几百个文件都要问一遍服务器，自己也容易被限流。
// 现在的办法：
//   ① 发布时生成一份清单 manifest.json：每个文件在哪（根目录 r / play/t t / play p）+ 内容指纹。每次进游戏先问一句 build.json 有没有新版本，有才重取清单。
//   ② 按「文件名 + 指纹」取文件，取到后核对指纹、还原，存进浏览器（Cache Storage）。以后只要指纹没变就不再联网——开游戏几乎不发请求，也就谈不上限流；
//      文件一改指纹就变，一定取到新的，不会再吃旧缓存。
//   ③ 取文件失败（限流 / 服务器半天不回话 / 传到一半卡住 / 断网）自动等一等重试，一处被限流所有请求一起歇一会儿；
//      自己站点实在取不到，再去仓库取原文件顶上；还是不行就告诉页面，页面上会明说「有文件没加载出来」。
//   ④ 清单里没有的文件（正式版剔掉的旧配乐、旧图，测试面板里试听旧版本用）照旧去仓库取，取到的也存着，7 天内不再去仓库。
// 这个文件本身很少改；改了取文件的办法就把 SWV 加一（加载页和游戏页靠它认出浏览器里装的是不是旧的）。
const SWV = 3;
const RAW = 'https://raw.githubusercontent.com/patrickyao1102-collab/guxing-wendao/main/game/';
const KEY = new Uint8Array([154,60,81,231,34,184,109,20,240,123,41,197,136,62,161,95,210,12,151,70,187,113,29,228,88,51,166,207,98,9,141,75,247,37,176,110,18,169,92,213,55,224,122,30,147,72,189,102,10,143,65,242,40,180,107,23,204,84,217]);
const TYPES = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml', js: 'text/javascript; charset=utf-8', json: 'application/json; charset=utf-8', css: 'text/css; charset=utf-8', html: 'text/html; charset=utf-8',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', ogg: 'audio/ogg', wav: 'audio/wav', mp4: 'video/mp4', webm: 'video/webm', woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf', txt: 'text/plain; charset=utf-8' };
const BASE = location.pathname.replace(/sw\.js$/, '');   // …/play/
const ROOT = BASE.replace(/play\/$/, '');                // 站点根目录
const STORE = 'gx-play-files-v1', META = 'gx-play-meta-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('message', e => { const d = e.data || {}; if (d.type === 'gx-clear') e.waitUntil(caches.delete(STORE).catch(() => {})); });

const sleep = ms => new Promise(r => setTimeout(r, ms));
const typeOf = rel => TYPES[(rel.split('.').pop() || '').toLowerCase()] || 'application/octet-stream';
const encPath = rel => rel.split('/').map(encodeURIComponent).join('/');
function xor(buf) { const a = new Uint8Array(buf), n = a.length, k = KEY, L = k.length; for (let i = 0; i < n; i++) a[i] ^= k[i % L]; return a; }
async function sha(buf) { const d = new Uint8Array(await crypto.subtle.digest('SHA-256', buf)); let s = ''; for (let i = 0; i < d.length; i++) s += d[i].toString(16).padStart(2, '0'); return s; }
function tell(msg) { self.clients.matchAll().then(cs => { for (const c of cs) c.postMessage(msg); }).catch(() => {}); }

// ---------- 联网：限流（429）/ 服务器抽风（5xx）/ 断网 / 半天不回话 / 传到一半卡住，都等一等再试 ----------
const WAIT = [500, 1500, 4000, 8000], RETRY = [403, 408, 425, 429, 500, 502, 503, 504];
const cool = { s: 0, r: 0 };   // 被限流后，站点（s）/ 仓库（r）各自歇到什么时候：一处被限流，所有请求一起歇，不接着往上撞
async function grab(url, opt, headMs) {   // → { ok, status, buf }
  const ac = new AbortController(); let timer = setTimeout(() => ac.abort(), headMs);
  try {
    const r = await fetch(url, Object.assign({ signal: ac.signal }, opt)); clearTimeout(timer);
    if (!r.ok) return { ok: false, status: r.status };
    const len = +r.headers.get('Content-Length') || 0;
    timer = setTimeout(() => ac.abort(), len ? 30000 + len / 50 : 240000);   // 传文件的时限：按每秒 50KB 的慢网算，再宽限半分钟
    return { ok: true, status: r.status, buf: await r.arrayBuffer() };
  } finally { clearTimeout(timer); }
}
// o.tries 最多试几次；o.headMs 等服务器回话的时限；o.urgent 急件（游戏页本身、问有没有新版本）：不跟着歇，少试几次，早点给个准话
async function net(url, opt, o) {
  o = o || {}; let tries = o.tries || 5; const headMs = o.headMs || 20000, t0 = Date.now(), k = url.startsWith(RAW) ? 'r' : 's'; let last = { ok: false, status: 0 };
  if (self.navigator && navigator.onLine === false) tries = 1;   // 明摆着没网：不干等
  for (let i = 0; i < tries; i++) {
    if (!o.urgent) { const gap = cool[k] - Date.now(); if (gap > 0) await sleep(gap); }
    try { const g = await grab(url, opt, headMs); if (g.ok || !RETRY.includes(g.status)) return g; last = g; } catch (e) { last = { ok: false, status: 0 }; }
    if (i >= tries - 1 || Date.now() - t0 > 30000) break;   // 一个文件最多耗半分钟，再不行就算没取到（页面上会明说）
    const w = WAIT[Math.min(i, WAIT.length - 1)] * (.7 + Math.random() * .6);
    if (last.status === 429 || last.status === 403) cool[k] = Math.max(cool[k], Date.now() + w);
    await sleep(w);
  }
  return last;
}
// 同时最多取几个：一口气发几百个请求最容易被限流。站点 12 个；仓库（只剩测试面板里试听旧配乐这类用）4 个，卡住了也不占站点的位子
function gate(n) { let a = 0; const q = []; return { async enter() { if (a >= n) await new Promise(r => q.push(r)); else a++; }, leave() { const w = q.shift(); if (w) w(); else a--; } }; }
const G = { s: gate(12), r: gate(4) };

// ---------- 清单 ----------
let MAN = null, manP = null;   // { b: 提交号, t: 发布时间, f: { 相对路径: 位置字母 + 指纹 } }
const metaKey = k => new Request(BASE + '__meta/' + k);
async function manStored() { try { const c = await caches.open(META), r = await c.match(metaKey('manifest')); return r ? await r.json() : null; } catch (e) { return null; } }
async function manFresh() {
  const r = await net(BASE + 'manifest.json?t=' + Date.now(), { cache: 'no-store' }, { tries: 3, headMs: 10000, urgent: true });
  if (!r.ok) throw new Error('manifest ' + r.status);
  const m = JSON.parse(new TextDecoder().decode(r.buf)); if (!m || !m.f || !m.b) throw new Error('manifest bad');
  try { const c = await caches.open(META); await c.put(metaKey('manifest'), new Response(JSON.stringify(m), { headers: { 'Content-Type': 'application/json' } })); } catch (e) {}
  return m;
}
function man() { if (MAN) return Promise.resolve(MAN); if (!manP) manP = (async () => { try { MAN = (await manStored()) || (await manFresh().catch(() => null)); } finally { manP = null; } return MAN; })(); return manP; }
// 每次进游戏页：先问一句有没有新版本，有才重取清单。联不上网就用上次存的（照样能玩）。
async function refresh() {
  try {
    const br = await net(BASE + 'build.json?t=' + Date.now(), { cache: 'no-store' }, { tries: 2, headMs: 6000, urgent: true });
    if (!br.ok) throw new Error('build');
    const b = JSON.parse(new TextDecoder().decode(br.buf)); let cur = MAN || await manStored(), changed = false;
    if (!cur || cur.b !== b.b || cur.t !== b.t) { cur = await manFresh(); changed = true; }   // 提交号或发布时间变了（同一个提交重新发布一次，游戏页也会变）
    MAN = cur; return changed;
  } catch (e) { if (!MAN) MAN = await manStored(); return false; }
}
// 清掉浏览器里已经用不上的旧文件（清单里没有了，或者指纹变了）
async function prune() {
  try { const m = MAN; if (!m) return; const c = await caches.open(STORE), pre = BASE + '__f/';
    for (const k of await c.keys()) { const u = new URL(k.url); let rel = u.pathname.slice(pre.length); try { rel = decodeURIComponent(rel); } catch (e) {}
      const ent = m.f[rel], h = u.searchParams.get('h');
      if (h === 'raw') { if (!ent) { const r = await c.match(k), at = r ? +r.headers.get('X-At') : 0; if (Date.now() - at < 7 * 864e5) continue; } await c.delete(k); }   // 从仓库取来存着的旧文件：留 7 天；进了清单就不留
      else if (!ent || ent.slice(1) !== h) await c.delete(k); } } catch (e) {}
}

// ---------- 取一个文件 ----------
const fileKey = (rel, hash) => new Request(BASE + '__f/' + encPath(rel) + '?h=' + hash);
const pending = new Map(), MISS = new Set(), FAILED = new Set();
async function openStore() { try { return await caches.open(STORE); } catch (e) { return null; } }
async function download(rel, where, hash, store, key, urgent) {
  const enc = encPath(rel), type = typeOf(rel), url = (where === 'r' ? ROOT : where === 't' ? BASE + 't/' : BASE) + enc + '?h=' + hash;
  if (!urgent) await G.s.enter();
  try {
    let g = await net(url, { cache: 'no-store' }, urgent ? { tries: 3, urgent: true } : null);
    if (g.ok) {
      let good = (await sha(g.buf)).startsWith(hash);
      if (!good) {   // 指纹对不上：多半是服务器那头这个文件还没换成新的。隔一下、绕开中间的缓存再取一次
        await sleep(1500); const g2 = await net(url + '&t=' + Date.now(), { cache: 'no-store' }, { tries: 2, urgent });
        if (g2.ok) { g = g2; good = (await sha(g.buf)).startsWith(hash); } }
      const bytes = where === 'p' ? new Uint8Array(g.buf) : xor(g.buf);
      if (good) { if (store) { try { await store.put(key, new Response(bytes, { headers: { 'Content-Type': type, 'Content-Length': String(bytes.length), 'Accept-Ranges': 'bytes' } })); } catch (e) {} } }
      else tell({ type: 'gx-newer' });   // 还是对不上：服务器上已经是更新的一版了（这份先给页面用，不存），让页面去看看有没有新版本
      return { bytes, type };
    }
    // 自己站点取不到（限流 / 断网）：去仓库取原文件顶上，不存，下次还是先问站点
    if (rel !== 'game.html') { const r2 = await net(RAW + enc, { cache: 'no-store', mode: 'cors' }, { tries: 2 }); if (r2.ok) return { bytes: new Uint8Array(r2.buf), type }; }
    return { fail: g.status || 504 };
  } finally { if (!urgent) G.s.leave(); }
}
// 清单里没有的文件：正式版剔掉的旧配乐、旧图 → 去仓库取（取不到不算事，正式版里本来就没有）。取到的也存在浏览器里，7 天内不再去仓库——
//   游戏一开场就会要 4 首早就不用的旧配乐，不存的话每开一次游戏都要去仓库跑一趟。连清单都没取到时退回老办法：根目录 → play/t → 仓库。
async function legacy(rel, haveMan) {
  const enc = encPath(rel), type = typeOf(rel);
  if (MISS.has(rel)) return { fail: 404 };
  if (!haveMan) for (const url of [ROOT + enc, BASE + 't/' + enc]) { const r = await net(url, { cache: 'no-cache' }, { tries: 2 }); if (r.ok) return { bytes: xor(r.buf), type }; }
  const key = fileKey(rel, 'raw'), store = haveMan ? await openStore() : null;
  if (store) { const hit = await store.match(key).catch(() => null); if (hit) return { hit }; }
  let p = pending.get(key.url);
  if (!p) { p = (async () => { await G.r.enter();
    try { const r2 = await net(RAW + enc, { cache: 'no-store', mode: 'cors' }, { tries: 3 });
      if (r2.ok) { const bytes = new Uint8Array(r2.buf);
        if (store) { try { await store.put(key, new Response(bytes, { headers: { 'Content-Type': type, 'Content-Length': String(bytes.length), 'Accept-Ranges': 'bytes', 'X-At': String(Date.now()) } })); } catch (e) {} }
        return { bytes, type }; }
      if (r2.status === 404) MISS.add(rel);
      return { fail: r2.status || 504 };
    } finally { G.r.leave(); } })(); pending.set(key.url, p); p.then(() => pending.delete(key.url), () => pending.delete(key.url)); }
  return p;
}
// → { hit: 存着的 Response } | { bytes, type } | { fail: 状态码 }
async function obtain(rel, urgent) {
  const m = await man(), ent = m && m.f[rel];
  if (!ent) return legacy(rel, !!m);
  const where = ent[0], hash = ent.slice(1), key = fileKey(rel, hash), store = await openStore();
  const fine = () => { if (FAILED.delete(rel)) tell({ type: 'gx-ok', rel }); };   // 先前没取到、这回取到了：告诉页面把它从「没加载出来」里划掉
  if (store) { const hit = await store.match(key).catch(() => null); if (hit) { fine(); return { hit }; } }
  let p = pending.get(key.url);
  if (!p) { p = download(rel, where, hash, store, key, urgent); pending.set(key.url, p); p.then(() => pending.delete(key.url), () => pending.delete(key.url)); }
  const got = await p;
  if (got.fail) { FAILED.add(rel); tell({ type: 'gx-fail', rel, status: got.fail }); } else fine();
  return got;
}

// ---------- 交给页面（音乐 / 视频会分段要） ----------
function part(src, size, type, range) {
  const m = /bytes=(\d*)-(\d*)/.exec(range || '');
  if (!m || (m[1] === '' && m[2] === '')) return new Response(src, { status: 200, headers: { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': String(size) } });
  let s, end;
  if (m[1] === '') { const n = Math.min(+m[2], size); s = size - n; end = size - 1; } else { s = +m[1]; end = m[2] ? Math.min(+m[2], size - 1) : size - 1; }
  if (s >= size || s > end) return new Response('', { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  return new Response(src.slice(s, end + 1), { status: 206, headers: { 'Content-Type': type, 'Content-Range': `bytes ${s}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': String(end - s + 1) } });
}
async function serve(req, rel) {
  const got = await obtain(rel), range = req.headers.get('range');
  if (got.fail) return new Response('', { status: got.fail });
  if (got.hit) { if (!range) return got.hit; const b = await got.hit.blob(); return part(b, b.size, got.hit.headers.get('Content-Type') || typeOf(rel), range); }
  return part(got.bytes, got.bytes.length, got.type, range);
}
// 游戏页：先看有没有新版本，再给页面。游戏页怎么都取不到（服务器限流 / 断网，浏览器里又没存过）时给一页人话，半分钟后自动再试，不甩一个白页
const HTML = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' };
function sorry(status) {
  const why = status === 429 || status === 403 ? '服务器一时限流，稍等一会儿就好' : status ? '服务器没给（' + status + '）' : '网络不通';
  return new Response('<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>孤星问道 · 测试版</title></head>'
    + '<body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#05070d;color:#f5e6c4;font:18px/1.9 \'Songti SC\',\'Noto Serif SC\',serif;text-align:center">'
    + '<div><b style="font-size:34px;color:#ffd66b">孤星问道</b><br>游戏页没取到：' + why + '。<br><span id="s">30</span> 秒后自动再试，也可以现在就刷新。</div>'
    + '<script>var n=30;setInterval(function(){n--;document.getElementById("s").textContent=Math.max(n,0);if(n===0)location.reload();},1000);</' + 'script></body></html>', { status: 200, headers: HTML });
}
async function page(e) {
  const changed = await refresh();
  if (changed) e.waitUntil((async () => { await sleep(20000); await prune(); })());
  let status = 0;
  if (MAN && MAN.f['game.html']) { const got = await obtain('game.html', true), body = got.hit ? await got.hit.arrayBuffer() : got.bytes;
    if (body) return new Response(body, { status: 200, headers: HTML }); status = got.fail || 0; }
  else { const g = await net(BASE + 'game.html?t=' + Date.now(), { cache: 'no-store' }, { tries: 2, urgent: true });   // 连清单都没有（头一回来就赶上服务器抽风）：直接要游戏页
    if (g.ok) return new Response(g.buf, { status: 200, headers: HTML }); status = g.status; }
  return sorry(status);
}

self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin !== location.origin || !u.pathname.startsWith(BASE)) return;
  let rel = u.pathname.slice(BASE.length); try { rel = decodeURIComponent(rel); } catch (err) {}
  if (rel === '' || rel === 'index.html' || rel === 'sw.js' || rel.startsWith('t/')) return;   // 加载页、本文件：浏览器自己取
  if (rel === '__sw') { e.respondWith((async () => { const m = MAN || await manStored(); return new Response(JSON.stringify({ v: SWV, b: m ? m.b : null, t: m ? m.t : null }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }); })()); return; }
  if (rel === 'build.json' || rel === 'manifest.json') { e.respondWith(fetch(BASE + rel + '?t=' + Date.now(), { cache: 'no-store' })); return; }
  if (rel === 'game.html') { e.respondWith(page(e)); return; }
  e.respondWith(serve(req, rel));
});
