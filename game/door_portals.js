/* 青阳镇门口传送光标 v1 — load after the game's inline scripts.
 * Preserves quests/saves; moves the inaccessible south-wall house entrance
 * to the existing north-street house of the same type.
 * Ground ellipse is behind actors; floating marker is drawn after buildings.
 */
(() => {
  'use strict';
  if (typeof lfxDoor !== 'function' || typeof tileAmbientHigh !== 'function') return;
  // The former south-wall house overlaps collision and cannot be entered.
  // Reuse a clear existing doorway; don't cut holes in walls or move artwork.
  const townDef = TMAPS.qy_town;
  const house = townDef.doors.find(d => d.to === 'qy_house' && !d.noGlow);
  const target = CXTOWN.doors.find(d => d.uid === 'house_01_1');
  if (house && target && Math.abs(house.x - 1843.2) < 1) {
    const spare = townDef.doors.find(d => d.noGlow && d.x === target.x && d.y === target.y + 24);
    if (spare) {
      const oldPos = {x:house.x, y:house.y};
      house.x=target.x; house.y=target.y+24;
      spare.x=oldPos.x; spare.y=oldPos.y;
      const back=[target.x/64-.5,(target.y+58)/64-.8];
      qyBack.qy_house=back;
      for(const e of TMAPS.qy_house.exits||[])if(e.to==='qy_town')e.at=back;
      delete QY_DOORS.house_01_62; QY_DOORS.house_01_1=['qy_house','民居'];
    }
  }
  const oldDoor = lfxDoor, oldHigh = tileAmbientHigh;
  const active = d => d && !d.edge && !d.noGlow && (!d.cond || d.cond());
  const town = () => world.map && world.map.def === TMAPS.qy_town;
  const pos = d => d.rect ? d.rect : [(d.c + .5) * TS, (d.r + 1) * TS - 6];
  lfxDoor = function(x, y, now, d) {
    if (!town()) return oldDoor(x, y, now, d);
    if (!active(d)) return;
    const pulse = .85 + Math.sin(now * 2.2) * .15;
    ctx.save(); ctx.translate(x, y); ctx.scale(1, .42);
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(0,0,7,0,0,48);
    glow.addColorStop(0,'rgba(120,230,218,.15)');
    glow.addColorStop(.65,'rgba(150,235,220,.23)');
    glow.addColorStop(1,'rgba(150,235,220,0)');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,48,0,Math.PI*2);ctx.fill();
    ctx.shadowColor='#b0fff1';ctx.shadowBlur=8;ctx.lineWidth=2;
    ctx.strokeStyle=`rgba(185,255,233,${.85*pulse})`;
    ctx.beginPath();ctx.arc(0,0,37,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle=`rgba(255,222,157,${.85*pulse})`;ctx.lineWidth=1.3;
    ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.stroke();
    ctx.rotate(now*.32);
    for(let i=0;i<8;i++) {ctx.rotate(Math.PI/4);ctx.beginPath();ctx.moveTo(39,0);ctx.lineTo(44,0);ctx.stroke();}
    ctx.restore();
  };
  tileAmbientHigh = function(T, cam, now) {
    oldHigh(T, cam, now);
    if (!town()) return;
    for(const d of T.doors) {
      if(!active(d)) continue;
      const [x,y]=pos(d);
      if(x<cam.x-70||x>cam.x+W+70||y<cam.y-30||y>cam.y+H+90)continue;
      const near = world.player && Math.hypot(world.player.x-x,world.player.y-y)<190;
      const bob=Math.sin(now*2.6)*3;
      ctx.save();ctx.translate(x,y-30+bob);
      // A small downward chevron reads as an entrance, without covering the signboard.
      ctx.shadowColor='rgba(180,255,225,.85)';ctx.shadowBlur=8;
      ctx.lineJoin='round';ctx.lineWidth=2;ctx.strokeStyle='#41544b';ctx.fillStyle='#fff1b4';
      ctx.beginPath();ctx.moveTo(-10,-6);ctx.lineTo(0,1);ctx.lineTo(10,-6);ctx.lineTo(10,0);ctx.lineTo(0,8);ctx.lineTo(-10,0);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.restore();
      if(near && d.label) {
        ctx.save();ctx.font=`600 16px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';
        const label='进入 · '+d.label, w=ctx.measureText(label).width+22;
        ctx.fillStyle='rgba(20,41,35,.87)';ctx.strokeStyle='rgba(215,210,154,.85)';ctx.lineWidth=1;
        ctx.beginPath();ctx.roundRect(x-w/2,y-76,w,26,5);ctx.fill();ctx.stroke();
        ctx.fillStyle='#fff0cc';ctx.fillText(label,x,y-63);ctx.restore();
      }
    }
  };
})();
