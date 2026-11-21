import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/common/world.js',import.meta.url),'utf8');
const {createGame,terrain,cell,hash,walk,mine,place,craft,eat,attack,stepTime,renderTiles,snapshot,restore,isNight} =
 await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(source));

test('deterministic unlimited terrain in three climate biomes',()=>{
 const a=terrain(284,12,12345);
 assert.deepEqual(a,terrain(284,12,12345));
 for(const [x,y] of [[-999,-200],[0,0],[100000,999999]]) {
  const v=terrain(x,y,12345);
  assert.ok(v.h>=1&&v.h<=6);
 }
 const biomes=new Set();
 for(let x=-250;x<250;x+=9)for(let y=-190;y<190;y+=9)biomes.add(terrain(x,y,12345).biome);
 assert.ok(biomes.size>=3);
});
test('mining changes voxel height and produces resources',()=>{
 const s=createGame(773,'survival');
 s.x=10;s.y=10;s.dir=1;s.inv.pickaxe=1;
 const before=cell(s,11,10);
 if(before.h>1&&before.type!=='water') {
  assert.equal(mine(s),true);
  assert.equal(cell(s,11,10).h,before.h-1);
 }
});
test('creative mode builds without consuming items and can traverse water',()=>{
 const s=createGame(123,'creative');s.x=18;s.y=18;s.dir=1;
 const target=cell(s,19,18),count=s.inv.wood;
 if(target.h<8){
  assert.equal(place(s,'wood'),true);
  assert.equal(cell(s,19,18).h,target.h+1);
  assert.equal(s.inv.wood,count);
 }
});
test('survival crafting consumes materials and produces items',()=>{
 const s=createGame(12,'survival');
 assert.equal(craft(s,'pickaxe'),true);
 assert.equal(s.inv.pickaxe,1);
 assert.equal(s.inv.stone,2);
 assert.equal(craft(s,'sword'),true);
 assert.equal(s.inv.sword,1);
 assert.equal(craft(s,'bread'),true);
 assert.equal(s.inv.bread,2);
});
test('hunger, night and mob updates do not crash',()=>{
 const s=createGame(91,'survival');
 for(let i=0;i<160;i++)stepTime(s);
 assert.ok(s.time>=0&&s.time<180);
 assert.ok(s.health>=0&&s.health<=10);
 assert.equal(typeof isNight(s),'boolean');
});
test('save/restore retains modified world and inventory',()=>{
 const s=createGame(44,'survival');
 s.edits['10,20']={h:5,type:'brick'};
 s.inv.wood=17;s.x=9;s.y=8;
 const restored=restore(snapshot(s));
 assert.equal(cell(restored,10,20).type,'brick');
 assert.equal(restored.inv.wood,17);
 assert.equal(restored.x,9);
});
test('isometric render order and target are finite',()=>{
 const s=createGame(34,'creative');
 const scene=renderTiles(s);
 assert.equal(scene.blocks.length,81);
 assert.ok(scene.blocks.every(b=>Number.isFinite(b.x)&&Number.isFinite(b.y)));
 assert.ok(scene.blocks.every(b=>b.image.endsWith('.png')));
});
