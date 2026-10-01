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
const gl=new Proxy({COMPILE_STATUS:1,LINK_STATUS:2,isContextLost:()=>false,getShaderParameter:()=>true,getProgramParameter:()=>true,getAttribLocation:()=>0,getUniformLocation:(_,n)=>n,uniform1f:(n,v)=>uniforms[n]=v,drawElements:()=>glCalls++},{get:(o,k)=>k in o?o[k]:()=>({})});
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
const context={document,console,Math,Float32Array,Uint16Array,performance:{now:()=>now},devicePixelRatio:1,URL:{createObjectURL:()=> 'blob:print-test',revokeObjectURL:u=>revoked.push(u)},setTimeout:f=>timers.push(f),localStorage:{setItem:(k,v)=>storage[k]=v},matchMedia:q=>q.includes('reduced')?reduced:q.includes('pointer')?fine:system,
 ResizeObserver:class{constructor(f){this.f=f;}observe(){this.f([{contentRect:{width:800,height:650}}]);}},
 IntersectionObserver:class{constructor(f){this.f=f;}observe(t){this.f([{isIntersecting:true,target:t}]);}unobserve(){}},
 requestAnimationFrame:f=>{frames.set(++seq,f);return seq;},cancelAnimationFrame:i=>frames.delete(i)};
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
ids.tension.value=82;ids.tension.emit('input');assert.equal(lab.tension,.82);assert.equal(ids.tension.attrs['aria-valuetext'],'82 percent');
ids.light.value=150;ids.light.emit('input');assert(lab.targetLight>1.8);assert.equal(ids.light.attrs['aria-valuetext'],'150 degrees');
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
ids.theme.emit('click');assert.equal(storage['form-theme'],'dark');assert.equal(meta.attrs.content,'#1f2327');assert.equal(ids.theme.attrs['aria-label'],'Switch to light theme');
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
 assert.equal(ids['lab-shape'].value,String(lab.shape));assert.equal(ids['lab-material'].value,String(lab.material));
}
ids['lab-shape'].value='2';ids['lab-shape'].emit('change');ids['lab-material'].value='2';ids['lab-material'].emit('change');tick(50);
assert.equal(lab.shape,2);assert.equal(lab.material,2);
ids['study-title'].value='Qetësi / study';ids['study-title'].emit('input');assert.equal(ids['study-name'].textContent,'Qetësi / study');
const oldWidth=lab.canvas.width,oldHeight=lab.canvas.height,oldPose=[lab.x,lab.y,lab.tension,lab.morph,...lab.color];
ids['save-print'].emit('click');assert.equal(ids['save-print'].disabled,true);assert.equal(ids['save-print'].attrs['aria-busy'],'true');assert(pendingBlob);
assert.equal(lab.canvas.width,oldWidth);assert.equal(lab.canvas.height,oldHeight);assert.deepEqual([lab.x,lab.y,lab.tension,lab.morph,...lab.color],oldPose,'Print drawing must preserve the exact sculpture state');
const textCount=posterText.length;ids['save-print'].emit('click');assert.equal(posterText.length,textCount,'Duplicate clicks must not launch a second export');
pendingBlob({type:'image/png'});pendingBlob=null;assert.equal(downloads[0].name,'form-qetesi-study.png');assert.equal(ids['save-print'].disabled,false);assert.equal(ids['save-print'].attrs['aria-busy'],'false');assert(posterText.includes('Bloom / Porcelain'));
timers.forEach(f=>f());assert.deepEqual(revoked,['blob:print-test']);
failBlob=true;ids['save-print'].emit('click');assert.equal(ids['print-status'].dataset.error,'true');assert.equal(ids['save-print'].disabled,false);failBlob=false;
failCopy=true;ids['save-print'].emit('click');assert.equal(ids['print-status'].dataset.error,'true');assert.equal(lab.canvas.width,oldWidth);assert.equal(lab.canvas.height,oldHeight);failCopy=false;
reduced.matches=true;reduced.handler();ids.surprise.emit('click');tick(2);assert.equal(lab.morph,1);assert.equal(lab.materialProgress,1);assert.equal(lab.tension,lab.targetTension);
ids['lab-reset'].emit('click');assert.equal(lab.shape,2);assert.equal(lab.material,1);assert.equal(lab.tension,.35);assert.equal(ids['study-title'].value,'');assert.equal(context.studioState().scene.bg,'#d9e0e5');
console.log('Passed: renderer lifecycle, morph continuity, gestures, curated studies, keyboard access, reduced motion, poster state preservation, download lifecycle, and export error recovery.');
