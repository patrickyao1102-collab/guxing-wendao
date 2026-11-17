const { chromium } = require('playwright'); const fs = require('fs');
module.exports = async function boot() { const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await p.route('**/*', route => { const u = new URL(route.request().url()); if (u.hostname !== '127.0.0.1') return route.abort(); let f = decodeURIComponent(u.pathname); if (f === '/') f = '/index.html'; const fp = '/home/claude/guxing-wendao/game' + f;
    try { const body = fs.readFileSync(fp); const ext = fp.split('.').pop().toLowerCase(); const ct = { html: 'text/html; charset=utf-8', js: 'application/javascript; charset=utf-8', json: 'application/json', webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', mp3: 'audio/mpeg', woff2: 'font/woff2', ttf: 'font/ttf' }[ext] || 'application/octet-stream'; route.fulfill({ body, contentType: ct }); } catch (e) { route.fulfill({ status: 404, body: '' }); } });
  p.on('pageerror', e => console.log('ERR', e.message.slice(0, 300)));
  await p.goto('http://127.0.0.1:8792/index.html?part=town', { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 120; i++) { await p.waitForTimeout(1000); if (await p.evaluate(() => !!(world.map && S.fade === 0 && !world.locked))) break; await p.mouse.click(640, 600); }
  await p.waitForTimeout(3000);
  await p.evaluate(() => { sysPanel = null; S.started = true; const f = S.flags; f.ch2_plan = 1; f.ch3_night = 1; });
  return { b, p }; };
