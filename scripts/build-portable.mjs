import fs from 'node:fs';
import path from 'node:path';
import {build} from 'esbuild';
await build({entryPoints:['standalone-worker.js'],outfile:'worker.js',bundle:true,format:'esm',platform:'neutral',target:'es2022',loader:{'.html':'text'},plugins:[{name:'raw-html',setup(b){b.onResolve({filter:/\.html\?raw$/},args=>({path:path.resolve(args.resolveDir,args.path.replace(/\?raw$/,'')),namespace:'html-text'}));b.onLoad({filter:/.*/,namespace:'html-text'},args=>({contents:fs.readFileSync(args.path,'utf8'),loader:'text'}));}}]});
