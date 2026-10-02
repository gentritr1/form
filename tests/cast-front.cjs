const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const original=fs.readFileSync(path.join(__dirname,'renderer.cjs'),'utf8');
const fixture=original.replace('vm.createContext(context);',`location.search='?layers=cast';context.innerWidth=1800;context.innerHeight=875;ctx2d.clearRect=()=>{};vm.createContext(context);`);
vm.runInNewContext(fixture,{require,__dirname,console,setImmediate,process});
const combined=fixture.replace("?layers=cast", "?layers=shadow,room,construction,cast,adaptive").replace('vm.createContext(context);',"gl.FRAMEBUFFER_COMPLETE=100;gl.checkFramebufferStatus=()=>100;context.getComputedStyle=()=>({backgroundColor:'rgb(217,224,229)',getPropertyValue:k=>k==='--bg'?'#ECE9E4':'#A04F2B'});vm.createContext(context);");

const prefix=fixture.slice(0,fixture.indexOf('tick(4); assert'));
vm.runInNewContext(prefix+`
const Cast=vm.runInContext('CastFront',context);let interruptions=0;
for(let source=0;source<3;source++)for(let target=0;target<3;target++)for(let frame=0;frame<=90;frame++){
 const event=new Cast(source);event.retarget(target,0);event.update(frame*16);
 const before=Array.from(event.data);event.retarget((target+1)%3,frame*16);assert.deepEqual(Array.from(event.data),before,'Retarget preserves the exact displayed field');event.update(frame*16);assert.deepEqual(Array.from(event.data),before,'First frame cannot restart heat or material');
 for(let time=frame*16;time<frame*16+1450;time+=73){event.update(time);assert([...event.data].every(Number.isFinite));for(let row=0;row<2;row++)assert.deepEqual(Array.from(event.data.slice(row*event.size*4,row*event.size*4+4)),Array.from(event.data.slice((row*event.size+event.size-1)*4,(row*event.size+event.size)*4)),'Periodic endpoints must match');}
 event.update(frame*16+1450);assert(!event.active);const final=new Cast((target+1)%3);assert.deepEqual(Array.from(event.data),Array.from(final.data),'Settled field is deterministic');interruptions++;
 event.retarget(source,0,true);assert(!event.active);assert.deepEqual(Array.from(event.data),Array.from(new Cast(source).data));
}
for(const s of vm.runInContext('allSculptures',context)){s.paused=true;s.hovered=false;s.setMaterial((s.material+1)%3);}
tick(150);assert.equal(frames.size,0,'Cooling settles to no scheduled frames');
lab.setMaterial(0);tick(20);const displayed=Array.from(lab.castFront.data);vm.runInContext('composePoster(lab,"interrupted cast")',context);assert.deepEqual(Array.from(lab.castFront.data),displayed,'Export samples rather than advances the thermal event');
const manager=vm.runInContext('sharedRenderer',context);manager.canvas.emit('webglcontextlost');manager.canvas.emit('webglcontextrestored');assert.deepEqual(Array.from(lab.castFront.data),displayed,'Context restoration retains thermal state');
console.log('Passed: '+interruptions+' cast interruptions, exact field continuity, periodic seam, deterministic cooling, reduced motion, idle, poster and restoration.');
`,{require,__dirname,console});

vm.runInNewContext(combined.slice(0,combined.indexOf('tick(4); assert'))+`
lab.paused=hero.paused=true;lab.select(1);lab.setMaterial(0);tick(8);
const manager=vm.runInContext('sharedRenderer',context);assert([...manager.clients].every(s=>s.available));
const event=Array.from(lab.castFront.data);vm.runInContext('composePoster(lab,"combined")',context);assert.deepEqual(Array.from(lab.castFront.data),event);
manager.canvas.emit('webglcontextlost');manager.canvas.emit('webglcontextrestored');assert([...manager.clients].every(s=>s.available));
console.log('Passed: combined six-canvas context recovery and poster thermal-state preservation.');
`,{require,__dirname,console});
