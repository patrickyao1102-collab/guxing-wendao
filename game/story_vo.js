// ================= 作者 11-07：剧情对话配音（第一章开场·后山）=================
// 小云雀音频生成：叶孤星绑定他的技能喊招音色（hero_lengli_1103 参考），星旋用作者抽卡选定的 01 号音色；同一场戏连说一条再按语音识别切开。
// 对话框弹出时按「说话人 + 台词（只比汉字）」找配音播放；下一句弹出时停掉上一句。测试面板「声音测试」里能逐句试听，也可关掉剧情配音。
(function () {
  if (typeof say !== 'function') return;
  const VO = {"叶孤星|十八年了宗门上下背地里都叫我天煞孤星练气六重卡了整整两年连外门弟子都比我强": "vo1/H1_1.mp4", "叶孤星|出生那夜流星坠地一块黑玉落在我襁褓旁爹说那是祥瑞抱着我笑了一整夜": "vo1/H1_2.mp4", "叶孤星|可十八年过去我连练气七重都迈不过去他已经很久没正眼看过我了": "vo1/H1_3.mp4", "叶孤星|天降祥瑞天煞孤星呵": "vo1/H1_4.mp4", "叶孤星|咦那是什么光": "vo1/H2_1.mp4", "叶孤星|又是流星老天爷嫌嘲讽得还不够在我生日这天又送一颗": "vo1/H2_2.mp4", "叶孤星|一块玉佩跟我这块一模一样连碎裂的痕迹都对得上": "vo1/H2_3.mp4", "叶孤星|你你是谁": "vo1/H3_1.mp4", "叶孤星|所以这十八年你就躲在玉佩里看我笑话": "vo1/H3_2.mp4", "叶孤星|普通功法没用那我这十八年练的都是什么": "vo1/H3_3.mp4", "叶孤星|你这家伙说话能不能好听点": "vo1/H3_4.mp4", "叶孤星|九曜剑典藏经阁里是有记载可那不是失传千年只剩残篇了吗": "vo1/H4_1.mp4", "叶孤星|还要兑换一百点我才这么几点你耍我呢": "vo1/H4_2.mp4", "叶孤星|残本锁在藏经阁禁区连长老都不能随便取你是让我去偷被发现了我爹会把我逐出宗门": "vo1/H4_3.mp4", "叶孤星|好今晚我就去藏经阁走一趟": "vo1/H4_4.mp4", "星旋|我叫星旋你手里这块玉佩的器灵十八年前玉佩碎成两半一半陪你出生另一半我留着等今天才送给你": "vo1/S1_1.mp4", "星旋|话别说得这么难听嘛他们说的倒也没错你的确是万年一遇的天煞孤星": "vo1/S1_2.mp4", "星旋|不过这可是万中无一的绝世好命天煞孤星命格普通功法与你根本不契合练一万年也不会寸进": "vo1/S2_1.mp4", "星旋|白练": "vo1/S2_2.mp4", "星旋|世间只有一部功法为你这命格而生九曜剑典超越神阶的剑修功法修之可连北斗九曜每破一个大境便融一颗曜星之力入剑": "vo1/S2_3.mp4", "星旋|别人那里没有不代表我这里没有完整的九曜剑典整个九州只在我这儿": "vo1/S3_1.mp4", "星旋|先问你一句你修炼到底是为了什么": "vo1/S3_2.mp4", "星旋|好够狠够直接本器灵喜欢": "vo1/S3_3.mp4", "星旋|啧还挺孝顺行吧这份心性能扛事": "vo1/S3_4.mp4", "星旋|哦有点意思你小子心比天大": "vo1/S3_5.mp4", "星旋|看着玉佩把意念集中进去你现在的底细和能换的东西都在里面": "vo1/S4_1.mp4", "星旋|咳玉佩的规矩宝物都得兑换我也没想到你这么菜": "vo1/S4_2.mp4", "星旋|不过有办法你们藏经阁不是有九曜剑典的残本吗拿来残本抵正版我做主给你打一折": "vo1/S4_3.mp4", "星旋|你不说我不说谁知道再说你名声早就坏透了也不差这一件不拿残本你就甘心当一辈子废柴": "vo1/S4_4.mp4", "星旋|对了流星把星力撒得满山都是崖边那几颗发亮的灵晶捡上右边石台上那圈星钉也亮了有意思": "vo1/S5_1.mp4", "星旋|这几只是打发了可流星的星力还没散山里的小妖还会被引过来": "vo1/S5_2.mp4", "星旋|你拿根桃木剑跟妖兽拼命看得本器灵心惊肉跳刚才打着打着我闻到溪边岩隙里有一股剑气像是哪位前辈弟子藏了把剑在那儿": "vo1/S6_1.mp4", "星旋|先去把剑取了顺便在后山转转碰上那些发光的兽火就是妖兽练练手练够了顺着南边的石阶下山去藏经阁": "vo1/S6_2.mp4", "星旋|对了刚才流星一落右边石台上那圈星钉好像亮了你要是好奇也可以去瞧一眼": "vo1/S6_3.mp4", "星旋|哎呀你终于十八岁了我可等得快无聊死了": "vo1/S0_1.mp4"};
  const clean = t => String(t || '').replace(/[^\u4e00-\u9fff]/g, '');
  const base = w => String(w || '').split('·')[0].replace(/（.*$/, '').trim();
  let on = true; try { on = localStorage.getItem('story_vo') !== '0'; } catch (e) {}
  let cur = null; const cache = {};
  const get = u => cache[u] || (cache[u] = Object.assign(new Audio(u), { preload: 'auto' }));
  function play(who, text) {
    try { if (cur) { cur.pause(); cur = null; } } catch (e) {}
    if (!on || (typeof AUD !== 'undefined' && AUD.muted)) return;
    const u = VO[base(who) + '|' + clean(text)]; if (!u) return;
    try { const a = get(u); a.currentTime = 0; a.volume = 1; a.play().catch(() => {}); cur = a; } catch (e) {}
  }
  say = (o => function (who, text) { try { play(who, text); } catch (e) {} return o.apply(this, arguments); })(say);
  // 预载：进后山开场那张图时先把这一段的配音拉下来
  setTimeout(() => { try { Object.values(VO).slice(0, 12).forEach(get); } catch (e) {} }, 4000);
  // 声音测试面板
  try { if (Array.isArray(window.VOICE_LAB)) for (const k in VO) { const [w, t] = k.split('|'); VOICE_LAB.push({ group: '剧情配音 · 第一章开场（' + w + '）', name: t.slice(0, 12) + (t.length > 12 ? '…' : ''), desc: w + '：' + t, src: VO[k] }); } } catch (e) {}
  (function addBtn(n) {
    const pan = document.getElementById('dbgPanel'); if (!pan) { if ((n || 0) < 40) setTimeout(() => addBtn((n || 0) + 1), 500); return; }
    const h = document.createElement('h4'); h.textContent = '剧情对话配音'; const row = document.createElement('div'); row.className = 'row';
    const b = document.createElement('button'); const lab = () => { b.textContent = on ? '剧情配音：开 · 点一下关' : '剧情配音：关 · 点一下开'; }; lab();
    b.onclick = () => { on = !on; try { localStorage.setItem('story_vo', on ? '1' : '0'); } catch (e) {} if (!on && cur) cur.pause(); lab(); pan.hidden = true; };
    row.appendChild(b); const put = () => { if (!pan.contains(row)) { lab(); pan.prepend(h, row); } };
    put(); new MutationObserver(put).observe(pan, { childList: true });
  })();
  window.STORY_VO = { map: VO, play, get on() { return on; } };
})();

