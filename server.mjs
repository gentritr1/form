import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root = resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const port=Number(process.env.PORT || 4173);
createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const perf=url.pathname==='/tests/perf.html';const file=perf?resolve('tests/perf.html'):resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!perf&&!file.startsWith(root+'/')){res.writeHead(403);res.end();return}const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(body)}catch{res.writeHead(404);res.end('Not found')}}).listen(port,'127.0.0.1',()=>console.log(`FORM is ready at http://127.0.0.1:${port}`));
