/* FORM exhibition edition. Original geometry and dependency-free WebGL rendering. */
'use strict';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
const names = ['Trefoil', 'Orbit', 'Bloom'];
const descriptions = ['One continuous curve. Three crossings.', 'A ring, lifted into a slow wave.', 'Eight lobes, folded from a sphere.'];
const materials = [
  { name: 'Copper', color: [.72, .3, .13], metal: 1, roughness: .22 },
  { name: 'Chrome', color: [.72, .79, .83], metal: 1, roughness: .14 },
  { name: 'Porcelain', color: [.84, .85, .79], metal: 0, roughness: .38 }
];
// The room takes the temperature of the hero material; these mirror the CSS --bg tokens.
const materialSlugs = ['copper', 'chrome', 'porcelain'];
const themeBackgrounds = {
  light: { copper: '#ECE9E4', chrome: '#E8EBEE', porcelain: '#E9ECE8' },
  dark: { copper: '#1B1917', chrome: '#17191C', porcelain: '#171A18' }
};
// A JS lookup, not getComputedStyle: a computed read mid-crossfade returns an in-between colour.
function syncThemeColor() {
  const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : systemTheme.matches;
  const material = document.documentElement.dataset.material || 'copper';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', themeBackgrounds[dark ? 'dark' : 'light'][material]);
}
const vertexSource = `
attribute vec3 aPosition, aNormal, aTarget, aTargetNormal;
uniform float uX, uY, uAspect, uScale, uMorph, uTension, uLobes, uWave, uRipple;
varying vec3 vNormal, vPosition, vLocal;
vec3 rotation(vec3 p) {
 float cx=cos(uX), sx=sin(uX), cy=cos(uY), sy=sin(uY);
 p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);
 return vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);
}
vec3 deform(vec3 p){
 float a=p.y*uTension*.85;
 p.xz=mat2(cos(a),-sin(a),sin(a),cos(a))*p.xz;
 // atan is singular on the vertical axis and the lobes crowd together near it, so the ripple fades out
 // there (sooner for more lobes) before the mesh can no longer resolve it.
 float fade=smoothstep(.03*uLobes,.03*uLobes+.35,length(p.xz));
 float ripple=1.+uTension*.07*uRipple*fade*sin(p.y*uWave+atan(p.z,p.x)*uLobes);
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
// Cast a word: the same normalised word gives the same sculpture on every device.
const sceneKeys = ['silver', 'sage', 'ink'];
const normalizeWord = word => String(word ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
function mulberry32(seed) {
 let a = seed >>> 0;
 return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function castWord(word) {
 const text = normalizeWord(word);
 if (!text) return null;
 let hash = 0x811c9dc5;
 for (let i = 0; i < text.length; i++) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 0x01000193); }
 hash >>>= 0;
 const r = mulberry32(hash);
 const shape = Math.floor(r() * 3), material = Math.floor(r() * 3), scene = sceneKeys[Math.floor(r() * 3)];
 const twist = 20 + Math.round(r() * 80), light = Math.round(r() * 180), lobes = 2 + Math.floor(r() * 8);
 const wave = Math.round((3 + r() * 9) * 10) / 10, x = -0.6 + r() * 1.2, y = r() * TAU;
 return { hash, shape, material, scene, twist, light, lobes, wave, x, y };
}
// #study=v1.<shape>.<material>.<scene>.<twist>.<light>.<lobes>.<wave×10>.<x×100>.<y×100>[&name=…]
function parseStudy(hash) {
 const match = /^#?study=v1\.(\d+)\.(\d+)\.(\d+)\.(\d+)\.(\d+)\.(\d+)\.(\d+)\.(-?\d+)\.(\d+)(&.*)?$/.exec(String(hash ?? ''));
 if (!match) return null;
 const [shape, material, scene, twist, light, lobes, wave, x, y] = match.slice(1, 10).map(Number);
 const within = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;
 if (!within(shape, 0, 2) || !within(material, 0, 2) || !within(scene, 0, 2) || !within(twist, 0, 100) || !within(light, 0, 180) || !within(lobes, 2, 9) || !within(wave, 30, 120) || !within(x, -140, 140) || !within(y, 0, 628)) return null;
 let name = '';
 const param = (match[10] || '').split('&').find(part => part.startsWith('name='));
 if (param) {
  try { name = decodeURIComponent(param.slice(5)).trim(); } catch { name = ''; }
  name = name.slice(0, 42); if (/[\uD800-\uDBFF]$/.test(name)) name = name.slice(0, -1);
 }
 return { shape, material, scene: sceneKeys[scene], twist, light, lobes, wave: wave / 10, x: x / 100, y: y / 100, name };
}
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
  this.dragging=false;this.velocity=0;this.hovered=false;this.tension=mode==='lab'?.35:0;this.targetTension=this.tension;this.light=mode==='lab'?0:.15;this.targetLight=this.light;
  this.material=material;this.color=[...materials[material].color];this.metal=materials[material].metal;this.roughness=materials[material].roughness;
  this.materialFrom={color:[...this.color],metal:this.metal,roughness:this.roughness};this.materialStart=0;this.materialProgress=1;
  // Ripple form: 5 lobes and wave 7 reproduce the original surface exactly. Lobes stay integers.
  this.lobes=5;this.targetLobes=5;this.wave=7;this.targetWave=7;this.ripple=1;
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
  if(this.mode==='lab')document.querySelectorAll('.experiment-controls input,#lab-reset,#shape-handle,#surprise').forEach(c=>c.disabled=!this.available);
  if(this.onAvailabilityChange)this.onAvailabilityChange();
 }
 initialize() {
  const gl=this.gl;
  const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;};
  this.program=gl.createProgram();const vs=compile(gl.VERTEX_SHADER,vertexSource),fs=compile(gl.FRAGMENT_SHADER,fragmentSource);gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);gl.deleteShader(vs);gl.deleteShader(fs);
  if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));
  this.uniforms={};for(const n of ['uX','uY','uAspect','uScale','uMorph','uTension','uLobes','uWave','uRipple','uColor','uMetal','uRoughness','uLight'])this.uniforms[n]=gl.getUniformLocation(this.program,n);
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
 setTension(value, immediate=false) {
  this.targetTension=Math.max(0,Math.min(1,value));
  if(immediate||reducedMotion.matches)this.tension=this.targetTension;
  this.request();
 }
 // A fractional lobe count shows a seam where atan wraps, so lobes never interpolate (see render).
 setForm(lobes, wave, immediate=false) {
  this.targetLobes=Math.max(2,Math.min(9,Math.round(lobes)));this.targetWave=Math.max(3,Math.min(12,wave));
  if(immediate||reducedMotion.matches){this.lobes=this.targetLobes;this.wave=this.targetWave;this.ripple=1;}
  this.request();
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
  const dpr=Math.min(devicePixelRatio||1,this.mode==='preview'?1.25:1.5),w=Math.round(this.width*dpr),h=Math.round(this.height*dpr);if(!w||!h)return;
  const dt=this.last?Math.max(0,Math.min((time-this.last)/1000,.05)):.016;this.last=time;
  const auto=this.mode!=='preview'&&!this.paused&&!this.dragging&&!reducedMotion.matches;
  if(auto)this.ty+=dt*.105;
  if(this.hovered)this.ty+=dt*.3;
  if(!this.dragging&&!reducedMotion.matches&&Math.abs(this.velocity)>.005){this.ty+=this.velocity*dt;this.velocity*=Math.exp(-5*dt);}
  const smooth=reducedMotion.matches?1:1-Math.exp(-15*dt);
  this.x+=(this.tx-this.x)*smooth;this.y+=(this.ty-this.y)*smooth;this.light+=(this.targetLight-this.light)*smooth;
  this.tension+=(this.targetTension-this.tension)*smooth;
  // Ripple gate: flatten the ripple, swap the integer lobe count while it is flat, then raise it again.
  if(reducedMotion.matches){this.lobes=this.targetLobes;this.wave=this.targetWave;this.ripple=1;}
  else{
   this.wave+=(this.targetWave-this.wave)*smooth;if(Math.abs(this.targetWave-this.wave)<.001)this.wave=this.targetWave;
   if(this.lobes!==this.targetLobes){if(this.ripple<.02)this.lobes=this.targetLobes;else this.ripple-=this.ripple*smooth;}
   else{this.ripple+=(1-this.ripple)*smooth;if(1-this.ripple<.001)this.ripple=1;}
  }
  if(this.morph<1)this.morph=reducedMotion.matches?1:easeOut((time-this.morphStart)/650);
  if(this.materialProgress<1){this.materialProgress=reducedMotion.matches?1:Math.min(1,(time-this.materialStart)/220);const t=easeOut(this.materialProgress),target=materials[this.material];this.color=this.materialFrom.color.map((c,i)=>c+(target.color[i]-c)*t);this.metal=this.materialFrom.metal+(target.metal-this.materialFrom.metal)*t;this.roughness=this.materialFrom.roughness+(target.roughness-this.materialFrom.roughness)*t;}
  this.draw(w,h);
  const settling=Math.abs(this.x-this.tx)+Math.abs(this.y-this.ty)+Math.abs(this.light-this.targetLight)+Math.abs(this.tension-this.targetTension)+Math.abs(this.wave-this.targetWave)+Math.abs(1-this.ripple)+(this.lobes!==this.targetLobes?1:0)>.001;
  if(auto||this.hovered||settling||Math.abs(this.velocity)>.005||this.morph<1||this.materialProgress<1)this.request();
 }
 // Drawing is independent of simulation, so a print preserves the exact displayed state.
 draw(w,h) {
  const gl=this.gl;
  if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
  gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);
  for(const n of Object.keys(this.buffers)){const loc=this.attributes[n];gl.bindBuffer(gl.ARRAY_BUFFER,this.buffers[n]);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);}
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.index);const u=this.uniforms;
  // Fit the object to the shorter viewport dimension, including portrait canvases.
  const scale=(this.mode==='hero'?1.1:this.mode==='lab'?1.05:1.02)*Math.min(1,w/h);
  gl.uniform1f(u.uX,this.x);gl.uniform1f(u.uY,this.y);gl.uniform1f(u.uAspect,w/h);gl.uniform1f(u.uScale,scale);
  gl.uniform1f(u.uMorph,this.morph);gl.uniform1f(u.uTension,this.tension);gl.uniform1f(u.uLobes,this.lobes);gl.uniform1f(u.uWave,this.wave);gl.uniform1f(u.uRipple,this.ripple);gl.uniform3fv(u.uColor,this.color);gl.uniform1f(u.uMetal,this.metal);gl.uniform1f(u.uRoughness,this.roughness);gl.uniform1f(u.uLight,this.light);
  gl.drawElements(gl.TRIANGLES,meshes[0].indices.length,gl.UNSIGNED_SHORT,0);
 }
 copyTo(context,x,y,w,h) {
  if(!this.available||this.gl.isContextLost())throw Error('The live sculpture is unavailable.');
  const previousWidth=this.canvas.width,previousHeight=this.canvas.height;
  try{this.draw(w,h);context.drawImage(this.canvas,x,y,w,h);}
  finally{if(previousWidth&&previousHeight)this.draw(previousWidth,previousHeight);else{this.canvas.width=previousWidth;this.canvas.height=previousHeight;}}
 }
 reset(){this.tx=this.shape===2?.15:-.38;this.ty=.35;this.velocity=0;this.request();}
}
const hero=new Sculpture(document.querySelector('#hero-canvas'),0,0,'hero');
const lab=new Sculpture(document.querySelector('#lab-canvas'),2,1,'lab');
const previews=[...document.querySelectorAll('.preview')].map(c=>new Sculpture(c,Number(c.dataset.shape),Number(c.dataset.material)));
const allSculptures=[hero,lab,...previews];
const announce=text=>document.querySelector('#announcement').textContent=text;
function selectMaterial(i) {
 hero.setMaterial(i);document.documentElement.dataset.material=materialSlugs[i];
 document.querySelectorAll('.swatch').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.material)===i)));
 document.querySelector('#material-name').textContent=materials[i].name;
 hero.canvas.setAttribute('aria-label',`Interactive ${materials[i].name.toLowerCase()} ${names[hero.shape]} sculpture. Drag to rotate, or use the arrow keys.`);announce(`${materials[i].name} selected.`);
 syncThemeColor();
}
function selectObject(shape, fromGallery=false) {
 hero.select(shape);document.querySelector('#stage .fallback strong').textContent=names[shape];document.querySelector('#object-name').textContent=names[shape];document.querySelector('#object-desc').textContent=descriptions[shape];
 document.querySelectorAll('[data-object]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.object)===shape)));selectMaterial(shape);positionTabIndicator();
 if(fromGallery){document.querySelector('.hero').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'});(hero.available?hero.canvas:document.querySelector(`[data-object="${shape}"]`)).focus({preventScroll:true});}
 announce(`${names[shape]} selected. Drag or use arrow keys to rotate.`);
}
document.querySelectorAll('.swatch').forEach(b=>b.addEventListener('click',()=>selectMaterial(Number(b.dataset.material))));
document.querySelectorAll('[data-object]').forEach(b=>b.addEventListener('click',()=>selectObject(Number(b.dataset.object))));
document.querySelectorAll('.work').forEach(b=>b.addEventListener('click',()=>selectObject(Number(b.dataset.shape),true)));
// One sliding indicator under the active object tab, measured from live layout.
const objectSelector=document.querySelector('.object-selector'),tabIndicator=objectSelector.querySelector('.tab-indicator');
function positionTabIndicator(){
 const active=objectSelector.querySelector('[data-object][aria-pressed=true]');
 if(!active||!tabIndicator)return;
 const width=active.offsetWidth||0;
 tabIndicator.style.transform=`translateX(${active.offsetLeft||0}px) scaleX(${width})`;
}
positionTabIndicator();
// Enable the transition only after the first placement so the indicator does not slide in on load.
requestAnimationFrame(()=>{if(tabIndicator)tabIndicator.dataset.ready='true';});
if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>positionTabIndicator()).observe(objectSelector);
const pause=document.querySelector('#pause');
const labPause=document.querySelector('#lab-pause'),labPauseLabel=document.querySelector('#lab-pause-label');
let savingPrint=false;
function updatePause(){
 pause.disabled=reducedMotion.matches||!hero.available;pause.setAttribute('aria-pressed',String(hero.paused||reducedMotion.matches));pause.setAttribute('aria-label',reducedMotion.matches?'Automatic rotation disabled by reduced motion preference':hero.paused?'Resume sculpture rotation':'Pause sculpture rotation');
 labPause.disabled=reducedMotion.matches||!lab.available;labPauseLabel.textContent=reducedMotion.matches?'Motion off':lab.paused?'Resume motion':'Pause motion';labPause.setAttribute('aria-pressed',String(lab.paused||reducedMotion.matches));
 document.querySelector('#reset').disabled=!hero.available;
 document.querySelector('#save-print').disabled=!lab.available||savingPrint;
}
hero.onAvailabilityChange=updatePause;lab.onAvailabilityChange=updatePause;
updatePause();pause.addEventListener('click',()=>{hero.paused=!hero.paused;hero.velocity=0;updatePause();hero.request();});labPause.addEventListener('click',()=>{lab.paused=!lab.paused;lab.velocity=0;updatePause();lab.request();});
document.querySelector('#reset').addEventListener('click',()=>{hero.reset();announce('View reset.');});
const tension=document.querySelector('#tension'),light=document.querySelector('#light');
const handle=document.querySelector('#shape-handle'),labShape=document.querySelector('#lab-shape'),labMaterial=document.querySelector('#lab-material'),studyTitle=document.querySelector('#study-title');
const labStage=document.querySelector('#lab-stage'),printStatus=document.querySelector('#print-status');
// Segmented radio groups replace the old <select>s; value === data-index === thumb position.
function segValue(group){const checked=group.querySelector('input:checked');return checked?Number(checked.value):0;}
function setSeg(group,index){group.querySelectorAll('input').forEach(inp=>{inp.checked=Number(inp.value)===index;});group.dataset.index=String(index);}
const scenes={silver:{bg:'#d9e0e5',text:'#272a2d'},sage:{bg:'#cdd9d2',text:'#272a2d'},ink:{bg:'#202b35',text:'#f0f3f5'}};
const studies=[
 {title:'A softer orbit',shape:1,material:2,twist:12,light:25,scene:'sage',x:-.3,y:.7},
 {title:'Folded chrome',shape:2,material:1,twist:68,light:110,scene:'silver',x:.2,y:1.1},
 {title:'Copper current',shape:0,material:0,twist:56,light:145,scene:'ink',x:-.55,y:.6},
 {title:'Porcelain loop',shape:0,material:2,twist:8,light:35,scene:'silver',x:-.1,y:1.4},
 {title:'After dark',shape:1,material:1,twist:80,light:165,scene:'ink',x:.45,y:.4}
];
let scene=scenes.silver,sceneKey='silver',studyName='Bloom study',lastStudy=-1;
const castReadout=document.querySelector('#cast-readout');
const restingStatus='Your print is a PNG. Nothing you type leaves this page.';
// The active cast (null when no word is cast), the normalised word it came from, and whether controls changed it since.
let cast=null,castKey='',castAdjusted=false,castTimer=0;
function setStatus(text){printStatus.textContent=text;delete printStatus.dataset.error;}
function castStatus(){return cast?`Cast from “${studyTitle.value.trim()}”. Adjust it, print it, or copy its link.`:restingStatus;}
function updateReadout(){
 castReadout.textContent=cast?`Nº ${cast.hash.toString(16).padStart(8,'0')} — ${names[cast.shape]} / ${materials[cast.material].name} / ${cast.lobes} lobes${castAdjusted?' / adjusted':''}`:'Nº — — type to cast';
}
function updateStudyView(){
 setSeg(labShape,lab.shape);setSeg(labMaterial,lab.material);
 document.querySelector('#study-name').textContent=studyTitle.value.trim()||studyName;
 document.querySelector('#lab-meta').textContent=`${names[lab.shape]} / ${materials[lab.material].name}`;
 document.querySelector('#lab-fallback-name').textContent=names[lab.shape];
 lab.canvas.setAttribute('aria-label',`Interactive ${materials[lab.material].name.toLowerCase()} ${names[lab.shape]}. Drag or use arrow keys to rotate.`);
}
function markPersonal(){studyName=`${names[lab.shape]} study`;if(cast)castAdjusted=true;updateStudyView();updateReadout();setStatus(castStatus());}
function setScene(key){sceneKey=key;scene=scenes[key];labStage.style.setProperty('--scene-bg',scene.bg);labStage.style.setProperty('--scene-text',scene.text);}
function setTwist(value,immediate=true){
 const amount=Math.max(0,Math.min(100,Math.round(value)));tension.value=String(amount);tension.style.setProperty('--fill',amount+'%');lab.setTension(amount/100,immediate);
 document.querySelector('#tension-value').textContent=amount+'%';tension.setAttribute('aria-valuetext',amount+' percent');
 handle.setAttribute('aria-valuenow',String(amount));handle.setAttribute('aria-valuetext',amount+' percent');handle.style.setProperty('--twist-ratio',String((100-amount)/100));
}
function setLight(value){light.value=String(value);light.style.setProperty('--fill',(value/180*100)+'%');lab.targetLight=(value-45)*Math.PI/180;lab.request();document.querySelector('#light-value').textContent=value+'°';light.setAttribute('aria-valuetext',value+' degrees');}
tension.addEventListener('input',()=>{setTwist(Number(tension.value));markPersonal();});
light.addEventListener('input',()=>{setLight(Number(light.value));markPersonal();});
labShape.addEventListener('change',()=>{const v=segValue(labShape);labShape.dataset.index=String(v);lab.select(v);markPersonal();announce(`${names[lab.shape]} in your studio.`);});
labMaterial.addEventListener('change',()=>{const v=segValue(labMaterial);labMaterial.dataset.index=String(v);lab.setMaterial(v);markPersonal();announce(`${materials[lab.material].name} selected in your studio.`);});
// Casting: the word chooses every control, then the visitor refines it.
function applyCast(c,word){
 lab.select(c.shape);lab.setMaterial(c.material);setTwist(c.twist,false);setLight(c.light);setScene(c.scene);lab.setForm(c.lobes,c.wave);
 // The cast angle, reached by the shortest turn from the current pose (equal modulo one revolution).
 lab.tx=c.x;lab.ty=lab.y+((((c.y-lab.y)%TAU)+TAU*1.5)%TAU-TAU/2);lab.velocity=0;
 cast=c;castKey=normalizeWord(word);castAdjusted=false;studyName=`${names[c.shape]} study`;
 updateStudyView();updateReadout();announce(`Cast: ${names[c.shape]}, ${materials[c.material].name}.`);setStatus(castStatus());
}
function castFromInput(force=false){
 clearTimeout(castTimer);castTimer=0;
 const word=studyTitle.value.trim(),c=castWord(word);
 if(!c){if(cast){cast=null;castKey='';castAdjusted=false;setStatus(restingStatus);}updateStudyView();updateReadout();return;}
 // Retyping the same word (or trailing spaces) keeps the visitor's refinements; Enter recasts on purpose.
 if(!force&&cast&&normalizeWord(word)===castKey)return;
 applyCast(c,word);
}
studyTitle.addEventListener('input',()=>{updateStudyView();clearTimeout(castTimer);castTimer=setTimeout(()=>castFromInput(),220);});
studyTitle.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing)castFromInput(true);});
const surpriseBtn=document.querySelector('#surprise'),surpriseIcon=surpriseBtn.querySelector('.btn-cell svg');let surpriseSpin=0;
surpriseBtn.addEventListener('click',()=>{
 surpriseSpin+=180;if(surpriseIcon)surpriseIcon.style.rotate=surpriseSpin+'deg';
 const options=studies.map((_,i)=>i).filter(i=>i!==lastStudy);lastStudy=options[Math.floor(Math.random()*options.length)];const next=studies[lastStudy];
 lab.select(next.shape);lab.setMaterial(next.material);setTwist(next.twist,false);setLight(next.light);setScene(next.scene);lab.tx=next.x;lab.ty=next.y;lab.velocity=0;lab.setForm(5,7);
 studyName=next.title;if(cast)castAdjusted=true;updateStudyView();updateReadout();announce(`${next.title}. ${names[next.shape]}, ${materials[next.material].name}.`);
 printStatus.textContent='Like this angle? Name it and save a print.';delete printStatus.dataset.error;
});
document.querySelector('#lab-reset').addEventListener('click',()=>{
 lab.select(2);lab.setMaterial(1);setTwist(35,false);setLight(45);setScene('silver');lab.setForm(5,7);lab.reset();
 clearTimeout(castTimer);castTimer=0;studyTitle.value='';cast=null;castKey='';castAdjusted=false;studyName='Bloom study';lastStudy=-1;updateStudyView();updateReadout();
 setStatus(restingStatus);announce('Original form and lighting restored.');
});
// A dedicated handle keeps sculpting separate from page scrolling and object rotation.
let handlePointer=null,startY=0,startTwist=35,railHeight=160;
handle.addEventListener('pointerdown',e=>{
 if(e.button!==0||handle.disabled||handlePointer!==null)return;e.preventDefault();handlePointer=e.pointerId;startY=e.clientY;startTwist=Number(tension.value);
 railHeight=document.querySelector('#shape-control').getBoundingClientRect().height||160;handle.dataset.dragging='true';handle.setPointerCapture(e.pointerId);
});
handle.addEventListener('pointermove',e=>{
 if(e.pointerId!==handlePointer)return;
 const raw=startTwist+(startY-e.clientY)/railHeight*100;setTwist(raw);markPersonal();
 // Small resistance outside the range; the handle settles back to the real value on release.
 const bounded=Math.max(0,Math.min(100,raw)),overshoot=(raw-bounded)*.14;
 handle.style.setProperty('--twist-ratio',String((100-bounded-Math.max(-8,Math.min(8,overshoot)))/100));
});
function releaseHandle(){if(handlePointer===null)return;handlePointer=null;delete handle.dataset.dragging;handle.style.setProperty('--twist-ratio',String((100-Number(tension.value))/100));}
lab.onAvailabilityChange=()=>{updatePause();if(!lab.available)releaseHandle();};
handle.addEventListener('pointerup',releaseHandle);handle.addEventListener('pointercancel',releaseHandle);handle.addEventListener('lostpointercapture',releaseHandle);
handle.addEventListener('keydown',e=>{
 const current=Number(tension.value);let next;
 if(e.key==='Home')next=0;else if(e.key==='End')next=100;else{const delta={ArrowUp:1,ArrowRight:1,ArrowDown:-1,ArrowLeft:-1,PageUp:10,PageDown:-10}[e.key];if(delta===undefined)return;next=current+delta;}
 e.preventDefault();setTwist(next);markPersonal();
});
setTwist(35);setLight(45);updateStudyView();

function composePoster(sculpture,title){
 const poster=document.createElement('canvas');poster.width=1200;poster.height=1500;const context=poster.getContext('2d');if(!context)throw Error('The print canvas is unavailable.');
 context.fillStyle=scene.bg;context.fillRect(0,0,1200,1500);context.fillStyle=scene.text;context.textBaseline='alphabetic';
 context.font='600 104px Helvetica, Arial, sans-serif';context.fillText('form',72,150);
 context.font='24px Helvetica, Arial, sans-serif';context.fillText('A sculpture study by you',74,204);
 let fontSize=64;context.font=`400 ${fontSize}px Helvetica, Arial, sans-serif`;
 while(context.measureText(title).width>1056&&fontSize>22){fontSize-=2;context.font=`400 ${fontSize}px Helvetica, Arial, sans-serif`;}
 context.fillText(title,72,306);
 // Draw immediately before copying: no persistent drawing buffer or stale screenshot.
 sculpture.copyTo(context,48,342,1104,930);
 context.strokeStyle=scene.text;context.globalAlpha=.3;context.lineWidth=1;context.beginPath();context.moveTo(72,1310);context.lineTo(1128,1310);context.stroke();context.globalAlpha=1;
 context.font='28px Helvetica, Arial, sans-serif';context.fillText(`${names[sculpture.shape]} / ${materials[sculpture.material].name}`,72,1368);
 context.font='22px Helvetica, Arial, sans-serif';context.fillText('Made in the FORM playground',72,1420);
 return poster;
}
const savePrint=document.querySelector('#save-print');
savePrint.addEventListener('click',()=>{
 if(savingPrint||!lab.available)return;savingPrint=true;updatePause();savePrint.setAttribute('aria-busy','true');document.querySelector('#save-label').textContent='Preparing print…';printStatus.textContent='Preparing your sculpture print.';delete printStatus.dataset.error;
 const title=studyTitle.value.trim()||studyName;
 const finish=error=>{savingPrint=false;savePrint.setAttribute('aria-busy','false');document.querySelector('#save-label').textContent='Save print';updatePause();if(error){printStatus.dataset.error='true';printStatus.textContent='The print could not be saved. Try again in a WebGL-enabled browser.';}else{printStatus.textContent='Your print is ready. Check your downloads.';savePrint.dataset.state='done';setTimeout(()=>{delete savePrint.dataset.state;},1600);}};
 try{
  const poster=composePoster(lab,title);
  poster.toBlob(blob=>{
   if(!blob){finish(true);return;}
   let url;
   try{url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;const slug=title.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'my-study';link.download=`form-${slug}.png`;document.body.append(link);link.click();link.remove();finish(false);}
   catch{finish(true);}
   finally{if(url)setTimeout(()=>URL.revokeObjectURL(url),1000);}
  },'image/png');
 }catch{finish(true);}
});
// Share link: the displayed pose, the slider values and the target form, plus the typed title.
function studyHash(){
 const y=((lab.y%TAU)+TAU)%TAU,title=studyTitle.value.trim();
 const hash=`#study=v1.${lab.shape}.${lab.material}.${sceneKeys.indexOf(sceneKey)}.${Number(tension.value)}.${Number(light.value)}.${lab.targetLobes}.${Math.round(lab.targetWave*10)}.${Math.round(lab.x*100)}.${Math.round(y*100)}`;
 return title?`${hash}&name=${encodeURIComponent(title)}`:hash;
}
const copyLink=document.querySelector('#copy-link');let copyTimer=0;
copyLink.addEventListener('click',async()=>{
 try{history.replaceState(null,'',studyHash());}catch{}
 let copied=false;
 try{if(navigator.clipboard&&typeof navigator.clipboard.writeText==='function'){await navigator.clipboard.writeText(location.href);copied=true;}}catch{copied=false;}
 clearTimeout(copyTimer);
 if(copied){setStatus('Link copied. Anyone who opens it sees this sculpture.');copyLink.dataset.state='done';copyTimer=setTimeout(()=>{delete copyLink.dataset.state;},1600);}
 else{delete copyLink.dataset.state;setStatus('The address bar now holds this sculpture\'s link. Copy it from there.');}
});
// Opening a link restores its exact parameters immediately; the name is not recast.
function applyStudy(study){
 clearTimeout(castTimer);castTimer=0;
 lab.select(study.shape);lab.morph=1;
 lab.setMaterial(study.material);const m=materials[study.material];lab.color=[...m.color];lab.metal=m.metal;lab.roughness=m.roughness;lab.materialProgress=1;
 setTwist(study.twist,true);setLight(study.light);lab.light=lab.targetLight;
 labStage.style.transition='none';setScene(study.scene);void labStage.offsetWidth;labStage.style.transition='';
 lab.setForm(study.lobes,study.wave,true);
 lab.tx=lab.x=study.x;lab.ty=lab.y=study.y;lab.velocity=0;
 studyTitle.value=study.name;studyName=`${names[study.shape]} study`;
 // The readout still names the word's own cast; "adjusted" when the link's form differs from it.
 cast=castWord(study.name);castKey=cast?normalizeWord(study.name):'';
 castAdjusted=!!cast&&['shape','material','scene','twist','light','lobes','wave'].some(k=>cast[k]!==study[k]);
 updateStudyView();updateReadout();lab.request();
 setStatus(study.name?`You opened “${study.name}”. Make it yours, or cast your own word.`:'You opened a shared sculpture. Make it yours, or cast your own word.');
 document.querySelector('#experiment').scrollIntoView({behavior:'instant',block:'start'});
}
function openStudyFromHash(){const study=parseStudy(location.hash);if(study)applyStudy(study);}
window.addEventListener('hashchange',openStudyFromHash);
const theme=document.querySelector('#theme');
function updateTheme(){const dark=document.documentElement.dataset.theme?document.documentElement.dataset.theme==='dark':systemTheme.matches;theme.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} theme`);theme.dataset.dark=String(dark);syncThemeColor();}
theme.addEventListener('click',()=>{const dark=document.documentElement.dataset.theme?document.documentElement.dataset.theme==='dark':systemTheme.matches;document.documentElement.dataset.theme=dark?'light':'dark';try{localStorage.setItem('form-theme',document.documentElement.dataset.theme);}catch{}updateTheme();});
systemTheme.addEventListener('change',updateTheme);updateTheme();
// System motion preference suspends movement without erasing the visitor's pause choice.
reducedMotion.addEventListener('change',()=>{for(const s of allSculptures){s.velocity=0;s.hovered=false;s.request();}updatePause();});
finePointer.addEventListener('change',()=>{if(!finePointer.matches)for(const s of previews){s.hovered=false;s.request();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseHandle();for(const s of allSculptures){if(document.hidden){cancelAnimationFrame(s.frame);s.frame=0;}else{s.last=0;s.request();}}});
openStudyFromHash();
