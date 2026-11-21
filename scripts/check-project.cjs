const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'src/manifest.json'),'utf8'));
assert.equal(manifest.router.entry,'pages/index');
assert.equal(manifest.config.designWidth,336);
assert.ok(manifest.deviceTypeList.includes('watch'));
for(const p of ['src/app.ux','src/pages/index/index.ux','src/common/world.js','src/common/logo.png','src/common/day_bg.png','src/common/night_bg.png','src/common/player.png','src/common/zombie.png']) {
 assert.ok(fs.existsSync(path.join(root,p)),'Missing '+p);
}
const page=fs.readFileSync(path.join(root,'src/pages/index/index.ux'),'utf8');
for(const required of ['onBackPress','exitGame','startSurvival','startCreative','continueGame','openCraft','mine(','place(','saveWorld','renderTiles']) {
 assert.ok(page.includes(required),'Missing '+required);
}
for(const name of ['grass','dirt','stone','sand','snow','wood','leaves','coal','iron','water','plank','brick','torch']) {
 for(let h=1;h<=8;h++) {
  const file=path.join(root,'src/common/blocks',name+'_'+h+'.png');
  assert.ok(fs.existsSync(file),'Missing voxel sprite: '+file);
  const png=fs.readFileSync(file);
  assert.equal(png.subarray(1,4).toString('ascii'),'PNG',file);
  assert.equal(png.readUInt32BE(16),64,file+' width');
  assert.equal(png.readUInt32BE(20),105,file+' height');
 }
}
const fixedImageCount=(page.match(/class="voxel"/g)||[]).length;
assert.equal(fixedImageCount,9,'Use exactly 9 fixed voxel nodes on the 32 MB watch');
assert.ok(!page.includes('for="{{blocks}}"'),'Unbounded dynamic voxel lists are forbidden');
assert.ok(page.includes('if="{{screen === \'loading\'}}"'),'Require a visible load state');
assert.ok(page.includes('class="exit-small" @click="exitGame"'),'Require an EXIT action while playing');
assert.ok(page.includes('app.terminate()'),'Exit must terminate the quick app');
assert.equal(manifest.versionCode>=3,true,'Increment versionCode for watch update');
console.log('PocketCraft Lite: manifest, EXIT, 9 image nodes and 104 fixed-size PNG sprites validated.');
