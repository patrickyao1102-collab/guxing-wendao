// ================= R359 · 名录案 + 东厢朝南 配音 / 新地图配乐接进游戏（作者 11-18：「接进去啊，然后把配乐配音都接进去」）=================
// 配音：小云雀 Seed Audio 1.0，一人连念一条，按停顿 + 语音识别对齐切成一句一个文件（r359/vo，140 句）；星旋、叶孤星暂时不配。
//       对话框弹出时按「说话人 + 台词开头」找；短句（五个字以内）要整句一样才放，免得「……嗯」这种别人说的也响。
// 配乐：7 个场景各两版（r359/bgm），默认用一版接进地图，另一版进配乐库「小云雀 11-18 新地图」一组试听，想换跟 Claude 说一声。
// 只进测试版。
(function () {
  if (typeof say !== 'function') return;
  const V = [["苏绫", "恩人是你黑风寨的恩人", "suling_1", 3.81], ["苏绫", "恩人我真的没有杀人", "suling_2", 2.32], ["苏绫", "陆捕头欠我工钱我去找", "suling_3", 4.05], ["苏绫", "白天他不在", "suling_4", 1.28], ["苏绫", "他他把这个藏在头发里", "suling_5", 1.96], ["苏绫", "我不是去讨工钱的从黑", "suling_6", 9.59], ["苏绫", "黑风寨的二当家刘独眼", "suling_7", 15.31], ["苏绫", "他说这件事除了我他只", "suling_8", 5.96], ["苏绫", "那天二更我上楼找他看", "suling_9", 9.33], ["苏绫", "我怕那伙穿黑袍的人知", "suling_10", 4.49], ["苏绫", "恩人小心那些穿黑袍的", "suling_11", 3.5], ["苏绫", "上面这些人我一个一个", "suling_12", 4.21], ["顾长庚", "巡城司推官顾长庚巡城", "gu_1", 5.15], ["顾长庚", "人人都这么说", "gu_2", 1.41], ["顾长庚", "天剑宗的巡城司不收来", "gu_3", 7.26], ["顾长庚", "天剑宗好大的面子", "gu_4", 3.32], ["顾长庚", "巡城司办案最怕的就是", "gu_5", 8.2], ["顾长庚", "温书办都这么说了", "gu_6", 1.65], ["顾长庚", "协查令明日午时前拿不", "gu_7", 9.12], ["顾长庚", "现场在云来客栈二楼天", "gu_8", 6.19], ["顾长庚", "没人知道他谁也没告诉", "gu_9", 2.9], ["顾长庚", "那天我去文书房调名录", "gu_10", 7.29], ["顾长庚", "屋里只有只有温书办在", "gu_11", 6.43], ["顾长庚", "文书房的钥匙在这儿你", "gu_12", 5.72], ["顾长庚", "我没有", "gu_13", 0.99], ["顾长庚", "昨日多有得罪", "gu_14", 1.31], ["温既白", "顾大人天剑宗的担保信", "wen_1", 10.37], ["温既白", "老朽温既白管文书的二", "wen_2", 6.11], ["温既白", "查得怎么样陆捕头是个", "wen_3", 7.55], ["温既白", "顾推官的案头搜出了名", "wen_4", 8.44], ["温既白", "印信谁都能盗文书房的", "wen_5", 6.4], ["温既白", "公文纸一衙门的人都在", "wen_6", 4.62], ["温既白", "落款写得清清楚楚顾长", "wen_7", 6.19], ["温既白", "笔迹这东西谁说得准", "wen_8", 3.66], ["温既白", "可惜晚了", "wen_9", 2.72], ["温既白", "三十年老朽在这衙门里", "wen_10", 6.56], ["温既白", "没师门没家小的散修死", "wen_11", 9.69], ["温既白", "二十七个名字再添两个", "wen_12", 5.22], ["温既白", "上面的人你们惹不起", "wen_13", 4.21], ["老冯", "活人少来这儿", "feng_1", 1.59], ["老冯", "推官让你们看那就看吧", "feng_2", 11.15], ["老冯", "薄刃极薄从身后往前一", "feng_3", 7.13], ["老冯", "干干净净一道挡过的伤", "feng_4", 9.43], ["老冯", "黑的薄片儿跟你们说的", "feng_5", 5.2], ["老冯", "发冠里头有东西", "feng_6", 2.01], ["老冯", "就这些了剩下的问活人", "feng_7", 3.97], ["小六", "客官要热水我这就去烧", "liu6_1", 2.53], ["小六", "锁锁的一向锁着我每天", "liu6_2", 5.75], ["小六", "客官饶命有人给了我二", "liu6_3", 8.93], ["小六", "那人戴着斗笠看不清脸", "liu6_4", 11.7], ["小六", "我我都说了", "liu6_5", 1.44], ["花婆", "哎哟老婆子只替人说媒", "huapo_1", 6.48], ["花婆", "我说我说雇那个刺客鱼", "huapo_2", 10.34], ["花婆", "还有黑风寨那个刘独眼", "huapo_3", 11.94], ["花婆", "昨天夜里已经有一个穿", "huapo_4", 4.91], ["花婆", "鱼七他他在里屋床边那", "huapo_5", 10.45], ["花婆", "鱼七在里屋床边那块石", "huapo_6", 7.94], ["刘独眼", "我我就是个卖布的姓王", "liudu_1", 4.49], ["刘独眼", "躲不过了", "liudu_2", 1.2], ["刘独眼", "账册给你们保我一条命", "liudu_3", 3.92], ["刘独眼", "白先生我没见过脸可我", "liudu_4", 6.97], ["刘独眼", "就是这个声音", "liudu_5", 2.09], ["刘独眼", "我都交代了", "liudu_6", 1.75], ["司正", "顾长庚你还有什么话说", "sizheng_1", 3.37], ["司正", "拿下他", "sizheng_2", 0.89], ["司正", "这桩案子多亏二位仗义", "sizheng_3", 2.74], ["司正", "司里没什么好东西这面", "sizheng_4", 5.51], ["司正", "二位往后路过玄天城巡", "sizheng_5", 4.81], ["司正", "本官坐堂有冤申冤", "sizheng_6", 3.0], ["听雨楼掌柜", "客官从哪儿得来的", "tyboss_1", 1.67], ["听雨楼掌柜", "黄杨木荐工二字这是黑", "tyboss_2", 12.04], ["听雨楼掌柜", "我再送客官一句花婆每", "tyboss_3", 13.01], ["听雨楼掌柜", "我留了一张", "tyboss_4", 1.18], ["听雨楼掌柜", "少侠也来打听丹霞堂秋", "tyboss_5", 7.68], ["听雨楼掌柜", "他来找我是为了一个人", "tyboss_6", 6.35], ["听雨楼掌柜", "他在我这儿买了丝绵买", "tyboss_7", 8.83], ["听雨楼掌柜", "我这儿的茶都是现碾的", "tyboss_8", 10.53], ["听雨楼掌柜", "少侠你说我配不配得上", "tyboss_9", 3.55], ["卖花姑娘·小荷", "少侠要花金桂百草轩掌", "xiaohe_1", 5.2], ["卖花姑娘·小荷", "给玄天城丹霞堂掌柜的", "xiaohe_2", 6.58], ["卖花姑娘·小荷", "她说那位掌柜在收拾后", "xiaohe_3", 7.47], ["卖花姑娘·小荷", "哎呀我又多嘴了喏开得", "xiaohe_4", 6.27], ["卖花姑娘·小荷", "少侠那个传闻是我和姐", "xiaohe_5", 8.41], ["卖花姑娘·小荷", "他就在后山采药少侠再", "xiaohe_6", 4.31], ["卖花姑娘·小荷", "差点激成反的还好有少", "xiaohe_7", 3.45], ["卖花姑娘·小荷", "新摘的栀子花三文一枝", "xiaohe_8", 2.22], ["卖花姑娘·小荷", "买一枝送心上人吧少侠", "xiaohe_9", 2.12], ["王婶", "掌柜的是该出去走走了", "wangshen_1", 7.71], ["王婶", "抓两副安神的掌柜的配", "wangshen_2", 5.12], ["王婶", "可不是嘛小荷那丫头满", "wangshen_3", 12.59], ["王婶", "还说他这半个月天天往", "wangshen_4", 11.78], ["王婶", "掌柜的药钱回头再给你", "wangshen_5", 2.85], ["卖花姑娘·小莲", "哟少侠见过我妹妹小荷", "xiaolian_1", 5.88], ["卖花姑娘·小莲", "我亲眼看见的丹霞堂掌", "xiaolian_2", 12.9], ["卖花姑娘·小莲", "一个全城最好的丹师一", "xiaolian_3", 6.74], ["卖花姑娘·小莲", "我就说不激一激他他再", "xiaolian_4", 4.31], ["卖花姑娘·小莲", "嘘走啦走啦", "xiaolian_5", 1.78], ["丹霞堂伙计", "就是炼这盒明目丹烫的", "huoji_1", 9.35], ["丹霞堂伙计", "那小的给您拿烫伤药", "huoji_2", 1.57], ["丹霞堂伙计", "少侠少侠青阳那位是不", "huoji_3", 3.13], ["丹霞堂伙计", "哎那东厢白收拾了也不", "huoji_4", 10.21], ["丹霞堂伙计", "少侠想看看东厢趁掌柜", "huoji_5", 5.72], ["丹霞堂伙计", "掌柜自己蒙的说晚上看", "huoji_6", 3.16], ["丹霞堂伙计", "听雨楼买的丝绵老板娘", "huoji_7", 3.53], ["丹霞堂伙计", "听雨楼的招牌就是桂花", "huoji_8", 2.38], ["丹霞堂伙计", "听说听雨楼的茶都是现", "huoji_9", 2.61], ["丹霞堂伙计", "那只旧的是掌柜自己用", "huoji_10", 7.29], ["丹霞堂伙计", "听雨楼老板娘收了一屋", "huoji_11", 4.88], ["丹霞堂伙计", "少侠来了掌柜一早就回", "huoji_12", 6.43], ["丹霞堂伙计", "就在隔壁掌柜还多摆了", "huoji_13", 4.26], ["丹霞堂掌柜", "买丹柜上有", "ayan_1", 2.35], ["丹霞堂掌柜", "等等你上回说你是从青", "ayan_2", 4.88], ["丹霞堂掌柜", "顺路的话捎给百草轩那", "ayan_3", 12.36], ["丹霞堂掌柜", "话多看你的炉去", "ayan_4", 2.22], ["丹霞堂掌柜", "不用", "ayan_5", 0.6], ["丹霞堂掌柜", "我师弟", "ayan_6", 0.81], ["丹霞堂掌柜", "里头还有张字条别偷看", "ayan_7", 3.0], ["丹霞堂掌柜", "你什么时候动身", "ayan_8", 1.28], ["丹霞堂掌柜", "知道了", "ayan_9", 0.68], ["丹霞堂掌柜", "他配的金疮药比我的好", "ayan_10", 2.43], ["丹霞堂掌柜", "谁要娶她我是去跟她学", "ayan_11", 2.72], ["丹霞堂掌柜", "师弟信了", "ayan_12", 1.15], ["丹霞堂掌柜", "没有什么娶亲你就跟师", "ayan_13", 4.15], ["丹霞堂掌柜", "来了坐菜是伙计做的我", "ayan_14", 5.62], ["丹霞堂掌柜", "嗯", "ayan_15", 0.52], ["丹霞堂掌柜", "铺子忙走不开", "ayan_16", 2.4], ["丹霞堂掌柜", "话多吃饭", "ayan_17", 2.04], ["百草轩掌柜", "少侠又来了师兄收到桂", "ache_1", 7.89], ["百草轩掌柜", "那就好喜事定在哪天", "ache_2", 5.51], ["百草轩掌柜", "少侠别哄我被褥桂花哪", "ache_3", 11.02], ["百草轩掌柜", "师兄对谁都这么细", "ache_4", 1.75], ["百草轩掌柜", "听说听雨楼的老板娘也", "ache_5", 3.19], ["百草轩掌柜", "药渣", "ache_6", 1.99], ["百草轩掌柜", "少侠是好心我知道", "ache_7", 3.29], ["百草轩掌柜", "这个口子是师兄十二岁", "ache_8", 16.12], ["百草轩掌柜", "十年了师兄还留着另一", "ache_9", 4.15], ["百草轩掌柜", "少侠玄天城中秋那天冷", "ache_10", 9.12], ["百草轩掌柜", "那我把围巾带上", "ache_11", 2.06], ["百草轩掌柜", "少侠先别告诉师兄他要", "ache_12", 14.5], ["百草轩掌柜", "就失落一个晚上", "ache_13", 4.02]];
  const norm = t => { let s = String(t || ''); if (/^（[^）]*）$/.test(s)) s = s.slice(1, -1); return s.replace(/（[^）]*）/g, '').replace(/[^一-鿿]/g, ''); };
  let cur = null;
  const off = () => { try { return localStorage.getItem('r227_vo_off') === '1'; } catch (e) { return false; } };
  const stop = () => { if (cur) { try { cur.pause(); } catch (e) {} cur = null; } };
  function play(id) { stop(); try { if (off() || (typeof AUD !== 'undefined' && (AUD.muted || !AUD.mode))) return; const a = new Audio('r359/vo/' + id + '.mp3'); a.volume = .95; cur = a; a.play().catch(() => {}); } catch (e) {} }
  const find = (who, text) => { const n = norm(text); if (!n) return null;
    for (const [w, k, id] of V) if (w === who && (k.length <= 5 ? n === k : n.startsWith(k))) return id; return null; };
  say = (orig => function (who, text) { try { const id = find(who, text); if (id) play(id); else stop(); } catch (e) {} return orig.apply(this, arguments); })(say);
  window.R359VO = { V, find, play, stop };

  // ---------- 配乐 ----------
  if (!window.BGM_LIB || !BGM_LIB.tracks || !window.BGM29) return;
  const G = '小云雀 11-18 新地图';
  const TR = {
    dxhome: ['阿焰家院子', '玄天城年轻丹师的家，桂花树、水井、丹炉，秋日午后：古筝竹笛，温馨家常'],
    chehome: ['阿澈家老院', '青阳镇师父留下的老宅小院，院中大桂花树：箫与古琴，朴素安宁、淡淡怀念'],
    memory: ['回忆 · 桂花树下', '十几年前，师父带两个小徒弟在桂花树下：扬琴竹笛，温暖童真带怀旧'],
    midautumn: ['中秋夜', '月圆，院中小桌三副碗筷，等多年未见的人：古琴洞箫二胡，含蓄深情'],
    xtroad: ['青玄近道', '青阳镇往玄天城的山间近道，青石板路、山泉、听瀑亭：竹笛领奏，清新明快'],
    yamen: ['巡城司衙门', '推官查案、提审、对质：低鼓大提琴、古琴零落单音，肃穆压抑'],
    blackmarket: ['黑市夜街', '玄天城东南夜街黑市，牙婆小铺，暗处黑袍人：低音埙、琵琶轮指，诡秘阴冷'],
  };
  const PICK = { dxhome: 2, chehome: 2, memory: 1, midautumn: 1, xtroad: 2, yamen: 1, blackmarket: 2 };   // 默认接进地图的那一版
  if (BGM_LIB.groups && !BGM_LIB.groups.includes(G)) { const at = BGM_LIB.groups.indexOf('戊 · 战斗'); BGM_LIB.groups.splice(at < 0 ? BGM_LIB.groups.length : at, 0, G); }
  let no = 0;
  for (const k in TR) for (const v of [1, 2]) BGM_LIB.tracks['lib_r359_' + k + '_' + v] = { no: '18-' + String(++no).padStart(2, '0'), name: TR[k][0] + ' · ' + (v === 1 ? 'A' : 'B') + (PICK[k] === v ? '（地图在用）' : ''), group: G, kind: 'bgm', file: 'r359/bgm/' + k + '_' + v + '.mp3', vol: .7, desc: '小云雀 Seed Audio 1.0 · ' + TR[k][1], dur: 100 };
  // 配音也进配乐库，方便一句一句听
  const GV = '名录案 / 东厢朝南 配音（小云雀 11-18）';
  if (BGM_LIB.groups && !BGM_LIB.groups.includes(GV)) BGM_LIB.groups.push(GV);
  V.forEach(([who, txt, f, dur], i) => { BGM_LIB.tracks['lib_r359_vo_' + f] = { no: '话' + String(i + 1).padStart(3, '0'), name: who, group: GV, kind: 'voice', file: 'r359/vo/' + f + '.mp3', vol: 1, desc: '小云雀配音 · ' + who + '：「' + txt + '……」', dur }; });

  const id = k => 'lib_r359_' + k + '_' + PICK[k];
  function want(m) {
    if (!m) return null;
    if (m === 'dx_home') return TMAPS.dx_home && TMAPS.dx_home.night ? 'midautumn' : 'dxhome';
    if (/^dx_(east|kitchen|mainroom)$/.test(m)) return 'dxhome';
    if (m === 'qy_chehome_old' || m === 'dx_home_old') return 'memory';
    if (/^qy_chehome/.test(m)) return 'chehome';
    if (m === 'xt_road') return 'xtroad';
    if (/^ml_(yamen|archive|jail|morgue)$/.test(m)) return 'yamen';
    if (m === 'ml_huapo' || m === 'ml_cellar') return 'blackmarket';
    return null;
  }
  const busy = () => { try { return (typeof battle !== 'undefined' && battle) || window.CINE_PAUSE || !AUD.mode || AUD.muted || !(world && world.map) || !(S.started || S.scene === drawMap); } catch (e) { return true; } };
  function apply() { try { if (busy()) return; const k = want(world.mapName); if (!k) return; if (AUD.bgmName !== id(k) || !AUD.bgm) BGM29.audition(id(k)); } catch (e) {} }
  // 进图时底层要放通用曲：这几张图直接放自己的，不先响一下别的
  if (typeof playBgm === 'function') playBgm = (orig => function (n) {
    try { const T = BGM29.T || {}; const gen = n === 'bgm_shanmen' || /^lib_(r227_|xm)/.test(n || '') || (Object.values(T).includes(n) && n !== T.battle && n !== T.boss && n !== T.title);
      if (gen && !busy()) { const k = want(world.mapName); if (k) { if (AUD.bgmName === id(k) && AUD.bgm) return; return BGM29.audition(id(k)); } } } catch (e) {}
    return orig.apply(this, arguments); })(playBgm);
  if (typeof tileSetMap === 'function') tileSetMap = (orig => function () { const r = orig.apply(this, arguments); setTimeout(apply, 50); setTimeout(apply, 500); return r; })(tileSetMap);
  setInterval(apply, 1000);
  window.R359 = { TR, PICK, want, apply, id };
})();
