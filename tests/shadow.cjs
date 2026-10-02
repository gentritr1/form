const fs=require('node:fs'),vm=require('node:vm');
const original=fs.readFileSync(__dirname+'/renderer.cjs','utf8');
const prefix=original.slice(0,original.indexOf('tick(4); assert')).replace('vm.createContext(context);',`
location.search='?layers=shadow';context.innerWidth=1800;context.innerHeight=875;ctx2d.clearRect=()=>{};
gl.FRAMEBUFFER_COMPLETE=100;gl.checkFramebufferStatus=()=>100;
vm.createContext(context);`);
vm.runInNewContext(prefix+`
const manager=vm.runInContext('sharedRenderer',context);
assert(manager.shadow,'Shadow resources initialize');
for(let shape=0;shape<3;shape++)for(const twist of [0,.5,1])for(const angle of [-1.4,0,1.4]){
 lab.select(shape);lab.morph=1;lab.tension=twist;lab.x=angle;lab.lobes=9;
 const ground=manager.shadow.ground(lab,1.05);
 assert(Number.isFinite(ground)&&ground<0,'Finite ground under every surface, twist and pose');
 let exact=Infinity;const positions=lab.targetMesh.positions;
 for(let i=0;i<positions.length;i+=3){
  const y=positions[i+1],a=y*twist*.85,c=Math.cos(a),s=Math.sin(a),x=c*positions[i]+s*positions[i+2],z=-s*positions[i]+c*positions[i+2];
  let fade=Math.max(0,Math.min(1,(Math.hypot(x,z)-.03*lab.lobes)/.35));fade=fade*fade*(3-2*fade);
  const ripple=1+twist*.07*lab.ripple*fade*Math.sin(y*lab.wave+Math.atan2(z,x)*lab.lobes);
  exact=Math.min(exact,(y*Math.cos(angle)-z*Math.sin(angle))*ripple*1.05);
 }
 assert(exact-ground>=.025-1e-5&&exact-ground<=.03+1e-5,'Probe remains below dense deformed mesh; shape='+shape+' twist='+twist+' angle='+angle+' gap='+(exact-ground));
 assert.equal(manager.shadow.ground(lab,1.05),ground,'Unchanged geometry reuses its exact bound');
 assert(Math.abs(manager.shadow.ground(lab,2.1)-((ground+.03)*2-.03))<1e-6,'Bounds track export scale');
}
const before=glCalls;const poster=context.composePoster(lab,'Shadow test');
assert.equal(poster.width,1200);assert.equal(poster.height,1500);
assert.equal(glCalls-before,2,'Print issues both silhouette and surface geometry draws');
const shadow=manager.shadow;manager.canvas.emit('webglcontextlost');manager.canvas.emit('webglcontextrestored');
assert.notEqual(manager.shadow,shadow,'Shadow framebuffer is recreated after context restoration');
assert([...manager.clients].every(s=>s.available));
console.log('Passed: shadow bounds, caching, print pass inclusion, dimensions and context restoration.');
`,{require,__dirname,console});

vm.runInNewContext(prefix.replace("?layers=shadow","?layers=shadow,construction")+`
const manager=vm.runInContext('sharedRenderer',context);
const point=vm.runInContext('constructionPoint',context);
for(let shape=0;shape<3;shape++){
 lab.construction.snap(shape);lab.x=0;lab.tension=lab.displayTension=0;lab.term=0;
 for(const progress of [.15,.45,.8,1]){
  lab.construction.seek(progress);
  let lowest=Infinity;
  // Independent dense surface oracle at an undeformed pose. The ground must follow
  // the actual assembly, not the stale source/target morph buffers.
  for(let i=0;i<=192;i++)for(let j=0;j<=64;j++)lowest=Math.min(lowest,point(lab.construction,i/192*Math.PI*2*lab.construction.sweep,j/64*Math.PI*2)[1]*1.05);
  const gap=lowest-manager.shadow.ground(lab,1.05);
  assert(gap>=.025-1e-5&&gap<=.03+1e-5,'Support error: shape='+shape+' progress='+progress+' gap='+gap);
 }
 lab.construction.snap(shape);const before=manager.shadow.ground(lab,1.05);lab.term=.25;
 assert.notEqual(manager.shadow.ground(lab,1.05),before,'Equation changes invalidate the ground bound');
}
console.log('Passed: construction and equation shadow bounds follow the displayed surface.');
`,{require,__dirname,console});
