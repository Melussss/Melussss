// Portable JavaScript backend for the plain HTML/CSS/JS storefront.
import {initialize,products,session,api,HttpError} from './lib/api.js';
import {page,shell} from './lib/pages.js';
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/index.html')return Response.redirect(new URL('/',url),301);
  if(url.pathname.startsWith('/images/')||url.pathname.startsWith('/videos/')||['/styles.css','/repairs.css','/store.js','/robots.txt','/favicon.ico'].includes(url.pathname))return env.ASSETS.fetch(request);
  const headers=new Headers({'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY','Permissions-Policy':'camera=(), microphone=(), geolocation=()'});
  try{
   await initialize(env);
   if(url.pathname.startsWith('/api/')){const guest=await session(request,env);if(guest.cookie)headers.set('Set-Cookie',guest.cookie);const result=await api(request,env,guest.id);headers.set('Content-Type','application/json; charset=utf-8');return new Response(JSON.stringify(result),{headers});}
   if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers});
   const result=page(url,await products(env));headers.set('Content-Type','text/html; charset=utf-8');return new Response(request.method==='HEAD'?null:result.html,{status:result.status,headers});
  }catch(error){const status=error instanceof HttpError?error.status:503,message=error instanceof HttpError?error.message:'The store is temporarily unavailable. Please try again shortly.';headers.set('Content-Type',url.pathname.startsWith('/api/')?'application/json; charset=utf-8':'text/html; charset=utf-8');return new Response(url.pathname.startsWith('/api/')?JSON.stringify({ok:false,message}):shell('<section class="store-page"><h1>Temporarily unavailable</h1><p>Please try again shortly or contact Digitron.</p><a href="https://wa.me/971501240180" class="store-button">WhatsApp</a></section>'),{status,headers});}
 },
};
