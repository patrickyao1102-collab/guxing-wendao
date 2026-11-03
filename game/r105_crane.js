// R105 灵兽苑 · 寻鹤（作者 11-03：开局没有坐骑，到集市做完灵兽苑的任务才解锁第一只——九霄仙鹤）
// 流程：集市灵兽苑饲养员 → 一只刚换羽的小仙鹤受惊飞去了竹林归径 → 循着三根白羽找过去（每根头上有标记，捡了才亮下一根）
//      → 竹丛边找到发抖的小仙鹤，喂灵谷安抚 → 它自己飞回灵兽苑 → 回去找饲养员 → 仙鹤认主 → 获得坐骑「九霄仙鹤」。
// 仙鹤骑乘帧（Codex R106）画好之前，九霄仙鹤先收进行囊「坐骑」页，还不能骑。仙鹤用的是集市灵兽苑里那只会动的仙鹤原画。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.tj_market || !TMAPS.qingzhu_bamboo || typeof CXB2 === 'undefined') return;
  const F = () => S.flags || (S.flags = {});
  const st = () => F().crane || 0;
  const LOC = window.FORCE_LOCAL || /^(localhost|127\.0\.0\.1|appassets\.local)$|\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
  const SHEET = new Image(); let sheetOk = false; SHEET.onload = () => { sheetOk = true; }; SHEET.src = LOC ? 'cx2/r60_life_crane.webp' : '/_blob/2515d98b0e7b93745fcbdbc259b0da12';
  // 吸到最近的可走点（竹林归径是 8px 碰撞格）
  const snap = (id, x, y) => { const B = CXB2[id]; if (!B) return [x, y]; const ok = (c, r) => c > 2 && r > 2 && c < B.cols - 3 && r < B.rows - 3 && [-2, 0, 2].every(d => B.blocked.charCodeAt(r * B.cols + c + d) === 48);
    const c0 = Math.floor(x / B.cs), r0 = Math.floor(y / B.cs); for (let d = 0; d < 80; d++) for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== d) continue; if (ok(c0 + dx, r0 + dy)) return [(c0 + dx + .5) * B.cs, (r0 + dy + .6) * B.cs]; } return [x, y]; };
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const toast2 = (t, ms = 2600) => { try { toast(t, ms); } catch (e) {} };

  // ---------------- 集市 · 灵兽苑饲养员 ----------------
  const keeper = (TMAPS.tj_market.npcs || []).find(n => n.name === '灵兽苑');
  if (keeper) {
    const orig = keeper.talk;
    keeper.mark = () => st() === 0 || st() === 2;
    keeper.talk = async function () {
      const s = st();
      if (s === 0) {
        await say('灵兽苑饲养员', '少宗主来得正好！今早给仙鹤添灵谷，一只刚换完羽的小仙鹤被雀儿惊着了，扑棱棱飞出了苑子……');
        await say('灵兽苑饲养员', '看方向是往竹林归径那边去了。它翅膀还没长硬，在外头过夜，怕是要被山里的野物伤着。');
        await say('叶孤星', '竹林归径？那条路我闭着眼睛都能走。交给我吧。');
        await say('灵兽苑饲养员', '多谢少宗主！这袋灵谷您带上——小家伙闻到味儿就肯靠近了。路上它掉了羽毛的话，循着找准没错。');
        await say('星旋', '小子，抓鸟这种事你最在行了，毕竟你跟它一样——都是被关在笼子里长大的。');
        await say('叶孤星·苦笑', '……你能不能闭嘴。');
        F().crane = 1; toast2('支线 · 灵兽苑寻鹤：去竹林归径，循着地上的白羽找小仙鹤', 3200);
        return;
      }
      if (s === 1) { await say('灵兽苑饲养员', '竹林归径就在问剑坪西边。小仙鹤怕生，您慢慢靠近它。'); return; }
      if (s === 2) {
        await say('灵兽苑饲养员', '回来了回来了！小家伙自己飞回来的，一落地就站在门口等您，谁喂都不吃。');
        await narrate('小仙鹤从苑里踱出来，在叶孤星身边绕了一圈，轻轻把头搁在他手心里，丹顶上的灵焰一明一暗。');
        await say('灵兽苑饲养员', '……灵兽择主，一辈子只认一回。它这是认定您了。');
        await say('灵兽苑饲养员', '这是天剑宗后山云海里孵出来的九霄仙鹤，长大了能驮人凌云。少宗主，就请收下它吧。');
        await say('叶孤星·笑', '那以后我出门，可就有坐骑了。');
        await say('星旋', '先说好，你骑鹤摔下来的时候，我可不接。');
        const f = F(); f.crane = 3; f.mt_own = f.mt_own || {}; f.mt_own.xianhe = 1;
        await showPanel('获得坐骑', ['!九霄仙鹤', '天剑宗后山云海里孵出的灵鹤，羽缘带着蓝白灵光，最认叶孤星。', '可在行囊「坐骑」页查看（骑乘动作制作中）']);
        try { if (typeof saveGame === 'function') saveGame(); } catch (e) {}
        return;
      }
      return orig && orig.apply(this, arguments);
    };
  }

  // ---------------- 竹林归径：三根白羽 + 受惊的小仙鹤 ----------------
  const ID = 'qingzhu_bamboo';
  const FEATHERS = [[1560, 1010], [1180, 720], [760, 520]].map(([x, y]) => snap(ID, x, y));
  const CRANE = snap(ID, 420, 400);
  const got = i => !!(F().crane_f || {})[i];
  const next = () => FEATHERS.findIndex((_, i) => !got(i));
  const def = TMAPS[ID]; def.npcs = def.npcs || [];
  FEATHERS.forEach(([x, y], i) => { const [c, r] = P(x, y);
    def.npcs.push({ key: 'none', c, r, name: '雪白的鹤羽', hidden: true, h: 60, noLabel: true, cond: () => st() === 1 && !got(i), mark: () => st() === 1 && next() === i,
      talk: async () => { const f = F(); f.crane_f = f.crane_f || {}; f.crane_f[i] = 1;
        await narrate(['路边的草叶上挂着一根雪白的鹤羽，羽缘还带着淡淡的蓝光。', '石阶旁又是一根鹤羽，比刚才那根更新——它就在前面不远。', '竹丛下散落着好几根羽毛。竹叶后面，隐约有什么东西在发抖。'][i]);
        try { const a = world.actors.find(a => a.npc && a.npc.name === '雪白的鹤羽' && Math.hypot(a.x - x, a.y - y) < 40); if (a) a.hidden = true; } catch (e) {} } });
  });
  { const [c, r] = P(...CRANE);
    def.npcs.push({ key: 'none', c, r, name: '受惊的小仙鹤', hidden: false, h: 150, r105crane: true, cond: () => st() === 1, mark: () => st() === 1 && next() < 0,
      talk: async (a) => {
        if (next() >= 0) { await narrate('竹丛深处好像有动静……先循着地上的羽毛找找看。'); return; }
        await narrate('一只半大的仙鹤缩在竹丛下，翅尖的羽毛蹭乱了，见人靠近就往后缩。');
        await say('叶孤星', '嘘——别怕，我不抓你。饿了吧？');
        await narrate('叶孤星蹲下身，摊开掌心，把一把灵谷递到它面前。');
        if (a) a.calm = performance.now();
        await say('星旋', '哟，看不出来你还挺会哄。');
        await narrate('小仙鹤歪着头看了他半晌，终于啄起灵谷，轻轻蹭了蹭他的手背。随后振翅而起，朝集市的方向飞去。');
        if (a) { a.fly = performance.now(); }
        await new Promise(res => setTimeout(res, 1400));
        F().crane = 2; toast2('支线 · 灵兽苑寻鹤：小仙鹤飞回了灵兽苑——回集市找饲养员', 3200);
      } });
  }
  // 小仙鹤：集市里那只仙鹤的原画（8 帧），发抖 / 被安抚后低头 / 振翅飞走
  drawActorT = (o => function (a, now) {
    if (!a || !a.npc || !a.npc.r105crane) return o.apply(this, arguments);
    if (!sheetOk || a.hidden) return;
    const t = performance.now(); let frame, dx = 0, dy = 0, al = 1;
    if (a.fly) { const k = (t - a.fly) / 1400; frame = 4 + Math.floor(t / 90) % 4; dy = -k * k * 420; dx = k * 260; al = Math.max(0, 1 - k * 1.1); if (k > 1) { a.hidden = true; return; } }
    else if (a.calm) frame = Math.floor(t / 400) % 4;
    else { frame = [0, 1, 0, 2][Math.floor(t / 350) % 4]; dx = Math.sin(t / 45) * 1.2; }
    const sc = .36, fw = 400, fh = 400;
    ctx.save(); ctx.globalAlpha *= al;
    if (!a.fly) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(a.x, a.y, 26, 8, 0, 0, 7); ctx.fill(); }
    ctx.translate(a.x + dx, a.y + dy); ctx.scale(sc, sc);
    ctx.drawImage(SHEET, (frame % 4) * fw, Math.floor(frame / 4) * fh, fw, fh, -200, -392, fw, fh);
    ctx.restore();
  })(drawActorT);

  // 任务栏自动寻路：只在没有主线任务文字盖住时参考（不改主线 S.quest）
  window.R105_CRANE = { reset() { const f = F(); delete f.crane; delete f.crane_f; if (f.mt_own) delete f.mt_own.xianhe; }, state: st };
})();
