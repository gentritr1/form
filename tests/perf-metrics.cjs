/* Shared by the real-browser harness and its dependency-free unit tests. */
(function(root){
 'use strict';
 const quantile=(values,p)=>{
  if(!values.length)return null;
  const sorted=[...values].sort((a,b)=>a-b);
  return sorted[Math.max(0,Math.ceil(p*sorted.length)-1)];
 };
 function summarize(intervals,windowMs,refreshHz){
  if(!(windowMs>0&&refreshHz>0))throw Error('Positive window and refresh rate required.');
  if(intervals.some(x=>!Number.isFinite(x)||x<=0))throw Error('Invalid frame interval.');
  const expected=windowMs/1000*refreshHz;
  return {framesDelivered:intervals.length,framesExpected:expected,
   deliveredRatio:intervals.length/expected,windowMs,refreshHz,
   medianMs:quantile(intervals,.5),p95Ms:quantile(intervals,.95),worstMs:quantile(intervals,1),
   overBudgetCount:intervals.filter(x=>x>1500/refreshHz).length,overBudgetThresholdMs:1500/refreshHz};
 }
 function range(values){const valid=values.filter(Number.isFinite);return valid.length?{min:Math.min(...valid),max:Math.max(...valid),samples:valid.length}:null;}
 function hashPixels(bytes){let hash=0x811c9dc5;for(const byte of bytes){hash^=byte;hash=Math.imul(hash,0x01000193);}return (hash>>>0).toString(16).padStart(8,'0');}
 // A timestamp belongs to the half-open window ending with that callback. A long interval
 // is retained whole (never clipped at a boundary); a skipped segment gets zero frames.
 class Timeline {
  constructor(start,refreshHz){this.start=start;this.last=start;this.refreshHz=refreshHz;this.bins=Array.from({length:5},()=>[]);this.actions=[];this.invalid=null;this.finished=false;}
  step(time,visible=true){
   if(this.finished||this.invalid)throw Error('Timeline is no longer collecting.');
   if(!visible){this.invalid='Page became hidden.';return {invalid:this.invalid};}
   if(!Number.isFinite(time)||time<=this.last){this.invalid='Non-increasing frame timestamp.';return {invalid:this.invalid};}
   const elapsed=time-this.start,index=Math.min(4,Math.floor(elapsed/2000));
   const due=[];
   for(let i=0;i<=index;i++)if(!this.actions.includes(i)){this.actions.push(i);due.push(i);}
   if(elapsed<10000)this.bins[index].push(time-this.last);
   this.last=time;this.finished=elapsed>=10000;
   return {index,elapsed,due,done:this.finished};
  }
  report(){if(this.invalid||!this.finished)throw Error(this.invalid||'Incomplete timeline.');return this.bins.map(x=>summarize(x,2000,this.refreshHz));}
 }
 const api={quantile,summarize,range,hashPixels,Timeline};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.FormPerfMetrics=api;
})(globalThis);
