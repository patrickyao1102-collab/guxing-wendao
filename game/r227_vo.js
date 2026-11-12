// ================= R227 · 支线关键对话配音（作者 11-12：「支线一些关键对话也配音，小云雀做就行了」）=================
// 样板：「天字三号房」最后当众说穿那一场。小云雀 Seed Audio 1.0：叶孤星用资源库里的冷厉版参考音、星旋用「星旋正式声音」，
// 新角色（钱满仓 / 柳三娘 / 城卫 / 阿顺 / 沈霜）按人设各出一个音色；同一个人连说一条，再按停顿切成一句一个文件。
// 对话框弹出时按「说话人 + 台词开头几个字」找配音，下一句弹出时停掉上一句。只进测试版。
(function () {
  if (typeof say !== 'function') return;
  const V = [
    ['钱满仓', '少侠这是', 'qian_1'], ['钱满仓', '这这位道友', 'qian_2'], ['钱满仓', '我我为什么要迷晕', 'qian_3'], ['钱满仓', '货是真有过的', 'qian_4'], ['钱满仓', '对不住小兄弟', 'qian_5'],
    ['柳三娘', '小店的楼梯', 'liu_1'], ['柳三娘', '报官他坐三年牢', 'liu_2'], ['柳三娘', '钱满仓你不是会算账', 'liu_3'], ['柳三娘', '苦主是我', 'liu_4'], ['柳三娘', '少侠小店十五年', 'liu_5'], ['柳三娘', '这块房牌您拿着', 'liu_6'],
    ['查案的城卫', '可窗台上的泥印', 'guard_1'], ['查案的城卫', '这不合规矩吧', 'guard_2'], ['查案的城卫', '钱满仓诈赔', 'guard_3'], ['查案的城卫', '少侠惭愧', 'guard_4'],
    ['云来客栈伙计', '那您就让我替您背', 'shun_1'], ['云来客栈伙计', '客官谢谢您信我', 'shun_2'], ['沈霜', '手很胖', 'shen_1'],
    ['叶孤星', '抓到了就在这间屋里', 'ye1_1'], ['叶孤星', '第一件门闩和窗栓', 'ye1_2'], ['叶孤星', '只有一个鞋尖朝里', 'ye1_3'], ['叶孤星', '第二件两只茶杯', 'ye1_4'],
    ['叶孤星', '第三件你说药箱', 'ye2_1'], ['叶孤星', '可掌柜说你进店那天', 'ye2_2'], ['叶孤星', '所以没有贼', 'ye2_3'], ['叶孤星', '你的货三天前就该交', 'ye2_4'],
    ['星旋', '一进一出白赚两千一', 'xx_1'], ['星旋', '这掌柜的才是这屋里', 'xx_2'], ['星旋', '烫金的帖子不让人看', 'xx_3'],
  ];
  const norm = t => String(t || '').replace(/^（[^）]*）/, '').replace(/（[^）]*）/g, '').replace(/[^一-鿿]/g, '');
  let cur = null, on = true; try { on = localStorage.getItem('r227_vo_off') !== '1'; } catch (e) {}
  const stop = () => { if (cur) { try { cur.pause(); } catch (e) {} cur = null; } };
  function play(id) { stop(); try { if (!on || (typeof AUD !== 'undefined' && (AUD.muted || !AUD.mode))) return; const a = new Audio('r227/vo/' + id + '.mp3'); a.volume = .95; cur = a; a.play().catch(() => {}); } catch (e) {} }
  const find = (who, text) => { const n = norm(text); if (!n) return null; for (const [w, k, id] of V) if (w === who && n.startsWith(k)) return id; return null; };
  say = (orig => function (who, text) { try { const id = find(who, text); if (id) play(id); else stop(); } catch (e) {} return orig.apply(this, arguments); })(say);
  window.R227VO = { V, find, play, stop, set(v) { on = !!v; try { localStorage.setItem('r227_vo_off', v ? '0' : '1'); } catch (e) {} if (!v) stop(); } };
})();
