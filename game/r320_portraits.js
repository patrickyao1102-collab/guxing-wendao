// ================= R320 · 支线人物对话立绘（Codex R312 第一批 12 人 + R311 丹霞堂掌柜 / 百草轩掌柜师兄弟）（只进测试版）=================
// 作者 11-16：「加强各支线任务的人物素材」「丹霞堂老板设计个帅哥对话立绘，然后青阳镇的是他师弟」。
// 每人两张：默认 + 「变脸」（剧情翻转时：被戳穿、发抖、红了眼、冷笑……）。台词开头括号里的神态写到这些字眼时，自动换成变脸那张。
(function () {
  if (typeof say !== 'function' || typeof SPEAKERS === 'undefined') return;
  const P = { '万宝楼掌柜': 'wbboss', '卖花姑娘·小荷': 'xiaohe', '卖花姑娘·小莲': 'xiaolian', '司灯老人': 'sideng', '外地刀客': 'daoke', '守林老人': 'shoulin',
    '悦来厨子': 'chuzi', '醉仙楼厨子': 'chuzi', '林府管事': 'guanshi', '王婆婆': 'wangpo', '王铁匠': 'tiejiang', '货郎': 'huolang', '货郎·钱二': 'huolang', '采药老人': 'caiyao',
    '丹霞堂掌柜': 'dxboss', '百草轩掌柜': 'bcboss' };
  const ALT = new Set(['wbboss', 'xiaohe', 'xiaolian', 'sideng', 'daoke', 'shoulin', 'chuzi', 'guanshi', 'wangpo', 'tiejiang', 'huolang', 'caiyao']);
  const load = (key, src) => { const im = new Image(); im.onload = () => { try { IMG[key] = im; } catch (e) {} }; im.src = src; };
  for (const k of new Set(Object.values(P))) { load('p_r320_' + k, 'r320/p_' + k + '.webp'); if (ALT.has(k)) load('p_r320_' + k + '_b', 'r320/p_' + k + '_b.webp'); }
  for (const [name, k] of Object.entries(P)) { try { SPEAKERS[name] = Object.assign({ color: '#ffe9b0' }, SPEAKERS[name] || {}, { p: 'p_r320_' + k }); } catch (e) {} }
  // 变脸：台词里写到这些神态
  const FACE = /颤|发抖|在抖|白了|煞白|僵|冒汗|擦汗|汗都|哭|红了|泪|铁青|冷笑|狞|咬牙|愣住|瞪大|变了|叉腰|撅嘴|眯眼|惊|怒|贪|骇|对不住/;
  say = (orig => function (who, text) {
    const k = P[who]; if (!k || !ALT.has(k)) return orig.apply(this, arguments);
    const sp = SPEAKERS[who], want = FACE.test(String(text).slice(0, 24)) ? 'p_r320_' + k + '_b' : 'p_r320_' + k;
    if (typeof IMG !== 'undefined' && IMG[want]) sp.p = want; else sp.p = 'p_r320_' + k; return orig.apply(this, arguments); })(say);

  // 师兄弟：百草轩掌柜（青阳镇）说起玄天城丹霞堂的师兄；丹霞堂那边由伙计替掌柜开口（掌柜的小人做好后，站在丹炉旁）
  const addLines = (map, name, lines) => { const n = ((TMAPS[map] || {}).npcs || []).find(n => n.name === name && !n.hidden); if (!n || n._r320) return; n._r320 = 1;
    if (Array.isArray(n.talk)) { n.talk = n.talk.concat(lines); n.random = true; }
    else if (typeof n.talk === 'function') { const o = n.talk; n.talk = async function (a) { if (Math.random() < .35) return say(name, lines[Math.floor(Math.random() * lines.length)]); return o.apply(this, arguments); }; } };
  addLines('qy_herb', '百草轩掌柜', ['我师兄在玄天城开丹霞堂——全城最好的丹药铺子。我？我就会配些金疮药、止血散。师父说，我手慢，可心细。',
    '少侠去玄天城，替我捎句话给丹霞堂的掌柜：师弟这边一切都好，炉子没炸过。……一次都没有。', '师兄小时候炼坏一炉丹，把师父的眉毛烧掉了一半。这事他不让我往外说。']);
  addLines('xt_danxia', '丹霞堂伙计', ['我们掌柜年纪轻轻，炉火的功夫是全城头一份。听说他有个师弟，在青阳镇开药铺，逢年过节总要托人捎两包镇上的桂花糕来。',
    '掌柜的在里头看炉子，丹火不能离人。客官要的方子，我这就去问他。']);
  window.R320_P = P;
})();
