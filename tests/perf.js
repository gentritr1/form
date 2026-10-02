/* Test-only controller embedded after the unchanged app by build.mjs. */
(()=>{
 'use strict';
 const M=globalThis.FormPerfMetrics,params=new URLSearchParams(location.search);
 const layers=(params.get('layers')||'').split(',').filter(x=>x&&x!=='none');
 const labels=['Hero rotation','Shape change','Material change','Word cast','Twist drag'];
 const panel=document.createElement('aside');panel.id='perf-panel';
 panel.innerHTML=`<style>
 #perf-panel{position:fixed;z-index:99999;bottom:8px;left:8px;right:8px;background:#fff;color:#111;border:1px solid #555;padding:12px;font:13px/1.5 monospace;max-height:38vh;overflow:auto}
 #perf-panel button,#perf-panel input{font:inherit;min-height:32px;margin:4px;padding:4px 8px;border:1px solid #777;background:#fff;color:#111}
 #perf-panel pre{white-space:pre-wrap;overflow-wrap:anywhere}#perf-panel[data-running] .perf-controls,#perf-panel[data-running] details{display:none}
 </style><strong>FORM / package 0 / visible-browser measurement</strong>
 <div class="perf-controls"><label>Machine <input id="perf-machine" placeholder="Model / chip / OS"></label>
 <label>Refresh Hz <input id="perf-hz" type="number" min="24" max="360" placeholder="auto estimate"></label>
 <button id="perf-run">Run 3 × 10 seconds</button><button id="perf-pixels">Fixed-pose hashes</button>
 <button id="perf-save" disabled>Save results JSON</button></div>
 <div id="perf-status" role="status">Keep this tab foreground at a fixed window size. Do not interact during a run.</div>
 <details><summary>Results</summary><pre id="perf-results"></pre></details>`;
 document.body.append(panel);
 const $=id=>document.getElementById(id),status=$('perf-status');
 let busy=false,result=null,invalid='',raf=0,timer=0,rejectFrame=null;
 const abort=reason=>{invalid=reason;if(rejectFrame){const reject=rejectFrame;rejectFrame=null;cancelAnimationFrame(raf);clearTimeout(timer);reject(Error(reason));}};
 document.addEventListener('visibilitychange',()=>{if(busy&&document.hidden)abort('INVALID: tab became hidden.');});
 addEventListener('resize',()=>{if(busy)abort('INVALID: viewport changed.');});
 allSculptures.forEach(s=>s.canvas.addEventListener('webglcontextlost',()=>{if(busy)abort('INVALID: context lost.');}));
 function visible(){if(invalid)throw Error(invalid);if(document.hidden||document.visibilityState!=='visible')throw Error('A visible tab is required: document.hidden must be false.');}
 const frame=()=>new Promise((resolve,reject)=>{
  try{visible();}catch(e){reject(e);return;}rejectFrame=reject;
  timer=setTimeout(()=>abort('INVALID: no rAF within 2 seconds.'),2000);
  raf=requestAnimationFrame(t=>{clearTimeout(timer);rejectFrame=null;try{visible();resolve(t);}catch(e){reject(e);}});
 });
 const frames=async n=>{for(let i=0;i<n;i++)await frame();};
 function pauseAll(){for(const s of allSculptures){s.paused=true;s.hovered=false;s.velocity=0;cancelAnimationFrame(s.frame);s.frame=0;s.last=0;}updatePause();}
 function ready(){visible();if(layers.length)throw Error('No depth layers implemented yet; unsupported flags: '+layers.join(','));if(allSculptures.some(s=>!s.available))throw Error('All five canvases must be available.');}
 const viewport=()=>({width:innerWidth,height:innerHeight,dpr:devicePixelRatio,screenWidth:screen.width,screenHeight:screen.height});
 function reset(s,shape,material){
  s.select(shape);s.morph=1;s.setMaterial(material);s.color=[...materials[material].color];s.metal=materials[material].metal;s.roughness=materials[material].roughness;s.materialProgress=1;
  s.x=s.tx=shape===2?.15:-.38;s.y=s.ty=.35;s.light=s.targetLight=.15;s.tension=s.targetTension=0;s.setForm(5,7,true);s.velocity=0;s.last=0;
 }
 function prepare(){
  pauseAll();reset(hero,0,0);reset(lab,2,1);previews.forEach((s,i)=>reset(s,i,i));
  clearTimeout(castTimer);castTimer=0;studyTitle.value='';
  document.documentElement.dataset.theme='light';document.documentElement.dataset.material='copper';
  setScene('silver');setTwist(35);setLight(45);updateStudyView();updateTheme();scrollTo({top:0,behavior:'instant'});
  allSculptures.forEach(s=>s.request());
 }
 function instrument(){
  let segment=-1,disjoint=false;
  const draws=labels.map(()=>({hero:0,lab:0,preview:0})),gpu=labels.map(()=>[]),pending=[],restore=[],contexts=new Map();
  for(const s of allSculptures){
   const gl=s.gl;if(!contexts.has(gl))contexts.set(gl,gl.getExtension('EXT_disjoint_timer_query'));
   const ext=contexts.get(gl),original=s.draw;
   s.draw=function(...args){
    if(segment<0)return original.apply(this,args);draws[segment][this.mode]++;
    const q=ext&&!disjoint&&pending.length<256?ext.createQueryEXT():null;
    if(q)ext.beginQueryEXT(ext.TIME_ELAPSED_EXT,q);
    try{return original.apply(this,args);}finally{if(q){ext.endQueryEXT(ext.TIME_ELAPSED_EXT);pending.push({q,ext,gl,segment});}}
   };restore.push(()=>{s.draw=original;});
  }
  function poll(){
   for(const [gl,ext]of contexts)if(ext&&gl.getParameter(ext.GPU_DISJOINT_EXT))disjoint=true;
   if(disjoint)gpu.forEach(a=>{a.length=0;});
   for(let i=pending.length-1;i>=0;i--){const p=pending[i];if(disjoint||p.ext.getQueryObjectEXT(p.q,p.ext.QUERY_RESULT_AVAILABLE_EXT)){
    if(!disjoint)gpu[p.segment].push(p.ext.getQueryObjectEXT(p.q,p.ext.QUERY_RESULT_EXT)/1e6);
    p.ext.deleteQueryEXT(p.q);pending.splice(i,1);
   }}
  }
  return {draws,gpu,poll,set:i=>{segment=i;},support:[...contexts.values()].map(Boolean),
   finish(){restore.forEach(f=>f());const unresolved=pending.length;pending.forEach(p=>p.ext.deleteQueryEXT(p.q));pending.length=0;return{disjoint,unresolved};}};
 }
 // Test-only synthetic drag. Native setPointerCapture requires a real active pointer.
 function dragStart(){const capture=handle.setPointerCapture;handle.setPointerCapture=()=>{};try{handle.dispatchEvent(new PointerEvent('pointerdown',{pointerId:999,button:0,clientY:400,bubbles:true}));}finally{handle.setPointerCapture=capture;}}
 function dragMove(p){handle.dispatchEvent(new PointerEvent('pointermove',{pointerId:999,clientY:400-80*Math.sin(p*Math.PI*2),bubbles:true}));}
 const dragEnd=()=>handle.dispatchEvent(new PointerEvent('pointerup',{pointerId:999,bubbles:true}));
 const enter=[()=>{hero.paused=false;hero.request();},()=>hero.select(1),()=>selectMaterial(2),
  ()=>{hero.paused=true;labStage.scrollIntoView({behavior:'instant',block:'center'});lab.paused=true;studyTitle.value='gentrit';castFromInput(true);},dragStart];
 async function run(hz,index){
  prepare();await frames(40);ready();const meter=instrument(),events=[];
  try{
   const start=await frame(),timeline=new M.Timeline(start,hz);let terminalIntervalMs=0,completionOvershootMs=0;
   enter[0]();timeline.actions.push(0);meter.set(0);events.push({segment:0,scheduledMs:0,executedMs:0});
   while(!timeline.finished){
    const now=await frame(),previous=timeline.last,step=timeline.step(now,!document.hidden);
    if(step.invalid)throw Error(step.invalid);
    if(step.done){terminalIntervalMs=now-previous;completionOvershootMs=step.elapsed-10000;break;}
    for(const i of step.due){enter[i]();events.push({segment:i,scheduledMs:i*2000,executedMs:step.elapsed});}
    meter.set(step.index);if(step.index===4)dragMove((step.elapsed-8000)/2000);meter.poll();
   }
   meter.set(-1);dragEnd();pauseAll();for(let i=0;i<10;i++){await frame();meter.poll();}
   return {run:index,valid:true,documentHidden:false,viewport:viewport(),events,terminalIntervalMs,completionOvershootMs,
    segments:timeline.report().map((stats,i)=>({name:labels[i],...stats,draws:meter.draws[i],rawIntervalsMs:timeline.bins[i],
     gpu:{samples:meter.gpu[i].length,medianMs:M.quantile(meter.gpu[i],.5),p95Ms:M.quantile(meter.gpu[i],.95),worstMs:M.quantile(meter.gpu[i],1)}})),gpuSupport:meter.support};
  }finally{dragEnd();pauseAll();result.gpuCleanup.push(meter.finish());}
 }
 function show(){ $('perf-results').textContent=JSON.stringify(result,null,2);$('perf-save').disabled=false;panel.querySelector('details').open=true;}
 async function guard(fn){if(busy)return;busy=true;invalid='';panel.dataset.running='true';try{ready();await fn();}catch(e){result={...result,valid:false,error:e.message};status.textContent=e.message;show();}finally{busy=false;delete panel.dataset.running;pauseAll();}}
 $('perf-run').onclick=()=>guard(async()=>{
  if(reducedMotion.matches)throw Error('Reduced motion is enabled; this cannot measure the animated baseline.');
  result={schema:'form-perf-v1',baseCommit:'3781ea5',date:new Date().toISOString(),layers,valid:false,runs:[],gpuCleanup:[],
   machine:$('perf-machine').value.trim()||'Not supplied',userAgent:navigator.userAgent,platform:navigator.platform,hardwareConcurrency:navigator.hardwareConcurrency,viewport:viewport(),
   input:'Synthetic handle pointer events; not hardware-input latency.',intervalAttribution:'Full intervals by ending callback in half-open 2s windows. Terminal boundary interval reported separately.'};
  prepare();status.textContent='Calibrating refresh with objects paused…';await frames(40);pauseAll();
  const calibration=[];let previous=await frame();for(let i=0;i<120;i++){const now=await frame();calibration.push(now-previous);previous=now;}
  const override=Number($('perf-hz').value);if($('perf-hz').value&&!(override>=24&&override<=360))throw Error('Refresh must be 24–360 Hz.');
  result.calibration={refreshHz:override||1000/M.quantile(calibration,.5),source:override?'owner supplied':'estimate from 120 unloaded rAF intervals',rawIntervalsMs:calibration};
  for(let i=1;i<=3;i++){status.textContent=`Run ${i}/3 — keep tab visible, do not interact.`;result.runs.push(await run(result.calibration.refreshHz,i));}
  result.ranges=labels.map((name,i)=>({name,runs:3,...Object.fromEntries(['framesDelivered','framesExpected','medianMs','p95Ms','worstMs','overBudgetCount'].map(k=>[k,M.range(result.runs.map(r=>r.segments[i][k]))]))}));
  result.valid=true;status.textContent='Three runs captured. Save JSON; compare ranges, not single averages.';show();
 });
 $('perf-pixels').onclick=()=>guard(async()=>{
  pauseAll();const cases=[{name:'hero-a',s:hero,shape:0,material:0,x:-.38,y:.35,owner:'dcbc4c2a'},
   {name:'hero-b',s:hero,shape:0,material:0,x:.2,y:1.1,owner:'577ba6bf'},
   ...previews.map((s,i)=>({name:'preview-'+i,s,shape:i,material:i,x:i===2?.15:-.38,y:.35,owner:['937de9cc','ce2785be','f72ad12a'][i]}))];
  const hashes=[];
  for(const c of cases){const s=c.s,gl=s.gl;reset(s,c.shape,c.material);s.x=s.tx=c.x;s.y=s.ty=c.y;const w=s.canvas.width,h=s.canvas.height;
   try{s.draw(400,300);const pixels=new Uint8Array(400*300*4);gl.readPixels(0,0,400,300,gl.RGBA,gl.UNSIGNED_BYTE,pixels); // Same task, no await.
    const error=gl.getError();if(error!==gl.NO_ERROR)throw Error('WebGL error '+error);if(!pixels.some((v,i)=>i%4===3&&v))throw Error('Empty framebuffer: '+c.name);
    const debug=gl.getExtension('WEBGL_debug_renderer_info');hashes.push({name:c.name,width:400,height:300,pose:{x:c.x,y:c.y,twist:0,light:.15},hash:M.hashPixels(pixels),ownerHash:c.owner,
     renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)});
   }finally{s.draw(w||400,h||300);}
  }
  result={schema:'form-pixels-v1',baseCommit:'3781ea5',date:new Date().toISOString(),valid:true,documentHidden:document.hidden,userAgent:navigator.userAgent,viewport:viewport(),layers:[],hashAlgorithm:'FNV-1a 32-bit RGBA bytes, bottom row first',hashes};
  status.textContent='Five framebuffer hashes captured. Save before renderer changes.';show();
 });
 $('perf-save').onclick=()=>{if(!result)return;const url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=result.schema+'-'+Date.now()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
})();
