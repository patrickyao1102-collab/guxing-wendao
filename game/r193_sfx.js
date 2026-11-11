// ================= R193 · 潭边垂钓：声音（小云雀 Seed Audio 1.0，作者 11-11「你去找小云雀补，认为你觉得合适的」）=================
// 抛竿 / 浮漂落水 / 提竿中鱼 / 搏鱼（循环）/ 断线 / 鱼出水 各两版（a / b），小生物（蛙鸣、蜜蜂、翠鸟、白鹭）、瀑布环境（循环，两版）、雨（循环）、雷各一版。
// 先用 a 版；测试面板「声音测试」里两版都能听，作者挑好了改 USE 就行。配乐两首白天、两首月夜在配乐库「潭边垂钓精选」。
(function () {
  const DIR = 'sfx193/', V = '?v=1';
  const USE = { cast: 'casta', plop: 'plopa', hook: 'hooka', fight: 'fighta', snap: 'snapa', lift: 'lifta', frog: 'frog', bee: 'bee', kingfisher: 'kingfisher', egret: 'egret', amb: 'amba', rain: 'rain', thunder: 'thunder' };
  const VOL = { cast: .8, plop: .7, hook: .9, fight: .45, snap: .9, lift: .85, frog: .55, bee: .5, kingfisher: .6, egret: .6, amb: .35, rain: .45, thunder: .75 };
  const NAME = { casta: '抛竿 a', castb: '抛竿 b', plopa: '浮漂落水 a', plopb: '浮漂落水 b', hooka: '提竿中鱼 a', hookb: '提竿中鱼 b', fighta: '搏鱼（循环）a', fightb: '搏鱼（循环）b', snapa: '断线 a', snapb: '断线 b',
    lifta: '鱼出水 a', liftb: '鱼出水 b', frog: '蛙鸣（蛙声停了）', bee: '蜜蜂嗡嗡', kingfisher: '翠鸟鸣叫', egret: '白鹭起飞', amba: '潭边瀑布环境（循环）a', ambb: '潭边瀑布环境（循环）b', rain: '潭边雨声（循环）', thunder: '雷声' };
  try { const L = window.VOICE_LAB || (window.VOICE_LAB = []); for (const k in NAME) L.push({ group: '潭边垂钓音效 · 小云雀（a / b 两版，现用 a）', name: NAME[k], desc: '', src: DIR + k + '.mp3' + V }); } catch (e) {}
  const BUF = {}, PEND = {};
  const ok = () => typeof AUD !== 'undefined' && !AUD.muted && typeof AC !== 'undefined' && AC && AUD.mode === 'webaudio' && AUD.sfxGain;
  function buf(f) { if (BUF[f]) return Promise.resolve(BUF[f]); if (!PEND[f]) PEND[f] = fetch(DIR + f + '.mp3' + V).then(r => r.arrayBuffer()).then(b => new Promise((res, rej) => AC.decodeAudioData(b, res, rej))).then(b => (BUF[f] = b)).catch(() => null); return PEND[f]; }
  function preload() { if (!ok()) return; for (const k in USE) buf(USE[k]); }
  function start(k, loop, vol) { if (!ok()) return null; const f = USE[k]; if (!f) return null; const h = { stopped: false, src: null, g: null };
    buf(f).then(b => { if (!b || h.stopped || !ok()) return; const s = AC.createBufferSource(); s.buffer = b; s.loop = !!loop; const g = AC.createGain(); g.gain.value = (vol != null ? vol : VOL[k] || .8);
      if (loop) { g.gain.setValueAtTime(0, AC.currentTime); g.gain.linearRampToValueAtTime(vol != null ? vol : VOL[k] || .8, AC.currentTime + .6); }
      s.connect(g); g.connect(AUD.sfxGain); s.start(); h.src = s; h.g = g; });
    h.stop = (fade = .4) => { h.stopped = true; try { if (h.g && h.src) { h.g.gain.cancelScheduledValues(AC.currentTime); h.g.gain.setValueAtTime(h.g.gain.value, AC.currentTime); h.g.gain.linearRampToValueAtTime(0, AC.currentTime + fade); h.src.stop(AC.currentTime + fade + .05); } } catch (e) {} };
    h.vol = v => { try { if (h.g) h.g.gain.setTargetAtTime(v, AC.currentTime, .15); } catch (e) {} };
    return h; }
  const LOOPS = new Set();
  window.R193_SFX = {
    play: (k, vol) => start(k, false, vol),
    loop: (k, vol) => { const h = start(k, true, vol); if (h) LOOPS.add(h); return h; },
    stopAll: (fade) => { for (const h of LOOPS) h.stop(fade); LOOPS.clear(); },
    preload, USE };
})();
