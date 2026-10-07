import home from '../templates/home.html?raw';
import about from '../templates/about.html?raw';
import quote from '../templates/quote.html?raw';
import footer from '../templates/footer.html?raw';
import shopHero from '../templates/shop-hero.html?raw';
import catalog from './catalog.json';
export const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=c=>(c/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const priceText=_p=>'Contact for price';
const icon=(n)=>`<i class="bi bi-${n}" aria-hidden="true"></i>`;
const categories=catalog.categories;
const categoryPaths={
  'processors':'/processors',
  'graphics-cards':'/graphics-cards',
  'memory':'/memory',
  'storage':'/storage',
  'motherboards':'/motherboards',
  'power-supply':'/power-supplies',
  'laptops':'/laptops',
  'monitors':'/monitors'
};
const categoryHref=slug=>categoryPaths[slug]||`/shop?category=${encodeURIComponent(slug)}`;
const componentCategories=new Set(['processors','graphics-cards','memory','storage','motherboards','power-supply']);
const gamingLaptop=p=>p.category==='laptops'&&!/\b(?:xps|zbook)\b/i.test(p.name);
const seoLandings={
  '/laptops':{
    title:'Laptops Zimbabwe | Gaming & Performance Laptops | Anom Tech',
    description:'Browse gaming, creator and performance laptops in Zimbabwe from ASUS, MSI, Acer, HP, Dell, Lenovo and Alienware. Contact Anom Tech in Harare for current stock and pricing.',
    kicker:'LAPTOPS ZIMBABWE',h1:'Laptops in Zimbabwe',
    intro:'Explore laptops for gaming, university, work, content creation and demanding professional workloads. Anom Tech helps customers in Harare and across Zimbabwe compare the right processor, graphics performance, memory, storage and display before buying.',
    body:'Our laptop range includes gaming-focused ASUS ROG and TUF models, MSI gaming systems, Acer Nitro and Predator machines, HP Omen, Lenovo Legion, Alienware, Dell XPS and mobile workstation options. Because configurations and availability can change, contact us for the current specification and price of the exact model you want.',
    filter:p=>p.category==='laptops',label:'Available laptops',cta:'/quote#quote-section',ctaText:'Ask about a laptop'
  },
  '/gaming-laptops':{
    title:'Gaming Laptops Zimbabwe | ASUS, MSI, Acer, HP & More | Anom Tech',
    description:'Find gaming laptops in Zimbabwe from ASUS ROG, MSI, Acer Nitro, HP Omen, Lenovo Legion and Alienware. Contact Anom Tech Harare for current models and pricing.',
    kicker:'GAMING LAPTOPS ZIMBABWE',h1:'Gaming Laptops in Zimbabwe',
    intro:'Looking for a gaming laptop in Zimbabwe? Compare portable gaming systems with dedicated graphics, high-performance processors, fast memory and displays suited to competitive and AAA gaming. We can help you match a laptop to your games, creative software and budget.',
    body:'Anom Tech carries gaming-oriented models from ASUS ROG and TUF, MSI, Acer Nitro and Predator, HP Omen, Lenovo Legion and Alienware. Ask us to confirm the exact GPU, CPU, RAM, SSD and display configuration before you buy, as specifications can vary between model variants.',
    filter:gamingLaptop,label:'Gaming laptop models',cta:'/quote#quote-section',ctaText:'Get gaming laptop advice'
  },
  '/graphics-cards':{
    title:'Graphics Cards Zimbabwe | NVIDIA RTX & AMD Radeon GPUs | Anom Tech',
    description:'Shop graphics cards in Zimbabwe including NVIDIA GeForce RTX and AMD Radeon GPUs. Contact Anom Tech in Harare for current GPU stock, compatibility advice and pricing.',
    kicker:'GPUs ZIMBABWE',h1:'Graphics Cards in Zimbabwe',
    intro:'Upgrade your gaming, rendering or AI workstation with a graphics card matched to your performance target and power supply. Our Zimbabwe GPU range includes NVIDIA GeForce RTX and AMD Radeon options across current and previous generations.',
    body:'Whether you are targeting 1080p, 1440p, ultrawide or 4K gaming, or need GPU acceleration for editing, 3D rendering and creator workloads, Anom Tech can help check case clearance, PSU requirements and platform compatibility. Contact us for the current selling price and availability in Harare.',
    filter:p=>p.category==='graphics-cards',label:'Graphics cards',cta:'/quote#quote-section',ctaText:'Get a GPU quote'
  },
  '/processors':{
    title:'Processors Zimbabwe | Intel Core & AMD Ryzen CPUs | Anom Tech',
    description:'Browse Intel Core and AMD Ryzen processors in Zimbabwe for gaming, productivity and workstation PCs. Contact Anom Tech Harare for CPU pricing and compatibility advice.',
    kicker:'CPUs ZIMBABWE',h1:'Processors in Zimbabwe',
    intro:'Choose a processor that fits your gaming, streaming, editing or workstation requirements. Anom Tech offers high-performance Intel Core and AMD Ryzen CPUs and can help you check motherboard socket, memory generation, cooling and power requirements.',
    body:'From gaming-focused Ryzen processors to Intel Core i9 and Core Ultra options, the right CPU depends on the rest of your build and the software you use. Contact us in Harare for current stock, a quote and help pairing your processor with compatible components.',
    filter:p=>p.category==='processors',label:'Processors',cta:'/quote#quote-section',ctaText:'Get a CPU quote'
  },
  '/memory':{
    title:'Computer RAM Zimbabwe | DDR4 & DDR5 Memory | Anom Tech',
    description:'Find DDR4 and DDR5 desktop memory in Zimbabwe from Corsair, Crucial, Lexar, KLEVV and T-Force. Contact Anom Tech Harare for current RAM pricing and compatibility.',
    kicker:'PC MEMORY ZIMBABWE',h1:'DDR4 & DDR5 RAM in Zimbabwe',
    intro:'Memory upgrades can improve multitasking, gaming consistency and demanding creative workloads when your current system is capacity-limited. Browse DDR4 and DDR5 kits for new PC builds and upgrades in Zimbabwe.',
    body:'Before ordering RAM, confirm your motherboard memory generation, supported capacity and suitable speed. Anom Tech can help you identify compatible memory for your build and provide current pricing on available 32GB and RGB memory options.',
    filter:p=>p.category==='memory',label:'Memory kits',cta:'/quote#quote-section',ctaText:'Ask about RAM compatibility'
  },
  '/storage':{
    title:'NVMe SSDs Zimbabwe | PC Storage & SSD Upgrades | Anom Tech',
    description:'Browse NVMe SSDs and PC storage in Zimbabwe, including 1TB and 2TB options from Lexar and other brands. Contact Anom Tech Harare for current storage pricing.',
    kicker:'SSD STORAGE ZIMBABWE',h1:'NVMe SSDs & PC Storage in Zimbabwe',
    intro:'Fast NVMe storage can shorten boot times, game loading and large-file workflows. Browse SSD options for gaming PCs, laptops and workstations, with 1TB and 2TB capacities available across different performance tiers.',
    body:'Not every system supports the same PCIe generation or M.2 configuration, so compatibility matters. Anom Tech can help confirm whether an SSD suits your motherboard or laptop and provide the current price and availability in Zimbabwe.',
    filter:p=>p.category==='storage',label:'Storage options',cta:'/quote#quote-section',ctaText:'Get an SSD quote'
  },
  '/monitors':{
    title:'Gaming Monitors Zimbabwe | Ultrawide & OLED Displays | Anom Tech',
    description:'Browse gaming monitors in Zimbabwe including Samsung Odyssey, OLED, 34-inch ultrawide and 49-inch super-ultrawide displays. Contact Anom Tech Harare for pricing.',
    kicker:'MONITORS ZIMBABWE',h1:'Gaming Monitors in Zimbabwe',
    intro:'Choose a display that matches your GPU, desk space and the games or applications you use. Our monitor selection includes high-refresh gaming displays, 34-inch ultrawides, OLED options and large-format super-ultrawide screens.',
    body:'Resolution, refresh rate, panel technology and screen size all affect the experience and the GPU performance required. Contact Anom Tech in Harare to confirm the current monitor specification, availability and price before ordering.',
    filter:p=>p.category==='monitors',label:'Gaming monitors',cta:'/quote#quote-section',ctaText:'Ask about a monitor'
  },
  '/motherboards':{
    title:'Motherboards Zimbabwe | Gaming PC Motherboards | Anom Tech',
    description:'Find PC motherboards in Zimbabwe and get help matching your CPU, RAM, storage and case. Contact Anom Tech Harare for current motherboard stock and pricing.',
    kicker:'MOTHERBOARDS ZIMBABWE',h1:'PC Motherboards in Zimbabwe',
    intro:'The motherboard determines CPU socket, memory support, storage expansion and much of your upgrade path. Choose a board that fits your processor, case format and connectivity requirements.',
    body:'Anom Tech can help check socket compatibility, DDR4 or DDR5 support, M.2 slots, power delivery and case fit before you buy. Contact us for current motherboard options and pricing in Zimbabwe.',
    filter:p=>p.category==='motherboards',label:'Motherboards',cta:'/quote#quote-section',ctaText:'Get motherboard advice'
  },
  '/power-supplies':{
    title:'PC Power Supplies Zimbabwe | Gaming PSU | Anom Tech',
    description:'Find PC power supplies in Zimbabwe and get help choosing suitable wattage for your GPU and processor. Contact Anom Tech Harare for current PSU pricing.',
    kicker:'POWER SUPPLIES ZIMBABWE',h1:'PC Power Supplies in Zimbabwe',
    intro:'A reliable power supply is essential for a stable gaming PC or workstation. Wattage should be selected around your graphics card, processor, upgrade plans and connector requirements rather than simply choosing the largest number.',
    body:'Anom Tech can help estimate suitable PSU capacity for your parts and check compatibility with high-end graphics cards. Contact us for current availability and pricing in Harare, Zimbabwe.',
    filter:p=>p.category==='power-supply',label:'Power supplies',cta:'/quote#quote-section',ctaText:'Ask about PSU sizing'
  },
  '/pc-components':{
    title:'PC Components & Computer Hardware Zimbabwe | Anom Tech Harare',
    description:'Shop PC components and computer hardware in Zimbabwe: graphics cards, processors, RAM, SSDs, motherboards and power supplies. Get a quote from Anom Tech Harare.',
    kicker:'COMPUTER HARDWARE ZIMBABWE',h1:'PC Components & Computer Hardware in Zimbabwe',
    intro:'Build or upgrade your computer with components selected for compatibility and the performance you actually need. Anom Tech supplies graphics cards, processors, memory, NVMe storage, motherboards and power supplies for gaming PCs, creator systems and workstations.',
    body:'If you are unsure whether parts will work together, send us your existing specifications or intended build. We can help check platform compatibility, power requirements and sensible upgrade paths before you spend money on hardware in Zimbabwe.',
    filter:p=>componentCategories.has(p.category),label:'PC hardware',cta:'/#builder',ctaText:'Build a PC'
  },
  '/gaming-pcs':{
    title:'Gaming PCs Zimbabwe | Gaming PC Builds in Harare | Anom Tech',
    description:'Plan a gaming PC in Zimbabwe with Anom Tech. Choose CPUs, GPUs, RAM and storage for your target games, resolution and budget, then request a custom build quote.',
    kicker:'GAMING PCs ZIMBABWE',h1:'Gaming PCs in Zimbabwe',
    intro:'A good gaming PC starts with the games you play, your target resolution and refresh rate, and the budget you want to work within. Anom Tech helps Zimbabwean gamers choose balanced components rather than overspending in one area while bottlenecking another.',
    body:'Use our PC builder to shortlist a processor, graphics card and memory, or send us your preferred specification. We can help with compatibility and provide a current quote for a gaming build in Harare using available components.',
    filter:p=>['graphics-cards','processors','memory','storage'].includes(p.category),label:'Popular gaming PC components',cta:'/#builder',ctaText:'Start your gaming PC build'
  },
  '/custom-pc-builds':{
    title:'Custom PC Builds Zimbabwe | Gaming & Workstation PCs | Anom Tech',
    description:'Request a custom PC build in Zimbabwe for gaming, rendering, editing, streaming or workstation use. Anom Tech Harare helps select compatible components and provides a quote.',
    kicker:'CUSTOM PC BUILDS ZIMBABWE',h1:'Custom PC Builds in Zimbabwe',
    intro:'Custom PCs let you spend your budget where it has the greatest impact. Tell Anom Tech what you want the machine to do and we can help choose compatible parts for gaming, streaming, video editing, 3D rendering, productivity or workstation use.',
    body:'Start with our PC builder or request a quote with your budget and preferred parts. We can review the CPU, GPU, memory, storage, motherboard and power requirements and help you shape a balanced build using hardware available in Zimbabwe.',
    filter:p=>['graphics-cards','processors','memory','storage','motherboards','power-supply'].includes(p.category),label:'Components for custom builds',cta:'/quote#quote-section',ctaText:'Request a custom PC quote'
  }
};
const landingPaths=Object.keys(seoLandings);
const jsonLd=data=>`<script type="application/ld+json">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>`;
const localBusinessSchema=origin=>({
  '@context':'https://schema.org','@type':'ElectronicsStore',name:'Anom Tech',url:origin+'/',
  logo:origin+'/images/logo-cropped.png',image:origin+'/images/logo-cropped.png',
  description:'PC components, gaming laptops, monitors and custom PC builds in Harare, Zimbabwe.',
  email:'mailto:melusiwethumpofu@gmail.com',telephone:'+263780756571',
  address:{'@type':'PostalAddress',addressLocality:'Harare',addressCountry:'ZW'},
  areaServed:{'@type':'Country',name:'Zimbabwe'},
  openingHoursSpecification:[{'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],opens:'08:00',closes:'20:00'}],
  contactPoint:[
    {'@type':'ContactPoint',telephone:'+263780756571',contactType:'sales',areaServed:'ZW',availableLanguage:'English'},
    {'@type':'ContactPoint',telephone:'+263713047114',contactType:'customer service',areaServed:'ZW',availableLanguage:'English'}
  ]
});
const breadcrumbSchema=(origin,items)=>({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((item,i)=>({'@type':'ListItem',position:i+1,name:item.name,item:origin+item.path}))});
const websiteSchema=origin=>({'@context':'https://schema.org','@type':'WebSite',name:'Anom Tech',url:origin+'/',inLanguage:'en-ZW'});
export function card(p){const cat=categories.find(c=>c.slug===p.category),showBadge=p.badge&&p.badge.toLowerCase()!==p.condition.toLowerCase();return `<article class="product-card group relative rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-brand-accent/50 transition-all duration-500" data-product="${p.id}"><div class="card-image relative aspect-square overflow-hidden bg-gradient-to-br from-white/5 to-transparent"><div class="product-card-badges"><span>${escape(p.condition)}</span>${showBadge?`<span>${escape(p.badge)}</span>`:''}</div><a href="/product/${escape(p.slug)}" aria-label="View ${escape(p.name)}"><img src="/${escape(p.image)}" alt="${escape(p.name)}" class="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105" loading="lazy"></a><button class="wish-button" data-wish="${p.id}" aria-label="Save ${escape(p.name)} to wishlist" aria-pressed="false">${icon('heart')}</button></div><div class="p-4 product-card-content"><div class="product-card-eyebrow"><span>${escape(cat?.name||p.category)}</span><span class="product-stock is-available">Enquire for availability</span></div><h3 class="font-bold"><a href="/product/${escape(p.slug)}">${escape(p.name)}</a></h3><a class="store-button product-card-details-button" href="/product/${escape(p.slug)}" aria-label="View product details for ${escape(p.name)}">${icon('eye')} View Product Details</a><a class="store-button product-card-price-button" href="/quote#quote-section">${icon('chat-square-text')} Get Price</a><div class="product-card-footer"><strong class="font-bold text-lg">${priceText(p)}</strong></div></div></article>`;}
const header=`<a class="skip-link" href="#main">Skip to content</a><header id="siteHeader" class="fixed top-0 left-0 right-0 z-50"><div class="header-row px-4 py-4 sm:px-6"><a href="/" class="brand"><img src="/images/logo-cropped.png" alt="Anom Tech" class="brand-logo"><span class="brand-text"><span class="bt-main font-display font-bold">ANOM <span class="bt-sub text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-secondary">TECH</span></span></span></a><nav class="store-actions" aria-label="Main navigation">${[['/about','info-circle','About'],['/shop','basket3','Shop'],['/quote','headset','Contact']].map(([href,ic,title])=>`<a href="${href}" class="icon-btn" aria-label="${title}">${icon(ic)}<span class="icon-label">${title}</span></a>`).join('')}<button type="button" class="icon-btn" data-open="wishlistDialog" aria-label="Open wishlist">${icon('heart')}<span class="badge-count" data-wish-count>0</span></button><button type="button" class="icon-btn" data-open="cartDialog" aria-label="Open cart">${icon('cart3')}<span class="badge-count" data-cart-count>0</span></button><button type="button" class="icon-btn" data-open="menuDialog" aria-label="Open navigation menu">${icon('list')}</button></nav></div></header>`;
function dialog(id,title,body){return `<dialog id="${id}" class="store-dialog" aria-labelledby="${id}Title"><div class="dialog-heading"><h2 id="${id}Title">${title}</h2><button type="button" data-close aria-label="Close ${title}">${icon('x-lg')}</button></div>${body}</dialog>`;}
const menuBody=`<div class="menu-drawer-body">
  <section class="menu-intro">
    <span class="menu-kicker">ANOM TECH</span>
    <p>Premium PC components, custom builds and expert support in Zimbabwe.</p>
  </section>
  <form action="/shop" class="menu-search" role="search">
    <label class="sr-only" for="menuSearch">Search products</label>
    ${icon('search')}<input id="menuSearch" name="q" type="search" placeholder="Search processors, graphics cards…" autocomplete="off">
    <button type="submit" aria-label="Search products">${icon('arrow-right')}</button>
  </form>
  <nav class="menu-links" aria-label="Menu navigation">
    <a href="/#builder" class="menu-builder-card">
      <span class="menu-builder-icon">${icon('pc-display-horizontal')}</span>
      <span><strong>Build Your Dream PC</strong><small>Choose components and get compatibility advice</small></span>
      ${icon('arrow-up-right')}
    </a>
    <div class="menu-primary-grid">
      <a href="/">${icon('house-door')}<span>Home</span></a>
      <a href="/shop">${icon('bag')}<span>Shop</span></a>
      <a href="/about">${icon('info-circle')}<span>About</span></a>
      <a href="/quote">${icon('chat-square-text')}<span>Quotes</span></a>
      <a href="/cart">${icon('cart3')}<span>Cart</span></a>
      <a href="/wishlist">${icon('heart')}<span>Wishlist</span></a>
    </div>
    <section class="menu-category-section" aria-labelledby="menuCategoryTitle">
      <div class="menu-section-heading"><h3 id="menuCategoryTitle">Shop by component</h3><a href="/shop">View all ${icon('arrow-right')}</a></div>
      <div class="menu-category-grid">${categories.map(c=>`<a href="${categoryHref(c.slug)}"><span>${c.name}</span>${icon('chevron-right')}</a>`).join('')}</div>
    </section>
  </nav>
  <a class="menu-whatsapp" href="https://wa.me/263713047114?text=Hello%20Anom%20Tech" target="_blank" rel="noopener noreferrer">${icon('whatsapp')}<span><strong>Need help choosing?</strong><small>Chat with our PC experts</small></span>${icon('arrow-up-right')}</a>
</div>`;
const dialogs=dialog('cartDialog','Shopping Cart','<div data-cart-content><p>Loading cart…</p></div>')+dialog('wishlistDialog','Your Wishlist','<div data-wishlist-content><p>Loading wishlist…</p></div>')+dialog('menuDialog','Menu',menuBody)+dialog('zoomDialog','Product image','<img id="zoomImage" alt="Product detail" class="w-full object-contain">');
const support=dialog('supportDialog','Anom Tech Support',`<p class="text-gray-400 mb-4">Choose a topic for quick information, or leave an enquiry.</p><div class="support-chips">${['Delivery','Warranty','Custom PC','Payment','Location','Stock'].map(t=>`<button type="button" data-topic="${t}">${t}</button>`).join('')}</div><div id="supportAnswer" class="mt-4" aria-live="polite"></div><a id="whatsappLink" href="https://wa.me/263713047114?text=Hello%20Anom%20Tech" target="_blank" rel="noopener noreferrer" class="store-button mt-5">Continue on WhatsApp ${icon('whatsapp')}</a><form id="supportForm" class="mt-6 space-y-3"><label>Your name<input name="name" class="store-input" required maxlength="255" autocomplete="name"></label><label>Email<input type="email" name="email" class="store-input" required maxlength="254" autocomplete="email"></label><label>Phone (optional)<input type="tel" name="phone" class="store-input" maxlength="50" autocomplete="tel"></label><label>Your question<textarea name="message" class="store-input" required maxlength="2000"></textarea></label><button class="store-button" type="submit">Save enquiry</button><p class="form-status" role="status"></p></form>`);
export function shell(content,title='Anom Tech',page='home',data=null,seo={}){
 const description=seo.description||'Anom Tech supplies PC components, laptops, monitors and custom PC builds in Harare, Zimbabwe.';
 const origin=seo.origin||'';
 const canonical=origin&&seo.canonicalPath?origin+seo.canonicalPath:'';
 const robots=seo.robots||'index,follow,max-image-preview:large';
 const image=seo.image?(seo.image.startsWith('http')?seo.image:origin+'/'+seo.image.replace(/^\//,'')):(origin?origin+'/images/logo-cropped.png':'');
 const schemas=[];
 if(origin){schemas.push(localBusinessSchema(origin));if(page==='home')schemas.push(websiteSchema(origin));}
 if(Array.isArray(seo.schemas))schemas.push(...seo.schemas);
 return `<!doctype html><html lang="en-ZW"><head><meta charset="utf-8"><meta name="google-site-verification" content="7p5O3E4sKaX4jWDt4uUZk3LU13-FPygnTLrPksCS0Vs" /><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#202124"><meta name="description" content="${escape(description)}"><meta name="robots" content="${escape(robots)}"><title>${escape(title)}</title>${canonical?`<link rel="canonical" href="${escape(canonical)}"><meta property="og:url" content="${escape(canonical)}">`:''}<meta property="og:type" content="${page==='product'?'product':'website'}"><meta property="og:site_name" content="Anom Tech"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}">${image?`<meta property="og:image" content="${escape(image)}"><meta name="twitter:card" content="summary_large_image">`:''}<link rel="icon" href="/images/icon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/repairs.css?v=20261005-seo1"><script src="/store.js" defer></script>${schemas.map(jsonLd).join('')}</head><body class="text-white loaded" data-page="${page}">${header}<main id="main">${content}</main>${footer}${dialogs}${support}<div id="dcToast" role="status" aria-live="polite" hidden></div><noscript><p class="noscript-note">Enable JavaScript to use the cart and forms. You can also contact us on <a href="https://wa.me/263713047114">WhatsApp</a>.</p></noscript>${data?`<script type="application/json" id="pageData">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>`:''}</body></html>`;
}

function shop(url,products){const q=(url.searchParams.get('q')||'').slice(0,150),cat=url.searchParams.get('category')||url.pathname.split('/')[2]||'all',condition=url.searchParams.get('condition')||'',sort=url.searchParams.get('sort')||'featured',brand=url.searchParams.get('brand')||'';
 let filtered=products.filter(p=>(cat==='all'||p.category===cat)&&(!condition||p.condition===condition)&&(!brand||p.brand===brand)&&p.name.toLowerCase().includes(q.toLowerCase()));
 if(sort==='name')filtered.sort((a,b)=>a.name.localeCompare(b.name));
 const activeFilters=[q,cat!=='all'?cat:'',condition,brand].filter(Boolean).length;
 return shopHero+`<section id="shop-catalog" class="shop-catalog max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div class="shop-catalog-heading">
    <div><span class="shop-section-kicker">SHOP COMPONENTS</span><h2>Find the right hardware</h2></div>
    <p>Compare available parts, filter by your preferences and add components directly to your cart.</p>
  </div>
  <div class="shop-toolbar">
    <p class="shop-result-count"><strong>${filtered.length}</strong><span> ${filtered.length===1?'product':'products'}</span></p>
    <div class="category-pills"><a href="/shop" ${cat==='all'?'aria-current="page"':''}>All</a>${categories.map(c=>`<a href="/shop?category=${c.slug}" ${c.slug===cat?'aria-current="page"':''}>${c.name}</a>`).join('')}</div>
    <div class="shop-toolbar-actions"><button class="store-button secondary shop-filter-toggle" id="filterToggle" type="button" aria-controls="shopFilters" aria-expanded="false">${icon('sliders')} Filters${activeFilters?` <span>${activeFilters}</span>`:''}</button><button class="store-button secondary" id="viewToggle" type="button" aria-pressed="false">${icon('list')} List</button></div>
  </div>
  <div class="shop-layout">
    <aside id="shopFilters" class="shop-filter-panel glass-panel rounded-2xl">
      <div class="shop-filter-heading"><div><span>REFINE RESULTS</span><h2>Filters</h2></div><a href="/shop">Reset</a></div>
      <form action="/shop" id="filterForm" class="shop-filter-form">
        <label><span>Search products</span><input class="store-input" name="q" value="${escape(q)}" type="search" placeholder="Product name…"></label>
        <label><span>Category</span><select name="category" class="store-input"><option value="all">All categories</option>${categories.map(c=>`<option value="${c.slug}" ${c.slug===cat?'selected':''}>${c.name}</option>`).join('')}</select></label>
        <div class="shop-filter-row"><label><span>Condition</span><select class="store-input" name="condition"><option value="">All</option>${['new','used','refurbished'].map(c=>`<option ${c===condition?'selected':''} value="${c}">${c[0].toUpperCase()+c.slice(1)}</option>`).join('')}</select></label><label><span>Brand</span><select name="brand" class="store-input"><option value="">All</option>${[...new Set(products.map(p=>p.brand).filter(Boolean))].map(b=>`<option ${b===brand?'selected':''}>${escape(b)}</option>`).join('')}</select></label></div>
        <label><span>Sort products</span><select name="sort" class="store-input">${[['featured','Featured'],['name','Name A–Z']].map(([s,n])=>`<option value="${s}" ${s===sort?'selected':''}>${n}</option>`).join('')}</select></label>
        <button class="store-button w-full">Apply filters ${icon('arrow-right')}</button>
      </form>
    </aside>
    <div class="shop-results"><div id="shopProducts" class="store-product-grid">${filtered.length?filtered.map(card).join(''):`<div class="empty-state"><span class="empty-state-icon">${icon('search')}</span><h2>No matching products</h2><p>Try changing your search terms or removing some filters.</p><a class="store-button" href="/shop">View all products</a></div>`}</div></div>
  </div>
</section>`;}
function landingPage(def,products,path){
 const selected=products.filter(def.filter).slice(0,48);
 const usefulLinks=[
  ['/laptops','Laptops'],['/gaming-laptops','Gaming Laptops'],['/graphics-cards','Graphics Cards'],['/processors','Processors'],['/memory','RAM'],['/storage','NVMe SSDs'],['/monitors','Monitors'],['/pc-components','PC Components'],['/gaming-pcs','Gaming PCs'],['/custom-pc-builds','Custom PC Builds']
 ].filter(([href])=>href!==path).slice(0,8);
 return `<section class="seo-landing store-page"><nav class="product-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><strong>${escape(def.h1)}</strong></nav><div class="seo-landing-hero glass-panel"><span class="seo-kicker">${escape(def.kicker)}</span><h1>${escape(def.h1)}</h1><p>${escape(def.intro)}</p><div class="seo-hero-actions"><a class="store-button" href="${escape(def.cta)}">${escape(def.ctaText)} ${icon('arrow-right')}</a><a class="store-button secondary" href="/shop">Browse all products</a></div></div><div class="seo-copy-grid"><section class="glass-panel"><h2>PC hardware for customers in Harare and across Zimbabwe</h2><p>${escape(def.body)}</p><p>Need help choosing? WhatsApp Anom Tech on <a href="https://wa.me/263713047114">0713047114</a> or call <a href="tel:+263780756571">0780756571</a>.</p></section><aside class="glass-panel"><h2>Explore Anom Tech</h2><div class="seo-link-grid">${usefulLinks.map(([href,label])=>`<a href="${href}">${escape(label)} ${icon('chevron-right')}</a>`).join('')}</div></aside></div><section class="seo-products"><div class="product-section-heading"><div><span>Current catalogue</span><h2>${escape(def.label)}</h2></div><a href="/shop">View all products ${icon('arrow-right')}</a></div><div class="store-product-grid">${selected.length?selected.map(card).join(''):'<div class="empty-state"><h2>Ask us about availability</h2><p>Contact Anom Tech for current options in this category.</p><a class="store-button" href="/quote#quote-section">Request a quote</a></div>'}</div></section></section>`;
}
const localProductCopy=(p,cat)=>`Looking for ${p.name} in Zimbabwe? Anom Tech in Harare can help you confirm the current specification, compatibility, availability and selling price. This ${String(cat?.name||p.category).toLowerCase()} option can be considered for gaming, creator, workstation or upgrade requirements depending on the rest of your system. Contact us before ordering so we can help check that it fits your intended setup.`;
function product(p,products){const cat=categories.find(c=>c.slug===p.category),related=products.filter(x=>x.id!==p.id&&x.category===p.category).slice(0,4);return `<section class="product-page-shell relative min-h-screen overflow-hidden"><div class="product-page-glow absolute inset-0 pointer-events-none"></div><div class="product-page-container max-w-7xl mx-auto px-4 relative"><nav class="product-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/shop">Shop</a><span>/</span><a href="${categoryHref(p.category)}">${escape(cat?.name||p.category)}</a><span>/</span><strong>${escape(p.name)}</strong></nav><div class="product-hero-layout"><div class="product-gallery-card"><button id="main-gallery" data-zoom="/${escape(p.image)}" class="product-main-image" aria-label="Enlarge product image"><img src="/${escape(p.image)}" alt="${escape(p.name)}"><span class="product-zoom-hint">${icon('zoom-in')} Click to zoom</span></button><div class="product-gallery-note"><span>${icon('shield-check')} Quality checked</span><span>${icon('box-seam')} Securely packed</span></div></div><div class="product-purchase-card"><div class="product-meta-line"><span class="product-condition-badge">${escape(p.condition)}</span><span>${escape(p.brand||cat?.name||'Component')}</span></div><h1>${escape(p.name)}</h1><p class="product-summary">${escape(p.description)}</p><div class="product-price-row"><div><span class="product-price-label">Price</span><strong class="product-price">Contact for price</strong><small>Contact Anom Tech for current pricing and availability.</small></div><span class="product-stock-badge is-available">Availability on request</span></div><div class="product-buy-controls"><a href="/quote#quote-section" class="store-button product-primary-action">${icon('chat-square-text')} Request Price & Availability</a><button class="store-button secondary product-secondary-action" data-wish="${p.id}" aria-pressed="false">${icon('heart')} Save Product</button></div><div class="product-benefit-grid"><div><span class="product-benefit-icon">${icon('truck')}</span><span><strong>Zimbabwe Delivery</strong><small>Delivery arranged after enquiry</small></span></div><div><span class="product-benefit-icon">${icon('chat-square-text')}</span><span><strong>Quote Before Purchase</strong><small>Confirm price & availability first</small></span></div><div><span class="product-benefit-icon">${icon('headset')}</span><span><strong>Expert Support</strong><small>Help choosing compatible hardware</small></span></div></div><a href="https://wa.me/263713047114?text=${encodeURIComponent('Hello Anom Tech, I am interested in '+p.name+'. Please confirm specifications, availability, price and warranty.')}" target="_blank" rel="noopener noreferrer" class="product-whatsapp-link">${icon('whatsapp')} Ask about this product on WhatsApp</a></div></div><div class="product-details glass-panel"><div class="detail-tabs" role="tablist" aria-label="Product information">${['Description','Specifications','Availability & Delivery'].map((t,i)=>`<button type="button" role="tab" id="tab-${i}" aria-selected="${i===0}" aria-controls="panel-${i}" data-tab="${i}">${t}</button>`).join('')}</div><section role="tabpanel" id="panel-0" aria-labelledby="tab-0" class="product-tab-panel"><h2>About this product</h2><p>${escape(p.description)}</p><p>${escape(localProductCopy(p,cat))}</p></section><section role="tabpanel" id="panel-1" aria-labelledby="tab-1" class="product-tab-panel" hidden><h2>Specifications</h2><dl class="product-spec-list"><dt>Product</dt><dd>${escape(p.name)}</dd><dt>Brand</dt><dd>${escape(p.brand||'Not specified')}</dd><dt>Condition</dt><dd>${escape(p.condition)}</dd><dt>Category</dt><dd>${escape(cat?.name||p.category)}</dd>${p.watts?`<dt>Power</dt><dd>${escape(p.watts)} W</dd>`:''}<dt>Availability</dt><dd>Contact Anom Tech to confirm</dd></dl></section><section role="tabpanel" id="panel-2" aria-labelledby="tab-2" class="product-tab-panel" hidden><h2>Availability, delivery & warranty</h2><p>Contact Anom Tech to confirm current availability, price, delivery options and product-specific warranty terms before purchase. Delivery can be arranged within Zimbabwe.</p></section></div><section class="product-related-section"><div class="product-section-heading"><div><span>More to explore</span><h2>Related Products</h2></div><a href="${categoryHref(p.category)}">View category ${icon('arrow-right')}</a></div><div class="store-product-grid">${related.map(card).join('')||'<p>Explore more components in our <a href="/shop">shop</a>.</p>'}</div></section><section id="recentProducts" class="product-recent-section" hidden><div class="product-section-heading"><div><span>Your browsing</span><h2>Recently Viewed</h2></div></div><div class="store-product-grid"></div></section></div></section>`;}

const field=(name,label,type='text',max=190)=>`<label>${label}<input name="${name}" type="${type}" class="store-input" required maxlength="${max}" autocomplete="${{full_name:'name',email:'email',phone:'tel',city:'address-level2'}[name]||'off'}"></label>`;
function checkout(){return `<section class="store-page"><div class="text-center mb-12"><p class="text-brand-accent uppercase tracking-widest">Guest Checkout</p><h1 class="font-display text-4xl md:text-6xl font-bold">CHECK<span class="text-brand-accent">OUT</span></h1><p class="text-gray-400 mt-4">Complete your shipping details and place your Cash on Delivery order.</p></div><form id="checkoutForm" class="checkout-grid"><div class="space-y-6"><div class="glass-panel rounded-2xl p-6"><nav class="flex justify-between mb-8 text-sm" aria-label="Checkout progress"><a href="/cart">1 · Cart</a><span aria-current="step" class="text-brand-accent">2 · Shipping</span><span>3 · Complete</span></nav><h2 class="text-xl font-bold mb-5">Shipping Details</h2><div class="grid md:grid-cols-2 gap-4">${field('full_name','Full name')}${field('email','Email address','email',254)}${field('phone','Phone number','tel',50)}${field('city','City / Town','text',100)}</div><label class="block mt-4">Full delivery address<textarea name="address" class="store-input" required maxlength="1000" rows="4" autocomplete="street-address"></textarea></label></div><div class="glass-panel rounded-2xl p-6"><h2 class="text-xl font-bold mb-5">Payment Method</h2><label class="flex gap-3 p-4 rounded-xl border border-brand-accent/30 bg-brand-accent/10"><input type="radio" name="payment_method" value="cash_on_delivery" checked>Cash on Delivery</label><p class="text-sm text-gray-400 mt-4">No online card payment is taken.</p></div></div><aside class="glass-panel rounded-2xl p-6 h-fit"><h2 class="text-xl font-bold mb-5">Order Summary</h2><div id="checkoutSummary"><p>Loading your cart…</p></div><button class="store-button w-full mt-6" id="placeOrder" disabled>Place order</button><p class="form-status mt-4" role="status"></p></aside></form></section>`;}

export function page(url,products){
 const path=url.pathname.replace(/\/$/,'')||'/';
 let content,title,pageName,data=null,status=200,seo={origin:url.origin,canonicalPath:path};
 if(path==='/'){
  content=home;title='Gaming PCs, Laptops & PC Components Zimbabwe | Anom Tech';pageName='home';
  seo.description='Anom Tech in Harare supplies gaming PCs, laptops, graphics cards, processors, RAM, SSDs, monitors and custom PC builds in Zimbabwe.';
  seo.canonicalPath='/';
 }
 else if(path==='/about'){content=about;title='About Anom Tech | PC Hardware in Harare, Zimbabwe';pageName='about';seo.description='Learn about Anom Tech, a Harare-based PC hardware business serving customers looking for components, laptops, monitors and custom PC builds in Zimbabwe.';}
 else if(path==='/quote'){content=quote;title='PC Build & Hardware Quote Zimbabwe | Anom Tech';pageName='quote';seo.description='Request a quote from Anom Tech in Harare for PC components, laptops, monitors, gaming PCs and custom computer builds in Zimbabwe.';}
 else if(seoLandings[path]){
  const def=seoLandings[path];content=landingPage(def,products,path);title=def.title;pageName='seo-category';seo.description=def.description;
  seo.schemas=[breadcrumbSchema(url.origin,[{name:'Home',path:'/'},{name:def.h1,path}])];
 }
 else if(path==='/shop'||path.startsWith('/shop/')){
  content=shop(url,products);title='Shop PC Hardware & Laptops Zimbabwe | Anom Tech';pageName='shop';
  seo.description='Browse Anom Tech PC hardware, gaming laptops, monitors, processors, graphics cards, RAM and SSDs available to customers in Zimbabwe.';
  const cat=url.searchParams.get('category')||path.split('/')[2]||'';
  if(cat&&categoryPaths[cat])seo.canonicalPath=categoryHref(cat);else seo.canonicalPath='/shop';
  if(url.search||path.startsWith('/shop/'))seo.robots='noindex,follow,max-image-preview:large';
 }
 else if(/^\/product\/[^/]+$/.test(path)){
  const slug=decodeURIComponent(path.split('/')[2]||'');const p=products.find(p=>p.slug===slug);
  if(p){const cat=categories.find(c=>c.slug===p.category),categoryName=cat?.name||p.category;content=product(p,products);title=`${p.name} Zimbabwe | Anom Tech`;pageName='product';data=p;seo.description=`Enquire about ${p.name} in Zimbabwe. Contact Anom Tech in Harare for current ${categoryName.toLowerCase()} availability, specifications, compatibility and pricing.`;seo.image=p.image;seo.schemas=[
    {'@context':'https://schema.org','@type':'Product',name:p.name,image:[url.origin+'/'+p.image],description:p.description,sku:String(p.id),category:categoryName,url:url.origin+path,...(p.brand?{brand:{'@type':'Brand',name:p.brand}}:{})},
    breadcrumbSchema(url.origin,[{name:'Home',path:'/'},{name:categoryName,path:categoryHref(p.category)},{name:p.name,path}])
   ];}
 }
 else if(path==='/cart'||path==='/wishlist'){pageName=path.slice(1);title=(pageName==='cart'?'Shopping Cart':'Wishlist')+' | Anom Tech';content=`<section class="store-page"><h1 class="font-display text-4xl font-bold mb-10">${pageName==='cart'?'Shopping Cart':'Your Wishlist'}</h1><div data-${pageName==='cart'?'cart':'wishlist'}-content><p>Loading…</p></div><p class="text-sm text-gray-400 mt-6">Saved for this browser for 30 days. No account required.</p></section>`;seo.robots='noindex,nofollow';}
 else if(path==='/checkout'){content=checkout();title='Checkout | Anom Tech';pageName='checkout';seo.robots='noindex,nofollow';}
 else if(path.startsWith('/checkout/complete/')){content='<section class="store-page"><div id="orderConfirmation" class="glass-panel rounded-2xl p-8"><p>Loading order confirmation…</p></div></section>';title='Order Confirmation | Anom Tech';pageName='complete';data={id:path.split('/').at(-1)};seo.robots='noindex,nofollow';}
 if(!content){status=404;content='<section class="store-page empty-state"><h1>Page not found</h1><p>This page does not exist.</p><a href="/shop" class="store-button">Return to the shop</a></section>';title='Page not found | Anom Tech';pageName='not-found';seo.robots='noindex,nofollow';seo.canonicalPath='';}
 return {html:shell(content,title,pageName,data,seo),status};
}
export function sitemap(origin,products){
 const staticPaths=['/','/about','/quote','/shop',...landingPaths];
 const productPaths=products.map(p=>`/product/${encodeURIComponent(p.slug)}`);
 const urls=[...new Set([...staticPaths,...productPaths])];
 return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(path=>`  <url><loc>${escape(origin+path)}</loc></url>`).join('\n')}\n</urlset>`;
}
export function robots(origin){return `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /cart\nDisallow: /wishlist\nDisallow: /checkout\nSitemap: ${origin}/sitemap.xml\n`;}
