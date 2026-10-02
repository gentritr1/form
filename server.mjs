import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root = resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const port=Number(process.env.PORT || 4173);
createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');
 // Diagnostic-only, same-origin checkpoints survive browser-control disconnections.
 // Production dist and the standalone file never call this local endpoint.
 if(url.pathname==='/tests/capture'){
  if(req.method!=='POST'||req.headers.origin!==`http://127.0.0.1:${port}`||req.headers['content-type']!=='application/json'){res.writeHead(403);res.end();return;}
  const chunks=[];let size=0;
  for await(const chunk of req){size+=chunk.length;if(size>4*1024*1024){res.writeHead(413);res.end();return;}chunks.push(chunk);}
  const payload=JSON.parse(Buffer.concat(chunks).toString());let data,extension,label;
  if(typeof payload.image==='string'&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(payload.image)){
   data=Buffer.from(payload.image.split(',')[1],'base64');extension='png';label='frames';
  }else if(typeof payload.schema==='string'&&/^form-[a-z-]+-v\d+$/.test(payload.schema)){
   data=JSON.stringify(payload,null,2);extension='json';label=payload.schema;
  }else{res.writeHead(400);res.end();return;}
  const directory=resolve('tests/results'),name=`${label}-${Date.now()}-${Math.random().toString(36).slice(2,8)}.${extension}`;
  await mkdir(directory,{recursive:true});await writeFile(resolve(directory,name),data,{flag:'wx'});
  res.writeHead(201,{'Content-Type':'application/json'});res.end(JSON.stringify({file:`tests/results/${name}`}));return;
 }
 const perf=url.pathname==='/tests/perf.html';const file=perf?resolve('tests/perf.html'):resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!perf&&!file.startsWith(root+'/')){res.writeHead(403);res.end();return}const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(body);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`FORM is ready at http://127.0.0.1:${port}`));
