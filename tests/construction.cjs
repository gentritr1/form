const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const original=fs.readFileSync(path.join(__dirname,'renderer.cjs'),'utf8');
const fixture=original.replace('vm.createContext(context);',`location.search='?layers=construction';context.innerWidth=1800;context.innerHeight=875;ctx2d.clearRect=()=>{};vm.createContext(context);`);
vm.runInNewContext(fixture,{require,__dirname,console,setImmediate,process});
const prefix=fixture.slice(0,fixture.indexOf('tick(4); assert'));
vm.runInNewContext(prefix+`
const Build=vm.runInContext('Construction',context),point=vm.runInContext('constructionPoint',context),surface=vm.runInContext('surface',context),meshes=vm.runInContext('meshes',context);
let samples=0,seams=0;
const close=(a,b)=>assert(Math.hypot(...a.map((v,i)=>v-b[i]))<1e-8,'Matched surface boundary');
for(let shape=0;shape<3;shape++){
 const b=new Build(shape);
 for(let frame=0;frame<=120;frame++){
  b.seek(frame/120);
  for(let i=0;i<=24;i++)for(let j=0;j<=16;j++){
   const u=i/24*Math.PI*2*b.sweep,v=j/16*Math.PI*2,p=point(b,u,v,.25);
   assert(p.every(Number.isFinite),'Every intermediate vertex is finite');samples++;
  }
  // The cap and body share exactly the same evaluated rim, including partial sweeps.
  for(const end of [0,1])for(let j=0;j<=64;j++){
   const u=end*Math.PI*2*b.sweep,v=j/64*Math.PI*2;
   close(point(b,u,v,.25),point(b,u,v,.25,end+1));seams++;
  }
  if(shape<2)for(let i=0;i<=24;i++)close(point(b,i/24*Math.PI*2*b.sweep,0),point(b,i/24*Math.PI*2*b.sweep,Math.PI*2));
  // Retarget at every sampled instant preserves the current field before its first update.
  const before=[b.sweep,b.radius,b.modulation,b.curveAlpha];b.targetShape((shape+1)%3,1000);
  assert.deepEqual([b.sweep,b.radius,b.modulation,b.curveAlpha],before);
  const start=b.start;b.targetShape((shape+2)%3,1020);assert.equal(b.start,start,'A second retract target cannot restart the clock');
  b.update(1240);b.update(2160);assert.equal(b.phase,'settled');assert.equal(b.shape,(shape+2)%3);b.snap(shape);
 }
 b.snap(shape);
 for(let i=0;i<=24;i++)for(let j=0;j<=16;j++)close(point(b,i/24*Math.PI*2,j/16*Math.PI*2),surface(shape,i/24*Math.PI*2,j/16*Math.PI*2));
 for(let j=0;j<=16;j++)close(point(b,0,j/16*Math.PI*2),point(b,Math.PI*2,j/16*Math.PI*2));
 b.targetShape((shape+1)%3,0,true);assert.equal(b.phase,'settled');assert.equal(b.shape,(shape+1)%3);
}
// Actual generated cap indices reference valid parameter vertices and join the body rim.
for(const mesh of meshes){assert.equal(mesh.parameters.length,mesh.positions.length);assert([...mesh.indices].every(i=>i<mesh.positions.length/3));}
for(const s of vm.runInContext('allSculptures',context)){s.paused=true;s.hovered=false;s.termTarget=0;}
tick(180);assert.equal(frames.size,0,'Construction settles to zero animation frames');
console.log('Passed: construction finite samples='+samples+', cap seam pairs='+seams+', canonical endpoints, 363 retargets, reduced motion and idle.');
`,{require,__dirname,console});

const uiFixture=fixture.replace('vm.createContext(context);',`const labels=['cos 3t','cos 5u','cos 8φ'].map(text=>{const p=new El();p.textContent=text;return p;});const queryAll=document.querySelectorAll;document.querySelectorAll=s=>s==='.work-formula'?labels:queryAll(s);vm.createContext(context);`);
vm.runInNewContext(uiFixture.slice(0,uiFixture.indexOf('tick(4); assert'))+`
const term=labels[0].querySelector('button'),preview=context.instances.previews[0];
term.emit('focus');assert.equal(preview.termTarget,1);assert.equal(preview.term,.25,'Keyboard feedback is immediate');assert.equal(term.attrs['aria-pressed'],'true');
tick(4);assert(preview.term!==0);term.emit('blur');assert.equal(preview.term,0,'Keyboard release restores true parameter');
term.emit('pointerdown',{stopPropagation(){}});term.emit('focus');assert.equal(preview.termTarget,1);term.emit('pointerup');assert.equal(preview.termTarget,0,'Pointer release does not leave a focused oscillation');
reduced.matches=true;term.emit('focus');tick(2);assert.equal(preview.term,.25);term.emit('blur');assert.equal(preview.term,0);
const slider=ids['construction-progress'],demo=vm.runInContext('constructionStudy',context);slider.value='40';slider.emit('keydown');slider.emit('input');assert.equal(demo.scrubValue,.4);assert.equal(demo.construction.phase,'scrub');
demo.scrubbing=false;demo.construction.snap();demo.construction.start=undefined;demo.onConstructionFrame();assert.equal(demo.scrubValue,1,'A settled construction has a finite readout before playback, including reduced motion');assert.equal(slider.value,'100');
reduced.matches=false;lab.pointerTension=false;lab.tension=lab.targetTension=lab.displayTension=.35;
ids['shape-handle'].emit('pointerdown',{pointerId:23,clientY:300});ids['shape-handle'].emit('pointermove',{pointerId:23,clientY:140});assert.equal(lab.tension,1);assert.equal(lab.displayTension,.35,'Pointer feedback retains its current displayed state');tick(1);assert(lab.displayTension>.35&&lab.displayTension<1);ids['shape-handle'].emit('pointerup',{pointerId:23});ids['shape-handle'].emit('keydown',{key:'Home'});assert.equal(lab.displayTension,0,'Keyboard twist feedback is immediate');
console.log('Passed: equation keyboard/pointer/reduced-motion states, keyboard scrubbing, and eased pointer versus immediate keyboard twist.');
`,{require,__dirname,console});
