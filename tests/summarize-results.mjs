import { createHash } from 'node:crypto';
import metrics from './perf-metrics.cjs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
const directory = new URL('./results/', import.meta.url);
const sourceHash=createHash('sha256').update(await readFile(new URL('../dist/app.js',import.meta.url))).digest('hex');
const records = [];
for (const name of await readdir(directory)) {
  if (!name.startsWith('form-') || !name.endsWith('.json')) continue;
  records.push({file:name, ...JSON.parse(await readFile(new URL(name,directory),'utf8'))});
}
const perf = records.filter(r=>r.schema==='form-perf-v1');
const key = r=>r.layers.join(',')||'none';
const accepted = new Map();
for(const r of perf.sort((a,b)=>a.date.localeCompare(b.date))) {
  if(r.sourceHash===sourceHash && r.valid && r.runs?.length===3 && r.viewport.width===1800 && r.viewport.height===875 && r.viewport.dpr===1) accepted.set(key(r),r);
}
const round=n=>n==null?'—':Number(n.toFixed(3));
const range=a=>`${round(Math.min(...a))}–${round(Math.max(...a))}`;
const rows=[];
const referenceHz=accepted.get('none')?.calibration.refreshHz||120;
for(const [configuration,r] of accepted) for(let i=0;i<5;i++) {
  const s=r.runs.map(run=>{const segment=run.segments[i];return {...segment,...metrics.summarize(segment.rawIntervalsMs,2000,referenceHz)};});
  rows.push(`| ${configuration} | ${s[0].name} | ${range(s.map(x=>x.framesDelivered))} / ${round(s[0].framesExpected)} | ${range(s.map(x=>x.medianMs))} | ${range(s.map(x=>x.p95Ms))} | ${range(s.map(x=>x.worstMs))} | ${range(s.map(x=>x.overBudgetCount))} | ${range(s.map(x=>x.gpu.medianMs))} (${s.map(x=>x.gpu.samples).join('/')}) |`);
}
const report = `# Final visible-browser measurements

Executed in Chrome 152, Apple M1 Pro, macOS 26.5.2. Comparable set: 1800 × 875 CSS pixels, DPR 1, visible throughout each accepted run. Three ten-second samples per configuration; five two-second segments per sample. Every range below has n=3 runs. Timer-query overhead is included.

Frame reconciliation and slow counts are recomputed from the saved raw intervals using one common reference: the final baseline's 120-interval calibration, **${round(referenceHz)} Hz** (${round(referenceHz*2)} expected callbacks per 2 seconds; slow threshold ${round(1500/referenceHz)} ms). This is a comparison assumption, not an independently measured panel refresh rate. Individual idle calibrations varied, including a roughly 60Hz estimate followed by roughly 120Hz delivery; comparing their original expected counts directly would be misleading. Raw files retain those original calibrations and statistics unchanged.

These are measurements, not a claim of smoothness or a performance improvement. Baseline and candidate ranges vary considerably. GPU times cover each sculpture draw including enabled passes. Synthetic handle events exercise the renderer but do not measure hardware input latency.

| Layers | Segment | Delivered / expected per 2s | Median ms | p95 ms | Worst ms | Slow intervals | GPU median ms (draw counts per run) |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows.join('\n')}

## Boundary intervals and raw data

${[...accepted].map(([k,r])=>`- ${k}: original idle estimate ${round(r.calibration.refreshHz)} Hz; terminal intervals ${r.runs.map(x=>round(x.terminalIntervalMs)).join(' / ')} ms; overshoot ${r.runs.map(x=>round(x.completionOvershootMs)).join(' / ')} ms. Raw data: [${r.file}](${r.file}). GPU cleanup: ${JSON.stringify(r.gpuCleanup)}.`).join('\n')}

## Retained attempts outside the comparison

${perf.filter(r=>![...accepted.values()].includes(r)).map(r=>`- [${r.file}](${r.file}): ${key(r)}, ${r.viewport?.width} × ${r.viewport?.height}, DPR ${r.viewport?.dpr}; ${r.valid?'completed, outside the final source/viewport comparison set':r.error||'incomplete'}.`).join('\n')}

## Other browser evidence

${records.filter(r=>r.schema!=='form-perf-v1').map(r=>`- [${r.file}](${r.file}): ${r.schema}.`).join('\n')}
`;
await writeFile(new URL('FINAL-MEASUREMENTS.md',directory),report);
console.log(`Reported ${accepted.size} comparable configurations, ${records.length} browser records.`);
