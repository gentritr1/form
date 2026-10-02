/* FORM exhibition edition. Original geometry and dependency-free WebGL rendering. */
'use strict';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
// Empty layers is the frozen baseline. Each depth package remains independently comparable.
const depthLayers=new Set(((typeof location.search==='string'?location.search:'').match(/[?&]layers=([^&]*)/)?.[1]||'').split(','));
const shadowEnabled=depthLayers.has('shadow');
const adaptiveEnabled=depthLayers.has('adaptive');
const roomEnabled=depthLayers.has('room');
const constructionEnabled=depthLayers.has('construction');
const castEnabled=depthLayers.has('cast');
const parameterEnabled=constructionEnabled||castEnabled;
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
let vertexSource = `
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
let fragmentSource = `
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
if(shadowEnabled){
 vertexSource=vertexSource.replace('varying vec3 vNormal, vPosition, vLocal;','uniform float uPass,uGround,uLight;\nvarying vec3 vNormal, vPosition, vLocal;').replace('vPosition=p;vNormal=',`if(uPass>.5){vec3 key=normalize(vec3(-2.*cos(uLight),3.,3.+sin(uLight)));p-=key*((p.y-uGround)/key.y);}\n vPosition=p;vNormal=`);
 fragmentSource=fragmentSource.replace('uniform vec3 uColor;','uniform float uPass;\nuniform vec3 uColor;').replace('void main(){','void main(){\n if(uPass>.5){gl_FragColor=vec4(0.,0.,0.,1.);return;}');
}
if(roomEnabled){
 vertexSource=vertexSource.replace('attribute vec3 aPosition, aNormal, aTarget, aTargetNormal;','attribute vec3 aPosition, aNormal, aTarget, aTargetNormal, aTangent, aTargetTangent;').replace('varying vec3 vNormal, vPosition, vLocal;','varying vec3 vNormal, vPosition, vLocal, vTangent;').replace('vPosition=p;vNormal=',`vec3 along=mix(aTangent,aTargetTangent,uMorph);along=length(along)>.001?normalize(along):tangent;vTangent=rotation(normalize(deform(base+along*.002)-local));\n vPosition=p;vNormal=`);
 fragmentSource=fragmentSource.replace('varying vec3 vNormal,vPosition,vLocal;','varying vec3 vNormal,vPosition,vLocal,vTangent;').replace('uniform vec3 uColor;','uniform vec3 uColor,uRoom,uAccent;');
 fragmentSource=fragmentSource.replace('return env+vec3(4.5,4.2,3.8)*key+vec3(4.,4.5,5.)*panel+vec3(1.7,2.,2.3)*rim+vec3(.52,.55,.6)*lower;',`return env*mix(vec3(.6),uRoom,.4)+mix(vec3(4.5,4.2,3.8),vec3(3.9)+uRoom, .35)*key+mix(vec3(4.,4.5,5.),vec3(3.8)+uRoom,.4)*panel+(uAccent*2.+uRoom*.7+vec3(.3))*rim+(uRoom*.65+uAccent*.1)*lower;`);
 fragmentSource=fragmentSource.replace('vec3 directLight(',`float surfaceRoughness(){float chrome=uMetal*(1.-smoothstep(.02,.3,uColor.r-uColor.b));float variation=sin(vLocal.x*13.7+sin(vLocal.z*9.2))*sin(vLocal.y*11.3);return clamp(uRoughness*(1.+chrome*.1*variation),.06,1.);}\nvec3 directLight(`);
 fragmentSource=fragmentSource.replace('float a=uRoughness*uRoughness;float a2=a*a;float denom=nh*nh*(a2-1.)+1.;\n float D=a2/max(PI*denom*denom,.001);\n float k=pow(uRoughness+1.,2.)/8.;float G=(nv/(nv*(1.-k)+k))*(nl/(nl*(1.-k)+k));',`float rough=surfaceRoughness(),a=rough*rough;
 float copper=uMetal*smoothstep(.02,.3,uColor.r-uColor.b);
 vec3 tangent=vTangent-n*dot(vTangent,n);vec3 t=length(tangent)>.0001?normalize(tangent):normalize(cross(n,abs(n.y)>.8?vec3(1.,0.,0.):vec3(0.,1.,0.)));vec3 b=cross(n,t);
 float ax=max(.008,a*mix(1.,.45,copper)),ay=max(.008,a*mix(1.,1.6,copper));
 float denominator=pow(dot(h,t)/ax,2.)+pow(dot(h,b)/ay,2.)+nh*nh;
 float D=1./max(PI*ax*ay*denominator*denominator,.0001);
 float gv=2./(1.+sqrt(1.+(pow(ax*dot(v,t),2.)+pow(ay*dot(v,b),2.))/(nv*nv)));
 float gl=2./(1.+sqrt(1.+(pow(ax*dot(l,t),2.)+pow(ay*dot(l,b),2.))/max(nl*nl,.0001)));
 float G=gv*gl;`);
 fragmentSource=fragmentSource.replace('float grain=sin(vLocal.y*510.+vLocal.x*7.)*.004*uMetal;\n n=normalize(n+vec3(grain,0.,grain*.5));','');
 fragmentSource=fragmentSource.replace('float occlusion=.78+',`float coat=(.04+.96*pow(1.-nv,5.))*(1.-uMetal);color=color*(1.-coat)+environment(r)*coat*.65;\n float occlusion=.78+`);
}
if(constructionEnabled){
 const parametric=`
 uniform float uBuildShape,uSweep,uRadius,uModulation,uProcedural,uTerm,uCurveMode,uCurveAlpha;
 attribute vec3 aParameter;
 varying float vCap;
 vec3 path(float u){
  if(uBuildShape<.5){float r=2.+(1.+uTerm)*cos(3.*u);return vec3(r*cos(2.*u),r*sin(2.*u),sin(3.*u))*.47;}
  float r=1.03+.09*uModulation*(1.+uTerm)*cos(u*5.);return vec3(r*cos(u),r*sin(u),.2*uModulation*sin(u*3.));
 }
 vec3 buildSurface(float u,float v){
  if(uBuildShape>1.5){float theta=v*.5;float r=uRadius*1.24*(1.+.15*uModulation*(1.+uTerm)*cos(u*8.)*pow(sin(theta),2.)+.085*uModulation*cos(theta*12.));return r*vec3(sin(theta)*cos(u),cos(theta),sin(theta)*sin(u));}
  vec3 c=path(u);
  if(uBuildShape<.5){vec3 tangent=normalize(path(u+.001)-c);vec3 b=normalize(cross(tangent,vec3(0.,0.,1.)));vec3 n=cross(b,tangent);return c+uRadius*(.26+.018*uModulation*sin(u*6.))*(cos(v)*n+sin(v)*b);}
  float tube=uRadius*(.36+.055*uModulation*sin(u*5.));return c+vec3(tube*cos(v)*cos(u),tube*cos(v)*sin(u),tube*sin(v));
 }
 `;
 vertexSource=parametric+vertexSource.replace('atan(p.z,p.x)*uLobes','(length(p.xz)>.000001?atan(p.z,p.x):0.)*uLobes');
 vertexSource=vertexSource.replace('vec3 normal=mix(aNormal,aTargetNormal,uMorph);',`vec3 normal=mix(aNormal,aTargetNormal,uMorph);
 vCap=step(.5,aParameter.z);
 if(uProcedural>.5||uCurveMode>.5){
  float u=aParameter.x*6.28318530718*max(.001,uSweep),v=aParameter.y*6.28318530718;
  base=buildSurface(u,v);vec3 du=buildSurface(u+.0003,v)-base,dv=buildSurface(u,v+.0003)-base;
  normal=cross(du,dv);normal=length(normal)>.000000000001?normalize(normal):normalize(base);
  if(aParameter.z>.5){
   vec3 along=uBuildShape>1.5?vec3(-sin(u),0.,cos(u)):normalize(path(u+.001)-path(u));
   normal=along*(aParameter.x>.5?1.:-1.);
   if(aParameter.z>2.5)base=uBuildShape>1.5?vec3(0.):path(u);
  }
  if(uCurveMode>.5){float t=aParameter.x*6.28318530718;base=uBuildShape>1.5?vec3(1.24*sin(t*.5),1.24*cos(t*.5),0.):path(t);normal=normalize(base);}
 }`);
 if(roomEnabled)vertexSource=vertexSource.replace('vec3 along=mix(aTangent,aTargetTangent,uMorph);','vec3 along=mix(aTangent,aTargetTangent,uMorph);if(uProcedural>.5){float u=aParameter.x*6.28318530718*max(.001,uSweep),v=aParameter.y*6.28318530718;along=buildSurface(u+.0003,v)-buildSurface(u,v);along=length(along)>.00000001?normalize(along):tangent;}');
 fragmentSource=fragmentSource.replace('void main(){',`uniform float uProcedural,uCurveMode,uCurveAlpha,uSweep;varying float vCap;
 void main(){
 if(vCap>.5&&(uProcedural<.5||uSweep>=1.))discard;
 if(uCurveMode>.5){gl_FragColor=vec4(uColor*uCurveAlpha,uCurveAlpha);return;}`);
}
if(castEnabled){
 if(!constructionEnabled)vertexSource='attribute vec3 aParameter;\n'+vertexSource;
 vertexSource='varying float vCastU;\n'+vertexSource.replace('void main(){','void main(){vCastU=aParameter.x;');
 // Material functions share these globals, assigned before any lighting work in main.
 fragmentSource=fragmentSource.replace(/\buColor\b/g,'mColor').replace(/\buMetal\b/g,'mMetal').replace(/\buRoughness\b/g,'mRoughness');
 fragmentSource=fragmentSource.replace(/uniform vec3 mColor([^;]*);/,'uniform vec3 uColor$1;vec3 mColor;').replace('uniform float mMetal,mRoughness,uLight;','uniform float uMetal,uRoughness,uLight;float mMetal,mRoughness;');
 fragmentSource=fragmentSource.replace('void main(){',`uniform sampler2D uCastField;uniform float uCastActive;varying float vCastU;
 void main(){
 mColor=uColor;mMetal=uMetal;mRoughness=uRoughness;
 if(uCastActive>.5){
  float x=(clamp(vCastU,0.,1.)*128.+.5)/129.;vec4 field=texture2D(uCastField,vec2(x,.25));vec4 thermal=texture2D(uCastField,vec2(x,.75));
  mColor=mix(field.rgb,vec3(1.,.19,.025),thermal.g*.8);mMetal=thermal.r;mRoughness=mix(field.a,.82,thermal.g);
 }`);
 fragmentSource=fragmentSource.replace('float occlusion=.78+','color+=vec3(1.,.12,.012)*max(0.,mRoughness-.5)*2.;\n float occlusion=.78+');
}
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
 const positions=[], normals=[], indices=[],tangents=[],parameters=[];
 for(let i=0;i<=NU;i++) for(let j=0;j<=NV;j++) {
  const u=i/NU*TAU, v=j/NV*TAU, p=surface(shape,u,v);
  const du=surface(shape,u+.0003,v), dv=surface(shape,u,v+.0003);
  let n=normalize(cross(du.map((x,k)=>x-p[k]),dv.map((x,k)=>x-p[k])));
  if(Math.hypot(...n)<.5)n=normalize(p);
  positions.push(...p); normals.push(...n);
  if(roomEnabled)tangents.push(...normalize(du.map((x,k)=>x-p[k])));
  if(parameterEnabled)parameters.push(i/NU,j/NV,0);
 }
 for(let i=0;i<NU;i++) for(let j=0;j<NV;j++) {
  const a=i*(NV+1)+j,b=a+NV+1;indices.push(a,b,a+1,a+1,b,b+1);
 }
 if(constructionEnabled)for(let end=0;end<2;end++){
  const start=positions.length/3;
  for(let j=0;j<=NV;j++){positions.push(...surface(shape,end*TAU,j/NV*TAU));normals.push(0,0,1);if(roomEnabled)tangents.push(1,0,0);parameters.push(end,j/NV,end+1);}
  const center=positions.length/3;positions.push(0,0,0);normals.push(0,0,1);if(roomEnabled)tangents.push(1,0,0);parameters.push(end,0,end+3);
  for(let j=0;j<NV;j++)indices.push(center,start+j,start+j+1);
 }
 return { positions:new Float32Array(positions), normals:new Float32Array(normals), indices:new Uint16Array(indices), tangents:new Float32Array(tangents),parameters:new Float32Array(parameters) };
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
// One invisible GPU canvas, immediately copied to visible 2D placeholders. The copy is
// synchronous with each draw, so neither display nor poster needs preserveDrawingBuffer.
// A retarget retracts the current sweep/radius before tracing the new generator. Every
// intermediate surface retains end caps; no hole is exposed while the sweep is incomplete.
class Construction {
 constructor(shape){this.shape=shape;this.target=shape;this.phase='settled';this.sweep=1;this.radius=1;this.modulation=1;this.curve=0;this.curveAlpha=0;}
 targetShape(shape,time,reduced=false){
  this.target=shape;
  if(reduced){this.snap(shape);return;}
  if(this.phase==='retract')return;
  this.from={sweep:this.sweep,radius:this.radius,modulation:this.modulation,curveAlpha:this.curveAlpha};this.start=time;this.phase='retract';
 }
 snap(shape=this.target){this.shape=this.target=shape;this.phase='settled';this.sweep=this.radius=this.modulation=1;this.curve=this.curveAlpha=0;}
 update(time,reduced=false){
  if(reduced){this.snap();return false;}if(this.phase==='settled')return false;
  if(this.phase==='retract'){
   const t=easeOut((time-this.start)/240);this.sweep=Math.max(.001,this.from.sweep*(1-t));this.radius=Math.max(.001,this.from.radius*(1-t));this.curveAlpha=this.from.curveAlpha*(1-t);
   if(t===1){this.shape=this.target;this.phase='assemble';this.start=time;this.seek(0);this.phase='assemble';}return true;
  }
  this.seek((time-this.start)/920);this.phase='assemble';if(time-this.start>=920){this.snap();return false;}return true;
 }
 seek(progress){
  const ms=Math.max(0,Math.min(1,progress))*920;this.phase='scrub';
  this.sweep=ms<200?.001:.001+.999*easeOut((ms-200)/500);
  this.radius=ms<200?.025:.025+.975*easeOut((ms-200)/500);
  this.modulation=easeOut((ms-700)/220);this.curve=easeOut(ms/200);this.curveAlpha=1-easeOut((ms-200)/500);
 }
}
// CPU mirror used only for bounds and invariant tests; animation positions/normals run on the GPU.
function constructionPoint(build, u, v, term=0, cap=0){
 const shape=build.shape,mod=build.modulation;
 const path=t=>{if(shape===0){const r=2+(1+term)*Math.cos(3*t);return [r*Math.cos(2*t)*.47,r*Math.sin(2*t)*.47,Math.sin(3*t)*.47];}const r=1.03+.09*mod*(1+term)*Math.cos(t*5);return [r*Math.cos(t),r*Math.sin(t),.2*mod*Math.sin(t*3)];};
 if(cap>2.5)return shape===2?[0,0,0]:path(u);
 if(shape===2){const theta=v/2,r=build.radius*1.24*(1+.15*mod*(1+term)*Math.cos(u*8)*Math.sin(theta)**2+.085*mod*Math.cos(theta*12));return [r*Math.sin(theta)*Math.cos(u),r*Math.cos(theta),r*Math.sin(theta)*Math.sin(u)];}
 const c=path(u);
 if(shape===0){const tangent=normalize(path(u+.001).map((n,i)=>n-c[i])),b=normalize(cross(tangent,[0,0,1])),n=cross(b,tangent),tube=build.radius*(.26+.018*mod*Math.sin(u*6));return c.map((p,i)=>p+tube*(Math.cos(v)*n[i]+Math.sin(v)*b[i]));}
 const tube=build.radius*(.36+.055*mod*Math.sin(u*5));return [c[0]+tube*Math.cos(v)*Math.cos(u),c[1]+tube*Math.cos(v)*Math.sin(u),c[2]+tube*Math.sin(v)];
}

// The shadow support plane uses the same vertices as the GPU. Cache cross-section
// trigonometry and evaluate the generating frame once per ring, without per-vertex arrays.
const constructionSections=constructionEnabled?Array.from({length:NV+1},(_,j)=>{const v=j/NV*TAU;return [Math.cos(v),Math.sin(v),Math.cos(v/2),Math.sin(v/2),Math.cos(v*6)];}):[];
function visitConstruction(build,term,visit,step=1){
 const mod=build.modulation,shape=build.shape;
 for(let i=0;i<=NU;i+=step){
  const u=i/NU*TAU*Math.max(.001,build.sweep),cu=Math.cos(u),su=Math.sin(u);
  if(shape===2){
   const folds=.15*mod*(1+term)*Math.cos(8*u);
   for(let j=0;j<=NV;j+=step){const section=constructionSections[j],ct=section[2],st=section[3],r=build.radius*1.24*(1+folds*st*st+.085*mod*section[4]);visit(r*st*cu,r*ct,r*st*su,i,j);}
   continue;
  }
  let x,y,z,nx,ny,nz,bx,by,tube;
  if(shape===0){
   const r=2+(1+term)*Math.cos(3*u),next=u+.001,nr=2+(1+term)*Math.cos(3*next);
   x=r*Math.cos(2*u)*.47;y=r*Math.sin(2*u)*.47;z=Math.sin(3*u)*.47;
   let tx=nr*Math.cos(2*next)*.47-x,ty=nr*Math.sin(2*next)*.47-y,tz=Math.sin(3*next)*.47-z;
   const length=Math.hypot(tx,ty,tz);tx/=length;ty/=length;tz/=length;
   const flat=Math.hypot(tx,ty);bx=ty/flat;by=-tx/flat;nx=by*tz;ny=-bx*tz;nz=bx*ty-by*tx;
   tube=build.radius*(.26+.018*mod*Math.sin(6*u));
  }else{
   const r=1.03+.09*mod*(1+term)*Math.cos(5*u);x=r*cu;y=r*su;z=.2*mod*Math.sin(3*u);tube=build.radius*(.36+.055*mod*Math.sin(5*u));
   nx=cu;ny=su;nz=0;bx=by=0;
  }
  for(let j=0;j<=NV;j+=step){const section=constructionSections[j],c=section[0],s=section[1];visit(x+tube*(c*nx+s*bx),y+tube*(c*ny+s*by),z+tube*(c*nz+(shape===1?s:0)),i,j);}
  if(i===0||i===NU)visit(x,y,z);
 }
 if(shape===2)visit(0,0,0);
}

// A periodic material field on the surface parameter. Retargets keep the exact last
// uploaded bytes, including residual heat; no animation completion owns application state.
class CastFront {
 constructor(material){this.size=129;this.data=new Uint8Array(this.size*8);this.snap(material);}
 snap(material=this.target){this.target=material;this.active=false;const m=materials[material];for(let i=0;i<this.size;i++){const a=i*4,b=(this.size+i)*4;for(let c=0;c<3;c++)this.data[a+c]=Math.round(m.color[c]*255);this.data[a+3]=Math.round(m.roughness*255);this.data[b]=Math.round(m.metal*255);this.data[b+1]=0;}this.from=this.data.slice();}
 retarget(material,time,reduced=false){if(reduced){this.snap(material);return;}this.from=this.data.slice();this.target=material;this.start=time;this.active=true;}
 update(time,reduced=false){
  if(!this.active)return false;if(reduced||time-this.start>=1450){this.snap();return false;}
  const elapsed=Math.max(0,time-this.start),m=materials[this.target];
  for(let i=0;i<this.size;i++){
   // The fill divides at u=0 and meets at u=.5, so the periodic seam is identical.
   const distance=Math.min(i/(this.size-1),1-i/(this.size-1))*2,age=elapsed-distance*850;
   const fill=easeOut(age/100),heat=fill*(1-easeOut((age-100)/500));
   const a=i*4,b=(this.size+i)*4;
   for(let c=0;c<3;c++)this.data[a+c]=Math.round(this.from[a+c]+(m.color[c]*255-this.from[a+c])*fill);
   this.data[a+3]=Math.round(this.from[a+3]+(m.roughness*255-this.from[a+3])*fill);
   this.data[b]=Math.round(this.from[b]+(m.metal*255-this.from[b])*fill);
   this.data[b+1]=Math.round(Math.max(this.from[b+1]*(1-easeOut(elapsed/600)),heat*255));
  }
  return true;
 }
}

class ResolutionBudget {
 constructor(){this.value=1.5;this.average=0;this.samples=0;this.last=new Map();this.active=new Set();}
 observe(client,time){
  const previous=this.last.get(client);this.last.set(client,time);
  if(previous===undefined||time<=previous)return false;
  const interval=Math.min(250,time-previous);this.average=this.average?this.average*.8+interval*.2:interval;
  if(++this.samples>=8&&this.average>1000/60&&this.value>.75){this.value=Math.max(.75,this.value-.25);this.samples=0;this.average=0;return true;}return false;
 }
 finish(client,moving){
  if(moving)this.active.add(client);else{this.active.delete(client);this.last.delete(client);}
  if([...this.active].some(s=>s.visible&&s.available))return false;
  this.active.clear();this.last.clear();this.average=0;this.samples=0;
  if(this.value!==1.5){this.value=1.5;return true;}return false;
 }
}
class SharedRenderer {
 constructor(){
  this.canvas=document.createElement('canvas');this.clients=new Set();this.ready=false;
  this.direct=depthLayers.has('direct')||shadowEnabled||adaptiveEnabled||roomEnabled||parameterEnabled;this.live=false;this.layoutDirty=true;this.resolution=new ResolutionBudget();
  const options={alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:this.direct};
  this.gl=/[?&]webgl=1(?:&|$)/.test(location.search||'')?null:this.canvas.getContext('webgl2',options);
  this.webgl2=!!this.gl;
  if(!this.gl)this.gl=this.canvas.getContext('webgl',options);
  if(this.direct){
   this.canvas.setAttribute('aria-hidden','true');this.canvas.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:1';document.body.append(this.canvas);
   const invalidate=()=>{this.layoutDirty=true;for(const s of this.clients)s.request();};
   window.addEventListener('scroll',invalidate,{passive:true});window.addEventListener('resize',invalidate);
  }
  this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.ready=false;for(const s of this.clients){cancelAnimationFrame(s.frame);s.frame=0;s.last=0;s.velocity=0;s.dragging=false;s.unavailable();}});
  this.canvas.addEventListener('webglcontextrestored',()=>{
   try{this.initialize();for(const s of this.clients){s.initialize();s.available=true;s.canvas.style.visibility='';const fallback=s.canvas.parentElement.querySelector('.fallback');if(fallback)fallback.hidden=true;s.syncAvailability();s.request();}}
   catch(error){console.error('Shared renderer:',error.message);for(const s of this.clients)s.unavailable();}
  });
 }
 initialize(){
  if(this.ready)return;
  const gl=this.gl;if(!gl)throw Error('WebGL is unavailable.');
  const source=(text,vertex)=>this.webgl2?'#version 300 es\n'+text.replace(/attribute /g,'in ').replace(/varying /g,vertex?'out ':'in ').replace('precision highp float;','precision highp float;\nout vec4 fragmentColor;').replace(/gl_FragColor/g,'fragmentColor').replace(/texture2D/g,'texture'):text;
  const compile=(type,text)=>{const shader=gl.createShader(type);gl.shaderSource(shader,text);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;};
  const vs=compile(gl.VERTEX_SHADER,source(vertexSource,true)),fs=compile(gl.FRAGMENT_SHADER,source(fragmentSource,false));
  this.program=gl.createProgram();gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);gl.deleteShader(vs);gl.deleteShader(fs);
  if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));
  this.uniforms={};for(const n of ['uX','uY','uAspect','uScale','uMorph','uTension','uLobes','uWave','uRipple','uColor','uMetal','uRoughness','uLight'])this.uniforms[n]=gl.getUniformLocation(this.program,n);
  if(shadowEnabled)for(const n of ['uPass','uGround'])this.uniforms[n]=gl.getUniformLocation(this.program,n);
  if(roomEnabled)for(const n of ['uRoom','uAccent'])this.uniforms[n]=gl.getUniformLocation(this.program,n);
  if(castEnabled)for(const n of ['uCastField','uCastActive'])this.uniforms[n]=gl.getUniformLocation(this.program,n);
  if(constructionEnabled)for(const n of ['uBuildShape','uSweep','uRadius','uModulation','uProcedural','uTerm','uCurveMode','uCurveAlpha'])this.uniforms[n]=gl.getUniformLocation(this.program,n);
  this.attributes={};for(const n of ['aPosition','aNormal','aTarget','aTargetNormal',...(roomEnabled?['aTangent','aTargetTangent']:[]),...(parameterEnabled?['aParameter']:[])])this.attributes[n]=gl.getAttribLocation(this.program,n);
  this.meshBuffers=new Map();
  this.meshKeys=['positions','normals',...(roomEnabled?['tangents']:[])];
  for(const mesh of meshes){const buffers={};for(const key of this.meshKeys){buffers[key]=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffers[key]);gl.bufferData(gl.ARRAY_BUFFER,mesh[key],gl.STATIC_DRAW);}this.meshBuffers.set(mesh,buffers);}
  this.index=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.index);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,meshes[0].indices,gl.STATIC_DRAW);
  this.dynamic=Object.fromEntries(this.meshKeys.map(key=>[key,gl.createBuffer()]));this.dynamicMesh=null;
  if(parameterEnabled){this.parameter=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.parameter);gl.bufferData(gl.ARRAY_BUFFER,meshes[0].parameters,gl.STATIC_DRAW);this.curveIndex=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.curveIndex);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(Array.from({length:NU+1},(_,i)=>i*(NV+1))),gl.STATIC_DRAW);}
  const ext=this.webgl2?null:gl.getExtension('OES_vertex_array_object');
  this.vao=this.webgl2?gl.createVertexArray():ext?ext.createVertexArrayOES():null;
  this.bindVAO=()=>{if(this.webgl2)gl.bindVertexArray(this.vao);else if(ext)ext.bindVertexArrayOES(this.vao);};
  if(shadowEnabled)this.shadow=new ContactShadow(gl,this.webgl2);
  if(castEnabled){this.castTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.castTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,129,2,0,gl.RGBA,gl.UNSIGNED_BYTE,null);for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.LINEAR);for(const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);gl.activeTexture(gl.TEXTURE0);}
  gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);this.ready=true;
 }
 mesh(mesh){
  if(this.meshBuffers.has(mesh))return this.meshBuffers.get(mesh);
  if(this.dynamicMesh!==mesh){for(const key of this.meshKeys){this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.dynamic[key]);this.gl.bufferData(this.gl.ARRAY_BUFFER,mesh[key],this.gl.DYNAMIC_DRAW);}this.dynamicMesh=mesh;}
  return this.dynamic;
 }
 bind(s,w,h){
  this.bindVAO();const from=this.mesh(s.currentMesh),to=this.mesh(s.targetMesh);
  s.buffers={aPosition:from.positions,aNormal:from.normals,aTarget:to.positions,aTargetNormal:to.normals};
  if(roomEnabled){s.buffers.aTangent=from.tangents;s.buffers.aTargetTangent=to.tangents;}
  if(parameterEnabled)s.buffers.aParameter=this.parameter;
  if(this.direct&&this.live){
   const dpr=Math.min(devicePixelRatio||1,this.resolution.value),width=Math.round(innerWidth*dpr),height=Math.round(innerHeight*dpr);
   if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;this.layoutDirty=true;}
   if(this.layoutDirty){this.gl.disable(this.gl.SCISSOR_TEST);this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);for(const client of this.clients){client.viewRect=client.canvas.getBoundingClientRect();client.request();}this.layoutDirty=false;}
   const r=s.viewRect||s.canvas.getBoundingClientRect();
   this.viewport=[Math.round(r.left*dpr),Math.round((innerHeight-r.top-r.height)*dpr),Math.round(r.width*dpr),Math.round(r.height*dpr)];
   this.gl.enable(this.gl.SCISSOR_TEST);this.gl.scissor(...this.viewport);
  }else{
   this.gl.disable(this.gl.SCISSOR_TEST);this.viewport=[0,0,w,h];
   if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
   if(this.direct)this.layoutDirty=true;
  }
 }
 present(s,w,h){if(!this.direct){s.display.clearRect(0,0,w,h);s.display.drawImage(this.canvas,0,0,w,h);}}
}
// Reduced-resolution actual silhouette projected along the same key used for shading.
class ContactShadow {
 constructor(gl,webgl2){
  this.gl=gl;this.size=256;
  this.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.texture);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,this.size,this.size,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.LINEAR);
  for(const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);
  this.fbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,this.fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,this.texture,0);
  if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Shadow framebuffer unavailable.');gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  this.softTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.softTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,this.size,this.size,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.LINEAR);
  for(const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);
  this.softFbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,this.softFbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,this.softTexture,0);
  if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Blur framebuffer unavailable.');gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  let vs='attribute vec2 aQuad;varying vec2 uv;void main(){uv=aQuad*.5+.5;gl_Position=vec4(aQuad,0.,1.);}';
  let fs='precision highp float;varying vec2 uv;uniform sampler2D uMask;uniform float uBlur;void main(){if(uBlur<.5){gl_FragColor=texture2D(uMask,uv);return;}float alpha=0.;float total=0.;for(int x=-2;x<=2;x++){for(int y=-2;y<=2;y++){float weight=exp(-float(x*x+y*y)*.35);alpha+=texture2D(uMask,uv+vec2(float(x),float(y))*.008).a*weight;total+=weight;}}gl_FragColor=vec4(0.,0.,0.,alpha/total*.28);}';
  if(webgl2){vs='#version 300 es\n'+vs.replace('attribute','in').replace('varying','out');fs='#version 300 es\n'+fs.replace('varying','in').replace('precision highp float;','precision highp float;out vec4 pixel;').replace(/texture2D/g,'texture').replace(/gl_FragColor/g,'pixel');}
  const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;};
  this.program=gl.createProgram();const vertex=compile(gl.VERTEX_SHADER,vs),fragment=compile(gl.FRAGMENT_SHADER,fs);gl.attachShader(this.program,vertex);gl.attachShader(this.program,fragment);gl.linkProgram(this.program);gl.deleteShader(vertex);gl.deleteShader(fragment);
  if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));
  this.quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  this.attribute=gl.getAttribLocation(this.program,'aQuad');this.sampler=gl.getUniformLocation(this.program,'uMask');this.blur=gl.getUniformLocation(this.program,'uBlur');
 }
 ground(s,scale){
  const tension=parameterEnabled?s.displayTension:s.tension;
  const build=constructionEnabled&&(s.construction.phase!=='settled'||s.term!==0)?s.construction:null;
  const key=[s.currentMesh,s.targetMesh,s.x,s.morph,tension,s.lobes,s.wave,s.ripple,scale,build?.shape,build?.sweep,build?.radius,build?.modulation,s.term];
  if(s.groundKey&&key.every((v,i)=>v===s.groundKey[i]))return s.groundY;
  const a=s.currentMesh.positions,b=s.targetMesh.positions,cx=Math.cos(s.x),sx=Math.sin(s.x);let min=Infinity;const candidates=[];let probing=true;
  const include=(x,y,z,u=0,v=0)=>{
   const angle=y*tension*.85,c=Math.cos(angle),sine=Math.sin(angle),dx=c*x+sine*z;z=-sine*x+c*z;x=dx;
   let fade=Math.max(0,Math.min(1,(Math.hypot(x,z)-.03*s.lobes)/.35));fade=fade*fade*(3-2*fade);
   const ripple=1+tension*.07*s.ripple*fade*Math.sin(y*s.wave+Math.atan2(z,x)*s.lobes);
   const height=(y*cx-z*sx)*ripple*scale;if(height<min)min=height;
   if(probing&&(candidates.length<12||height<candidates[candidates.length-1].height)){candidates.push({height,u,v});candidates.sort((a,b)=>a.height-b.height);if(candidates.length>12)candidates.pop();}
  };
  // A half-density support probe locates the floor; the silhouette still draws every
  // triangle. The extra 0.005 clearance covers the measured support-probe error.
  if(build)visitConstruction(build,s.term,include,2);
  else for(let u=0;u<=NU;u+=2)for(let v=0;v<=NV;v+=2){const i=(u*(NV+1)+v)*3;include(a[i]+(b[i]-a[i])*s.morph,a[i+1]+(b[i+1]-a[i+1])*s.morph,a[i+2]+(b[i+2]-a[i+2])*s.morph,u,v);}
  probing=false;
  for(const candidate of candidates)for(let u=Math.max(0,candidate.u-1);u<=Math.min(NU,candidate.u+1);u++)for(let v=Math.max(0,candidate.v-1);v<=Math.min(NV,candidate.v+1);v++){
   if(build){const p=constructionPoint(build,u/NU*TAU*Math.max(.001,build.sweep),v/NV*TAU,s.term);include(...p,u,v);}
   else{const i=(u*(NV+1)+v)*3;include(a[i]+(b[i]-a[i])*s.morph,a[i+1]+(b[i+1]-a[i+1])*s.morph,a[i+2]+(b[i+2]-a[i+2])*s.morph,u,v);}
  }
  s.groundKey=key;s.groundY=min-.03;return s.groundY;
 }
 draw(s,scale){
  const gl=this.gl,manager=sharedRenderer,v=manager.viewport;
  gl.disable(gl.SCISSOR_TEST);gl.disable(gl.DEPTH_TEST);gl.bindFramebuffer(gl.FRAMEBUFFER,this.fbo);gl.viewport(0,0,this.size,this.size);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform1f(s.uniforms.uGround,this.ground(s,scale));gl.uniform1f(s.uniforms.uPass,1);s.drawGeometry(gl.TRIANGLES,meshes[0].indices.length);
  gl.bindFramebuffer(gl.FRAMEBUFFER,this.softFbo);
  // Bind no VAO while setting up the composite, preserving the shared geometry VAO.
  if(manager.webgl2)gl.bindVertexArray(null);else{const ext=gl.getExtension('OES_vertex_array_object');if(ext)ext.bindVertexArrayOES(null);}
  gl.useProgram(this.program);gl.bindBuffer(gl.ARRAY_BUFFER,this.quad);gl.enableVertexAttribArray(this.attribute);gl.vertexAttribPointer(this.attribute,2,gl.FLOAT,false,0,0);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.uniform1i(this.sampler,0);gl.uniform1f(this.blur,1);gl.drawArrays(gl.TRIANGLES,0,6);
  // Only the final single-sample alpha composite runs at the display resolution.
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(...v);gl.enable(gl.SCISSOR_TEST);gl.scissor(...v);gl.bindTexture(gl.TEXTURE_2D,this.softTexture);gl.uniform1f(this.blur,0);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.TRIANGLES,0,6);gl.disable(gl.BLEND);gl.enable(gl.DEPTH_TEST);
  manager.bindVAO();gl.useProgram(s.program);
  for(const n of Object.keys(s.buffers)){const loc=s.attributes[n];gl.bindBuffer(gl.ARRAY_BUFFER,s.buffers[n]);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);}gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,s.index);gl.uniform1f(s.uniforms.uPass,0);
 }
}
const sharedRenderer=depthLayers.has('shared')||depthLayers.has('direct')||shadowEnabled||adaptiveEnabled||roomEnabled||parameterEnabled?new SharedRenderer():null;
function cssLinear(value){
 const text=value.trim();let c;
 if(text[0]==='#'){const h=text.slice(1);c=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255);}
 else{const n=(text.match(/-?(?:\d*\.)?\d+(?:e[+-]?\d+)?/g)||[]).map(Number);
  if(text.startsWith('oklab(')){
   const [l,a,b]=n,L=(l+.3963377774*a+.2158037573*b)**3,M=(l-.1055613458*a-.0638541728*b)**3,S=(l-.0894841775*a-1.291485548*b)**3;
   return [4.0767416621*L-3.3077115913*M+.2309699292*S,-1.2684380046*L+2.6097574011*M-.3413193965*S,-.0041960863*L-.7034186147*M+1.707614701*S].map(v=>Math.max(0,Math.min(1,v)));
  }
  c=text.startsWith('color(srgb')?n.slice(0,3):n.slice(0,3).map(v=>v/255);
  if(text.startsWith('color(srgb-linear'))return c;
 }
 return c.length===3&&c.every(Number.isFinite)?c.map(v=>Math.pow(Math.max(0,v),2.2)):[.5,.5,.5];
}
function roomChanged(){if(roomEnabled)for(const s of allSculptures){s.roomUntil=performance.now()+450;s.request();}}
class Sculpture {
 constructor(canvas, shape=0, material=0, mode='preview') {
  this.canvas=canvas;this.shape=shape;this.mode=mode;this.currentMesh=meshes[shape];this.targetMesh=this.currentMesh;
  if(constructionEnabled){this.construction=new Construction(shape);this.termWeight=0;this.termTarget=0;this.termPhase=Math.PI/2;this.term=0;}
  this.x=shape===2?.15:-.38;this.y=.35;this.tx=this.x;this.ty=this.y;
  this.morph=1;this.morphStart=0;this.last=0;this.visible=false;this.frame=0;this.paused=false;
  this.dragging=false;this.velocity=0;this.hovered=false;this.tension=mode==='lab'?.35:0;this.targetTension=this.tension;this.displayTension=this.tension;this.pointerTension=false;this.light=mode==='lab'?0:.15;this.targetLight=this.light;
  if(castEnabled)this.castFront=new CastFront(material);
  this.material=material;this.color=[...materials[material].color];this.metal=materials[material].metal;this.roughness=materials[material].roughness;
  this.materialFrom={color:[...this.color],metal:this.metal,roughness:this.roughness};this.materialStart=0;this.materialProgress=1;
  // Ripple form: 5 lobes and wave 7 reproduce the original surface exactly. Lobes stay integers.
  this.lobes=5;this.targetLobes=5;this.wave=7;this.targetWave=7;this.ripple=1;
  this.display=sharedRenderer?canvas.getContext('2d'):null;
  // Direct-mode 2D placeholders remain transparent; keep their native keyboard focus outline visible.
  this.gl=sharedRenderer?sharedRenderer.gl:canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});
  if(sharedRenderer)sharedRenderer.clients.add(this);
  this.available=false;this.width=0;this.height=0;
  if(!this.gl){this.unavailable();return;}
  try{this.initialize();this.available=true;}catch(error){console.error('Sculpture:',error.message);this.unavailable();return;}
  this.resize=new ResizeObserver(entries=>{const r=entries[0].contentRect;this.width=r.width;this.height=r.height;this.request();});this.resize.observe(canvas);
  this.observer=new IntersectionObserver(([e])=>{this.visible=e.isIntersecting;if(!this.visible){cancelAnimationFrame(this.frame);this.frame=0;this.last=0;if(adaptiveEnabled)sharedRenderer.resolution.finish(this,false);}else this.request();},{rootMargin:'30px'});this.observer.observe(canvas);
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
  if(sharedRenderer){if(!this.display)throw Error('Display canvas is unavailable.');sharedRenderer.initialize();this.program=sharedRenderer.program;this.uniforms=sharedRenderer.uniforms;this.attributes=sharedRenderer.attributes;this.index=sharedRenderer.index;this.buffers={};return;}
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
  if(sharedRenderer)return;
  const gl=this.gl;const arrays={aPosition:this.currentMesh.positions,aNormal:this.currentMesh.normals,aTarget:this.targetMesh.positions,aTargetNormal:this.targetMesh.normals};
  for(const [name,data]of Object.entries(arrays)){gl.bindBuffer(gl.ARRAY_BUFFER,this.buffers[name]);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);}
 }
 select(shape) {
  if(shape===this.shape)return;
  if(constructionEnabled)this.construction.targetShape(shape,performance.now(),reducedMotion.matches);
  // Preserve the current blended surface when a visitor interrupts a morph.
  if(this.morph<1){const blend=(a,b)=>Float32Array.from(a,(v,i)=>v+(b[i]-v)*this.morph);this.currentMesh={positions:blend(this.currentMesh.positions,this.targetMesh.positions),normals:blend(this.currentMesh.normals,this.targetMesh.normals),...(roomEnabled?{tangents:blend(this.currentMesh.tangents,this.targetMesh.tangents)}:{})};}
  else this.currentMesh=this.targetMesh;
  this.shape=shape;this.targetMesh=meshes[shape];this.morph=reducedMotion.matches?1:0;this.morphStart=performance.now();this.tx=shape===2?.15:-.38;
  if(this.available)this.upload();this.request();
 }
 setMaterial(material) {
  if(castEnabled)this.castFront.retarget(material,performance.now(),reducedMotion.matches);
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
  if(adaptiveEnabled&&sharedRenderer.resolution.observe(this,time)){sharedRenderer.layoutDirty=true;for(const s of sharedRenderer.clients)s.request();}
  const dpr=Math.min(devicePixelRatio||1,this.mode==='preview'?1.25:1.5),w=Math.round(this.width*dpr),h=Math.round(this.height*dpr);if(!w||!h)return;
  const dt=this.last?Math.max(0,Math.min((time-this.last)/1000,.05)):.016;this.last=time;
  const auto=this.mode!=='preview'&&!this.paused&&!this.dragging&&!reducedMotion.matches;
  if(auto)this.ty+=dt*.105;
  if(this.hovered)this.ty+=dt*.3;
  if(!this.dragging&&!reducedMotion.matches&&Math.abs(this.velocity)>.005){this.ty+=this.velocity*dt;this.velocity*=Math.exp(-5*dt);}
  const smooth=reducedMotion.matches?1:1-Math.exp(-15*dt);
  if(constructionEnabled){
   if(!this.scrubbing)this.construction.update(time,reducedMotion.matches);
   else if(this.scrubTarget!==undefined){this.scrubValue+=(this.scrubTarget-this.scrubValue)*smooth;if(Math.abs(this.scrubTarget-this.scrubValue)<.001)this.scrubValue=this.scrubTarget;this.construction.seek(this.scrubValue);}
   if(this.onConstructionFrame)this.onConstructionFrame();
   this.termWeight+=(this.termTarget-this.termWeight)*(reducedMotion.matches?1:1-Math.exp(-25*dt));if(Math.abs(this.termWeight-this.termTarget)<.001)this.termWeight=this.termTarget;
   if(this.termWeight>0&&!reducedMotion.matches)this.termPhase+=dt*TAU/3;
   this.term=reducedMotion.matches?this.termTarget*.25:Math.sin(this.termPhase)*this.termWeight*.25;
  }
  this.x+=(this.tx-this.x)*smooth;this.y+=(this.ty-this.y)*smooth;this.light+=(this.targetLight-this.light)*smooth;
  this.tension+=(this.targetTension-this.tension)*smooth;
  if(parameterEnabled&&this.pointerTension&&!reducedMotion.matches){this.displayTension+=(this.tension-this.displayTension)*smooth;if(Math.abs(this.tension-this.displayTension)<.001){this.displayTension=this.tension;if(handlePointer===null)this.pointerTension=false;}}else this.displayTension=this.tension;
  // Ripple gate: flatten the ripple, swap the integer lobe count while it is flat, then raise it again.
  if(reducedMotion.matches){this.lobes=this.targetLobes;this.wave=this.targetWave;this.ripple=1;}
  else{
   this.wave+=(this.targetWave-this.wave)*smooth;if(Math.abs(this.targetWave-this.wave)<.001)this.wave=this.targetWave;
   if(this.lobes!==this.targetLobes){if(this.ripple<.02)this.lobes=this.targetLobes;else this.ripple-=this.ripple*smooth;}
   else{this.ripple+=(1-this.ripple)*smooth;if(1-this.ripple<.001)this.ripple=1;}
  }
  if(this.morph<1)this.morph=reducedMotion.matches?1:easeOut((time-this.morphStart)/650);
  if(this.materialProgress<1){this.materialProgress=reducedMotion.matches?1:Math.min(1,(time-this.materialStart)/220);const t=easeOut(this.materialProgress),target=materials[this.material];this.color=this.materialFrom.color.map((c,i)=>c+(target.color[i]-c)*t);this.metal=this.materialFrom.metal+(target.metal-this.materialFrom.metal)*t;this.roughness=this.materialFrom.roughness+(target.roughness-this.materialFrom.roughness)*t;}
  if(castEnabled)this.castFront.update(time,reducedMotion.matches);
  if(sharedRenderer)sharedRenderer.live=true;
  try{this.draw(w,h);}finally{if(sharedRenderer)sharedRenderer.live=false;}
  const settling=(parameterEnabled?Math.abs(this.displayTension-this.tension):0)+Math.abs(this.x-this.tx)+Math.abs(this.y-this.ty)+Math.abs(this.light-this.targetLight)+Math.abs(this.tension-this.targetTension)+Math.abs(this.wave-this.targetWave)+Math.abs(1-this.ripple)+(this.lobes!==this.targetLobes?1:0)>.001;
  const building=constructionEnabled&&((this.construction.phase!=='settled'&&!this.scrubbing)||this.termTarget>0||this.termWeight>0||(this.scrubTarget!==undefined&&Math.abs(this.scrubTarget-this.scrubValue)>.001));
  const moving=(castEnabled&&this.castFront.active)||auto||this.hovered||settling||Math.abs(this.velocity)>.005||this.morph<1||this.materialProgress<1||(roomEnabled&&time<this.roomUntil)||(building&&!reducedMotion.matches);
  if(adaptiveEnabled&&sharedRenderer.resolution.finish(this,moving)){sharedRenderer.layoutDirty=true;for(const s of sharedRenderer.clients)s.request();}
  if(moving)this.request();
 }
 // Drawing is independent of simulation, so a print preserves the exact displayed state.
 draw(w,h) {
  const gl=this.gl;
  if(sharedRenderer)sharedRenderer.bind(this,w,h);
  if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
  if(sharedRenderer)gl.viewport(...sharedRenderer.viewport);else gl.viewport(0,0,w,h);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);
  for(const n of Object.keys(this.buffers)){const loc=this.attributes[n];gl.bindBuffer(gl.ARRAY_BUFFER,this.buffers[n]);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);}
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.index);const u=this.uniforms;
  // Fit the object to the shorter viewport dimension, including portrait canvases.
  const scale=(this.mode==='hero'?1.1:this.mode==='lab'?1.05:1.02)*Math.min(1,w/h);
  gl.uniform1f(u.uX,this.x);gl.uniform1f(u.uY,this.y);gl.uniform1f(u.uAspect,w/h);gl.uniform1f(u.uScale,scale);
  gl.uniform1f(u.uMorph,this.morph);gl.uniform1f(u.uTension,parameterEnabled?this.displayTension:this.tension);gl.uniform1f(u.uLobes,this.lobes);gl.uniform1f(u.uWave,this.wave);gl.uniform1f(u.uRipple,this.ripple);gl.uniform3fv(u.uColor,this.color);gl.uniform1f(u.uMetal,this.metal);gl.uniform1f(u.uRoughness,this.roughness);gl.uniform1f(u.uLight,this.light);
  if(roomEnabled){const root=getComputedStyle(document.documentElement),background=this.mode==='hero'?getComputedStyle(document.body).backgroundColor:getComputedStyle(this.canvas.parentElement).backgroundColor;gl.uniform3fv(u.uRoom,cssLinear(background));gl.uniform3fv(u.uAccent,cssLinear(root.getPropertyValue('--accent')));}
  if(constructionEnabled){const b=this.construction;gl.uniform1f(u.uBuildShape,b.shape);gl.uniform1f(u.uSweep,b.sweep);gl.uniform1f(u.uRadius,b.radius);gl.uniform1f(u.uModulation,b.modulation);gl.uniform1f(u.uProcedural,b.phase!=='settled'||this.term!==0?1:0);gl.uniform1f(u.uTerm,this.term);gl.uniform1f(u.uCurveMode,0);gl.uniform1f(u.uCurveAlpha,b.curveAlpha);}
  if(castEnabled){gl.uniform1i(u.uCastField,1);gl.uniform1f(u.uCastActive,this.castFront.active?1:0);if(this.castFront.active){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,sharedRenderer.castTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,this.castFront.size,2,0,gl.RGBA,gl.UNSIGNED_BYTE,this.castFront.data);gl.uniform1i(u.uCastField,1);gl.activeTexture(gl.TEXTURE0);}}
  if(shadowEnabled){gl.uniform1f(u.uPass,0);sharedRenderer.shadow.draw(this,scale);}
  if(constructionEnabled&&this.construction.curveAlpha>.001){gl.uniform1f(u.uCurveMode,1);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,sharedRenderer.curveIndex);this.drawGeometry(gl.LINE_STRIP,Math.max(2,Math.round(NU*this.construction.curve)+1));gl.disable(gl.BLEND);gl.uniform1f(u.uCurveMode,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.index);}
  this.drawGeometry(gl.TRIANGLES,meshes[0].indices.length);
  if(sharedRenderer)sharedRenderer.present(this,w,h);
 }
 drawGeometry(mode,count){const gl=this.gl,u=this.uniforms;gl.uniform1f(u.uLobes,this.lobes);gl.uniform1f(u.uWave,this.wave);gl.uniform1f(u.uRipple,this.ripple);gl.drawElements(mode,count,gl.UNSIGNED_SHORT,0);}
 copyTo(context,x,y,w,h) {
  if(!this.available||this.gl.isContextLost())throw Error('The live sculpture is unavailable.');
  if(sharedRenderer?.direct){
   const width=this.canvas.width,height=this.canvas.height;
   try{this.draw(w,h);context.drawImage(sharedRenderer.canvas,x,y,w,h);}
   finally{this.canvas.width=width;this.canvas.height=height;sharedRenderer.layoutDirty=true;for(const s of sharedRenderer.clients)s.request();}
   return;
  }
  const previousWidth=this.canvas.width,previousHeight=this.canvas.height;
  try{this.draw(w,h);context.drawImage(this.canvas,x,y,w,h);}
  finally{if(previousWidth&&previousHeight)this.draw(previousWidth,previousHeight);else{this.canvas.width=previousWidth;this.canvas.height=previousHeight;}}
 }
 reset(){this.tx=this.shape===2?.15:-.38;this.ty=.35;this.velocity=0;this.request();}
}
const hero=new Sculpture(document.querySelector('#hero-canvas'),0,0,'hero');
const lab=new Sculpture(document.querySelector('#lab-canvas'),2,1,'lab');
const previews=[...document.querySelectorAll('.preview')].map(c=>new Sculpture(c,Number(c.dataset.shape),Number(c.dataset.material)));
const constructionCanvas=document.querySelector('#construction-canvas');
const constructionStudy=constructionEnabled&&constructionCanvas?new Sculpture(constructionCanvas,0,0,'preview'):null;
const allSculptures=[hero,lab,...previews,...(constructionStudy?[constructionStudy]:[])];
if(constructionStudy){
 const region=document.querySelector('#construction-study'),slider=document.querySelector('#construction-progress'),label=document.querySelector('#construction-label');region.hidden=false;
 const readout=()=>{const p=constructionStudy.scrubValue??1;const text=p<200/920?'Generating curve':p<700/920?'Sweeping the tube':p<1?'Radius modulation':'Finished surface';slider.value=String(Math.round(p*100));slider.setAttribute('aria-valuetext',text);label.textContent=text;};
 constructionStudy.onConstructionFrame=()=>{if(!constructionStudy.scrubbing)constructionStudy.scrubValue=constructionStudy.construction.phase==='settled'?1:Math.min(1,Math.max(0,(performance.now()-constructionStudy.construction.start)/920));readout();};
 let arrived=false,pointer=false;
 new IntersectionObserver(([e])=>{if(!e.isIntersecting||arrived)return;arrived=true;if(!reducedMotion.matches){constructionStudy.construction.seek(0);constructionStudy.construction.phase='assemble';constructionStudy.construction.start=performance.now();constructionStudy.request();}},{threshold:.3}).observe(region);
 slider.addEventListener('pointerdown',()=>{pointer=true;});
 slider.addEventListener('pointerup',()=>{pointer=false;});slider.addEventListener('pointercancel',()=>{pointer=false;});
 slider.addEventListener('keydown',()=>{pointer=false;});
 slider.addEventListener('input',()=>{constructionStudy.scrubbing=true;constructionStudy.scrubTarget=Number(slider.value)/100;if(!pointer||reducedMotion.matches){constructionStudy.scrubValue=constructionStudy.scrubTarget;constructionStudy.construction.seek(constructionStudy.scrubValue);}constructionStudy.request();readout();});
 const terms=[['cos 3t','Change the amplitude of Trefoil’s three crossings'],['cos 5u','Change the uneven radius of Orbit'],['cos 8φ','Change the depth of Bloom’s eight folds']];
 document.querySelectorAll('.work-formula').forEach((formula,i)=>{
  const [term,label]=terms[i];formula.innerHTML=formula.textContent.replace(term,`<button type="button" class="equation-term" aria-label="${label}">${term}</button>`);
  const button=formula.querySelector('button'),s=previews[i];let held=false,focused=false;
  const change=keyboard=>{s.termTarget=held||focused?1:0;button.setAttribute('aria-pressed',String(!!s.termTarget));if(keyboard||reducedMotion.matches){s.termWeight=s.termTarget;s.term=s.termTarget*.25;}s.request();};
  button.addEventListener('click',e=>e.stopPropagation());button.addEventListener('pointerdown',e=>{e.stopPropagation();held=true;change(false);});
  for(const event of ['pointerup','pointercancel','pointerleave'])button.addEventListener(event,()=>{held=false;change(false);});
  button.addEventListener('focus',()=>{focused=!held;change(!held);});button.addEventListener('blur',()=>{focused=false;held=false;change(true);});
 });
}
const announce=text=>document.querySelector('#announcement').textContent=text;
function selectMaterial(i) {
 hero.setMaterial(i);document.documentElement.dataset.material=materialSlugs[i];
 roomChanged();
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
function setSeg(group,index){group.querySelectorAll('input').forEach(inp=>{const checked=Number(inp.value)===index;if(inp.checked!==checked)inp.checked=checked;});if(group.dataset.index!==String(index))group.dataset.index=String(index);}
function setTextContent(node,text){if(node.textContent!==text)node.textContent=text;}
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
function setStatus(text){setTextContent(printStatus,text);delete printStatus.dataset.error;}
function castStatus(){return cast?`Cast from “${studyTitle.value.trim()}”. Adjust it, print it, or copy its link.`:restingStatus;}
function updateReadout(){
 setTextContent(castReadout,cast?`Nº ${cast.hash.toString(16).padStart(8,'0')} — ${names[cast.shape]} / ${materials[cast.material].name} / ${cast.lobes} lobes${castAdjusted?' / adjusted':''}`:'Nº — — type to cast');
}
function updateStudyView(){
 setSeg(labShape,lab.shape);setSeg(labMaterial,lab.material);
 setTextContent(document.querySelector('#study-name'),studyTitle.value.trim()||studyName);
 setTextContent(document.querySelector('#lab-meta'),`${names[lab.shape]} / ${materials[lab.material].name}`);
 setTextContent(document.querySelector('#lab-fallback-name'),names[lab.shape]);
 const label=`Interactive ${materials[lab.material].name.toLowerCase()} ${names[lab.shape]}. Drag or use arrow keys to rotate.`;
 if(lab.studioLabel!==label){lab.studioLabel=label;lab.canvas.setAttribute('aria-label',label);}
}
function markPersonal(){studyName=`${names[lab.shape]} study`;if(cast)castAdjusted=true;updateStudyView();updateReadout();setStatus(castStatus());}
function setScene(key){sceneKey=key;scene=scenes[key];labStage.style.setProperty('--scene-bg',scene.bg);labStage.style.setProperty('--scene-text',scene.text);roomChanged();}
function setTwist(value,immediate=true){
 const amount=Math.max(0,Math.min(100,Math.round(value)));tension.value=String(amount);tension.style.setProperty('--fill',amount+'%');lab.setTension(amount/100,immediate);
 document.querySelector('#tension-value').textContent=amount+'%';tension.setAttribute('aria-valuetext',amount+' percent');
 handle.setAttribute('aria-valuenow',String(amount));handle.setAttribute('aria-valuetext',amount+' percent');handle.style.setProperty('--twist-ratio',String((100-amount)/100));
}
function setLight(value){light.value=String(value);light.style.setProperty('--fill',(value/180*100)+'%');lab.targetLight=(value-45)*Math.PI/180;lab.request();document.querySelector('#light-value').textContent=value+'°';light.setAttribute('aria-valuetext',value+' degrees');}
let sliderPointer=false;
for(const input of [tension,light]){input.addEventListener('pointerdown',()=>{sliderPointer=true;});input.addEventListener('pointerup',()=>{sliderPointer=false;});input.addEventListener('pointercancel',()=>{sliderPointer=false;});input.addEventListener('keydown',()=>{sliderPointer=false;});}
tension.addEventListener('input',()=>{lab.pointerTension=sliderPointer;setTwist(Number(tension.value));markPersonal();});
light.addEventListener('input',()=>{setLight(Number(light.value));if(!sliderPointer)lab.light=lab.targetLight;markPersonal();});
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
 const raw=startTwist+(startY-e.clientY)/railHeight*100;if(parameterEnabled)lab.pointerTension=true;setTwist(raw);markPersonal();
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
 e.preventDefault();lab.pointerTension=false;setTwist(next);lab.displayTension=lab.tension;markPersonal();
});
setTwist(35);setLight(45);updateStudyView();

function composePoster(sculpture,title){
 const poster=document.createElement('canvas');poster.width=1200;poster.height=1500;const context=poster.getContext('2d');if(!context)throw Error('The print canvas is unavailable.');
 const posterInk=roomEnabled?getComputedStyle(sculpture.canvas.parentElement).color:scene.text;
 context.fillStyle=roomEnabled?getComputedStyle(sculpture.canvas.parentElement).backgroundColor:scene.bg;context.fillRect(0,0,1200,1500);context.fillStyle=posterInk;context.textBaseline='alphabetic';
 context.font='600 104px Helvetica, Arial, sans-serif';context.fillText('form',72,150);
 context.font='24px Helvetica, Arial, sans-serif';context.fillText('A sculpture study by you',74,204);
 let fontSize=64;context.font=`400 ${fontSize}px Helvetica, Arial, sans-serif`;
 while(context.measureText(title).width>1056&&fontSize>22){fontSize-=2;context.font=`400 ${fontSize}px Helvetica, Arial, sans-serif`;}
 context.fillText(title,72,306);
 // Draw immediately before copying: no persistent drawing buffer or stale screenshot.
 sculpture.copyTo(context,48,342,1104,930);
 context.strokeStyle=posterInk;context.globalAlpha=.3;context.lineWidth=1;context.beginPath();context.moveTo(72,1310);context.lineTo(1128,1310);context.stroke();context.globalAlpha=1;
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
 lab.select(study.shape);lab.morph=1;if(constructionEnabled)lab.construction.snap(study.shape);
 lab.setMaterial(study.material);const m=materials[study.material];lab.color=[...m.color];lab.metal=m.metal;lab.roughness=m.roughness;lab.materialProgress=1;if(castEnabled)lab.castFront.snap(study.material);
 setTwist(study.twist,true);setLight(study.light);lab.light=lab.targetLight;lab.pointerTension=false;lab.displayTension=lab.tension;
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
function updateTheme(){const dark=document.documentElement.dataset.theme?document.documentElement.dataset.theme==='dark':systemTheme.matches;theme.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} theme`);theme.dataset.dark=String(dark);syncThemeColor();roomChanged();}
theme.addEventListener('click',()=>{const dark=document.documentElement.dataset.theme?document.documentElement.dataset.theme==='dark':systemTheme.matches;document.documentElement.dataset.theme=dark?'light':'dark';try{localStorage.setItem('form-theme',document.documentElement.dataset.theme);}catch{}updateTheme();});
systemTheme.addEventListener('change',updateTheme);updateTheme();
// System motion preference suspends movement without erasing the visitor's pause choice.
reducedMotion.addEventListener('change',()=>{for(const s of allSculptures){s.velocity=0;s.hovered=false;s.request();}updatePause();});
finePointer.addEventListener('change',()=>{if(!finePointer.matches)for(const s of previews){s.hovered=false;s.request();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseHandle();for(const s of allSculptures){if(document.hidden){cancelAnimationFrame(s.frame);s.frame=0;if(adaptiveEnabled&&sharedRenderer.resolution.finish(s,false))sharedRenderer.layoutDirty=true;}else{s.last=0;s.request();}}});
openStudyFromHash();
