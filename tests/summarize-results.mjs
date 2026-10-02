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
  if(r.sourceHash===sourceHash && r.valid && r.runs?.length===3) accepted.set(key(r),r);
}
// Nothing to report: say why instead of writing an empty table.
if(!accepted.size){
  const stale=perf.filter(r=>r.sourceHash!==sourceHash).length,invalid=perf.filter(r=>r.sourceHash===sourceHash&&!(r.valid&&r.runs?.length===3)).length;
  console.log(`No measurements for the current build yet (${perf.length} saved run records: ${stale} from an older build, ${invalid} incomplete or invalid).`);
  console.log('Start the server with `npm run dev`, open http://127.0.0.1:4173/tests/perf.html?layers=none&batch=1 in a normal browser window,');
  console.log('keep that tab in front until its status line says the eighth configuration is saved (about five minutes), then run this again.');
  process.exit(0);
}
const round=n=>n==null?'—':Number(n.toFixed(3));
const range=a=>`${round(Math.min(...a))}–${round(Math.max(...a))}`;
const rows=[];
const referenceHz=accepted.get('none')?.calibration.refreshHz||120;
for(const [configuration,r] of accepted) for(let i=0;i<5;i++) {
  const s=r.runs.map(run=>{const segment=run.segments[i];return {...segment,...metrics.summarize(segment.rawIntervalsMs,2000,referenceHz)};});
  const st=r.runs.map(run=>metrics.stalls(run.segments[i].rawIntervalsMs));
  rows.push(`| ${configuration} | ${s[0].name} | ${range(s.map(x=>x.framesDelivered))} / ${round(s[0].framesExpected)} | ${range(s.map(x=>x.medianMs))} | ${range(s.map(x=>x.p95Ms))} | ${range(s.map(x=>x.worstMs))} | ${range(s.map(x=>x.overBudgetCount))} | ${range(st.map(x=>x.over25))} | ${range(st.map(x=>x.over50))} | ${range(st.map(x=>x.lostMs))} | ${range(s.map(x=>x.cpuDraw.p95Ms))} | ${range(s.map(x=>x.gpu.medianMs))} (${s.map(x=>x.gpu.samples).join('/')}) |`);
}
const report = `# Visible-browser measurements

Records accepted: built from the current \`dist/app.js\` (SHA-256 \`${sourceHash.slice(0,12)}…\`), valid, three ten-second samples per configuration, five two-second segments per sample. Every range below has n=3 runs. Timer-query overhead is included. Browser, viewport and DPR for each configuration are listed under "Boundary intervals"; only compare configurations measured at the same viewport.

Frame reconciliation and slow counts are recomputed from the saved raw intervals using one common reference: the final baseline's 120-interval calibration, **${round(referenceHz)} Hz** (${round(referenceHz*2)} expected callbacks per 2 seconds; slow threshold ${round(1500/referenceHz)} ms). This is a comparison assumption, not an independently measured panel refresh rate. Individual idle calibrations varied, including a roughly 60Hz estimate followed by roughly 120Hz delivery; comparing their original expected counts directly would be misleading. Raw files retain those original calibrations and statistics unchanged.

These are measurements of frame delivery on one machine, not a judgement of how the motion feels. GPU times cover each sculpture draw including enabled passes. Synthetic handle events exercise the renderer but do not measure hardware input latency.

"Slow intervals" depends on the assumed refresh rate and counts ordinary 60Hz frames on an adaptive 120Hz display. The three stall columns do not: an interval over 25ms is a missed frame at 60Hz, over 50ms is a visible hitch, and "ms in stalls" is the time spent in intervals over 25ms within the two-second segment.

| Layers | Segment | Delivered / expected per 2s | Median ms | p95 ms | Worst ms | Slow intervals | Over 25ms | Over 50ms | ms in stalls | CPU draw p95 ms | GPU median ms (draw counts per run) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows.join('\n')}

## Boundary intervals and raw data

Raw records are local files under \`tests/results\` and are not committed.

${[...accepted].map(([k,r])=>`- ${k}: ${r.viewport.width} × ${r.viewport.height} at DPR ${r.viewport.dpr}, ${(r.userAgent.match(/Chrome\/\d+|Firefox\/\d+|Version\/\d+.*Safari/)||['browser not identified'])[0]}; original idle estimate ${round(r.calibration.refreshHz)} Hz; terminal intervals ${r.runs.map(x=>round(x.terminalIntervalMs)).join(' / ')} ms; overshoot ${r.runs.map(x=>round(x.completionOvershootMs)).join(' / ')} ms. Raw data: [${r.file}](${r.file}). GPU cleanup: ${JSON.stringify(r.gpuCleanup)}.`).join('\n')}

## Retained attempts outside the comparison

${perf.filter(r=>![...accepted.values()].includes(r)).map(r=>`- [${r.file}](${r.file}): ${key(r)}, ${r.viewport?.width} × ${r.viewport?.height}, DPR ${r.viewport?.dpr}; ${r.valid?'completed, outside the final source/viewport comparison set':r.error||'incomplete'}.`).join('\n')}

## Other browser evidence

${records.filter(r=>r.schema!=='form-perf-v1').map(r=>`- [${r.file}](${r.file}): ${r.schema}.`).join('\n')}
`;
await writeFile(new URL('MEASUREMENTS.md',directory),report);
console.log(`Reported ${accepted.size} comparable configurations, ${records.length} browser records.`);
