// The room lighting reads colours from tables in app.js rather than from computed style.
// This keeps those tables identical to the CSS tokens they mirror.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert');
const css=fs.readFileSync(path.join(__dirname,'../dist/styles.css'),'utf8'),js=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8');
const table=name=>{const m=js.match(new RegExp('const '+name+' = (\\{[\\s\\S]*?\\});'));assert(m,name+' table present');return Function('return '+m[1])();};
const backgrounds=table('themeBackgrounds'),accents=table('themeAccents'),frames=table('themeFrames');
const token=(block,name)=>{const m=block.match(new RegExp('--'+name+':\\s*(#[0-9A-Fa-f]{6})'));assert(m,'--'+name+' in '+block.slice(0,60));return m[1].toUpperCase();};
const rule=selector=>{const start=css.indexOf(selector+' {');assert(start>=0,'rule '+selector);return css.slice(start,css.indexOf('}',start));};
let checked=0;
for(const material of ['copper','chrome','porcelain']){
 const light=rule(':root[data-material='+material+']'),dark=rule(':root[data-theme=dark][data-material='+material+']'),system=rule(':root:not([data-theme=light])[data-material='+material+']');
 for(const [theme,block] of [['light',light],['dark',dark],['dark',system]]){
  assert.equal(backgrounds[theme][material].toUpperCase(),token(block,'bg'),theme+' '+material+' background');
  assert.equal(accents[theme][material].toUpperCase(),token(block,'accent'),theme+' '+material+' accent');checked+=2;
 }
}
const lightFrames=rule(':root'),darkFrames=rule(':root[data-theme=dark]'),systemFrames=rule(':root:not([data-theme=light])');
['copper','chrome','porcelain'].forEach((name,i)=>{
 assert.equal(frames.light[i].toUpperCase(),token(lightFrames,'frame-'+name));
 assert.equal(frames.dark[i].toUpperCase(),token(darkFrames,'frame-'+name));assert.equal(frames.dark[i].toUpperCase(),token(systemFrames,'frame-'+name));checked+=3;
});
console.log('Passed: '+checked+' room colour table entries match the CSS tokens.');
