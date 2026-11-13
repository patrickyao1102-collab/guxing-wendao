// ================= R227 · 支线配乐（作者 11-12：案子进展到紧凑 / 波谲云诡的阶段要换合适的配乐；赌场、客栈、琴楼各有各的曲子）=================
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
    yicui: ['倚翠楼', '琴楼厅堂：琵琶婉转、古筝琶音、洞箫、手鼓碟铃，柔媚雅致带点慵懒', .7, 120],
    changle: ['长乐坊', '赌坊：三弦月琴带痞气、竹板小堂鼓小锣、板胡短句，市井躁动狡黠', .7, 120],
    yunlai: ['云来客栈', '大客栈大堂：扬琴、竹笛、中阮、木鱼手鼓，温暖热络有烟火气', .7, 120],
    wanbao: ['万宝楼', '珍宝铺：古筝、箜篌琶音、编钟点缀、弦乐轻铺，贵气雅致带点神秘', .72, 118],
    // 第二批（11-12 晚，作者：「你多做一些」）
    case_xianshen: ['炼魂谷现身', '反派撕下假面、开打前的对峙：低音铜管大提琴长音、大鼓缓慢沉重、埙的邪气短旋律，杀机四伏', .72, 90],
    case_jiean: ['结案·轻松', '案子圆满了结、道谢道别：竹笛明亮主旋律、古筝琶音、扬琴、小手鼓，雨过天晴', .68, 61],
    shuoshu: ['说书', '茶馆说书人讲故事：三弦带评书味、竹板小书鼓、二胡接句，娓娓道来带点悬念', .7, 91],
    tingyu: ['听雨阁', '倚翠楼二楼临河小阁：古琴独奏、洞箫中段加入，静、淡、清雅，带一点惦记', .72, 120],
    zhangfang: ['账房密谋', '长乐坊二楼账房：三弦低拨、木鱼算盘珠似的细碎节奏、低音提琴拨弦，鬼祟精明', .7, 91],
    diandeng: ['点灯', '玄天城点灵灯：扬琴主旋律、编钟钟琴一颗一颗亮起、竹笛、弦乐铺底，越往后越明亮', .7, 120],
    // 第三批（11-12 夜，作者点名要的三种气氛：阴谋 / 诡异 / 凶杀）
    case_yinmou: ['阴谋', '背后有人布局、越想越深：低音大提琴下行固定音型、古琴低音区主旋律、箫、定音鼓轻滚、云锣，阴沉、深不见底', .72, 90],
    case_guiyi: ['诡异', '眼前的东西不对劲：古筝高音区零星单音与刮弦、二胡细长滑音、碟铃水滴似的点几下、低音弦铺底，发毛、空气像凝住了', .72, 90],
    case_xiongsha: ['凶杀', '命案现场、血迹未干：大鼓心跳般单击、低音弦压抑顿弓、琵琶低音区扫弦绞弦、埙凄厉短旋律，肃杀惊心带一丝悲悯', .72, 90],
    // 第四批（11-13，作者：很多城池用的还是别的城池的曲子，最好每张地图的音乐都别重复；连着走的地图共用一首）
    map_xtcity: ['玄天城', '修士往来的仙家大城，白天走在城中大街上：气派、明朗、繁华而不吵：扬琴与古筝奏明亮大气的主旋律，竹笛接句，中阮和大提琴铺底，编钟点缀，小堂鼓和手鼓给出从容的行进感', 0.7, 120],
    map_linforest: ['山外树林', '云霄山脉脚下的树林，少年第一次出远门，清晨阳光透过树叶：竹笛奏轻快跳跃的主旋律，古筝琶音，木琴或竹板轻点，弦乐拨奏，小手鼓', 0.7, 110],
    map_heifeng: ['黑风谷 · 黑风寨', '山贼盘踞的险恶峡谷和山寨，石壁阴森，路边有累累白骨：低音大鼓与战鼓沉重的固定节奏，唢呐或管子奏粗砺凶悍的短旋律，低音弦乐顿弓，铜钹和大锣偶尔一击，三弦低拨', 0.66, 110],
    map_sealfield: ['后山林间', '宗门后山一片少有人来的密林，深处有一道古老的封印：古琴泛音奏空灵的主旋律，洞箫长音，颂钵与风铃，极轻的弦乐长音铺底，偶尔一声低沉的鼓', 0.7, 110],
    map_luoyun: ['落云岭 · 落云谷', '云雾缭绕的高岭和深谷，松溪、乱林、雾锁灵渊：洞箫与竹笛对答的辽远主旋律，古筝流水般的琶音，箜篌或竖琴，弦乐长音像云一样铺开，远处的定音鼓轻滚', 0.7, 120],
    map_qywar: ['兽潮战场', '妖兽压境，少年们在镇外拼死抵挡、追击救人：战鼓急促的行军节奏，弦乐急速顿弓，琵琶扫弦，唢呐与铜管奏悲壮激昂的主旋律，铜钹', 0.62, 100],
    map_shelter: ['避难营', '兽潮之夜，镇上的老弱躲在后山营地，篝火旁有人低声安慰孩子：二胡奏温柔而疲惫的主旋律，古筝轻轻的分解和弦，洞箫，极轻的弦乐铺底', 0.7, 100],
    map_songfeng: ['松风林道', '少年初次下山，走在松林间的山道上，前面是没见过的世界：竹笛奏洒脱明亮的主旋律，琵琶轮指，古筝，弦乐轻快的拨奏，小堂鼓和马蹄似的木鱼节奏', 0.7, 110],
    map_cangyue: ['苍月城', '一座临水而建的月色之城，南门府街与临水的城主府，清冷雅致：古筝与箜篌奏清冷优美的主旋律，洞箫接句，钟琴或编钟像月光洒在水面，弦乐轻柔铺底，轻轻的水波似的琶音', 0.7, 120],
    map_cybei: ['苍月北郊 · 白岩沉坛', '城北荒郊，一片惨白的岩石和一座沉入地下的古祭坛，邪气暗涌：低音弦乐极弱的长音，埙奏荒凉的短旋律，古琴低音区单音，颂钵，远处闷闷的大鼓，偶尔金属摩擦似的弦乐泛音', 0.66, 100],
    map_cangjing: ['藏经阁', '宗门的藏书楼，外院、一层书库、二层禁阁，千年典籍，静得能听见翻书声：古琴奏沉静悠远的主旋律，编钟与磬轻轻点缀，洞箫长音，极轻的弦乐铺底', 0.7, 110],
    map_paimai: ['玄元拍卖场', '修真大城里最大的拍卖场和二楼雅间，奇珍异宝，各方势力暗中较劲：古筝与扬琴奏华贵的主旋律，大提琴拨弦给出从容的律动，编钟，弦乐，低音鼓轻轻垫着，偶尔一声清脆的磬像落槌', 0.7, 100],
    map_chaguan: ['青阳茶馆', '小镇茶馆，老人喝茶下棋，说书先生还没开讲：古筝奏悠闲的主旋律，竹笛，三弦轻拨，木鱼和小手鼓轻轻点着', 0.7, 90],
    map_zuixian: ['醉仙楼', '小镇上最热闹的酒楼，划拳的、听琵琶的、喝醉的：琵琶奏活泼带醉意的主旋律，板胡或二胡接句，扬琴，竹板和手鼓，中阮', 0.7, 90],
    map_yuelai: ['悦来客栈', '小镇客栈，朴实的掌柜，过路的行商，后厨飘来饭香：中阮与扬琴奏朴实温暖的主旋律，竹笛，木鱼和小手鼓，大提琴拨弦', 0.7, 90],
    map_tiejiang: ['铁匠铺', '炉火通红，铁匠一锤一锤打着铁：铁砧似的金属敲击声当作节奏乐器（叮、当、叮叮当），低音鼓，三弦和板胡奏硬朗豪爽的主旋律，大提琴顿弓', 0.7, 90],
    map_baicao: ['百草轩', '满屋药香的老药铺，掌柜慢条斯理地称药：洞箫奏温和安宁的主旋律，古筝，碟铃或小磬像戥子轻碰，极轻的弦乐铺底', 0.7, 90],
  };
  const lib = BGM_LIB.tracks; let i = 0;
  if (BGM_LIB.groups && !BGM_LIB.groups.includes(G)) BGM_LIB.groups.splice(Math.max(0, BGM_LIB.groups.indexOf('戊 · 战斗')), 0, G);
  for (const k in TR) { const [name, desc, vol, dur] = TR[k]; lib['lib_r227_' + k] = { no: '支' + String(++i).padStart(2, '0'), name, group: G, kind: 'bgm', file: 'r227/' + k + '.mp3', vol, desc: '小云雀 Seed Audio 1.0 · ' + desc, dur }; }
  const id = k => 'lib_r227_' + k;
  const sq = q => { try { const s = (S.flags.sq || {})[q]; return s && s.s === 1 ? s.n : -1; } catch (e) { return -1; } };
  let cue = null, cueMap = '', cueEnd = 0, cueTalk = false;   // 说到某句话时临时换的曲子：换地图就作废；带时限的到点也作废
  // 作者 11-13：「说书先生说完话，他的专属曲整整放了很久——不是该 5–10 秒就停下来，接着放我们本来的曲子吗」
  // → 跟人说话换的曲子（cueTalk）只在对话框开着的时候放，对话关掉 6 秒后回到本地图的曲子，而且从刚才停下的地方接着放，不从头来。
  // 每首曲子换走时记住放到了第几秒；五分钟内又回到这首（出了民宅回到城里、说书说完回到茶馆的曲子……），就从那儿接着放。
  // 战斗、首领、标题曲和剧情里点的气氛曲（案子各阶段、说书、点灯）不接，每次照常从头。
  const POS = {};
  const noResume = n => { const T = (window.BGM29 && BGM29.T) || {}; return !n || n === T.battle || n === T.boss || n === T.title || /^lib_r227_(case_|shuoshu|diandeng)/.test(n); };
  const savePos = () => { try { if (AUD.bgmName && AUD.bgm && AUD.bgm.a) POS[AUD.bgmName] = { t: AUD.bgm.a.currentTime || 0, at: Date.now() }; } catch (e) {} };
  const restorePos = () => { try { const n = AUD.bgmName, p = POS[n], a = AUD.bgm && AUD.bgm.a; if (p && a && !noResume(n) && Date.now() - p.at < 300000 && p.t > 1) a.currentTime = p.t; } catch (e) {} };
  // 这张图现在该放哪首（null = 不管，照原来的）
  function want(m) {
    if (cue && cueMap === m && (!cueEnd || Date.now() < cueEnd)) return cue;
    cue = null;
    if (/^xt_inn_/.test(m) && sq('xt_lamp') >= 0) { const n = sq('xt_lamp'); if (m === 'xt_inn_room1') return n === 4 ? 'case_guiyi' : 'case_xiongsha'; return n <= 1 ? 'case_yiyun' : n === 2 ? 'case_guiyi' : n <= 4 ? 'case_bijin' : n === 5 ? 'case_yinmou' : 'case_duizhi'; }
    if (/^xt_inn_/.test(m)) { const n = sq('xt_room3');
      if (n < 0) return 'yunlai';
      if (n <= 1) return m === 'xt_inn_hall' && n === 0 ? 'yunlai' : 'case_xunji';
      if (n <= 3) return 'case_yiyun'; if (n === 4) return 'case_bijin'; return 'case_duizhi'; }
    if (/^xt_wanbao(_|$)/.test(m)) { const n = sq('xt_fake');   // 作者 11-13：一楼、二楼雅间、后院库房是同一座楼，用同一首（原来一楼漏了，上下楼就换曲）
      if (n < 0) return 'wanbao';
      if (n <= 1) return m === 'xt_wanbao_store' ? 'case_yetan' : 'case_xunji';
      if (n === 2) return 'case_yiyun'; if (n === 5) return 'case_yinmou'; if (n <= 4) return 'case_bijin'; return 'case_duizhi'; }
    if (m === 'xt_dyeyard') return 'case_yetan';
    if (/^qy_changle/.test(m)) { if (m === 'qy_changle_2f') return sq('qy_ledger') >= 0 ? 'case_yetan' : 'zhangfang'; return 'changle'; }
    if (m === 'qy_yicui_2f') return 'tingyu';
    if (/^qy_yicui/.test(m)) return 'yicui';
    const mb = MAPBGM(m); if (mb) return generic() ? mb : null;
    return null;
  }
  // 各地图自己的曲子（第四批）。只在「现在放的是通用地图曲」时才换——剧情里特意点的曲子（剑鸣、首领战、夜里的戏）不抢。
  const MAPBGM = m => m === 'xt_city' || /^xt_home_/.test(m) ? 'map_xtcity' : m === 'lin_forest' ? 'map_linforest' : /^hf_/.test(m) ? 'map_heifeng' : m === 'seal_field' ? 'map_sealfield' : /^ly_/.test(m) ? 'map_luoyun'
    : /^qy_(escape|defense|rescue)/.test(m) ? 'map_qywar' : m === 'qy_shelter' ? 'map_shelter' : m === 'tj_xiashan' ? 'map_songfeng' : m === 'm_cy_north' ? 'map_cybei' : /^m_cy_/.test(m) ? 'map_cangyue'
    /* 作者 11-13：藏经阁那首太难听 → 先撤下，藏经阁回到原来的曲子；重做好了再接回来 */
    : /^xt_auction/.test(m) ? 'map_paimai' : m === 'qy_tea' ? 'map_chaguan' : m === 'qy_tavern' ? 'map_zuixian' : m === 'qy_inn' ? 'map_yuelai' : m === 'qy_smith' ? 'map_tiejiang' : m === 'qy_herb' ? 'map_baicao' : null;
  const generic = () => { try { const n = AUD.bgmName || '', T = BGM29.T || {}; return /^lib_r227_/.test(n) || [T.wild, T.shop, T.xtcity, T.sect, T.town, T.fair, T.linfu].includes(n); } catch (e) { return false; } };

  const back = () => { if (S.started) BGM29.resume(); else { AUD.bgmName = ''; playBgm('bgm_shanmen', true); } };   // 没正式开局（测试面板跳图）时 resume 会放标题曲，这里直接接回本地图的曲子
  function apply() {
    try { if (typeof battle !== 'undefined' && battle) return; if (!AUD.mode || AUD.muted) return; if (!(world && world.map) || !(S.started || S.scene === drawMap)) return;   // 作者 11-13：从测试面板直接跳地图时 S.started 还是假的，新配乐一首都不放——改成「人已经站在地图上」也算
      if (cue && cueTalk && ((typeof dialog !== 'undefined' && dialog) || (typeof choice !== 'undefined' && choice))) cueEnd = Date.now() + 6000;   // 还在说话：往后顺延
      const k = want(world.mapName); if (!k) { if (/^lib_r227_/.test(AUD.bgmName || '') && !MAPBGM(world.mapName)) back(); return; } if (AUD.bgmName !== id(k) || !AUD.bgm) BGM29.audition(id(k)); } catch (e) {}
  }
  // 作者 11-13：「很多地图音乐应该是连续的——明明是同一首，换一张地图就从头放」。
  // 原因：进图时底层先按「地图类型」放一首通用曲（比如客栈走廊 = 商铺曲），这里稍后再换回本楼的曲子，一换就从头开始了。
  // 改成：底层要放通用曲时先问一句「这张图有没有自己的曲子」——有，而且正在放的就是它，就什么都不做（接着放）；有但不是它，直接换成它。
  if (typeof playBgm === 'function') playBgm = (orig => function (n, force) {
    try { const T = (window.BGM29 && BGM29.T) || {}, gen = n === 'bgm_shanmen' || (Object.values(T).includes(n) && n !== T.battle && n !== T.boss && n !== T.title);
      if (gen && world && world.map && !(typeof battle !== 'undefined' && battle) && AUD.mode && !AUD.muted) { const m = world.mapName, k = want(m);
        if (/^qy_home_/.test(m) && AUD.bgmName === T.qytown && AUD.bgm) return;   // 青阳镇的民宅：镇上的曲子接着放
        if (k) { if (AUD.bgmName === id(k) && AUD.bgm) return; BGM29.audition(id(k)); return; } } } catch (e) {}
    return orig.apply(this, arguments); })(playBgm);
  // 最外面一层：不管是谁换的曲子，换之前记下旧曲放到哪儿，换完看新曲以前有没有放到一半的
  if (typeof playBgm === 'function') playBgm = (orig => function () { const before = AUD.bgmName; savePos(); const r = orig.apply(this, arguments); if (AUD.bgmName !== before) restorePos(); return r; })(playBgm);
  { const au = BGM29.audition; BGM29.audition = function (k) { const before = AUD.bgmName; if (before !== k) savePos(); const r = au.apply(this, arguments); if (before !== k) restorePos(); return r; }; }
  if (typeof tileSetMap === 'function') tileSetMap = (orig => function () { const r = orig.apply(this, arguments); setTimeout(apply, 0); setTimeout(apply, 400); return r; })(tileSetMap);
  setInterval(apply, 1000);   // 案子推进一步（或打完架回到地图）后一秒内换过来
  // 说到这句话就换曲子（一直放到离开这张图）
  const CUES = [
    [/所以没有贼。因为从头到尾，就没有那箱药/, 'case_jiexiao'], [/^他没有偷。/, 'case_jiexiao'], [/^都活着？/, 'case_jiexiao'],
    [/齐刷刷泛起一层幽幽的青光/, 'case_guiyi'], [/然后，门自己开了/, 'case_bijin'], [/一刻钟进一个。前面的人进去了，可有一个出来过/, 'case_duizhi'],
    [/账本写的是左手/, 'case_yinmou'], [/被黑风寨围住的那天。你摇了么/, 'case_duizhi'],
    [/有人等了你十年/, 'case_jiushi'], [/代沈师兄谢过/, 'case_jiushi'], [/叶孤星一掌按在骰盅上/, 'case_bijin'],
    [/老先生眼睛瞎了，心倒不瞎/, 'case_xianshen'], [/天剑宗的小辈。一封密信，一把古剑/, 'case_xianshen'],
    [/客官，谢谢您信我/, 'case_jiean'], [/老秦，我……我对不住你/, 'case_jiean'], [/小兄弟。方才那几句话，对不住/, 'case_jiean'],
    [/七年前，黑风寨头一回下山抢粮/, 'case_jiushi', 120], [/恕我冒昧。贵宗外门/, 'case_jiushi'],
  ];
  // 跟这个人说话就换曲子（放一阵子自己换回去）
  const WHO = { '说书先生': 'shuoshu', '司灯老人': 'diandeng' };
  say = (orig => function (who, text) {
    try { const t = String(text || ''); let hit = null, talk = false; for (const [re, k, sec] of CUES) if (re.test(t)) { hit = [k, sec]; break; } if (!hit && WHO[who]) { hit = [WHO[who], 6]; talk = true; }
      if (hit && !(talk && cue === hit[0] && cueTalk)) { cue = hit[0]; cueMap = world.mapName; cueTalk = talk; cueEnd = hit[1] ? Date.now() + hit[1] * 1000 : 0; apply(); }
      else if (talk && cue === hit[0]) cueEnd = Date.now() + 6000; } catch (e) {}
    return orig.apply(this, arguments);
  })(say);
  window.R227 = { TR, want, apply, id, MAPBGM, mood(k) { cue = k || null; cueMap = world.mapName; if (k) apply(); else back(); } };
})();
