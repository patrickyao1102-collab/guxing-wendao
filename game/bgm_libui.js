// ================= 配乐库（测试面板里的独立页面）=================
// 把即梦生成过的全部曲子、音效，加上游戏里原来在用的曲子，按风格分组编号列出来：
// 每首能试听；点场景按钮把它定为那个场景的配乐（记在本机 localStorage，立刻生效）；音效同理可以顶替游戏里某个音效。
(function () {
  if (!window.BGM_LIB) return;
  const SLOTS = [['title', '标题'], ['plaza', '广场'], ['sect', '宗门'], ['town', '城镇'], ['fair', '集市'], ['shop', '店铺'], ['houshan', '后山'], ['xtcity', '玄天城'], ['qingzhu', '青竹院'], ['wild', '野外'], ['battle', '战斗'], ['boss', '首领']];
  const JING = [['jingle_win', '胜利'], ['jingle_levelup', '升级']];
  const SFXN = [['sfx_swing', '挥剑'], ['sfx_hit', '命中'], ['sfx_crit', '暴击'], ['sfx_sword_ring', '剑鸣'], ['sfx_charge', '蓄力'], ['sfx_star', '星光'], ['sfx_beam', '光束'], ['sfx_boom', '爆炸'], ['sfx_ult', '绝技'], ['sfx_buff', '增益'], ['sfx_heal', '治疗'], ['sfx_hurt', '受伤'], ['sfx_thunder', '雷'], ['sfx_ice', '冰'], ['sfx_wind', '风'], ['ui_confirm', '确认'], ['ui_text', '对话']];
  const css = `#bgmLib{position:fixed;inset:0;z-index:100000;background:rgba(8,6,4,.96);color:#f1e3c4;font:14px/1.5 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif;overflow:auto;-webkit-overflow-scrolling:touch}
  #bgmLib .wrap{max-width:1100px;margin:0 auto;padding:14px 16px 60px}
  #bgmLib h2{margin:0 0 6px;font-size:20px;color:#ffd98a}
  #bgmLib h3{margin:18px 0 6px;font-size:16px;color:#ffcf7a;border-bottom:1px solid #5a4320;padding-bottom:4px}
  #bgmLib .tip{color:#b9a98a;font-size:12px;margin-bottom:8px}
  #bgmLib .row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:5px 0;border-bottom:1px dashed #3a2c16}
  #bgmLib .no{width:44px;color:#c9a35a;font-weight:700}
  #bgmLib .nm{width:120px;font-weight:600}
  #bgmLib .dur{width:44px;color:#9c8c6c;font-size:12px}
  #bgmLib .desc{flex:1 1 200px;color:#a8977a;font-size:12px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  #bgmLib button{background:#2b1f0e;color:#f1e3c4;border:1px solid #7a5a2a;border-radius:6px;padding:4px 9px;font-size:13px;cursor:pointer}
  #bgmLib button.play{background:#4a3414;border-color:#c9a35a;min-width:46px}
  #bgmLib button.on{background:#8a5a14;border-color:#ffd98a;color:#fff}
  #bgmLib button.cur{background:#1d3b2a;border-color:#7fd3a0;color:#d8ffe6}
  #bgmLib .top{position:sticky;top:0;background:rgba(8,6,4,.98);padding:8px 0;display:flex;gap:8px;align-items:center;flex-wrap:wrap;z-index:1}
  #bgmLib .slotbar{display:flex;gap:4px;flex-wrap:wrap}
  #bgmLib .slotbar button{padding:3px 7px;font-size:12px}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  let pane = null, playing = null, playId = null;
  const fmt = d => d ? (d >= 60 ? Math.floor(d / 60) + ':' + String(Math.round(d % 60)).padStart(2, '0') : d.toFixed(1) + 's') : '';
  function curOf(id) { const B = window.BGM29; if (!B) return []; const out = []; for (const [k, t] of SLOTS) if (B.T[k] === id) out.push(t); for (const [k, t] of [...JING, ...SFXN]) if (B.PICK[k] === id) out.push(t); return out; }
  function render() {
    const lib = BGM_LIB, B = window.BGM29;
    const groups = {}; for (const id in lib.tracks) { const t = lib.tracks[id]; (groups[t.group] = groups[t.group] || []).push([id, t]); }
    const order = lib.groups || Object.keys(groups);
    let h = `<div class="wrap"><div class="top"><h2>配乐库</h2><button data-act="close">返回游戏</button><button data-act="stop">停止试听</button><button data-act="reset">全部恢复默认</button><span class="tip">点 ▶ 试听；点场景按钮就把这首定为该场景配乐（本机记住，立刻生效，再点一次取消）。绿色＝当前在用。</span></div>`;
    for (const g of order) {
      if (!groups[g]) continue;
      h += `<h3>${g}</h3>`;
      for (const [id, t] of groups[g]) {
        const cur = curOf(id);
        h += `<div class="row"><span class="no">${t.no}</span><span class="nm">${t.name}${t.old ? '<span class="tip">（原有）</span>' : ''}</span><span class="dur">${fmt(t.dur)}</span><button class="play${playId === id ? ' on' : ''}" data-play="${id}">${playId === id ? '■' : '▶'}</button><span class="desc" title="${(t.desc || '').replace(/"/g, '')}">${t.desc || ''}</span><span class="slotbar">`;
        if (t.kind === 'voice') {
          const V = window.VOICE29; const s = t.slot; const pk = V ? V.pickKey(s) : 'voice:' + s;
          const on = V && V.chosen(s) === id; const forced = B.PICK[pk] === id;
          h += `<button data-vslot="${pk}" data-id="${id}" class="${on ? 'cur' : ''}">${forced ? '已指定' : on ? '默认在用' : '指定'}${V && V.NAMES[s] ? '：' + V.NAMES[s] : ''}</button>`;
        } else {
        const slots = t.kind === 'sfx' ? SFXN : t.kind === 'short' ? JING : SLOTS;
        for (const [k, nm] of slots) { const on = (k in B.DEF) ? B.T[k] === id : (B.PICK[k] || (B.SDEF && B.SDEF[k])) === id; h += `<button data-slot="${k}" data-id="${id}" class="${on ? 'cur' : ''}">${nm}</button>`; }
        }
        h += `</span></div>`;
      }
    }
    h += `</div>`;
    pane.innerHTML = h;
  }
  function stopAud() { if (playing) { try { playing.pause(); } catch (e) {} playing = null; } playId = null; }
  function open() {
    if (!pane) {
      pane = document.createElement('div'); pane.id = 'bgmLib'; document.body.appendChild(pane);
      for (const ev of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'click', 'wheel', 'keydown']) pane.addEventListener(ev, e => e.stopPropagation());
      pane.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        const B = window.BGM29;
        if (b.dataset.act === 'close') { stopAud(); pane.hidden = true; try { B.resume(); } catch (err) {} return; }
        if (b.dataset.act === 'stop') { stopAud(); render(); return; }
        if (b.dataset.act === 'reset') { B.reset(); render(); toast && toast('配乐已全部恢复默认'); return; }
        if (b.dataset.play) {
          const id = b.dataset.play; if (playId === id) { stopAud(); render(); return; }
          stopAud(); try { B.stop(); } catch (err) {}
          const t = BGM_LIB.tracks[id]; const a = new Audio(B.src(id)); a.volume = Math.min(1, (t.vol != null ? t.vol : .55) * .9); a.loop = t.kind === 'bgm' && !t.loop; if (t.loop) { try { a.currentTime = t.loop[0]; } catch (err) {} a.addEventListener('timeupdate', () => { if (a.currentTime >= t.loop[1] - .05) { try { a.currentTime = t.loop[0]; } catch (err) {} } }); } a.play().catch(() => {}); playing = a; playId = id; a.onended = () => { if (playId === id) { playId = null; render(); } };
          render(); return;
        }
        if (b.dataset.vslot) {
          const k = b.dataset.vslot, id = b.dataset.id;
          if (B.PICK[k] === id) { delete B.PICK[k]; } else { B.PICK[k] = id; }
          try { localStorage.setItem('bgm29_pick', JSON.stringify(B.PICK)); } catch (err) {}
          render(); return;
        }
        if (b.dataset.slot) {
          const k = b.dataset.slot, id = b.dataset.id;
          const on = (k in B.DEF) ? B.T[k] === id : B.PICK[k] === id;
          if (on) B.unpick(k); else B.pick(k, id);
          if (!(k in B.DEF)) { try { audioBoot(); } catch (err) {} setTimeout(() => { try { playSnd(k); } catch (err) {} }, 600); }
          render(); return;
        }
      });
    }
    pane.hidden = false; try { window.BGM29.stop(); } catch (e) {} render();
  }
  window.BGM_LIBUI = { open };
})();
