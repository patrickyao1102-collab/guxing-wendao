// ================= R290 · 补全物品图标（Codex R290：64 件，每件一张 96×96 透明 webp）=================
// 作者 11-15：「所有没有建立图标的道具、装备……你都找 Codex 去生成素材，好好排查一下」——排查出 55 件还是「圆底 + 一个字」，
// 加上主线案《名录》的 9 件物证 / 照胆镜。画法和 R59 图集一样：深色圆底 + 品质外圈，图标压在圆上。用到哪件才下载哪件。只进测试版。
(function () {
  if (typeof itemIcon !== 'function') return;
  const IDS = new Set('a_qz_chen a_qz_jinzhuang a_qz_zhuying acc_qz_jiusui acc_qz_pingan acc_qz_sachet acc_qz_suisui acc_qz_taohua acc_zhaodan bait_dough bait_dragon bait_firefly bait_fish bait_leaf bait_lees bait_peach bait_redworm bait_rice bait_shrimp bait_worm c_chideng c_guihua c_jianjing c_jiansui c_jinling c_lianming c_lingshu c_pingan c_qz_huwan c_qz_xiudai c_tianzi c_tongling c_xingmu c_yunxing fish_dragon_carp fish_gold_carp fish_yellowcat k_minglu_book k_minglu_borrow k_minglu_ledger k_minglu_list k_minglu_note k_minglu_page k_minglu_paper k_minglu_tag k_qz_lock k_qz_needle k_qz_peach k_qz_sapling k_shenxin line_hemp line_ice line_jiao line_silk m_yuntie r175i_apple r175i_duck_meat r175i_goose_meat r175i_hen_meat r175i_wine rod_ling rod_old rod_xiang rod_zi '.trim().split(' '));
  const IM = {}, QC = ['#9a8a70', '#5fbf73', '#5f9cf0', '#f0b43a'];
  const Q = id => id === 'acc_zhaodan' ? 3 : /^k_minglu_|^fish_dragon|^rod_ling|^line_jiao|^bait_dragon/.test(id) ? 2 : /^bait_|^r175i_|^line_hemp|^rod_old/.test(id) ? 0 : 1;
  const get = id => { let o = IM[id]; if (!o) { o = IM[id] = { ok: false, im: new Image() }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r290i/' + id + '.webp'; } return o.ok ? o.im : null; };
  window.R290_ICON = { has: id => IDS.has(id), get };
  itemIcon = (orig => function (id, x, y, r) {
    const im = IDS.has(id) && get(id); if (!im) return orig.apply(this, arguments);
    const q = Q(id); ctx.save();
    const g = ctx.createRadialGradient(x, y - r * .2, r * .1, x, y, r); g.addColorStop(0, 'rgba(70,52,34,.9)'); g.addColorStop(1, 'rgba(18,12,8,.92)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = QC[q]; ctx.stroke();
    if (q >= 2) { ctx.globalAlpha = .35; ctx.lineWidth = r * .22; ctx.beginPath(); ctx.arc(x, y, r + r * .08, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
    const s = r * 2.15; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, x - s / 2, y - s / 2, s, s); ctx.restore();
  })(itemIcon);
})();
