// Codex R160 黑金系统弹窗绘制代码（popup-canvas.mjs 原样，改成普通脚本：挂在 window.POPUP 上）
(function () {
// Codex R160 黑金系统弹窗绘制代码（原样，只改成按 layout 所在目录取拆件）
// Canvas 2D. The caller supplies the game state, skill/item images and the 1280×720 transform.
const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));
const sprite = (asset, rect) => ({type: 'sprite', asset, rect});
function offset(op, dx, dy) {
  const result = {...op};
  if (op.rect) result.rect = [op.rect[0] + dx, op.rect[1] + dy, ...op.rect.slice(2)];
  if (op.center) result.center = [op.center[0] + dx, op.center[1] + dy];
  if (op.ends) result.ends = op.ends.map((v,i) => v + (i % 2 ? dy : dx));
  return result;
}

async function loadPopup(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('布局读取失败 ' + response.status);
  const layout = await response.json();
  const entries = await Promise.all(Object.entries(layout.assets).map(async ([id, asset]) => {
    const image = new Image();
    image.src = new URL(asset.file, response.url).href;
    await image.decode();
    if (image.naturalWidth !== asset.size2x[0] || image.naturalHeight !== asset.size2x[1]) {
      throw new Error('拆件尺寸与布局不符 ' + id);
    }
    return [id, image];
  }));
  return {layout, images: Object.fromEntries(entries)};
}

function font(ctx, layout, node) {
  const role = node.font;
  const family = layout.text.fonts?.[role] ?? layout.text[role];
  ctx.font = (role === 'number' ? 'bold ' : '') + node.size + 'px "' + family + '", "Kaiti SC", serif';
}

function wrapDescription(ctx, layout, data) {
  font(ctx, layout, layout.rowTemplate[0]);
  return String(data.description ?? '').split(/\r?\n/u).flatMap(paragraph => {
    const lines = [];
    let line = '';
    // 作者 11-13（领悟用回黑金窗时发现）：换行不能把逗号、句号、右括号甩到下一行行首，也不能把左括号留在行尾
    for (const ch of paragraph) {
      if (line && ctx.measureText(line + ch).width > layout.wrapWidth) {
        let carry = '';
        if ('，。、；：！？）」』》…'.includes(ch) && line.length > 1) { carry = line[line.length - 1]; line = line.slice(0, -1); }   // 标点不上行首：带着前一个字一起换到下一行
        while (line.length > 1 && '（「『《'.includes(line[line.length - 1])) { carry = line[line.length - 1] + carry; line = line.slice(0, -1); }
        lines.push({line});
        line = carry;
      }
      line += ch;
    }
    return [...lines, {line}];
  });
}

function append(template, dx, dy, values, layout, draw) {
  for (const raw of template) {
    const op = offset(raw, dx, dy);
    if (op.type === 'text') op.value = op.literal ?? values[op.key] ?? '';
    if (op.type === 'runtimeIcon') op.icon = values[op.key];
    if (op.type === 'portrait') {
      const id = values[op.key];
      op.asset = 'portrait_' + id;
      op.sourceCrop2x = layout.portraitSourceCrops2x[id];
    }
    draw.push(op);
  }
}

function frameLayers(l, x, y, count, draw) {
  const {width, topHeight, bottomHeight} = l.frame;
  const pitch = l.frame.tileHeight ?? l.frame.rowTileHeight;
  draw.push(sprite('frame_top', [x,y,width,topHeight]));
  for (let i = 0; i < count; i++) draw.push(sprite('frame_body_tile', [x,y+topHeight+i*pitch,width,pitch]));
  draw.push(sprite('frame_bottom', [x,y+topHeight+count*pitch,width,bottomHeight]));
}

function systemScene(ctx, layout, data, {page = 0, pressed = false} = {}) {
  const f = layout.frame;
  let rows = data[layout.rowSource];
  if (layout.rowSource === 'description') {
    ctx.save();
    try { rows = wrapDescription(ctx, layout, data); } finally { ctx.restore(); }
  }
  if (!Array.isArray(rows)) throw new TypeError('缺少数据数组 ' + layout.rowSource);
  if (layout.limits?.members && (rows.length < 1 || rows.length > 3)) throw new RangeError('等级提升每次接受 1～3 名队员');
  const capHeight = f.topHeight + f.bottomHeight;
  const maxH = capHeight + Math.floor((f.maxHeight - capHeight) / f.tileHeight) * f.tileHeight;
  const baseH = layout.rowsY + layout.afterHeight + layout.footerSpace;
  const capacity = Math.max(1, Math.floor((maxH - baseH) / layout.rowPitch));
  const pages = Math.max(1, Math.ceil(rows.length/capacity));
  page = clamp(Math.trunc(page), 0, pages-1);
  const visible = rows.slice(page*capacity,(page+1)*capacity);
  const tileCount = Math.max(1, Math.ceil((baseH + visible.length*layout.rowPitch - capHeight) / f.tileHeight));
  const h = capHeight + tileCount*f.tileHeight;
  const x = f.x, y = Math.floor((layout.canvas1x[1]-h)/2);
  const draw = [];
  frameLayers(layout,x,y,tileCount,draw);
  append(layout.header,x,y,data,layout,draw);
  visible.forEach((row,i) => append(layout.rowTemplate,x,y+layout.rowsY+i*layout.rowPitch,row,layout,draw));
  append(layout.afterRows,x,y+layout.rowsY+visible.length*layout.rowPitch,data,layout,draw);
  const next = page+1 < pages;
  append(layout.footer,x,y+h,{confirm:next ? '下一页' : (data.confirm || '确定')},layout,draw);
  if (pressed) pressButton(draw,layout.confirmState);
  const hit = layout.hitAreas.confirm;
  return {draw,page,pages,next,frame:[x,y,f.width,h],bodyTiles:tileCount,hitArea:{...hit,rect:offset(hit,x,y+h).rect}};
}

function pressButton(draw,state) {
  const image = draw.find(op => op.asset === state.normal);
  if (image) image.asset = state.pressed;
  const text = draw.find(op => op.key === 'confirm');
  if (text) text.rect = offset(text,...state.pressedTextOffset).rect;
}

function group(draw,start,end,dx,dy) {
  return draw.slice(start,end).map(op=>offset(op,dx,dy));
}
const indexOf = (ops,asset) => ops.findIndex(op => op.asset === asset);
function indexedKey(key,i) { return key?.replace(/\d+$/u,String(i)); }

// The R155 draw examples supply each group's geometry and typography. Relocate whole groups
// using anchorsByCount so the same renderer supports all 28 party/drop combinations.
function victoryScene(layout,data,{pressed=false,timeMs=0,animate=false}={}) {
  const {members,drops} = data;
  const a = layout.anchorsByCount[members.length+'p'+drops.length+'d'];
  if (!a) throw new RangeError('结算支持 1～4 人、0～6 类掉落');
  const ref = layout.examples['3p4d'].draw, src=layout.anchorsByCount['3p4d'];
  const draw = group(ref,0,indexOf(ref,'frame_top'),0,a.titleY-src.titleY);
  draw[0].rect[1]=Math.max(0,a.titleY-16);
  if (animate) {
    const [lo,hi]=layout.glow.opacityRange;
    draw[0].opacity=lo+(hi-lo)*(.5+.5*Math.cos(timeMs*2*Math.PI/layout.glow.periodMs));
  }
  frameLayers(layout,a.frame[0],a.frame[1],a.bodyTiles,draw);
  const rowStart=ref.flatMap((op,i)=>op.asset==='role_row'?[i]:[]);
  const heading=ref.findIndex(op=>op.key==='partyHeading');
  draw.push(...group(ref,heading,rowStart[0],0,a.frame[1]-src.frame[1]));
  members.forEach((role,i) => {
    const idx=role.didLevelUp ? 1 : 0;
    const pitch=layout.spacing1x.roleRowPitch;
    const dy=a.rowsY+i*pitch-src.rowsY-idx*pitch;
    const ops=group(ref,rowStart[idx],rowStart[idx+1],0,dy);
    const values={name:role.name,gain:'+'+role.gain,progress:role.currentXp+' / '+role.requiredXp};
    for (const op of ops) {
      if (op.type==='portrait') {
        op.asset='portrait_'+role.roleId;
        op.sourceCrop2x=layout.portraitSourceCrops2x[role.roleId];
      } else if (op.type==='fillClip') {
        op.fraction=role.requiredXp>0?clamp(role.currentXp/role.requiredXp,0,1):0;
      } else if (op.key) {
        const name=op.key.replace(/\d+$/u,'');
        op.key=indexedKey(op.key,i);
        op.value=values[name] ?? op.sample;
      }
      draw.push(op);
    }
  });
  const rewardKey=drops.length?'3p4d':'1p0d';
  const rewardOps=layout.examples[rewardKey].draw;
  const start=rewardOps.findIndex(op=>op.type==='diamond');
  const end=indexOf(rewardOps,drops.length?'item_slot':'button_normal');
  const reward=group(rewardOps,start,end,0,a.rewardsY-layout.anchorsByCount[rewardKey].rewardsY);
  reward.find(op=>op.key==='currency').value='+'+data.currency;
  draw.push(...reward);
  const slots=ref.flatMap((op,i)=>op.asset==='item_slot'?[i]:[]);
  drops.forEach((item,i)=>{
    const dx=a.itemCenters[i]-src.itemCenters[0];
    const ops=group(ref,slots[0],slots[1],dx,a.rewardsY-src.rewardsY);
    for(const op of ops) {
      if (op.type==='itemIcon') op.icon=item.icon;
      if (op.key==='itemName0') op.value=item.name;
      if (op.key==='itemQuantity0') op.value='×'+item.quantity;
      if (op.key) op.key=indexedKey(op.key,i);
      draw.push(op);
    }
  });
  draw.push(...group(ref,indexOf(ref,'button_normal'),ref.length,0,a.buttonY-src.buttonY));
  if(pressed) pressButton(draw,layout.spriteStates.confirm);
  return {draw,frame:a.frame,bodyTiles:a.bodyTiles,hitArea:a.hitAreas.confirm,page:0,pages:1,next:false};
}

function drawText(ctx,l,op,timeMs) {
  const [x,y,w,h]=op.rect, value=String(op.value ?? op.sample ?? '');
  if (!value) return;
  font(ctx,l,op);
  ctx.textBaseline='alphabetic';ctx.textAlign='left';
  const m=ctx.measureText(value), width=m.width;
  let tx=x+(op.align==='right'?w-width:op.align==='center'?(w-width)/2:0);
  const ascent=m.actualBoundingBoxAscent, descent=m.actualBoundingBoxDescent;
  const ty=y+(h+ascent-descent)/2;
  ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  if (width>w) {
    // Keep the text at the specified size. Scroll long names and values inside their own rect.
    const travel=width-w, cycle=2000+2*travel/0.035;
    const t=((timeMs%cycle)+cycle)%cycle;
    const step=clamp((t-750)*.035,0,travel);
    tx=x-(t<cycle/2?step:clamp((cycle-t-750)*.035,0,travel));
  }
  if (op.effect==='titleGold') {
    const gradient=ctx.createLinearGradient(0,ty-ascent,0,ty+descent);
    l.text.titleGold.forEach((c,i,a)=>gradient.addColorStop(i/(a.length-1),c));
    ctx.fillStyle=gradient;
  } else ctx.fillStyle=op.color;
  if (op.font==='body') {
    ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.48;ctx.lineJoin='round';ctx.strokeText(value,tx,ty);
  }
  ctx.fillText(value,tx,ty);
}
function disk(ctx,x,y,r) {ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);}
function portrait(ctx,op,img) {
  const [x,y,w,h]=op.rect, inset=op.imageInset??0;
  const cx=x+w/2,cy=y+h/2;
  for(const rim of op.rim1x??[]) {
    disk(ctx,cx,cy,rim.radius);ctx.fillStyle=rim.color;ctx.fill();
  }
  disk(ctx,cx,cy,w/2-inset);ctx.clip();
  const [l,t,r,b]=op.sourceCrop2x??[0,0,img.width,img.height];
  ctx.drawImage(img,l,t,r-l,b-t,x+inset,y+inset,w-2*inset,h-2*inset);
}
function dynamicImage(ctx,op,img) {
  const [x,y,w,h]=op.rect;
  if(op.clip==='circle') {disk(ctx,x+w/2,y+h/2,w/2);ctx.clip();}
  // Item icons are supplied trimmed to their alpha bounds, as in R155.
  const cover=op.clip==='circle';
  const scale=(cover?Math.max:Math.min)(w/img.width,h/img.height);
  const dw=img.width*scale,dh=img.height*scale;
  ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
}

function paintPopup(ctx,pack,scene,{icons={},timeMs=0}={}) {
  for(const op of scene.draw) {
    ctx.save();
    try {
      if(op.opacity!==undefined) ctx.globalAlpha*=op.opacity;
      switch(op.type) {
        case 'sprite': ctx.drawImage(pack.images[op.asset],...op.rect);break;
        case 'text': drawText(ctx,pack.layout,op,timeMs);break;
        case 'line':
          ctx.strokeStyle=op.color;ctx.lineWidth=op.width;ctx.beginPath();
          ctx.moveTo(op.ends[0],op.ends[1]);ctx.lineTo(op.ends[2],op.ends[3]);ctx.stroke();break;
        case 'diamond': {
          const [x,y]=op.center,r=op.radius;ctx.fillStyle=op.color;ctx.beginPath();
          ctx.moveTo(x,y-r);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r,y);ctx.closePath();ctx.fill();break;
        }
        case 'portrait': {
          const img=pack.images[op.asset];
          if(img) portrait(ctx,op,img);
          break;
        }
        case 'runtimeIcon': case 'itemIcon': {
          const img=icons[op.icon ?? op.key];
          if(img) dynamicImage(ctx,op,img);
          break;
        }
        case 'fillClip': {
          const [x,y,w,h]=op.rect;
          ctx.beginPath();ctx.rect(x,y,w*op.fraction,h);ctx.clip();ctx.drawImage(pack.images[op.asset],x,y,w,h);break;
        }
      }
    } finally {ctx.restore();}
  }
}
function inConfirmArea(hit,x,y) {
  const [l,t,w,h]=hit.rect;
  if(x<l || x>l+w || y<t || y>t+h) return false;
  const r=Math.min(hit.radius??0,w/2,h/2);
  const cx=clamp(x,l+r,l+w-r), cy=clamp(y,t+r,t+h-r);
  return Math.hypot(cx-x,cy-y)<=r;
}

window.POPUP = { loadPopup, systemScene, victoryScene, paintPopup, inConfirmArea };
})();
