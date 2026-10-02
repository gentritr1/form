// Reuse the original mock environment, with every original assertion preserved verbatim.
// The first suite runs separately with layers off; this repeats its full contract with sharing.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const original=fs.readFileSync(path.join(__dirname,'renderer.cjs'),'utf8');
const marker='vm.createContext(context);';
if(original.split(marker).length!==2)throw Error('Fixture marker changed.');
const fixture=original.replace(marker,`location.search='?layers=shared';ctx2d.clearRect=()=>{};
let programCount=0;gl.createProgram=()=>{programCount++;return {};};
${marker}`);
vm.runInNewContext(fixture,{require,__dirname,console,setImmediate,process});
const directFixture=fixture.replace("location.search='?layers=shared';","location.search='?layers=direct';context.innerWidth=1800;context.innerHeight=875;");
vm.runInNewContext(directFixture,{require,__dirname,console,setImmediate,process});
const prefix=fixture.slice(0,fixture.indexOf('tick(4); assert'));
vm.runInNewContext(prefix+`
const manager=vm.runInContext('sharedRenderer',context);
const Budget=vm.runInContext('ResolutionBudget',context),budget=new Budget(),client={visible:true,available:true};
budget.finish(client,true);
for(let i=0;i<40;i++)budget.observe(client,i*30);
assert.equal(budget.value,.75,'Sustained missed 60Hz budget lowers DPR within its floor');
assert(budget.finish(client,false),'Settling requests a sharp redraw');
assert.equal(budget.value,1.5);assert.equal(budget.last.size,0,'Idle gaps cannot count as slow frames');
budget.finish(client,true);for(let i=0;i<30;i++)budget.observe(client,10000+i*8.3);
assert.equal(budget.value,1.5,'Healthy delivery stays sharp');
client.visible=false;budget.finish(client,false);assert.equal(budget.active.size,0);
assert.equal(programCount,1,'One linked program serves all five sculptures');
assert.equal(manager.clients.size,5);
assert.equal(manager.meshBuffers.size,3,'Each static mesh uploaded once');
assert.equal(new Set([...manager.clients].map(s=>s.gl)).size,1);
tick(4);
manager.canvas.emit('webglcontextlost');
assert([...manager.clients].every(s=>!s.available&&!s.frame),'Shared loss suspends every client');
manager.canvas.emit('webglcontextrestored');
assert.equal(programCount,2,'Restoration links exactly one replacement program');
assert([...manager.clients].every(s=>s.available));
for(const s of manager.clients){s.paused=true;s.hovered=false;s.velocity=0;}
tick(180);assert.equal(frames.size,0,'Shared renderer is idle after settling');
for(const s of manager.clients){s.select((s.shape+1)%3);s.request();}
tick(5);assert(glCalls>0);
document.hidden=true;document.events.visibilitychange();assert.equal(frames.size,0);
console.log('Passed: shared context/program/mesh ownership, atomic restoration, idle and hidden suspension.');
`,{require,__dirname,console});
