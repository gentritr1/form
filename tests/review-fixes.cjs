// Behaviour fixed after reviewing the depth pass in a browser. Runs the original mock
// environment with every layer on, plus refresh-agnostic stall metrics.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert');
const original=fs.readFileSync(path.join(__dirname,'renderer.cjs'),'utf8');
const marker='vm.createContext(context);';
if(original.split(marker).length!==2)throw Error('Fixture marker changed.');
// getComputedStyle throws: with the room layer on, no draw may read computed style.
const fixture=original.replace(marker,`location.search='?layers=direct,shadow,room,construction,cast,adaptive';context.innerWidth=1800;context.innerHeight=875;ctx2d.clearRect=()=>{};gl.FRAMEBUFFER_COMPLETE=100;gl.checkFramebufferStatus=()=>100;
let styleReads=0;context.getComputedStyle=()=>{styleReads++;return {color:'rgb(39,42,45)',backgroundColor:'rgb(217,224,229)',getPropertyValue:()=>'#A04F2B'};};
${marker}`);
vm.runInNewContext(fixture.slice(0,fixture.indexOf('tick(4); assert'))+`
const all=vm.runInContext('allSculptures',context),roomNow=vm.runInContext('roomNow',context),cssEase=vm.runInContext('cssEase',context);
tick(6);const afterStart=styleReads;assert(all.every(s=>s.available),'Every view renders in the combined fixture');
// 1. Studio shape changes keep the continuous morph: the surface is never retracted.
const build=lab.construction;assert.equal(build.phase,'settled');
ids['study-title'].value='gentrit';ids['study-title'].emit('input');ids['study-title'].emit('keydown',{key:'Enter'});
assert.equal(lab.shape,1);assert.equal(build.phase,'settled','A cast in the studio does not retract the surface');assert.equal(build.sweep,1);assert.equal(build.radius,1);
assert(lab.morph<1,'The studio morphs instead');let lowest=1;
for(const word of ['s','sc','scu','scul','sculp','sculpt']){ids['study-title'].value=word;ids['study-title'].emit('input');ids['study-title'].emit('keydown',{key:'Enter'});for(let i=0;i<14;i++){tick(1);lowest=Math.min(lowest,build.radius,build.sweep);}}
assert.equal(lowest,1,'Typing never shrinks the studio sculpture');
// The hero still assembles from its curve.
objects[1].emit('click');assert.equal(hero.construction.phase,'retract','The hero keeps the construction event');tick(120);assert.equal(hero.construction.phase,'settled');
// 2. Room lighting: token tables, eased, with no style read while drawing.
swatches[1].emit('click');const start=now;tick(1);
const mid=roomNow(hero,start+210),end=roomNow(hero,start+420),lin=h=>[1,3,5].map(i=>Math.pow(parseInt(h.slice(i,i+2),16)/255,2.2));
const chrome=lin('#E8EBEE'),copper=lin('#ECE9E4');
end.room.forEach((v,i)=>assert(Math.abs(v-chrome[i])<1e-9,'Room settles exactly on the chrome page tint'));
mid.room.forEach((v,i)=>assert(v>=Math.min(chrome[i],copper[i])-1e-9&&v<=Math.max(chrome[i],copper[i])+1e-9,'Mid-crossfade room stays between the two tints'));
assert.equal(cssEase(0),0);assert.equal(cssEase(1),1);assert(Math.abs(cssEase(.5)-.8024)<.001,'cssEase matches cubic-bezier(.25,.1,.25,1)');
const preview=context.instances.previews[1];assert.deepEqual(roomNow(preview,now+1e6).room,lin('#CDD4DA'),'A gallery sculpture is lit by its own frame');
tick(60);assert.equal(styleReads,afterStart,'Drawing never reads computed style');
for(const s of all){s.paused=true;s.hovered=false;}tick(240);assert.equal(frames.size,0,'Everything still settles to zero animation frames');
console.log('Passed: studio morph while typing, hero construction, eased room lighting from token tables, no style reads in draw, idle.');
`,{require,__dirname,console});

// Shadow composite: the edge fade must stay in the shader for both GLSL versions.
const app=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8');
assert(/smoothstep\(0\.,\.12,uv\)\*smoothstep\(0\.,\.12,1\.-uv\)/.test(app),'Shadow composite fades toward the canvas edges');
assert(!/draw\(w,h\) \{[\s\S]*?getComputedStyle[\s\S]*?\n \}/.test(app.slice(app.indexOf(' draw(w,h) {'),app.indexOf(' drawGeometry('))),'draw() contains no computed-style read');

const metrics=require('./perf-metrics.cjs');
const s=metrics.stalls([8.3,8.4,16.7,16.6,26,49.9,50.1,120]);
assert.deepEqual(s,{over25:4,over50:2,lostMs:246});
assert.deepEqual(metrics.stalls([]),{over25:0,over50:0,lostMs:0});
console.log('Passed: shadow edge fade present, refresh-agnostic stall counts.');
