const http=require('http'),fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
http.createServer((q,s)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';fs.readFile(path.join(root,p),(e,d)=>{if(e){s.writeHead(404);s.end('x');return;}s.writeHead(200,{'Content-Type':types[path.extname(p)]||'text/plain'});s.end(d);});}).listen(8799,()=>console.log('up'));
