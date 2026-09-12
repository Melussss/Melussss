import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pages=fs.readdirSync(root).filter(p=>p.endsWith('.html'));
let checked=0;
for(const file of pages){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 if(!html.includes('<!doctype html>')||!html.includes('href="public/styles.css"')||!html.includes('src="local-preview.js"'))throw Error(file+' is incomplete');
 for(const m of html.matchAll(/\b(?:href|src|poster|action|data-zoom)="([^"]+)"/g)){
  const value=m[1].split(/[?#]/)[0];
  if(!value||/^(https?:|mailto:|tel:|data:)/.test(value))continue;
  checked++;
  if(value.startsWith('/')||!fs.existsSync(path.join(root,value)))throw Error(file+': missing local target '+value);
 }
}
const js=fs.readFileSync(path.join(root,'local-preview.js'),'utf8');
if(/\bfetch\(/.test(js))throw Error('Local preview must not attempt backend network requests');
console.log(`PASS: ${pages.length} complete pages, ${checked} local references, no backend fetches.`);
