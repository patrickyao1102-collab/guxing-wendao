// ================= R406 · 装备铺开：一格三件 / 四件，117 件新装备、10 种新料（只进测试版）=================
// 作者 11-27 17:09：「装备数量太少了，每个属性当前等级只有一件……低等级每个属性起码也有三件，等级高了以后最多可以到五件。
//   玩家有几率用相同材料合出主属性最高的那一件……不同装备里面它能达到的上限最高的，一定有一件是最高的，看运气能合出来。」
// 17:37 点头的排法：部位 × 五行算一格。练气档一格三件，凝丹档四件（引魂、归元五件，做到那儿再加）。
//   · 同样的料随机出其中一件：常见 → 套装件（饰品没有套装，叫「少见」）→ 稀有 → 难得；主属性的上限从左到右越来越高，难得比常见高两成上下。
//   · 套装件在中间——最好的那件是不成套的散件，要套装效果还是要数值，玩家自己挑。最好的那件只有炉子出（以后还有试炼），店里只卖常见的。
// 17:50 / 18:02：料分档，不同档的料可以混着放——每放一样高一档的料，出高一档装备的机会多两成。这条规矩在 r400_craft.js。
// 11-28：每格最好的那一件起了专名（作者看过点头：最好那件用成语或自己造的四字词——枯木逢春、上善若水、海不扬波、丹凤朝阳、青鸾衔尾……；11-28 13:23 作者：最好的兵器一律四个字、不带「剑」——孤光剑→孤光自照、烛照剑→烛照九幽；顺手把不足四字的火浣衣/山文甲/明光铠/琥珀春也改成四字），说明和图不动。
// 取名的规矩（作者 11-27 下午）：不用神名人名，不全往上古神话上靠，星痕、云雷、凝霜这样的意象名最好。名录给作者看过。
//
// 这个文件放的是：
//   一、格子表：175 件各在哪一格、第几等。117 件新装备的数和说明也在表里；原有的 58 件只写名字牌。
//   二、原有那 58 件排进格子：等级理齐（练气档 6 级、凝丹档 11 级——原来凝丹档五个系列从 10 级到 14 级不等，火性的人要多等四级才有得穿）；
//       有 14 件的数对不上它在格子里的位置，改了（改了什么见 CHG）；五行佩五件照「饰品攻击排第三」补了攻击。
//   三、十种新料：练气档每个五行两类料都有了，凝丹档补上水的兵饰料、土的兵饰料。连同出处：妖物掉、宝箱、钓鱼、店里卖。
//       另有四样强化材料（淬灵砂、晶、玉、髓）和它们的出处。
//   四、图标：Codex R406 / R407 / R408（r406i/<名字牌>.webp，192 见方）。圈的颜色跟着第几等走：常见灰、套装件和少见绿、稀有蓝、难得金。
//   五、店里添货：常见的那件进店（练气档在青阳镇，凝丹档在玄天城）。
//   六、存档：数改过的那几件要是正穿在叶孤星身上，把差额补到他身上（每份存档只补一回）。队友的属性是现算的，不用补。
// 数是先定的，进了游戏试过再调——调的时候直接改这张表。
(function () {
  if (!window.WX5 || !window.GEAR5 || typeof ITEM_DB === 'undefined' || typeof S === 'undefined') return;
  const WX = WX5.WX, ORDER = WX5.ORDER, F = () => (S.flags = S.flags || {});
  const KEYS = ['atk', 'def', 'maxhp', 'maxmp', 'spd'], SLOTS = ['weapon', 'wrist', 'armor', 'shoe', 'acc'];
  const REALM = lv => { try { return realmOf(lv); } catch (e) { return lv + ' 级'; } };
  const LV = { 1: 6, 2: 10 };   // 需要等级。按老表（每境九级）记，和 r389 一样：r405 会把 10 换成新表上的 11
  const TIER_CN = { 1: '练气档', 2: '凝丹档' }, RANK_CN = ['常见', '少见', '稀有', '难得'], RANK_COL = ['#9a8a70', '#5fbf73', '#5f9cf0', '#f0b43a'];
  const SELL = { 1: [110, 150, 0, 220], 2: [260, 340, 460, 620] };   // 卖给店的价：按档、按等
  const PRICE = { 1: { weapon: 420, wrist: 320, armor: 460, shoe: 380, acc: 300 }, 2: { weapon: 1200, wrist: 900, armor: 1300, shoe: 980, acc: 800 } };   // 店里的买价：只有常见的那件进店
  const PRICE_X = { a_leather: 220, w_liuguang: 1600, w_xuanshuang: 1600, w_zidian: 1600, a_xiaguang: 2000, s_taxue: 2000, c_ningshen: 600, c_baihua: 900 };   // 原来店里就卖的几件：兽皮软甲是开头的便宜货，价钱不动；玄兵阁三口套装剑一个价；锦云坊、点绛铺的几件稀有货照旧贵

  // ---------- 一、格子表 ----------
  // 档 → 部位 → 五行 → 这一格的几件，从常见到难得。新装备写全：[名字牌, 名字, 属性, 说明]；原有的只写名字牌。
  // 阶梯：主属性 常见 ×0.92 → 套装件 ×1 → 稀有 ×1.07 → 难得 ×1.15（练气档的难得 ×1.12）。鞋的主属性是身法，一等差 1 点。
  // 五行的偏向：金带身法，木带气血，水带灵力，火的攻击再高一截，土带防御。部位之间：兵器攻击最高，护腕第二，饰品第三。
  const T = {
    1: {
      weapon: {
        jin: [['w_jinggang', '精钢剑', { atk: 18 }, '最普通的精钢长剑，剑身灰白无纹，木柄缠麻绳，铁护手。'],
          'w_baihong',
          ['w_duanjin', '断金切玉', { atk: 22, spd: 1 }, '窄身直剑，刃口一线雪亮，剑脊錾一道细槽，白铜护手，剑首一枚小环。']],
        mu: [['w_tiehua', '铁桦剑', { atk: 17, maxhp: 20 }, '整根铁桦木削成的木剑，深褐色，木纹粗直，柄上缠草绳。'],
          'w_qingteng',
          ['w_kurong', '半枯半荣', { atk: 20, maxhp: 40 }, '木剑。一半剑身是枯灰的老木，一半泛着新绿，护手处抽出一片嫩叶。']],
        shui: ['w_hantie',
          'w_hanxing',
          ['w_qiushui', '一泓秋水', { atk: 26, maxmp: 20 }, '细长的薄刃剑，剑身清亮得像一泓秋水，映着淡蓝，素银护手，蓝丝剑穗。']],
        huo: [['w_chitong', '赤铜剑', { atk: 20 }, '赤铜铸的短阔剑，剑身暗红带一点铜绿，皮绳缠柄。'],
          'w_chiyan',
          ['w_yujin', '余烬未冷', { atk: 24 }, '赤铜剑身上有一道暗红的流纹，像烧红还没冷透的铁水，剑格做成火焰形，红穗。']],
        tu: [['w_houbei', '厚背剑', { atk: 19, def: 1 }, '剑背很厚的阔刃铁剑，灰褐色，刃口有几处小缺，粗木柄。'],
          'w_xuanyan',
          ['w_qianjun', '力拔千钧', { atk: 23, def: 3 }, '宽厚的重剑，青灰石色的剑身上两枚黄铜铆钉，剑首是一块方石，看着就沉。']],
      },
      wrist: {
        jin: [['r_tongding', '铜钉护腕', { atk: 8 }, '灰皮护腕上钉着三排黄铜圆钉，没有别的装饰。'],
          'r_baihong',
          ['r_wujin', '乌金菱影', { atk: 10, spd: 1 }, '乌黑发亮的薄金属护腕，边缘一圈细细的白铜线，腕背錾一枚小小的菱纹。']],
        mu: [['r_mabu', '麻布缠腕', { atk: 7, maxhp: 15 }, '一圈圈粗麻布条缠成的护腕，末端打着结，露出线头。'],
          'r_qingteng',
          ['r_cangsong', '苍松翠鳞', { atk: 9, maxhp: 30 }, '松木薄片拼成的护臂，木纹像松鳞，青绳穿系，腕口别着一小枝松针。']],
        shui: [['r_hantie', '寒铁护腕', { atk: 8, maxmp: 5 }, '深灰蓝的铁护腕，表面凝着一点白霜，两道皮扣。'],
          'r_hanxing',
          ['r_tingchao', '听潮观海', { atk: 10, maxmp: 15 }, '深蓝护腕上压着一层层浪纹，腕口镶一小片贝母，泛着淡淡的珠光。']],
        huo: [['r_chitong', '赤铜护腕', { atk: 9 }, '一整片赤铜弯成的护腕，暗红带铜绿，两枚铆钉。'],
          'r_chiyan',
          ['r_fenfeng', '星火燎原', { atk: 11 }, '赤红的皮护腕，边缘像被火燎过，微微焦卷，腕背烙着一道旋风状的焦纹。']],
        tu: [['r_niupi', '牛皮护腕', { atk: 8, def: 1 }, '厚牛皮裁的护腕，土黄色，粗线缝边，一条皮带扣。'],
          'r_xuanyan',
          ['r_duanyue', '断岳开山', { atk: 10, def: 3 }, '厚皮上嵌着一整块山形的青石片，石片中间一道天然的裂纹，铜扣。']],
      },
      armor: {
        jin: ['a_iron',
          'a_baihong',
          ['a_liangyin', '匹练飞光', { def: 12, maxhp: 65, spd: 1 }, '打磨得雪亮的银白胸甲，肩口两片小甲叶，素面，只在领口錾一圈细纹。']],
        mu: ['a_yunjin',
          'a_qingteng',
          ['a_qingluo', '青萝拂衣', { def: 10, maxhp: 100 }, '青绿色的交领长衣，衣襟和袖口绣着细细的藤萝，腰间系草绿丝绦。']],
        shui: [['a_yulin', '鱼鳞甲', { def: 8, maxhp: 55, maxmp: 15 }, '灰蓝色的小铁片一层压一层叠成的鱼鳞甲，短款，皮带束腰。'],
          'a_hanxing',
          ['a_yanbo', '烟波江上', { def: 10, maxhp: 65, maxmp: 30 }, '靛蓝长衣，下摆由深到浅晕成水色，像江上起了一层烟，袖口压着白色浪纹。']],
        huo: [['a_zhuqi', '朱漆皮甲', { atk: 1, def: 9, maxhp: 55 }, '刷了朱红大漆的硬皮甲，漆面有几道磨痕，黑绳串联。'],
          'a_chiyan',
          ['a_huohuan', '浴火不焚', { atk: 3, def: 11, maxhp: 65 }, '灰白的火浣布袍，布面隐约透着暗红的火纹，像刚从火里取出来、还带着余温。']],
        tu: ['a_leather',
          'a_xuanyan',
          ['a_shanwen', '坚如磐石', { def: 15, maxhp: 90 }, '土金色的山文甲，甲片一个个扣成「山」字形，胸口一面小护心镜。']],
      },
      shoe: {
        jin: [['s_tiezhang', '铁掌靴', { def: 2, spd: 2 }, '黑皮短靴，靴底钉着一块铁掌，靴头有磨痕。'],
          's_baihong',
          ['s_jinghong', '翩若惊鸿', { def: 3, spd: 4 }, '白色轻靴，靴筒外侧绣一只展翅的银色飞鸿，靴口镶细银边。']],
        mu: ['s_buyun',
          's_qingteng',
          ['s_chuanlin', '竹杖芒鞋', { def: 2, maxhp: 30, spd: 4 }, '青布软履，鞋面编着竹篾，鞋帮上缀两片竹叶。']],
        shui: [['s_sheshui', '涉水靴', { def: 2, maxmp: 5, spd: 2 }, '涂过桐油的深蓝高筒皮靴，靴口用绳收紧。'],
          's_hanxing',
          ['s_talang', '踏浪弄潮', { def: 2, maxmp: 15, spd: 4 }, '蓝白两色的轻靴，靴筒一圈卷浪纹，靴尖微微翘起，像浪头。']],
        huo: [['s_chipi', '赤皮靴', { def: 2, spd: 2 }, '红褐色的皮短靴，粗线缝制，没有装饰。'],
          's_chiyan',
          ['s_tayan', '步步生焰', { atk: 2, def: 2, spd: 4 }, '赤红靴子，靴底一圈暗橙色的焰纹，靴跟处一丝很淡的热气。']],
        tu: [['s_cuge', '粗革靴', { def: 3, maxhp: 15, spd: 1 }, '土黄粗皮的厚靴，靴筒用皮绳绑着，靴底很厚。'],
          's_xuanyan',
          ['s_dengshan', '踏遍千山', { def: 5, maxhp: 30, spd: 3 }, '木底的登山屐，底下两道屐齿，麻绳系带，木面上刻着一座小山。']],
      },
      acc: {
        jin: ['c_wx_jin',
          ['c_jingniao', '惊鸟铃', { atk: 3, spd: 1 }, '一只小铜铃，铃口略张，系一截白绳。'],
          ['c_linglong', '三铃玲珑', { atk: 4, spd: 2 }, '银质小锁，镂空成缠枝纹，锁下垂着三枚小银铃。']],
        mu: ['c_wx_mu',
          ['c_taomu', '桃木符', { atk: 3, maxhp: 55 }, '桃木削的小木牌，上面刻一道简单的符纹，红绳。'],
          ['c_puti', '星月菩提', { atk: 4, maxhp: 70 }, '一串菩提子手串，子上有天然的星点，正中一颗稍大，带一圈金线。']],
        shui: ['c_wx_shui',
          ['c_bishui', '避水珠', { atk: 3, maxmp: 35 }, '一颗蓝绿色的小珠，裹在细银丝编的网兜里，系绳。'],
          ['c_chenlu', '晨露未晞', { atk: 4, maxmp: 45 }, '一滴水形的白水晶，里面封着一粒小气泡，泛一点蓝，银托，细链。']],
        huo: ['c_wx_huo',
          ['c_suishi', '燧石坠', { atk: 6 }, '一小块黑褐色的燧石，一角有打火留下的白痕，皮绳穿着。'],
          ['c_huopo', '一点丹心', { atk: 7 }, '一块赤红的琥珀，里面封着一点火星似的金斑，红绳。']],
        tu: ['c_wx_tu',
          ['c_shigandang', '石敢当', { atk: 3, def: 4 }, '一枚小小的青石牌，方方正正，四角圆钝，麻绳。'],
          ['c_bichen', '纤尘不染', { atk: 4, def: 5 }, '一颗土黄色、半透的圆珠，里面像悬着细细的浮尘，铜托。']],
      },
    },
    2: {
      weapon: {
        jin: [['w_longquan', '龙泉剑', { atk: 26 }, '规整的青钢长剑，剑身有细密的锻纹，铜护手。'],
          'w_liuguang',
          ['w_youlong', '游龙剑', { atk: 30, spd: 1 }, '银白长剑，剑身微微带一道弧，剑脊錾一条细细的游龙，龙睛一点金。'],
          ['w_hanguang', '孤光自照', { atk: 32, spd: 1 }, '白金色长剑，剑身薄而极净，通体像一片凝住的冷光，刃口一线流光，护手素白无纹。']],
        mu: [['w_songwen', '松纹剑', { atk: 24, maxhp: 30 }, '钢剑，剑身带着天然的松木纹理，青褐色的柄，铜剑首。'],
          'w_biluo',
          ['w_zheliu', '折柳剑', { atk: 28, maxhp: 45 }, '细长柔韧的软剑，淡青色剑身，护手是两片柳叶，柄尾垂一缕柳条穗。'],
          ['w_fengchun', '枯木逢春', { atk: 30, maxhp: 55 }, '青碧色长剑，护手是苍老的枯枝盘成的，枯枝上抽出一片带微光的新叶，剑脊一道年轮似的纹。']],
        shui: [['w_bingwen', '冰纹剑', { atk: 25, maxmp: 15 }, '淡蓝色钢剑，剑身布满冰裂纹，银护手。'],
          'w_xuanshuang',
          ['w_yingyue', '映月剑', { atk: 29, maxmp: 25 }, '深蓝剑身上一轮月影似的光斑，护手做成弯月形，嵌一粒蓝宝。'],
          ['w_shangshan', '上善若水', { atk: 31, maxmp: 30 }, '近乎透明的水色长剑，剑身里像有水在缓缓地流，素玉护手，没有一点张扬的装饰。']],
        huo: [['w_yantie', '炎铁剑', { atk: 29 }, '暗红的炎铁剑，剑身靠近护手的一段微微发红，黑铁护手。'],
          'w_zidian',
          'w_chixiao',
          ['w_zhuzhao', '烛照九幽', { atk: 38, spd: 1 }, '赤金色长剑，剑脊一道明亮的光线从护手亮到剑尖，护手是一轮小小的日轮。']],
        tu: [['w_yanwen', '岩纹剑', { atk: 26, def: 2 }, '灰褐色阔剑，剑身有岩层似的横纹，石质剑首。'],
          'w_zhenyue',
          ['w_budong', '不动剑', { atk: 30, def: 4 }, '剑身宽直厚重，暗金色，护手是一方印台似的方块，端端正正。'],
          ['w_qianzhang', '壁立千仞', { atk: 32, def: 5 }, '赤铜色的重剑，剑身上错落排着一层层山影似的纹，中间嵌一线黄玉，隐隐一层土黄的光。']],
      },
      wrist: {
        jin: [['r_wengang', '纹钢护腕', { atk: 11 }, '银灰钢片弯成的护腕，表面是反复折叠锻打留下的流水纹，两枚钢扣。'],
          'r_liuguang',
          ['r_qieyu', '切玉护腕', { atk: 13, spd: 1 }, '白钢护腕，边缘薄得像刀刃，腕背嵌一小条白玉。'],
          ['r_yinhan', '银汉迢迢', { atk: 14, spd: 1 }, '亮银长护臂，一道由细碎银点连成的星河斜斜流过，微微发亮。']],
        mu: [['r_tengjia', '藤甲护腕', { atk: 11, maxhp: 20 }, '油浸过的藤条密密编成的护腕，深褐发亮，青绳收口。'],
          'r_biluo',
          ['r_chanzhi', '缠枝护腕', { atk: 13, maxhp: 35 }, '青色软甲护腕，上面浮雕着连绵的缠枝花纹，枝头两朵小花。'],
          ['r_qingluan', '青鸾衔尾', { atk: 14, maxhp: 40 }, '青玉和青铜合成的臂环，环上一只青鸾首尾相衔，三根尾羽，带淡青的光。']],
        shui: [['r_bingwen', '冰纹护腕', { atk: 11, maxmp: 15 }, '淡蓝护腕，表面冰裂纹，银边。'],
          'r_xuanshuang',
          ['r_shuyu', '漱玉护腕', { atk: 13, maxmp: 25 }, '水蓝软缎护腕，缀着一排水滴形的小玉片，像溪水冲过。'],
          ['r_jinghai', '海不扬波', { atk: 14, maxmp: 30 }, '墨蓝近黑的护臂，表面像无风的深海，隐约有暗流的纹，腕口一圈寒气。']],
        huo: [['r_yantie', '炎铁护腕', { atk: 14 }, '暗红的炎铁护腕，边缘微微发红，黑皮内衬。'],
          'r_zidian',
          ['r_chilian', '赤练缠腕', { atk: 16, spd: 1 }, '赤红丝带一圈圈缠成的护腕，丝带末端飘起，带尖一点火星。'],
          ['r_danfeng', '丹凤朝阳', { atk: 17, spd: 1 }, '赤金臂环，一只丹凤绕环一周，凤尾展开成三道火羽，带暖光。']],
        tu: [['r_yanwen', '岩纹护腕', { atk: 12, def: 2 }, '灰褐护腕，岩层横纹，粗皮带。'],
          'r_zhenyue',
          ['r_panshi', '磐石护臂', { atk: 14, def: 4 }, '厚重的石色护臂，像一整块磨圆的磐石，两道铜箍。'],
          ['r_fushan', '负山戴岳', { atk: 15, def: 5 }, '暗金护臂，腕背托着一座小小的浮雕山峦，山脚一圈龟甲纹。']],
      },
      armor: {
        jin: ['a_xuanlin',
          'a_liuguang',
          ['a_lianhuan', '连环甲', { def: 18, maxhp: 120, spd: 1 }, '银白的连环锁甲，环环相扣，肩头两枚兽面吞口。'],
          ['a_mingguang', '寒光照铁', { def: 20, maxhp: 125, spd: 1 }, '白金甲片，胸前两面磨得极亮的圆护镜，镜面映出一团柔光。']],
        mu: ['a_tiancan',
          'a_biluo',
          ['a_cuiwei', '翠微衫', { def: 16, maxhp: 160, maxmp: 20 }, '青翠色长衫，衣上晕着远山似的淡影，袖口绣松针。'],
          ['a_songhe', '松间鹤影', { def: 17, maxhp: 175, maxmp: 30 }, '月白鹤氅，黑色宽边，背上绣一只立在松枝上的鹤，松针带淡青的光。']],
        shui: [['a_shuiyun', '水云衫', { def: 14, maxhp: 100, maxmp: 30 }, '浅蓝灰的宽袖长衫，衣角绣一小朵云，素净。'],
          'a_xuanshuang',
          ['a_tingxue', '听雪衣', { def: 16, maxhp: 120, maxmp: 45 }, '雪白镶浅蓝边的冬衣，领口一圈白绒，衣摆落着几点雪花纹。'],
          ['a_hanjiang', '独钓寒江', { def: 17, maxhp: 125, maxmp: 55 }, '深青色蓑衣式的长袍，蓑草细得像丝，上面凝着薄霜，下摆像江面起雾。']],
        huo: [['a_jiangsha', '绛纱衫', { atk: 2, def: 15, maxhp: 100 }, '绛红色薄纱长衫，内衬暗红，黑色束腰。'],
          'a_zidian',
          'a_xiaguang',
          ['a_zhaohui', '赤霞朝晖', { atk: 5, def: 18, maxhp: 125 }, '赤金长袍，下摆晕着朝阳初升的金红，肩头一轮小小的日纹，衣角带金光。']],
        tu: [['a_yanwen', '岩纹甲', { def: 19, maxhp: 130 }, '灰褐皮甲，上面缝着带岩层纹的硬片，宽腰带。'],
          'a_zhenyue',
          ['a_zhengchen', '征尘甲', { def: 22, maxhp: 150 }, '土黄色的战甲，甲片边缘磨旧了，披一条沾着尘色的短披风。'],
          ['a_houde', '厚德载物', { def: 24, maxhp: 160 }, '厚重的暗金重甲，胸口一块方形黄玉，甲面是大地龟裂似的纹，沉稳，不耀眼。']],
      },
      shoe: {
        jin: [['s_baodi', '薄底快靴', { def: 3, spd: 4 }, '黑色薄底快靴，靴筒利落，白色收口线。'],
          's_liuguang',
          ['s_lueying', '掠影靴', { def: 4, spd: 6 }, '银灰轻靴，靴侧一道流线形的银纹，靴跟后拖着一抹淡淡的残影。'],
          ['s_baiju', '白驹过隙', { def: 5, spd: 7 }, '雪白长靴，靴筒上白描一匹奔马，靴口镶银，带一线白光。']],
        mu: ['s_zhuifeng',
          's_biluo',
          ['s_taqing', '踏青履', { def: 3, maxhp: 35, spd: 5 }, '嫩绿色软履，鞋面绣着草叶和一朵小野花，草编鞋口。'],
          ['s_qingyun', '平步青云', { def: 4, maxhp: 40, spd: 6 }, '青白色云头履，鞋头翘成云朵形，鞋底托着一小团青色的云气。']],
        shui: [['s_bingwen', '冰纹靴', { def: 2, maxmp: 15, spd: 3 }, '淡蓝短靴，靴面冰裂纹，银扣。'],
          's_xuanshuang',
          's_taxue',
          ['s_lingbo', '凌波微步', { def: 4, maxmp: 30, spd: 6 }, '水蓝色的轻履，薄得像蝉翼，鞋底一圈涟漪似的光纹。']],
        huo: [['s_chiji', '赤麂靴', { atk: 1, def: 2, spd: 3 }, '红褐色的麂皮靴，绒面，黑绳绑口。'],
          's_zidian',
          ['s_fenghuo', '风火靴', { atk: 2, def: 3, spd: 5 }, '赤红靴子，两侧脚踝处各有一个小小的火轮纹，轮边带橙光。'],
          ['s_zhuiri', '流金逐日', { atk: 3, def: 4, spd: 6 }, '金红长靴，靴筒上一轮赤日，靴底拖着几缕日焰。']],
        tu: [['s_yanwen', '岩纹靴', { def: 5, maxhp: 20, spd: 2 }, '灰褐厚靴，靴面岩层纹，厚底。'],
          's_zhenyue',
          ['s_tashan', '踏山靴', { def: 7, maxhp: 35, spd: 4 }, '土褐色重靴，靴头包着石片，靴底刻成山形的齿。'],
          ['s_suodi', '缩地成寸', { def: 8, maxhp: 40, spd: 5 }, '土金色布履，鞋底绣一圈由大到小的同心地纹，像把路折了起来，带淡黄的光。']],
      },
      acc: {
        jin: [['c_gengjin', '庚金环', { atk: 4, spd: 1 }, '素面的白铜小环，系白绳。'],
          ['c_yinchan', '银蝉佩', { atk: 5, spd: 1 }, '银质的蝉形佩，薄翅上有细脉。'],
          ['c_jincuo', '金错坠', { atk: 5, spd: 2 }, '小刀形的铜坠，上面错金的回纹，金线细亮。'],
          ['c_mingdi', '鸣镝破空', { atk: 6, spd: 2 }, '一枚小小的白金色响箭头，中空，带两个哨孔，箭尖一点冷白的光，系白绳。']],
        mu: [['c_yimu', '乙木环', { atk: 4, maxhp: 50 }, '青木削的小环，木纹清晰，系绿绳。'],
          'c_ningshen',
          'c_baihua',
          ['c_budiao', '琥珀凝春', { atk: 6, maxhp: 110 }, '一朵干了却不褪色的小花，封在一滴琥珀色的树脂里，花心带一点青光。']],
        shui: [['c_guishui', '癸水环', { atk: 4, maxmp: 30 }, '墨蓝色的石环，表面润得像有水，系蓝绳。'],
          ['c_yuhua', '雨花石', { atk: 5, maxmp: 40 }, '一枚椭圆的花纹卵石，蓝白相间的水纹，系细绳。'],
          ['c_canghai', '沧海珠', { atk: 5, maxmp: 50 }, '一颗深蓝色的大珍珠，珠光里像有月影，银托。'],
          ['c_zhishui', '心如止水', { atk: 6, maxmp: 60 }, '拇指大的白玉小瓶，瓶里一滴水悬着不落，水面平得像镜子，瓶口一线蓝光。']],
        huo: [['c_binghuo', '丙火环', { atk: 6 }, '赤铜小环，系红绳。'],
          ['c_shanhu', '赤珊瑚坠', { atk: 7 }, '一小枝赤红的珊瑚，金托，红绳。'],
          ['c_huoqi', '火齐珠', { atk: 8 }, '一颗赤紫色的宝珠，珠心一点火光，铜托。'],
          ['c_xinghuo', '星火不灭', { atk: 9 }, '一只镂空的小铜匣，里面悬着一粒不灭的火星，匣缝里透出暖光。']],
        tu: [['c_wutu', '戊土环', { atk: 4, def: 3 }, '黄陶烧的小环，粗粝，系褐绳。'],
          ['c_huangyu', '黄玉印', { atk: 5, def: 4 }, '一方小小的黄玉印章，印钮是一只卧兽。'],
          ['c_shanhe', '山河符', { atk: 5, def: 5 }, '土黄色的陶符牌，上面压着山川纹，四角包铜。'],
          ['c_jiezi', '芥子须弥', { atk: 6, def: 6 }, '一只鼓鼓的小锦囊，囊口望进去像装着一座小小的山，囊上绣山纹，带淡黄的光。']],
      },
    },
  };
  // 五行佩（r400 上午加的五件朴素饰品）排在练气档饰品的头一等。照「饰品攻击排第三」补上攻击，原来的那一项相应减一点。
  const PEI = [['c_wx_jin', '锐金佩', 'jin', { atk: 3 }, '白铜打的小环佩，素面无纹，系一根灰白细绳。'], ['c_wx_mu', '青木佩', 'mu', { atk: 2, maxhp: 40 }, '青玉磨的叶形小佩，叶脉只有浅浅几道。'],
    ['c_wx_shui', '玄水佩', 'shui', { atk: 2, maxmp: 25 }, '墨蓝色的水滴形石坠，摸着总是凉的。'], ['c_wx_huo', '离火佩', 'huo', { atk: 5 }, '三粒赤玛瑙串成的短坠，贴身戴着微微发暖。'], ['c_wx_tu', '厚土佩', 'tu', { atk: 2, def: 3 }, '土黄色的方形小石牌，四角磨得圆润。']];
  for (const [id, name, wx, st, desc] of PEI) { if (ITEM_DB[id]) continue; ITEM_DB[id] = Object.assign({ name, slot: 'acc', price: 0, sell: SELL[1][0], lvReq: LV[1], wx, r400: 1, desc: desc + '（需要境界：' + REALM(LV[1]) + '）' }, st); WX5.GEAR[id] = wx; }
  // 原有的装备里，数对不上格子的这 14 件改成这样（一件装备的五项里没写到的那几项归零）：
  const CHG = {
    a_iron: { def: 10, maxhp: 55 },   // 玄铁软甲：原来 防御 14、气血 80
    a_yunjin: { def: 8, maxhp: 70, maxmp: 10 },   // 云锦长衫：原来 防御 11、气血 70、灵力 20
    w_liuguang: { atk: 28, spd: 1 },   // 流光剑：原来 攻击 22、身法 1
    w_zidian: { atk: 33, spd: 1 },   // 紫电剑：原来 攻击 33、身法 2
    w_chixiao: { atk: 35, spd: 1 },   // 赤霄剑：原来 攻击 26、身法 1
    r_liuguang: { atk: 12, spd: 1 },   // 流光护腕：原来 攻击 10、身法 1
    a_xuanlin: { def: 16, maxhp: 100 },   // 玄鳞甲：原来 防御 18、气血 120
    a_tiancan: { def: 15, maxhp: 110, maxmp: 40 },   // 天蚕法衣：原来 防御 16、气血 110、灵力 40
    a_xiaguang: { def: 17, maxhp: 120, maxmp: 20 },   // 霞光羽衣：原来 防御 20、气血 150、灵力 50、身法 1
    s_zhuifeng: { def: 3, spd: 3 },   // 追风靴：原来 防御 3、身法 4
    s_taxue: { def: 4, maxhp: 40, spd: 5 },   // 踏雪无痕靴：原来 防御 5、气血 40、身法 6
    s_zidian: { atk: 2, def: 3, spd: 4 },   // 紫电靴：原来 攻击 2、防御 3、身法 5
    c_ningshen: { atk: 5, maxmp: 40 },   // 凝神香囊：原来 防御 2、灵力 40
    c_baihua: { atk: 5, maxhp: 80, maxmp: 20 },   // 百花香囊：原来 气血 80、灵力 20
  };
  // 换数之前记下原来的数（存档里正穿着的要补差额）。五行佩是上面刚登记的，原来的数写在这儿。
  const OLD = { c_wx_jin: { atk: 4 }, c_wx_mu: { maxhp: 50 }, c_wx_shui: { maxmp: 30 }, c_wx_huo: { atk: 2, spd: 1 }, c_wx_tu: { def: 4 } }, NOW = {};
  for (const [id, , , st] of PEI) NOW[id] = st;
  // 不从炉子里出的：寒星剑是后山那位前辈遗落的一把，天底下只此一口。它那一份机会并给同一格常见的那件。
  const NO_FORGE = { w_hanxing: 1 };

  try { window.GX_WRAP_LATE = 1; if (window.REFINE_WRAP) REFINE_WRAP(); } catch (e) {}   // 先让已经在表里的装备都套上强化的读数：下面改数走它的写口，新添的那一项它会补套（equip_plus.js）
  const raw = id => { const it = ITEM_DB[id], o = {}; for (const k of KEYS) if (it[k]) o[k] = it[k]; return o; };   // 这时候谁也没强化过、没镶过珠，读到的就是底数
  function setRaw(id, st) { const it = ITEM_DB[id]; if (!it) return; for (const k of KEYS) { const v = st[k] || 0, d = Object.getOwnPropertyDescriptor(it, k); if (d && (d.get || d.set)) it[k] = v; else if (v) it[k] = v; else delete it[k]; }
    try { if (window.REFINE_WRAP) REFINE_WRAP(); } catch (e) {} }
  for (const id of Object.keys(CHG)) { if (!ITEM_DB[id]) { delete CHG[id]; continue; } OLD[id] = raw(id); NOW[id] = CHG[id]; setRaw(id, CHG[id]); }

  const GRID = {}; for (const sl of SLOTS) GRID[sl] = { 1: {}, 2: {} };
  const SUFFIX = /（需要境界：[^）]*）|（需要 \d+ 级）/;
  for (const t of [1, 2]) for (const sl of SLOTS) for (const el of ORDER) { const cell = (T[t][sl] || {})[el] || [], rk = cell.length === 3 ? [0, 1, 3] : [0, 1, 2, 3], ids = [];
    cell.forEach((c, i) => { let id = c;
      if (Array.isArray(c)) { const [nid, name, st, desc] = c; id = nid;
        if (!ITEM_DB[id]) ITEM_DB[id] = Object.assign({ name, slot: sl, price: 0, sell: SELL[t][rk[i]], lvReq: LV[t], wx: el, r406: 1, desc: desc + '（需要境界：' + REALM(LV[t]) + '）' }, st);
        WX5.GEAR[id] = el; }
      const it = ITEM_DB[id]; if (!it) return; it.rk = rk[i]; it.dang = t; ids.push(id);
      // 等级理齐：练气档里本来就低于 6 级的（兽皮软甲 5 级）、本来没有等级的（两只香囊，早先的宝箱里就给）不动
      if (it.lvReq && it.lvReq !== LV[t] && !(it.lvReq < LV[t] && t === 1)) { it.lvReq = LV[t]; if (SUFFIX.test(it.desc || '')) it.desc = it.desc.replace(SUFFIX, '（需要境界：' + REALM(LV[t]) + '）'); }
      // 价钱：常见的那件进店；别的不进店（原来店里就卖的那几件另记）
      if (PRICE_X[id] != null) it.price = PRICE_X[id]; else if (rk[i] === 0) it.price = PRICE[t][sl]; else if (it.r406) it.price = 0;
      if (!it.sell) it.sell = SELL[t][rk[i]]; });
    GRID[sl][t][el] = ids; }

  // ---------- 这一件是第几等、哪一档 ----------
  const baseOf = id => { const it = ITEM_DB[id]; return it && it.base && ITEM_DB[it.base] ? it.base : id; };   // 炉子里打出来的独一份（名字牌带 ~ 的）看它的原型
  const rankOf = id => { const it = ITEM_DB[baseOf(id)]; return it && it.rk != null ? it.rk : null; };
  const tierOf = id => { const it = ITEM_DB[baseOf(id)]; return (it && it.dang) || 0; };
  const inSet = id => { try { return !!GEAR5.setOfItem(baseOf(id)); } catch (e) { return false; } };
  const rankName = id => { const r = rankOf(id); return r == null ? '' : r === 1 && inSet(id) ? '套装件' : RANK_CN[r]; };
  const label = id => { const r = rankOf(id); return r == null ? '' : TIER_CN[tierOf(id)] + ' · ' + rankName(id); };   // 「凝丹档 · 稀有」
  const col = id => { const r = rankOf(id); return r == null ? null : RANK_COL[r]; };

  // ---------- 三、十种新料 ----------
  // [名字牌, 名字, 五行, 店价（0 = 店里不卖）, 卖价, 说明]。哪一类、几品、多半带哪一条副属性，记在 r400_craft.js 的材料表里。
  const MATS = [
    ['m_duanren', '断刃', 'jin', 30, 10, '半截断掉的铁剑刃，断口参差，刃面生了锈。山贼身上常别着这样的破烂，回炉还能用。'],
    ['m_yaomu', '妖木枝', 'mu', 30, 10, '一截扭曲的黑褐树枝，断口还渗着一点青绿的汁。从树妖身上折下来的，离了本体也不肯干。'],
    ['m_yugu', '银鱼骨', 'shui', 30, 10, '一副细长的银白鱼脊骨，带着几根肋刺，硬得能划开皮甲。潭里钓鱼时偶尔缠在线上。'],
    ['m_shougu', '兽骨', 'tu', 30, 10, '一根粗大的兽腿骨，土黄发旧，一头有裂。野猪、山魈这类力气大的妖兽身上才有这么粗的。'],
    ['m_jiapian', '铁甲片', 'jin', 30, 10, '两三片叠在一起的旧铁甲片，带着铆孔和锈迹。从山贼的破甲上拆下来的。'],
    ['m_tengpi', '老藤皮', 'mu', 30, 10, '一卷剥下来的老藤皮，褐绿色，纤维粗得像麻绳。树妖身上缠的就是这个。'],
    ['m_shetui', '青蛇蜕', 'shui', 30, 10, '一段半透明的青色蛇蜕，鳞纹清清楚楚，盘成一小圈。溪边的草丛里偶尔捡得到。'],
    ['m_langpi', '赤狼皮', 'huo', 30, 10, '一小张赤褐色的狼皮，毛尖发红，摸着还带一点余温。后山的妖狼身上剥的。'],
    ['m_yingya', '幽影狼牙', 'shui', 0, 32, '一枚墨蓝色的长狼牙，牙尖总带着一缕散不掉的幽蓝影子。幽影狼的。'],
    ['m_zhuao', '石蛛螯', 'tu', 0, 40, '一只灰褐色的蛛螯，像石头雕出来的，螯尖却锋利得很。洞穴石蛛的。'],
  ];
  for (const [id, name, wx, price, sell, desc] of MATS) if (!ITEM_DB[id]) ITEM_DB[id] = { name, price, sell, mat: true, wx, r406: 1, desc };
  // 妖物掉（键 = 战斗形象的名字牌）。妖王、头目那几只各有自己的一份掉落表，照着它的原型补。
  const DROP = { e_grunt: [['m_duanren', .35], ['m_jiapian', .3]], e_archer: [['m_duanren', .25]], m_tree: [['m_yaomu', .45], ['m_tengpi', .35]], e_boar: [['m_shougu', .4]], m_monkey: [['m_shougu', .35]], m_wolf: [['m_langpi', .35]],
    e_ywolf: [['m_yingya', .4]], e_wolfking: [['m_yingya', .5]], e_xspider: [['m_zhuao', .4]] };
  const LIKE = { yw_boar: 'e_boar', yw_wolf: 'e_wolfking', yw_xingwolf: 'm_wolf', yw_songxiao: 'm_tree' };
  try { if (typeof DROPS !== 'undefined') { const put = (k, list) => { const a = DROPS[k] = DROPS[k] || []; for (const d of list) if (ITEM_DB[d[0]] && !a.some(x => x[0] === d[0])) a.push(d.slice()); };
      for (const k of Object.keys(DROP)) put(k, DROP[k]); for (const k of Object.keys(LIKE)) if (DROPS[k] && DROP[LIKE[k]]) put(k, DROP[LIKE[k]]);
      // 图鉴上那一句「掉落：……」照着补全
      if (window.BESTIARY && Array.isArray(BESTIARY.CAT)) for (const c of BESTIARY.CAT) { const d = DROPS[c[2]]; if (!d || !d.length || !DROP[c[2]] || typeof c[4] !== 'string') continue; c[4] = c[4].replace(/　掉落：[^。]*。$/, '') + '　掉落：' + d.map(([id]) => ITEM_DB[id].name).join('、') + '。'; } } } catch (e) { console.warn('R406 drops', e); }
  // 宝箱：几只本来就有的箱子里各添一两件（开过的箱子不会再给）。按箱子里原来装的东西认箱子，认不出就不添。
  const CHEST = [['tj_houshan', [['gold', 50]], ['m_shetui', 2]], ['seal_field', [['gold', 60]], ['m_yugu', 2]], ['qingzhu_stairs', [['p_big', 1]], ['m_duanren', 2]], ['qingzhu_court', [['gold', 70]], ['m_jiapian', 2]],
    ['lin_forest', [['p_mp', 2]], ['m_yingya', 1]], ['m_xx_b1', [['p_mp', 3], ['juan3', 1]], ['m_zhuao', 2]]];
  try { for (const [map, sig, add] of CHEST) { const cs = (TMAPS[map] || {}).chests || [], k = JSON.stringify(sig), c = cs.find(q => JSON.stringify(q.items) === k); if (c && ITEM_DB[add[0]]) c.items = c.items.concat([add]); } } catch (e) { console.warn('R406 chests', e); }
  // 钓鱼：每钓上一条，三成机会线上还缠着一副银鱼骨
  if (typeof addItem === 'function') addItem = (orig => function (id, n) { const r = orig.apply(this, arguments);
    try { if (/^fish_/.test(String(id)) && ITEM_DB.m_yugu && Math.random() < .3) { addItem('m_yugu', 1); if (typeof toast === 'function') toast('线上还缠着一副银鱼骨', 2200); } } catch (e) {} return r; })(addItem);

  // ---------- 三之二、强化材料：淬灵砂 / 晶 / 玉 / 髓 ----------
  // 设计稿第五节（作者 18:02 让设计强化材料；18:48 定强化 +5 封顶）：强化不再和合成抢料——练气档的装备用淬灵砂，凝丹档的用淬灵晶
  //   （引魂档的玉、归元档的髓先登记着，等那两档的装备做出来再放出处）。强化到第几级用几份（规矩在 r394_forge.js）。
  //   出处：砂——练气的妖物两三成掉一份，青阳镇铁匠铺、玄兵阁有卖；晶——凝丹的妖物一成上下，头目、妖王身上成把地有。
  const QUENCH = [['q_sha', '淬灵砂', 1, 50, 15, '青灰色的细砂，里面闪着点点银光。铁匠拿它淬练气档的装备：强化到第几级，就用几份。'],
    ['q_jing', '淬灵晶', 2, 0, 60, '一簇淡青色的小晶体，棱角分明，微微透亮。淬凝丹档的装备用：强化到第几级，就用几份。头目、妖王身上多。'],
    ['q_yu', '淬灵玉', 3, 0, 150, '一块温润的青白玉料，玉里有一缕流动的光。淬引魂档的装备用。'],
    ['q_sui', '淬灵髓', 4, 0, 300, '小小一只白瓷瓶，瓶里浓稠的青金色灵髓透出光来。淬归元档的装备用。']];
  for (const [id, name, tier, price, sell, desc] of QUENCH) if (!ITEM_DB[id]) ITEM_DB[id] = { name, price, sell, quench: tier, cat: '材料', r406: 1, desc };
  const QDROP = { q_sha: { m_wolf: .2, m_monkey: .2, m_tree: .2, e_grunt: .22, e_archer: .22, e_boar: .3 },
    q_jing: { e_wolf2: .1, e_rhino: .12, e_leopard: .14, e_ywolf: .12, e_spider: .12, e_treant: .12, e_xiexiu: .12, e_corpse: .12, e_xbat: .1, e_xwraith: .12, e_xspider: .12, e_xguard1: .12, e_xguard2: .12, e_xguard3: .12, e_spiderq: 1, e_wolfking: 1 } };
  try { if (typeof DROPS !== 'undefined') for (const q of Object.keys(QDROP)) for (const k of Object.keys(QDROP[q])) { const a = DROPS[k] = DROPS[k] || []; if (!a.some(x => x[0] === q)) a.push([q, QDROP[q][k]]); } } catch (e) { console.warn('R406 qdrop', e); }
  // 头目、妖王：打倒时另给几份（头一只狼王在练气，给砂；别的给晶）
  try { for (const y of (window.R370_YW || [])) { const q = y.id === 'xingwolf' ? 'q_sha' : 'q_jing', n = y.id === 'xingwolf' ? 4 : y.mini ? 2 : 3; y.extra = y.extra || []; if (!y.extra.includes(q)) for (let i = 0; i < n; i++) y.extra.push(q); } } catch (e) { console.warn('R406 yw', e); }
  // 老存档：强化的规矩换了，身上一份淬灵都没有——星旋给几份见面礼（每份存档一回；刚开局的新档不给）
  let gifting = false;
  setInterval(() => { try { const f = F(), h = S.hero; if (gifting || f.q406_gift || !S.started || !h || typeof drawMap === 'undefined' || S.scene !== drawMap || !S.hud || world.locked || dialog || choice || sysPanel || (typeof battle !== 'undefined' && battle)) return;
      const old = (h.lv || 1) >= 8 || !!f.forged || Object.values(h.refine || {}).some(v => v > 0); f.q406_gift = 1; if (!old || !window.SAY_LATER) return;
      const got = [['q_sha', 6]]; if ((h.lv || 1) >= (window.GX_LV10 ? 11 : 10)) got.push(['q_jing', 4]); for (const [id, n] of got) addItem(id, n); gifting = true;
      SAY_LATER(async () => { try { await say('星旋', '小子，如今铁匠淬火要用淬灵砂、淬灵晶，狼牙兽皮留着打装备。本神仙替你攒了几份，拿去。');
          if (window.itemGet) await itemGet(got.map(([id, n]) => ({ icon: 'item:' + id, name: ITEM_DB[id].name, count: '×' + n, desc: ITEM_DB[id].desc })), '星旋相赠'); } finally { gifting = false; } }); } catch (e) {} }, 2500);

  // ---------- 四、图标 ----------
  // 新装备、新料用 Codex 的图；圈的颜色看第几等。图还没载到的那一小会儿，先画一个带字的圆顶着。
  const IM = {}, get = id => { let o = IM[id]; if (!o) { o = IM[id] = { ok: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r406i/' + id + '.webp?v=1'; try { if (window.IMG_GUARD && IMG_GUARD.bump) IMG_GUARD.bump(o.im); } catch (e) {} } return o.ok ? o.im : null; };
  const RING = { jin: '#d8dde4', mu: '#6fc98a', shui: '#6fb6ee', huo: '#f08a4a', tu: '#d0a860' }, CH = { weapon: '剑', wrist: '腕', armor: '衣', shoe: '靴', acc: '佩' };
  if (typeof itemIcon === 'function') itemIcon = (orig => function (id, x, y, r) { const it = ITEM_DB[id]; if (!it || !it.r406) return orig.apply(this, arguments);
    const im = get(id), c = it.slot ? RANK_COL[it.rk || 0] : it.quench ? RANK_COL[Math.min(3, it.quench - 1)] : (RING[it.wx] || '#9a8a70'), top = it.slot && it.rk === 3;
    ctx.save(); const g = ctx.createRadialGradient(x, y - r * .2, r * .1, x, y, r); g.addColorStop(0, 'rgba(70,52,34,.9)'); g.addColorStop(1, 'rgba(18,12,8,.92)'); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = c; ctx.stroke(); if (top) { ctx.globalAlpha = .35; ctx.lineWidth = r * .22; ctx.beginPath(); ctx.arc(x, y, r + r * .08, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }   // 难得的那件：金圈外面再罩一层光
    if (im) { const s2 = r * 2.12; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, x - s2 / 2, y - s2 / 2, s2, s2); }
    else { ctx.font = `${Math.round(r * 1.05)}px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#e9d9a8'; ctx.fillText(CH[it.slot] || '料', x, y + r * .06); }
    ctx.restore();
    try { const gg = it.slot && WX5.GEAR[id]; if (gg && r >= 13) WX5.emblem(gg, x + r * .72, y + r * .72, Math.max(7, r * .36), 1); } catch (e) {} })(itemIcon);
  // 行囊、身上的东西先把图要来，免得头一回打开界面时是带字的圆
  const warm = () => { try { const h = S.hero; if (!h) return; const ids = Object.keys(h.bag || {}).concat(Object.values(h.equip || {})); for (const e of Object.values(S.allyEq || {})) if (e) ids.push(...Object.values(e)); for (const id of ids) { const b = id && baseOf(id); if (b && ITEM_DB[b] && ITEM_DB[b].r406) get(b); } } catch (e) {} };
  setTimeout(warm, 9000); setInterval(warm, 20000);

  // ---------- 五、店里添货 ----------
  // 作者：店里卖常见的。练气档的常见货放在青阳镇三家铺子（铁匠铺卖兵甲护腕和打铁的料，杂货铺卖鞋和零碎，聚宝斋卖佩饰），凝丹档的放在玄天城三家。
  const stock = (arr, ids) => { if (!Array.isArray(arr)) return; for (const id of ids) if (ITEM_DB[id] && !arr.includes(id)) arr.push(id); };
  const QY = { '王铁匠': ['w_jinggang', 'w_tiehua', 'w_chitong', 'w_houbei', 'r_tongding', 'r_mabu', 'r_hantie', 'r_chitong', 'r_niupi', 'a_yulin', 'a_zhuqi', 's_tiezhang', 'm_duanren', 'm_jiapian', 'q_sha'],
    '杂货铺老板': ['s_buyun', 's_sheshui', 's_chipi', 's_cuge', 'm_yugu', 'm_shetui'], '聚宝斋掌柜': ['c_wx_jin', 'c_wx_mu', 'c_wx_shui', 'c_wx_huo', 'c_wx_tu'] };
  try { for (const m of Object.keys(TMAPS)) for (const n of (TMAPS[m].npcs || [])) if (QY[n.name] && Array.isArray(n.shop)) stock(n.shop, QY[n.name]); } catch (e) { console.warn('R406 shop', e); }
  try { const ST = window.R370_STOCK; if (ST) {
      stock(ST.xuanbing, ['w_longquan', 'w_songwen', 'w_bingwen', 'w_yantie', 'w_yanwen', 'r_wengang', 'r_tengjia', 'r_bingwen', 'r_yantie', 'r_yanwen', 'a_yanwen', 'q_sha']);
      stock(ST.chengyi, ['a_shuiyun', 'a_jiangsha', 's_baodi', 's_bingwen', 's_chiji', 's_yanwen']);
      stock(ST.yanzhi, ['c_gengjin', 'c_yimu', 'c_guishui', 'c_binghuo', 'c_wutu']);
      // 货架上按部位、再按价钱从低到高排（香、杂物排在最后）
      const ord = id => { const it = ITEM_DB[id] || {}, i = SLOTS.indexOf(it.slot); return (i < 0 ? 9 : i) * 100000 + (it.price || 0); };
      for (const k of ['xuanbing', 'chengyi', 'yanzhi']) if (Array.isArray(ST[k])) ST[k].sort((a, b) => ord(a) - ord(b)); } } catch (e) { console.warn('R406 stock', e); }

  // ---------- 六、存档：数改过的装备正穿在叶孤星身上，把差额补上 ----------
  // 叶孤星的属性是穿一件加一件、脱一件减一件这样记的；装备的数一改，身上记的还是老数，脱下来时会按新数减——所以要补一回。
  // 做法：把那件装备的底数拨回老数读一遍、再拨回新数读一遍（强化、成色都算在读数里），两遍的差就是该补的。每份存档只补一回（flags.gp406）。
  function effOf(id) { const it = ITEM_DB[id], o = {}; for (const k of KEYS) o[k] = it[k] || 0; return o; }
  function fixSave() { try { const h = S.hero, f = F(); if (!h || !h.equip || f.gp406) return; if (!window.CRAFT) return;   // 炉子那个文件还没到：等它（独一份的装备要靠它登记回来）
      for (const sl of SLOTS) { const id = h.equip[sl]; if (id && !ITEM_DB[id]) return; }   // 身上有还没登记回来的：下一拍再来
      f.gp406 = 1;
      for (const sl of SLOTS) { const id = h.equip[sl]; if (!id) continue; const b = baseOf(id), was = OLD[b]; if (!was || !NOW[b]) continue;
        const inst = id !== b, now = effOf(id); setRaw(b, was); if (inst) CRAFT.reg(id, true); const old = effOf(id); setRaw(b, NOW[b]); if (inst) CRAFT.reg(id, true);
        for (const k of KEYS) { const d = now[k] - old[k]; if (d) h[k] += d; } }
      h.hp = Math.max(1, Math.min(h.hp, h.maxhp)); h.mp = Math.max(0, Math.min(h.mp, h.maxmp)); } catch (e) { console.warn('R406 save', e); } }
  setInterval(fixSave, 700);

  window.GEAR6 = { GRID, NO_FORGE, TIER_CN, RANK_CN, RANK_COL, LV, CHG, OLD, NOW, MATS: MATS.map(m => m[0]), QUENCH: { 1: 'q_sha', 2: 'q_jing', 3: 'q_yu', 4: 'q_sui' }, baseOf, rankOf, tierOf, rankName, label, col, fixSave, icon: get };
})();
