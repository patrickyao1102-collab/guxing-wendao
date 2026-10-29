// ================= R66 · 集市 NPC 多样化（一）：在 r60_market.js 读数据之前，换掉访客 / 旁观者的贴图名 =================
// Codex 交付：12 套各不相同的访客行走图（老婆婆、挑夫、绣娘、樵夫、卖花姑娘……）、8 张旁观者单帧、6 个店主的呼吸待机图 + 灵光。
// 这里只改数据表（谁用哪张图）；真正的画法在 r66_npc.js 里（图片由它自己加载，不走 r60 的贴图表）。
(function () {
  const D = window.R60; if (!D || !D.life) return;
  const L = D.life;
  const VIS = ['ashi', 'zhaopopo', 'xuyan', 'qinxiaowan', 'laozhou', 'suling', 'daniu', 'afu', 'qingfeng', 'liuniang', 'laoqiaofu', 'xiaohe'];
  const VNAME = { ashi: '外门弟子·阿石', zhaopopo: '赵婆婆', xuyan: '青年·许言', qinxiaowan: '秦小婉', laozhou: '散修·老周', suling: '女弟子·苏铃', daniu: '挑夫·大牛', afu: '绣娘·阿芙', qingfeng: '小师弟·清风', liuniang: '柳娘', laoqiaofu: '老樵夫', xiaohe: '卖花姑娘·小荷' };
  const GUEST = ['chenfuzi', 'shenzhi', 'hanping', 'lulao', 'aheng', 'qianduoduo', 'wanglaobo', null];   // 第 8 个旁观者是画师·墨娘，Codex 画成了巡值弟子，先保留原图
  const GNAME = { chenfuzi: '老书生·陈夫子', shenzhi: '女剑修·沈芷', hanping: '受伤弟子·韩平', lulao: '老阵师·鲁老', aheng: '阿蘅', qianduoduo: '富家公子·钱多多', wanglaobo: '王老伯' };
  (L.visitors || []).forEach((v, i) => { v.texture = 'visitor_' + VIS[i % VIS.length]; v.who = VNAME[VIS[i % VIS.length]]; });
  (L.onlookers || []).forEach((o, i) => { const g = GUEST[i]; if (g) { o.texture = 'guest_' + g; o.who = GNAME[g]; } });
  // 全图合理性：长在石头上、杵在铺子台子上 / 柜台边上的三棵樱花树去掉（r60-cherry-0 在五曜商阁左角、cherry-3 在符阵坊台子上、cherry-4 在符阵坊右侧），
  // 顺手把它们原来的阻挡格清掉（铺子自己的阻挡由 r66_npc.js 按贴图轮廓重新补）
  try { const B = D.map, DROP = new Set(['r60-cherry-0', 'r60-cherry-3', 'r60-cherry-4']); const bl = B.blocked.split(''), cs = B.cs;
    for (const o of B.objs) if (DROP.has(o.uid)) { const c0 = Math.max(0, Math.floor(o.x / cs)), c1 = Math.min(B.cols - 1, Math.floor((o.x + o.w) / cs)), r0 = Math.max(0, Math.floor((o.sy - o.h * .35) / cs)), r1 = Math.min(B.rows - 1, Math.floor(o.sy / cs)); for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) bl[r * B.cols + c] = '0'; }
    B.blocked = bl.join(''); B.objs = B.objs.filter(o => !DROP.has(o.uid)); } catch (e) {}
  window.R66 = { VIS, VNAME, GUEST, GNAME };
})();
