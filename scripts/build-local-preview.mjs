// Generate directly openable HTML without changing the server routes.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const catalog=JSON.parse(read('lib/catalog.json'));
const products=catalog.products.map(p=>({...p,price_cents:p.priceCents,active:1}));
let source=read('lib/pages.js').replace(/import (\w+) from '([^']+)';/g,(_,name,file)=>{
 const value=file.endsWith('?raw')?read(path.join('lib',file.slice(0,-4))):JSON.parse(read(path.join('lib',file)));
 return `const ${name}=${JSON.stringify(value)};`;
});
const {page}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
function localURL(value){
 if(!value.startsWith('/')||value.startsWith('//'))return value;
 const u=new URL(value,'https://local.invalid');
 if(u.pathname.startsWith('/api/'))return '#';
 if(/^\/(images|videos)\//.test(u.pathname))return 'public'+value;
 if(u.pathname==='/store.js')return 'local-preview.js';
 if(['/styles.css','/repairs.css'].includes(u.pathname))return 'public'+value;
 let name=u.pathname==='/'?'index':u.pathname.slice(1).replaceAll('/','-');
 if(u.pathname.startsWith('/shop/')){name='shop';u.searchParams.set('category',u.pathname.split('/')[2]);}
 return name+'.html'+u.search+u.hash;
}
// Product detail pages are rendered dynamically by the Cloudflare Worker at /product/:slug.
// Do not generate one standalone HTML file per product.
const routes=['/','/about','/quote','/shop','/cart','/wishlist','/checkout'];
for(const route of routes){
 let {html,status}=page(new URL(route,'https://local.invalid'),products);
 if(status!==200)throw Error('Unable to generate '+route);
 html=html.replace(/\b(href|src|poster|action|data-zoom)="(\/[^"<>]*)"/g,(_,a,v)=>`${a}="${localURL(v)}"`)
 .replaceAll('/images/','public/images/').replaceAll('/videos/','public/videos/').replaceAll('publicpublic/','public/');
 html=html.replace('</head>','<style>.local-preview-note{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#111827;color:#fff;border-top:1px solid #22d3ee;padding:8px 16px;text-align:center;font:13px system-ui}body{padding-bottom:52px}</style></head>')
 .replace('</body>','<aside class="local-preview-note">Local preview — browsing works here. Cart, orders and form submissions require the included backend. <a href="START-HERE.txt" style="color:#67e8f9">Instructions</a></aside></body>');
 fs.writeFileSync(path.join(root,localURL(route)),html);
}
let js=read('public/store.js').replace("$('[data-payload]').forEach", "$$('[data-payload]').forEach");
js=js.replace(/ async function request\(path,data\)\{[^\n]+\}/,` async function request(path,data){if(path==='/api/state')return state;if(path==='/api/products')return {products:${JSON.stringify(products)}};if(path==='/api/recent')return state;throw Error('This is a local preview. Run the included backend to use carts, submit orders or send forms. Nothing has been submitted.');}`);
js=js.replaceAll('src="/${escape(p.image)}"','src="public/${escape(p.image)}"');
js+='\n'+`(() => {
const localURL=${localURL.toString()};
function fixLinks(){document.querySelectorAll('a[href],form[action]').forEach(el=>{const key=el.tagName==='FORM'?'action':'href';const value=el.getAttribute(key);if(value?.startsWith('/')&&!value.startsWith('//'))el.setAttribute(key,localURL(value));});}
fixLinks();new MutationObserver(fixLinks).observe(document.body,{childList:true,subtree:true});
const form=document.getElementById('filterForm'),grid=document.getElementById('shopProducts');
if(form&&grid){const products=${JSON.stringify(products)};const query=new URLSearchParams(location.search);for(const [key,value] of query)if(form.elements[key])form.elements[key].value=value;
function filter(){const values=new FormData(form),v=k=>values.get(k)||'';let shown=0;const cards=[...grid.querySelectorAll('[data-product]')];for(const card of cards){const p=products.find(p=>p.id===Number(card.dataset.product));const visible=(!v('category')||v('category')==='all'||p.category===v('category'))&&(!v('condition')||p.condition===v('condition'))&&(!v('brand')||p.brand===v('brand'))&&p.name.toLowerCase().includes(v('q').toLowerCase())&&p.price_cents>=Number(v('min'))*100&&(!v('max')||p.price_cents<=Number(v('max'))*100);card.hidden=!visible;card.style.display=visible?'':'none';if(visible)shown++;}
cards.sort((a,b)=>{const x=products.find(p=>p.id==a.dataset.product),y=products.find(p=>p.id==b.dataset.product);return v('sort')==='price-asc'?x.price_cents-y.price_cents:v('sort')==='price-desc'?y.price_cents-x.price_cents:v('sort')==='name'?x.name.localeCompare(y.name):x.id-y.id;}).forEach(c=>grid.append(c));document.querySelector('.shop-toolbar>p').textContent=shown+' products';document.querySelectorAll('.category-pills a').forEach(a=>{const category=new URL(a.href).searchParams.get('category')||'all';if(category===(v('category')||'all'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}
form.addEventListener('submit',e=>{e.preventDefault();filter();});filter();}
})();\n`;
fs.writeFileSync(path.join(root,'local-preview.js'),js);
console.log('Generated '+routes.length+' complete local HTML pages.');
