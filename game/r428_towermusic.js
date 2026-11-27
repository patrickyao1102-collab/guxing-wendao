// ================= R428 · 万妖塔每层的专属配乐（只进测试版）=================
// 作者 11-28：「背景音乐一定要每一层都配上专属的，你去找小云雀多生成一些……可以找 Gemini 或者 Codex 帮你一起参考」「先配前三层」。
// Gemini 第 11 条给了乐理方案（调式、节拍、配器、起承转合）；Claude 合稿写提示词，小云雀 Seed Audio 1.0 生成，每层两个方向：
//   一层《彼岸眠花》羽调 70 拍：A 古筝泛音 + 竹笛，开头三声编钟（一、五、九层共用这个引子）；B 竹笛 + 琵琶轮指
//   二层《孤关雪刃》商调 65 拍：A 洞箫 + 古琴散音 + 远处军鼓；B 二胡 + 大提琴 + 箫
//   三层《沧溟遗珠》75 拍：A 箜篌琶音 + 排箫 + 水声；B 埙 + 竖琴 + 弦乐
// 配乐库「万妖塔配乐」一组都能试听；作者挑好以后改 PICK。迷宫里放这层的曲子，战斗照旧用战斗曲，打完回来接着放。
(function () {
  if (!window.BGM_LIB || !window.BGM29 || typeof AUD === 'undefined') return;
  const G = '万妖塔配乐（小云雀 11-28）';
  const TR = {
    f1: ['彼岸 · 民族管弦', '一层彼岸梦苑（作者 11-28 05:36 从「中国古风十选」里挑的第 10 首）：二胡、琵琶、古筝、笛箫合奏，小调，凄美苍凉、有宿命感，宏大而克制'],
    linhai: ['林海 · QQ华夏原曲', 'QQ华夏「林海」地图的背景音乐原曲（作者 11-28 07:46：直接放进万妖塔一层，原曲可以用），约 35 秒循环'],
    // 11-28 07:30：拿作者电脑里 QQ华夏那段曲子当参考音频喂小云雀（只当参考，不放原曲），Gemini 写的 8 段提示词，各出一首
    x1: ['彼岸 · 琵琶竹笛', '琵琶竹笛主奏、钢琴分解和弦，中段二胡弦乐推高潮'], x2: ['彼岸 · 三拍古筝', '三拍子摇曳，古筝泛音与洞箫，中段大鼓推起波澜'],
    x3: ['彼岸 · 古琴升调', '古琴大提琴开篇，竹笛主旋律，中段升调宿命高潮'], x4: ['彼岸 · 扬琴二胡', '扬琴铺底，二胡主旋律，民族管弦层层推高'],
    x5: ['彼岸 · 编钟曲笛', '编钟竖琴琶音，曲笛琵琶对答，中段弦乐澎湃'], x6: ['彼岸 · 中胡扫弦', '箱琴风铃开头，中胡叙事，中段琵琶扫弦与弦乐悲壮高潮'],
    x7: ['彼岸 · 古埙古筝', '古埙引出花海，古筝摇指，中段弦乐绽放后骤然留白'], x8: ['彼岸 · 鼓点笛琶', '中速行进鼓点，琵琶竹笛交织，中段弦乐大鼓宏大起伏'] };
  const HAVE = Object.assign({ linhai: 35, f1: 120, x1: 120, x2: 120, x3: 120, x4: 120, x5: 120, x6: 120, x7: 120, x8: 120 }, window.R428_HAVE || {});   // 实际放进 r428m/ 的（秒数）
  const lib = BGM_LIB.tracks; let i = 0;
  if (BGM_LIB.groups && !BGM_LIB.groups.includes(G)) BGM_LIB.groups.splice(Math.max(0, BGM_LIB.groups.indexOf('戊 · 战斗')), 0, G);
  for (const k in TR) { if (!HAVE[k]) continue; const [name, desc] = TR[k]; lib['lib_r428_' + k] = { no: '塔' + String(++i).padStart(2, '0'), name, group: G, kind: 'bgm', file: 'r428m/' + k + '.mp3', vol: .7, desc: '小云雀 Seed Audio 1.0 · ' + desc, dur: HAVE[k] }; }
  // 每层默认放哪首（作者挑过以后改这里）
  const PICK = { 1: 'linhai' };   // 作者 07:46：一层直接放 QQ华夏林海地图原曲；x1~x8 在配乐库里能试听   // 二、三层还在挑
  const want = () => { try { const mm = /^wyt_f(\d)[abc]?$/.exec((world && world.mapName) || ''); if (!mm) return null; let k = PICK[+mm[1]]; if (!k || !lib['lib_r428_' + k]) return null; return k ? 'lib_r428_' + k : null; } catch (e) { return null; } };
  function apply() { try { if (typeof battle !== 'undefined' && battle) return; if (!AUD.mode || AUD.muted) return; const k = want(); if (!k) return; if (AUD.bgmName !== k || !AUD.bgm) BGM29.audition(k); } catch (e) {} }
  // 底层进图时按地图类型放通用曲——塔里的图有自己的曲子，直接换成它（不先放一下通用曲再换）
  if (typeof playBgm === 'function') playBgm = (orig => function (n) { try { const k = want(); const T = BGM29.T || {}; if (k && !(typeof battle !== 'undefined' && battle) && n !== T.battle && n !== T.boss) { if (AUD.bgmName === k && AUD.bgm) return; BGM29.audition(k); return; } } catch (e) {} return orig.apply(this, arguments); })(playBgm);
  if (typeof tileSetMap === 'function') tileSetMap = (orig => function () { const r = orig.apply(this, arguments); setTimeout(apply, 0); setTimeout(apply, 400); return r; })(tileSetMap);
  setInterval(apply, 1000);
  window.R428 = { TR, PICK, apply };
})();
