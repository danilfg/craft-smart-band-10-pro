// PocketCraft world logic. Deterministic, offline and dependency-free.
export const MATERIALS = ['grass','dirt','stone','sand','snow','wood','leaves','coal','iron','water','plank','brick','torch'];
export const RECIPES = [
  {id:'plank',title:'4 PLANKS',needs:{wood:1},makes:{plank:4}},
  {id:'pickaxe',title:'STONE PICK',needs:{wood:2,stone:3},makes:{pickaxe:1}},
  {id:'sword',title:'STONE SWORD',needs:{wood:2,stone:2},makes:{sword:1}},
  {id:'bread',title:'BERRY BREAD',needs:{berries:3},makes:{bread:1}},
  {id:'torch',title:'4 TORCHES',needs:{wood:1,coal:1},makes:{torch:4}},
  {id:'brick',title:'4 BRICKS',needs:{stone:4},makes:{brick:4}}
];
export const HOTBAR = ['dirt','stone','wood','plank','brick','torch'];
export function hash(x,y,seed) {
  let n = Math.imul(x,374761393) + Math.imul(y,668265263) + Math.imul(seed,1442695041);
  n = Math.imul(n ^ (n >>> 13),1274126177);
  n = n ^ (n >>> 16);
  return (n >>> 0) / 4294967295;
}
function smooth(x,y,seed,scale) {
  const fx=x/scale, fy=y/scale, ix=Math.floor(fx),iy=Math.floor(fy);
  let u=fx-ix,v=fy-iy;u=u*u*(3-2*u);v=v*v*(3-2*v);
  const a=hash(ix,iy,seed),b=hash(ix+1,iy,seed),c=hash(ix,iy+1,seed),d=hash(ix+1,iy+1,seed);
  return (a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v;
}
export function terrain(x,y,seed) {
  const climate=smooth(x,y,seed+55,22);
  const moisture=smooth(x,y,seed+89,16);
  const elev=smooth(x,y,seed,9)*0.7+smooth(x,y,seed+2,4)*0.3;
  const biome=climate<0.32?'snow':climate>0.68?'desert':moisture<0.31?'highland':'forest';
  let h=Math.max(1,Math.min(6,Math.floor(elev*6)+1));
  let type=biome==='desert'?'sand':biome==='snow'?'snow':biome==='highland'?'stone':'grass';
  if(h===1 && biome!=='snow')type='water';
  const decoration=hash(x,y,seed+772);
  if (type==='grass' && decoration>0.955)type='wood';
  if (type==='stone' && decoration>0.87)type=hash(x,y,seed+8)>0.58?'iron':'coal';
  if (type==='snow' && decoration>0.98)type='wood';
  return {h,type,biome};
}
export function cell(s,x,y) {
  const key=x+','+y;
  const edit=s.edits[key];
  return edit ? {h:edit.h,type:edit.type,biome:terrain(x,y,s.seed).biome} : terrain(x,y,s.seed);
}
export function createGame(seed,mode) {
  return {
    seed:seed>>>0,mode:mode==='creative'?'creative':'survival',
    x:0,y:0,dir:1,time:24,health:10,hunger:10,
    inv:{dirt:8,stone:5,wood:4,plank:0,brick:0,torch:1,coal:0,iron:0,berries:3,bread:1,pickaxe:0,sword:0},
    edits:{},selected:'dirt',enemies:[],kills:0,steps:0,tickNo:0,message:'Explore your world'
  };
}
export function isNight(s) { return (s.time%180)>=104; }
export function facing(s) {
  const ds=[[0,-1],[1,0],[0,1],[-1,0]];
  const v=ds[s.dir%4];
  return {x:s.x+v[0],y:s.y+v[1]};
}
function setCell(s,x,y,h,type) {
  const key=x+','+y;
  // Keep save bounded on a low-memory watch; preserve most recently edited places.
  if(!Object.prototype.hasOwnProperty.call(s.edits,key) && Object.keys(s.edits).length>=160) {
    delete s.edits[Object.keys(s.edits)[0]];
  }
  s.edits[key]={h,type};
}
export function walk(s,dir) {
  s.dir=dir;
  const dest=facing(s), from=cell(s,s.x,s.y), to=cell(s,dest.x,dest.y);
  if(s.mode!=='creative' && (to.type==='water' || to.h>from.h+1)) {
    s.message=to.type==='water'?'Water: build a bridge':'Too high: mine a step';
    return false;
  }
  s.x=dest.x;s.y=dest.y;s.steps++;
  if(s.mode==='survival' && s.steps%10===0) s.hunger=Math.max(0,s.hunger-1);
  s.message='Biome: '+to.biome.toUpperCase();
  return true;
}
export function mine(s) {
  const p=facing(s),t=cell(s,p.x,p.y);
  if(t.type==='water' || t.h<=1) {s.message='Nothing to mine';return false;}
  if((t.type==='iron' || t.type==='coal') && s.mode==='survival' && !s.inv.pickaxe) {
    s.message='Craft a stone pick';return false;
  }
  if(s.mode==='survival') {
    const loot=t.type==='grass'?'dirt':t.type==='snow'?'snow':t.type==='leaves'?'wood':t.type;
    s.inv[loot]=(s.inv[loot]||0)+1;
    if(t.type==='wood' && hash(p.x,p.y,s.seed+9)>0.48)s.inv.berries=(s.inv.berries||0)+1;
  }
  const below=hash(p.x,p.y,s.seed+t.h*37);
  const next=t.h<=2?'stone':below>.89?'coal':below>.83?'iron':t.h>=4?'dirt':'stone';
  setCell(s,p.x,p.y,t.h-1,next);
  s.message='Mined '+t.type.toUpperCase();
  return true;
}
export function place(s,type) {
  if(MATERIALS.indexOf(type)<0 || type==='water' || type==='grass' || type==='snow' || type==='coal' || type==='iron') {
    s.message='Choose a build block';return false;
  }
  if(s.mode==='survival' && !(s.inv[type]>0)){s.message='No '+type+' in bag';return false;}
  const p=facing(s),t=cell(s,p.x,p.y);
  if(t.h>=8){s.message='Height limit reached';return false;}
  if(s.mode==='survival')s.inv[type]--;
  setCell(s,p.x,p.y,t.h+1,type);
  s.message='Placed '+type.toUpperCase();
  return true;
}
export function craft(s,id) {
  const recipe=RECIPES.find(r=>r.id===id);
  if(!recipe){s.message='Unknown recipe';return false;}
  if(s.mode==='survival') {
    for(const k of Object.keys(recipe.needs))if((s.inv[k]||0)<recipe.needs[k]) {
      s.message='Need '+k.toUpperCase();return false;
    }
    for(const k of Object.keys(recipe.needs))s.inv[k]-=recipe.needs[k];
  }
  for(const k of Object.keys(recipe.makes))s.inv[k]=(s.inv[k]||0)+recipe.makes[k];
  s.message='Crafted '+recipe.title;
  return true;
}
export function eat(s) {
  if(s.mode==='creative'){s.message='Creative: always full';return true;}
  const kind=s.inv.bread>0?'bread':s.inv.berries>0?'berries':null;
  if(!kind){s.message='Need food';return false;}
  s.inv[kind]--;s.hunger=Math.min(10,s.hunger+(kind==='bread'?6:2));
  s.health=Math.min(10,s.health+1);s.message='Yum!';return true;
}
export function attack(s) {
  const p=facing(s);
  let best=-1,dist=3;
  s.enemies.forEach((m,i)=>{const d=Math.abs(p.x-m.x)+Math.abs(p.y-m.y);if(d<dist){dist=d;best=i;}});
  if(best<0){s.message='No mob nearby';return false;}
  s.enemies.splice(best,1);s.kills++;
  if(s.mode==='survival')s.inv.berries=(s.inv.berries||0)+1;
  s.message='Mob defeated!';return true;
}
export function stepTime(s) {
  s.tickNo++;s.time=(s.time+1)%180;
  if(s.mode==='creative')return;
  if(s.tickNo%25===0) {
    if(s.hunger===0)s.health=Math.max(0,s.health-1);
    else if(s.health<10 && s.hunger>7)s.health++;
  }
  if(isNight(s) && s.tickNo%13===0 && s.enemies.length<3) {
    const dx=(hash(s.tickNo,7,s.seed)>0.5?1:-1)*3;
    const dy=(hash(s.tickNo,9,s.seed)>0.5?1:-1)*2;
    s.enemies.push({x:s.x+dx,y:s.y+dy});
  }
  if(s.tickNo%4===0) {
    s.enemies.forEach(m=>{
      if(m.x!==s.x)m.x+=m.x>s.x?-1:1;
      else if(m.y!==s.y)m.y+=m.y>s.y?-1:1;
      if(Math.abs(m.x-s.x)+Math.abs(m.y-s.y)<=1)
        s.health=Math.max(0,s.health-1);
    });
  }
  if(!isNight(s))s.enemies=[];
  if(s.health===0)s.message='You fell! Respawn to continue';
}
export function snapshot(s) {
  return JSON.stringify({seed:s.seed,mode:s.mode,x:s.x,y:s.y,dir:s.dir,time:s.time,health:s.health,hunger:s.hunger,inv:s.inv,edits:s.edits,selected:s.selected,kills:s.kills,steps:s.steps});
}
export function restore(raw) {
  const v=JSON.parse(raw);
  if(!v || !Number.isFinite(v.seed) || !v.inv || !v.edits)throw Error('Bad save');
  const s=createGame(v.seed,v.mode);
  for(const k of ['x','y','dir','time','health','hunger','selected','kills','steps']) {
    if(v[k]!==undefined)s[k]=v[k];
  }
  s.inv=v.inv;s.edits=v.edits;return s;
}
export function renderTiles(s) {
  const out=[],radius=4;
  for(let layer=-radius*2;layer<=radius*2;layer++) {
    for(let dx=-radius;dx<=radius;dx++) {
      const dy=layer-dx;
      if(dy < -radius || dy > radius)continue;
      const c=cell(s,s.x+dx,s.y+dy);
      const px=Math.round(168+(dx-dy)*24-32);
      const py=Math.round(133+(dx+dy)*12-c.h*9);
      out.push({id:(dx+radius)*9+(dy+radius),image:'/common/blocks/'+c.type+'_'+c.h+'.png',x:px,y:py,type:c.type});
    }
  }
  const front=facing(s),fx=front.x-s.x,fy=front.y-s.y;
  const center=cell(s,s.x,s.y);
  const mobs=s.enemies.filter(m=>Math.abs(m.x-s.x)<5&&Math.abs(m.y-s.y)<5).map((m,i)=>({
    id:i,x:Math.round(168+((m.x-s.x)-(m.y-s.y))*24-17),
    y:Math.round(132+((m.x-s.x)+(m.y-s.y))*12-cell(s,m.x,m.y).h*9-25)
  }));
  return {blocks:out,mobs,playerY:Math.round(124-center.h*9),targetX:Math.round(168+(fx-fy)*24-21),targetY:Math.round(138+(fx+fy)*12-cell(s,front.x,front.y).h*9),biome:center.biome};
}
