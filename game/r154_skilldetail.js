// ================= R154 · 技能详情 / 参悟升重（作者 11-07）=================
// 在「技能」页点「参悟」或再点一次已选中的招式 → 打开这张详情页：招式说明、本重和下一重的效果对比、参悟条件，满足了才能点「参悟升重」。
// 美术是 Codex R154（金色海棠云窗），作者要白色或黑金：这里用同一套拆件调成两种配色 ——
//   作者看过两版，定黑金（r154/d/）：纸面改墨黑，金框保留。
(function () {
  const V = {"ready":{"draw":[{"type":"sprite","asset":"title_blank","rect":[425,7,430,72]},{"type":"text","key":"titleLeft","rect":[492,10,130,59],"font":"heading","size":52,"color":"#FFF1D5","align":"right","effect":"titleGold"},{"type":"text","key":"titleRight","rect":[658,10,130,59],"font":"heading","size":52,"color":"#FFF1D5","align":"left","effect":"titleGold"},{"type":"sprite","asset":"frame_top","rect":[72,72,1136,128]},{"type":"sprite","asset":"frame_bottom","rect":[72,600,1136,105]},{"type":"sprite","asset":"skill_folio","rect":[151,162,302,407]},{"type":"sprite","asset":"skill_socket","rect":[227,172,150,150]},{"type":"skillIcon","rect":[238,183,128,128],"clip":"circle","source":"runtimeSkillIcon"},{"type":"text","key":"currentRank","rect":[177,335,250,40],"font":"heading","size":34,"color":"#FFF1D5","align":"center"},{"type":"sprite","asset":"star_on","rect":[214,377,28,28]},{"type":"sprite","asset":"star_on","rect":[251,377,28,28]},{"type":"sprite","asset":"star_off","rect":[288,377,28,28]},{"type":"sprite","asset":"star_off","rect":[325,377,28,28]},{"type":"sprite","asset":"star_off","rect":[362,377,28,28]},{"type":"text","key":"metaLabel0","rect":[183,419,70,39],"font":"body","size":26,"color":"#E1CAA4","align":"left"},{"type":"text","key":"metaValue0","rect":[254,419,165,39],"font":"body","size":29,"color":"#FFF1D5","align":"right"},{"type":"text","key":"metaLabel1","rect":[183,467,70,39],"font":"body","size":26,"color":"#E1CAA4","align":"left"},{"type":"text","key":"metaValue1","rect":[254,467,165,39],"font":"body","size":29,"color":"#FFF1D5","align":"right"},{"type":"text","key":"metaLabel2","rect":[183,515,70,39],"font":"body","size":26,"color":"#E1CAA4","align":"left"},{"type":"text","key":"metaValue2","rect":[254,515,165,39],"font":"body","size":29,"color":"#FFF1D5","align":"right"},{"type":"diamond","center":[497,174],"radius":4,"color":"#B78A42"},{"type":"text","key":"descriptionLabel","rect":[509,156,135,36],"font":"heading","size":29,"color":"#78501F","align":"left"},{"type":"line","ends":[647,175,1125,175],"color":"#C9AB7B","width":0.7},{"type":"text","key":"description0","rect":[493,200,632,34],"font":"body","size":28,"color":"#3B271E","align":"left"},{"type":"text","key":"description1","rect":[493,235,632,34],"font":"body","size":28,"color":"#3B271E","align":"left"},{"type":"diamond","center":[497,306],"radius":4,"color":"#B78A42"},{"type":"text","key":"comparisonLabel","rect":[509,288,135,36],"font":"heading","size":29,"color":"#78501F","align":"left"},{"type":"line","ends":[647,307,1125,307],"color":"#C9AB7B","width":0.7},{"type":"text","key":"currentCol","rect":[635,321,162,34],"font":"body","size":26,"color":"#78553D","align":"center"},{"type":"text","key":"nextCol","rect":[867,321,255,34],"font":"body","size":26,"color":"#216447","align":"center"},{"type":"line","ends":[493,359,1125,359],"color":"#BD9B62","width":1},{"type":"text","key":"effectLabel0","rect":[493,364,130,38],"font":"body","size":27,"color":"#3B271E","align":"left"},{"type":"text","key":"oldEffect0","rect":[632,364,168,38],"font":"number","size":34,"color":"#3B271E","align":"center"},{"type":"text","key":"arrow0","rect":[816,364,44,38],"font":"body","size":30,"color":"#78501F","align":"center"},{"type":"text","key":"newEffect0","rect":[867,364,255,38],"font":"number","size":36,"color":"#216447","align":"center"},{"type":"line","ends":[493,405,1125,405],"color":"#D8BE93","width":0.7},{"type":"text","key":"effectLabel1","rect":[493,406,130,38],"font":"body","size":27,"color":"#3B271E","align":"left"},{"type":"text","key":"oldEffect1","rect":[632,406,168,38],"font":"body","size":28,"color":"#3B271E","align":"center"},{"type":"text","key":"arrow1","rect":[816,406,44,38],"font":"body","size":30,"color":"#78501F","align":"center"},{"type":"text","key":"newEffect1","rect":[867,406,255,38],"font":"body","size":29,"color":"#216447","align":"center"},{"type":"diamond","center":[497,470],"radius":4,"color":"#B78A42"},{"type":"text","key":"requirementsLabel","rect":[509,452,135,36],"font":"heading","size":29,"color":"#78501F","align":"left"},{"type":"line","ends":[647,471,1125,471],"color":"#C9AB7B","width":0.7},{"type":"text","key":"requireLabel0","rect":[493,495,93,36],"font":"body","size":26,"color":"#78553D","align":"left"},{"type":"text","key":"requireValue0","rect":[596,495,296,36],"font":"body","size":28,"color":"#3B271E","align":"left"},{"type":"text","key":"requireStatus0","rect":[878,495,244,36],"font":"body","size":28,"color":"#216447","align":"right"},{"type":"text","key":"requireLabel1","rect":[493,534,93,36],"font":"body","size":26,"color":"#78553D","align":"left"},{"type":"text","key":"requireValue1","rect":[596,534,296,36],"font":"body","size":28,"color":"#3B271E","align":"left"},{"type":"text","key":"requireStatus1","rect":[878,534,244,36],"font":"body","size":28,"color":"#216447","align":"right"},{"type":"sprite","asset":"back_normal","rect":[371,611,218,62]},{"type":"text","key":"back","rect":[383,616,194,51],"font":"heading","size":36,"color":"#45301D","align":"center"},{"type":"sprite","asset":"button_normal","rect":[616,611,292,62]},{"type":"text","key":"upgrade","rect":[628,616,268,51],"font":"heading","size":36,"color":"#45301D","align":"center"}],"hit":{"back":{"rect":[365,607,230,80],"shape":"roundRect","radius":32},"upgrade":{"rect":[610,607,304,80],"shape":"roundRect","radius":32}}},"blocked":{"draw":[{"type":"sprite","asset":"title_blank","rect":[425,7,430,72]},{"type":"text","key":"titleLeft","rect":[492,10,130,59],"font":"heading","size":52,"color":"#FFF1D5","align":"right","effect":"titleGold"},{"type":"text","key":"titleRight","rect":[658,10,130,59],"font":"heading","size":52,"color":"#FFF1D5","align":"left","effect":"titleGold"},{"type":"sprite","asset":"frame_top","rect":[72,72,1136,128]},{"type":"sprite","asset":"frame_bottom","rect":[72,600,1136,105]},{"type":"sprite","asset":"skill_folio","rect":[151,162,302,407]},{"type":"sprite","asset":"skill_socket","rect":[227,172,150,150]},{"type":"skillIcon","rect":[238,183,128,128],"clip":"circle","source":"runtimeSkillIcon"},{"type":"text","key":"currentRank","rect":[177,335,250,40],"font":"heading","size":34,"color":"#FFF1D5","align":"center"},{"type":"sprite","asset":"star_on","rect":[214,377,28,28]},{"type":"sprite","asset":"star_on","rect":[251,377,28,28]},{"type":"sprite","asset":"star_off","rect":[288,377,28,28]},{"type":"sprite","asset":"star_off","rect":[325,377,28,28]},{"type":"sprite","asset":"star_off","rect":[362,377,28,28]},{"type":"text","key":"metaLabel0","rect":[183,419,70,39],"font":"body","size":26,"color":"#E1CAA4","align":"left"},{"type":"text","key":"metaValue0","rect":[254,419,165,39],"font":"body","size":29,"color":"#FFF1D5","align":"right"},{"type":"text","key":"metaLabel1","rect":[183,467,70,39],"font":"body","size":26,"color":"#E1CAA4","align":"left"},{"type":"text","key":"metaValue1","rect":[254,467,165,39],"font":"body","size":29,"color":"#FFF1D5","align":"right"},{"type":"text","key":"metaLabel2","rect":[183,515,70,39],"font":"body","size":26,"color":"#E1CAA4","align":"left"},{"type":"text","key":"metaValue2","rect":[254,515,165,39],"font":"body","size":29,"color":"#FFF1D5","align":"right"},{"type":"diamond","center":[497,174],"radius":4,"color":"#B78A42"},{"type":"text","key":"descriptionLabel","rect":[509,156,135,36],"font":"heading","size":29,"color":"#78501F","align":"left"},{"type":"line","ends":[647,175,1125,175],"color":"#C9AB7B","width":0.7},{"type":"text","key":"description0","rect":[493,200,632,34],"font":"body","size":28,"color":"#3B271E","align":"left"},{"type":"text","key":"description1","rect":[493,235,632,34],"font":"body","size":28,"color":"#3B271E","align":"left"},{"type":"diamond","center":[497,306],"radius":4,"color":"#B78A42"},{"type":"text","key":"comparisonLabel","rect":[509,288,135,36],"font":"heading","size":29,"color":"#78501F","align":"left"},{"type":"line","ends":[647,307,1125,307],"color":"#C9AB7B","width":0.7},{"type":"text","key":"currentCol","rect":[635,321,162,34],"font":"body","size":26,"color":"#78553D","align":"center"},{"type":"text","key":"nextCol","rect":[867,321,255,34],"font":"body","size":26,"color":"#216447","align":"center"},{"type":"line","ends":[493,359,1125,359],"color":"#BD9B62","width":1},{"type":"text","key":"effectLabel0","rect":[493,364,130,38],"font":"body","size":27,"color":"#3B271E","align":"left"},{"type":"text","key":"oldEffect0","rect":[632,364,168,38],"font":"number","size":34,"color":"#3B271E","align":"center"},{"type":"text","key":"arrow0","rect":[816,364,44,38],"font":"body","size":30,"color":"#78501F","align":"center"},{"type":"text","key":"newEffect0","rect":[867,364,255,38],"font":"number","size":36,"color":"#216447","align":"center"},{"type":"line","ends":[493,405,1125,405],"color":"#D8BE93","width":0.7},{"type":"text","key":"effectLabel1","rect":[493,406,130,38],"font":"body","size":27,"color":"#3B271E","align":"left"},{"type":"text","key":"oldEffect1","rect":[632,406,168,38],"font":"body","size":28,"color":"#3B271E","align":"center"},{"type":"text","key":"arrow1","rect":[816,406,44,38],"font":"body","size":30,"color":"#78501F","align":"center"},{"type":"text","key":"newEffect1","rect":[867,406,255,38],"font":"body","size":29,"color":"#216447","align":"center"},{"type":"diamond","center":[497,470],"radius":4,"color":"#B78A42"},{"type":"text","key":"requirementsLabel","rect":[509,452,135,36],"font":"heading","size":29,"color":"#78501F","align":"left"},{"type":"line","ends":[647,471,1125,471],"color":"#C9AB7B","width":0.7},{"type":"text","key":"requireLabel0","rect":[493,495,93,36],"font":"body","size":26,"color":"#78553D","align":"left"},{"type":"text","key":"requireValue0","rect":[596,495,296,36],"font":"body","size":28,"color":"#3B271E","align":"left"},{"type":"text","key":"requireStatus0","rect":[878,495,244,36],"font":"body","size":28,"color":"#A72F2C","align":"right"},{"type":"text","key":"requireLabel1","rect":[493,534,93,36],"font":"body","size":26,"color":"#78553D","align":"left"},{"type":"text","key":"requireValue1","rect":[596,534,296,36],"font":"body","size":28,"color":"#3B271E","align":"left"},{"type":"text","key":"requireStatus1","rect":[878,534,244,36],"font":"body","size":28,"color":"#A72F2C","align":"right"},{"type":"sprite","asset":"back_normal","rect":[371,611,218,62]},{"type":"text","key":"back","rect":[383,616,194,51],"font":"heading","size":36,"color":"#45301D","align":"center"},{"type":"sprite","asset":"button_disabled","rect":[616,611,292,62]},{"type":"text","key":"upgrade","rect":[628,616,268,51],"font":"heading","size":36,"color":"#5D5B56","align":"center"}],"hit":{"back":{"rect":[365,607,230,80],"shape":"roundRect","radius":32},"upgrade":null}},"maxRank":{"draw":[{"type":"sprite","asset":"title_blank","rect":[425,57,430,72]},{"type":"text","key":"titleLeft","rect":[492,60,130,59],"font":"heading","size":52,"color":"#FFF1D5","align":"right","effect":"titleGold"},{"type":"text","key":"titleRight","rect":[658,60,130,59],"font":"heading","size":52,"color":"#FFF1D5","align":"left","effect":"titleGold"},{"type":"sprite","asset":"frame_top","rect":[72,122,1136,128]},{"type":"sprite","asset":"frame_bottom","rect":[72,550,1136,105]},{"type":"sprite","asset":"skill_socket","rect":[220,212,150,150]},{"type":"skillIcon","rect":[231,223,128,128],"clip":"circle","source":"runtimeSkillIcon"},{"type":"text","key":"currentRank","rect":[180,372,230,42],"font":"heading","size":34,"color":"#78501F","align":"center"},{"type":"sprite","asset":"star_on","rect":[209,423,28,28]},{"type":"sprite","asset":"star_on","rect":[246,423,28,28]},{"type":"sprite","asset":"star_on","rect":[283,423,28,28]},{"type":"sprite","asset":"star_on","rect":[320,423,28,28]},{"type":"sprite","asset":"star_on","rect":[357,423,28,28]},{"type":"diamond","center":[497,224],"radius":4,"color":"#B78A42"},{"type":"text","key":"descriptionLabel","rect":[509,206,135,36],"font":"heading","size":29,"color":"#78501F","align":"left"},{"type":"line","ends":[647,225,1125,225],"color":"#C9AB7B","width":0.7},{"type":"text","key":"description0","rect":[493,250,632,34],"font":"body","size":28,"color":"#3B271E","align":"left"},{"type":"text","key":"description1","rect":[493,285,632,34],"font":"body","size":28,"color":"#3B271E","align":"left"},{"type":"diamond","center":[497,376],"radius":4,"color":"#B78A42"},{"type":"text","key":"currentLabel","rect":[509,358,135,36],"font":"heading","size":29,"color":"#78501F","align":"left"},{"type":"line","ends":[647,377,1125,377],"color":"#C9AB7B","width":0.7},{"type":"text","key":"currentEffect","rect":[493,400,625,44],"font":"body","size":30,"color":"#3B271E","align":"left"},{"type":"text","key":"maxRank","rect":[493,452,625,38],"font":"heading","size":28,"color":"#216447","align":"left"},{"type":"text","key":"meta","rect":[493,330,625,36],"font":"body","size":28,"color":"#3B271E","align":"left"},{"type":"sprite","asset":"back_normal","rect":[516,568,248,62]},{"type":"text","key":"back","rect":[528,573,224,51],"font":"heading","size":36,"color":"#45301D","align":"center"}],"hit":{"back":{"rect":[510,564,260,80],"shape":"roundRect","radius":32},"upgrade":null}},"rankless":{"draw":[{"type":"sprite","asset":"title_blank","rect":[425,132,430,72]},{"type":"text","key":"titleLeft","rect":[492,135,130,59],"font":"heading","size":52,"color":"#FFF1D5","align":"right","effect":"titleGold"},{"type":"text","key":"titleRight","rect":[658,135,130,59],"font":"heading","size":52,"color":"#FFF1D5","align":"left","effect":"titleGold"},{"type":"sprite","asset":"frame_top","rect":[72,197,1136,128]},{"type":"sprite","asset":"frame_bottom","rect":[72,475,1136,105]},{"type":"sprite","asset":"skill_socket","rect":[200,289,150,150]},{"type":"skillIcon","rect":[211,300,128,128],"clip":"circle","source":"runtimeSkillIcon"},{"type":"diamond","center":[450,294],"radius":4,"color":"#B78A42"},{"type":"text","key":"descLabel","rect":[462,276,135,36],"font":"heading","size":29,"color":"#78501F","align":"left"},{"type":"line","ends":[600,295,1083,295],"color":"#C9AB7B","width":0.7},{"type":"text","key":"description0","rect":[446,321,625,36],"font":"body","size":28,"color":"#3B271E","align":"left"},{"type":"text","key":"description1","rect":[446,358,625,36],"font":"body","size":28,"color":"#3B271E","align":"left"},{"type":"sprite","asset":"back_normal","rect":[516,493,248,62]},{"type":"text","key":"back","rect":[528,498,224,51],"font":"heading","size":36,"color":"#45301D","align":"center"}],"hit":{"back":{"rect":[510,489,260,80],"shape":"roundRect","radius":32},"upgrade":null}}};
  const NAMES = ['frame_top', 'frame_body_tile', 'frame_bottom', 'button_normal', 'button_pressed', 'button_disabled', 'back_normal', 'back_pressed', 'title_blank', 'skill_socket', 'skill_folio', 'star_on', 'star_off'];
  const SZ = { frame_top: [1136, 128], frame_body_tile: [1136, 50], frame_bottom: [1136, 105] };
  let TH = 'd';   // 作者 11-07：定黑金（白色不要）
  const A = { w: {}, d: {} }, loading = { w: false, d: false };
  function load(t) { if (loading[t]) return; loading[t] = true; for (const n of NAMES) { const im = new Image(); im.onload = () => { A[t][n] = im; }; im.src = 'r154/' + t + '/' + n + '.webp'; } }
  const ready = t => NAMES.every(n => A[t][n]);
  // 两种配色下的文字颜色（原稿是金色版的颜色，按表换）
  const MAP = {
    w: { '#FFF1D5': '#F5F7FA', '#E1CAA4': '#B9C0C8', '#78501F': '#3D434B', '#B78A42': '#8C949E', '#C9AB7B': '#BCC2C8', '#BD9B62': '#A3AAB2', '#D8BE93': '#D3D7DC', '#3B271E': '#25282D', '#78553D': '#5D636B', '#216447': '#1C6B47', '#A72F2C': '#AD2E2A', '#45301D': '#2C3036', '#5D5B56': '#77797C' },
    d: { '#FFF1D5': '#FFF1D5', '#E1CAA4': '#D8C39E', '#78501F': '#E6C27A', '#B78A42': '#D2A350', '#C9AB7B': 'rgba(214,176,104,.55)', '#BD9B62': 'rgba(196,158,92,.8)', '#D8BE93': 'rgba(216,190,147,.28)', '#3B271E': '#F0E6CF', '#78553D': '#BDA680', '#216447': '#8FDDA0', '#A72F2C': '#FF8E7C', '#45301D': '#45301D', '#5D5B56': '#8A8780' },
  };
  const GOLD = { w: ['#FFFFFF', '#F1F4F7', '#CDD3D9', '#9CA4AD'], d: ['#FFFAE5', '#FFEBB8', '#F6CB7F', '#DB9D4E'] };
  const col = (c, key) => { if (TH === 'd' && key === 'back') return '#F3DFAF'; return (MAP[TH][c] || c); };
  const FNT = { heading: () => '"GuxingDF",' + BRUSH, body: () => '"GuxingKai",' + FONT, number: () => '"Times New Roman","Noto Serif SC",serif' };
  const CNN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

  let D = null;   // 当前打开的详情 { who, id, t0, d: 数据 }
  window.R154_OPEN = () => !!D;

  // ---------- 数据 ----------
  const realmStage = lv => String(realmOf(lv)).replace(/(初期|中期|后期|.重)$/, '') + '期';
  function reqLv(I, t) { if (I.max === 7) return t <= 3 ? 1 : t === 4 ? 10 : t === 5 ? 19 : 28; return t <= 2 ? 1 : t === 3 ? 10 : t === 4 ? 19 : 28; }
  const pct = s => (String(s).match(/\d+%/) || [null])[0];
  const mainOf = s => String(s).split('，')[0];
  const extraOf = s => String(s).split('，').slice(1).join('，');
  function build(who, id) {
    const K = window.SKT; if (!K) return null; const n = K.nodeOf(who, id); if (!n) return null;
    const I = K.info(who, n); if (!I || !I.learned) return null;
    const T = K.tiersOf(id), lab = K.colOf(who, id);
    const type = /秘/.test(lab) || I.ult ? '秘传' : /辅/.test(lab) ? '辅助' : '主动';
    const tgt = K.TGT[id] || ((String(T[0]).match(/^(单体|群体|全体|己方全体|己方单体|自身)/) || [])[1]) || '单体';
    const d = { who, id, icon: n.icon, name: I.name || n.short, desc: I.desc || '', I, T, meta: [['类型', type], ['目标', tgt], ['消耗', I.cost || '—']] };
    if (I.ult || I.solo || I.max <= 1) { d.v = 'rankless'; return d; }
    d.tier = I.tier; d.max = I.max;
    const q = K.need(who, n, I);
    if (!q) { d.v = 'maxRank'; d.cur = T[I.tier - 1] || ''; return d; }
    const a = T[I.tier - 1] || '', c = T[q.t - 1] || '';
    const pa = pct(a), pc = pct(c);
    d.rows = [];
    if (pa || pc) d.rows.push([/威力/.test(c) ? '威力' : /回复|治疗/.test(c) ? '回复' : '效果', pa || '—', pc || '—', true]);
    else d.rows.push(['效果', mainOf(a), mainOf(c), false]);
    const ea = extraOf(a), ec = extraOf(c);
    d.rows.push(['附加', ea || '无', ec || (ea || '无'), false]);
    d.t = q.t;
    const have = itemCount(q.item) + (q.t === 2 ? itemCount(K.bookId(id)) : 0);
    const bookOk = have >= q.n, rl = reqLv(I, q.t), realmOk = q.t <= q.cap;
    d.req = [['卷册', q.label.replace(/[《》]/g, '') + ' ×' + q.n, bookOk ? '持有 ' + have + ' 本' : have ? '仅有 ' + have + ' 本' : '尚无此卷', bookOk],
             ['境界', rl <= 1 ? '不限' : realmOf(rl), realmOk ? '已达成' : '尚在' + realmStage(S.hero.lv), realmOk]];
    d.why = !bookOk ? '没有' + q.label + '（天剑集市·典籍阁有售）' : !realmOk ? (q.capTxt || K.CAPTXT[q.cap] || '境界不足') : '';
    d.v = bookOk && realmOk ? 'ready' : 'blocked';
    return d;
  }

  // ---------- 画 ----------
  function fitFont(c, s, base, min, maxW, fam, weight) { let z = base; c.font = (weight || '') + ' ' + z + 'px ' + fam; while (z > min && c.measureText(s).width > maxW) { z -= 1; c.font = (weight || '') + ' ' + z + 'px ' + fam; } return z; }
  function text(c, s, e, opt = {}) {
    if (s == null || s === '') return; s = String(s);
    const [x, y, w, h] = e.rect, fam = FNT[e.font](), wt = e.font === 'number' ? 'bold' : e.font === 'body' ? '600' : '';
    const minZ = Math.min(e.size, e.font === 'number' ? 24 : 20);
    fitFont(c, s, e.size, minZ, w, fam, wt);
    let tw = c.measureText(s).width; c.save();
    if (tw > w) { const k = w / tw; c.translate(x + (e.align === 'right' ? w : e.align === 'center' ? w / 2 : 0), 0); c.scale(k, 1); c.translate(-(x + (e.align === 'right' ? w : e.align === 'center' ? w / 2 : 0)), 0); }
    c.textAlign = e.align || 'left'; c.textBaseline = 'alphabetic';
    const m = c.measureText(s), cy = y + h / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2, tx = e.align === 'right' ? x + w : e.align === 'center' ? x + w / 2 : x;
    const color = opt.color || col(e.color, e.key);
    if (e.effect === 'titleGold') {
      const g = c.createLinearGradient(0, y + 6, 0, y + h - 4), G = GOLD[TH]; G.forEach((v, i) => g.addColorStop(i / (G.length - 1), v));
      c.lineJoin = 'round'; c.lineWidth = 7; c.strokeStyle = TH === 'w' ? 'rgba(28,32,40,.92)' : 'rgba(40,20,6,.92)'; c.strokeText(s, tx, cy);
      c.shadowColor = TH === 'w' ? 'rgba(200,220,255,.5)' : 'rgba(255,200,110,.45)'; c.shadowBlur = 10; c.fillStyle = g; c.fillText(s, tx, cy);
    } else { c.fillStyle = color; c.fillText(s, tx, cy); }
    c.restore();
  }
  function sprite(c, k, r) { const im = A[TH][k]; if (im) c.drawImage(im, r[0], r[1], r[2], r[3]); }
  function frame(c, y0, tiles) { const x = 72; sprite(c, 'frame_top', [x, y0, 1136, 128]); for (let i = 0; i < tiles; i++) sprite(c, 'frame_body_tile', [x, y0 + 128 + 50 * i, 1136, 50.5]); sprite(c, 'frame_bottom', [x, y0 + 128 + 50 * tiles, 1136, 105]); }
  function title(c, name, tb) {   // tb = title_blank 的 rect
    const im = A[TH].title_blank; if (!im) return; const sx = tb[2] / 420, sy = tb[3] / 80, X = v => tb[0] + v * sx;
    let L = name, R = ''; const dot = name.search(/[·・]/);
    if (dot > 0) { L = name.slice(0, dot); R = name.slice(dot + 1); } else { const h = Math.ceil(name.length / 2); L = name.slice(0, h); R = name.slice(h); }
    const fam = FNT.heading(); let z = 52; c.font = z + 'px ' + fam;
    const wid = () => [c.measureText(L).width, c.measureText(R).width];
    let [wl, wr] = wid(); while (z > 30 && (622 - wl < 145 || 658 + wr > 1135)) { z -= 2; c.font = z + 'px ' + fam; [wl, wr] = wid(); }
    const lEnd = Math.min(X(70), 622 - wl - 14), rSt = Math.max(X(348), 658 + wr + 14);
    c.drawImage(im, 0, 0, 140, 160, lEnd - 70 * sx, tb[1], 70 * sx, tb[3]);
    c.drawImage(im, 392, 0, 56, 160, X(196), tb[1], 28 * sx, tb[3]);
    c.drawImage(im, 696, 0, 144, 160, rSt, tb[1], 72 * sx, tb[3]);
    const ty = tb[1] + 3;
    text(c, L, { rect: [622 - wl - 4, ty, wl + 4, 59], font: 'heading', size: z, align: 'right', effect: 'titleGold', color: '#FFF1D5' });
    text(c, R, { rect: [658, ty, wr + 4, 59], font: 'heading', size: z, align: 'left', effect: 'titleGold', color: '#FFF1D5' });
  }
  function icon(c, d, r) {
    const [x, y, w] = r, cx = x + w / 2, cy = y + w / 2, R = w / 2;
    c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip();
    const g = c.createRadialGradient(cx, cy - R * .3, R * .1, cx, cy, R); g.addColorStop(0, '#2c4a8a'); g.addColorStop(1, '#0b1634'); c.fillStyle = g; c.fillRect(x, y, w, w);
    try { if (window.SKILL_ICON) { const o = ctx; SKILL_ICON(d.icon, cx, cy, R * .98, {}); } } catch (e) {}
    c.restore();
  }
  const NOHEAD = /[，。、；：！？）》」』%]/;
  function wrapLines(c, s, maxW, font) { c.font = font; const out = []; let line = ''; for (const ch of String(s)) { if (c.measureText(line + ch).width > maxW && line && !NOHEAD.test(ch)) { out.push(line); line = ch; } else line += ch; } if (line) out.push(line); return out; }
  const btnDown = (h) => h && input.down && input.x >= h.rect[0] && input.x <= h.rect[0] + h.rect[2] && input.y >= h.rect[1] && input.y <= h.rect[1] + h.rect[3];
  function draw(c) {
    const d = D.d; if (!d) return; const L = V[d.v]; if (!ready(TH)) { load(TH); }
    const now = performance.now(), e = 1 - Math.pow(1 - Math.min(1, (now - D.t0) / 220), 3);
    c.save(); c.globalAlpha = .62 * e; c.fillStyle = '#04060b'; c.fillRect(0, 0, W, H); c.globalAlpha = e;
    c.translate(640, 360); c.scale(.96 + .04 * e, .96 + .04 * e); c.translate(-640, -360 + (1 - e) * 14);
    if (!ready(TH)) { c.restore(); return; }
    const tiles = d.v === 'rankless' ? 3 : d.v === 'maxRank' ? 6 : 8;
    // 说明折行：三行时比较区、条件区整体下移 35
    const descW = d.v === 'rankless' ? 625 : 632, lh = d.v === 'rankless' ? 37 : 35;
    const DL = wrapLines(c, d.desc, descW, '600 28px ' + FNT.body()).slice(0, d.v === 'rankless' ? 4 : 3);
    const shift = d.v !== 'rankless' && d.v !== 'maxRank' && DL.length >= 3 ? 35 : 0;
    const hp = L.hit;
    for (const it of L.draw) {
      const dy = shift && ((it.rect && it.rect[1] >= 280 && it.rect[1] < 600) || (it.center && it.center[1] >= 280) || (it.ends && it.ends[1] >= 280)) ? shift : 0;
      const mv = r => [r[0], r[1] + dy, r[2], r[3]];
      if (it.type === 'sprite') {
        if (it.asset === 'title_blank') { title(c, d.name, it.rect); continue; }
        if (it.asset === 'frame_top') { frame(c, it.rect[1], tiles); continue; }
        if (it.asset === 'frame_bottom') continue;
        if (it.asset === 'star_on' || it.asset === 'star_off') continue;   // 星单独画（重数不一定是五）
        let k = it.asset;
        if (k === 'back_normal' && btnDown(hp.back)) k = 'back_pressed';
        if (k === 'button_normal' && btnDown(hp.upgrade)) k = 'button_pressed';
        sprite(c, k, mv(it.rect)); continue;
      }
      if (it.type === 'skillIcon') { icon(c, d, it.rect); continue; }
      if (it.type === 'diamond') { const [x, y] = it.center, r = it.radius; c.fillStyle = col(it.color); c.beginPath(); c.moveTo(x, y + dy - r); c.lineTo(x + r, y + dy); c.lineTo(x, y + dy + r); c.lineTo(x - r, y + dy); c.closePath(); c.fill(); continue; }
      if (it.type === 'line') { const [x0, y0, x1, y1] = it.ends; c.strokeStyle = col(it.color); c.lineWidth = Math.max(1, it.width); c.beginPath(); c.moveTo(x0, y0 + dy + .5); c.lineTo(x1, y1 + dy + .5); c.stroke(); continue; }
      if (it.type !== 'text') continue;
      const k = it.key, E = Object.assign({}, it, { rect: mv(it.rect) });
      if (k === 'titleLeft' || k === 'titleRight') continue;
      let s = null, o = {};
      if (k === 'currentRank') s = '第' + CNN[d.tier] + '重';
      else if (/^metaLabel(\d)/.test(k)) s = d.meta[+k.slice(-1)][0];
      else if (/^metaValue(\d)/.test(k)) s = d.meta[+k.slice(-1)][1];
      else if (k === 'descriptionLabel' || k === 'descLabel') s = '招式说明';
      else if (/^description(\d)/.test(k)) { const i = +k.slice(-1); if (i === 0) DL.forEach((l, j) => text(c, l, Object.assign({}, E, { rect: [E.rect[0], E.rect[1] + j * lh, E.rect[2], E.rect[3]] }))); continue; }
      else if (k === 'comparisonLabel') s = '升重效果';
      else if (k === 'currentCol') s = '当前 · ' + CNN[d.tier] + '重';
      else if (k === 'nextCol') s = '下一重 · ' + CNN[d.t] + '重';
      else if (/^effectLabel(\d)/.test(k)) s = d.rows[+k.slice(-1)][0];
      else if (/^(old|new)Effect(\d)/.test(k)) { const r = d.rows[+k.slice(-1)], old = k[0] === 'o'; s = old ? r[1] : r[2]; if (!r[3]) { E.font = 'body'; E.size = Math.min(E.size, 29); } if (!old && r[2] === r[1]) o.color = col('#3B271E');
        if (!r[3]) { c.font = '600 ' + E.size + 'px ' + FNT.body(); if (c.measureText(s).width > E.rect[2]) { const z = 23, ls = wrapLines(c, s, E.rect[2], '600 ' + z + 'px ' + FNT.body()).slice(0, 2); ls.forEach((l, j) => text(c, l, Object.assign({}, E, { size: z, rect: [E.rect[0], E.rect[1] + (j - (ls.length - 1) / 2) * 24, E.rect[2], E.rect[3]] }), o)); continue; } } }
      else if (/^arrow/.test(k)) s = '→';
      else if (k === 'requirementsLabel') s = '参悟条件';
      else if (/^requireLabel(\d)/.test(k)) s = d.req[+k.slice(-1)][0];
      else if (/^requireValue(\d)/.test(k)) s = d.req[+k.slice(-1)][1];
      else if (/^requireStatus(\d)/.test(k)) { const r = d.req[+k.slice(-1)]; s = r[2]; o.color = col(r[3] ? '#216447' : '#A72F2C'); }
      else if (k === 'back') s = '返回';
      else if (k === 'upgrade') { s = '参悟升重'; if (btnDown(hp.upgrade)) E.rect = [E.rect[0], E.rect[1] + 1, E.rect[2], E.rect[3]]; }
      else if (k === 'currentLabel') s = '本重效果';
      else if (k === 'currentEffect') { const lines = wrapLines(c, d.cur, 625, '600 30px ' + FNT.body()).slice(0, 2); lines.forEach((l, j) => text(c, l, Object.assign({}, E, { rect: [E.rect[0], E.rect[1] + j * 38, E.rect[2], E.rect[3]] }))); continue; }
      else if (k === 'maxRank') s = '已臻化境 · 此招已修至第' + CNN[d.max] + '重';
      else if (k === 'meta') { s = d.meta.map(m => m[1]).join(' · '); E.rect = [150, 470, 290, 36]; E.align = 'center'; E.size = 24; o.color = col('#78553D'); }
      if (k === 'maxRank') { E.rect = [E.rect[0], E.rect[1] + (wrapLines(c, d.cur, 625, '600 30px ' + FNT.body()).length > 1 ? 30 : 0), E.rect[2], E.rect[3]]; }
      if (k === 'back' && btnDown(hp.back)) E.rect = [E.rect[0], E.rect[1] + 1, E.rect[2], E.rect[3]];
      text(c, s, E, o);
    }
    // 星：前 tier 颗亮
    if (d.v !== 'rankless') { const st = L.draw.filter(i => i.asset === 'star_on' || i.asset === 'star_off'); if (st.length) {
      const y = st[0].rect[1], cx = (st[0].rect[0] + st[st.length - 1].rect[0] + 28) / 2, n = d.max, gap = n > 5 ? 30 : 37;
      for (let i = 0; i < n; i++) sprite(c, i < d.tier ? 'star_on' : 'star_off', [cx - (n * gap - (gap - 28)) / 2 + i * gap, y, 28, 28]); } }
    c.restore();
  }
  const safeDraw = () => { if (D) try { draw(ctx); } catch (e) { console.warn('R154', e); D = null; } };
  let menuDrawn = 0;   // 行囊在叠层之后才画：画完行囊再画详情页
  S.overlay.push({ draw() { if (!(S.menu && performance.now() - menuDrawn < 200)) safeDraw(); } });
  if (typeof drawMenu === 'function') drawMenu = (o => function () { const r = o.apply(this, arguments); menuDrawn = performance.now(); safeDraw(); return r; })(drawMenu);

  // ---------- 点 ----------
  const hitIn = (h, p) => h && p.x >= h.rect[0] && p.x <= h.rect[0] + h.rect[2] && p.y >= h.rect[1] && p.y <= h.rect[1] + h.rect[3];
  function close() { D = null; }
  function tap(p) {
    if (!D || !D.d || performance.now() - D.t0 < 250) return;
    const hp = V[D.d.v].hit;
    if (hitIn(hp.back, p)) { try { playSnd('ui_click'); } catch (e) {} close(); return; }
    if (D.d.v === 'blocked' && hitIn({ rect: [610, 607, 304, 80] }, p)) { try { playSnd('ui_click'); } catch (e) {} if (D.d.why) toast(D.d.why, 2200); return; }
    if (D.d.v === 'ready' && hitIn(hp.upgrade, p)) {
      const { who, id } = D.d; close();
      const r = window.SKT.upgrade(who, id);
      Promise.resolve(r).then(ok => { if (ok && S.menu) setTimeout(() => R154.open(who, id), 80); });
    }
  }
  menuUpdate = (o => function () { if (D) { if (!S.menu) { D = null; return o.apply(this, arguments); } const t = input.tapped; input.tapped = null; if (t) tap(t); if (input.keys && (input.keys.Escape || input.keys.Backspace)) { input.keys.Escape = input.keys.Backspace = false; close(); } return; } return o.apply(this, arguments); })(menuUpdate);
  if (typeof consumeTap === 'function') consumeTap = (o => function () { if (D) { const t = o(); if (t) tap(t); return null; } return o(); })(consumeTap);
  load(TH);

  window.R154 = {
    open(who, id) { const d = build(who, id); if (!d) return false; load(TH); if (window.IMG_GUARD) try { IMG_GUARD.bumpMatch(['r154/' + TH + '/']); } catch (e) {} D = { who, id, t0: performance.now(), d }; return true; },
    close, 
    get state() { return D && D.d; },
  };
})();
