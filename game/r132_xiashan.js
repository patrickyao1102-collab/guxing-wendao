// ================= R132 · 旧版「幽影林」下线，图改做天剑宗山门外的野外地图（作者 11-06 深夜）=================
// 旧幽影林 yy_forest 是借山外树林的格子图加夜色做的；幽影林现在用 Codex 新图（追虎迷径 / 林尽闻声），旧的从游戏和测试面板里拿掉。
// 整个游戏里只有「天剑宗 · 演武广场」南边的山门（下山）出去没有野外地图（以前一直锁着，点了只提示不能下山），
// 所以把这张图改成山门外的「天剑山下 · 松风林道」：第二章宗主准许下山（ch2_depart）后山门放行，林子里是低阶妖兽，可以历练。
(function () {
  if (typeof TMAPS === 'undefined' || !TMAPS.yy_forest || !TMAPS.lin_forest) return;
  const F = () => (typeof S !== 'undefined' && S.flags) || {};
  const at = (x, y) => [x / 64 - .5, y / 64 - .8];
  const OLD = TMAPS.yy_forest, LIN = TMAPS.lin_forest, FR = TMAPS.tj_front;
  const KEY = 'tj_xiashan';
  // 出口沿用山外树林同一张图上原有的两个路口（北口 / 林间岔道），传送法阵样式和别的图一样
  const top = (LIN.exits || []).find(e => e.to === 'qy_town'), side = (LIN.exits || []).find(e => e.to === 'qy_escape');
  const gate = FR && (FR.exits || []).find(e => /山门/.test(e.label || ''));
  const backAt = gate ? at((gate.x + gate.w / 2) * 32, (gate.y - 3) * 32) : null;   // 回到山门内侧
  const exits = [];
  if (top) exits.push({ x: top.x, y: top.y, w: top.w, h: top.h, to: 'tj_front', at: backAt, face: 'up', label: '上山 · 天剑宗山门', cond: () => true });
  if (side) exits.push({ x: side.x, y: side.y, w: side.w, h: side.h, to: 'tj_front', at: backAt, face: 'up', label: '林间小径 · 回天剑宗山门', cond: () => true });
  TMAPS[KEY] = Object.assign({}, OLD, {
    title: '天剑山下 · 松风林道', name: KEY, night: false,
    exits,
    mobs: Object.assign({}, LIN.mobs || OLD.mobs, { n: 7, types: ['wolf', 'monkey', 'wolf2', 'monkey'], bg: 'bg_mountain', lvR: [6, 9] }),
    chests: (OLD.chests || []).map(c => Object.assign({}, c, { items: [['p_big', 1], ['gold', 60]] })),
    npcs: [],
    onEnter: null,
  });
  // 山门：宗主准许下山之后放行，出去就是这片林道
  if (gate) {
    const inAt = top ? at((top.x + top.w / 2) * 32, (top.y + top.h + 3) * 32) : null;
    Object.assign(gate, { to: KEY, at: inAt, face: 'down', label: '南 · 山门（下山）', cond: () => !!F().ch2_depart });
    gate.msg = '这是下山的山门。没有宗主吩咐，不能私自下山。'; delete gate.noNav;
  }
  // 女娲秘境「绛荚分溪」的「返回幽影林」出口没写落点（走进去会报错卡住）：落到追虎迷径东北虎痕旁（秘境入口那片空地）
  const CR = TMAPS.m_nw_creek;
  if (CR) for (const e of CR.exits || []) if (e.to === 'm_yy_tiger' && !e.at) { e.at = at(4380, 1900); e.face = 'down'; }
  // 玄天城南门 / 城墙小道 / 剧情里写的 goMap('yy_forest') 由 r107 统一改道到新幽影林「追虎迷径」南口，这里只删旧图
  // 南城门那个出口的目标是写死的 'yy_forest'（只读属性改不了），留一个不可枚举的别名指向新图：
  // 测试面板 / 大地图列表（Object.keys）里不再出现旧幽影林，出口光阵和任务指引照常认得这条路
  delete TMAPS.yy_forest;
  if (TMAPS.m_yy_tiger) Object.defineProperty(TMAPS, 'yy_forest', { value: TMAPS.m_yy_tiger, enumerable: false, configurable: true, writable: true });
})();
