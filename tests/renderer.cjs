// State/lifecycle regression checks with a mocked WebGL context.
// These checks do not validate GLSL compilation or rendered appearance.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const root = path.join(__dirname, '..');
class El {
 constructor(data = {},tag='div') { this.dataset=data; this.tag=tag; this.style={setProperty(k,v){this[k]=v;}}; this.events={}; this.attrs={}; this.value=''; this.width=0; this.height=0; this.textContent=''; this.parentElement=this; }
 addEventListener(n,fn) { (this.events[n]??=[]).push(fn); }
 emit(n,e={}) { for(const f of this.events[n]??[])f({button:0,preventDefault(){},...e}); }
 setAttribute(n,v) { this.attrs[n]=v; }
 append() {} setPointerCapture() {} focus() { this.focused=true; } scrollIntoView() {} remove() {}
 click() { if(this.tag==='a')downloads.push({href:this.href,name:this.download}); }
 toBlob(callback) { if(failBlob)callback(null);else pendingBlob=callback; }
 closest() { return this; }
 querySelector() { return this.fallback ??= new El(); }
 getBoundingClientRect() { return this.rect||{width:800,height:650,left:0,top:0}; }
 getContext(type) { return type==='2d'?ctx2d:gl; }
}
let glCalls=0;
let pendingBlob=null,failBlob=false,failCopy=false;
const downloads=[],posterText=[],timers=[],revoked=[];
const ctx2d={fillRect(){},fillText(t){posterText.push(t);},measureText(t){return{width:t.length*Number(this.font.match(/(\d+)px/)[1])*.52};},drawImage(){if(failCopy)throw Error('Copy failed');},beginPath(){},moveTo(){},lineTo(){},stroke(){}};
const uniforms={};
// Every draw records which float uniforms it set, so the ripple-form uniforms can be checked per draw.
let drawUniforms=new Set();const drawLog=[];
const gl=new Proxy({COMPILE_STATUS:1,LINK_STATUS:2,isContextLost:()=>false,getShaderParameter:()=>true,getProgramParameter:()=>true,getAttribLocation:()=>0,getUniformLocation:(_,n)=>n,uniform1f:(n,v)=>{uniforms[n]=v;drawUniforms.add(n);},drawElements:()=>{glCalls++;drawLog.push(drawUniforms);drawUniforms=new Set();}},{get:(o,k)=>k in o?o[k]:()=>({})});
const ids={};
const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
for(const [,id] of html.matchAll(/id="([^"]+)"/g))ids[id]=new El();
ids.tension.value=35; ids.light.value=45;
ids['shape-control'].rect={width:44,height:160,left:0,top:0};
const swatches=[0,1,2].map(i=>new El({material:String(i)}));
const objects=[0,1,2].map(i=>new El({object:String(i)}));
const works=[0,1,2].map(i=>new El({shape:String(i)}));
const previews=[0,1,2].map(i=>new El({shape:String(i),material:String(i)}));
const controls=[ids.tension,ids.light,ids['lab-reset'],ids['lab-shape'],ids['lab-material'],ids['shape-handle'],ids.surprise];
// Model the segmented radio groups that replaced the old <select>s.
function makeSeg(id,checkedIndex){
 const group=ids[id];
 group.radios=[0,1,2].map(v=>{const r=new El({},'input');r.value=String(v);r.checked=v===checkedIndex;return r;});
 group.querySelector=sel=>sel==='input:checked'?(group.radios.find(r=>r.checked)||null):new El();
 group.querySelectorAll=sel=>sel==='input'?group.radios:[];
}
makeSeg('lab-shape',2);makeSeg('lab-material',1);
const pickSeg=(id,index)=>{ids[id].radios.forEach(r=>r.checked=Number(r.value)===index);ids[id].emit('change');};
const segChecked=id=>{const r=ids[id].radios.find(x=>x.checked);return r?Number(r.value):-1;};
const fallback=new El(), meta=new El();
let now=100,frames=new Map(),seq=0;
const media=matches=>({matches,addEventListener(n,f){this.handler=f;}});
const reduced=media(false),fine=media(true),system=media(false);
const storage={};
const document={hidden:false,body:new El(),documentElement:{dataset:{}},events:{},querySelector(s){
 if(s==='#stage .fallback strong')return fallback;
 if(s.startsWith('#'))return ids[s.slice(1)];
 if(s.startsWith('[data-object='))return objects[Number(s.match(/"(\d)"/)[1])];
 if(s.startsWith('meta'))return meta;
 return new El();
},querySelectorAll(s){
 if(s==='.swatch')return swatches; if(s==='[data-object]')return objects;
 if(s==='.work')return works; if(s==='.preview')return previews;
 if(s.startsWith('.experiment-controls input'))return controls;
 return [];
},createElement:tag=>new El({},tag),addEventListener(n,f){this.events[n]=f;}};
// Timers run at most once; clearTimeout cancels. flushTimers() runs everything still pending.
const clearedTimers=new Set(),ranTimers=new Set();
const setTimeoutMock=f=>{const id=timers.length+1;timers.push(()=>{if(clearedTimers.has(id)||ranTimers.has(id))return;ranTimers.add(id);f();});return id;};
const flushTimers=()=>{for(const f of [...timers])f();};
const location={hash:'',get href(){return 'http://127.0.0.1:4173/'+this.hash;}};
const replaceCalls=[];const history={replaceState(_,__,url){replaceCalls.push(url);location.hash=url;}};
const windowEvents={};
const context={document,console,Math,Float32Array,Uint16Array,performance:{now:()=>now},devicePixelRatio:1,URL:{createObjectURL:()=> 'blob:print-test',revokeObjectURL:u=>revoked.push(u)},setTimeout:setTimeoutMock,clearTimeout:id=>clearedTimers.add(id),location,history,navigator:{},addEventListener:(n,f)=>windowEvents[n]=f,localStorage:{setItem:(k,v)=>storage[k]=v},matchMedia:q=>q.includes('reduced')?reduced:q.includes('pointer')?fine:system,
 ResizeObserver:class{constructor(f){this.f=f;}observe(){this.f([{contentRect:{width:800,height:650}}]);}},
 IntersectionObserver:class{constructor(f){this.f=f;}observe(t){this.f([{isIntersecting:true,target:t}]);}unobserve(){}},
 requestAnimationFrame:f=>{frames.set(++seq,f);return seq;},cancelAnimationFrame:i=>frames.delete(i)};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'dist/app.js'),'utf8')+';globalThis.instances={hero,lab,previews};globalThis.studioState=()=>({lastStudy,scene,savingPrint});',context);
const {hero,lab}=context.instances;
const tick=n=>{for(let i=0;i<n;i++){now+=16;const batch=[...frames];frames.clear();for(const [,f]of batch)f(now);}};
tick(4); assert(glCalls>0,'Renderer must issue draws');
objects[1].emit('click');tick(10);assert(hero.morph>0&&hero.morph<1,'Object must morph');
const visiblePoint=hero.currentMesh.positions[120]+(hero.targetMesh.positions[120]-hero.currentMesh.positions[120])*hero.morph;
objects[2].emit('click');assert(Math.abs(hero.currentMesh.positions[120]-visiblePoint)<1e-6,'Interrupted morph must start from the displayed surface');
tick(50);assert.equal(hero.shape,2);assert.equal(hero.morph,1);assert.equal(objects[2].attrs['aria-pressed'],'true');
swatches[0].emit('click');tick(20);assert.equal(hero.materialProgress,1);assert(Math.abs(hero.color[0]-.72)<1e-6);
assert.equal(document.documentElement.dataset.material,'copper','Hero material click sets the page material');
assert.equal(meta.attrs.content,'#ECE9E4','Theme-color meta follows light copper');
swatches[1].emit('click');assert.equal(document.documentElement.dataset.material,'chrome');assert.equal(meta.attrs.content,'#E8EBEE','Theme-color meta follows the material');
swatches[0].emit('click');assert.equal(document.documentElement.dataset.material,'copper');
ids.tension.value=82;ids.tension.emit('input');assert.equal(lab.tension,.82);assert.equal(ids.tension.attrs['aria-valuetext'],'82 percent');assert.equal(ids.tension.style['--fill'],'82%','Twist slider fill is set');
ids.light.value=150;ids.light.emit('input');assert(lab.targetLight>1.8);assert.equal(ids.light.attrs['aria-valuetext'],'150 degrees');assert(ids.light.style['--fill']&&ids.light.style['--fill'].startsWith('83'),'Light slider fill is set');
ids['lab-reset'].emit('click');assert.equal(lab.targetTension,.35);assert.equal(lab.targetLight,0);assert.equal(ids.light.attrs['aria-valuetext'],'45 degrees');tick(40);assert(Math.abs(lab.tension-.35)<.001);
ids['hero-canvas'].emit('keydown',{key:'ArrowRight'});assert.equal(hero.y,hero.ty);
ids.pause.emit('click');assert(hero.paused);
reduced.matches=true;reduced.handler();assert.equal(ids.pause.disabled,true);objects[0].emit('click');tick(2);assert.equal(hero.morph,1);
reduced.matches=false;reduced.handler();assert(hero.paused,'A system preference change must preserve the visitor pause choice');
ids['lab-canvas'].emit('webglcontextlost');assert.equal(lab.available,false);assert(controls.every(c=>c.disabled));assert.equal(ids['lab-pause'].disabled,true);
ids['lab-canvas'].emit('webglcontextrestored');assert.equal(lab.available,true);assert(controls.every(c=>!c.disabled));assert.equal(ids['lab-pause'].disabled,false);
ids['hero-canvas'].emit('webglcontextlost');assert.equal(ids.pause.disabled,true);assert.equal(ids.reset.disabled,true);
works[1].emit('click');assert.equal(objects[1].focused,true,'Unavailable viewer must focus its visible object selector');
ids['hero-canvas'].emit('webglcontextrestored');assert.equal(ids.pause.disabled,false);assert.equal(ids.reset.disabled,false);
hero.width=320;hero.height=460;context.cancelAnimationFrame(hero.frame);hero.frame=0;hero.render(now);assert(Math.abs(uniforms.uScale-1.1*320/460)<1e-6,'Portrait canvases must fit the sculpture');
// The last object opened was Orbit/chrome, so dark theme-color tracks dark chrome.
ids.theme.emit('click');assert.equal(storage['form-theme'],'dark');assert.equal(meta.attrs.content,'#17191C','Theme-color meta follows dark chrome');assert.equal(ids.theme.attrs['aria-label'],'Switch to light theme');assert.equal(ids.theme.dataset.dark,'true');
document.hidden=true;document.events.visibilitychange();assert.equal(frames.size,0,'Hidden pages must cancel every scheduled render');
document.hidden=false;document.events.visibilitychange();assert(frames.size>0,'Visible pages must redraw');

const handle=ids['shape-handle'];
handle.emit('pointerdown',{pointerId:7,clientY:300});handle.emit('pointermove',{pointerId:7,clientY:140});
assert.equal(lab.tension,1,'Direct shaping must follow input immediately');assert.equal(handle.attrs['aria-valuenow'],'100');assert.equal(handle.dataset.dragging,'true');
handle.emit('pointerup',{pointerId:7});assert.equal(handle.dataset.dragging,undefined);assert.equal(handle.style['--twist-ratio'],'0');
handle.emit('keydown',{key:'Home'});assert.equal(lab.tension,0);handle.emit('keydown',{key:'End'});handle.emit('keydown',{key:'ArrowDown'});assert.equal(lab.tension,.99);
handle.emit('pointerdown',{pointerId:8,clientY:300});ids['lab-canvas'].emit('webglcontextlost');assert.equal(handle.dataset.dragging,undefined);assert.equal(ids['save-print'].disabled,true);ids['lab-canvas'].emit('webglcontextrestored');
let previous=-1;
for(let i=0;i<20;i++){
 ids.surprise.emit('click');const state=context.studioState();assert.notEqual(state.lastStudy,previous,'Curated surprises must not repeat immediately');previous=state.lastStudy;
 assert(lab.shape>=0&&lab.shape<3);assert(lab.material>=0&&lab.material<3);assert(lab.targetTension>=0&&lab.targetTension<=1);
 assert.equal(segChecked('lab-shape'),lab.shape,'Surprise syncs the object control to the sculpture');
 assert.equal(segChecked('lab-material'),lab.material,'Surprise syncs the material control to the sculpture');
 assert.equal(ids['lab-shape'].dataset.index,String(lab.shape),'Object thumb index follows Surprise me');
 assert.equal(ids['lab-material'].dataset.index,String(lab.material),'Material thumb index follows Surprise me');
}
pickSeg('lab-shape',2);pickSeg('lab-material',2);tick(50);
assert.equal(lab.shape,2);assert.equal(lab.material,2);assert.equal(ids['lab-shape'].dataset.index,'2');assert.equal(ids['lab-material'].dataset.index,'2');
ids['study-title'].value='Qetësi / study';ids['study-title'].emit('input');assert.equal(ids['study-name'].textContent,'Qetësi / study');
const oldWidth=lab.canvas.width,oldHeight=lab.canvas.height,oldPose=[lab.x,lab.y,lab.tension,lab.morph,...lab.color];
ids['save-print'].emit('click');assert.equal(ids['save-print'].disabled,true);assert.equal(ids['save-print'].attrs['aria-busy'],'true');assert(pendingBlob);
assert.equal(lab.canvas.width,oldWidth);assert.equal(lab.canvas.height,oldHeight);assert.deepEqual([lab.x,lab.y,lab.tension,lab.morph,...lab.color],oldPose,'Print drawing must preserve the exact sculpture state');
const textCount=posterText.length;ids['save-print'].emit('click');assert.equal(posterText.length,textCount,'Duplicate clicks must not launch a second export');
pendingBlob({type:'image/png'});pendingBlob=null;assert.equal(downloads[0].name,'form-qetesi-study.png');assert.equal(ids['save-print'].disabled,false);assert.equal(ids['save-print'].attrs['aria-busy'],'false');assert(posterText.includes('Bloom / Porcelain'));
assert.equal(ids['save-print'].dataset.state,'done','A saved print marks the button done');
timers.forEach(f=>f());assert.deepEqual(revoked,['blob:print-test']);assert.equal(ids['save-print'].dataset.state,undefined,'The done state clears on its timer');
failBlob=true;ids['save-print'].emit('click');assert.equal(ids['print-status'].dataset.error,'true');assert.equal(ids['save-print'].disabled,false);assert.equal(ids['save-print'].dataset.state,undefined,'A failed print never marks the button done');failBlob=false;
failCopy=true;ids['save-print'].emit('click');assert.equal(ids['print-status'].dataset.error,'true');assert.equal(ids['save-print'].dataset.state,undefined);assert.equal(lab.canvas.width,oldWidth);assert.equal(lab.canvas.height,oldHeight);failCopy=false;
reduced.matches=true;reduced.handler();ids.surprise.emit('click');tick(2);assert.equal(lab.morph,1);assert.equal(lab.materialProgress,1);assert.equal(lab.tension,lab.targetTension);
ids['lab-reset'].emit('click');assert.equal(lab.shape,2);assert.equal(lab.material,1);assert.equal(lab.tension,.35);assert.equal(ids['study-title'].value,'');assert.equal(context.studioState().scene.bg,'#d9e0e5');
assert.equal(ids['lab-shape'].dataset.index,'2','Object thumb index follows Start again');assert.equal(ids['lab-material'].dataset.index,'1','Material thumb index follows Start again');

// ---- Cast a word ----
(async()=>{
const {castWord,parseStudy,studyHash}=context;
const TAU=Math.PI*2,shapeNames=['Trefoil','Orbit','Bloom'],materialNames=['Copper','Chrome','Porcelain'],sceneBg={silver:'#d9e0e5',sage:'#cdd9d2',ink:'#202b35'};
const plain=v=>JSON.parse(JSON.stringify(v));
const turn=(a,b)=>Math.abs(((a-b)%TAU+TAU*1.5)%TAU-TAU/2);
const title=ids['study-title'],readout=ids['cast-readout'],status=ids['print-status'];
const typeWord=w=>{title.value=w;title.emit('input');};
let announcements=0;{let text='';Object.defineProperty(ids.announcement,'textContent',{get:()=>text,set:v=>{text=v;announcements++;}});}
const readoutFor=(c,adjusted)=>`Nº ${c.hash.toString(16).padStart(8,'0')} — ${shapeNames[c.shape]} / ${materialNames[c.material]} / ${c.lobes} lobes${adjusted?' / adjusted':''}`;
const findWord=(prefix,ok)=>{for(let i=0;;i++){const c=castWord(prefix+i);if(ok(c))return [prefix+i,c];}};
reduced.matches=false;reduced.handler();lab.paused=true;

// 1. Determinism and normalisation.
assert.deepEqual(plain(castWord('Gentrit')),plain(castWord(' gentrit ')),'Surrounding spaces do not change the cast');
assert.deepEqual(plain(castWord('Gentrit')),plain(castWord('GENTRIT')),'Case does not change the cast');
assert.equal(castWord(''),null);assert.equal(castWord('   '),null);
assert.equal(castWord('a').hash,0xe40c292c,'FNV-1a 32-bit reference value for "a"');
assert.deepEqual(plain(castWord('two  words')),plain(castWord('two words')),'Inner whitespace collapses');

// 2. Ranges and coverage over 2000 words.
const seen={shape:new Set(),material:new Set(),scene:new Set(),lobes:new Set()};
for(let i=0;i<2000;i++){
 const c=castWord('w'+i);
 assert(Number.isInteger(c.hash)&&c.hash>=0&&c.hash<=0xffffffff);
 assert([0,1,2].includes(c.shape)&&[0,1,2].includes(c.material)&&['silver','sage','ink'].includes(c.scene));
 assert(Number.isInteger(c.twist)&&c.twist>=20&&c.twist<=100,'twist '+c.twist);
 assert(Number.isInteger(c.light)&&c.light>=0&&c.light<=180,'light '+c.light);
 assert(Number.isInteger(c.lobes)&&c.lobes>=2&&c.lobes<=9,'lobes '+c.lobes);
 assert(c.wave>=3&&c.wave<=12&&Math.abs(c.wave*10-Math.round(c.wave*10))<1e-9,'wave '+c.wave);
 assert(c.x>=-.6&&c.x<=.6&&c.y>=0&&c.y<TAU,'pose');
 seen.shape.add(c.shape);seen.material.add(c.material);seen.scene.add(c.scene);seen.lobes.add(c.lobes);
}
assert.equal(seen.shape.size,3);assert.equal(seen.material.size,3);assert.equal(seen.scene.size,3);assert.deepEqual([...seen.lobes].sort(),[2,3,4,5,6,7,8,9]);

// 3. Typing, debounce, and control sync.
assert.equal(readout.textContent,'Nº — — type to cast','Empty readout state');
typeWord('gentrit');assert.equal(readout.textContent,'Nº — — type to cast','The cast waits for the debounce');
assert.equal(ids['study-name'].textContent,'gentrit','The caption follows typing immediately');
let before=announcements;flushTimers();
const g=castWord('gentrit');
assert.equal(lab.shape,g.shape);assert.equal(lab.material,g.material);assert.equal(lab.targetTension,g.twist/100);
assert(Math.abs(lab.targetLight-(g.light-45)*Math.PI/180)<1e-12);assert.equal(lab.targetLobes,g.lobes);assert.equal(lab.targetWave,g.wave);
assert.equal(lab.tx,g.x);assert(turn(lab.ty,g.y)<1e-9,'Cast angle is reached modulo one turn');assert.equal(lab.velocity,0);
assert.equal(context.studioState().scene.bg,sceneBg[g.scene]);assert.equal(ids['lab-stage'].style['--scene-bg'],sceneBg[g.scene]);
assert.equal(segChecked('lab-shape'),g.shape);assert.equal(segChecked('lab-material'),g.material);
assert.equal(ids['lab-shape'].dataset.index,String(g.shape));assert.equal(ids['lab-material'].dataset.index,String(g.material));
assert.equal(ids.tension.value,String(g.twist));assert.equal(ids.tension.style['--fill'],g.twist+'%');
assert.equal(ids.light.value,String(g.light));assert.equal(ids.light.style['--fill'],(g.light/180*100)+'%');
assert.equal(readout.textContent,readoutFor(g,false));
assert.equal(announcements-before,1,'A cast announces once');assert.equal(ids.announcement.textContent,`Cast: ${shapeNames[g.shape]}, ${materialNames[g.material]}.`);
assert.equal(ids['study-name'].textContent,'gentrit');assert(ids['lab-canvas'].attrs['aria-label'].includes(shapeNames[g.shape]));
assert.equal(status.textContent,'Cast from “gentrit”. Adjust it, print it, or copy its link.');
ids.tension.value=Math.max(0,g.twist-10);ids.tension.emit('input');assert.equal(readout.textContent,readoutFor(g,true),'Adjusting after a cast marks the readout');
assert.equal(ids['study-name'].textContent,'gentrit','Adjustments keep the word');
typeWord(' Gentrit ');flushTimers();assert.equal(readout.textContent,readoutFor(g,true),'Retyping the same word keeps refinements');
title.emit('keydown',{key:'Enter'});assert.equal(readout.textContent,readoutFor(g,false),'Enter recasts immediately');assert.equal(ids.tension.value,String(g.twist));
typeWord('   ');flushTimers();assert.equal(readout.textContent,'Nº — — type to cast');assert.equal(lab.targetLobes,g.lobes,'Empty input changes no form');
assert.equal(ids['study-name'].textContent,`${shapeNames[g.shape]} study`);assert.equal(status.textContent,'Your print is a PNG. Nothing you type leaves this page.');

// 4. Ripple gate: integer lobes change only while the ripple is flat; interruptible.
tick(150);assert.equal(lab.ripple,1);assert.equal(lab.lobes,lab.targetLobes);
const start=lab.lobes,first=start===8?3:8,second=[2,3,4,6,7,9].find(v=>v!==start&&v!==first),third=[9,2,4].find(v=>v!==start&&v!==first&&v!==second);
lab.setForm(first,9);drawLog.length=0;
const log=[{ripple:lab.ripple,lobes:lab.lobes}];let retargets=0,midFrame=true;
for(let i=0;i<260;i++){
 tick(1);log.push({ripple:lab.ripple,lobes:lab.lobes});
 if(lab.ripple>.02&&lab.ripple<.98&&!lab.frame)midFrame=false;
 if(retargets===0&&lab.lobes===start&&lab.ripple<.5){lab.setForm(second,4.5);retargets++;}
 else if(retargets===1&&lab.lobes===second&&lab.ripple>.4){lab.setForm(third,11.2);retargets++;}
}
assert.equal(retargets,2,'Both mid-transition retargets happened');
let changes=0;
for(let k=1;k<log.length;k++){
 assert(Number.isInteger(log[k].lobes),'Lobes are always integers');
 if(log[k].lobes!==log[k-1].lobes){changes++;assert(log[k-1].ripple<.02,`Lobes changed at ripple ${log[k-1].ripple}`);}
}
assert.equal(changes,2,'Lobes switched directly to each live target');
assert.equal(lab.lobes,third);assert(lab.ripple>.98);assert.equal(lab.wave,11.2);
assert(midFrame,'Rendering continues while the ripple is in motion');assert.equal(lab.frame,0,'Rendering stops once ripple and wave settle');
assert(drawLog.length>40&&drawLog.every(set=>set.has('uLobes')&&set.has('uWave')&&set.has('uRipple')),'Every draw sets uLobes, uWave and uRipple');

// 5. Reduced motion snaps a cast.
reduced.matches=true;reduced.handler();
const [rmWord,rm]=findWord('still ',c=>c.shape!==lab.shape&&c.lobes!==lab.lobes);
typeWord(rmWord);flushTimers();
assert.equal(lab.lobes,rm.lobes);assert.equal(lab.wave,rm.wave);assert.equal(lab.ripple,1);assert.equal(lab.morph,1);
tick(1);assert.equal(lab.materialProgress,1);assert.equal(lab.tension,rm.twist/100);
reduced.matches=false;reduced.handler();

// 6. Round trip: cast, settle, encode, parse.
for(let i=0;i<200;i++){
 const word='round '+i,c=castWord(word);typeWord(word);flushTimers();tick(90);
 const back=parseStudy(studyHash());assert(back,'Encoded study parses');
 for(const k of ['shape','material','scene','twist','light','lobes'])assert.equal(back[k],c[k],`${word}: ${k}`);
 assert(Math.abs(back.wave-c.wave)<.1,`${word}: wave`);assert(Math.abs(back.x-c.x)<.01,`${word}: x`);assert(turn(back.y,c.y)<.01,`${word}: y`);
 assert.equal(back.name,word);
}

// 7. Malformed hashes return null and leave the studio untouched.
const snapshot=()=>JSON.stringify([lab.shape,lab.material,lab.targetTension,lab.targetLight,lab.targetLobes,lab.targetWave,lab.tx,lab.ty,title.value,context.studioState().scene.bg,status.textContent]);
for(const bad of ['#study=','#study=v1.9.9.9','#study=v1.0.0.0.50.90.5.70.0','#study=v1.a.b.c.d.e.f.g.h.i','#study=v1.0.0.0.50.90.1.70.0.0','#study=v1.0.0.0.50.90.5.70.0.0.0','#study=v2.0.0.0.50.90.5.70.0.0','#collection','#study=v1.0.0.0.50.181.5.70.0.0','#study=v1.0.0.0.50.90.5.70.-141.0','#study=v1.0.0.0.50.90.5.70.0.629','#study=v1.0.0.0.50.90.5.70.0.-1']){
 assert.equal(parseStudy(bad),null,bad);const prior=snapshot();location.hash=bad;windowEvents.hashchange();assert.equal(snapshot(),prior,bad);
}
const undecodable='#study=v1.0.0.0.50.90.5.70.0.0&name=%E0%A4%A',ud=parseStudy(undecodable);
assert(ud&&ud.name==='','An undecodable name still opens the study');
before=announcements;location.hash=undecodable;windowEvents.hashchange();
assert.equal(lab.shape,0);assert.equal(lab.material,0);assert.equal(lab.morph,1);assert.equal(lab.materialProgress,1);assert.equal(lab.tension,.5);assert.equal(lab.lobes,5);assert.equal(lab.wave,7);assert.equal(lab.ripple,1);
assert.equal(lab.x,0);assert.equal(lab.y,0);assert.equal(title.value,'');assert.equal(context.studioState().scene.bg,sceneBg.silver);
assert.equal(status.textContent,'You opened a shared sculpture. Make it yours, or cast your own word.');assert.equal(announcements,before,'Opening a link is not a cast');

// 8. Long names truncate to 42; a link is applied exactly, without recasting from its name.
const longName='abcdefghij'.repeat(6),link=`#study=v1.1.2.1.40.100.7.55.-20.300&name=${encodeURIComponent(longName)}`;
assert.equal(parseStudy(link).name,longName.slice(0,42));
location.hash=link;windowEvents.hashchange();flushTimers();
assert.equal(title.value.length,42);assert.equal(ids['study-name'].textContent,longName.slice(0,42));
assert.equal(lab.shape,1);assert.equal(lab.material,2);assert.equal(lab.lobes,7);assert.equal(lab.wave,5.5);assert.equal(lab.x,-.2);assert.equal(lab.y,3);assert.equal(lab.tension,.4);
assert(Math.abs(lab.light-(100-45)*Math.PI/180)<1e-12);assert.equal(context.studioState().scene.bg,sceneBg.sage);
assert.equal(status.textContent,`You opened “${longName.slice(0,42)}”. Make it yours, or cast your own word.`);
assert.equal(parseStudy('#study=v1.0.0.0.50.90.5.70.0.0&name='+encodeURIComponent('🙂'.repeat(30))).name.length,42,'Truncation never splits an emoji');

// 9. Copy link: success, rejection, no clipboard.
const copied=[];replaceCalls.length=0;
context.navigator.clipboard={writeText:async text=>{copied.push(text);}};
ids['copy-link'].emit('click');await new Promise(r=>setImmediate(r));
assert.equal(replaceCalls.length,1);assert(parseStudy(replaceCalls[0]),'The replaced hash is a valid study');assert.equal(copied[0],location.href);
assert.equal(status.textContent,'Link copied. Anyone who opens it sees this sculpture.');assert.equal(ids['copy-link'].dataset.state,'done');
context.navigator.clipboard={writeText:()=>Promise.reject(Error('denied'))};
ids['copy-link'].emit('click');await new Promise(r=>setImmediate(r));
assert.equal(replaceCalls.length,2);assert.equal(status.textContent,"The address bar now holds this sculpture's link. Copy it from there.");assert.equal(ids['copy-link'].dataset.state,undefined,'A failed copy clears the done state');
flushTimers();
context.navigator.clipboard={writeText:async()=>{}};ids['copy-link'].emit('click');await new Promise(r=>setImmediate(r));assert.equal(ids['copy-link'].dataset.state,'done');
flushTimers();assert.equal(ids['copy-link'].dataset.state,undefined,'The done state clears on its timer');
context.navigator.clipboard=undefined;
ids['copy-link'].emit('click');await new Promise(r=>setImmediate(r));
assert.equal(replaceCalls.length,4);assert.equal(status.textContent,"The address bar now holds this sculpture's link. Copy it from there.");assert.equal(ids['copy-link'].dataset.state,undefined);

// 10. Start again clears the word and form; Surprise me keeps the word and restores the form.
const [formWord,fw]=findWord('form ',c=>c.lobes!==5&&c.wave!==7);
typeWord(formWord);flushTimers();assert.equal(lab.targetLobes,fw.lobes);
ids['lab-reset'].emit('click');
assert.equal(title.value,'');assert.equal(lab.targetLobes,5);assert.equal(lab.targetWave,7);assert.equal(readout.textContent,'Nº — — type to cast');
assert.equal(status.textContent,'Your print is a PNG. Nothing you type leaves this page.');
tick(150);assert.equal(lab.lobes,5);assert.equal(lab.wave,7);assert.equal(lab.ripple,1);
typeWord(formWord);ids['lab-reset'].emit('click');flushTimers();assert.equal(readout.textContent,'Nº — — type to cast','Start again cancels a pending cast');
typeWord(formWord);flushTimers();ids.surprise.emit('click');
assert.equal(title.value,formWord);assert.equal(ids['study-name'].textContent,formWord);assert.equal(lab.targetLobes,5);assert.equal(lab.targetWave,7);
assert.equal(readout.textContent,readoutFor(fw,true));

console.log('Passed: renderer lifecycle, morph continuity, gestures, material-reactive theme, segmented controls, slider fill, curated studies, keyboard access, reduced motion, poster state preservation, download lifecycle, export error recovery, and Cast a word (determinism, ranges, debounce sync, ripple gate, reduced motion, link round trip, malformed links, name truncation, copy link, start again / surprise).');
})().catch(error=>{console.error(error);process.exit(1);});
