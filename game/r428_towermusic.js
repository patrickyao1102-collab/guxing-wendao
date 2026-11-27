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
    f1a: ['彼岸眠花 · A', '一层彼岸梦苑：开头三声编钟，古筝泛音与竹笛主奏，风铃点缀，低音弦乐铺底，温柔甜美又带一丝危险迷幻'],
    f1b: ['彼岸眠花 · B', '一层彼岸梦苑：竹笛与琵琶轮指主奏，古筝轻拨，羽调，如梦似幻，温柔里藏着哀伤与执念'],
    f2a: ['孤关雪刃 · A', '二层北关雪城：洞箫与古琴散音主奏，寒风呼啸，远处稀疏军鼓，商调，苍凉孤寂、冷冽肃杀'],
    f2b: ['孤关雪刃 · B', '二层北关雪城：二胡与大提琴合奏，箫声穿插，悲壮深沉，将军守城的孤傲与守诺'],
    f3a: ['沧溟遗珠 · A', '三层沉渊龙宫：箜篌琶音与排箫主奏，水晶音色与水波声，空灵剔透、淡淡的孤独'],
    f3b: ['沧溟遗珠 · B', '三层沉渊龙宫：埙与流水般的竖琴，弦乐铺底，静谧深邃，温柔又忧伤'] };
  const HAVE = window.R428_HAVE || {};   // 实际交到 r428m/ 的那几首（生成没成功的不登记）
  const lib = BGM_LIB.tracks; let i = 0;
  if (BGM_LIB.groups && !BGM_LIB.groups.includes(G)) BGM_LIB.groups.splice(Math.max(0, BGM_LIB.groups.indexOf('戊 · 战斗')), 0, G);
  for (const k in TR) { if (!HAVE[k]) continue; const [name, desc] = TR[k]; lib['lib_r428_' + k] = { no: '塔' + String(++i).padStart(2, '0'), name, group: G, kind: 'bgm', file: 'r428m/' + k + '.mp3', vol: .7, desc: '小云雀 Seed Audio 1.0 · ' + desc, dur: HAVE[k] }; }
  // 每层默认放哪首（作者挑过以后改这里）
  const PICK = { 1: 'f1a', 2: 'f2a', 3: 'f3a' };
  const want = () => { try { const mm = /^wyt_f(\d)$/.exec((world && world.mapName) || ''); if (!mm) return null; let k = PICK[+mm[1]]; if (!lib['lib_r428_' + k]) k = Object.keys(HAVE).find(x => x[1] === mm[1]); return k ? 'lib_r428_' + k : null; } catch (e) { return null; } };
  function apply() { try { if (typeof battle !== 'undefined' && battle) return; if (!AUD.mode || AUD.muted) return; const k = want(); if (!k) return; if (AUD.bgmName !== k || !AUD.bgm) BGM29.audition(k); } catch (e) {} }
  // 底层进图时按地图类型放通用曲——塔里的图有自己的曲子，直接换成它（不先放一下通用曲再换）
  if (typeof playBgm === 'function') playBgm = (orig => function (n) { try { const k = want(); const T = BGM29.T || {}; if (k && !(typeof battle !== 'undefined' && battle) && n !== T.battle && n !== T.boss) { if (AUD.bgmName === k && AUD.bgm) return; BGM29.audition(k); return; } } catch (e) {} return orig.apply(this, arguments); })(playBgm);
  if (typeof tileSetMap === 'function') tileSetMap = (orig => function () { const r = orig.apply(this, arguments); setTimeout(apply, 0); setTimeout(apply, 400); return r; })(tileSetMap);
  setInterval(apply, 1000);
  window.R428 = { TR, PICK, apply };
})();
