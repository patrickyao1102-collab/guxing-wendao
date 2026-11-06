// 作者 11-06：野外草地要能走，只有树木 / 岩石 / 山脊 / 树桩 / 倒木挡路（以前 Codex 的 walkability 只放行土路，草地全挡）。
// 用法：node tools/r107_mapgen/regrid_walk.js yy_tiger yy_verge cy_north  → 按物件脚底重算 16px 通行格，写回 game/r107_maps.js
const fs = require('fs'); const P = __dirname + '/../../game/r107_maps.js';
const L = fs.readFileSync(P, 'utf8').split('\n'); const DL = L.findIndex(l => l.startsWith('  const DATA = ')), NL = L.findIndex(l => l.trim().startsWith('const NAMES = '));
const nl = L[NL].trim(); const N = JSON.parse(nl.slice(nl.indexOf('['), nl.indexOf('], ATLAS') + 1));
const D = JSON.parse(L[DL].slice('  const DATA = '.length).trim().replace(/;$/, ''));
const TREE = /tree|pine|fir|birch|sophora|camphor|cypress|bamboo|vine|scholar|willow|tallow|ginkgo|maple|osmanthus|plum|peach|albizia|jujube|mulberry|pear|persimmon|木|松|柏|樟|杉|槐|柳|树|桦|枫|银杏|榕|槿/, ROCK = /rock|boulder|stone|石|岩|崖/, RIDGE = /脊|收梢|主脊|崖壁|cliff|wall|栅|fence|palisade/, STUMP = /stump|log|倒木|根盘|桩/;
const LOW = /shrub|fern|tea|grass|reed|mushroom|flower|moss|slate|plant|iris|daisy|violet|thatch|foxtail|leaves|petal|蕨|荆|草|苔|花|菇|叶|藤蔓|蘑/;
function kind(n) { if (/_fm_|_w\d$|_wl\d$|glow|npc_|^mt_|petal/.test(n)) return 'low'; n = n.replace(/^[a-z]+_/, ''); if (RIDGE.test(n)) return 'ridge'; if (STUMP.test(n)) return 'stump'; if (ROCK.test(n) && !LOW.test(n)) return 'rock'; if (TREE.test(n)) return 'tree'; return LOW.test(n) ? 'low' : 'prop'; }
for (const id of process.argv.slice(2)) {
  const m = D[id]; if (!m) { console.log('no', id); continue; }
  const cols = m.cols, rows = m.rows, G = new Uint8Array(cols * rows), CS = 16;
  const blk = (cx, cy, rx, ry) => { for (let r = Math.max(0, Math.floor((cy - ry) / CS)); r <= Math.min(rows - 1, Math.floor((cy + ry) / CS)); r++) for (let c = Math.max(0, Math.floor((cx - rx) / CS)); c <= Math.min(cols - 1, Math.floor((cx + rx) / CS)); c++) { const dx = (c + .5) * CS - cx, dy = (r + .5) * CS - cy; if (dx * dx / (rx * rx) + dy * dy / (ry * ry) <= 1) G[r * cols + c] = 1; } };
  const cnt = {};
  for (const [i, x, y, w, h, sy, f] of m.o) { if (f & 1) continue; const k = kind(N[i]); cnt[k] = (cnt[k] || 0) + 1; const cx = x + w / 2, fy = sy || y + h;
    if (k === 'tree') blk(cx, fy - 6, Math.max(16, w * .2), Math.max(9, w * .09));
    else if (k === 'rock') blk(cx, fy - h * .12, w * .42, Math.max(10, h * .28));
    else if (k === 'ridge') blk(cx, fy - h * .2, w * .48, Math.max(12, h * .4));
    else if (k === 'stump') blk(cx, fy - h * .15, w * .4, Math.max(8, h * .25));
    else if (k === 'prop') blk(cx, fy - h * .1, w * .35, Math.max(8, h * .2)); }
  // 地图四边留 1 格
  for (let c = 0; c < cols; c++) { G[c] = 1; G[(rows - 1) * cols + c] = 1; } for (let r = 0; r < rows; r++) { G[r * cols] = 1; G[r * cols + cols - 1] = 1; }
  // 烘在地面里的水面 / 石台（regrid_mask.py 按颜色找出来的格子）沿用 Codex 原来的通行值
  const kf = '/tmp/claude-0/keep_' + id + '.json'; if (fs.existsSync(kf)) { const K = JSON.parse(fs.readFileSync(kf, 'utf8')).keep; let os = '', ov = m.b0; for (const n of m.b) { os += ov.repeat(n); ov = ov === '1' ? '0' : '1'; } let kept = 0; for (let i = 0; i < G.length; i++) if (K[i] === '1') { G[i] = os[i] === '1' ? 1 : 0; kept++; } console.log('  keep', kept); }
  // 出口格子（含 1 格边）必须可走
  for (const e of m.ex) for (let r = e.y - 1; r <= e.y + e.h; r++) for (let c = e.x - 1; c <= e.x + e.w; c++) if (r >= 0 && r < rows && c >= 0 && c < cols) G[r * cols + c] = 0;
  // 写回 RLE：b0 = 第一格的值，b = 交替游程
  let v = G[0], run = 0; const rle = []; for (let i = 0; i < G.length; i++) { if (G[i] === v) run++; else { rle.push(run); v = G[i]; run = 1; } } rle.push(run);
  const before = m.b.filter((_, i) => (i % 2 === 0) === (m.b0 === '1')).reduce((a, b) => a + b, 0);
  m.b0 = String(G[0]); m.b = rle;
  console.log(id, cnt, 'blocked', (100 * G.reduce((a, b) => a + b, 0) / G.length).toFixed(0) + '%', '(was', (100 * before / G.length).toFixed(0) + '%)');
}
L[DL] = '  const DATA = ' + JSON.stringify(D) + ';';
fs.writeFileSync(P, L.join('\n'));
