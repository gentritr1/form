/* FORM exhibition edition. Original geometry and dependency-free WebGL rendering. */
'use strict';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const names = ['Trefoil', 'Orbit', 'Bloom'];
const descriptions = ['One continuous curve. Three crossings.', 'A ring, lifted into a slow wave.', 'Eight lobes, folded from a sphere.'];
const materials = [
  { name: 'Copper', color: [.72, .3, .13], metal: 1, roughness: .22 },
  { name: 'Chrome', color: [.72, .79, .83], metal: 1, roughness: .14 },
  { name: 'Porcelain', color: [.84, .85, .79], metal: 0, roughness: .38 }
];
const vertexSource = `
attribute vec3 aPosition, aNormal, aTarget, aTargetNormal;
uniform float uX, uY, uAspect, uScale, uMorph, uTension;
varying vec3 vNormal, vPosition, vLocal;
vec3 rotation(vec3 p) {
 float cx=cos(uX), sx=sin(uX), cy=cos(uY), sy=sin(uY);
 p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);
 return vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);
}
vec3 deform(vec3 p){
 float a=p.y*uTension*.85;
 p.xz=mat2(cos(a),-sin(a),sin(a),cos(a))*p.xz;
 float ripple=1.+uTension*.07*sin(p.y*7.+atan(p.z,p.x)*5.);
 return p*ripple;
}
void main(){
 vec3 base=mix(aPosition,aTarget,uMorph);
 vec3 normal=mix(aNormal,aTargetNormal,uMorph);
 normal=length(normal)>.001?normalize(normal):normalize(base);
 vec3 tangent=normalize(cross(normal,abs(normal.y)>.8?vec3(1.,0.,0.):vec3(0.,1.,0.)));
 vec3 bitangent=cross(normal,tangent);
 vec3 local=deform(base);
 vec3 t=deform(base+tangent*.002)-local;
 vec3 b=deform(base+bitangent*.002)-local;
 normal=normalize(cross(t,b));
 vec3 p=rotation(local)*uScale;
 vPosition=p;vNormal=rotation(normal);vLocal=local;
 float z=5.9-p.z;
 gl_Position=vec4(p.x*3.05/uAspect,p.y*3.05,z*.97-.25,z);
}`;
const fragmentSource = `
precision highp float;
varying vec3 vNormal,vPosition,vLocal;
uniform vec3 uColor;
uniform float uMetal,uRoughness,uLight;
const float PI=3.14159265;
vec3 environment(vec3 r){
 float a=uLight; r.xz=mat2(cos(a),-sin(a),sin(a),cos(a))*r.xz;
 vec3 env=mix(vec3(.075,.085,.095),vec3(.52,.57,.62),smoothstep(-.5,1.,r.y));
 float key=pow(max(dot(r,normalize(vec3(-.8,.9,1.2))),0.),9.);
 float panel=pow(max(dot(r,normalize(vec3(1.2,.2,1.))),0.),32.);
 float rim=pow(max(dot(r,normalize(vec3(-1.,.15,-.6))),0.),23.);
 float lower=pow(max(dot(r,normalize(vec3(.25,-1.,1.2))),0.),9.);
 return env+vec3(4.5,4.2,3.8)*key+vec3(4.,4.5,5.)*panel+vec3(1.7,2.,2.3)*rim+vec3(.52,.55,.6)*lower;
}
vec3 directLight(vec3 n,vec3 v,vec3 l,vec3 radiance,vec3 f0){
 vec3 h=normalize(v+l);float nl=max(dot(n,l),0.);float nv=max(dot(n,v),.001);
 float nh=max(dot(n,h),0.);float vh=max(dot(v,h),0.);
 float a=uRoughness*uRoughness;float a2=a*a;float denom=nh*nh*(a2-1.)+1.;
 float D=a2/max(PI*denom*denom,.001);
 float k=pow(uRoughness+1.,2.)/8.;float G=(nv/(nv*(1.-k)+k))*(nl/(nl*(1.-k)+k));
 vec3 F=f0+(1.-f0)*pow(1.-vh,5.);
 vec3 spec=D*G*F/max(4.*nv*nl,.001);
 vec3 diffuse=(1.-F)*(1.-uMetal)*uColor/PI;
 return (diffuse+spec)*radiance*nl;
}
vec3 filmic(vec3 c){return clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.);}
void main(){
 vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;
 vec3 view=normalize(vec3(0.,0.,5.9)-vPosition);
 float grain=sin(vLocal.y*510.+vLocal.x*7.)*.004*uMetal;
 n=normalize(n+vec3(grain,0.,grain*.5));
 vec3 f0=mix(vec3(.04),uColor,uMetal);
 float nv=max(dot(n,view),0.);vec3 F=f0+(1.-f0)*pow(1.-nv,5.);
 vec3 r=reflect(-view,n);
 vec3 env=environment(r);
 vec3 color=env*F*(1.-uRoughness*.38);
 color+=uColor*(1.-uMetal)*(.18+.24*max(n.y,0.));
 vec3 key=normalize(vec3(-2.*cos(uLight),3.,3.+sin(uLight)));
 color+=directLight(n,view,key,vec3(2.1,1.95,1.8),f0);
 color+=directLight(n,view,normalize(vec3(3.,.8,2.)),vec3(.8,1.,1.3),f0);
 float occlusion=.78+.22*smoothstep(-1.2,.8,vPosition.y);color*=occlusion;
 gl_FragColor=vec4(pow(filmic(color),vec3(1./2.2)),1.);
}`;
const TAU = Math.PI * 2;
const NU = 192, NV = 64;
const normalize = v => { const l = Math.hypot(...v) || 1; return v.map(n => n / l); };
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
function trefoil(t) {
 return [(2+Math.cos(3*t))*Math.cos(2*t)*.47,(2+Math.cos(3*t))*Math.sin(2*t)*.47,Math.sin(3*t)*.47];
}
function surface(shape, u, v) {
 if (shape === 0) {
  const c=trefoil(u), next=trefoil(u+.001), tangent=normalize(next.map((n,i)=>n-c[i]));
  const b=normalize(cross(tangent,[0,0,1])), n=cross(b,tangent);
  const tube=.26+.018*Math.sin(u*6);
  return c.map((p,i)=>p+tube*(Math.cos(v)*n[i]+Math.sin(v)*b[i]));
 }
 if (shape === 1) {
  const r=1.03+.09*Math.cos(u*5), tube=.36+.055*Math.sin(u*5);
  return [(r+tube*Math.cos(v))*Math.cos(u),(r+tube*Math.cos(v))*Math.sin(u),tube*Math.sin(v)+.2*Math.sin(u*3)];
 }
 const theta=v/2, r=1.24*(1+.15*Math.cos(8*u)*Math.sin(theta)**2+.085*Math.cos(theta*12));
 return [r*Math.sin(theta)*Math.cos(u),r*Math.cos(theta),r*Math.sin(theta)*Math.sin(u)];
}
function geometry(shape) {
 const positions=[], normals=[], indices=[];
 for(let i=0;i<=NU;i++) for(let j=0;j<=NV;j++) {
  const u=i/NU*TAU, v=j/NV*TAU, p=surface(shape,u,v);
  const du=surface(shape,u+.0003,v), dv=surface(shape,u,v+.0003);
  let n=normalize(cross(du.map((x,k)=>x-p[k]),dv.map((x,k)=>x-p[k])));
  if(Math.hypot(...n)<.5)n=normalize(p);
  positions.push(...p); normals.push(...n);
 }
 for(let i=0;i<NU;i++) for(let j=0;j<NV;j++) {
  const a=i*(NV+1)+j,b=a+NV+1;indices.push(a,b,a+1,a+1,b,b+1);
 }
 return { positions:new Float32Array(positions), normals:new Float32Array(normals), indices:new Uint16Array(indices) };
}
const meshes=[geometry(0),geometry(1),geometry(2)];
// Exact cubic-bezier(.23, 1, .32, 1), shared with the CSS motion token.
function easeOut(progress) {
 const x=Math.max(0,Math.min(1,progress));let t=x;
 for(let i=0;i<5;i++) {
  const bx=3*(1-t)**2*t*.23+3*(1-t)*t*t*.32+t*t*t;
  const dx=3*(1-t)**2*.23+6*(1-t)*t*(.32-.23)+3*t*t*(1-.32);
  if(dx>.00001)t=Math.max(0,Math.min(1,t-(bx-x)/dx));
 }
 return 1-(1-t)**3;
}
class Sculpture {
 constructor(canvas, shape=0, material=0, mode='preview') {
  this.canvas=canvas;this.shape=shape;this.mode=mode;this.currentMesh=meshes[shape];this.targetMesh=this.currentMesh;
  this.x=shape===2?.15:-.38;this.y=.35;this.tx=this.x;this.ty=this.y;
  this.morph=1;this.morphStart=0;this.last=0;this.visible=false;this.frame=0;this.paused=false;
  this.dragging=false;this.velocity=0;this.hovered=false;this.tension=mode==='lab'?.35:0;this.light=mode==='lab'?0:.15;this.targetLight=this.light;
  this.material=material;this.color=[...materials[material].color];this.metal=materials[material].metal;this.roughness=materials[material].roughness;
  this.materialFrom={color:[...this.color],metal:this.metal,roughness:this.roughness};this.materialStart=0;this.materialProgress=1;
  this.gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});
  this.available=false;this.width=0;this.height=0;
  if(!this.gl){this.unavailable();return;}
  try{this.initialize();this.available=true;}catch(error){console.error('Sculpture:',error.message);this.unavailable();return;}
  this.resize=new ResizeObserver(entries=>{const r=entries[0].contentRect;this.width=r.width;this.height=r.height;this.request();});this.resize.observe(canvas);
  this.observer=new IntersectionObserver(([e])=>{this.visible=e.isIntersecting;if(!this.visible){cancelAnimationFrame(this.frame);this.frame=0;this.last=0;}else this.request();},{rootMargin:'30px'});this.observer.observe(canvas);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(this.frame);this.frame=0;this.last=0;this.velocity=0;this.dragging=false;this.unavailable();});
  canvas.addEventListener('webglcontextrestored',()=>{
   try{this.initialize();this.available=true;canvas.style.visibility='';const fallback=canvas.parentElement.querySelector('.fallback');if(fallback)fallback.hidden=true;this.syncAvailability();this.request();}
   catch{this.unavailable();}
  });
  if(mode!=='preview')this.bindInteraction();else this.bindPreview();
 }
 unavailable() {
  this.available=false;this.canvas.style.visibility='hidden';const fallback=this.canvas.parentElement.querySelector('.fallback');
  if(fallback)fallback.hidden=false;
  else {const label=document.createElement('span');label.className='fallback';label.textContent=names[this.shape];this.canvas.parentElement.append(label);}
  this.syncAvailability();
 }
 syncAvailability() {
  if(this.mode==='lab')document.querySelectorAll('.experiment-controls input,.experiment-controls button').forEach(c=>c.disabled=!this.available);
  if(this.onAvailabilityChange)this.onAvailabilityChange();
 }
 initialize() {
  const gl=this.gl;
  const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;};
  this.program=gl.createProgram();const vs=compile(gl.VERTEX_SHADER,vertexSource),fs=compile(gl.FRAGMENT_SHADER,fragmentSource);gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);gl.deleteShader(vs);gl.deleteShader(fs);
  if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));
  this.uniforms={};for(const n of ['uX','uY','uAspect','uScale','uMorph','uTension','uColor','uMetal','uRoughness','uLight'])this.uniforms[n]=gl.getUniformLocation(this.program,n);
  this.attributes={};this.buffers={};for(const n of ['aPosition','aNormal','aTarget','aTargetNormal']){this.attributes[n]=gl.getAttribLocation(this.program,n);this.buffers[n]=gl.createBuffer();}
  this.index=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.index);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,meshes[0].indices,gl.STATIC_DRAW);
  this.upload();gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
 }
 upload() {
  const gl=this.gl;const arrays={aPosition:this.currentMesh.positions,aNormal:this.currentMesh.normals,aTarget:this.targetMesh.positions,aTargetNormal:this.targetMesh.normals};
  for(const [name,data]of Object.entries(arrays)){gl.bindBuffer(gl.ARRAY_BUFFER,this.buffers[name]);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);}
 }
 select(shape) {
  if(shape===this.shape)return;
  // Preserve the current blended surface when a visitor interrupts a morph.
  if(this.morph<1){const blend=(a,b)=>Float32Array.from(a,(v,i)=>v+(b[i]-v)*this.morph);this.currentMesh={positions:blend(this.currentMesh.positions,this.targetMesh.positions),normals:blend(this.currentMesh.normals,this.targetMesh.normals)};}
  else this.currentMesh=this.targetMesh;
  this.shape=shape;this.targetMesh=meshes[shape];this.morph=reducedMotion.matches?1:0;this.morphStart=performance.now();this.tx=shape===2?.15:-.38;
  if(this.available)this.upload();this.request();
 }
 setMaterial(material) {
  this.materialFrom={color:[...this.color],metal:this.metal,roughness:this.roughness};this.material=material;this.materialStart=performance.now();this.materialProgress=0;this.request();
 }
 bindInteraction() {
  let px=0,py=0,last=0;
  this.canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;this.dragging=true;this.velocity=0;px=e.clientX;py=e.clientY;last=performance.now();this.canvas.setPointerCapture(e.pointerId);});
  this.canvas.addEventListener('pointermove',e=>{
   if(!this.dragging){if(this.mode==='hero'&&finePointer.matches&&!reducedMotion.matches){const r=this.canvas.getBoundingClientRect();this.targetLight=.15+(e.clientX-r.left-r.width/2)/r.width*.5;this.request();}return;}
   const now=performance.now(),dx=e.clientX-px,dt=Math.max((now-last)/1000,.01);this.ty+=dx*.008;this.tx=Math.max(-1.4,Math.min(1.4,this.tx+(e.clientY-py)*.008));this.velocity=Math.max(-3,Math.min(3,dx*.008/dt));px=e.clientX;py=e.clientY;last=now;this.request();
  });
  const end=()=>{this.dragging=false;this.request();};this.canvas.addEventListener('pointerup',end);this.canvas.addEventListener('pointercancel',()=>{this.velocity=0;end();});this.canvas.addEventListener('lostpointercapture',end);
  this.canvas.addEventListener('pointerleave',()=>{if(!this.dragging){this.targetLight=this.mode==='hero'?.15:this.targetLight;this.request();}});
  this.canvas.addEventListener('keydown',e=>{const d={ArrowLeft:[0,-.15],ArrowRight:[0,.15],ArrowUp:[-.15,0],ArrowDown:[.15,0]}[e.key];if(!d)return;e.preventDefault();this.tx=Math.max(-1.4,Math.min(1.4,this.tx+d[0]));this.ty+=d[1];this.x=this.tx;this.y=this.ty;this.velocity=0;this.request();});
 }
 bindPreview() {
  const work=this.canvas.closest('.work');if(!work)return;
  work.addEventListener('pointerenter',()=>{if(finePointer.matches&&!reducedMotion.matches){this.hovered=true;this.request();}});
  work.addEventListener('pointerleave',()=>{this.hovered=false;this.tx=this.shape===2?.15:-.38;this.request();});
  work.addEventListener('pointermove',e=>{if(!this.hovered)return;const r=work.getBoundingClientRect();this.tx=(this.shape===2?.15:-.38)+(e.clientY-r.top-r.height/2)/r.height*.25;this.request();});
 }
 request(){if(!this.frame&&this.available&&this.visible&&!document.hidden)this.frame=requestAnimationFrame(t=>this.render(t));}
 render(time) {
  this.frame=0;if(!this.available||!this.visible||document.hidden)return;
  const gl=this.gl,dpr=Math.min(devicePixelRatio||1,this.mode==='preview'?1.25:1.5),w=Math.round(this.width*dpr),h=Math.round(this.height*dpr);if(!w||!h)return;
  if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;gl.viewport(0,0,w,h);}
  const dt=this.last?Math.min((time-this.last)/1000,.05):.016;this.last=time;
  const auto=this.mode!=='preview'&&!this.paused&&!this.dragging&&!reducedMotion.matches;
  if(auto)this.ty+=dt*.105;
  if(this.hovered)this.ty+=dt*.3;
  if(!this.dragging&&!reducedMotion.matches&&Math.abs(this.velocity)>.005){this.ty+=this.velocity*dt;this.velocity*=Math.exp(-5*dt);}
  const smooth=reducedMotion.matches?1:1-Math.exp(-15*dt);
  this.x+=(this.tx-this.x)*smooth;this.y+=(this.ty-this.y)*smooth;this.light+=(this.targetLight-this.light)*smooth;
  if(this.morph<1)this.morph=reducedMotion.matches?1:easeOut((time-this.morphStart)/650);
  if(this.materialProgress<1){this.materialProgress=reducedMotion.matches?1:Math.min(1,(time-this.materialStart)/220);const t=easeOut(this.materialProgress),target=materials[this.material];this.color=this.materialFrom.color.map((c,i)=>c+(target.color[i]-c)*t);this.metal=this.materialFrom.metal+(target.metal-this.materialFrom.metal)*t;this.roughness=this.materialFrom.roughness+(target.roughness-this.materialFrom.roughness)*t;}
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);
  for(const n of Object.keys(this.buffers)){const loc=this.attributes[n];gl.bindBuffer(gl.ARRAY_BUFFER,this.buffers[n]);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);}
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.index);const u=this.uniforms;
  // Fit the object to the shorter viewport dimension, including portrait canvases.
  const scale=(this.mode==='hero'?1.1:this.mode==='lab'?1.05:1.02)*Math.min(1,w/h);
  gl.uniform1f(u.uX,this.x);gl.uniform1f(u.uY,this.y);gl.uniform1f(u.uAspect,w/h);gl.uniform1f(u.uScale,scale);
  gl.uniform1f(u.uMorph,this.morph);gl.uniform1f(u.uTension,this.tension);gl.uniform3fv(u.uColor,this.color);gl.uniform1f(u.uMetal,this.metal);gl.uniform1f(u.uRoughness,this.roughness);gl.uniform1f(u.uLight,this.light);
  gl.drawElements(gl.TRIANGLES,meshes[0].indices.length,gl.UNSIGNED_SHORT,0);
  const settling=Math.abs(this.x-this.tx)+Math.abs(this.y-this.ty)+Math.abs(this.light-this.targetLight)>.001;
  if(auto||this.hovered||settling||Math.abs(this.velocity)>.005||this.morph<1||this.materialProgress<1)this.request();
 }
 reset(){this.tx=this.shape===2?.15:-.38;this.ty=.35;this.velocity=0;this.request();}
}
const hero=new Sculpture(document.querySelector('#hero-canvas'),0,0,'hero');
const lab=new Sculpture(document.querySelector('#lab-canvas'),2,1,'lab');
const previews=[...document.querySelectorAll('.preview')].map(c=>new Sculpture(c,Number(c.dataset.shape),Number(c.dataset.material)));
const allSculptures=[hero,lab,...previews];
const announce=text=>document.querySelector('#announcement').textContent=text;
function selectMaterial(i) {
 hero.setMaterial(i);document.querySelectorAll('.swatch').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.material)===i)));
 document.querySelector('#material-name').textContent=materials[i].name;
 hero.canvas.setAttribute('aria-label',`Interactive ${materials[i].name.toLowerCase()} ${names[hero.shape]} sculpture. Drag to rotate, or use the arrow keys.`);announce(`${materials[i].name} selected.`);
}
function selectObject(shape, fromGallery=false) {
 hero.select(shape);document.querySelector('#stage .fallback strong').textContent=names[shape];document.querySelector('#object-name').textContent=names[shape];document.querySelector('#object-desc').textContent=descriptions[shape];
 document.querySelectorAll('[data-object]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.object)===shape)));selectMaterial(shape);
 if(fromGallery){document.querySelector('.hero').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'});(hero.available?hero.canvas:document.querySelector(`[data-object="${shape}"]`)).focus({preventScroll:true});}
 announce(`${names[shape]} selected. Drag or use arrow keys to rotate.`);
}
document.querySelectorAll('.swatch').forEach(b=>b.addEventListener('click',()=>selectMaterial(Number(b.dataset.material))));
document.querySelectorAll('[data-object]').forEach(b=>b.addEventListener('click',()=>selectObject(Number(b.dataset.object))));
document.querySelectorAll('.work').forEach(b=>b.addEventListener('click',()=>selectObject(Number(b.dataset.shape),true)));
const pause=document.querySelector('#pause');
const labPause=document.querySelector('#lab-pause');
function updatePause(){
 pause.disabled=reducedMotion.matches||!hero.available;pause.setAttribute('aria-pressed',String(hero.paused||reducedMotion.matches));pause.setAttribute('aria-label',reducedMotion.matches?'Automatic rotation disabled by reduced motion preference':hero.paused?'Resume sculpture rotation':'Pause sculpture rotation');
 labPause.disabled=reducedMotion.matches||!lab.available;labPause.textContent=reducedMotion.matches?'Motion off':lab.paused?'Resume motion':'Pause motion';labPause.setAttribute('aria-pressed',String(lab.paused||reducedMotion.matches));
 document.querySelector('#reset').disabled=!hero.available;
}
hero.onAvailabilityChange=updatePause;lab.onAvailabilityChange=updatePause;
updatePause();pause.addEventListener('click',()=>{hero.paused=!hero.paused;hero.velocity=0;updatePause();hero.request();});labPause.addEventListener('click',()=>{lab.paused=!lab.paused;lab.velocity=0;updatePause();lab.request();});
document.querySelector('#reset').addEventListener('click',()=>{hero.reset();announce('View reset.');});
const tension=document.querySelector('#tension'),light=document.querySelector('#light');
tension.addEventListener('input',()=>{lab.tension=Number(tension.value)/100;lab.request();document.querySelector('#tension-value').textContent=tension.value+'%';tension.setAttribute('aria-valuetext',tension.value+' percent');});
light.addEventListener('input',()=>{lab.targetLight=(Number(light.value)-45)*Math.PI/180;lab.request();document.querySelector('#light-value').textContent=light.value+'°';light.setAttribute('aria-valuetext',light.value+' degrees');});
document.querySelector('#lab-reset').addEventListener('click',()=>{tension.value=35;light.value=45;lab.tension=.35;lab.targetLight=0;lab.reset();document.querySelector('#tension-value').textContent='35%';document.querySelector('#light-value').textContent='45°';tension.setAttribute('aria-valuetext','35 percent');light.setAttribute('aria-valuetext','45 degrees');announce('Original form and lighting restored.');});
const theme=document.querySelector('#theme'),systemTheme=matchMedia('(prefers-color-scheme: dark)');
function updateTheme(){const dark=document.documentElement.dataset.theme?document.documentElement.dataset.theme==='dark':systemTheme.matches;theme.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} theme`);document.querySelector('meta[name="theme-color"]').setAttribute('content',dark?'#1f2327':'#e9ebed');}
theme.addEventListener('click',()=>{const dark=document.documentElement.dataset.theme?document.documentElement.dataset.theme==='dark':systemTheme.matches;document.documentElement.dataset.theme=dark?'light':'dark';try{localStorage.setItem('form-theme',document.documentElement.dataset.theme);}catch{}updateTheme();});
systemTheme.addEventListener('change',updateTheme);updateTheme();
// System motion preference suspends movement without erasing the visitor's pause choice.
reducedMotion.addEventListener('change',()=>{for(const s of allSculptures){s.velocity=0;s.hovered=false;s.request();}updatePause();});
finePointer.addEventListener('change',()=>{if(!finePointer.matches)for(const s of previews){s.hovered=false;s.request();}});
document.addEventListener('visibilitychange',()=>{for(const s of allSculptures){if(document.hidden){cancelAnimationFrame(s.frame);s.frame=0;}else{s.last=0;s.request();}}});
