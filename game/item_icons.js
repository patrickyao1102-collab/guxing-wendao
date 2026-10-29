// ================= Codex R59 物品 / 界面图标（96px 图集，10 列）=================
// 背包、装备页、商店里的物品图标换成 Codex 手绘；品质用圆底外圈颜色区分（凡灰 / 灵绿 / 玄蓝 / 仙金）。菜单分页、行囊按钮也换成图标。
(function () {
  const M = {"a_cloth":0,"a_iron":1,"a_leather":2,"a_liuyun":3,"a_nichang":4,"a_wolf":5,"book_jianpu":6,"book_yuepu":7,"c_jade":8,"c_token":9,"c_tusk":10,"k_bingpo":11,"k_bingpo2":12,"k_core_eagle":13,"k_pokong":14,"k_poxu":15,"k_qiankun":16,"k_roc_whistle":17,"k_xuanhun":18,"k_yupan":19,"m_fang":20,"m_hide":21,"m_horn":22,"m_tooth":23,"moon_dew":24,"p_big":25,"p_mp":26,"p_revive":27,"p_small":28,"w_chixiao":29,"w_hantie":30,"w_qingfeng":31,"w_wood":32,"w_xinghen":33,"w_xinghen2":34,"yujian":35,"yunxingshi":36,"st_armorbreak":37,"st_atkup":38,"st_burn":39,"st_confuse":40,"st_dmgdown":41,"st_freeze":42,"st_paralyze":43,"st_poison":44,"st_shield":45,"st_slow":46,"st_stun":47,"ui_auto":48,"ui_chest":49,"ui_close":50,"ui_contrib":51,"ui_exit":52,"ui_gold":53,"ui_map":54,"ui_menu":55,"ui_mount":56,"ui_mount_swap":57,"ui_questtrack":58,"ui_save":59,"ui_seal":60,"ui_settings":61,"ui_shop":62,"ui_skip":63,"ui_speed":64,"ui_star":65,"ui_stat_atk":66,"ui_stat_def":67,"ui_stat_exp":68,"ui_stat_hp":69,"ui_stat_mp":70,"ui_stat_rage":71,"ui_stat_spd":72,"ui_tab_bag":73,"ui_tab_book":74,"ui_tab_equip":75,"ui_tab_lineup":76,"ui_tab_quest":77,"ui_tab_shenqi":78,"ui_tab_skill":79,"ui_tab_status":80,"ui_talk":81};
  const S = 96, COLS = 10, img = new Image(); let ok = false; img.onload = () => ok = true; img.src = 'ui_icons/items.webp';
  const Q = {}; const set = (q, ids) => ids.split(' ').forEach(i => Q[i] = q);
  set(0, 'w_wood w_qingfeng a_cloth a_leather c_tusk p_small p_mp m_fang m_hide');
  set(1, 'w_xinghen w_hantie a_iron a_wolf c_jade c_token p_big moon_dew m_tooth m_horn book_jianpu book_yuepu');
  set(2, 'w_xinghen2 a_nichang p_revive yunxingshi k_core_eagle k_pokong k_poxu k_yupan k_qiankun k_bingpo k_bingpo2 k_roc_whistle yujian');
  set(3, 'w_chixiao a_liuyun k_xuanhun');
  const QC = ['#9a8a70', '#5fbf73', '#5f9cf0', '#f0b43a'];
  const keyOf = id => { if (id in M) return id; const it = ITEM_DB[id]; if (it && it.book) return /qingxin|liehun/.test(id) ? 'book_yuepu' : 'book_jianpu'; return null; };
  function raw(k, x, y, size) { const i = M[k]; ctx.drawImage(img, (i % COLS) * S, Math.floor(i / COLS) * S, S, S, x - size / 2, y - size / 2, size, size); }
  window.UI_ICON2 = { has: k => ok && k in M, draw(k, x, y, size) { if (!ok || !(k in M)) return false; raw(k, x, y, size); return true; } };
  itemIcon = (orig => function (id, x, y, r) {
    const k = ok && keyOf(id); if (!k) return orig.apply(this, arguments);
    const q = Q[k] != null ? Q[k] : 1; ctx.save();
    const g = ctx.createRadialGradient(x, y - r * .2, r * .1, x, y, r); g.addColorStop(0, 'rgba(70,52,34,.9)'); g.addColorStop(1, 'rgba(18,12,8,.92)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = QC[q]; ctx.stroke();
    if (q >= 2) { ctx.globalAlpha = .35; ctx.lineWidth = r * .22; ctx.beginPath(); ctx.arc(x, y, r + r * .08, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
    raw(k, x, y, r * 2.15); ctx.restore();
  })(itemIcon);
  // 菜单分页：左边一枚图标，字往右挪
  const TAB = { 状态: 'ui_tab_status', 装备: 'ui_tab_equip', 背包: 'ui_tab_bag', 技能: 'ui_tab_skill', 任务: 'ui_tab_quest', 神器: 'ui_tab_shenqi', 出战: 'ui_tab_lineup', 图鉴: 'ui_tab_book' };
  sealText = (orig => function (t, x, y, w, h, active) {
    if (!(ok && TAB[t] && w >= 110)) return orig.apply(this, arguments);
    orig.call(this, '', x, y, w, h, active);
    ctx.save(); raw(TAB[t], x + 30, y + h / 2, h * .82);
    ctx.font = `${Math.round(h * .5)}px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = active ? '#fff2cc' : UI.sub; ctx.fillText(t, x + w / 2 + 18, y + h / 2 + 2); ctx.restore();
  })(sealText);
})();
