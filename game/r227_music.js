// ================= R227 · 支线配乐（作者 11-12：案子进展到紧凑 / 波谲云诡的阶段要换合适的配乐；赌场、客栈、青楼各有各的曲子）=================
// 11 首全是小云雀 Seed Audio 1.0 纯音乐（作者 11-12 傍晚让做）。只进测试版；配乐库「支线配乐」一组里都能试听。
// 两类：① 场所曲——倚翠楼 / 长乐坊 / 云来客栈 / 万宝楼，进门就放；
//       ② 气氛曲——探案寻迹 / 疑云 / 逼近 / 对质 / 揭晓 / 夜探 / 旧事，跟着案子走到哪一步自动换，说到关键那句话时也会换。
// 做法：不改 bgm_music.js 的选曲表（纯净版共用），在它外面再包一层——该放哪首由这里说了算，战斗时不管。
(function () {
  if (!window.BGM_LIB || !window.BGM29 || typeof say !== 'function') return;
  const G = '支线配乐（小云雀 11-12）';
  const TR = {
    case_xunji: ['探案·寻迹', '查案问话、找线索：古琴拨弦、低音提琴拨弦、木鱼小堂鼓轻点，好奇专注带一点疑云', .75, 90],
    case_yiyun: ['疑云', '线索互相矛盾、波谲云诡：埙、二胡滑音、低音弦长音、颂钵小锣，诡谲不安', .75, 90],
    case_bijin: ['逼近', '越追越紧、快抓到关键证据：弦乐顿弓、琵琶轮指、堂鼓由疏到密', .72, 90],
    case_duizhi: ['对质', '当面揭穿：大鼓沉稳单击、古筝扫弦、低音弦与低铜管，压迫冷峻', .75, 90],
    case_jiexiao: ['揭晓', '真相大白：古琴起、洞箫接、弦乐渐亮，释然里带唏嘘', .6, 90],
    case_yetan: ['夜探', '夜里潜入库房 / 旧染坊：低音弦极弱长音、洞箫气声、古琴泛音、远处更鼓，阴冷克制', .7, 90],
    case_jiushi: ['旧事', '说起十年前的旧事、怀念故人：二胡主旋律、古筝琶音、洞箫，哀而不伤', .75, 90],
    yicui: ['倚翠楼', '青楼厅堂：琵琶婉转、古筝琶音、洞箫、手鼓碟铃，柔媚雅致带点慵懒', .7, 120],
    changle: ['长乐坊', '赌坊：三弦月琴带痞气、竹板小堂鼓小锣、板胡短句，市井躁动狡黠', .7, 120],
    yunlai: ['云来客栈', '大客栈大堂：扬琴、竹笛、中阮、木鱼手鼓，温暖热络有烟火气', .7, 120],
    wanbao: ['万宝楼', '珍宝铺：古筝、箜篌琶音、编钟点缀、弦乐轻铺，贵气雅致带点神秘', .72, 118],
  };
  const lib = BGM_LIB.tracks; let i = 0;
  if (BGM_LIB.groups && !BGM_LIB.groups.includes(G)) BGM_LIB.groups.splice(Math.max(0, BGM_LIB.groups.indexOf('戊 · 战斗')), 0, G);
  for (const k in TR) { const [name, desc, vol, dur] = TR[k]; lib['lib_r227_' + k] = { no: '支' + String(++i).padStart(2, '0'), name, group: G, kind: 'bgm', file: 'r227/' + k + '.mp3', vol, desc: '小云雀 Seed Audio 1.0 · ' + desc, dur }; }
  const id = k => 'lib_r227_' + k;
  const sq = q => { try { const s = (S.flags.sq || {})[q]; return s && s.s === 1 ? s.n : -1; } catch (e) { return -1; } };
  let cue = null, cueMap = '';   // 说到某句话时临时换的曲子：换地图就作废
  // 这张图现在该放哪首（null = 不管，照原来的）
  function want(m) {
    if (cue && cueMap === m) return cue;
    cue = null;
    if (/^xt_inn_/.test(m)) { const n = sq('xt_room3');
      if (n < 0) return 'yunlai';
      if (n <= 1) return m === 'xt_inn_hall' && n === 0 ? 'yunlai' : 'case_xunji';
      if (n <= 3) return 'case_yiyun'; if (n === 4) return 'case_bijin'; return 'case_duizhi'; }
    if (/^xt_wanbao_/.test(m)) { const n = sq('xt_fake');
      if (n < 0) return 'wanbao';
      if (n <= 1) return m === 'xt_wanbao_store' ? 'case_yetan' : 'case_xunji';
      if (n === 2 || n === 5) return 'case_yiyun'; if (n <= 4) return 'case_bijin'; return 'case_duizhi'; }
    if (m === 'xt_dyeyard') return 'case_yetan';
    if (/^qy_changle/.test(m)) { if (m === 'qy_changle_2f' && sq('qy_ledger') >= 0) return 'case_yetan'; return 'changle'; }
    if (/^qy_yicui/.test(m)) return 'yicui';
    return null;
  }
  function apply() {
    try { if (typeof battle !== 'undefined' && battle) return; if (!AUD.mode || AUD.muted) return; if (!(world && world.map) || !S.started) return;
      const k = want(world.mapName); if (!k) return; if (AUD.bgmName !== id(k) || !AUD.bgm) BGM29.audition(id(k)); } catch (e) {}
  }
  if (typeof tileSetMap === 'function') tileSetMap = (orig => function () { const r = orig.apply(this, arguments); setTimeout(apply, 0); setTimeout(apply, 400); return r; })(tileSetMap);
  setInterval(apply, 1000);   // 案子推进一步（或打完架回到地图）后一秒内换过来
  // 说到这句话就换曲子（一直放到离开这张图）
  const CUES = [
    [/所以没有贼。因为从头到尾，就没有那箱药/, 'case_jiexiao'], [/^他没有偷。/, 'case_jiexiao'], [/^都活着？/, 'case_jiexiao'],
    [/齐刷刷泛起一层幽幽的青光/, 'case_yiyun'], [/然后，门自己开了/, 'case_bijin'], [/一刻钟进一个。前面的人进去了，可有一个出来过/, 'case_duizhi'],
    [/账本写的是左手/, 'case_yiyun'], [/被黑风寨围住的那天。你摇了么/, 'case_duizhi'],
    [/有人等了你十年/, 'case_jiushi'], [/代沈师兄谢过/, 'case_jiushi'], [/叶孤星一掌按在骰盅上/, 'case_bijin'],
  ];
  say = (orig => function (who, text) {
    try { const t = String(text || ''); for (const [re, k] of CUES) if (re.test(t)) { cue = k; cueMap = world.mapName; apply(); break; } } catch (e) {}
    return orig.apply(this, arguments);
  })(say);
  window.R227 = { TR, want, apply, id, mood(k) { cue = k || null; cueMap = world.mapName; if (k) apply(); else BGM29.resume(); } };
})();
