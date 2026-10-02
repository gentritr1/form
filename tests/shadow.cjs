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
 assert.equal(manager.shadow.ground(lab,1.05),ground,'Unchanged geometry reuses its exact bound');
 assert(Math.abs(manager.shadow.ground(lab,2.1)-((ground+.025)*2-.025))<1e-6,'Bounds track export scale');
}
const before=glCalls;const poster=context.composePoster(lab,'Shadow test');
assert.equal(poster.width,1200);assert.equal(poster.height,1500);
assert.equal(glCalls-before,2,'Print issues both silhouette and surface geometry draws');
const shadow=manager.shadow;manager.canvas.emit('webglcontextlost');manager.canvas.emit('webglcontextrestored');
assert.notEqual(manager.shadow,shadow,'Shadow framebuffer is recreated after context restoration');
assert([...manager.clients].every(s=>s.available));
console.log('Passed: shadow bounds, caching, print pass inclusion, dimensions and context restoration.');
`,{require,__dirname,console});
