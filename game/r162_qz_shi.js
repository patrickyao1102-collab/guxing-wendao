// ================= R162 · 青竹小院「五时辰」（Codex R144 素材）=================
// 作者 11-08：叶孤星床边可以选「歇到什么时辰」——卯时清晨 / 午时正午 / 酉时黄昏 / 戌时入夜 / 子时子夜。
//   每个时辰里青禾、小桃、阿福、松伯、小猫干的活不一样、在的地方不一样、说的话也不一样，还有十二件小事（彩蛋插画）。
//   入夜：大家都回屋了（青禾灯下绣花、小桃对镜梳头、阿福打算盘、松伯写信），每回随机有一个人出来（赏月 / 捉萤 / 偷包子 / 提灯巡夜）。
//   子夜：都睡下了（床上盖被呼吸，小桃会踢被子，阿福说梦话；松伯有时候灯还亮着在写家书），小猫蹲在墙头看月亮。
//   基调：院里的人都疼少爷，全是暖的。
// 作者 11-08：R144 的十二张彩蛋插画也是青竹小院专属的载入图 —— 进青竹一带时轮流放，每次载入放一张（见 loading.js 的 QZ_LOAD_ART）。
// 时辰只在青竹一带（小院、西院、各屋、居室、山阶）有效；走出青竹回到白天（不打乱外面的剧情时辰）。剧情自己定时辰的时候，床还是原来的「躺一会儿回满」。
(function () {
  if (!window.R136W_ON || typeof TMAPS === 'undefined' || !TMAPS.qingzhu_court || !TMAPS.tj_room) return;
  const COURT = 'qingzhu_court', OX = 1664, Y = (x, y) => [x - OX, y];
  const RM = { maid1: 'qingzhu_room_qinghe', maid2: 'qingzhu_room_xiaotao', servant: 'qingzhu_room_afu', steward: 'qingzhu_steward_room', kitchen: 'qingzhu_kitchen' };
  const F = () => (S.flags = S.flags || {});
  const now = () => performance.now() / 1000;
  const QZ = m => /^qingzhu_|^tj_room$/.test(m || '');
  const night = () => { try { return window.TOD ? TOD() === 'night' : false; } catch (e) { return false; } };
  const pick = l => l[Math.floor(Math.random() * l.length)];
  const URL = n => (window.R162_ASSETS && R162_ASSETS[n]) || ('r162/' + n);
  const IDX = {"maid1_sweep_6f":{"s":"act_maid1","r":0,"n":6,"fps":6,"loop":true,"dir":"downleft"},"maid1_chopveg_6f":{"s":"act_maid1","r":1,"n":6,"fps":6,"loop":true,"dir":"downleft"},"maid1_laundry_6f":{"s":"act_maid1","r":2,"n":6,"fps":6,"loop":true,"dir":"downleft"},"maid1_stitch_6f":{"s":"act_maid1","r":3,"n":6,"fps":5,"loop":true,"dir":"downleft"},"maid1_moon_6f":{"s":"act_maid1","r":4,"n":6,"fps":5,"loop":true,"dir":"downleft"},"maid1_setbasin_6f":{"s":"act_maid1","r":5,"n":6,"fps":6,"loop":true,"dir":"downleft"},"maid1_basin_down_6f":{"s":"act_maid1","r":6,"n":6,"fps":7,"loop":true,"dir":"down"},"maid1_basin_up_6f":{"s":"act_maid1","r":7,"n":6,"fps":7,"loop":true,"dir":"up"},"maid1_basin_left_6f":{"s":"act_maid1","r":8,"n":6,"fps":7,"loop":true,"dir":"left"},"maid1_basin_downleft_6f":{"s":"act_maid1","r":9,"n":6,"fps":7,"loop":true,"dir":"downleft"},"maid1_tray_down_6f":{"s":"act_maid1","r":10,"n":6,"fps":7,"loop":true,"dir":"down"},"maid1_tray_up_6f":{"s":"act_maid1","r":11,"n":6,"fps":7,"loop":true,"dir":"up"},"maid1_tray_left_6f":{"s":"act_maid1","r":12,"n":6,"fps":7,"loop":true,"dir":"left"},"maid1_tray_downleft_6f":{"s":"act_maid1","r":13,"n":6,"fps":7,"loop":true,"dir":"downleft"},"maid1_clothes_down_6f":{"s":"act_maid1","r":14,"n":6,"fps":7,"loop":true,"dir":"down"},"maid1_clothes_up_6f":{"s":"act_maid1","r":15,"n":6,"fps":7,"loop":true,"dir":"up"},"maid1_clothes_left_6f":{"s":"act_maid1","r":16,"n":6,"fps":7,"loop":true,"dir":"left"},"maid1_clothes_downleft_6f":{"s":"act_maid1","r":17,"n":6,"fps":7,"loop":true,"dir":"downleft"},"maid2_water_6f":{"s":"act_maid2","r":0,"n":6,"fps":6,"loop":true,"dir":"downleft"},"maid2_dew_6f":{"s":"act_maid2","r":1,"n":6,"fps":6,"loop":false,"dir":"downleft"},"maid2_fan_6f":{"s":"act_maid2","r":2,"n":6,"fps":6,"loop":true,"dir":"downleft"},"maid2_teaoffer_6f":{"s":"act_maid2","r":3,"n":6,"fps":6,"loop":false,"dir":"downleft"},"maid2_vase_6f":{"s":"act_maid2","r":4,"n":6,"fps":6,"loop":false,"dir":"downleft"},"maid2_comb_6f":{"s":"act_maid2","r":5,"n":6,"fps":6,"loop":true,"dir":"downleft"},"maid2_catch_6f":{"s":"act_maid2","r":6,"n":6,"fps":6,"loop":true,"dir":"downleft"},"maid2_pot_down_6f":{"s":"act_maid2","r":7,"n":6,"fps":7,"loop":true,"dir":"down"},"maid2_pot_up_6f":{"s":"act_maid2","r":8,"n":6,"fps":7,"loop":true,"dir":"up"},"maid2_pot_left_6f":{"s":"act_maid2","r":9,"n":6,"fps":7,"loop":true,"dir":"left"},"maid2_pot_downleft_6f":{"s":"act_maid2","r":10,"n":6,"fps":7,"loop":true,"dir":"downleft"},"servant_gatesweep_6f":{"s":"act_servant","r":0,"n":6,"fps":6,"loop":true,"dir":"downleft"},"servant_yawn_6f":{"s":"act_servant","r":1,"n":6,"fps":6,"loop":false,"dir":"downleft"},"servant_axe_6f":{"s":"act_servant","r":2,"n":6,"fps":6,"loop":true,"dir":"downleft"},"servant_light_6f":{"s":"act_servant","r":3,"n":6,"fps":6,"loop":false,"dir":"downleft"},"servant_abacus_6f":{"s":"act_servant","r":4,"n":6,"fps":6,"loop":true,"dir":"downleft"},"servant_bun_6f":{"s":"act_servant","r":5,"n":6,"fps":6,"loop":false,"dir":"downleft"},"servant_yoke_down_6f":{"s":"act_servant","r":6,"n":6,"fps":7,"loop":true,"dir":"down"},"servant_yoke_up_6f":{"s":"act_servant","r":7,"n":6,"fps":7,"loop":true,"dir":"up"},"servant_yoke_left_6f":{"s":"act_servant","r":8,"n":6,"fps":7,"loop":true,"dir":"left"},"servant_yoke_downleft_6f":{"s":"act_servant","r":9,"n":6,"fps":7,"loop":true,"dir":"downleft"},"servant_logs_down_6f":{"s":"act_servant","r":10,"n":6,"fps":7,"loop":true,"dir":"down"},"servant_logs_up_6f":{"s":"act_servant","r":11,"n":6,"fps":7,"loop":true,"dir":"up"},"servant_logs_left_6f":{"s":"act_servant","r":12,"n":6,"fps":7,"loop":true,"dir":"left"},"servant_logs_downleft_6f":{"s":"act_servant","r":13,"n":6,"fps":7,"loop":true,"dir":"downleft"},"steward_sky_6f":{"s":"act_steward","r":0,"n":6,"fps":5,"loop":true,"dir":"downleft"},"steward_birds_6f":{"s":"act_steward","r":1,"n":6,"fps":6,"loop":true,"dir":"downleft"},"steward_sip_6f":{"s":"act_steward","r":2,"n":6,"fps":6,"loop":true,"dir":"downleft"},"steward_ledger_6f":{"s":"act_steward","r":3,"n":6,"fps":5,"loop":true,"dir":"downleft"},"steward_patrol_6f":{"s":"act_steward","r":4,"n":6,"fps":6,"loop":true,"dir":"downleft"},"steward_point_6f":{"s":"act_steward","r":5,"n":6,"fps":6,"loop":true,"dir":"downleft"},"steward_letter_6f":{"s":"act_steward","r":6,"n":6,"fps":5,"loop":true,"dir":"downleft"},"steward_lantern_down_6f":{"s":"act_steward","r":7,"n":6,"fps":7,"loop":true,"dir":"down"},"steward_lantern_up_6f":{"s":"act_steward","r":8,"n":6,"fps":7,"loop":true,"dir":"up"},"steward_lantern_left_6f":{"s":"act_steward","r":9,"n":6,"fps":7,"loop":true,"dir":"left"},"steward_lantern_downleft_6f":{"s":"act_steward","r":10,"n":6,"fps":7,"loop":true,"dir":"downleft"},"cat_leap_4f":{"s":"act_cat","r":0,"n":4,"fps":6,"loop":true,"dir":"downleft"},"cat_chase_6f":{"s":"act_cat","r":1,"n":6,"fps":6,"loop":true,"dir":"downleft"},"cat_sunset_6f":{"s":"act_cat","r":2,"n":6,"fps":6,"loop":true,"dir":"downleft"},"cat_warm_6f":{"s":"act_cat","r":3,"n":6,"fps":5,"loop":true,"dir":"downleft"},"cat_glow_6f":{"s":"act_cat","r":4,"n":6,"fps":6,"loop":true,"dir":"downleft"},"cat_silhouette_4f":{"s":"act_cat","r":5,"n":4,"fps":5,"loop":true,"dir":"downleft"},"cat_lick_paw_6f":{"s":"act_cat","r":6,"n":6,"fps":6,"loop":true,"dir":"downleft"},"cat_sleep_4f":{"s":"act_cat","r":7,"n":4,"fps":6,"loop":true,"dir":"downleft"},"cat_walk_left_6f":{"s":"act_cat","r":8,"n":6,"fps":6,"loop":true,"dir":"left"},"maid1_sleep_night_4f":{"s":"bed","r":0,"n":4,"fps":3,"loop":true,"o":[12,244],"map":"qingzhu_room_qinghe"},"maid2_sleep_night_4f":{"s":"bed","r":1,"n":4,"fps":3,"loop":true,"o":[12,237],"map":"qingzhu_room_xiaotao"},"maid2_kick_night_4f":{"s":"bed","r":2,"n":4,"fps":3,"loop":false,"o":[12,237],"map":"qingzhu_room_xiaotao"},"servant_sleep_night_4f":{"s":"bed","r":3,"n":4,"fps":3,"loop":true,"o":[53,193],"map":"qingzhu_room_afu"},"servant_dream_night_4f":{"s":"bed","r":4,"n":4,"fps":3,"loop":false,"o":[53,193],"map":"qingzhu_room_afu"},"steward_sleep_night_4f":{"s":"bed","r":5,"n":4,"fps":3,"loop":true,"o":[70,206],"map":"qingzhu_steward_room"},"lighting_pole_day":{"s":"prop","x":0,"y":0,"w":108,"h":256,"n":1,"fps":6,"loop":true,"an":[54,249]},"lighting_pole_night":{"s":"prop","x":110,"y":0,"w":108,"h":256,"n":1,"fps":6,"loop":true,"an":[54,249]},"rack_full_day":{"s":"prop","x":220,"y":0,"w":300,"h":234,"n":6,"fps":3,"loop":true,"an":[150,227]},"rack_full_night":{"s":"prop","x":2022,"y":0,"w":300,"h":234,"n":6,"fps":3,"loop":true,"an":[150,227]},"rack_empty_day":{"s":"prop","x":0,"y":258,"w":300,"h":234,"n":1,"fps":6,"loop":true,"an":[150,227]},"rack_empty_night":{"s":"prop","x":302,"y":258,"w":300,"h":234,"n":1,"fps":6,"loop":true,"an":[150,227]},"dusk_hearth_smoke":{"s":"prop","x":604,"y":258,"w":144,"h":224,"n":8,"fps":5,"loop":true,"an":null},"moon_bamboo_8f":{"s":"prop","x":1758,"y":258,"w":240,"h":192,"n":8,"fps":4,"loop":true,"an":null},"eaves_halo_6f":{"s":"prop","x":0,"y":494,"w":192,"h":192,"n":6,"fps":3,"loop":true,"an":null},"warm_wash_day_8f":{"s":"prop","x":1154,"y":494,"w":160,"h":192,"n":8,"fps":5,"loop":true,"an":[80,185]},"warm_wash_night_8f":{"s":"prop","x":2436,"y":494,"w":160,"h":192,"n":8,"fps":5,"loop":true,"an":[80,185]},"dawn_fog_8f":{"s":"prop","x":0,"y":688,"w":480,"h":180,"n":8,"fps":4,"loop":true,"an":null},"fireflies_8f":{"s":"prop","x":0,"y":870,"w":320,"h":180,"n":8,"fps":5,"loop":true,"an":null},"firefly_cluster_day":{"s":"prop","x":0,"y":1052,"w":320,"h":180,"n":8,"fps":5,"loop":true,"an":null},"firefly_cluster_night":{"s":"prop","x":0,"y":1234,"w":320,"h":180,"n":8,"fps":5,"loop":true,"an":null},"dream_bubble":{"s":"prop","x":2562,"y":1234,"w":360,"h":172,"n":1,"fps":6,"loop":true,"an":null},"axe_wall_day":{"s":"prop","x":2924,"y":1234,"w":96,"h":160,"n":1,"fps":6,"loop":true,"an":[48,153]},"axe_wall_night":{"s":"prop","x":3022,"y":1234,"w":96,"h":160,"n":1,"fps":6,"loop":true,"an":[48,153]},"woodpile_day":{"s":"prop","x":3120,"y":1234,"w":220,"h":160,"n":1,"fps":6,"loop":true,"an":[110,159]},"woodpile_night":{"s":"prop","x":3342,"y":1234,"w":220,"h":160,"n":1,"fps":6,"loop":true,"an":[110,159]},"lantern_off_day":{"s":"prop","x":3564,"y":1234,"w":128,"h":154,"n":1,"fps":6,"loop":true,"an":[64,147]},"lantern_off_night":{"s":"prop","x":3694,"y":1234,"w":128,"h":154,"n":1,"fps":6,"loop":true,"an":[64,147]},"lantern_lit_day":{"s":"prop","x":3824,"y":1234,"w":128,"h":154,"n":1,"fps":6,"loop":true,"an":[64,147]},"lantern_lit_night":{"s":"prop","x":3954,"y":1234,"w":128,"h":154,"n":1,"fps":6,"loop":true,"an":[64,147]},"hand_lantern_day":{"s":"prop","x":0,"y":1416,"w":112,"h":153,"n":1,"fps":6,"loop":true,"an":[56,146]},"hand_lantern_night":{"s":"prop","x":114,"y":1416,"w":112,"h":153,"n":1,"fps":6,"loop":true,"an":[56,146]},"hanky_fall_6f":{"s":"prop","x":228,"y":1416,"w":160,"h":150,"n":6,"fps":7,"loop":false,"an":null},"wash_stool_day":{"s":"prop","x":1190,"y":1416,"w":144,"h":144,"n":1,"fps":6,"loop":true,"an":[72,137]},"wash_stool_night":{"s":"prop","x":1336,"y":1416,"w":144,"h":144,"n":1,"fps":6,"loop":true,"an":[72,137]},"sword_glint_6f":{"s":"prop","x":1482,"y":1416,"w":288,"h":144,"n":6,"fps":16,"loop":false,"an":null},"door_lamp_day":{"s":"prop","x":3212,"y":1416,"w":110,"h":124,"n":1,"fps":6,"loop":true,"an":[55,117]},"door_lamp_night":{"s":"prop","x":3324,"y":1416,"w":110,"h":124,"n":1,"fps":6,"loop":true,"an":[55,117]},"fly_day":{"s":"prop","x":0,"y":1571,"w":150,"h":120,"n":6,"fps":7,"loop":true,"an":[75,113]},"fly_night":{"s":"prop","x":902,"y":1571,"w":150,"h":120,"n":6,"fps":7,"loop":true,"an":[75,113]},"oil_lamp_day":{"s":"prop","x":1804,"y":1571,"w":96,"h":114,"n":1,"fps":6,"loop":true,"an":[48,107]},"oil_lamp_night":{"s":"prop","x":1902,"y":1571,"w":96,"h":114,"n":1,"fps":6,"loop":true,"an":[48,107]},"noodles_day":{"s":"prop","x":2000,"y":1571,"w":126,"h":108,"n":1,"fps":6,"loop":true,"an":[63,101]},"noodles_night":{"s":"prop","x":2128,"y":1571,"w":126,"h":108,"n":1,"fps":6,"loop":true,"an":[63,101]},"tea_tray_day":{"s":"prop","x":2256,"y":1571,"w":154,"h":107,"n":1,"fps":6,"loop":true,"an":[77,100]},"tea_tray_night":{"s":"prop","x":2412,"y":1571,"w":154,"h":107,"n":1,"fps":6,"loop":true,"an":[77,100]},"bun_basket_day":{"s":"prop","x":2568,"y":1571,"w":136,"h":103,"n":1,"fps":6,"loop":true,"an":[68,96]},"bun_basket_night":{"s":"prop","x":2706,"y":1571,"w":136,"h":103,"n":1,"fps":6,"loop":true,"an":[68,96]},"wash_tub_day":{"s":"prop","x":2844,"y":1571,"w":154,"h":102,"n":1,"fps":6,"loop":true,"an":[77,95]},"wash_tub_night":{"s":"prop","x":3000,"y":1571,"w":154,"h":102,"n":1,"fps":6,"loop":true,"an":[77,95]},"ledger_day":{"s":"prop","x":3156,"y":1571,"w":126,"h":98,"n":1,"fps":6,"loop":true,"an":[63,91]},"ledger_night":{"s":"prop","x":3284,"y":1571,"w":126,"h":98,"n":1,"fps":6,"loop":true,"an":[63,91]},"peck_day":{"s":"prop","x":0,"y":1693,"w":132,"h":96,"n":6,"fps":6,"loop":true,"an":[66,89]},"peck_night":{"s":"prop","x":794,"y":1693,"w":132,"h":96,"n":6,"fps":6,"loop":true,"an":[66,89]},"folded_linen_day":{"s":"prop","x":1588,"y":1693,"w":128,"h":88,"n":1,"fps":6,"loop":true,"an":[64,81]},"folded_linen_night":{"s":"prop","x":1718,"y":1693,"w":128,"h":88,"n":1,"fps":6,"loop":true,"an":[64,81]},"hoop_day":{"s":"prop","x":1848,"y":1693,"w":100,"h":86,"n":1,"fps":6,"loop":true,"an":[50,79]},"hoop_night":{"s":"prop","x":1950,"y":1693,"w":100,"h":86,"n":1,"fps":6,"loop":true,"an":[50,79]},"abacus_day":{"s":"prop","x":2052,"y":1693,"w":130,"h":82,"n":1,"fps":6,"loop":true,"an":[65,75]},"abacus_night":{"s":"prop","x":2184,"y":1693,"w":130,"h":82,"n":1,"fps":6,"loop":true,"an":[65,75]},"handkerchief_day":{"s":"prop","x":2316,"y":1693,"w":102,"h":80,"n":1,"fps":6,"loop":true,"an":[51,73]},"handkerchief_night":{"s":"prop","x":2420,"y":1693,"w":102,"h":80,"n":1,"fps":6,"loop":true,"an":[51,73]},"butterfly_day":{"s":"prop","x":2524,"y":1693,"w":64,"h":64,"n":4,"fps":6,"loop":true,"an":[32,57]},"butterfly_night":{"s":"prop","x":2782,"y":1693,"w":64,"h":64,"n":4,"fps":6,"loop":true,"an":[32,57]},"firefly_day":{"s":"prop","x":3040,"y":1693,"w":48,"h":48,"n":8,"fps":5,"loop":true,"an":null},"firefly_night":{"s":"prop","x":3426,"y":1693,"w":48,"h":48,"n":8,"fps":5,"loop":true,"an":null},"rest_panel":{"s":"ui","x":0,"y":0,"w":880,"h":360},"icon_dawn":{"s":"ui","x":0,"y":362,"w":128,"h":128},"icon_noon":{"s":"ui","x":130,"y":362,"w":128,"h":128},"icon_dusk":{"s":"ui","x":260,"y":362,"w":128,"h":128},"icon_evening":{"s":"ui","x":390,"y":362,"w":128,"h":128},"icon_midnight":{"s":"ui","x":520,"y":362,"w":128,"h":128},"rest_option_normal":{"s":"ui","x":650,"y":362,"w":136,"h":144},"rest_option_selected":{"s":"ui","x":788,"y":362,"w":136,"h":144},"rest_fade_8f":{"s":"fade","w":640,"h":360,"n":8,"fps":8},"west_dawn":{"s":"l_west_dawn","w":1664,"h":1792},"west_noon":{"s":"l_west_noon","w":1664,"h":1792},"west_dusk":{"s":"l_west_dusk","w":1664,"h":1792},"west_long_shadows":{"s":"l_west_long_shadows","w":1664,"h":1792},"main_dawn":{"s":"l_main_dawn","w":2304,"h":1792},"main_noon":{"s":"l_main_noon","w":2304,"h":1792},"main_dusk":{"s":"l_main_dusk","w":2304,"h":1792},"main_long_shadows":{"s":"l_main_long_shadows","w":2304,"h":1792},"window_maid1_dawn":{"s":"l_window_maid1_dawn","w":832,"h":768},"window_maid1_dusk":{"s":"l_window_maid1_dusk","w":832,"h":768},"window_maid2_dawn":{"s":"l_window_maid2_dawn","w":832,"h":768},"window_maid2_dusk":{"s":"l_window_maid2_dusk","w":832,"h":768},"window_servant_dawn":{"s":"l_window_servant_dawn","w":832,"h":768},"window_servant_dusk":{"s":"l_window_servant_dusk","w":832,"h":768},"window_kitchen_dawn":{"s":"l_window_kitchen_dawn","w":832,"h":768},"window_kitchen_dusk":{"s":"l_window_kitchen_dusk","w":832,"h":768},"story_01":{"s":"story_01","name":"花圃指尖的一滴露","time":["卯"]},"story_02":{"s":"story_02","name":"门口的温水","time":["卯"]},"story_03":{"s":"story_03","name":"小时候偷吃供果","time":["午"]},"story_04":{"s":"story_04","name":"竹梢上的手帕","time":["酉"]},"story_05":{"s":"story_05","name":"最后一盏灯笼","time":["酉"]},"story_06":{"s":"story_06","name":"硬塞来的半个包子","time":["戌"]},"story_07":{"s":"story_07","name":"月下说起山下的娘","time":["戌"]},"story_08":{"s":"story_08","name":"把萤火虫放到少爷手心","time":["戌"]},"story_09":{"s":"story_09","name":"阿福的梦话","time":["子"]},"story_10":{"s":"story_10","name":"灯下给宗主的家书","time":["子"]},"story_11":{"s":"story_11","name":"一人一灵屋脊看星","time":["子"]},"story_12":{"s":"story_12","name":"墙头的小猫与大月亮","time":["子"]}};

  // ---------- 素材 ----------
  const IM = {};
  const img = s => { let o = IM[s]; if (!o) { o = IM[s] = { im: new Image(), ok: false }; o.im.onload = () => { o.ok = true; }; o.im.src = URL(s + '.webp'); } return o.ok ? o.im : null; };
  const WALKIM = {}; const walkIm = k => { let o = WALKIM[k]; if (!o) { o = WALKIM[k] = { im: new Image(), ok: false }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r135e2/' + k + '_walk.webp'; } return o.ok ? o.im : null; };
  const SHEETS = ['act_maid1', 'act_maid2', 'act_servant', 'act_steward', 'act_cat', 'prop', 'bed', 'ui'];
  const LIGHTS = { '卯': ['main_dawn', 'west_dawn'], '午': ['main_noon', 'west_noon'], '酉': ['main_dusk', 'west_dusk', 'main_long_shadows', 'west_long_shadows'] };
  const preload = () => { for (const s of SHEETS) img(s); const L = LIGHTS[shi()]; if (L) for (const k of L) img('l_' + k); img('fade');
    for (const k of ['maid1', 'maid2', 'servant', 'steward']) walkIm(k); };

  // ---------- 时辰 ----------
  const SHI = ['卯', '午', '酉', '戌', '子'];
  const NAME = { '卯': '卯时', '午': '午时', '酉': '酉时', '戌': '戌时', '子': '子时' };
  const LAB = { '卯': '清晨', '午': '正午', '酉': '黄昏', '戌': '入夜', '子': '子夜' };
  const ICON = { '卯': 'icon_dawn', '午': 'icon_noon', '酉': 'icon_dusk', '戌': 'icon_evening', '子': 'icon_midnight' };
  const shi = () => F().qz_shi || '';
  const ON = () => !!F().qz_shi;
  window.QZ_SHI_ON = () => ON() && QZ(world.mapName);
  window.QZ_SHI = () => (ON() ? shi() : '');
  // 别的剧情自己改时辰 → 五时辰让位
  let inner = false;
  const setTod = v => { inner = true; try { SET_TOD(v); } finally { inner = false; } };
  { const s0 = window.SET_TOD; if (s0) window.SET_TOD = function (v) { if (!inner && F().qz_shi) F().qz_shi = ''; return s0.apply(this, arguments); }; }
  { const r0 = window.RES_TOD; if (r0) window.RES_TOD = function (v) { if (!inner && F().qz_shi) F().qz_shi = ''; return r0.apply(this, arguments); }; }

  // ---------- 画图小工具 ----------
  const SC = .47, CATSC = .5;
  const undoAZ = a => { try { const z = typeof AZ === 'function' ? 1 / AZ() : 1; if (z !== 1) { ctx.translate(a.x, a.y); ctx.scale(z, z); ctx.translate(-a.x, -a.y); } } catch (e) {} };
  function act(id, f, x, y, flip, sc = SC) {   // 人物 / 小猫动作：256 格，脚点 (128,240)，画的是朝左前方
    const d = IDX[id]; if (!d) return false; const im = img(d.s); if (!im) return false;
    f = Math.max(0, Math.min(d.n - 1, f | 0));
    ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1); ctx.scale(sc, sc); ctx.drawImage(im, f * 256, d.r * 256, 256, 256, -128, -240, 256, 256); ctx.restore(); return true;
  }
  const pid = id => { const v = night() ? '_night' : '_day'; for (const k of [id + v, id + v + '_8f', id]) if (IDX[k]) return k; return id; };
  function prop(id, f, x, y, sc = .45, alpha = 1, flip = false) {   // 道具：按 anchor 落脚（昼 / 夜两版自动挑）
    const d = IDX[pid(id)]; if (!d) return false; const im = img('prop'); if (!im) return false;
    if (f == null) f = Math.floor(now() * (d.fps || 6));
    f = d.loop === false ? Math.max(0, Math.min(d.n - 1, f | 0)) : ((f | 0) % d.n + d.n) % d.n;
    const an = d.an || [d.w / 2, d.h / 2];
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); if (flip) ctx.scale(-1, 1); ctx.scale(sc, sc); ctx.drawImage(im, d.x + f * d.w, d.y, d.w, d.h, -an[0], -an[1], d.w, d.h); ctx.restore(); return true;
  }
  const fr = (d, t0, loop) => { const k = Math.floor((now() - t0) * (d.fps || 6)); return loop === false || d.loop === false ? Math.min(d.n - 1, k) : k % d.n; };
  const shadow = (x, y, rx = 21, ry = 7, a = .3) => { ctx.save(); ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.fill(); ctx.restore(); };
  function walkDraw(a, k, dx, dy, moving) {   // R135 八向行走图（老管家四向）
    const im = walkIm(k); if (!im) return false;
    let row = 0, flip = false;
    if (k === 'steward') { if (Math.abs(dx) > Math.abs(dy) * .8) { row = 2; flip = dx > 0; } else row = dy < 0 ? 1 : 0; }
    else { const s = ((Math.round(Math.atan2(dy, dx) * 180 / Math.PI / 45) % 8) + 8) % 8; [row, flip] = [[2, true], [1, true], [0, false], [1, false], [2, false], [3, false], [4, false], [3, true]][s]; }
    const col = moving ? 1 + Math.floor(now() * 8 + (a.x * .013 % 1) * 6) % 6 : 0;
    ctx.save(); ctx.translate(a.x, a.y); if (flip) ctx.scale(-1, 1); ctx.scale(SC, SC); ctx.drawImage(im, col * 160, row * 240, 160, 240, -80, -232, 160, 240); ctx.restore(); return true;
  }
  const carryId = (base, dx, dy) => { const ax = Math.abs(dx), ay = Math.abs(dy); let d;
    if (ay > ax * 1.6) d = dy < 0 ? 'up' : 'down'; else if (dy > 0 && ay > ax * .45) d = 'downleft'; else d = 'left';
    return [base + '_' + d + '_6f', dx > 0 && d !== 'up' && d !== 'down']; };

  // ---------- 五个时辰里，每个人在哪、干什么 ----------
  // 步骤：go 走过去（w：带东西走的动作 / patrol 巡院 / lantern 提灯）；act 原地动作（t 秒，once 只放一遍）；wait 歇着；hide 进屋一会儿；loop 跳回第几步
  const WELL = Y(330, 1470), KDOOR = Y(335, 1205), GATE = [736, 1600], TABLE = Y(1041, 1372);
  const LANT = { k1: Y(244, 1030), k2: Y(426, 1030), m1: [801, 418], m2: [1345, 412], m3: [1475, 422] };
  const PLAN = {
    '卯': {
      maid1: { map: COURT, at: [1160, 644], steps: [
        { go: [1046, 592], w: 'maid1_basin' }, { act: 'maid1_setbasin_6f', t: 2.4, once: 1, face: -1, fn: () => { DAY.basin = 1; } }, { wait: 1 },
        { go: [1640, 566] }, { act: 'maid1_sweep_6f', t: 9, face: 1 }, { go: [1790, 580] }, { act: 'maid1_sweep_6f', t: 8, face: -1 },
        { go: [1280, 604] }, { act: 'maid1_sweep_6f', t: 7, face: 1 }, { loop: 3 }] },
      maid2: { map: COURT, at: Y(640, 706), steps: [
        { act: 'maid2_water_6f', t: 7, face: 1 }, { act: 'maid2_dew_6f', t: 4, once: 1, face: 1 }, { go: Y(1222, 706) }, { act: 'maid2_water_6f', t: 7, face: -1 },
        { go: Y(1210, 935) }, { act: 'maid2_water_6f', t: 6, face: 1 }, { go: Y(207, 706) }, { act: 'maid2_water_6f', t: 6, face: -1 }, { act: 'maid2_dew_6f', t: 4, once: 1, face: -1 },
        { go: Y(640, 706) }, { loop: 0 }] },
      servant: { map: COURT, at: GATE, steps: [
        { act: 'servant_gatesweep_6f', t: 8, face: -1 }, { act: 'servant_yawn_6f', t: 2.4, once: 1, face: -1 }, { go: WELL }, { wait: 1.6 },
        { go: Y(300, 1214), w: 'servant_yoke', fill: 1 }, { wait: 1.2 }, { go: WELL }, { wait: 1.4 }, { go: Y(300, 1214), w: 'servant_yoke', fill: 1 }, { wait: 1 },
        { go: GATE }, { loop: 0 }] },
      steward: { map: COURT, at: [930, 642], steps: [
        { act: 'steward_sky_6f', t: 8, face: 1 }, { go: [862, 604] }, { act: 'steward_birds_6f', t: 14, face: -1, birds: 1 }, { go: [930, 642] }, { loop: 0 }] },
      cat: { map: COURT, at: Y(330, 1420), steps: [{ act: 'cat_lick_paw_6f', t: 6, face: -1 }, { go: Y(250, 1500), w: 'cat' }, { act: 'cat_leap_4f', t: 5, face: 1 }, { go: Y(330, 1420), w: 'cat' }, { loop: 0 }] },
    },
    '午': {
      maid1: { map: COURT, at: KDOOR, steps: [{ hide: 10 }, { go: Y(1062, 1452), w: 'maid1_tray' }, { wait: 2.5, face: -1, fn: () => { DAY.noodles = 1; } }, { go: KDOOR }, { hide: 16 }, { loop: 1 }] },
      maid1k: { who: 'maid1', map: RM.kitchen, at: [300, 604], steps: [{ act: 'maid1_chopveg_6f', t: 1e9, face: -1 }] },
      maid2: { map: COURT, at: KDOOR, steps: [{ hide: 6 }, { go: Y(1196, 1444) }, { act: 'maid2_teaoffer_6f', t: 2.6, once: 1, face: -1 }, { wait: 5, face: -1 }, { go: KDOOR }, { hide: 22 }, { loop: 1 }] },
      maid2k: { who: 'maid2', map: RM.kitchen, at: [590, 522], steps: [{ act: 'maid2_fan_6f', t: 1e9, face: -1 }] },
      servant: { map: COURT, at: Y(470, 1192), steps: [
        { act: 'servant_axe_6f', t: 10, face: 1 }, { go: KDOOR, w: 'servant_logs' }, { hide: 4 }, { go: Y(470, 1192) }, { loop: 0 }] },
      steward: { map: COURT, at: Y(1124, 1420), steps: [{ act: 'steward_sip_6f', t: 10, face: -1 }, { act: 'steward_ledger_6f', t: 8, face: -1 }, { loop: 0 }] },
      cat: { map: COURT, at: Y(780, 1252), steps: [{ act: 'cat_chase_6f', t: 8, face: -1, fly: 1 }, { go: Y(600, 1320), w: 'cat' }, { act: 'cat_sleep_4f', t: 16, face: 1 }, { go: Y(780, 1252), w: 'cat' }, { loop: 0 }] },
    },
    '酉': {
      maid1: { map: COURT, at: Y(520, 1462), steps: [{ act: 'maid1_laundry_6f', t: 9, face: -1 }, { go: Y(400, 518), w: 'maid1_clothes' }, { hide: 7 }, { go: Y(520, 1462) }, { loop: 0 }] },
      maid2: { map: COURT, at: Y(640, 706), steps: [
        { go: Y(900, 520), w: 'maid2_pot' }, { act: 'maid2_vase_6f', t: 3, once: 1, face: -1 }, { wait: 1.5 }, { go: Y(1222, 706) }, { go: Y(1060, 522), w: 'maid2_pot' }, { wait: 2 }, { go: Y(640, 706) }, { loop: 0 }] },
      servant: { map: COURT, at: Y(300, 1188), steps: [
        { act: 'servant_light_6f', t: 3, once: 1, face: -1, lit: 'k1' }, { go: Y(480, 1188) }, { act: 'servant_light_6f', t: 3, once: 1, face: -1, lit: 'k2' },
        { go: [860, 560] }, { act: 'servant_light_6f', t: 3, once: 1, face: -1, lit: 'm1' }, { go: [1404, 556] }, { act: 'servant_light_6f', t: 3, once: 1, face: -1, lit: 'm2' },
        { go: [1534, 566] }, { act: 'servant_light_6f', t: 3, once: 1, face: -1, lit: 'm3' }, { go: [1260, 640] }, { wait: 1e9, face: -1 }] },
      steward: { map: COURT, at: [736, 1350], steps: [{ go: [736, 760], w: 'patrol' }, { go: [1400, 600], w: 'patrol' }, { act: 'steward_point_6f', t: 4.5, face: -1 }, { go: [736, 1350], w: 'patrol' }, { wait: 3 }, { loop: 0 }] },
      cat: { map: COURT, at: TABLE, sy: 1414, steps: [{ act: 'cat_sunset_6f', t: 1e9, face: -1 }] },
    },
    '戌': {
      maid1: { map: RM.maid1, at: [374, 386], steps: [{ act: 'maid1_stitch_6f', t: 1e9, face: -1 }] },
      maid2: { map: RM.maid2, at: [722, 548], steps: [{ act: 'maid2_comb_6f', t: 1e9, face: -1 }] },
      servant: { map: RM.servant, at: [520, 422], steps: [{ act: 'servant_abacus_6f', t: 1e9, face: -1 }] },
      steward: { map: RM.steward, at: [432, 472], steps: [{ act: 'steward_letter_6f', t: 1e9, face: -1 }] },
      cat: { map: COURT, at: Y(430, 1200), steps: [{ act: 'cat_warm_6f', t: 1e9, face: -1 }] },
    },
    '子': {
      cat: { map: COURT, at: [1250, 1346], sy: 1405, steps: [{ act: 'cat_silhouette_4f', t: 1e9, face: -1 }] },
    },
  };
  // 入夜出来的那个人（每回歇到戌时随机挑一个，没看过小事的优先）
  const OUT = {
    maid1: { map: COURT, at: Y(1124, 1440), steps: [{ act: 'maid1_moon_6f', t: 1e9, face: -1 }], ev: 7 },
    maid2: { map: COURT, at: Y(360, 1444), steps: [{ act: 'maid2_catch_6f', t: 1e9, face: -1 }], ev: 8 },
    servant: { map: RM.kitchen, at: [330, 528], steps: [{ act: 'servant_bun_6f', t: 1e9, face: -1, once: 1 }], ev: 6 },
    steward: { map: COURT, at: [736, 1350], steps: [{ go: [736, 720], w: 'steward_lantern' }, { go: [1300, 640], w: 'steward_lantern' }, { wait: 2 }, { go: Y(800, 1320), w: 'steward_lantern' }, { wait: 2 }, { go: [736, 1350], w: 'steward_lantern' }, { wait: 3 }, { loop: 0 }] },
  };
  const DAY = { basin: 0, noodles: 0, lit: {} };
  const planOf = (k, s) => { if (k === 'steward' && (s === '卯' || s === '午') && F().qz_shi && (F().qz_day || 1) % 5 === 2) return null; if (s === '子' && AWAKE() === k && NIGHT_PLAN[F().qz_awake]) return NIGHT_PLAN[F().qz_awake]; if (s === '戌' && F().qz_out === k) return OUT[k]; if (s === '子' && k === 'steward' && F().qz_letter) return PLAN['戌'].steward; return (PLAN[s] || {})[k]; };

  // ---------- 对白：每人每个时辰一套 ----------
  const WHO = { maid1: '侍女青禾', maid2: '侍女小桃', servant: '小厮阿福', steward: '松伯' };
  const LINES = {
    maid1: {
      '卯': [['笑', '少爷醒了？门口的水是刚兑的，不烫手。'], ['', '竹叶一夜落一层，趁早扫了，少爷出门脚底下干净。'], ['担心', '今早露水重，少爷练剑记得添件衣裳。'], ['嗔', '青禾起得早，听见少爷屋里翻了好几回身——昨夜又熬到很晚吧？'], ['笑', '布巾是晒过的，有太阳的味道。'], ['认真', '早饭是小米粥配酱菜，少爷练完剑就过来吃。']],
      '午': [['笑', '今儿晌午是笋片炒肉，少爷爱吃的。'], ['嗔', '少爷别偷吃，还没下锅呢。'], ['认真', '刀快着呢，少爷站远一点。'], ['笑', '菜马上就好——少爷先去石桌那边坐着。'], ['', '小桃那丫头又把火烧旺了，青禾得赶紧切。'], ['笑', '面里卧了个蛋，少爷别告诉阿福，他碗里没有。']],
      '酉': [['笑', '衣裳晒了一天，摸着都是暖的。'], ['担心', '少爷那件练功服袖口又磨破了，青禾晚上给您补。'], ['', '太阳一落风就凉，得赶在露水下来前收完。'], ['嗔', '这件是阿福的，又挂了个口子……这孩子。'], ['羞', '少爷的衣裳青禾都用竹叶熏过，您闻闻？']],
      '戌': [['羞', '灯下做针线，眼睛有点花……少爷别笑话。'], ['担心', '这么晚了，少爷怎么还不睡？'], ['羞', '这是给……还没绣好，不许看。'], ['', '夜里风凉，少爷回屋把窗关上。'], ['笑', '明早青禾早些起，给少爷熬粥。']],
      out: [['笑', '少爷也睡不着？……今晚的月亮真圆。'], ['', '坐吧，这石凳我擦过了。']],
    },
    maid2: {
      '卯': [['惊喜', '少爷早！您看您看，花苞上挂着露珠呢！'], ['认真', '清早浇花最好，水凉，根也喝得进去。'], ['', '嘘——别出声，有只小雀儿在啄花籽。'], ['得意', '小桃今天要把西院的花都巡一遍！'], ['笑', '绣球昨夜又开了两朵，比昨天大了一圈。']],
      '午': [['委屈', '（扇火扇得满脸是灰）少爷别看！……小桃脸上是不是全黑了？'], ['认真', '火候要稳，扇急了菜就糊。'], ['', '松伯的茶得用刚滚的水，凉一点他都喝得出来。'], ['得意', '青禾姐切菜，小桃烧火，阿福劈柴——咱们院里一个都不闲着！'], ['担心', '晌午日头毒，少爷在屋檐底下站着，别晒着。']],
      '酉': [['认真', '花盆得搬到檐下去，夜里露重，娇的花受不住。'], ['得意', '少爷帮小桃扶一下——哎呀不用不用，小桃搬得动！'], ['笑', '摘几枝插瓶，晚上少爷屋里就香香的。'], ['笑', '黄昏的花最好看，颜色都暖了。'], ['羞', '（小声）少爷，小桃看见青禾姐偷偷在绣东西……是给谁的呀？']],
      '戌': [['惊喜', '少爷！……小桃头发还没梳好呢，您先别看。'], ['笑', '这把梳子是青禾姐送的，桃木的。'], ['得意', '晚上梳一百下头发，第二天就顺顺的。'], ['', '少爷要喝甜汤吗？灶上还温着一碗。'], ['委屈', '小桃今天搬了二十盆花，胳膊都酸了。']],
      out: [['惊喜', '少爷快来！萤火虫！'], ['', '嘘——别吓跑它们。']],
    },
    servant: {
      '卯': [['困', '少、少爷早！（哈欠）……没有没有，阿福一点都不困！'], ['得意', '头一担水已经挑进缸了，还差两担。'], ['笑', '院门我扫过了，连门槛都擦了。'], ['笑', '早上的井水最甜，少爷要不要尝一口？'], ['委屈', '松伯说一日之计在于晨……阿福的晨都给扁担了。']],
      '午': [['大笑', '嘿——哈！少爷您看，一斧子两半！'], ['认真', '柴劈够了能烧三天，入冬前得再多备些。'], ['得意', '劈柴也是力气活，阿福胳膊上都有肉了，少爷摸摸？'], ['', '这斧子是松伯年轻时用的，比阿福年纪还大。'], ['担心', '少爷离远点，木屑会蹦。']],
      '酉': [['', '这根杆子比阿福还高，点灯得踮着脚。'], ['得意', '一盏、两盏……阿福一盏都不会落下。'], ['认真', '天黑之前灯都要点上，少爷回来才看得见路。'], ['笑', '松伯说灯笼要对着门，福气才进得来。'], ['担心', '少爷您站远点，火星子会掉下来。']],
      '戌': [['认真', '一、二、三……少爷别吵，阿福在算今天的柴钱。'], ['得意', '账本上的字都是阿福自己写的，少爷看，是不是比上回好看了？'], ['笑', '算盘珠子拨得响，松伯说听着就知道我没偷懒。'], ['大笑', '今天的账对上了！一文钱都不差！'], ['困', '少爷早些歇吧，阿福算完这页也睡。']],
      out: [['委屈', '唔！……少爷！阿福、阿福就吃一个！']],
    },
    steward: {
      '卯': [['笑', '少爷起得早。今儿天色好，东边一片云都没有。'], ['', '这些雀儿每天这个时辰来，跟算好了似的。'], ['点头', '人老了觉少，天不亮就醒了。正好替少爷看着院子。'], ['念叨', '早饭青禾在灶上热着，少爷练完剑就去吃。'], ['笑', '少爷小时候也爱蹲在这儿看雀儿，一看就是半个时辰。']],
      '午': [['笑', '（吹了吹茶）少爷来坐。这茶是小桃沏的，火候刚好。'], ['点头', '账上的米面还够吃半个月，少爷不用操心。'], ['念叨', '晌午歇一歇，下午练剑才有力气。'], ['笑', '宗主前几日来信问少爷近况，我回他：吃得下，睡得着，长个子了。'], ['', '这石桌是我搬来的，那年少爷才到我腰这么高。']],
      '酉': [['', '天要黑了。少爷今天练得如何？'], ['念叨', '那盏灯笼挂歪了，回头让阿福扶正。'], ['笑', '黄昏这一阵最好，凉快，也不黑。少爷陪我走两步？'], ['认真', '院里转一圈，门窗、灶火、井盖，样样都要看过才安心。'], ['念叨', '少爷累了就早些歇，别学宗主年轻时那样熬夜。']],
      '戌': [['笑', '少爷还没睡？我写几个字就歇。'], ['叹气', '人老了，字写得慢。'], ['点头', '灯油还够，少爷别惦记。'], ['', '明天的事我都记下了，少爷安心睡。']],
      out: [['', '少爷还没歇？我再巡一圈门窗。'], ['念叨', '夜里凉，少爷披件衣裳。'], ['笑', '提着灯走一圈，院里每个角落都亮一亮，睡得踏实。']],
    },
  };
  const line = (k, key) => { const L = (LINES[k] || {})[key]; if (!L || !L.length) return null; const [e, t] = pick(L); return [WHO[k] + (e ? '·' + e : ''), t]; };
  // 子夜：床边轻声
  const SLEEP = {
    maid1: ['青禾睡得很安稳，被角掖得整整齐齐。枕边搁着没绣完的绣绷。', '青禾翻了个身，迷迷糊糊地嘟囔了一句：「……少爷的衣裳……补好了……」'],
    maid2: ['小桃睡得四仰八叉，被子一半滑到了床沿下。', '小桃抱着枕头，嘴角还带着笑。大概梦见花开了。'],
    servant: ['阿福抱着枕头，呼噜打得一起一伏。', '阿福睡得正香，一只脚还伸在被子外头。'],
    steward: ['松伯睡得很轻，少爷一走近，他翻了个身，又睡着了。', '松伯的鞋整整齐齐摆在床边，老花镜压在账本上。'],
  };

  // ---------- 十二件小事 ----------
  const seen = n => !!(F().qz_ev || {})[n];
  const EV_WHO = { 1: 'maid2', 2: 'maid1', 3: 'steward', 4: 'maid2', 5: 'servant', 6: 'servant', 7: 'maid1', 8: 'maid2', 9: 'servant', 10: 'steward' };
  const markSeen = n => { const f = F(); f.qz_ev = f.qz_ev || {}; if (f.qz_ev[n]) return; f.qz_ev[n] = 1; const c = Object.keys(f.qz_ev).length; if (EV_WHO[n] && window.QZ_BOND) setTimeout(() => QZ_BOND(EV_WHO[n], 2), 2400);
    try { playSnd('ui_confirm', .5); } catch (e) {} toast(c >= 12 ? '青竹小院 · 十二件小事，都看过了' : '青竹小院 · 小事 ' + c + ' / 12', 2200); };
  // 作者 11-08：剧情里不放插画（只用立绘对话）—— R144 这十二张插画的用处是青竹一带的载入图（见文件末尾 QZ_LOAD_ART）
  async function story(n, fn) {
    world.locked = true; if (world.player) world.player.moving = false;
    try { await fn(async () => {}); markSeen(n); }
    finally { world.locked = false; }
  }
  const healAll = (mpOnly) => { try { const h = S.hero; if (!mpOnly) h.hp = h.maxhp; h.mp = h.maxmp; if (!mpOnly && typeof partyHealAll === 'function') partyHealAll(); } catch (e) {} };
  const cat = () => (window.R139_CATNAME ? R139_CATNAME() : '小猫');

  const EV = {
    1: () => story(1, async show => {
      await narrate('小桃蹲在花圃前，忽然朝少爷招手，神神秘秘地伸出一根指头。');
      await show();
      await say('侍女小桃·惊喜', '少爷您看——花瓣上滚下来的，一颗露珠！');
      await say('侍女小桃·笑', '它在指尖上能待好一会儿呢，太阳一照就没了。');
      await say('叶孤星', '……像一颗小小的灵珠。');
      await say('侍女小桃·得意', '那少爷许个愿吧！小桃听人说，清早的露水能把愿望捎上天。');
      const i = await choose('许个什么愿？', ['愿院里的人都平平安安', '愿小桃的花年年都开', '（不说出来，偷偷许）']);
      if (i === 0) await say('侍女小桃·感动', '……少爷许的愿，里头也有小桃呀。');
      else if (i === 1) await say('侍女小桃·大笑', '那它们一定开！小桃天天浇，开到少爷看腻为止！');
      else await say('侍女小桃·嗔', '少爷小气！……不过说出来就不灵了，那您可要好好许。');
      await narrate('露珠在她指尖上晃了晃，映着一点晨光，轻轻滚落进花心里。');
    }),
    2: () => story(2, async show => {
      await narrate('推开门，门口的小竹凳上放着一只铜盆，温水上还飘着一缕热气，旁边叠着一条晒过的布巾。');
      await show();
      await narrate('水温刚好。也不知道是谁，算准了少爷起床的时辰。');
      await say('星旋', '（我赌一壶酒，是那个叫青禾的丫头。）');
      healAll(true); await narrate('叶孤星洗了把脸，神清气爽。');
    }),
    3: () => story(3, async show => {
      await say('松伯·笑', '少爷坐。……说起来，您小时候也在这石桌边上偷过东西吃。');
      await say('叶孤星', '有吗？');
      await show();
      await say('松伯·大笑', '那年中秋，供桌上的果子少了一盘。宗主找了一圈，最后在少爷被窝里搜出来七个桃核。');
      await say('松伯·笑', '宗主板着脸问您，您说——是星星饿了，替它们吃的。');
      await say('叶孤星', '……');
      await say('星旋', '（噗。那会儿我还没在你身边呢，别赖我。）');
      await say('松伯·点头', '宗主当时没忍住，转过身去笑了好半天。后来每年中秋，供桌上都多摆一盘桃。');
    }),
    4: () => story(4, async show => {
      await narrate('一阵风忽然卷过西院，小桃别在襟上的手帕被吹了起来，一路飘上竹梢挂住了。');
      await say('侍女小桃·担心', '啊！我的手帕——那是娘绣的！');
      await fxHanky();
      await narrate('叶孤星并指一划，一道细细的剑气掠过竹梢——竹叶没落一片，手帕却轻飘飘地落了下来，正好落进他手心。');
      await show();
      await say('侍女小桃·感动', '少、少爷……！');
      await say('侍女小桃·羞', '谢谢少爷……小桃以后一定把它缝牢在衣襟上。');
      await say('星旋', '（剑气收得不错。——比你平时削竹子准多了。）');
    }),
    5: () => story(5, async show => {
      await narrate('阿福踮着脚，把最后一盏灯笼挑亮。暖黄的光一下子照亮了他的脸。');
      await show();
      await say('小厮阿福·大笑', '少爷！都点上了！您看，从院门一路亮到您屋门口。');
      await say('小厮阿福·得意', '松伯说，灯要一盏一盏点，这样少爷不管多晚回来，都能顺着灯找到家。');
      await say('叶孤星', '……嗯。辛苦了，阿福。');
      await say('小厮阿福·羞', '不辛苦！阿福最喜欢点灯了。');
    }),
    6: () => story(6, async show => {
      await narrate('厨房里没点灯，蒸笼边蹲着一个人影，腮帮子鼓得圆圆的。');
      await say('小厮阿福·惊喜', '唔！！（少爷！）');
      await show();
      await say('小厮阿福·委屈', '阿福、阿福就吃了一个……晚上劈柴饿得慌……');
      await narrate('阿福犹豫了一下，把手里那个掰成两半，大的那半硬塞进少爷手里。');
      await say('小厮阿福·笑', '少爷也吃！吃了就是同伙了，不许告诉松伯！');
      await say('星旋', '（……行吧，同伙。）');
      healAll(false); toast('半个肉包子，还热乎——气血、灵力回满了', 2000);
    }),
    7: () => story(7, async show => {
      await narrate('西院石桌边，青禾一个人坐着，绣绷搁在一旁，抬头看着月亮。');
      await say('侍女青禾·惊喜', '少爷也没睡呀。');
      await show();
      await say('侍女青禾', '我娘是山下的绣娘。小时候，她总在这样的月亮底下赶活，我就趴在她膝头数针脚。');
      await say('侍女青禾', '后来娘眼睛不好了，就把我送上山来。她说，天剑宗的少爷心善，跟着他不会受委屈。');
      await say('侍女青禾·感动', '……娘说得对。');
      await say('叶孤星', '下回下山，我陪你回去看看她。');
      await say('侍女青禾·感动', '少爷……');
      await say('侍女青禾·笑', '那青禾得赶紧绣个新香囊给娘捎去——就说，是少爷送的。');
    }),
    8: () => story(8, async show => {
      await narrate('井边的草丛里，萤火虫一闪一闪。小桃双手拢成一盏小灯笼，蹑手蹑脚地走过来。');
      await say('侍女小桃·惊喜', '少爷，伸手——');
      await show();
      await narrate('她把手轻轻打开，一点微光落进少爷掌心，停了一停，又慢悠悠地飞走了。');
      await say('侍女小桃·笑', '它在少爷手里亮了好久！小桃听说，萤火虫只肯停在心善的人手上。');
      await say('叶孤星', '这是你编的吧。');
      await say('侍女小桃·得意', '嘿嘿……被少爷发现了。可它就是停了嘛。');
    }),
    9: () => story(9, async show => {
      await narrate('阿福抱着枕头睡得正香，嘴唇动了动。');
      const b = dream('娘……我在天剑宗……过得可好了……');
      try { await new Promise(r => setTimeout(r, 1600)); } finally { b(); }
      await show();
      await say('小厮阿福', '（梦话）娘……我在天剑宗过得可好了……少爷对我可好了……');
      await narrate('叶孤星站了一会儿，替他把滑下来的被子拉上去，轻轻掩上了门。');
      await say('星旋', '（这小子……）');
    }),
    10: () => story(10, async show => {
      await narrate('管事房的灯还亮着。松伯戴着老花镜，伏在案上一笔一画地写信。');
      await say('松伯·惊喜', '少爷？这么晚了还没睡。');
      await show();
      await say('松伯', '给宗主的信。宗主在外头，心里惦记少爷，我每个月写一封。');
      await narrate('信纸上的字端端正正：「少爷近日饭量见长，夜里练剑至二更……前日替阿福挑水，替小桃摘花……」');
      await say('松伯·笑', '写的都是些鸡毛蒜皮。可宗主就爱看这些。');
      await say('叶孤星', '……松伯，替我也写一句吧。就说，我很好。');
      await say('松伯·感动', '好，好。这句我写在最前头。');
    }),
    11: () => story(11, async show => {
      await narrate('夜深了，院里只剩月光。叶孤星体内，星旋轻轻动了动。');
      await say('星旋', '（喂，睡不着就别装了。上去坐坐？）');
      await narrate('叶孤星足尖一点，落在居室的屋脊上。一道淡淡的星光从他身边浮出来，化作少年的模样，挨着他坐下。');
      await show();
      await say('星旋', '（你们这院子，晚上倒是安静。）');
      await say('叶孤星', '嗯。小时候睡不着，我就爬上来数星星。');
      await say('星旋', '（数到多少了？）');
      await say('叶孤星', '……从来没数完过。');
      await say('星旋', '（那以后我陪你数。反正我也不睡觉。）');
    }),
    12: () => story(12, async show => {
      await narrate('墙头上坐着一个小小的影子，尾巴绕在脚边，一动不动地望着月亮。');
      await show();
      await narrate('是' + cat() + '。月亮又大又圆，它就那样蹲着，像是在等什么人。');
      await narrate('少爷轻轻叫了一声，它回过头，「喵」了一声，又转回去看月亮了。');
      await say('星旋', '（……猫也会想家吗。）');
    }),
  };
  // 手帕飘落 + 剑气一闪（全屏小特效）
  async function fxHanky() {
    const t0 = performance.now();
    const ov = { draw() { const t = (performance.now() - t0) / 1000; ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, 0, W, H);
      const ig = IDX.sword_glint_6f, ih = IDX.hanky_fall_6f, im = img('prop');
      if (im && ig && t < .6) { const f = Math.min(5, Math.floor(t * ig.fps)); ctx.globalCompositeOperation = 'screen'; ctx.drawImage(im, ig.x + f * ig.w, ig.y, ig.w, ig.h, 640 - 288, 180, 576, 288); ctx.globalCompositeOperation = 'source-over'; }
      if (im && ih && t > .25) { const f = Math.min(5, Math.floor((t - .25) * ih.fps)); ctx.drawImage(im, ih.x + f * ih.w, ih.y, ih.w, ih.h, 640 - 160, 200 + Math.min(1, (t - .25) / .9) * 160, 320, 300); }
      ctx.restore(); } };
    S.overlay.push(ov); try { playSnd('sfx_sword', .5); } catch (e) {}
    await new Promise(r => setTimeout(r, 1300)); const i = S.overlay.indexOf(ov); if (i >= 0) S.overlay.splice(i, 1);
  }
  // 梦话气泡（屏幕上方）
  function dream(text) {
    const t0 = performance.now(); const ov = { draw() { const d = IDX.dream_bubble, im = img('prop'); const k = Math.min(1, (performance.now() - t0) / 300);
      ctx.save(); ctx.globalAlpha = k; const x = 640 - 270, y = 210; if (im && d) ctx.drawImage(im, d.x, d.y, d.w, d.h, x, y, 540, 258);
      ctx.fillStyle = '#5a4a3a'; ctx.font = `26px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 640, y + 96); ctx.restore(); } };
    S.overlay.push(ov); return () => { const i = S.overlay.indexOf(ov); if (i >= 0) S.overlay.splice(i, 1); };
  }

  // ---------- 原来的人：选了时辰就让位 ----------
  const ORIG = {};   // 原来白天 / 夜里的那几位（对话里的小任务还要从他们那儿走）
  const hideWhenOn = n => { const c0 = n.cond; n.cond = function () { if (ON()) return false; return !c0 || c0.apply(this, arguments); }; };
  setTimeout(() => {
    for (const id of Object.keys(TMAPS)) if (QZ(id)) for (const n of (TMAPS[id].npcs || [])) {
      if (n.q162) continue;
      const k = n.r135e || ''; if (!k) continue;
      if (n._r135day && id === COURT) { ORIG[k + '_day'] = n; hideWhenOn(n); }
      else if (n._r135night) { ORIG[k + '_night'] = n; hideWhenOn(n); }
      else if (k === 'steward') { ORIG['steward_' + (id === COURT ? 'day' : 'room')] = n; hideWhenOn(n); }
    }
  }, 0);
  const origTalk = (k, part, a) => { const n = ORIG[k + '_' + part]; return n && typeof n.talk === 'function' ? n.talk(a) : null; };

  // ---------- 新的人：每个时辰一套（同一个人每张图上都有一个定义，按时辰决定在不在）----------
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const DEFS = [];
  function addDef(key, map, who) {
    const d = TMAPS[map]; if (!d) return; d.npcs = d.npcs || [];
    const n = { key: 'none', name: WHO[who] || '小猫', c: 0, r: 0, h: who === 'cat' ? 44 : 108, wander: false, q162: { key, who, map }, cond: () => !!curPlan(n) };
    if (who === 'servant') n.r139 = 'servant';   // 水缸边松伯念叨阿福那段要找得到他
    n.talk = a => talkTo(who, a, n);
    d.npcs.push(n); DEFS.push(n); return n;
  }
  function curPlan(n) { if (!ON()) return null; const q = n.q162, s = shi(); const pl = q.key !== q.who ? (PLAN[s] || {})[q.key] : planOf(q.who, s); return pl && pl.map === q.map ? pl : null; }
  const CAT_GLOW = { map: COURT, at: Y(300, 1462), steps: [{ act: 'cat_glow_6f', t: 1e9, face: -1 }] };
  const catPlan = () => (shi() === '戌' && F().qz_out === 'maid2' ? CAT_GLOW : (PLAN[shi()] || {}).cat);
  for (const who of ['maid1', 'maid2', 'servant', 'steward']) {
    const maps = new Set([COURT, RM[who], RM.kitchen]); for (const m of maps) addDef(who, m, who);
  }
  addDef('maid1k', RM.kitchen, 'maid1'); addDef('maid2k', RM.kitchen, 'maid2');
  for (const n of DEFS) if (n.q162.who === 'steward') n.mark = () => ON() && !F().steward_met;
  const catNpc = () => (TMAPS[COURT].npcs || []).find(n => n.r139cat);

  // ---------- 子夜：床上的人 + 床边轻声 ----------
  const BEDS = { maid1: ['maid1_sleep_night_4f', null, 538, [262, 452]], maid2: ['maid2_sleep_night_4f', 'maid2_kick_night_4f', 538, [262, 452]], servant: ['servant_sleep_night_4f', 'servant_dream_night_4f', 399.5, [282, 446]], steward: ['steward_sleep_night_4f', null, 407, [366, 436]] };
  const asleep = k => ON() && shi() === '子' && !(k === 'steward' && F().qz_letter) && AWAKE() !== k;
  for (const k in BEDS) { const m = RM[k], d = TMAPS[m]; if (!d) continue; d.npcs = d.npcs || []; const [c, r] = P(...BEDS[k][3]);
    d.npcs.push({ key: 'none', name: WHO[k] + '（睡着了）', c, r, h: 90, hidden: true, wander: false, q162bed: k, cond: () => asleep(k), talk: () => bedTalk(k) }); }
  async function bedTalk(k) {
    if (k === 'servant' && !seen(9)) return EV[9]();
    if (k === 'servant' && !F().qz_dream) { F().qz_dream = 1; const b = dream(pick(DREAMS)); try { await new Promise(r => setTimeout(r, 2200)); } finally { b(); }
      await narrate('阿福咂了咂嘴，翻了个身，又打起了呼噜。'); const f = F(); f.qz_hid = f.qz_hid || {}; const first = !f.qz_hid['servant:dream']; f.qz_hid['servant:dream'] = 1; bond('servant', 1, !first); return; }
    await narrate(pick(SLEEP[k]));
    if (k === 'maid2') { const i = await choose('', ['替她把被子盖好', '轻轻退出去']); if (i === 0) { BEDK.maid2 = -99; await narrate('叶孤星把被子拉上来，掖了掖被角。小桃咂了咂嘴，翻身接着睡。'); } }
  }
  const BEDK = { maid2: 0, servant: 0 };

  // ---------- 说话 ----------
  async function talkTo(who, a, n) {
    const s = shi(), f = F(), q = n.q162, out = s === '戌' && f.qz_out === who && q.map === (OUT[who] || {}).map;
    const day = s === '卯' || s === '午' || s === '酉';
    if (s === '子' && AWAKE() === who) { await say(WHO[who] + '·笑', who === 'maid2' ? '少爷快回去睡吧，小桃也要睡啦……明天见！' : '夜深了，少爷早些歇着。青禾把灯熄了就睡。'); return; }
    { const qid = questTalk(who); if (qid) return qRun(qid); }   // 支线这一步要找他
    // 1) 这个时辰的小事
    if (who === 'maid2' && s === '卯' && !seen(1)) return EV[1]();
    if (who === 'steward' && s === '午' && !seen(3)) return EV[3]();
    if (who === 'maid2' && s === '酉' && !seen(4)) return EV[4]();
    if (who === 'servant' && s === '酉' && !seen(5) && Object.keys(DAY.lit).length >= 3) return EV[5]();
    if (out && OUT[who].ev && !seen(OUT[who].ev)) return EV[OUT[who].ev]();
    if (who === 'steward' && s === '子' && f.qz_letter && !seen(10)) return EV[10]();
    // 2) 原来的小任务（挑水、种花、香囊、教写字……）还没做完，先走原来的
    if (day && q.map === COURT) {
      if ((who === 'servant' && !f.qz_afu_help) || (who === 'maid2' && !f.qz_bed) || (who === 'maid1' && !f.qz_qh1) || (who === 'steward' && f.steward_met && !f.qz_song)) { const r = origTalk(who, who === 'steward' ? 'day' : 'day', a); if (r) return r; }
    }
    if (s === '戌' && !out && q.map === RM[who]) {
      if ((who === 'maid1' && f.qz_afu_help && f.qz_bed && !f.qz_sachet) || (who === 'servant' && !f.qz_afu_write) || (who === 'maid2' && f.qz_bed && !f.qz_xt_vase)) { const r = origTalk(who, 'night', a); if (r) return r; }
    }
    // 2.5) 院里的秘密（要跟他说话才发生的那几件）
    { const te = pending('talk', who); if (te) return runEv(te); }
    chatBond(who);
    // 有心事：先说一句，问问他
    if (mood(who) === '忧' && !((f.qz_comfort || {})[who]) && ON()) { const ml = MOODL[who]['忧']; await say(WHO[who] + '·' + ml[0], ml[1]); await comfort(who); if (who !== 'steward') return; }
    // 3) 松伯：传送玉符照旧（头一回见面那段也照旧）
    if (who === 'steward' && !f.steward_met) { const r = origTalk('steward', q.map === COURT ? 'day' : 'room', a); if (r) return r; }
    if (who === 'steward') {
      const ml = MOODL.steward[mood('steward')], l = ml && Math.random() < .4 ? [WHO.steward + '·' + ml[0], ml[1]] : line('steward', out ? 'out' : s); if (l) await say(l[0], l[1]);
      const g = canGift('steward'), led = f.qz_sew || f.qz_copy || f.qz_news || f.qz_fund_hint || f.qz_fund, opts = ['传送到去过的地方', ...(g ? ['送点吃的'] : []), ...(led ? ['院里的账（' + fund() + ' 灵石）'] : []), '没事了'];
      const i = await choose('松伯', opts);
      if (i === 0) { const r = origTalk('steward', q.map === COURT ? 'day' : 'room', a) || origTalk('steward', 'day', a); if (r) return r; }
      const pickd = opts[i] || ''; if (pickd === '送点吃的') await gift('steward'); else if (/^院里的账/.test(pickd)) await ledger();
      return;
    }
    // 4) 这个时辰的家常话（偶尔走原来那套，原来的选项还能用）
    if (day && q.map === COURT && Math.random() < .25) { const r = origTalk(who, 'day', a); if (r) return r; }
    if (s === '戌' && who === 'maid1' && JOBS().maid1 && q.map === RM.maid1) { await say('侍女青禾·认真', '（青禾低头缝着少爷的' + ITEM_DB[JOBS().maid1.id].name + '）……少爷别站着，坐。再几针就好。'); return afterTalk(who); }
    if (s === '戌' && who === 'maid2' && JOBS().maid2 && q.map === RM.maid2) { await say('侍女小桃·认真', '（桌上摊着抄了一半的' + ITEM_DB[JOBS().maid2.id].name + '）嘘——小桃在数字数，别打岔！'); return afterTalk(who); }
    const ml = MOODL[who] && MOODL[who][mood(who)], l = ml && ON() && Math.random() < .4 ? [WHO[who] + '·' + ml[0], ml[1]] : line(who, out ? 'out' : s); if (l) await say(l[0], l[1]);
    await afterTalk(who);
  }
  // 小猫：子夜墙头看月亮 → 小事；平时照旧（喂它、起名字）
  { const cn = catNpc(); if (cn) { const t0 = cn.talk; cn.talk = async a => {
    if (ON() && shi() === '子') { if (!seen(12)) return EV[12](); return narrate(cat() + '蹲在墙头，尾巴一甩一甩，回头看了少爷一眼，又转回去看月亮。'); }
    if (ON() && shi() === '酉' && !F().cat_met) return t0(a);
    return t0(a);
  }; } }

  // ---------- 走路 / 动作 ----------
  const cellPx = (T, c, r) => [(c + .5) * T.cs, (r + .5) * T.cs];
  function plan(a, T, to) {
    try { const cs = T.cs, p = findPath(T, Math.floor(a.x / cs), Math.floor(a.y / cs), Math.floor(to[0] / cs), Math.floor(to[1] / cs));
      if (!p || !p.length) return [to.slice()]; const out = []; for (let i = 2; i < p.length; i += 2) out.push(cellPx(T, p[i][0], p[i][1])); out.push(to.slice()); return out;
    } catch (e) { return [to.slice()]; }
  }
  function enter(a, T) {
    const q = a._q, st = q.pl.steps[q.i % q.pl.steps.length]; q.st = st; q.t = 0; q.t0 = now(); q.path = null; a.moving = false;
    if (st.loop != null) { q.i = st.loop; return enter(a, T); }
    if (st.go) q.path = plan(a, T, st.go);
    if (st.hide) { q.home = [a.x, a.y]; a.x = -99999; a.y = -99999; }
    if (st.face) q.face = st.face;
    if (st.lit) setTimeout(() => { DAY.lit[st.lit] = now(); }, 1400);
  }
  function stepDone(a, T) { const q = a._q, st = q.st; if (st.hide && q.home) { a.x = q.home[0]; a.y = q.home[1]; q.home = null; } if (st.fn) try { st.fn(); } catch (e) {}
    if (st.fill && window.R139_VAT) R139_VAT.add(1); q.i++; enter(a, T); }
  if (typeof tileUpdate === 'function') tileUpdate = (o => function (dt) {
    o.apply(this, arguments);
    try {
      if (!ON() || !world.actors || !world.map || !world.map.T) return;
      const T = world.map.T, p = world.player, busy = (typeof choice !== 'undefined' && choice);
      for (const a of world.actors) { const n = a.npc; if (!n) continue;
        const isCat = n.r139cat && world.mapName === COURT;
        if (!n.q162 && !isCat) continue;
        const pl = isCat ? catPlan() : curPlan(n); if (!pl) continue;
        if (!a._q || a._q.pl !== pl) { a._q = { pl, i: 0, face: -1, oy: pl.sy ? pl.at[1] - pl.sy : 0 }; const at = pl.at; a.x = at[0]; a.y = pl.sy || at[1]; if (isCat) a._cat = { st: 'q162', t0: 0 }; enter(a, T); }
        const q = a._q, st = q.st;
        if (a._a142) continue;
        const talking = a.talking || (typeof dialog !== 'undefined' && dialog && dialog.who && String(dialog.who).split('·')[0] === n.name) || busy;
        if (talking) { a.moving = false; continue; }
        if (st.go) {
          const tgt = q.path && q.path[0]; if (!tgt) { stepDone(a, T); continue; }
          if (p && Math.hypot(p.x - a.x, p.y - a.y) < 44) { a.moving = false; continue; }
          const dx = tgt[0] - a.x, dy = tgt[1] - a.y, d = Math.hypot(dx, dy), sp = (isCat ? 40 : st.w ? 50 : 56) * Math.min(dt, .05);
          if (d <= sp) { a.x = tgt[0]; a.y = tgt[1]; q.path.shift(); } else { a.x += dx / d * sp; a.y += dy / d * sp; }
          a.moving = true; q.dx = dx; q.dy = dy; if (Math.abs(dx) > .3) q.face = dx > 0 ? 1 : -1;
        } else { a.moving = false; q.t += dt; if (q.t >= (st.t || st.wait || st.hide || 1)) stepDone(a, T); }
      }
      // 子夜：小桃踢被、阿福翻身
      if (shi() === '子') { const t = now(); for (const k of ['maid2', 'servant']) if (world.mapName === RM[k] && t - BEDK[k] > 18 + Math.random() * 30) BEDK[k] = t; }
      // 卯时第一次从居室出来：门口的温水
      if (world.mapName === COURT && shi() === '卯' && !seen(2) && FROM_ROOM && DAY.basin && !world.locked && !dialog && !busy) { FROM_ROOM = false; EV[2](); }
      // 子夜第一次在院里：一人一灵上屋脊看星
      if (world.mapName === COURT && shi() === '子' && !seen(11) && !world.locked && !dialog && !busy) { NIGHT_T += dt; if (NIGHT_T > 2.5) { NIGHT_T = -1e9; EV[11](); } }
    } catch (e) { console.warn('r162 life', e); }
  })(tileUpdate);
  let FROM_ROOM = false, NIGHT_T = 0;

  // ---------- 画 ----------
  if (typeof drawActorT === 'function') drawActorT = (o => function (a, t) {
    try {
      if (a && a._q162prop) { ctx.save(); undoAZ(a); a._q162prop(a); ctx.restore(); return; }
      if (a && a.npc && a.npc.q162book) { ctx.save(); undoAZ(a); prop('ledger', 0, a.x - 6, a.y - 92, .5); ctx.restore(); return; }   // 桌上摊开的《青竹小记》
      const n = a && a.npc;
      if (n && ON() && a._q && !a._a142 && (n.q162 || n.r139cat)) { const y0 = a.y; a.y += a._q.oy || 0; let ok = false; try { ok = drawQ(a, n); } finally { a.y = y0; } if (ok) return; }
    } catch (e) {}
    return o.apply(this, arguments);
  })(drawActorT);
  function drawQ(a, n) {
    const q = a._q, st = q.st || {}, p = world.player, isCat = !!n.r139cat;
    const talking = a.talking || (typeof dialog !== 'undefined' && dialog && dialog.who && String(dialog.who).split('·')[0] === n.name);
    let face = q.face || -1; if (talking && p) face = p.x > a.x ? 1 : -1;
    if (st.go) {
      const dx = q.dx || 0, dy = q.dy || 0;
      if (isCat) { shadow(a.x, a.y - 1, 15, 5, .22); return act('cat_walk_left_6f', a.moving ? Math.floor(now() * 8) % 6 : 0, a.x, a.y, dx > 0, CATSC); }
      if (st.w === 'patrol') { shadow(a.x, a.y); return act('steward_patrol_6f', Math.floor(now() * 6) % 6, a.x, a.y, dx > 0); }
      if (st.w) { const [id, fl] = carryId(st.w, dx, dy); shadow(a.x, a.y); return act(id, a.moving ? Math.floor(now() * 7) % 6 : 1, a.x, a.y, fl); }
      shadow(a.x, a.y); return walkDraw(a, n.q162.who, talking && p ? p.x - a.x : dx, talking && p ? p.y - a.y : dy, a.moving);
    }
    if (st.act) {
      const d = IDX[st.act]; if (!d) return false;
      const f = st.once || d.loop === false ? Math.min(d.n - 1, Math.floor((now() - q.t0) * d.fps)) : Math.floor((now() - q.t0) * d.fps + (a.x * .01 % 1) * d.n) % d.n;
      if (isCat) { if (st.act !== 'cat_silhouette_4f') shadow(a.x, a.y - 1, 15, 5, .22); return act(st.act, f, a.x, a.y, face > 0, CATSC); }
      shadow(a.x, a.y); return act(st.act, f, a.x, a.y, face > 0);
    }
    // 歇着：带东西的停着拿东西，其余站着
    if (isCat) return act('cat_lick_paw_6f', 0, a.x, a.y, face > 0, CATSC);
    shadow(a.x, a.y);
    const prev = q.pl.steps[(q.i - 1 + q.pl.steps.length) % q.pl.steps.length];
    if (prev && prev.w && prev.w !== 'patrol' && st.wait && !st.fn) { const [id] = carryId(prev.w, 0, 1); return act(id, 1, a.x, a.y, false); }
    if (prev && prev.w === 'steward_lantern') return act('steward_lantern_down_6f', 1, a.x, a.y, false);
    return walkDraw(a, n.q162.who, talking && p ? p.x - a.x : face, talking && p ? p.y - a.y : 1, false);
  }

  // ---------- 道具（按脚底 y 和人物、物件一起排序）----------
  // 每个道具是一个没有 npc 的「假人」：进图时塞进 world.actors，换图自然清掉
  const propA = (x, y, sy, draw) => ({ x, y: sy != null ? sy : y, _px: x, _py: y, _q162prop: draw, moving: false });
  function propsFor(m, s) {
    const L = [];
    const P1 = (id, x, y, sc, sy) => L.push(propA(x, y, sy, a => { prop(id, null, a._px, a._py, sc); }));
    if (m === COURT) {
      if (s === '卯') { L.push(propA(1012, 574, null, a => { if (!DAY.basin) return; prop(seen(2) ? 'wash_stool' : 'warm_wash', null, a._px, a._py, .42); }));
        L.push(propA(800, 612, null, a => birds(a))); }
      if (s === '午') { P1('tea_tray', ...TABLE, .5, 1414); L.push(propA(TABLE[0] - 34, TABLE[1] + 2, 1415, a => { if (DAY.noodles) prop('noodles', 0, a._px, a._py, .42); }));
        P1('woodpile', ...Y(566, 1200), .55); L.push(propA(...Y(760, 1196), null, a => butterfly(a))); }
      if (s === '戌' && F().qz_out === 'maid1') P1('hoop', TABLE[0] - 20, TABLE[1], .48, 1414);
      if (s === '戌' && F().qz_out === 'maid2') L.push(propA(...Y(300, 1420), 1500, a => { prop('firefly_cluster', Math.floor(now() * 5), a._px, a._py, .9, .9); }));
      if (s === '戌' || s === '子') P1('door_lamp', 1166, 570, .42);
    }
    if (m === RM.kitchen && s === '戌' && F().qz_out === 'servant') P1('bun_basket', 182, 520, .5, 600);
    // 床上睡着的人
    for (const k in BEDS) if (m === RM[k] && asleep(k)) { const [id, alt, sy] = BEDS[k], B = IDX[id];
      L.push(propA(B.o[0] + 128, B.o[1] + 128, sy, a => { const im = img('bed'); if (!im) return; let use = B, f = Math.floor(now() * B.fps) % B.n;
        if (alt && BEDK[k] > 0 && now() - BEDK[k] < IDX[alt].n / IDX[alt].fps) { use = IDX[alt]; f = Math.min(use.n - 1, Math.floor((now() - BEDK[k]) * use.fps)); }
        ctx.drawImage(im, f * 256, use.r * 256, 256, 256, use.o[0], use.o[1], 256, 256); })); }
    return L;
  }
  // 廊下的雀儿：少爷走近就扑棱棱飞走
  const BIRD = { flyT: -99 };
  function birds(a) {
    const sv = (world.actors || []).find(x => x.npc && x.npc.q162 && x.npc.q162.who === 'steward');
    const feeding = sv && sv._q && sv._q.st && sv._q.st.birds; const p = world.player, t = now();
    if (p && Math.hypot(p.x - a._px, p.y - a._py) < 90 && t - BIRD.flyT > 25) BIRD.flyT = t;
    const ft = t - BIRD.flyT;
    if (ft < 1.2) { prop('fly', Math.floor(ft * 7), a._px - ft * 60, a._py - ft * 90, .45); return; }
    if (ft < 25 || !feeding) return;
    prop('peck', Math.floor(t * 6), a._px, a._py, .42); prop('peck', Math.floor(t * 6) + 3, a._px + 34, a._py + 8, .38, 1, true);
  }
  function butterfly(a) { const t = now(); prop('butterfly', Math.floor(t * 6), a._px + Math.sin(t * .9) * 40, a._py - 40 + Math.sin(t * 1.7) * 14, .55); }

  // ---------- 入夜：院里点满小灯；子夜：只剩稀疏几盏 ----------
  // 作者 11-08：入夜天黑了，灯要亮一点 —— 青竹小院装饰得亮亮的，很多漂亮的小灯；到了子时才是稀疏的灯火。
  // GLOW：院里原有的石灯、灯杆、檐灯的光心；HANG：屋檐下新挂的小灯笼（R144 檐灯）。z 标记子夜还亮着的那几盏。
  const GLOW = [[202, 190], [508, 190], [204, 499], [508, 499], [1466, 589, 1], [851, 595, 1], [202, 822], [534, 824], [617, 1080], [1500, 1127],
    [816, 420], [1360, 417, 1], [1490, 427], [1890, 950], Y(160, 407), Y(1430, 407), Y(608, 1084, 1), Y(1210, 917), Y(1560, 1057), Y(244, 1005), Y(426, 1005, 1)];
  const HANG = [];
  { const row = (x0, x1, y, n, z) => { for (let i = 0; i < n; i++) HANG.push([x0 + (x1 - x0) * (n === 1 ? .5 : i / (n - 1)), y, z && z.includes(i) ? 1 : 0]); };
    row(800, 1380, 306, 6, [2]); row(1530, 1870, 368, 4); row(1550, 1890, 905, 4); row(170, 470, 1118, 3);
    row(...[230, 570].map(x => x - OX), 332, 4, [1]); row(...[810, 1150].map(x => x - OX), 332, 4); row(...[690, 1030].map(x => x - OX), 1012, 4); }
  function nightLights(s, t, A) {
    const mid = s === '子', fl = i => .9 + Math.sin(t * 5.3 + i * 1.7) * .05 + Math.sin(t * 11 + i) * .03;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const glow = (x, y, r, a, i) => { const g = ctx.createRadialGradient(x, y, 2, x, y, r); g.addColorStop(0, `rgba(255,206,130,${a * fl(i)})`); g.addColorStop(.35, `rgba(255,170,90,${a * .45 * fl(i)})`); g.addColorStop(1, 'rgba(255,150,70,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
    GLOW.forEach(([x, y, z], i) => { if (mid && !z) return; glow(x, y, mid ? 80 : 92, mid ? .32 : .42, i); glow(x, y + 60, mid ? 90 : 110, mid ? .06 : .1, i); });   // 作者 11-08：灯是点缀，不能满屏烛光看不清地图
    HANG.forEach(([x, y, z], i) => { if (mid && !z) return; glow(x, y - 14, mid ? 46 : 54, mid ? .3 : .4, i + 40); });
    ctx.restore();
    HANG.forEach(([x, y, z], i) => { if (mid && !z) return; prop('lantern_lit', 0, x, y + Math.sin(t * 1.3 + i) * 1.2, .32); });
    if (!mid) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; GLOW.forEach(([x, y], i) => { if (i % 3 === 0) A('eaves_halo_6f', x, y, .42, .4); }); ctx.restore(); }
  }

  let WEST_NM = 'rgb(168,178,196)', WEST_NA = 'rgba(34,54,124,.26)';
  // ---------- 光影：时辰叠层 + 小动画 ----------
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (o => function (T, cam, now0) {
    o.apply(this, arguments);
    try {
      // 作者 11-08（bug）：夜里西院比主院亮一截，中间一条竖缝 —— 主院有 Codex 夜景光层，西院（R136 扩建）只压了一层暗色。西院补上同样的夜色
      if (world.mapName === COURT && night() && T.x0 < 0) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = WEST_NM; ctx.fillRect(T.x0, 0, -T.x0, T.mh);
        ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = WEST_NA; ctx.fillRect(T.x0, 0, -T.x0, T.mh); ctx.restore(); }
      if (!ON()) return; const m = world.mapName, s = shi(), t = now();
      if (m === COURT) {
        const L = LIGHTS[s]; if (L) for (const k of L) { const im = img('l_' + k); if (!im) continue; const d = IDX[k]; ctx.drawImage(im, /^west/.test(k) ? -OX : 0, 0, d.w, d.h); }
        if (s === '戌' || s === '子') { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = s === '子' ? 'rgb(162,168,202)' : 'rgb(226,226,240)'; ctx.fillRect(T.x0 || 0, 0, T.mw - (T.x0 || 0), T.mh); ctx.restore(); }
        const A = (id, x, y, sc, al) => { const d = IDX[id]; if (d) prop(id, Math.floor(t * d.fps), x, y, sc, al); };
        if (s === '卯') { A('dawn_fog_8f', ...Y(190, 1400), 1.1, .85); A('dawn_fog_8f', 1130, 1080, 1.3, .7); A('dawn_fog_8f', ...Y(800, 760), 1.4, .5); }
        if (s === '酉') A('dusk_hearth_smoke', ...Y(465, 769), 1, .9);
        if (s === '戌') { A('fireflies_8f', ...Y(200, 1330), 1, 1); A('fireflies_8f', ...Y(1400, 900), 1, .9); A('fireflies_8f', 1130, 1040, 1.1, .9); }
        if (s === '戌' || s === '子') nightLights(s, t, A);
        if (s === '戌' || (s === '酉' && Object.keys(DAY.lit).length)) { ctx.save(); ctx.globalCompositeOperation = 'lighter';
          for (const k in LANT) { if (s === '酉' && !DAY.lit[k]) continue; const al = s === '酉' ? Math.min(1, (t - DAY.lit[k]) / .8) : 1; A('eaves_halo_6f', LANT[k][0], LANT[k][1], .62, .85 * al); } ctx.restore(); }
        if (s === '子') { A('moon_bamboo_8f', 120, 300, 1, .9); A('moon_bamboo_8f', 1960, 320, 1, .9); A('moon_bamboo_8f', ...Y(220, 120), 1, .85); A('moon_bamboo_8f', ...Y(1420, 160), 1, .85); }
      } else if (/^qingzhu_room_|^qingzhu_kitchen$/.test(m)) {
        const rk = { qingzhu_room_qinghe: 'maid1', qingzhu_room_xiaotao: 'maid2', qingzhu_room_afu: 'servant', qingzhu_kitchen: 'kitchen' }[m];
        if (s === '卯' || s === '酉') { const im = img('l_window_' + rk + (s === '卯' ? '_dawn' : '_dusk')); if (im) ctx.drawImage(im, 0, 0, 832, 768); }
        if (s === '子') { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(168,172,205)'; ctx.fillRect(0, 0, T.mw, T.mh); ctx.restore(); }
      } else if (m === 'tj_room' || m === RM.steward) {
        ctx.save(); ctx.globalCompositeOperation = s === '子' ? 'multiply' : 'soft-light';
        const c = { '卯': 'rgba(170,205,230,.35)', '酉': 'rgba(255,150,70,.45)', '子': 'rgb(168,172,205)' }[s];
        if (c && !(s === '子' && m === RM.steward && F().qz_letter)) { ctx.fillStyle = c; ctx.fillRect(0, 0, T.mw, T.mh); } ctx.restore();
      }
    } catch (e) {}
  })(tileAmbientHigh);

  // ================= 青竹小院 · 经营（作者 11-08：「除了主线打怪修仙以外，真正把青竹小院经营成玩家的第二玩法」）=================
  // 一、情谊：青禾 / 小桃 / 阿福 / 松伯 / 小猫 各一条，六级（相识 → 熟络 → 亲近 → 知心 → 至交 → 家人），每升一级那个人会来找少爷、送一样东西。
  //    怎么涨：每个时辰头一回跟他说话 +1；送吃的（少爷自己做的菜，各人口味不同）+1～5；十二件小事 +2；院里的秘密 +2～5；他有心事时安慰他 +2。
  // 二、每天：每回歇到更早的时辰（比如从子时歇到卯时）算新的一天 —— 每人重新抽「今日心情」（心情很好 / 平常 / 犯困 / 有心事），说的话跟着变。
  // 三、院里的秘密：三十来件，各自只在某个时辰、某个地方、满足某个条件时才「可能」发生（随机）——每次歇到一个时辰，从符合条件的里抽一两件。
  //    有的走近那个人就发生，有的要跟他说话，有的进某间屋子、或者在少爷屋里等人来敲门；子时去敲姑娘的门，也是抽签。
  // 四、少爷居室桌上的《青竹小记》：每个人的情谊、今日心情、找到了几件秘密（没找到的只给一句时辰提示）、下一级会怎样。
  const PEOPLE = ['maid1', 'maid2', 'servant', 'steward'];
  const LV = [0, 8, 20, 36, 56, 80], LVN = ['相识', '熟络', '亲近', '知心', '至交', '家人'];
  const KIN = { maid1: '像姐姐一样', maid2: '像妹妹一样', servant: '好兄弟', steward: '像爷爷一样', cat: '家里的猫' };
  const lvOf = v => { let l = 0; for (let i = 0; i < LV.length; i++) if (v >= LV[i]) l = i; return l; };
  const BOND_NAME = { maid1: '青禾', maid2: '小桃', servant: '阿福', steward: '松伯', get cat() { return cat(); } };
  // 作者 11-08：松伯永远是家人，情谊永远最高（不用攒）；他珍藏的东西改成「找到松伯的秘密」时一件件交给少爷
  const bondV = k => { if (k === 'steward') return LV[5]; const f = F(), b = (f.qz_bond || {})[k] || 0; return k === 'cat' ? b + (f.cat_feeds || 0) * 2 : b; };
  const LVQ = [];
  const bond = (k, n, quiet) => { if (k === 'steward') return; const f = F(); f.qz_bond = f.qz_bond || {}; const l0 = lvOf(bondV(k)); f.qz_bond[k] = (f.qz_bond[k] || 0) + n; const l1 = lvOf(bondV(k));
    if (!quiet) toast('♥ ' + BOND_NAME[k] + ' · 情谊 +' + n, 1600); if (l1 > l0) LVQ.push([k, l1]);
    if (!f.qz_book_hint) { f.qz_book_hint = 1; setTimeout(() => toast('院里每个人的情谊，都记在少爷居室桌上的《青竹小记》里', 2800), 2400); } };
  window.QZ_BOND = bond;
  const qday = () => F().qz_day || 1;
  // 战斗打赢的场数（青禾夜里补衣裳要用）
  if (typeof startBattle === 'function') startBattle = (o => function () { const r = o.apply(this, arguments); try { if (r && r.then) r.then(w => { if (w) F().qz_wins = (F().qz_wins || 0) + 1; }); } catch (e) {} return r; })(startBattle);

  // ---------- 今日心情 ----------
  const MOODS = ['喜', '喜', '平', '平', '平', '困', '忧', '忧'];
  const MOODT = { '喜': '心情很好', '平': '和平常一样', '困': '有点犯困', '忧': '像是有心事' };
  const mood = k => ((F().qz_mood || {})[k]) || '平';
  function newDay() { const f = F(); f.qz_day = (f.qz_day || 1) + 1; f.qz_mood = {}; for (const k of PEOPLE) f.qz_mood[k] = pick(MOODS); f.qz_gift = {}; f.qz_comfort = {}; f.qz_dream = 0; }
  const MOODL = {
    maid1: { '喜': ['笑', '今天的竹叶好像落得少，扫起来格外快。少爷气色也好。'], '困': ['困', '（掩着嘴打了个小哈欠）……少爷别看，青禾昨夜绣到很晚。'], '忧': ['担心', '……没什么，少爷不用替青禾操心。'] },
    maid2: { '喜': ['大笑', '少爷少爷！今天小桃心情超——好的！'], '困': ['困', '小桃……眼皮在打架……少爷说什么来着？'], '忧': ['委屈', '……（小桃低着头，没像平时那样叽叽喳喳）'] },
    servant: { '喜': ['大笑', '嘿嘿，少爷，今天阿福干活特别有劲！'], '困': ['困', '少爷……阿福站着都能睡着……'], '忧': ['委屈', '少爷，阿福没事……就是有点想事情。'] },
    steward: { '喜': ['笑', '少爷来了。今儿个老头子心里敞亮。'], '困': ['困', '人老了，坐一会儿就犯困……'], '忧': ['叹气', '（松伯望着院门，半晌没说话）'] },
  };
  const WORRY = {
    maid1: [['娘托人捎了信来，说眼睛又不大好了……', '担心'], ['把少爷一件衣裳洗缩水了，一直不敢说……', '委屈'], ['昨夜梦见小时候走丢了，醒来心里空落落的……', '担心']],
    maid2: [['小桃养的那盆兰草，死了一株……', '委屈'], ['想爹娘了……青阳镇这时候，该开桃花了。', '委屈'], ['跟阿福拌了两句嘴，他一整天都不理小桃……', '委屈']],
    servant: [['把松伯的茶壶盖磕了个缺口，还没敢说……', '委屈'], ['听说山下闹妖兽，不知道老家那边怎么样了……', '担心'], ['又被小桃嫌笨了……阿福是不是真的很笨？', '委屈']],
    steward: [['宗主有些日子没来信了……', '叹气'], ['老寒腿又犯了，阴天就疼……', '叹气'], ['想起少爷小时候的事，一晃，就长这么大了……', '感动']],
  };
  async function comfort(k) {
    const f = F(); f.qz_comfort = f.qz_comfort || {}; if (f.qz_comfort[k]) return false; f.qz_comfort[k] = 1;
    const i = await choose('', ['「怎么了？」', '（什么也不问，陪着站一会儿）']);
    const [why, e] = pick(WORRY[k]);
    if (i === 0) { await say(WHO[k] + '·' + e, why); await say('叶孤星', pick(['有我在呢。', '别往心里去，明天会好的。', '回头我去看看，能帮的，我来帮。'])); }
    else await narrate('叶孤星没说话，就站在一旁陪着。过了一会儿，' + BOND_NAME[k] + '轻轻舒了口气。');
    await say(WHO[k] + '·笑', { maid1: '……跟少爷说说话，心里就松快多了。', maid2: '……嗯！小桃好啦！谢谢少爷！', servant: '嘿……少爷一句话，阿福就啥事都没了。', steward: '……人老了，就爱瞎琢磨。有少爷在，老头子不操心。' }[k]);
    f.qz_mood[k] = '喜'; bond(k, 2); return true;
  }

  // ---------- 送吃的（少爷在厨房做的菜）----------
  const DISH = { cook_lianzi: '莲子羹', cook_sun: '竹笋鲜汤', cook_guihua: '桂花糕', cook_doufu: '青菜豆腐', cook_zhou: '香菇灵米粥', cook_zao: '红枣山药汤', cook_dan: '香菇蒸蛋' };
  const TASTE = {   // 5 最爱 / 3 喜欢 / 2 还行 / 1 不太合口
    maid1: { cook_sun: 5, cook_doufu: 3, cook_zhou: 3, cook_lianzi: 2, cook_zao: 2, cook_guihua: 2, cook_dan: 3 },
    maid2: { cook_guihua: 5, cook_lianzi: 5, cook_zao: 3, cook_dan: 3, cook_zhou: 2, cook_sun: 2, cook_doufu: 1 },
    servant: { cook_zhou: 5, cook_sun: 3, cook_doufu: 3, cook_dan: 3, cook_zao: 3, cook_lianzi: 3, cook_guihua: 3 },
    steward: { cook_zao: 5, cook_lianzi: 3, cook_zhou: 3, cook_doufu: 3, cook_sun: 2, cook_dan: 2, cook_guihua: 1 },
  };
  const GIFT_SAY = {
    maid1: { 5: ['惊喜', '竹笋鲜汤？！……少爷怎么知道，青禾小时候最爱喝娘煮的笋汤。'], 3: ['笑', '少爷做的？青禾舍不得吃了。'], 2: ['笑', '谢谢少爷，青禾收下了。'], own: ['嗔', '香菇蒸蛋……少爷这是跟青禾比手艺呢？……嗯，比青禾蒸的还嫩。'] },
    maid2: { 5: ['大笑', '甜的！是甜的！少爷最好了！！'], 3: ['惊喜', '哇，少爷亲手做的！小桃要慢慢吃。'], 2: ['笑', '谢谢少爷～'], 1: ['委屈', '青菜豆腐呀……小桃、小桃会吃完的！（皱着眉头）'] },
    servant: { 5: ['大笑', '灵米粥！管饱！阿福能喝三碗！'], 3: ['大笑', '少爷做的就是好吃！阿福啥都爱吃！'] },
    steward: { 5: ['感动', '红枣山药汤……少爷还记得老头子爱喝这个。'], 3: ['点头', '好，好，少爷的手艺越来越好了。'], 2: ['笑', '少爷有心了。'], 1: ['笑', '桂花糕啊……老头子牙不好，留给小桃吧。少爷的心意，松伯收下了。'] },
  };
  const dishesHave = () => Object.keys(DISH).filter(id => (typeof itemCount === 'function' ? itemCount(id) : 0) > 0);
  const canGift = k => k !== 'cat' && dishesHave().length && !((F().qz_gift || {})[k]);
  async function gift(k) {
    const have = dishesHave(); if (!have.length) return;
    const i = await choose('送什么？', [...have.map(id => DISH[id] + '（' + itemCount(id) + '）'), '算了']); if (i >= have.length) return;
    const id = have[i]; try { const b = S.hero.bag; b[id]--; if (b[id] <= 0) delete b[id]; } catch (e) {}
    const f = F(); f.qz_gift = f.qz_gift || {}; f.qz_gift[k] = 1;
    const v = TASTE[k][id] || 2, G = GIFT_SAY[k], ln = (k === 'maid1' && id === 'cook_dan' && G.own) || G[v] || G[3] || G[2];
    await say(WHO[k] + '·' + ln[0], ln[1]); bond(k, v);
  }

  // ---------- 每升一级：那个人来找少爷，送一样东西 ----------
  const acc = (id, o) => { ITEM_DB[id] = ITEM_DB[id] || Object.assign({ slot: 'acc' }, o); };
  const giveItem = async (id, n, why) => { addItem(id, n); try { if (window.itemGet) await itemGet([{ icon: 'item:' + id, name: ITEM_DB[id].name, count: '×' + n, desc: ITEM_DB[id].desc || '' }], why); else toast('获得：' + ITEM_DB[id].name + ' ×' + n, 1800); } catch (e) { toast('获得：' + ITEM_DB[id].name, 1800); } };
  const stat = (o, txt) => { const h = S.hero; for (const k in o) { h[k] = (h[k] || 0) + o[k]; if (k === 'maxhp') h.hp += o[k]; if (k === 'maxmp') h.mp += o[k]; } toast(txt, 2400); };
  acc('acc_qz_suisui', { name: '青禾的竹纹剑穗', def: 6, maxhp: 120, desc: '青禾熬了好几夜编的剑穗，坠着一枚小小的竹节。防御 +6　气血 +120' });
  acc('acc_qz_taohua', { name: '小桃的桃花香包', def: 2, maxmp: 80, desc: '晒干的桃花和兰草，香味淡淡的，闻着心静。防御 +2　灵力 +80' });
  acc('acc_qz_pingan', { name: '阿福编的平安绳', atk: 5, def: 3, desc: '阿福跟镇上老婆婆学的，编坏了七根才编成这一根。攻击 +5　防御 +3' });
  acc('acc_qz_jiusui', { name: '松伯珍藏的旧剑穗', atk: 6, maxmp: 60, desc: '宗主年轻时挂过的剑穗，松伯收了二十年。攻击 +6　灵力 +60' });
  const LVR = {
    maid1: { 1: [['笑', '少爷，青禾蒸了两碗蛋羹，少爷出门带着，饿了垫垫肚子。'], () => giveItem('cook_dan', 2, '青禾做的')],
      2: [['认真', '少爷的衣裳，青禾都在里头加缝了一层软甲衬。……别嫌重。'], () => stat({ def: 2 }, '防御 +2（青禾加缝的软甲衬）')],
      3: [['羞', '青禾跟松伯学了个方子，往少爷的茶里添了一味药。……少爷别问是什么，喝就是了。'], () => stat({ maxhp: 100 }, '气血上限 +100')],
      4: [['羞', '这个……青禾编了好几夜。少爷挂在剑上，就像青禾跟着少爷一样。'], () => giveItem('acc_qz_suisui', 1, '青禾所赠')],
      5: [['感动', '少爷……青禾没有兄弟姐妹。在青禾心里，少爷就是家里人。'], () => stat({ maxmp: 60 }, '灵力上限 +60 · 青禾：像姐姐一样')] },
    maid2: { 1: [['得意', '少爷！这两块桂花糕是小桃留的——青禾姐都没有哦！'], () => giveItem('cook_guihua', 2, '小桃偷偷留的')],
      2: [['笑', '小桃在少爷窗台上摆了一盆兰草，安神的！少爷打坐的时候闻一闻。'], () => stat({ maxmp: 40 }, '灵力上限 +40（窗台上的兰草）')],
      3: [['大笑', '小桃学会熬莲子羹了！少爷尝尝，是不是跟青禾姐一样好？'], () => giveItem('cook_lianzi', 3, '小桃熬的')],
      4: [['羞', '这个香包，小桃缝了好久……针脚歪了，少爷别笑。'], () => giveItem('acc_qz_taohua', 1, '小桃所赠')],
      5: [['感动', '少爷，小桃以前在镇上卖花，没人记得小桃的名字……现在，小桃有家了。'], () => stat({ maxhp: 80 }, '气血上限 +80 · 小桃：像妹妹一样')] },
    servant: { 1: [['大笑', '少爷，阿福熬了两罐灵米粥，管饱！'], () => giveItem('cook_zhou', 2, '阿福熬的')],
      2: [['得意', '少爷的剑，阿福半夜偷偷磨了一遍——您看，亮得能照人！'], () => stat({ atk: 3 }, '攻击 +3（阿福磨的剑）')],
      3: [['认真', '阿福每天早上挑水都多挑一担，用井水给少爷泡药浴。'], () => stat({ maxhp: 100 }, '气血上限 +100')],
      4: [['羞', '这根平安绳……阿福编坏了七根，第八根才成。少爷戴着，出门平平安安的。'], () => giveItem('acc_qz_pingan', 1, '阿福所赠')],
      5: [['感动', '少爷……阿福是松伯从雪地里捡回来的。可阿福觉得，阿福是有家的。'], () => stat({ atk: 4 }, '攻击 +4 · 阿福：好兄弟')] },
    steward: { 1: [['笑', '少爷，红枣山药汤熬了两罐，带着路上喝。'], () => giveItem('cook_zao', 2, '松伯熬的')],
      2: [['认真', '老头子把宗主早年练剑的心得抄了一份，少爷闲了翻翻。'], () => stat({ atk: 2, def: 2 }, '攻击 +2　防御 +2（宗主的练剑心得）')],
      3: [['点头', '少爷打坐的蒲团，松伯换了个新的，里头填的是后山的灵草。'], () => stat({ maxmp: 50 }, '灵力上限 +50')],
      4: [['感动', '这是宗主年轻时挂过的剑穗。老头子收了二十年……如今，该给少爷了。'], () => giveItem('acc_qz_jiusui', 1, '松伯所赠')],
      5: [['感动', '老头子没儿没女。看着少爷长大……就跟看着自家孙儿一样。'], () => stat({ maxhp: 100 }, '气血上限 +100')] },
  };
  async function levelUp(k, lv) {
    world.locked = true; if (world.player) world.player.moving = false;
    try {
      if (k === 'cat') { await narrate(cat() + '跳上少爷膝头，打了个滚，肚皮朝天。'); toast('♥ ' + cat() + ' · 情谊升至「' + LVN[lv] + '」', 2400); return; }
      const R = (LVR[k] || {})[lv]; if (!R) return;
      await narrate(BOND_NAME[k] + '寻了过来，手里像是捧着什么。');
      await say(WHO[k] + '·' + R[0][0], R[0][1]); await R[1]();
      toast(k === 'steward' ? '松伯珍藏的东西 · ' + lv + ' / 5' : '♥ ' + BOND_NAME[k] + ' · 情谊升至「' + LVN[lv] + '」' + (lv === 5 ? '（' + KIN[k] + '）' : ''), 2600);
    } finally { world.locked = false; }
  }

  // ---------- 院里的秘密（随机 + 时辰 + 条件）----------
  // type：near 走近那个人 / talk 跟他说话 / enter 进某张图（at）；once：只发生一次；p：符合条件时被抽中的机会；b：情谊
  const hidSeen = id => !!((F().qz_hid || {})[id]);
  const FLOWER_N = () => ({ rose: '月季', hydrangea: '绣球', chrysanthemum: '菊花' })[F().qz_bed] || '花';
  let LOST = null;   // 酉时被风吹走的衣裳：落在哪丛竹子边
  const LOST_AT = [Y(80, 300), Y(1590, 420), Y(70, 1080), Y(1600, 1480), Y(860, 1560)];
  const EVS = [
    // —— 卯时 ——
    { id: 'maid1:basin', who: 'maid1', shi: '卯', type: 'near', p: .4, b: 2, title: '打翻的铜盆', hint: '清晨 · 端水的人脚下一滑', run: async () => {
      await narrate('青禾端着铜盆转过墙角，脚下一滑——'); const i = await choose('', ['伸手扶住她', '接住铜盆']);
      await narrate(i === 0 ? '叶孤星一把扶住她的胳膊，铜盆「哐当」落地，水溅了两人一身。' : '叶孤星一伸手接住了铜盆——水一滴没洒，青禾却一屁股坐在了地上。');
      await say('侍女青禾·羞', i === 0 ? '……谢、谢谢少爷。少爷的衣裳湿了，青禾这就去拿干的！' : '……少爷救盆不救人呀。'); } },
    { id: 'servant:yawn', who: 'servant', shi: '卯', type: 'near', p: .4, b: 1, title: '被敲头的哈欠', hint: '清晨 · 院门口，有人还没睡醒', run: async () => {
      await narrate('阿福扫着院门，打了个大大的哈欠——身后伸出一只手，在他脑门上「笃」地敲了一下。');
      await say('松伯·念叨', '一日之计在于晨，张着嘴等早饭飞进来呢？'); await say('小厮阿福·委屈', '松伯……阿福这就扫，这就扫！'); await narrate('松伯背着手走开时，冲少爷挤了挤眼睛。'); bond('steward', 1, true); } },
    { id: 'maid2:bloom', who: 'maid2', shi: '卯', type: 'near', p: .35, b: 2, need: f => !!f.qz_bed, title: '今年第一朵', hint: '清晨 · 花圃里有好消息', run: async () => {
      await say('侍女小桃·惊喜', '少爷！快来快来——' + FLOWER_N() + '开了今年第一朵！'); await narrate('小桃蹲在花圃前，指着一朵刚绽开的' + FLOWER_N() + '，眼睛亮晶晶的。');
      const i = await choose('', ['摘下来，替她簪在鬓边', '「留着，等它开满一圃。」']);
      if (i === 0) { await narrate('叶孤星摘下那朵花，轻轻别在小桃的鬓边。'); await say('侍女小桃·羞', '……少、少爷！小桃今天一整天都不摘下来了！'); }
      else await say('侍女小桃·笑', '嗯！等开满了，小桃第一个告诉少爷！'); } },
    { id: 'maid1:zongzi', who: 'maid1', shi: '卯', type: 'talk', once: 1, need: () => bondV('maid1') >= 8, b: 3, title: '竹叶粽', hint: '清晨 · 熟络以后，她会做一样少爷小时候爱吃的', run: async () => {
      await say('侍女青禾·笑', '少爷，青禾今早包了竹叶粽——松伯说，少爷小时候最爱吃这个，一顿能吃三个。');
      await narrate('竹叶剥开，糯米裹着一颗蜜枣，还冒着热气。'); healAll(false); await say('叶孤星', '……还是小时候的味道。'); await say('侍女青禾·羞', '那以后每个月初一，青禾都给少爷包。'); } },
    { id: 'maid2:dewtea', who: 'maid2', shi: '卯', type: 'talk', once: 1, need: () => bondV('maid2') >= 20, b: 4, title: '一早上的露水', hint: '清晨 · 亲近以后，她收了一样东西给少爷', run: async () => {
      await narrate('小桃捧着一只小瓷瓶跑过来，瓶里是半瓶清亮亮的水。'); await say('侍女小桃·得意', '这是小桃一早上从竹叶上收的露水！听说拿露水泡茶，修行的人喝了心神清明。');
      await narrate('茶汤清得能看见杯底，入口一股竹叶的凉意。'); stat({ maxmp: 20 }, '灵力上限 +20（露水茶）'); await say('侍女小桃·笑', '少爷喜欢的话，小桃明天还收！'); } },
    { id: 'servant:sword', who: 'servant', shi: '卯', type: 'near', once: 1, need: f => bondV('servant') >= 8 && f.qz_afu_help, b: 4, title: '扫帚剑法', hint: '清晨 · 帮他挑过水以后，他偷偷在学一样东西', run: async () => {
      await narrate('院门后，阿福握着一把扫帚，学着少爷的样子比划剑招——一个转身，扫帚把子正好打在自己后脑勺上。');
      await say('小厮阿福·惊喜', '少、少爷！您什么时候来的？！'); const i = await choose('', ['「手腕再低一点。」（教他一招）', '假装什么都没看见']);
      if (i === 0) { await narrate('叶孤星握着他的手腕，把天剑诀最基础的起手式比给他看。阿福一遍遍地练，额头冒汗也不肯停。'); await say('小厮阿福·大笑', '原来是这样！阿福以后也能保护院里的人了！'); F().qz_afu_sword = 1; }
      else await say('小厮阿福·羞', '……少爷肯定看见了。'); } },
    { id: 'steward:bird', who: 'steward', shi: '卯', type: 'near', once: 1, need: () => bondV('steward') >= 20, b: 4, title: '受伤的雀儿', hint: '清晨 · 亲近以后，廊下有一只小东西需要少爷', run: async () => {
      await narrate('松伯蹲在廊下，手心里捧着一只雀儿，翅膀上沾着血。'); await say('松伯·叹气', '昨夜大概是撞了屋檐。老头子手笨，包了几回都包不好。');
      await narrate('叶孤星指尖凝起一点温和的灵力，轻轻抚过雀儿的翅膀。小东西扑棱了两下，竟站了起来。'); await say('松伯·感动', '……少爷这手，比宗主当年还稳。');
      await narrate('那只雀儿后来再没飞走，每天清晨都落在少爷的窗台上。'); F().qz_bird = 1; } },
    { id: 'cat:fish', who: 'cat', shi: '卯', type: 'door', once: 1, need: f => (f.cat_feeds || 0) >= 5 || seen(12), b: 3, title: '门槛上的小鱼', hint: '清晨 · 喂得够多，它会回礼', run: async () => {
      await narrate('推开门，门槛上摆着一条小鱼，还在扑腾。' + cat() + '蹲在一旁，尾巴一甩一甩，一脸「快夸我」。');
      const i = await choose('', ['摸摸它的头', '把小鱼放回池子里']);
      await narrate(i === 0 ? cat() + '眯起眼睛，在少爷手心里蹭了又蹭，喉咙里咕噜咕噜响。' : '小鱼「扑通」一声回了池子。' + cat() + '盯着水面看了半天，回头冲少爷「喵」了一声，像是在抱怨。'); } },
    // —— 午时 ——
    { id: 'servant:steal', who: 'servant', shi: '午', type: 'enter', at: RM.kitchen, p: .45, b: 1, title: '一片肉的代价', hint: '正午 · 厨房窗外伸进来一只手', run: async () => {
      await narrate('窗外伸进一只手，悄悄捏走案板上一片肉——「啪」，青禾的锅铲落在那只手背上。');
      await say('小厮阿福·委屈', '哎哟！青禾姐，阿福就是……就是帮少爷尝尝咸淡！'); await say('侍女青禾·嗔', '少爷还没尝呢，你倒先尝了。出去劈柴！');
      await narrate('阿福捂着手溜走了。青禾回头看见少爷，脸一红。'); await say('侍女青禾·羞', '……让少爷见笑了。'); bond('maid1', 1, true); } },
    { id: 'maid2:burn', who: 'maid2', shi: '午', type: 'enter', at: RM.kitchen, p: .35, b: 3, title: '烫着的手指', hint: '正午 · 灶膛里爆了一颗火星', run: async () => {
      await narrate('灶膛里「噼啪」爆出一颗火星，小桃「呀」地缩回手，指尖红了一块。'); const i = await choose('', ['用灵力替她镇住灼痛', '拉她到水缸边冲凉水']);
      if (i === 0) { await narrate('叶孤星握住她的手指，一缕清凉的灵力缓缓渡过去。'); await say('侍女小桃·感动', '……不疼了。少爷的手好凉，好舒服。'); }
      else { await narrate('井水凉丝丝的，冲了一会儿，红印就淡了。'); await say('侍女小桃·羞', '少爷别紧张，小桃皮厚着呢！……不过，谢谢少爷。'); } } },
    { id: 'steward:nap', who: 'steward', shi: '午', type: 'near', p: .35, b: 2, title: '凉掉的茶', hint: '正午 · 石桌边，有人打起了盹', run: async () => {
      await narrate('松伯靠在石桌边，账本摊在膝上，脑袋一点一点的——打起盹来了。手边那盏茶早就凉了。');
      const i = await choose('', ['把自己的外衫给他披上', '悄悄把凉茶换成热的']);
      await narrate(i === 0 ? '外衫轻轻搭在松伯肩上。他咂了咂嘴，睡得更沉了。' : '叶孤星去厨房续了热茶，轻手轻脚地放回他手边。');
      await say('松伯·笑', i === 0 ? '……少爷？老头子怎么睡着了。这衣裳……是少爷的？' : '……少爷？老头子怎么睡着了。这茶……怎么还是热的。'); } },
    { id: 'servant:chop', who: 'servant', shi: '午', type: 'near', p: .35, b: 2, title: '劈柴比赛', hint: '正午 · 木墩边有人不服气', run: async () => {
      await say('小厮阿福·得意', '少爷！比比谁劈得快！输了的……输了的晚上给赢的捶背！'); const i = await choose('', ['用剑气一口气劈完一堆', '老老实实一斧一斧劈', '故意让他赢']);
      if (i === 0) { await narrate('剑光一闪，一整堆木柴齐齐裂成两半，切口平得能照人。'); await say('小厮阿福·惊喜', '这、这不算！少爷用仙法！……不过真好看。'); }
      else if (i === 1) { await narrate('两人各劈一堆，木屑乱飞。最后一数——少爷多了两根。'); await say('小厮阿福·委屈', '……阿福晚上给少爷捶背。说话算话。'); }
      else { await narrate('叶孤星故意慢了半拍，最后差了三根。'); await say('小厮阿福·大笑', '阿福赢啦！少爷，晚上捶背可别赖！'); } } },
    { id: 'maid1:egg', who: 'maid1', shi: '午', type: 'talk', p: .35, b: 2, title: '碗底的蛋', hint: '正午 · 端菜的人藏了一点私心', run: async () => {
      await say('侍女青禾·笑', '少爷，石桌上那碗面是您的。……碗底多卧了一个蛋，别让阿福看见。'); await narrate('面条筋道，汤里飘着葱花，碗底果然藏着一个溏心蛋。'); healAll(false); } },
    // —— 酉时 ——
    { id: 'maid1:lost', who: 'maid1', shi: '酉', type: 'near', p: .35, b: 3, title: '被风吹走的衣裳', hint: '黄昏 · 一阵风从晾衣架上卷走了什么', run: async () => {
      await say('侍女青禾·担心', '哎呀——少爷那件外衫被风吹走了！好像落到竹丛那边去了……'); LOST = pick(LOST_AT); toast('去西院的竹丛边找找（有一点微光的地方）', 2600); return 'later'; } },
    { id: 'servant:reach', who: 'servant', shi: '酉', type: 'near', p: .35, b: 2, title: '够不着的灯笼', hint: '黄昏 · 点灯的人踮着脚', run: async () => {
      await narrate('阿福举着长杆踮着脚，屋檐最高那盏灯笼怎么也够不着，杆子在空中晃来晃去。'); const i = await choose('', ['纵身一跃，替他把灯点上', '把他托上肩头']);
      await narrate(i === 0 ? '叶孤星足尖一点，衣袂一翻，指尖火光一闪——灯笼亮了。' : '阿福踩着少爷的肩膀，晃了两晃，总算把灯点上了。');
      await say('小厮阿福·惊喜', i === 0 ? '少爷好俊的身法！阿福以后也要练轻功！' : '少爷的肩膀真稳！……阿福是不是太沉了？'); } },
    { id: 'maid2:pot', who: 'maid2', shi: '酉', type: 'near', p: .3, b: 3, title: '摔碎的花盆', hint: '黄昏 · 搬花盆的人手一滑', run: async () => {
      await narrate('「啪」——小桃怀里的花盆摔在石板上，碎成好几瓣，土撒了一地。'); await say('侍女小桃·委屈', '呜……这盆是小桃养了一整个夏天的……');
      await choose('', ['帮她把花移到新盆里', '「花根没断，还能活。」']); await narrate('两个人蹲在地上，一捧一捧把土拢回新盆。花枝晃了晃，又直起了腰。'); await say('侍女小桃·笑', '……少爷说能活，就一定能活！'); } },
    { id: 'steward:quiz', who: 'steward', shi: '酉', type: 'near', p: .3, b: 1, title: '松伯问功课', hint: '黄昏 · 巡院的人想起一件事', run: async () => {
      await say('松伯·认真', '少爷，今儿个剑练了几遍？'); const i = await choose('', ['「一百遍。」', '「……三遍。」', '「练了，练了。」']);
      await say(['松伯·念叨', '松伯·笑', '松伯·叹气'][i], ['一百遍？那剑柄上怎么一点汗都没有？', '三遍也是练。实话比一百遍值钱。', '宗主小时候也是这么说的——「练了，练了」。'][i]); if (i === 1) bond('steward', 1, true); } },
    { id: 'steward:story', who: 'steward', shi: '酉', type: 'talk', once: 1, need: () => bondV('steward') >= 36, b: 5, title: '宗主少年时', hint: '黄昏 · 知心以后，他会讲一件不许外传的旧事', run: async () => {
      await say('松伯·笑', '少爷，陪老头子走两步。……说个宗主年轻时的事，您可别告诉他是我说的。'); await say('松伯', '宗主十五岁那年，偷偷下山喝酒，回来翻墙，一头栽进了柴房的草垛里。');
      await say('松伯·大笑', '第二天他还板着脸跟师兄弟们说——是在练「落地无声」。'); await say('叶孤星', '……爹？'); await say('星旋', '（哈哈哈哈——这个我能笑一年。）');
      await say('松伯·点头', '所以啊，少爷不用怕犯错。你爹，也是这么过来的。'); } },
    { id: 'servant:lamp', who: 'servant', shi: '酉', type: 'talk', once: 1, need: () => seen(5) && bondV('servant') >= 20, b: 4, title: '写着名字的灯笼', hint: '黄昏 · 点过最后一盏灯以后，他还做了一盏', run: async () => {
      await narrate('阿福从背后拿出一盏新糊的灯笼，灯纸上歪歪扭扭写着两个字——「孤星」。'); await say('小厮阿福·羞', '是阿福照着少爷的字描的……写得不好看。想挂在少爷屋门口。');
      await say('叶孤星', '挂吧。比我写的好。'); await say('小厮阿福·大笑', '真的？！那阿福天天给它添灯油！'); F().qz_name_lamp = 1; } },
    // —— 戌时 ——
    { id: 'maid1:snack', who: 'maid1', shi: '戌', type: 'enter', at: 'tj_room', p: .35, need: () => bondV('maid1') >= 8 && F().qz_out !== 'maid1', b: 2, title: '青禾的莲子羹', hint: '入夜 · 少爷屋里，门外有人轻轻叩门', run: async () => {
      await narrate('叩叩——门外传来轻轻的敲门声。'); await say('侍女青禾·笑', '少爷还没歇吧？青禾煮了碗莲子羹，趁热喝了再睡。'); healAll(false); await say('侍女青禾·嗔', '喝完把碗放门口就好，别熬夜。'); } },
    { id: 'maid2:snack', who: 'maid2', shi: '戌', type: 'enter', at: 'tj_room', p: .35, need: () => bondV('maid2') >= 8 && F().qz_out !== 'maid2', b: 2, title: '小桃偷蒸的桂花糕', hint: '入夜 · 少爷屋里，门缝里探进来一个脑袋', run: async () => {
      await narrate('门被推开一条缝，探进来一个脑袋，和一碟桂花糕。'); await say('侍女小桃·得意', '少爷！小桃偷偷蒸的，青禾姐不知道——嘘！'); healAll(true); await say('侍女小桃·笑', '少爷吃完要睡觉哦！小桃走啦！'); } },
    { id: 'cat:bed', who: 'cat', shi: '戌', type: 'enter', at: 'tj_room', p: .3, b: 2, title: '被窝里的猫', hint: '入夜 · 少爷的被窝里好像鼓起了一块', run: async () => {
      await narrate('掀开被子，一团橘白的毛球正窝在少爷枕边，睁开一只眼睛看了看他，又闭上了。'); const i = await choose('', ['把它挪到脚边', '算了，挤一挤']);
      await narrate(i === 0 ? cat() + '被挪到脚边，没过一会儿，又一点一点蹭回了枕头上。' : '叶孤星侧着身子躺下。' + cat() + '的呼噜声一起一伏，比什么安神香都管用。'); } },
    { id: 'servant:write2', who: 'servant', shi: '戌', type: 'talk', once: 1, need: f => f.qz_afu_write && bondV('servant') >= 20, b: 4, title: '「孤星」两个字', hint: '入夜 · 教过他写字以后，他还想学两个字', run: async () => {
      await say('小厮阿福·得意', '少爷，阿福把一整页都写满了！'); await narrate('纸上密密麻麻，全是「阿福」两个字，越往后越端正。');
      await say('小厮阿福·羞', '少爷……再教阿福两个字吧。教阿福写「孤星」。'); await narrate('叶孤星一笔一画写下自己的名字。阿福看了半天，小心地把纸折好，揣进怀里。');
      await say('小厮阿福·笑', '以后少爷出远门，阿福就照着这两个字，一天写一遍。'); } },
    { id: 'maid2:home', who: 'maid2', shi: '戌', type: 'talk', once: 1, need: () => mood('maid2') === '忧' || bondV('maid2') >= 20, b: 4, title: '青阳镇的桃花', hint: '入夜 · 她心里一直惦记着一个地方', run: async () => {
      await say('侍女小桃·委屈', '少爷……青阳镇这时候，该开桃花了吧。'); await say('侍女小桃', '小桃的爹娘在镇上卖花。小桃上山以后，就再没见过镇上的桃花了。');
      const i = await choose('', ['「下回下山，替你折一枝回来。」', '「那就在西院种一棵桃树。」']); F().qz_peach = i + 1; setTimeout(() => qStart('peach', i === 0 ? 'branch' : 'ask'), 600);
      await say('侍女小桃·感动', i === 0 ? '……少爷要说话算话哦。小桃会一直等的。' : '……种一棵桃树？！那小桃天天给它浇水，浇到它开花为止！'); } },
    // —— 子时 ——
    { id: 'steward:cough', who: 'steward', shi: '子', type: 'enter', at: RM.steward, p: .35, need: () => !F().qz_letter, b: 3, title: '夜里的咳嗽', hint: '子夜 · 管事房里有压低了的声音', run: async () => {
      await narrate('管事房里传出几声压低了的咳嗽。'); await say('松伯·惊喜', '……少爷？老毛病了，入秋就咳两声，不碍事。');
      const i = await choose('', ['去厨房给他温一碗红枣汤', '用灵力替他顺一顺气']);
      await narrate(i === 0 ? '一碗温热的红枣汤喝下去，松伯的咳嗽渐渐停了。' : '一缕温和的灵力沿着他的背缓缓推过去，松伯长长舒了一口气。'); await say('松伯·感动', '……少爷长大了。'); } },
    { id: 'cat:roof', who: 'cat', shi: '子', type: 'enter', at: COURT, p: .3, need: () => seen(11) || seen(12), b: 2, title: '屋顶上的动静', hint: '子夜 · 院里，屋顶上「咚」的一声', run: async () => {
      await narrate('屋顶上传来「咚」的一声，几片瓦晃了晃——是' + cat() + '，叼着一只老鼠从屋脊上跳下来，得意地看了少爷一眼。'); await say('星旋', '（……你家猫比你勤快。）'); } },
  ];
  // 子时敲门的那几件也算在秘密里（图鉴用）
  const KNOCK_SECRETS = [
    { id: 'maid2:full', who: 'maid2', shi: '子', title: '吃撑了', hint: '子夜 · 敲门 —— 她今天好像吃了太多少爷做的菜' },
    { id: 'maid2:fly', who: 'maid2', shi: '子', title: '纱袋里的萤火虫', hint: '子夜 · 敲门 —— 萤火虫被她带回了屋' },
    { id: 'maid2:dark', who: 'maid2', shi: '子', title: '屋顶上的脚步声', hint: '子夜 · 敲门 —— 她其实有点怕黑' },
    { id: 'maid1:mend', who: 'maid1', shi: '子', title: '灯下补衣裳', hint: '子夜 · 敲门 —— 少爷打的仗多了，衣裳也就破了' },
    { id: 'maid1:letter', who: 'maid1', shi: '子', title: '给娘的家书', hint: '子夜 · 敲门 —— 听她讲过娘以后' },
    { id: 'maid1:emb', who: 'maid1', shi: '子', title: '青竹绣图', hint: '子夜 · 敲门 —— 知心以后，她在绣一样很大的东西' },
    { id: 'servant:dream', who: 'servant', shi: '子', title: '梦话连篇', hint: '子夜 · 他的梦话不止一句' },
  ];
  const SECRETS = [...EVS, ...KNOCK_SECRETS];
  const EVBY = {}; for (const e of EVS) EVBY[e.id] = e;
  function schedule(force) {
    const f = F(), s = shi(); if (!s) return; if (!force && f.qz_today && f.qz_today.d === qday() && f.qz_today.s === s) return;
    const cand = EVS.filter(e => e.shi === s && (!e.once || !hidSeen(e.id)) && (!e.need || e.need(f))).sort(() => Math.random() - .5);
    const list = []; for (const e of cand) { if (list.length >= 3) break; if (Math.random() < (e.once ? .6 : e.p || .35)) list.push(e.id); }
    f.qz_today = { d: qday(), s, list, done: [] };
  }
  const pending = (type, who) => { const T = F().qz_today; if (!T || T.s !== shi()) return null; for (const id of T.list) { if (T.done.includes(id)) continue; const e = EVBY[id]; if (e && e.type === type && (!who || e.who === who)) return e; } return null; };
  async function runEv(e) {
    const f = F(); f.qz_today.done.push(e.id); world.locked = true; if (world.player) world.player.moving = false;
    let r; try { r = await e.run(); } finally { world.locked = false; }
    if (r === 'later') return;
    f.qz_hid = f.qz_hid || {}; const first = !f.qz_hid[e.id]; f.qz_hid[e.id] = 1; bond(e.who, e.b || 2);
    if (first && e.who === 'steward') { const c = secretsOf('steward').filter(x => hidSeen(x.id)).length; if (LVR.steward[c]) LVQ.push(['steward', c]); }
    if (first) setTimeout(() => toast('《青竹小记》· 新的秘密：' + e.title, 2200), 1900);
  }
  let EV_T = 0;
  if (typeof tileUpdate === 'function') tileUpdate = (o => function (dt) { o.apply(this, arguments);
    try {
      if (!world.map || world.locked || (typeof dialog !== 'undefined' && dialog) || (typeof choice !== 'undefined' && choice) || (window.MAP_READY && !MAP_READY()) || !QZ(world.mapName)) return;
      if (LVQ.length) { const [k, lv] = LVQ.shift(); levelUp(k, lv); return; }
      if (!ON()) return; schedule();
      EV_T += dt; if (EV_T < 1.2) return;
      const p = world.player; if (!p) return;
      // 被风吹走的衣裳：走到那丛竹子边
      if (LOST && world.mapName === COURT && Math.hypot(p.x - LOST[0], p.y - LOST[1]) < 70) { LOST = null; world.locked = true;
        (async () => { try { await narrate('竹丛底下，挂着少爷那件外衫——还好没被竹枝勾破。'); await say('侍女青禾·笑', '……多亏少爷眼尖。青禾拿回去再熨一熨。'); const f = F(); f.qz_hid = f.qz_hid || {}; const first = !f.qz_hid['maid1:lost']; f.qz_hid['maid1:lost'] = 1; bond('maid1', 3); if (first) setTimeout(() => toast('《青竹小记》· 新的秘密：被风吹走的衣裳', 2200), 1900); } finally { world.locked = false; } })(); return; }
      const T = F().qz_today; if (!T) return;
      for (const id of T.list) { if (T.done.includes(id)) continue; const e = EVBY[id]; if (!e) continue;
        if (e.type === 'enter' && world.mapName === e.at) { runEv(e); return; }
        if (e.type === 'door' && world.mapName === COURT && DOOR_OUT) { DOOR_OUT = false; runEv(e); return; }
        if (e.type === 'near') { const a = (world.actors || []).find(x => x.npc && (e.who === 'cat' ? x.npc.r139cat : x.npc.q162 && x.npc.q162.who === e.who) && x.x > -9e4);
          if (a && Math.hypot(p.x - a.x, p.y - a.y) < 110) { runEv(e); return; } }
      }
    } catch (e) { console.warn('r162 ev', e); } })(tileUpdate);
  let DOOR_OUT = false;
  // 每个时辰头一回跟他说话：情谊 +1（安静地加，不弹提示）
  function chatBond(k) { const f = F(), key = qday() + ':' + shi(); f.qz_chat = f.qz_chat && f.qz_chat.d === key ? f.qz_chat : { d: key }; if (f.qz_chat[k]) return; f.qz_chat[k] = 1; bond(k, 1, true); }
  // 子夜阿福的梦话（看过「阿福的梦话」以后，每夜随机一句）
  const DREAMS = ['……烤鸡腿……再来一个……就一个……', '……少爷……阿福也会御剑了……飞……飞起来了……', '……松伯……阿福没偷吃……真的没有……', '……小桃……别揪阿福耳朵……', '……阿福……阿福能保护大家……', '……娘……雪好大……'];

  // ================= 院中支线（几段连着走、跨时辰跨天、几个人串在一起）+ 特别的日子 + 更多随机小事 =================
  // 作者 11-08：「还有各种隐藏支线结合起来啊，特殊事件，随机事件」
  // 支线：桃树之约（小桃）· 雪夜的长命锁（阿福 / 松伯）· 青禾的银针（青禾 / 小桃 / 小猫）· 宗主的回信（松伯）· 小猫不见了（小猫 / 小桃）
  // 特别的日子：每七日家宴；每五日松伯赶集（清早出门、黄昏带回食材）；第十二日小桃生辰、第二十四日青禾生辰（前两天会有人透口风）
  const curShi = () => shi() || (night() ? '戌' : '午');
  const keyItem = (id, name, desc) => { ITEM_DB[id] = ITEM_DB[id] || { name, desc, cat: '杂物' }; };
  keyItem('k_qz_sapling', '桃树苗', '竹影山阶老野桃根边挖的小苗，根上还带着土。要交给小桃。');
  keyItem('k_qz_peach', '一枝桃花', '青阳镇口老桃树上折的，用帕子包着。要带回去给小桃。');
  keyItem('k_qz_lock', '旧长命锁', '一把磨得发亮的小银锁，背面刻着一个「安」字。松伯收了好些年。');
  keyItem('k_qz_needle', '娘的银针', '青禾的娘留给她的银针，针尾缠着一圈褪了色的红线。');
  const take = id => { try { const b = S.hero.bag; if (b[id]) { b[id]--; if (b[id] <= 0) delete b[id]; } } catch (e) {} };
  const giveKey = async (id, why) => { await giveItem(id, 1, why); };
  const Q = () => { const f = F(); return f.qz_q = f.qz_q || {}; };
  const qNew = name => { toast('《青竹小记》· 新的支线：' + name, 2400); };
  const ING_IDS = ['ing_0', 'ing_1', 'ing_2', 'ing_3', 'ing_4', 'ing_5', 'ing_6', 'ing_7', 'ing_8', 'ing_9', 'ing_10', 'ing_11'];
  const QUESTS = {
    peach: { name: '桃树之约', who: 'maid2', hint: '入夜 · 小桃心里惦记着青阳镇的桃花', steps: {
      ask: { desc: '问问松伯，哪里能挖到桃树苗', type: 'talk', who: 'steward', run: async () => {
        await say('松伯·笑', '桃树苗？竹影山阶半山腰有棵老野桃，根边年年冒小苗。挖的时候轻着点，别伤了老树的根。'); return 'dig'; } },
      dig: { desc: '去竹影山阶，找那棵老野桃', type: 'spot', at: 'qingzhu_stairs', xy: [880, 1020], run: async () => {
        await narrate('石阶边的老桃树下，冒着一株细细的小苗，叶子嫩得发亮。叶孤星连土带根，小心地挖了出来。'); await giveKey('k_qz_sapling', '老野桃根边'); return 'give'; } },
      give: { desc: '白天把树苗交给小桃', type: 'talk', who: 'maid2', shi: ['卯', '午', '酉'], run: async q => {
        take('k_qz_sapling'); await say('侍女小桃·惊喜', '桃树苗！！少爷真的去挖了？！'); await narrate('小桃挑了西院花圃边向阳的一块地，挖坑、培土、浇水，一样一样做得仔仔细细。');
        await say('侍女小桃·笑', '等它开花，小桃就不想家啦。'); q.d = qday(); return 'sprout'; } },
      sprout: { desc: '等它扎根（过两三天的清晨，去花圃看看）', type: 'near', who: 'maid2', shi: ['卯'], need: q => qday() >= q.d + 2, run: async q => {
        await say('侍女小桃·大笑', '少爷！发芽了！冒了两片新叶子！'); await narrate('树苗还不到膝盖高，可枝头确实鼓起了两个小小的芽苞。'); q.d = qday(); return 'bloom'; } },
      bloom: { desc: '等桃花开', type: 'near', who: 'maid2', shi: ['卯', '午'], need: q => qday() >= q.d + 3, run: async () => {
        await narrate('西院那株小桃树，竟开了三朵花。粉粉的，在一片绿里格外显眼。'); await say('侍女小桃·感动', '……跟青阳镇的一模一样。少爷，谢谢您。');
        await narrate('小桃用落下的花瓣酿了一小坛桃花酿，非要少爷尝第一口。'); stat({ maxhp: 60, maxmp: 30 }, '气血上限 +60　灵力上限 +30（桃花酿）'); bond('maid2', 8); return 'done'; } },
      branch: { desc: '下山去青阳镇时，替小桃折一枝桃花', type: 'enter', at: 'qy_town', run: async () => {
        await narrate('青阳镇口的老桃树开得正好。叶孤星想起小桃的话，折下一枝，用帕子包好，揣进怀里。'); await giveKey('k_qz_peach', '青阳镇口'); return 'bring'; } },
      bring: { desc: '把桃花带回青竹小院给小桃', type: 'talk', who: 'maid2', run: async () => {
        take('k_qz_peach'); await narrate('叶孤星把那枝桃花递过去。花瓣有些蔫了，香味却还在。'); await say('侍女小桃·感动', '……是镇口那棵老桃树的。小桃认得，小时候天天在树底下卖花。');
        await say('侍女小桃·羞', '小桃要把花瓣压干，缝进香包里，一直带着。'); stat({ maxmp: 30 }, '灵力上限 +30'); bond('maid2', 8); return 'done'; } },
    } },
    lock: { name: '雪夜的长命锁', who: 'servant', hint: '子夜 · 阿福在梦里喊过「雪好大」', startNeed: () => seen(9) && bondV('servant') >= 20, first: 'ask', steps: {
      ask: { desc: '入夜去管事房问问松伯：阿福是怎么来的', type: 'talk', who: 'steward', shi: ['戌'], at: RM.steward, run: async () => {
        await say('松伯·叹气', '少爷想问阿福的事？……那年冬天雪大，山门外的石狮子都埋了半截。'); await say('松伯', '老头子去扫雪，在石狮子底下看见一个孩子，冻得嘴唇发紫，怀里死死攥着这个。');
        await narrate('松伯从柜子最里头摸出一只小布包，里面是一把磨得发亮的小银锁，背面刻着一个「安」字。');
        await say('松伯·感动', '老头子怕他看了伤心，一直没给他。……少爷，这锁，交不交给他，您来定。'); await giveKey('k_qz_lock', '松伯交给少爷'); return 'give'; } },
      give: { desc: '把长命锁交给阿福——或者，再等等', type: 'talk', who: 'servant', run: async q => {
        const i = await choose('长命锁', ['把锁交给阿福', '再等等']); if (i === 1) { await say('小厮阿福·笑', '少爷找阿福有事？'); return 'give'; }
        take('k_qz_lock'); await narrate('阿福接过银锁，翻过来，看见那个「安」字，愣了很久。'); await say('小厮阿福·感动', '……这是娘给的。阿福记得，娘说，戴着它，就平平安安的。');
        await say('小厮阿福·感动', '少爷……阿福不知道自己哪天生的。松伯捡到阿福那天，能不能……就算阿福的生辰？');
        await say('叶孤星', '好。过几天就是那天——到时候，给你做点好吃的。'); q.d = qday() + 3; return 'feast'; } },
      feast: { desc: '阿福的生辰（过几天的入夜）：带一道菜去他屋里', type: 'talk', who: 'servant', shi: ['戌'], at: RM.servant, need: q => qday() >= q.d, run: async () => {
        const have = dishesHave(); if (!have.length) { await say('小厮阿福·笑', '少爷来啦！……（阿福偷偷瞄了一眼少爷空着的手）'); await narrate('……该带点吃的来的。去厨房做一道吧。'); return 'feast'; }
        take(have[0]); await narrate('叶孤星端着一碗' + DISH[have[0]] + '推开门。身后，青禾端着长寿面，小桃捧着一盘桂花糕，松伯提着一壶酒。');
        await say('小厮阿福·惊喜', '……你们、你们怎么都来了？！'); await say('侍女小桃·大笑', '阿福生辰快乐！'); await say('松伯·笑', '这孩子，长这么大了。');
        await say('小厮阿福·感动', '……阿福有生辰了。阿福有家了。'); stat({ atk: 3 }, '攻击 +3（阿福把长命锁的红绳编进了少爷的剑穗）'); bond('servant', 10); bond('maid1', 2, true); bond('maid2', 2, true); return 'done'; } },
    } },
    needle: { name: '青禾的银针', who: 'maid1', hint: '黄昏 · 青禾好像在地上找什么', steps: {
      ask: { desc: '问问小桃有没有看见', type: 'talk', who: 'maid2', run: async () => {
        await say('侍女小桃·担心', '银针？……啊！小桃午后看见小猫叼着个亮晶晶的东西跑来跑去，还以为是鱼骨头！'); await say('侍女小桃', '它晌午最爱找块太阳地打盹，少爷去看看？'); return 'cat'; } },
      cat: { desc: '去找小猫——正午它爱在太阳地里打盹', type: 'near', who: 'cat', shi: ['午'], run: async () => {
        await narrate(cat() + '蜷在太阳地里睡得正香。叶孤星轻轻把它抱起来——它肚皮底下，压着一根细细的银针。'); await narrate(cat() + '睁开眼，看了看银针，又看了看少爷，「喵」了一声，像是在说：我替她看着呢。');
        await giveKey('k_qz_needle', '小猫肚皮底下'); return 'back'; } },
      back: { desc: '把银针还给青禾', type: 'talk', who: 'maid1', run: async () => {
        take('k_qz_needle'); await say('侍女青禾·惊喜', '……找到了？！'); await narrate('青禾接过银针，捏着针尾那圈褪色的红线，眼圈一下子红了。');
        await say('侍女青禾·感动', '这是娘留给青禾的……青禾以为再也找不着了。'); await say('侍女青禾·笑', '少爷的护腕旧了，青禾用这根针给少爷绣副新的。');
        stat({ def: 3 }, '防御 +3（青禾用娘的银针绣的护腕）'); bond('maid1', 6); bond('cat', 2, true); return 'done'; } },
    } },
    reply: { name: '宗主的回信', who: 'steward', hint: '子夜 · 管事房的灯亮着的那一晚以后', startNeed: () => seen(10), first: 'wait', steps: {
      wait: { desc: '等宗主回信（过两天的清晨，院里会落下一只灵鹤）', type: 'enter', at: COURT, shi: ['卯'], need: q => qday() >= (q.d || 0) + 2, run: async () => {
        await narrate('一只白羽灵鹤从云里落下来，收起翅膀，停在石桌上，脚上绑着一卷信。'); await say('松伯·惊喜', '宗主的回信！');
        await narrate('信里的字龙飞凤舞：「信收到了。孤星长高了，好。替阿福挑水，替小桃摘花，也好。院里那几个孩子，替我谢谢他们。」');
        await narrate('信的末尾还有一行小字：「附竹叶青一坛，院里人人有份。——叶擎苍」'); await say('星旋', '（你爹的字，跟他的剑一样，一笔都不肯收。）'); return 'write'; } },
      write: { desc: '给宗主回一句话（找松伯）', type: 'talk', who: 'steward', run: async () => {
        await say('松伯·笑', '少爷，给宗主回一句吧。老头子替您捎去。'); const i = await choose('回一句', ['「爹，我很好，院里的人都很好。」', '「爹，我想你了。」', '「爹，下回回来，我舞剑给你看。」']);
        await say('松伯·感动', ['好，好。宗主看了，准放心。', '……这句，宗主看了，怕是要在书房里坐一夜。', '好！宗主等着这一天，等了好些年了。'][i]);
        await narrate('信的夹层里还藏着一页剑诀心得，是宗主的亲笔。'); stat({ atk: 3 }, '攻击 +3（宗主的剑诀心得）');
        for (const k of ['maid1', 'maid2', 'servant']) bond(k, 3, true); toast('竹叶青 · 院里人人有份（青禾、小桃、阿福 情谊 +3）', 2400); return 'done'; } },
    } },
    cat: { name: '小猫不见了', who: 'cat', hint: '清晨 · 某天，小猫一整个早上都没露面', steps: {
      find: { desc: '找小猫：院子、厨房、竹影山阶……还是云海大亭？', type: 'spot', at: 'qingzhu_upper_pavilion', xy: [1240, 1180], run: async () => {
        await narrate('云海大亭的栏杆外，一棵歪脖子松树上，传来细细的「喵」声。' + cat() + '蹲在最高那根枝头，下不来了。');
        await narrate('叶孤星足尖一点上了树，把它揣进怀里。小东西在他胸口蹭了又蹭，抖个不停。'); return 'home'; } },
      home: { desc: '把小猫抱回去给小桃', type: 'talk', who: 'maid2', run: async () => {
        await say('侍女小桃·惊喜', '找到了！！少爷找到它了！！'); await narrate('小桃把' + cat() + '抱过去，又是亲又是骂。' + cat() + '缩在她怀里，乖得像只小鹌鹑。');
        await say('侍女小桃·笑', '以后不许乱跑了！……少爷，谢谢您。'); bond('maid2', 4); bond('cat', 4); return 'done'; } },
    } },
  };
  const qState = id => (Q()[id] || {}).s || '';
  const qStep = id => { const s = qState(id); return s && s !== 'done' ? QUESTS[id].steps[s] : null; };
  function qStart(id, s, extra) { const q = Q(); if (q[id]) return; q[id] = Object.assign({ s, d: qday() }, extra || {}); qNew(QUESTS[id].name);
    if (id === 'cat' && world.actors) world.actors = world.actors.filter(a => !(a.npc && a.npc.r139cat)); }
  let Q_BUSY = false;
  async function qRun(id) { const st = qStep(id); if (!st || Q_BUSY) return; Q_BUSY = true; world.locked = true; if (world.player) world.player.moving = false;
    try { const q = Q()[id]; const nx = await st.run(q); if (nx) { q.s = nx; if (nx === 'done') { toast('《青竹小记》· 支线完成：' + QUESTS[id].name, 2600); } } }
    catch (e) { console.warn('r162 quest', e); } finally { world.locked = false; Q_BUSY = false; } }
  const qOk = (st, q) => (!st.shi || st.shi.includes(curShi())) && (!st.at || st.at === world.mapName) && (!st.need || st.need(q));
  // 跟某人说话时：有支线这一步就先走支线
  function questTalk(who) { for (const id in QUESTS) { const st = qStep(id); if (st && st.type === 'talk' && st.who === who && qOk(st, Q()[id])) return id; } return null; }
  // 找东西的地方（亮一点微光）
  const spotFix = {};
  function spotXY(id, st) { const k = id + ':' + qState(id); if (spotFix[k]) return spotFix[k]; let [x, y] = st.xy; try { const T = world.map.T; if (typeof canStand === 'function' && !canStand(T, x, y)) {
      for (let r = 16; r < 240; r += 16) { let hit = null; for (let a = 0; a < 12 && !hit; a++) { const xx = x + Math.cos(a / 12 * 6.283) * r, yy = y + Math.sin(a / 12 * 6.283) * r; if (canStand(T, xx, yy)) hit = [xx, yy]; } if (hit) { [x, y] = hit; break; } } } } catch (e) {}
    return (spotFix[k] = [x, y]); }
  function sparkle(x, y, t) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const a = .55 + Math.sin(t * 3) * .2; const g = ctx.createRadialGradient(x, y - 20, 2, x, y - 20, 46); g.addColorStop(0, `rgba(255,240,190,${a})`); g.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = g; ctx.fillRect(x - 50, y - 70, 100, 100); ctx.restore(); prop('firefly', null, x, y - 26, 1.2); }
  // 支线 / 特别的日子：每帧检查（任何地图都查——青阳镇折桃花在青竹外面）
  const SP = {};   // 特别的日子今天放过没有
  if (typeof tileUpdate === 'function') tileUpdate = (o => function (dt) { o.apply(this, arguments);
    try {
      if (!world.map || world.locked || Q_BUSY || (typeof dialog !== 'undefined' && dialog) || (typeof choice !== 'undefined' && choice) || (window.MAP_READY && !MAP_READY())) return;
      const f = F(), p = world.player; if (!p) return;
      for (const id in QUESTS) { const Qd = QUESTS[id]; if (!Q()[id] && Qd.startNeed && Qd.startNeed(f)) qStart(id, Qd.first, { d: qday() }); }
      if (EV_T < 1.2) return;
      for (const id in QUESTS) { const st = qStep(id); if (!st || !qOk(st, Q()[id])) continue;
        if (st.type === 'enter') { qRun(id); return; }
        if (st.type === 'spot') { const [x, y] = spotXY(id, st); if (Math.hypot(p.x - x, p.y - y) < 64) { qRun(id); return; } }
        if (st.type === 'near') { const a = (world.actors || []).find(x => x.npc && (st.who === 'cat' ? x.npc.r139cat : (x.npc.q162 && x.npc.q162.who === st.who) || x.npc.r135e === st.who) && x.x > -9e4); if (a && Math.hypot(p.x - a.x, p.y - a.y) < 110) { qRun(id); return; } } }
      if (!ON() || !QZ(world.mapName)) return;
      const d = qday(), s = shi();
      // 七日家宴：第 7、14、21……日的黄昏，西院石桌
      if (d % 7 === 0 && s === '酉' && world.mapName === COURT && SP.feast !== d) { SP.feast = d; f.qz_feast = (f.qz_feast || 0) + 1; world.locked = true; (async () => { try { await feast(); } finally { world.locked = false; } })(); return; }
      // 生辰
      for (const [k, day, dish] of [['maid2', 12, ['cook_guihua', 'cook_lianzi']], ['maid1', 24, ['cook_sun', 'cook_dan']]]) {
        const id = k + ':bday'; if (d >= day && s === '酉' && world.mapName === COURT && !hidSeen(id) && SP[id] !== d) { SP[id] = d; world.locked = true; (async () => { try { await bday(k, dish); f.qz_hid = f.qz_hid || {}; f.qz_hid[id] = 1; } finally { world.locked = false; } })(); return; } }
    } catch (e) { console.warn('r162 quest tick', e); } })(tileUpdate);
  async function feast() {
    await narrate('今天是第 ' + qday() + ' 日——院里的规矩，每七日，大家围着西院的石桌吃一顿。');
    await narrate('青禾端上一锅竹笋鲜汤，小桃摆了一盘桂花糕，阿福抱来一坛松伯珍藏的米酒，' + cat() + '蹲在桌角，盯着鱼。');
    const L = pick([[['小厮阿福·大笑', '少爷，阿福敬您一杯！……就一小口，松伯说阿福还小。'], ['松伯·念叨', '是一小口，不是一小坛。']],
      [['侍女小桃·得意', '今天的桂花糕是小桃蒸的！谁说不好吃，就不给他夹第二块！'], ['侍女青禾·嗔', '……盐放多了，小桃。']],
      [['松伯·笑', '少爷小时候吃饭，饭粒能撒一桌子，阿福都没你撒得多。'], ['小厮阿福·得意', '真的？！少爷也有这时候？']]]);
    for (const [w, t] of L) await say(w, t);
    await say('星旋', '（……这一桌，比天剑宗的大宴热闹多了。）'); await narrate('月亮升起来的时候，石桌上的碗碟都空了。'); healAll(false);
    for (const k of ['maid1', 'maid2', 'servant']) bond(k, 2, true); bond('cat', 1, true); toast('七日家宴 · 院里人人情谊 +2', 2400);
  }
  async function bday(k, dish) {
    const nm = BOND_NAME[k], have = dish.find(id => itemCount(id) > 0);
    await narrate('黄昏时，院里的人都悄悄聚到了西院石桌边——今天是' + nm + '的生辰。');
    if (have) { take(have); await narrate('叶孤星把一碗' + DISH[have] + '放到' + nm + '面前。');
      await say(WHO[k] + '·感动', k === 'maid2' ? '……少爷记得小桃的生辰？还做了小桃最爱吃的！……呜，小桃要哭了。' : '……少爷记得青禾的生辰。还是青禾最爱的。……青禾不知道该说什么好。');
      bond(k, 10); stat(k === 'maid2' ? { maxmp: 40 } : { maxhp: 80 }, nm + '生辰 · ' + (k === 'maid2' ? '灵力上限 +40' : '气血上限 +80')); }
    else { await say(WHO[k] + '·笑', k === 'maid2' ? '大家都来了！……少爷也来了，小桃就很高兴啦！' : '……大家都记着呢。少爷能来，青禾就很高兴了。'); await narrate('……要是带上她最爱吃的那道菜就好了。'); bond(k, 3); }
    setTimeout(() => toast('《青竹小记》· 特别的日子：' + nm + '的生辰', 2200), 1500);
  }
  // 赶集日：每五日（第 2、7、12……日）松伯清早下山赶集（卯、午不在院里，见 planOf），黄昏回来带了食材
  const marketDay = () => qday() % 5 === 2;
  // 子时以外，原来那几位（没选时辰时在院里的人）说话也先走支线
  setTimeout(() => { for (const key in ORIG) { const n = ORIG[key], who = key.split('_')[0]; const t0 = n.talk; n.talk = async a => { const id = questTalk(who); if (id) return qRun(id); return typeof t0 === 'function' ? t0(a) : undefined; }; } }, 0);
  // 小猫不见了：找到之前院里没有它
  { const cn = catNpc(); if (cn) { const c0 = cn.cond; cn.cond = function () { if (qState('cat') === 'find') return false; return !c0 || c0.apply(this, arguments); }; } }
  // 更多随机小事（几个人串在一起的）+ 支线的开头 + 特别日子的透口风
  EVS.push(
    { id: 'maid2:quarrel', who: 'maid2', shi: '午', type: 'near', p: .3, b: 1, title: '小桃和阿福拌嘴', hint: '正午 · 院里有两个人谁也不让谁', run: async () => {
      await say('侍女小桃·委屈', '少爷你评评理！阿福说小桃种的花是「草」！'); await say('小厮阿福·委屈', '阿福没说是草！阿福说的是……长得像草。');
      const i = await choose('', ['帮小桃', '帮阿福', '「各罚一碗桂花糕，给我。」']);
      if (i === 0) { await say('小厮阿福·委屈', '……少爷偏心。'); bond('maid2', 2, true); }
      else if (i === 1) { await say('侍女小桃·嗔', '哼！少爷和阿福一伙的！'); bond('servant', 2, true); }
      else { await narrate('两个人对看了一眼，噗嗤一声，都笑了。'); bond('maid2', 1, true); bond('servant', 1, true); } } },
    { id: 'maid1:contest', who: 'maid1', shi: '酉', type: 'near', p: .25, need: () => bondV('maid1') >= 8 && bondV('maid2') >= 8, b: 1, title: '谁绣得好', hint: '黄昏 · 两个姑娘拿着绣绷来找少爷', run: async () => {
      await narrate('青禾和小桃一人拿着一块绣绷跑过来，一块绣的是竹子，一块绣的……大概是一只猫。'); await say('侍女小桃·得意', '少爷！哪个好看？说实话！');
      const i = await choose('', ['青禾的竹子', '小桃的……猫', '「都好看。」']);
      if (i === 0) { await say('侍女小桃·委屈', '……小桃这是兔子！'); await say('侍女青禾·笑', '小桃的兔子也很好看。'); bond('maid1', 2, true); }
      else if (i === 1) { await say('侍女小桃·大笑', '少爷有眼光！'); await say('侍女青禾·嗔', '……那是兔子，少爷。'); bond('maid2', 2, true); }
      else { await say('侍女青禾·嗔', '少爷就会和稀泥。'); await say('侍女小桃·笑', '不过小桃爱听！'); bond('maid1', 1, true); bond('maid2', 1, true); } } },
    { id: 'steward:birds2', who: 'steward', shi: '卯', type: 'near', p: .35, need: f => !!f.qz_bird, b: 1, title: '雀儿又来了', hint: '清晨 · 治好过一只雀儿以后', run: async () => {
      await narrate('窗台上那只雀儿又来了，还带来了两只伴儿，叽叽喳喳地抢松伯手里的米。'); await say('松伯·笑', '少爷救下的那只，如今成了这一片的头儿了。'); } },
    { id: 'servant:practice', who: 'servant', shi: '卯', type: 'near', p: .4, need: f => !!f.qz_afu_sword, b: 2, title: '阿福练剑', hint: '清晨 · 教过他一招以后', run: async () => {
      const f = F(); f.qz_afu_sw_n = (f.qz_afu_sw_n || 0) + 1; const n = f.qz_afu_sw_n;
      await narrate(['阿福拿着扫帚又在院门后比划，起手式已经像模像样了。', '阿福一招一式练得认真，扫帚带起的风，把落叶卷成了一个小圈。', '阿福练完一套，收势站定，冲少爷抱了抱拳。'][Math.min(2, n - 1)]);
      await say('小厮阿福·得意', ['少爷，阿福练了一百遍了！', '少爷您看，阿福这一下是不是有点剑气了？', '少爷……阿福以后，也能跟着您下山吗？'][Math.min(2, n - 1)]);
      if (n === 3) { await say('叶孤星', '……先把院子守好。等你练成了，我带你下山。'); await say('小厮阿福·感动', '一言为定！'); stat({ spd: 1 }, '速度 +1（陪阿福练剑）'); } } },
    { id: 'steward:market', who: 'steward', shi: '酉', type: 'talk', p: 1, need: () => marketDay(), b: 1, title: '赶集回来', hint: '每五日 · 松伯清早下山赶集', run: async () => {
      await say('松伯·笑', '少爷，老头子今儿下山赶了趟集，给厨房添了些东西——少爷拿去做菜吧。');
      const got = {}; for (let i = 0; i < 3; i++) { const id = pick(ING_IDS); got[id] = (got[id] || 0) + 1; }
      const list = Object.entries(got).map(([id, n]) => { addItem(id, n); return ITEM_DB[id].name + '×' + n; }); toast('松伯带回来的：' + list.join('、'), 2600); } },
    { id: 'servant:marketsay', who: 'servant', shi: '卯', type: 'talk', p: 1, need: () => marketDay(), b: 1, title: '松伯去赶集了', hint: '每五日 · 一大早院里少了一个人', run: async () => {
      await say('小厮阿福·笑', '少爷找松伯？松伯天不亮就下山赶集去了，说黄昏回来。……他不在，阿福能偷个懒！'); } },
    { id: 'maid1:bdayhint', who: 'maid1', shi: '午', type: 'talk', once: 1, p: 1, need: () => qday() >= 10 && !hidSeen('maid2:bday'), b: 1, title: '青禾透的口风', hint: '第十日以后 · 有人的生辰快到了', run: async () => {
      await say('侍女青禾·笑', '少爷……小声跟您说，第十二日是小桃的生辰。她嘴上不说，心里盼着呢。'); await say('侍女青禾', '她最爱吃甜的——桂花糕、莲子羹，都行。'); } },
    { id: 'maid2:bdayhint', who: 'maid2', shi: '午', type: 'talk', once: 1, p: 1, need: () => qday() >= 22 && !hidSeen('maid1:bday'), b: 1, title: '小桃透的口风', hint: '第二十二日以后 · 又有人的生辰快到了', run: async () => {
      await say('侍女小桃·得意', '少爷少爷，告诉您个秘密——第二十四日是青禾姐的生辰！'); await say('侍女小桃', '青禾姐最爱竹笋汤，还有她自己蒸的那种蛋羹。少爷做给她吃，她肯定高兴坏了！'); } },
    { id: 'maid1:needle', who: 'maid1', shi: '酉', type: 'near', once: 1, p: .5, need: () => bondV('maid1') >= 8, b: 1, title: '丢了的银针', hint: '黄昏 · 青禾好像在地上找什么', run: async () => {
      await narrate('青禾蹲在晾衣架下，一寸一寸地翻着草丛。'); await say('侍女青禾·担心', '少爷……青禾的银针不见了。是娘留给青禾的，就那一根。'); qStart('needle', 'ask'); } },
    { id: 'cat:gone', who: 'cat', shi: '卯', type: 'door', once: 1, p: .4, need: f => !!f.cat_name && (f.cat_feeds || 0) >= 3, b: 1, title: '一早上没露面', hint: '清晨 · 某天，小猫一整个早上都没露面', run: async () => {
      await say('侍女小桃·担心', '少爷！' + cat() + '不见了！一早上都没看见它，碗里的饭也没动！'); qStart('cat', 'find'); } },
  );
  for (const e of EVS.slice(-10)) EVBY[e.id] = e;
  SECRETS.push(...EVS.slice(-10).filter(e => !SECRETS.includes(e)));
  SECRETS.push({ id: 'maid2:bday', who: 'maid2', shi: '酉', title: '小桃的生辰', hint: '特别的日子 · 第十二日' }, { id: 'maid1:bday', who: 'maid1', shi: '酉', title: '青禾的生辰', hint: '特别的日子 · 第二十四日' });

  // ================= 院里的手艺：青禾缝衣甲、小桃誊抄剑诀、阿福打听消息 + 捎食材、松伯管院里的账 =================
  // 作者 11-08：「青禾开放装备功能？随着亲密度增加，她能帮你制作的装备等级就越高，但肯定不是有求于她……小桃可以制造技能书，高级技能书别的地方买不到，
  //   只有 boss 会掉落或者野外宝箱能捡到；小桃随着亲密度提高可以有高级的，最开始是初级的。也要花灵石，但这个钱肯定不能说给小桃的，因为她是佣人——想想合理化。」
  // 合理化：
  //  · 钱不经她们的手：少爷把灵石交给松伯「入账」（院里的公账）。青禾的布料绣线、小桃的灵墨宣纸，都是松伯赶集时从公账里买的。少爷从不付钱给谁。
  //  · 不是去求她们做：青禾本就管着少爷的衣裳，是她看见少爷带回来的兽皮、看见少爷的甲旧了，主动说要缝；小桃常去藏经阁帮守阁师兄晒书，师兄夸她字好，
  //    准她把阁里的剑诀誊抄给少爷——她想替少爷做点什么。情谊越深，她们越肯熬夜做费工夫的东西（高阶的衣甲、卷四卷五那样厚的剑诀）。
  //  · 做东西要时间：交给她们以后，睡一觉（歇到更早的时辰 = 新的一天）才好；第二天清晨，东西就放在少爷门口 / 桌上。
  //  · 高阶剑诀（卷四、卷五）：典籍阁不再卖 —— 只有首领掉落、野外宝箱里捡到，或者小桃情谊够深时在藏经阁誊抄。
  const fund = () => F().qz_fund || 0;
  const spend = n => { const f = F(); if ((f.qz_fund || 0) < n) return false; f.qz_fund -= n; return true; };
  const have = id => (S.hero.bag && S.hero.bag[id]) || 0;
  const matsOk = m => Object.entries(m).every(([id, n]) => have(id) >= n);
  const matsTxt = m => Object.entries(m).map(([id, n]) => (ITEM_DB[id] ? ITEM_DB[id].name : id) + '×' + n + '（有 ' + have(id) + '）').join('、');
  const takeMats = m => { for (const [id, n] of Object.entries(m)) for (let i = 0; i < n; i++) take(id); };
  const SEW = [
    { id: 'a_qz_chen', lv: 1, slot: 'armor', name: '青禾缝的软甲衬', def: 10, maxhp: 60, mats: { m_hide: 3 }, fund: 120, days: 1, desc: '兽皮鞣软了，里外两层，针脚密得透不进风。' },
    { id: 'c_qz_huwan', lv: 2, slot: 'acc', name: '竹纹护腕', def: 5, atk: 3, mats: { m_hide: 2, m_fang: 2 }, fund: 220, days: 1, desc: '腕口绣着一圈细竹，狼牙磨成扣子。' },
    { id: 'a_qz_jinzhuang', lv: 3, slot: 'armor', name: '青竹劲装', def: 16, maxhp: 120, spd: 1, mats: { m_hide: 5, m_horn: 1 }, fund: 520, days: 2, desc: '犀角削成薄片缝在要害处，穿着却一点不沉。' },
    { id: 'c_qz_xiudai', lv: 4, slot: 'acc', name: '云纹绣带', def: 6, maxmp: 60, mats: { m_tooth: 3, m_hide: 3 }, fund: 860, days: 2, desc: '青禾用娘教的针法绣的云纹，系在腰间，灵力流转都顺了几分。' },
    { id: 'a_qz_zhuying', lv: 5, slot: 'armor', name: '青禾手绣 · 竹影法衣', def: 22, maxhp: 180, maxmp: 40, mats: { m_hide: 8, m_horn: 2, m_tooth: 2 }, fund: 1500, days: 3, desc: '一针一线绣了三个夜晚。衣摆的竹影，风一吹就像在动。' },
  ];
  for (const g of SEW) { const o = Object.assign({}, g); delete o.lv; delete o.mats; delete o.fund; delete o.days; o.desc = g.desc + '（青禾缝的）'; ITEM_DB[g.id] = ITEM_DB[g.id] || o; }
  const COPY = [{ id: 'juan2', lv: 1, fund: 150, days: 1 }, { id: 'juan3', lv: 2, fund: 420, days: 2 }, { id: 'juan4', lv: 3, fund: 1100, days: 2 }, { id: 'juan5', lv: 4, fund: 2200, days: 3 }];
  const copyCost = c => { const fam = lvOf(bondV('maid2')) >= 5; return { fund: Math.round(c.fund * (fam ? .75 : 1)), days: Math.max(1, c.days - (fam ? 1 : 0)) }; };
  const JOBS = () => { const f = F(); return f.qz_jobs = f.qz_jobs || {}; };
  const lvN = k => lvOf(bondV(k));
  // —— 青禾：看见少爷带回来的料子，主动说要缝 ——
  async function sewOffer(auto) {
    const f = F(), J = JOBS(); if (J.maid1) { await say('侍女青禾·笑', '少爷那件' + ITEM_DB[J.maid1.id].name + '，青禾还在缝呢。' + (qday() >= J.maid1.ready ? '明早就放在少爷门口。' : '再等' + (J.maid1.ready - qday()) + '个早上。')); return; }
    const can = SEW.filter(g => g.lv <= lvN('maid1'));
    if (!can.length) return;
    const ok = can.filter(g => matsOk(g.mats));
    if (auto && !ok.length) return;
    if (!ok.length) { await say('侍女青禾·笑', '少爷下回再带些兽皮、狼牙回来，青禾给少爷缝件结实的。'); return; }
    await say('侍女青禾·认真', pick(['少爷带回来的那几张兽皮，青禾看过了，皮子不错。……青禾想给少爷缝件新的。', '少爷身上那件，袖口又磨了。青禾用少爷带回来的料子，再缝一件吧。', '少爷出门在外，衣甲要结实。青禾这里有几个新样子，少爷挑一个？']));
    const opts = ok.map(g => g.name + '　' + matsTxt(g.mats) + '　· 布料绣线 ' + g.fund + ' 灵石（院里的账）· ' + g.days + ' 日');
    const i = await choose('青禾想缝的', [...opts, '先不用了']); if (i >= ok.length) { await say('侍女青禾·笑', '那青禾先把料子收着，少爷想要了再说。'); return; }
    const g = ok[i];
    if (!spend(g.fund)) { await say('侍女青禾·担心', '……绣线和衬布得等松伯下回赶集买。松伯说，院里的账上眼下紧了些。'); await narrate('（得了灵石，记得交些给松伯入账——院里的开销都从那儿出。）'); f.qz_fund_hint = 1; return; }
    takeMats(g.mats); J.maid1 = { id: g.id, ready: qday() + g.days }; await say('侍女青禾·笑', '那青禾这几晚就缝。好了放在少爷门口。'); bond('maid1', 1, true);
  }
  // —— 小桃：去藏经阁帮着晒书，誊抄剑诀给少爷 ——
  async function copyOffer() {
    const f = F(), J = JOBS(); if (J.maid2) { await say('侍女小桃·得意', ITEM_DB[J.maid2.id].name + '小桃还在抄呢！' + (qday() >= J.maid2.ready ? '明早就放在少爷桌上！' : '还差' + (J.maid2.ready - qday()) + '个晚上。')); return; }
    const can = COPY.filter(c => c.lv <= lvN('maid2'));
    if (!can.length) return;
    await say('侍女小桃·得意', pick(['守阁师兄说小桃的字好看，准小桃把阁里的剑诀抄给少爷！少爷要哪一卷？', '藏经阁又要晒书啦！少爷要小桃抄哪一卷，小桃就抄哪一卷！']));
    const opts = can.map(c => { const k = copyCost(c); return ITEM_DB[c.id].name + '　灵墨宣纸 ' + k.fund + ' 灵石（院里的账）· ' + k.days + ' 日' + (c.lv >= 3 ? '　典籍阁不卖' : ''); });
    const i = await choose('请小桃誊抄', [...opts, '先不用了']); if (i >= can.length) return;
    const c = can[i], k = copyCost(c);
    if (!spend(k.fund)) { await say('侍女小桃·委屈', '……灵墨好贵的，松伯说院里的账上不够了。'); await narrate('（得了灵石，记得交些给松伯入账——院里的开销都从那儿出。）'); f.qz_fund_hint = 1; return; }
    J.maid2 = { id: c.id, ready: qday() + k.days };
    await say(c.lv >= 3 ? '侍女小桃·认真' : '侍女小桃·大笑', c.lv >= 3 ? '这一卷好厚……没关系！小桃熬几个晚上就抄好了。' : '包在小桃身上！'); bond('maid2', 1, true);
  }
  // —— 阿福：下山挑东西时打听来的消息（哪张图还有没开的箱子）；托他跟着松伯赶集捎食材 ——
  const DIR9 = ['西北角', '北边', '东北角', '西边', '中间', '东边', '西南角', '南边', '东南角'];
  function newsList() { const v = F().visited || {}, out = [], L = lvN('servant');
    for (const m in TMAPS) { if (!v[m] && !(L >= 4)) continue; const M = TMAPS[m]; const B = (typeof CXB2 !== 'undefined' && CXB2[m]) || M.baked; if (!M.chests || !B) continue;
      if (L < 2 && !/^(qingzhu_|tj_)/.test(m)) continue;
      for (const ch of M.chests) { if (S.flags['chest_' + m + '_' + ch.c + '_' + ch.r]) continue; const x = (ch.c + .5) * 64, y = (ch.r + 1) * 64, w = B.w || 2000, h = B.h || 1500;
        out.push({ m, name: (M.title || m), dir: DIR9[Math.min(2, Math.floor(y / h * 3)) * 3 + Math.min(2, Math.floor(x / w * 3))] }); } }
    return out; }
  async function newsTalk() {
    const f = F(); if (f.qz_news_d === qday()) { await say('小厮阿福·笑', '今儿没新鲜事啦，少爷。等阿福明儿下山再给您打听！'); return; }
    const L = newsList(); f.qz_news_d = qday();
    if (!L.length) { await say('小厮阿福·得意', '少爷，阿福打听了一圈——少爷去过的地方，箱子都让少爷开光啦！'); return; }
    const n = pick(L); await say('小厮阿福·得意', pick(['少爷，阿福下山挑东西，听镇上的猎户说——', '少爷，阿福跟集上卖山货的大叔聊了半天——']));
    await say('小厮阿福', '「' + n.name + '」' + (lvN('servant') >= 3 ? n.dir : '那边') + '，有只箱子还没人动过！' + (lvN('servant') >= 3 ? '' : '具体在哪儿……大叔也没说清。'));
    bond('servant', 1, true);
  }
  const ING_N = ['竹笋', '莲子', '红枣', '桂花', '糯米', '青菜', '豆腐', '香菇', '鸡蛋', '灵米', '山药', '蜂蜜'], ING_P = [12, 15, 10, 18, 10, 6, 8, 14, 8, 30, 16, 20];
  async function errand() {
    const f = F(), J = JOBS(); if (J.servant) { await say('小厮阿福·笑', '少爷托的食材阿福记着呢！等松伯下回赶集，阿福跟着去背回来。'); return; }
    await say('小厮阿福·得意', '少爷要什么食材？下回松伯赶集，阿福跟着去——山下集上的东西比宗门集市便宜两成！');
    const i = await choose('托阿福捎（每样 3 份，院里的账）', [...ING_N.map((n, k) => n + '　' + Math.round(ING_P[k] * .8 * 3) + ' 灵石'), '不用了']); if (i >= ING_N.length) return;
    const cost = Math.round(ING_P[i] * .8 * 3); if (!spend(cost)) { await say('小厮阿福·委屈', '松伯说院里的账上不够了……少爷得先交些灵石给松伯。'); f.qz_fund_hint = 1; return; }
    J.servant = { id: 'ing_' + i, n: 3 }; await say('小厮阿福·大笑', '好嘞！' + ING_N[i] + '三份，阿福记下了！'); bond('servant', 1, true);
  }
  // —— 松伯：院里的账 ——
  async function ledger() {
    const h = S.hero;
    if (!F().qz_fund_told) { F().qz_fund_told = 1; await say('松伯·认真', '少爷，院里的开销——给少爷添衣裳的布料、给少爷抄书的纸墨、厨房的米面——都记在老头子这本账上。');
      await say('松伯·笑', '少爷手头有了灵石，交些给老头子入账就是。他们几个要用什么，老头子去集上买。少爷不用操心找谁付钱。'); }
    for (;;) { const i = await choose('院里的账：' + fund() + ' 灵石（少爷身上 ' + h.gold + '）', ['交 100 灵石入账', '交 500 灵石入账', '交 2000 灵石入账', '取回 500 灵石', '合上账本']);
      const amt = [100, 500, 2000][i];
      if (amt) { if (h.gold < amt) { await say('松伯·笑', '少爷身上没那么多，先留着防身吧。'); continue; } h.gold -= amt; F().qz_fund = fund() + amt; try { playSnd('ui_confirm', .5); } catch (e) {} continue; }
      if (i === 3) { const n = Math.min(500, fund()); if (!n) { await say('松伯·笑', '账上空着呢。'); continue; } F().qz_fund = fund() - n; h.gold += n; continue; }
      return; }
  }
  // —— 第二天清晨：做好的东西放在门口 / 桌上 ——
  let DELIV = false;
  async function deliver() {
    const J = JOBS(), d = qday(); DELIV = true; world.locked = true;
    try {
      if (J.maid1 && d >= J.maid1.ready) { const id = J.maid1.id; delete J.maid1; await narrate('门口的小凳上，叠着一件新缝好的衣甲，上面压着一枝竹叶。'); await giveItem(id, 1, '青禾缝的'); }
      if (J.maid2 && d >= J.maid2.ready) { const id = J.maid2.id; delete J.maid2; await narrate('桌上压着一卷新抄的剑诀，墨还带着点香。字迹圆圆的，末尾画了一朵小花——是小桃的字。'); await giveItem(id, 1, '小桃誊抄'); }
    } finally { DELIV = false; world.locked = false; }
  }
  // 赶集日黄昏：阿福捎回来的食材
  const errandDue = () => { const J = JOBS(); return J.servant && marketDay() && shi() === '酉'; };
  async function errandBack() { const J = JOBS(), j = J.servant; delete J.servant; await say('小厮阿福·大笑', '少爷！您托的' + ITEM_DB[j.id].name + '，阿福背回来啦！'); addItem(j.id, j.n); toast('获得：' + ITEM_DB[j.id].name + ' ×' + j.n, 1800); }
  if (typeof tileUpdate === 'function') tileUpdate = (o => function (dt) { o.apply(this, arguments);
    try { if (!ON() || DELIV || world.locked || (typeof dialog !== 'undefined' && dialog) || (typeof choice !== 'undefined' && choice) || (window.MAP_READY && !MAP_READY())) return;
      const J = JOBS(), d = qday();
      if (shi() === '卯' && (world.mapName === 'tj_room' || world.mapName === COURT) && ((J.maid1 && d >= J.maid1.ready) || (J.maid2 && d >= J.maid2.ready))) { deliver(); return; }
      if (errandDue() && world.mapName === COURT) { DELIV = true; world.locked = true; errandBack().finally(() => { DELIV = false; world.locked = false; }); }
    } catch (e) {} })(tileUpdate);
  // —— 首领掉落、野外宝箱里的高阶剑诀（典籍阁不再卖卷四、卷五）——
  { const s0 = window.SK4_SHOP; if (s0) window.SK4_SHOP = function () { return (s0.apply(this, arguments) || []).filter(id => id !== 'juan4' && id !== 'juan5'); }; }
  setTimeout(() => { for (const id of ['juan4', 'juan5']) if (ITEM_DB[id]) ITEM_DB[id].desc = (ITEM_DB[id].desc || '') + '　典籍阁不售：首领身上、野外宝箱里偶尔能得，或请小桃在藏经阁誊抄。'; }, 0);
  if (typeof startBattle === 'function') startBattle = (o => function (cfg) { const r = o.apply(this, arguments); try { if (cfg && cfg.boss && r && r.then) r.then(w => { if (!w) return; const L = S.hero.lv || 1;
      const id = L >= 21 && Math.random() < .3 ? 'juan5' : L >= 16 && Math.random() < .5 ? 'juan4' : null; if (id) { addItem(id, 1); setTimeout(() => toast('首领身上掉出一卷：' + ITEM_DB[id].name, 2600), 1200); } }); } catch (e) {} return r; })(startBattle);
  const WILD = m => !QZ(m) && !/^(tj_|qy_town|xt_city|xt_manor|lin_(manor|court|guest|study|yi_room|service|teahouse|servants))/.test(m);
  const hash = s => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
  function seedChests(name) { const L = S.hero.lv || 1; if (!WILD(name) || L < 16) return;
    for (const ch of world.chests || []) { if (ch.opened || ch._q162) continue; ch._q162 = 1; const h = hash(name + ':' + ch.c + ':' + ch.r) % 100;
      if (L >= 21 && h < 6) ch.items = ch.items.concat([['juan5', 1]]); else if (h < 14) ch.items = ch.items.concat([['juan4', 1]]); } }
  // 手艺头一回开放：各一件秘密
  EVS.push(
    { id: 'maid1:sew', who: 'maid1', shi: '戌', type: 'talk', once: 1, p: 1, need: () => bondV('maid1') >= 8, b: 2, title: '少爷带回来的兽皮', hint: '入夜 · 熟络以后，她看上了少爷带回来的料子', run: async () => {
      await narrate('青禾屋里，桌上摊着少爷带回来的几张兽皮，她拿指尖一寸一寸地捻着。'); await say('侍女青禾·笑', '少爷，这皮子鞣一鞣，能缝件好软甲。……少爷的衣裳，本就该青禾管。');
      await say('侍女青禾', '往后少爷带回来什么料子，都给青禾看看——兽皮、狼牙、犀角，青禾都有用处。'); F().qz_sew = 1; toast('青禾 · 能给少爷缝衣甲了（跟她说话时会提起）', 2600); } },
    { id: 'maid2:books', who: 'maid2', shi: '午', type: 'near', once: 1, p: .7, need: () => bondV('maid2') >= 8, b: 2, title: '脸上的墨点', hint: '正午 · 熟络以后，她从藏经阁回来', run: async () => {
      await narrate('小桃从院门外蹦进来，鼻尖上还沾着一点墨。'); await say('侍女小桃·得意', '少爷！小桃今天去藏经阁帮守阁师兄晒书啦！师兄说小桃的字圆圆的，好看！');
      await say('侍女小桃·大笑', '师兄还说——小桃要是愿意，可以把阁里的剑诀抄一份给少爷！小桃能给少爷抄书了！'); F().qz_copy = 1; toast('小桃 · 能替少爷誊抄剑诀了（跟她说话时会提起）', 2600); } },
    { id: 'servant:news', who: 'servant', shi: '卯', type: 'near', once: 1, p: .7, need: () => bondV('servant') >= 8, b: 2, title: '山下听来的消息', hint: '清晨 · 熟络以后，他下山挑东西时听来点什么', run: async () => {
      await say('小厮阿福·得意', '少爷少爷！阿福下山挑东西，听猎户大叔说，山里有些箱子埋了好多年都没人开过！'); await say('小厮阿福', '往后阿福多打听打听，有消息就告诉少爷！……阿福还能跟着松伯赶集，给少爷捎食材。');
      F().qz_news = 1; toast('阿福 · 能打听消息、捎食材了（跟他说话时会提起）', 2600); } },
  );
  for (const e of EVS.slice(-3)) EVBY[e.id] = e; SECRETS.push(...EVS.slice(-3));
  // 跟他们说话以后：送吃的 / 手艺（青禾看见料子会自己先开口）
  async function afterTalk(who) {
    const f = F(), J = JOBS(), key = qday() + ':' + shi(), o = [], fn = [];
    if (who === 'maid1' && f.qz_sew && !J.maid1 && SEW.some(g => g.lv <= lvN('maid1') && matsOk(g.mats)) && f.qz_sew_ask !== key) { f.qz_sew_ask = key; return sewOffer(true); }
    if (canGift(who)) { o.push('送点吃的'); fn.push(() => gift(who)); }
    if (who === 'maid1' && f.qz_sew) { o.push('（把带回来的料子拿给青禾看看）'); fn.push(() => sewOffer(false)); }
    if (who === 'maid2' && f.qz_copy) { o.push('「藏经阁最近晒书了吗？」'); fn.push(copyOffer); }
    if (who === 'servant' && f.qz_news) { o.push('「最近山下有什么消息？」', '托阿福下回赶集捎食材'); fn.push(newsTalk, errand); }
    if (!o.length) return; const i = await choose('', [...o, '没事了']); if (i >= 0 && i < fn.length) return fn[i]();
  }
  const CRAFT_TXT = k => { const f = F(), J = JOBS(), L = lvN(k);
    if (k === 'maid1') return f.qz_sew ? '手艺：缝衣甲 · 能做 ' + SEW.filter(g => g.lv <= L).length + ' / ' + SEW.length + ' 样' + (J.maid1 ? '　· 在缝：' + ITEM_DB[J.maid1.id].name : '') : '手艺：？？？（熟络以后，入夜去她屋里）';
    if (k === 'maid2') return f.qz_copy ? '手艺：誊抄剑诀 · 最高 ' + (COPY.filter(c => c.lv <= L).slice(-1)[0] ? ITEM_DB[COPY.filter(c => c.lv <= L).slice(-1)[0].id].name : '—') + (J.maid2 ? '　· 在抄：' + ITEM_DB[J.maid2.id].name : '') : '手艺：？？？（熟络以后，正午她会从外面回来）';
    if (k === 'servant') return f.qz_news ? '手艺：打听消息、赶集捎食材' + (L >= 3 ? '（能说清方位了）' : '') + (J.servant ? '　· 托他捎：' + ITEM_DB[J.servant.id].name : '') : '手艺：？？？（熟络以后，清晨他从山下回来）';
    if (k === 'steward') return '管着院里的账：' + fund() + ' 灵石　· 传送玉符';
    return ''; };

  // ---------- 《青竹小记》（少爷居室桌上）----------
  const BKF_T = '"GuxingDF","GuxingWKB","Kaiti SC","STKaiti",serif', BKF = '"GuxingWKB","GuxingKai","Kaiti SC","STKaiti",serif';
  const UIK = {}; const uik = k => UIK[k] || (UIK[k] = (() => { const im = new Image(); im.src = k; return im; })()); const okIm = im => im && im.complete && im.naturalWidth;
  function bkFrame(x, y, w, h) { const B = uik('igf2/frame_bottom.webp'), M = uik('igf2/frame_body_tile.webp');
    if (!okIm(B) || !okIm(M)) { ctx.fillStyle = '#f4efe3'; roundRect(x, y, w, h, 18); ctx.fill(); ctx.strokeStyle = '#b8ab8c'; ctx.lineWidth = 2; ctx.stroke(); return; }
    const s = w / B.width, bh = B.height * s; ctx.save(); ctx.translate(x, y + bh); ctx.scale(1, -1); ctx.drawImage(B, 0, 0, w, bh); ctx.restore();
    ctx.drawImage(M, x, y + bh - 2, w, h - bh * 2 + 4); ctx.drawImage(B, x, y + h - bh, w, bh); }
  const POR = { maid1: 'p_r142_maid1_smile', maid2: 'p_r142_maid2_smile', servant: 'p_r142_servant_smile', steward: 'p_r142_steward_smile', cat: 'p_r139_cat' };
  const ROWS = ['maid1', 'maid2', 'servant', 'steward', 'cat'];
  const BX = 150, BY = 30, BW = 980, BH = 660, RX = BX + 74, RW = BW - 148, RY0 = BY + 168, RH = 74;
  let BOOK = null; const BTAPS = [];
  try { cv.addEventListener('pointerdown', e => { if (!BOOK) return; BTAPS.push(toLogical(e)); e.stopImmediatePropagation(); e.preventDefault(); }, true); } catch (e) {}
  const secretsOf = k => SECRETS.filter(e => e.who === k);
  function heart(x, y, s, fill) { ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20); ctx.beginPath(); ctx.moveTo(0, 6); ctx.bezierCurveTo(-10, -2, -8, -11, 0, -6); ctx.bezierCurveTo(8, -11, 10, -2, 0, 6); ctx.closePath();
    ctx.fillStyle = fill ? '#c8504a' : 'rgba(120,110,95,.22)'; ctx.fill(); ctx.restore(); }
  const bookLayer = { draw() { if (!BOOK) return; const t = now(), f = F();
    ctx.save(); ctx.fillStyle = 'rgba(10,14,12,.55)'; ctx.fillRect(0, 0, W, H); bkFrame(BX, BY, BW, BH);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#2d3a32'; ctx.font = `46px ${BKF_T}`; ctx.fillText(BOOK.who ? BOND_NAME[BOOK.who] + ' · 小记' : '青竹小记', 640, BY + 72);
    const nEv = Object.keys(f.qz_ev || {}).length, nHid = SECRETS.filter(e => hidSeen(e.id)).length;
    ctx.font = `18px ${BKF}`; ctx.fillStyle = '#6f7a6c'; ctx.fillText('第 ' + qday() + ' 日' + (shi() ? ' · ' + NAME[shi()] + LAB[shi()] : '') + '　·　十二件小事 ' + nEv + ' / 12　·　院里的秘密 ' + nHid + ' / ' + SECRETS.length, 640, BY + 140);
    if (BOOK.page === 'quest') { drawQuestPage(); }
    else if (!BOOK.who) ROWS.forEach((k, i) => { const y = RY0 + i * (RH + 6), v = bondV(k), lv = lvOf(v), nx = LV[lv + 1];
      ctx.fillStyle = 'rgba(255,253,246,.72)'; roundRect(RX, y, RW, RH, 14); ctx.fill(); ctx.strokeStyle = 'rgba(150,140,115,.35)'; ctx.lineWidth = 1.5; ctx.stroke();
      const cx = RX + 46, cy = y + RH / 2, r = 30; let im = IMG[POR[k]];
      if (k === 'cat' && !im) { const ci = uik('r139/cat.webp'); if (okIm(ci)) { const c = document.createElement('canvas'); c.width = c.height = 256; c.getContext('2d').drawImage(ci, 768, 0, 256, 256, 0, 0, 256, 256); im = IMG.p_r139_cat = c; } }
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = '#e7e1d2'; ctx.fill(); ctx.clip();
      if (im) { const mf = (typeof MEDAL_FACE === 'object' && MEDAL_FACE[POR[k]]) || (k === 'cat' ? { fx: .5, fy: .36, span: .5 } : { fx: .5, fy: .2, span: .3 }), iw = im.width, ih = im.height, sp = mf.span * iw, sx = mf.fx * iw - sp / 2, sy = mf.fy * ih - sp / 2;
        ctx.drawImage(im, sx, sy, sp, sp, cx - r, cy - r, r * 2, r * 2); } ctx.restore();
      ctx.strokeStyle = 'rgba(120,150,130,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
      ctx.textAlign = 'left'; ctx.fillStyle = '#26302a'; ctx.font = `27px ${BKF_T}`; ctx.fillText(BOND_NAME[k], RX + 92, y + 25);
      ctx.font = `19px ${BKF}`; ctx.fillStyle = '#5d7a68'; ctx.fillText(LVN[lv] + (lv === 5 ? ' · ' + KIN[k] : ''), RX + 92, y + 53);
      for (let h = 0; h < 5; h++) heart(RX + 262 + h * 28, y + 26, 20, h < lv);
      const bw = 190, p0 = nx ? (v - LV[lv]) / (nx - LV[lv]) : 1; ctx.fillStyle = 'rgba(120,110,95,.18)'; roundRect(RX + 250, y + 46, bw, 9, 5); ctx.fill(); ctx.fillStyle = '#c8726a'; roundRect(RX + 250, y + 46, Math.max(6, bw * p0), 9, 5); ctx.fill();
      ctx.font = `15px ${BKF}`; ctx.fillStyle = '#7d7666'; ctx.fillText(k === 'steward' ? '永远是家人' : nx ? v + ' / ' + nx : '已是家人', RX + 250 + bw + 10, y + 51);
      ctx.font = `19px ${BKF}`; ctx.fillStyle = '#4a5a50';
      const mt = k === 'cat' ? '喂过 ' + (f.cat_feeds || 0) + ' 回' : '今日 · ' + MOODT[mood(k)]; ctx.fillText(mt, RX + 560, y + 25);
      const ss = secretsOf(k), got = ss.filter(e => hidSeen(e.id)).length; ctx.fillStyle = '#8a6d4a'; ctx.fillText('秘密 ' + got + ' / ' + ss.length + '　›', RX + 560, y + 53);
    });
    else if (BOOK.who) { const k = BOOK.who, ss = secretsOf(k), lv = lvOf(bondV(k)), R = (LVR[k] || {})[lv + 1];
      ctx.textAlign = 'left'; ctx.font = `19px ${BKF}`; ctx.fillStyle = '#5d7a68';
      ctx.textBaseline = 'middle'; { const ct = CRAFT_TXT(k); if (ct) { ctx.save(); ctx.font = `17px ${BKF}`; ctx.fillStyle = '#8a6d4a'; ctx.fillText(ct, RX, RY0 + 20); ctx.restore(); } }
      if (k === 'steward') ctx.fillText('松伯永远是家人　·　找到松伯的秘密，他会把珍藏的东西一件件交给少爷（' + ss.filter(e => hidSeen(e.id)).length + ' / ' + ss.length + '）', RX, RY0 - 4); else ctx.fillText('情谊「' + LVN[lv] + '」' + (lv < 5 ? '　·　再亲近些，到「' + LVN[lv + 1] + '」时' + (k === 'cat' ? '，它会更黏少爷' : '，' + BOND_NAME[k] + '会来找少爷') : '　·　' + KIN[k]), RX, RY0 - 4);
      const cols = 2, cw = (RW - 20) / cols, chh = 40;
      ss.forEach((e, i) => { const x = RX + (i % cols) * (cw + 20), y = RY0 + 40 + Math.floor(i / cols) * (chh + 8), got = hidSeen(e.id);
        ctx.fillStyle = got ? 'rgba(255,253,246,.82)' : 'rgba(235,230,218,.6)'; roundRect(x, y, cw, chh, 10); ctx.fill();
        ctx.fillStyle = got ? '#7a9a86' : '#b3ab98'; roundRect(x + 8, y + 7, 46, 26, 6); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `17px ${BKF}`; ctx.textAlign = 'center'; ctx.fillText(e.shi + '时', x + 31, y + 20);
        ctx.textAlign = 'left'; ctx.font = `${got ? 20 : 16}px ${BKF}`; ctx.fillStyle = got ? '#2b332e' : '#8d8676';
        const tx = got ? e.title : '？？？　' + (e.hint || '').replace(/^.*? · /, ''); ctx.fillText(tx.length > 24 ? tx.slice(0, 24) + '…' : tx, x + 64, y + 20); });
      if (!ss.length) { ctx.textAlign = 'center'; ctx.fillStyle = '#8d8676'; ctx.fillText('……', 640, RY0 + 80); }
    }
    // 底部：合上 / 返回；总览页左边多一个「院中支线」
    const sub = BOOK.who || BOOK.page, bx = 640 - 90, by = BY + BH - 74; ctx.fillStyle = 'rgba(90,120,104,.9)'; roundRect(bx, by, 180, 46, 23); ctx.fill(); ctx.fillStyle = '#f6f2e6'; ctx.font = `22px ${BKF}`; ctx.textAlign = 'center'; ctx.fillText(sub ? '返　回' : '合　上', 640, by + 24);
    if (!sub) { const qx = 640 - 300; ctx.fillStyle = 'rgba(150,110,70,.88)'; roundRect(qx, by, 180, 46, 23); ctx.fill(); ctx.fillStyle = '#f8f1e2'; ctx.fillText('院中支线', qx + 90, by + 24);
      const act = Object.keys(QUESTS).filter(id => qStep(id)).length; if (act) { ctx.fillStyle = '#c8504a'; ctx.beginPath(); ctx.arc(qx + 170, by + 6, 11, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `15px ${BKF}`; ctx.fillText(act, qx + 170, by + 7); } }
    ctx.restore(); } };
  S.overlay.push(bookLayer);
  async function openBook() {
    BOOK = { who: null, page: null }; BTAPS.length = 0; const hud0 = S.hud; S.hud = false; world.locked = true;
    try { for (;;) { await nextFrame(); const tp = BTAPS.shift(); if (!tp) continue;
      const btn = { x: 640 - 90, y: BY + BH - 74, w: 180, h: 46 };
      if (inR(tp, btn) || !inR(tp, { x: BX, y: BY, w: BW, h: BH })) { if (BOOK.who || BOOK.page) { BOOK.who = null; BOOK.page = null; continue; } return; }
      if (!BOOK.who && !BOOK.page && inR(tp, { x: 640 - 300, y: BY + BH - 74, w: 180, h: 46 })) { BOOK.page = 'quest'; try { playSnd('ui_confirm', .5); } catch (e) {} continue; }
      if (BOOK.page) continue;
      if (!BOOK.who) ROWS.forEach((k, i) => { if (inR(tp, { x: RX, y: RY0 + i * (RH + 6), w: RW, h: RH })) { BOOK.who = k; try { playSnd('ui_confirm', .5); } catch (e) {} } });
    } } finally { BOOK = null; S.hud = hud0; world.locked = false; }
  }
  window.QZ_BOOK = openBook;
  function drawQuestPage() {
    const f = F(), d = qday(); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    let y = RY0 + 4; ctx.font = `21px ${BKF_T}`; ctx.fillStyle = '#4f6b5a'; ctx.fillText('院中支线', RX, y); y += 26;
    for (const id in QUESTS) { const Qd = QUESTS[id], q = Q()[id], st = qStep(id), done = q && q.s === 'done';
      ctx.fillStyle = done ? 'rgba(235,242,236,.85)' : q ? 'rgba(255,251,240,.9)' : 'rgba(235,230,218,.6)'; roundRect(RX, y, RW, 37, 10); ctx.fill();
      ctx.font = `20px ${BKF}`; ctx.fillStyle = q ? '#2b332e' : '#8d8676'; ctx.fillText(q ? Qd.name : '？？？', RX + 16, y + 19);
      ctx.font = `17px ${BKF}`; ctx.fillStyle = done ? '#5d8a6a' : q ? '#8a5a3a' : '#9a9280';
      ctx.fillText(done ? '已完成' : st ? '▸ ' + st.desc : (Qd.hint || ''), RX + 170, y + 19); y += 41; }
    y += 6; ctx.font = `21px ${BKF_T}`; ctx.fillStyle = '#4f6b5a'; ctx.fillText('特别的日子', RX, y); y += 26;
    const nx7 = d % 7 === 0 ? d : Math.ceil(d / 7) * 7, nx5 = d + ((2 - d % 5 + 5) % 5);
    const rows = [['七日家宴', '每七日的黄昏，西院石桌' + (f.qz_feast ? '（吃过 ' + f.qz_feast + ' 回）' : '') + '　·　下一回：第 ' + nx7 + ' 日'],
      ['松伯赶集', '每五日清早下山，黄昏带回食材　·　下一回：第 ' + nx5 + ' 日'],
      [hidSeen('maid1:bdayhint') || hidSeen('maid2:bday') ? '小桃的生辰' : '？？？', hidSeen('maid2:bday') ? '已经过了 · 一起吃过了' : hidSeen('maid1:bdayhint') ? '第十二日的黄昏　·　她最爱吃甜的' : '听说院里有人的生辰快到了'],
      [hidSeen('maid2:bdayhint') || hidSeen('maid1:bday') ? '青禾的生辰' : '？？？', hidSeen('maid1:bday') ? '已经过了 · 一起吃过了' : hidSeen('maid2:bdayhint') ? '第二十四日的黄昏　·　竹笋汤、蛋羹' : '……']];
    for (const [a, b] of rows) { ctx.fillStyle = 'rgba(255,253,246,.72)'; roundRect(RX, y, RW, 32, 10); ctx.fill(); ctx.font = `19px ${BKF}`; ctx.fillStyle = '#2b332e'; ctx.fillText(a, RX + 16, y + 16); ctx.font = `16px ${BKF}`; ctx.fillStyle = '#7d7666'; ctx.fillText(b, RX + 170, y + 16); y += 35; }
  }
  { const R = TMAPS.tj_room; R.npcs = R.npcs || []; const [c, r] = P(742, 596);
    R.npcs.push({ key: 'none', name: '青竹小记', c, r, h: 70, wander: false, q162book: 1, mark: () => !!F().qz_book_hint && !F().qz_book_open,
      talk: async () => { F().qz_book_open = 1; await openBook(); } }); }

  // ---------- 子时敲门：多半没动静；满足条件时姑娘还没睡，开门进屋有一段隐藏剧情 ----------
  // 作者 11-08：「入睡以后不是完全进不了——轻轻敲门，里面没动静，就是睡了。然后会有隐藏剧情：比如叶孤星做饭小桃吃了三次以上，当晚去敲小桃的门，
  //   就会发现小桃没睡，可以进去，因为小桃吃撑了……青禾那边也有不一样的，例如帮少爷缝补衣服。把青竹小院经营成主线打怪修仙之外的第二玩法。」
  const AWAKE = () => { const a = F().qz_awake; return a ? a.split(':')[0] : ''; };
  const NIGHT_PLAN = {
    'maid2:full': { map: RM.maid2, at: [470, 600], steps: [{ wait: 1e9, face: -1 }] },
    'maid2:fly': { map: RM.maid2, at: [470, 420], steps: [{ act: 'maid2_catch_6f', t: 1e9, face: -1 }] },
    'maid1:mend': { map: RM.maid1, at: [374, 386], steps: [{ act: 'maid1_stitch_6f', t: 1e9, face: -1 }] },
    'maid1:letter': { map: RM.maid1, at: [374, 386], steps: [{ act: 'maid1_stitch_6f', t: 1e9, face: -1 }] },
  };
  // 每段隐藏剧情：什么时候会醒着（ok），进屋以后演什么（run）
  const HIDDEN = {
    maid2: [
      { id: 'dark', ok: f => seen(12) || (f.cat_feeds || 0) >= 3, run: async () => {
        await narrate('门开得飞快，小桃裹着被子缩在门后。'); await say('侍女小桃·担心', '少爷！屋顶上……屋顶上有东西在走！咚、咚、咚的……');
        await narrate('叶孤星抬头一看——屋脊上蹲着' + cat() + '，正歪着脑袋往下瞧。'); await say('侍女小桃·委屈', '……原来是你！吓死小桃了！');
        await say('侍女小桃·羞', '少爷……能等小桃睡着了再走吗？就一小会儿。'); await narrate('叶孤星在门口坐了一会儿。屋里的呼吸声很快就均匀了。'); bond('maid2', 3); } },
      { id: 'full', ok: f => (f.qz_tao_ate || 0) - (f.qz_tao_full || 0) >= 3, run: async () => { const f = F(); f.qz_tao_full = f.qz_tao_ate || 0;
        await say('侍女小桃·委屈', '少爷……您也没睡呀。小桃……小桃吃撑了，躺下去肚子咕噜咕噜的，睡不着。');
        await say('侍女小桃·羞', '都怪少爷做的菜太香了！小桃本来只想尝一口，结果一口又一口……');
        const i = await choose('', ['陪她在院里走两圈消消食', '去厨房给她冲一碗山楂水', '笑她两句']);
        if (i === 0) { await narrate('两个人绕着西院的石板路慢慢走。月光把影子拉得老长，小桃一边走一边数星星，数到第三十几颗，打了个大大的哈欠。'); await say('侍女小桃·笑', '好多了！少爷，明天还做吗？……小桃就尝一小口，真的。'); }
        else if (i === 1) { await narrate('灶膛里还有余火。叶孤星冲了一碗酸甜的山楂水端回来，小桃捧着碗，小口小口地喝完了。'); await say('侍女小桃·感动', '少爷给小桃冲的……比糖还甜。'); }
        else { await say('叶孤星', '下回给你单独盛一小碗，省得你偷吃锅里的。'); await say('侍女小桃·嗔', '少爷！……小桃哪有偷吃，小桃是光明正大地吃！'); }
        bond('maid2', 3); } },
      { id: 'fly', ok: () => seen(8), run: async () => {
        await narrate('小桃趴在窗台上，手里捧着一只纱布小袋，袋子里一闪一闪的——是几只萤火虫。');
        await say('侍女小桃·惊喜', '少爷！嘘——您看，小桃白天偷偷捉的，想放在床头当灯……');
        await say('侍女小桃·担心', '可是它们一直往外撞，小桃看着就睡不着了。它们是不是想回家呀？');
        const i = await choose('', ['陪她一起把萤火虫放走', '「留一只，其余放了」']);
        await narrate(i === 0 ? '纱袋一打开，萤火虫一只接一只飞出窗外，在竹梢上散成一片小小的星河。' : '小桃留下最亮的那一只，其余的都放了。那一只绕着她转了两圈，也飞走了。');
        await say('侍女小桃·笑', '……这样好。小桃明天还能去井边看它们。');
        bond('maid2', 3); } },
    ],
    maid1: [
      { id: 'emb', ok: () => bondV('maid1') >= 36, run: async () => {
        await narrate('门开了。青禾的桌上铺着一幅快绣好的绢面——是青竹小院：竹林、小池、石桌，还有屋檐下一个练剑的小小身影。');
        await say('侍女青禾·羞', '……本想等绣好了再给少爷看的。'); await say('侍女青禾·笑', '少爷以后出远门，想家了，就看看它。');
        await narrate('绢面上的竹叶，一片一片都绣得清清楚楚。'); stat({ maxmp: 30 }, '灵力上限 +30（青竹绣图）'); bond('maid1', 5); } },
      { id: 'mend', ok: f => (f.qz_wins || 0) - (f.qz_qh_mend || 0) >= 6, run: async () => { const f = F(); f.qz_qh_mend = f.qz_wins || 0;
        await narrate('门缝里漏出一线灯光。青禾还坐在灯下，膝上搭着一件练功服——是少爷的。');
        await say('侍女青禾·惊喜', '少爷？……您怎么还没歇着。');
        await say('侍女青禾·嗔', '这件衣裳，袖口和后背都磨破了。少爷最近天天出去打打杀杀，衣裳比人还受罪。');
        await say('侍女青禾·笑', '青禾在里头多缝了一层细麻衬，再挨两下，也不至于一下就划破。');
        const n = f.qz_mend_def || 0; if (n < 3) { f.qz_mend_def = n + 1; try { S.hero.def += 1; } catch (e) {} toast('青禾补过的练功服 · 防御 +1（' + (n + 1) + ' / 3）', 2200); }
        await say('叶孤星', '……辛苦你了。');
        await say('侍女青禾·羞', '少爷平平安安回来，就不辛苦。'); bond('maid1', 3); } },
      { id: 'letter', ok: () => seen(7), run: async () => {
        await narrate('青禾伏在桌前，面前摊着一张信纸，写了几行又划掉了。');
        await say('侍女青禾·惊喜', '少爷……让您见笑了。青禾想给娘捎封信，可字写得不好，翻来覆去就那几句。');
        await say('侍女青禾·羞', '少爷能替青禾添一句吗？娘看见少爷的字，一定高兴。');
        const i = await choose('替她添一句', ['「青禾在山上很好，大家都疼她」', '「等开春，我陪青禾下山看您」', '「您绣的花，青禾教会了院里的小桃」']);
        await narrate('叶孤星提笔，在信尾端端正正写了一行。青禾捧着信纸，看了好一会儿，眼圈有点红。');
        await say('侍女青禾·感动', ['……娘要是知道少爷这么说，夜里都要笑醒的。', '……少爷说话算话，青禾记着了。', '……这句娘看了，准要笑。小桃学了三年，还是绣歪。'][i]);
        bond('maid1', 3); } },
    ],
  };
  const KNOCK = { maid1: ['叶孤星在青禾门前轻轻敲了两下。……里面没有动静。', '门缝里黑着。青禾睡得早，大概已经睡熟了。', '叩、叩。……只听见屋里均匀的呼吸声。'],
    maid2: ['叶孤星轻轻敲了敲小桃的门。……没有动静，只隐约听见翻身的声音。', '门里头传来一声含糊的梦话：「……花……别踩……」——睡着了。', '叩、叩。……小桃睡得正香，连门外的猫叫都没吵醒她。'] };
  let knocking = false, knockT = 0;
  async function knock(k, d) {
    if (knocking || world.locked || (typeof dialog !== 'undefined' && dialog) || performance.now() - knockT < 2500) return;
    knocking = true; const p = world.player; if (p) p.moving = false; world.path = null;
    try {
      const f = F(); f.qz_hid = f.qz_hid || {};
      // 每夜只抽一次签：今晚她醒不醒、为什么醒（同一夜再敲，结果一样）
      const KP = { full: 1, mend: .8, fly: .6, letter: .6, emb: .35, dark: .3 };
      if (!f.qz_kroll || f.qz_kroll.d !== qday() + ':' + shi()) f.qz_kroll = { d: qday() + ':' + shi() };
      if (f.qz_kroll[k] === undefined) { const c = (HIDDEN[k] || []).filter(x => x.ok(f) && (x.id === 'full' || x.id === 'mend' || !f.qz_hid[k + ':' + x.id]));
        const hit = c.find(x => Math.random() < (KP[x.id] || .5)); f.qz_kroll[k] = hit ? hit.id : ''; }
      const h = f.qz_kroll[k] ? (HIDDEN[k] || []).find(x => x.id === f.qz_kroll[k]) : null; if (h) f.qz_kroll[k] = '';
      if (!h) { await narrate(pick(KNOCK[k])); return; }
      await narrate('叶孤星轻轻敲了敲门。……里面窸窸窣窣一阵，门「吱呀」一声开了一条缝。');
      const first = !f.qz_hid[k + ':' + h.id]; f.qz_awake = k + ':' + h.id; f.qz_hid[k + ':' + h.id] = 1; NIGHT_RUN = h; if (first) setTimeout(() => toast('《青竹小记》· 新的秘密', 2000), 6000);
      for (const n of DEFS) n._q = null;
      goMap(d.to, d.at[0], d.at[1], 'up');
    } finally { knocking = false; knockT = performance.now(); }
  }
  let NIGHT_RUN = null;
  if (typeof tileUpdate === 'function') tileUpdate = (o => function (dt) { o.apply(this, arguments);
    try { if (!NIGHT_RUN || !world.map || !RM[AWAKE()] || world.mapName !== RM[AWAKE()] || world.locked || (typeof dialog !== 'undefined' && dialog) || (window.MAP_READY && !MAP_READY())) return;
      const h = NIGHT_RUN; NIGHT_RUN = null; world.locked = true; if (world.player) world.player.moving = false;
      Promise.resolve(h.run()).catch(e => console.warn('r162 night', e)).finally(() => { world.locked = false; });
    } catch (e) {} })(tileUpdate);

  // ---------- 进图 / 出青竹 ----------
  tileSetMap = (orig => function (name) {
    const prev = world.mapName;
    if (F().qz_shi && !QZ(name)) { F().qz_shi = ''; setTod(''); }   // 走出青竹：回到白天
    const r = orig.apply(this, arguments);
    try {
      if (ON() && QZ(name)) { preload(); if (world.actors) world.actors.push(...propsFor(name, shi())); }
      // 支线里要找东西的地方：一点微光
      if (world.actors) for (const id in QUESTS) { const st = qStep(id); if (st && st.type === 'spot' && st.at === name) { const sp = { _q162prop: a => { const st2 = qStep(id); if (!st2 || st2.type !== 'spot') return; const [x, y] = spotXY(id, st2); a.y = y; sparkle(x, y, now()); }, x: st.xy[0], y: st.xy[1], moving: false }; world.actors.push(sp); } }
      if (LOST && name === COURT && world.actors) world.actors.push({ x: LOST[0], y: LOST[1], moving: false, _q162prop: a => { if (!LOST) return; sparkle(LOST[0], LOST[1], now()); } });
      // 作者 11-08：子时都睡下了，两个姑娘的屋子不能进（只能去松伯、阿福屋里）
      if (name === COURT && world.map && world.map.T) for (const d of world.map.T.doors || []) {
        const who = d.to === RM.maid1 ? '青禾' : d.to === RM.maid2 ? '小桃' : ''; if (!who) continue;
        const shut = () => ON() && shi() === '子', k = d.to === RM.maid1 ? 'maid1' : 'maid2';
        d.cond = () => { if (!shut()) return true; knock(k, d); return false; };   // 子时：敲门（多半没动静；碰上隐藏剧情就开门）
        try { Object.defineProperty(d, 'noGlow', { configurable: true, get: shut }); } catch (e) {}
      }
      try { seedChests(name); } catch (e) {}
      FROM_ROOM = name === COURT && prev === 'tj_room'; DOOR_OUT = FROM_ROOM; NIGHT_T = 0; EV_T = 0;
      if (F().qz_awake && name !== RM[AWAKE()]) F().qz_awake = '';   // 出了屋：她也歇下了
    } catch (e) { console.warn('r162 enter', e); }
    return r;
  })(tileSetMap);

  // ---------- 床边：歇到什么时辰 ----------
  const lockedByStory = () => { const f = F(); return (f.res_tod && !f.qz_shi) || f.res_ch1 || ((f.zm || 0) >= 1 && (f.zm || 0) <= 5) || (f.ch2_night && !f.ch2_roam && !f.ch2_hall) || world.scripted; };
  let REST = null; const RTAPS = [];
  try { cv.addEventListener('pointerdown', e => { if (!REST) return; RTAPS.push(toLogical(e)); e.stopImmediatePropagation(); e.preventDefault(); }, true); } catch (e) {}
  const PX = 200, PY = 168, OPT = i => ({ x: PX + 55 + 17 + i * 151, y: PY + 104, w: 136, h: 144 });
  const uiDraw = (id, x, y, w, h) => { const d = IDX[id], im = img('ui'); if (!d || !im) return false; ctx.drawImage(im, d.x, d.y, d.w, d.h, x, y, w || d.w, h || d.h); return true; };
  const restLayer = { draw() { if (!REST) return; const k = Math.min(1, (performance.now() - REST.t0) / 220);
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(8,12,10,.5)'; ctx.fillRect(0, 0, W, H);
    if (!uiDraw('rest_panel', PX, PY)) { ctx.fillStyle = '#eef0ea'; roundRect(PX, PY, 880, 360, 18); ctx.fill(); }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `40px ${BKF_T}`; ctx.fillStyle = '#3d5a48'; ctx.fillText('歇到什么时辰', 640, PY + 66);
    const cur = shi() || (night() ? '戌' : '');
    for (let i = 0; i < 5; i++) { const s = SHI[i], r = OPT(i), sel = REST.hover === i;
      uiDraw(sel ? 'rest_option_selected' : 'rest_option_normal', r.x, r.y);
      uiDraw(ICON[s], r.x + 22, r.y + 4, 92, 92);
      ctx.font = `600 22px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.fillStyle = '#2f4a3c'; ctx.fillText(NAME[s], r.x + 68, r.y + 108);
      ctx.font = `17px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.fillStyle = '#6b8576'; ctx.fillText(LAB[s] + (cur === s ? ' · 此刻' : ''), r.x + 68, r.y + 131); }
    ctx.font = `16px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.fillStyle = 'rgba(70,90,78,.75)'; ctx.fillText('躺下歇一歇，气血灵力都会回满　·　点空白处不歇了', 640, PY + 300);
    ctx.restore(); } };
  S.overlay.push(restLayer);
  async function restPanel() {
    img('ui'); REST = { t0: performance.now(), hover: -1 }; RTAPS.length = 0; const hud0 = S.hud; S.hud = false; world.locked = true;
    try { for (;;) { await nextFrame(); const tp = RTAPS.shift(); if (!tp) continue;
      for (let i = 0; i < 5; i++) if (inR(tp, OPT(i))) { REST.hover = i; try { playSnd('ui_confirm', .6); } catch (e) {} await new Promise(r => setTimeout(r, 160)); return i; }
      if (!inR(tp, { x: PX, y: PY, w: 880, h: 360 }) || tp.y > PY + 280) return -1; } }
    finally { REST = null; S.hud = hud0; world.locked = false; }
  }
  // 窗纸流光过场（8 帧，播完换时辰）
  async function restFade() {
    const t0 = performance.now(); const d = IDX.rest_fade_8f;
    const ov = { draw() { const t = (performance.now() - t0) / 1000, f = Math.min(7, Math.floor(t * 6)), im = img('fade');
      ctx.save(); const k = t < .25 ? t / .25 : t > 1.35 ? Math.max(0, 1 - (t - 1.35) / .35) : 1; ctx.globalAlpha = k; ctx.fillStyle = 'rgba(6,8,12,.55)'; ctx.fillRect(0, 0, W, H);
      if (im) ctx.drawImage(im, f * d.w, 0, d.w, d.h, 0, 0, W, H); ctx.restore(); } };
    S.overlay.push(ov);
    await new Promise(r => setTimeout(r, 700));
    return async () => { await new Promise(r => setTimeout(r, 1000)); const i = S.overlay.indexOf(ov); if (i >= 0) S.overlay.splice(i, 1); };
  }
  // 换时辰：和过图一样走一遍载入画面（青竹专属插画 + 进度条），这个时辰要用的人物动作、光影都下好了才露出画面
  async function restTo(s) {
    const f = F(), p = world.player; world.locked = true; S.hud = false;
    try {
      if (window.LOADING_KICK) { KICK = true; LOADING_KICK(); } else await restFade();
      const old = SHI.indexOf(f.qz_shi || '午'); if (SHI.indexOf(s) <= old) newDay(); if (!f.qz_mood) { f.qz_mood = {}; for (const k of PEOPLE) f.qz_mood[k] = pick(MOODS); }
      f.qz_shi = s; setTod(s === '戌' || s === '子' ? 'night' : ''); LOST = null; schedule(true);
      healAll(false);
      DAY.basin = 0; DAY.noodles = 0; DAY.lit = {}; f.qz_awake = '';
      if (s === '戌') { const all = ['maid1', 'maid2', 'servant', 'steward'], fresh = all.filter(k => OUT[k].ev && !seen(OUT[k].ev)); f.qz_out = pick(fresh.length && Math.random() < .8 ? fresh : all); }
      if (s === '子') f.qz_letter = !seen(10) ? (Math.random() < .7 ? 1 : 0) : (Math.random() < .3 ? 1 : 0);
      if (s === '酉' && seen(5)) for (const k in LANT) DAY.lit[k] = 0;
      for (const n of DEFS) n._q = null;
      tileSetMap(world.mapName, p.x / 64 - .5, p.y / 64 - .8, p.face || 'down');
      await new Promise(r => setTimeout(r, 400));
      for (let i = 0; i < 600 && window.MAP_READY && !MAP_READY(); i++) await new Promise(r => setTimeout(r, 100));
    } finally { world.locked = false; S.hud = true; }
    toast(NAME[s] + ' · ' + LAB[s] + '　（气血、灵力回满了）', 2200);
    const hint = { '卯': '院里的人都起来干活了。', '午': '晌午了，厨房里正热闹。', '酉': '日头偏西，该收衣裳、点灯笼了。', '戌': '大家都回屋了……好像有谁还没睡？', '子': '院里静悄悄的，都睡下了。' }[s];
    if (hint) setTimeout(() => toast(hint, 2400), 2300);
  }
  { const bed = (TMAPS.tj_room.npcs || []).find(n => n.name === '床榻'); if (bed) { const t0 = bed.talk; bed.talk = async a => {
    if (lockedByStory()) return t0(a);
    const i = await restPanel(); if (i < 0) return;
    await restTo(SHI[i]);
  }; } }

  // ---------- 青竹小院专属载入图：十二张小事插画轮流放 ----------
  // loading.js 换图时问一句：是青竹一带就给一张（真正放出来了才轮到下一张）；从外面走进青竹，至少让这张图露个脸（0.9 秒）
  let KICK = false;
  const sid = i => 'story_' + String(i % 12 + 1).padStart(2, '0');
  window.QZ_LOAD_ART = (name, prev) => {
    if (!QZ(name)) return null;
    const f = F(), i = (f.qz_load_i || 0) % 12; img(sid(i)); img(sid(i + 1));
    const o = IM[sid(i)]; let used = false; const min = KICK ? 1500 : !QZ(prev) && prev ? 900 : 0; KICK = false;
    return { get im() { return o.im; }, get ok() { return o.ok; }, min, use() { if (used) return; used = true; f.qz_load_i = i + 1; } };
  };
  // 载入进度把五时辰的素材也算进去（loading.js 的 MAP_EXTRA_READY）
  window.MAP_EXTRA_READY = name => {
    if (!ON() || !QZ(name)) return 1;
    const need = [...SHEETS, ...(LIGHTS[shi()] || []).map(k => 'l_' + k)]; let ok = 0;
    for (const k of need) if (img(k)) ok++;
    let w = 0; for (const k of ['maid1', 'maid2', 'servant', 'steward']) if (walkIm(k)) w++;
    return (ok + w) / (need.length + 4);
  };
  // 开局就先下一张，第一次进青竹就有图
  setTimeout(() => { try { const i = (F().qz_load_i || 0) % 12; img(sid(i)); img(sid(i + 1)); } catch (e) {} }, 2500);

  window.R162 = { setWest(m, a) { WEST_NM = m; WEST_NA = a; }, EVS, schedule, bond, QUESTS, qStart, qRun, questTalk, PLAN, OUT, EV, LINES, DAY, restTo, shi, propsFor, IM, restPanel };
})();
