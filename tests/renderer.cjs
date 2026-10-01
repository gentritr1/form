// State/lifecycle regression checks with a mocked WebGL context.
// These checks do not validate GLSL compilation or rendered appearance.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const root = path.join(__dirname, '..');
class El {
 constructor(data = {}) { this.dataset=data; this.style={}; this.events={}; this.attrs={}; this.value=0; this.width=0; this.height=0; this.textContent=''; this.parentElement=this; }
 addEventListener(n,fn) { (this.events[n]??=[]).push(fn); }
 emit(n,e={}) { for(const f of this.events[n]??[])f({button:0,preventDefault(){},...e}); }
 setAttribute(n,v) { this.attrs[n]=v; }
 append() {} setPointerCapture() {} focus() { this.focused=true; } scrollIntoView() {}
 closest() { return this; }
 querySelector() { return this.fallback ??= new El(); }
 getBoundingClientRect() { return {width:800,height:650,left:0,top:0}; }
 getContext() { return gl; }
}
let glCalls=0;
const uniforms={};
const gl=new Proxy({COMPILE_STATUS:1,LINK_STATUS:2,getShaderParameter:()=>true,getProgramParameter:()=>true,getAttribLocation:()=>0,getUniformLocation:(_,n)=>n,uniform1f:(n,v)=>uniforms[n]=v,drawElements:()=>glCalls++},{get:(o,k)=>k in o?o[k]:()=>({})});
const ids={};
const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
for(const [,id] of html.matchAll(/id="([^"]+)"/g))ids[id]=new El();
ids.tension.value=35; ids.light.value=45;
const swatches=[0,1,2].map(i=>new El({material:String(i)}));
const objects=[0,1,2].map(i=>new El({object:String(i)}));
const works=[0,1,2].map(i=>new El({shape:String(i)}));
const previews=[0,1,2].map(i=>new El({shape:String(i),material:String(i)}));
const controls=[ids.tension,ids.light,ids['lab-reset']];
const fallback=new El(), meta=new El();
let now=100,frames=new Map(),seq=0;
const media=matches=>({matches,addEventListener(n,f){this.handler=f;}});
const reduced=media(false),fine=media(true),system=media(false);
const storage={};
const document={hidden:false,documentElement:{dataset:{}},events:{},querySelector(s){
 if(s==='#stage .fallback strong')return fallback;
 if(s.startsWith('#'))return ids[s.slice(1)];
 if(s.startsWith('[data-object='))return objects[Number(s.match(/"(\d)"/)[1])];
 if(s.startsWith('meta'))return meta;
 return new El();
},querySelectorAll(s){
 if(s==='.swatch')return swatches; if(s==='[data-object]')return objects;
 if(s==='.work')return works; if(s==='.preview')return previews;
 if(s==='.experiment-controls input,.experiment-controls button')return controls;
 return [];
},createElement:()=>new El(),addEventListener(n,f){this.events[n]=f;}};
const context={document,console,Math,Float32Array,Uint16Array,performance:{now:()=>now},devicePixelRatio:1,localStorage:{setItem:(k,v)=>storage[k]=v},matchMedia:q=>q.includes('reduced')?reduced:q.includes('pointer')?fine:system,
 ResizeObserver:class{constructor(f){this.f=f;}observe(){this.f([{contentRect:{width:800,height:650}}]);}},
 IntersectionObserver:class{constructor(f){this.f=f;}observe(t){this.f([{isIntersecting:true,target:t}]);}unobserve(){}},
 requestAnimationFrame:f=>{frames.set(++seq,f);return seq;},cancelAnimationFrame:i=>frames.delete(i)};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'dist/app.js'),'utf8')+';globalThis.instances={hero,lab,previews};',context);
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
ids['lab-reset'].emit('click');assert.equal(lab.tension,.35);assert.equal(lab.targetLight,0);assert.equal(ids.light.attrs['aria-valuetext'],'45 degrees');
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
console.log('Passed: morph continuity, material state, sliders, keyboard input, pause preferences, context recovery, portrait fitting, theme state, and background suspension.');
