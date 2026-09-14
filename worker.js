// lib/catalog.json with { type: 'json' }
var catalog_default = {
  products: [
    {
      id: 1,
      name: "RTX 4070 Super",
      slug: "rtx-4070-super",
      price: 2799,
      priceCents: 279900,
      category: "graphics-cards",
      condition: "new",
      badge: "hot",
      image: "images/products/rtx-4070-super.png",
      brand: "NVIDIA",
      watts: 220,
      stock: 10,
      description: "Contact Digitron for full specifications, compatibility and warranty details."
    },
    {
      id: 2,
      name: "Ryzen 7 7800X3D",
      slug: "ryzen-7-7800x3d",
      price: 1699,
      priceCents: 169900,
      category: "processors",
      condition: "new",
      badge: "bestseller",
      image: "images/products/ryzen-7-7800x3d.png",
      brand: "AMD",
      watts: 120,
      stock: 10,
      description: "Contact Digitron for full specifications, compatibility and warranty details."
    },
    {
      id: 3,
      name: "DDR5 32GB 6000MHz",
      slug: "ddr5-32gb-6000mhz",
      price: 489,
      priceCents: 48900,
      category: "memory",
      condition: "new",
      badge: "",
      image: "images/products/ddr5-32gb.png",
      brand: "",
      watts: 0,
      stock: 10,
      description: "Contact Digitron for full specifications, compatibility and warranty details."
    },
    {
      id: 4,
      name: "NVMe SSD 1TB Gen4",
      slug: "nvme-ssd-1tb-gen4",
      price: 299,
      priceCents: 29900,
      category: "storage",
      condition: "new",
      badge: "sale",
      image: "images/products/nvme-1tb.png",
      brand: "",
      watts: 0,
      stock: 10,
      description: "Contact Digitron for full specifications, compatibility and warranty details."
    },
    {
      id: 5,
      name: "Used GTX 1660 Super",
      slug: "used-gtx-1660-super",
      price: 499,
      priceCents: 49900,
      category: "graphics-cards",
      condition: "used",
      badge: "used",
      image: "images/products/gtx-1660-super.png",
      brand: "NVIDIA",
      watts: 125,
      stock: 10,
      description: "Contact Digitron for full specifications, compatibility and warranty details."
    },
    {
      id: 6,
      name: "750W Gold PSU",
      slug: "750w-gold-psu",
      price: 349,
      priceCents: 34900,
      category: "power-supply",
      condition: "new",
      badge: "",
      image: "images/products/psu-750w.png",
      brand: "",
      watts: 0,
      stock: 10,
      description: "Contact Digitron for full specifications, compatibility and warranty details."
    },
    {
      id: 7,
      name: "Intel Core i9-14900K",
      slug: "intel-core-i9-14900k",
      price: 1899,
      priceCents: 189900,
      category: "processors",
      condition: "new",
      badge: "hot",
      image: "images/products/i9-14900k.png",
      brand: "Intel",
      watts: 125,
      stock: 10,
      description: "Contact Digitron for full specifications, compatibility and warranty details."
    },
    {
      id: 8,
      name: "ASUS ROG Motherboard",
      slug: "asus-rog-motherboard",
      price: 899,
      priceCents: 89900,
      category: "motherboards",
      condition: "new",
      badge: "",
      image: "images/products/asus-rog-mobo.png",
      brand: "ASUS",
      watts: 0,
      stock: 10,
      description: "Contact Digitron for full specifications, compatibility and warranty details."
    }
  ],
  categories: [
    {
      slug: "processors",
      name: "Processors",
      image: "images/categories/processors.png"
    },
    {
      slug: "graphics-cards",
      name: "Graphics Cards",
      image: "images/categories/gpu.png"
    },
    {
      slug: "memory",
      name: "Memory",
      image: "images/categories/ram.png"
    },
    {
      slug: "storage",
      name: "Storage",
      image: "images/categories/ssd.png"
    },
    {
      slug: "motherboards",
      name: "Motherboards",
      image: "images/categories/motherboards.png"
    },
    {
      slug: "power-supply",
      name: "Power Supplies",
      image: "images/categories/psu.png"
    }
  ]
};

// lib/db.js
function database(env) {
  if (!env.DB) throw new Error("Database is not configured");
  return env.DB;
}

// lib/api.js
var DAY = 864e5;
var now = () => Date.now();
var HttpError = class extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
};
var fail = (m, s) => {
  throw new HttpError(m, s);
};
function clean(v, max = 255, required = false) {
  if (typeof v !== "string") v = "";
  v = v.trim();
  if (v.length > max) fail("A field exceeds its maximum length.");
  if (required && !v) fail("Please complete all required fields.");
  return v;
}
function email(v) {
  v = clean(v, 254, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) fail("Enter a valid email address.");
  return v;
}
function quantity(v) {
  if (!Number.isInteger(v) || v < 1 || v > 10) fail("Quantity must be a whole number from 1 to 10.");
  return v;
}
function totals(items, settings = { tax_percent: "5", shipping_type: "free", shipping_flat_rate: "25", free_shipping_min: "500" }) {
  const subtotal = items.reduce((s, p) => s + p.price_cents * p.quantity, 0), tax = Math.round(subtotal * Number(settings.tax_percent || 0) / 100);
  const shipping = !subtotal || settings.shipping_type === "free" ? 0 : settings.shipping_type === "free_over" && subtotal >= Number(settings.free_shipping_min) * 100 ? 0 : Math.round(Number(settings.shipping_flat_rate || 0) * 100);
  return { subtotal, tax, shipping, total: subtotal + tax + shipping };
}
var seedPromise;
async function initialize(env) {
  if (!seedPromise) seedPromise = (async () => {
    const db = database(env);
    await db.batch([...catalog_default.products.map((p) => db.prepare("INSERT INTO products (id,slug,name,category,price_cents,stock,active,condition,image,brand,description) VALUES (?,?,?,?,?,?,1,?,?,?,?) ON CONFLICT(id) DO NOTHING").bind(p.id, p.slug, p.name, p.category, p.priceCents, p.stock, p.condition, p.image, p.brand, p.description)), ...Object.entries({ tax_percent: "5", shipping_type: "free", shipping_flat_rate: "25", free_shipping_min: "500" }).map(([k, v]) => db.prepare("INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO NOTHING").bind(k, v))]);
  })().catch((e) => {
    seedPromise = void 0;
    throw e;
  });
  return seedPromise;
}
async function products(env) {
  return (await database(env).prepare("SELECT * FROM products WHERE active=1 ORDER BY id").all()).results;
}
async function limit(request, env, kind, max = 30) {
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip)))).map((b) => b.toString(16).padStart(2, "0")).join("");
  const bucket = Math.floor(now() / 6e5), key = `${kind}:${hash}:${bucket}`;
  const row = await database(env).prepare("INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count").bind(key, now() + 12e5).first();
  if (row.count > max) fail("Too many requests. Please wait a few minutes and try again.", 429);
}
async function session(request, env) {
  const db = database(env), id = request.headers.get("Cookie")?.match(/(?:^|;\s*)digitron_guest=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (id) {
    const row = await db.prepare("SELECT id FROM sessions WHERE id=? AND expires>?").bind(id, now()).first();
    if (row) return { id, cookie: null };
  }
  await limit(request, env, "session", 50);
  const sid = Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2, "0")).join("");
  await db.prepare("INSERT INTO sessions (id,expires,created) VALUES (?,?,?)").bind(sid, now() + 30 * DAY, now()).run();
  return { id: sid, cookie: `digitron_guest=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${new URL(request.url).protocol === "https:" ? "; Secure" : ""}` };
}
async function state(env, sid) {
  const db = database(env);
  const [cart, wish, recent, settings] = await Promise.all([db.prepare("SELECT p.*,c.quantity FROM cart c JOIN products p ON p.id=c.product_id WHERE c.session=? ORDER BY p.id").bind(sid).all(), db.prepare("SELECT product_id FROM wishlist WHERE session=?").bind(sid).all(), db.prepare("SELECT product_id FROM recent WHERE session=? ORDER BY viewed DESC LIMIT 8").bind(sid).all(), db.prepare("SELECT key,value FROM settings").all()]);
  const config = Object.fromEntries(settings.results.map((r) => [r.key, r.value]));
  return { items: cart.results, wishlist: wish.results.map((r) => r.product_id), recent: recent.results.map((r) => r.product_id), ...totals(cart.results, config) };
}
function checkOrigin(request) {
  if (request.headers.get("Origin") !== new URL(request.url).origin) fail("This request must come from this website.", 403);
  if (request.headers.get("Sec-Fetch-Site") === "cross-site") fail("Cross-site request blocked.", 403);
}
async function limitedBytes(request, max) {
  if (Number(request.headers.get("Content-Length") || 0) > max) fail("Request too large.", 413);
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader(), chunks = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) {
      await reader.cancel();
      fail("Request too large.", 413);
    }
    chunks.push(value);
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}
async function jsonBody(request) {
  if (!request.headers.get("Content-Type")?.startsWith("application/json")) fail("Expected JSON.", 415);
  const str = new TextDecoder().decode(await limitedBytes(request, 16e3));
  try {
    return JSON.parse(str);
  } catch {
    fail("Invalid request.");
  }
}
async function placeOrder(request, env, sid, data) {
  const db = database(env), key = clean(data.request_key, 80, true);
  if (!/^[a-f0-9-]{20,80}$/i.test(key)) fail("Invalid checkout reference.");
  const existing = await db.prepare("SELECT id FROM orders WHERE session=? AND request_key=?").bind(sid, key).first();
  if (existing) return { ok: true, id: existing.id };
  const customer = { full_name: clean(data.full_name, 190, true), email: email(data.email), phone: clean(data.phone, 50, true), city: clean(data.city, 100, true), address: clean(data.address, 1e3, true) };
  if (data.payment_method !== "cash_on_delivery") fail("Only cash on delivery is available.");
  const s = await state(env, sid);
  if (!s.items.length) fail("Your cart is empty.");
  if (!Number.isInteger(data.expected_total) || data.expected_total !== s.total) fail("Your cart total changed. Review it before placing your order.", 409);
  for (const p of s.items) {
    quantity(p.quantity);
    if (!p.active || p.stock < p.quantity) fail(`${p.name} is no longer available in the requested quantity.`, 409);
  }
  const id = crypto.randomUUID();
  const statements = [db.prepare("INSERT INTO orders (id,session,request_key,full_name,email,phone,city,address,subtotal_cents,tax_cents,shipping_cents,total_cents,status,payment,created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(id, sid, key, customer.full_name, customer.email, customer.phone, customer.city, customer.address, s.subtotal, s.tax, s.shipping, s.total, "new", "cash_on_delivery", now()), ...s.items.map((p) => db.prepare("INSERT INTO order_items (order_id,product_id,name,quantity,price_cents) VALUES (?,?,?,?,?)").bind(id, p.id, p.name, p.quantity, p.price_cents)), ...s.items.map((p) => db.prepare("DELETE FROM cart WHERE session=? AND product_id=?").bind(sid, p.id))];
  try {
    await db.batch(statements);
  } catch (e) {
    const repeat = await db.prepare("SELECT id FROM orders WHERE session=? AND request_key=?").bind(sid, key).first();
    if (repeat) return { ok: true, id: repeat.id };
    if (/stock|price_changed|inactive|cart_changed/i.test(String(e))) fail("Stock or pricing changed during checkout. Please review your cart.", 409);
    throw e;
  }
  return { ok: true, id };
}
async function validateUpload(file) {
  if (file.size > 10 * 1024 * 1024) fail("Each attachment must be 10MB or smaller.", 413);
  const ext = file.name.toLowerCase().split(".").at(-1), bytes = new Uint8Array(await file.arrayBuffer());
  let mime = "";
  if (["jpg", "jpeg"].includes(ext) && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) mime = "image/jpeg";
  if (ext === "png" && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)) mime = "image/png";
  if (ext === "pdf" && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-") mime = "application/pdf";
  if (ext === "txt" && !bytes.includes(0)) {
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      mime = "text/plain";
    } catch {
    }
  }
  if (!mime) fail("Only valid JPG, PNG, PDF or UTF-8 TXT files are accepted.");
  return { mime, bytes };
}
async function quote(request, env, sid) {
  if (Number(request.headers.get("Content-Length") || 0) > 52 * 1024 * 1024) fail("Attachments exceed the upload limit.", 413);
  const form = await new Response(await limitedBytes(request, 52 * 1024 * 1024), { headers: request.headers }).formData();
  if (form.get("website")) fail("Invalid submission.");
  const type = clean(form.get("quote_type"), 100, true);
  if (!["gaming-pc", "workstation", "streaming", "part-request", "pre-built", "upgrade", "repair", "bulk"].includes(type)) fail("Choose a quote type.");
  const customer = { name: clean(form.get("full_name"), 255, true), email: email(form.get("email")), phone: clean(form.get("phone"), 50), area: clean(form.get("area"), 100), message: clean(form.get("message"), 5e3) };
  const budget = clean(form.get("budget"), 20);
  if (budget && (!Number.isFinite(Number(budget)) || Number(budget) < 0 || Number(budget) > 1e7)) fail("Enter a valid budget.");
  const useCases = form.getAll("use_case[]").map((v) => clean(v, 50));
  if (useCases.length > 8) fail("Too many use cases.");
  const files = form.getAll("attachments[]").filter((f) => typeof f !== "string" && f.size > 0);
  if (files.length > 5) fail("Attach no more than five files.");
  const checked = [];
  for (const f of files) checked.push({ file: f, ...await validateUpload(f) });
  if (checked.length && !env.BUCKET) fail("File uploads are temporarily unavailable.", 503);
  const id = crypto.randomUUID(), uploaded = [], db = database(env);
  try {
    for (const f of checked) {
      const attachmentId = crypto.randomUUID(), key = `quotes/${id}/${attachmentId}`;
      await env.BUCKET.put(key, f.bytes, { httpMetadata: { contentType: f.mime, contentDisposition: "attachment" } });
      uploaded.push({ ...f, id: attachmentId, key });
    }
    await db.batch([db.prepare("INSERT INTO quotes (id,session,full_name,email,phone,area,quote_type,budget,message,details,created) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind(id, sid, customer.name, customer.email, customer.phone, customer.area, type, budget, customer.message, JSON.stringify({ use_case: useCases }), now()), ...uploaded.map((f) => db.prepare("INSERT INTO attachments (id,quote_id,filename,mime,size,object_key) VALUES (?,?,?,?,?,?)").bind(f.id, id, clean(f.file.name, 255, true), f.mime, f.file.size, f.key))]);
  } catch (e) {
    for (const f of uploaded) await env.BUCKET.delete(f.key).catch(() => {
    });
    throw e;
  }
  return { ok: true, id, message: "Your quote request has been saved. Keep reference " + id.slice(0, 8) + "." };
}
async function api(request, env, sid) {
  const db = database(env), url = new URL(request.url), path = url.pathname;
  if (request.method === "GET") {
    if (path === "/api/state") return state(env, sid);
    if (path === "/api/products") return { products: await products(env), categories: catalog_default.categories };
    if (path.startsWith("/api/orders/")) {
      const id = path.split("/").at(-1), order = await db.prepare("SELECT id,full_name,subtotal_cents,tax_cents,shipping_cents,total_cents,status,payment,created FROM orders WHERE id=? AND session=?").bind(id, sid).first();
      if (!order) fail("Order not found.", 404);
      const items = await db.prepare("SELECT name,quantity,price_cents FROM order_items WHERE order_id=?").bind(id).all();
      return { order, items: items.results };
    }
    fail("Not found.", 404);
  }
  if (request.method !== "POST") fail("Method not allowed.", 405);
  checkOrigin(request);
  await limit(request, env, path, path === "/api/quote" ? 5 : path === "/api/checkout" ? 10 : 60);
  if (path === "/api/quote") return quote(request, env, sid);
  const data = await jsonBody(request);
  if (!data || typeof data !== "object" || Array.isArray(data)) fail("Invalid request.");
  if (data.website) fail("Invalid submission.");
  if (path === "/api/cart") {
    if (data.action === "clear") {
      await db.prepare("DELETE FROM cart WHERE session=?").bind(sid).run();
      return state(env, sid);
    }
    const id = Number(data.id);
    if (!Number.isInteger(id)) fail("Invalid product.");
    if (data.action === "remove") {
      await db.prepare("DELETE FROM cart WHERE session=? AND product_id=?").bind(sid, id).run();
      return state(env, sid);
    }
    if (!["add", "set"].includes(data.action)) fail("Invalid cart action.");
    const qty = quantity(data.quantity);
    const p = await db.prepare("SELECT stock FROM products WHERE id=? AND active=1").bind(id).first();
    if (!p || p.stock < qty) fail("This quantity is not available.", 409);
    if (data.action === "add") {
      const result = await db.prepare("INSERT INTO cart (session,product_id,quantity) VALUES (?,?,?) ON CONFLICT(session,product_id) DO UPDATE SET quantity=cart.quantity+excluded.quantity WHERE cart.quantity+excluded.quantity<=MIN(10,?) RETURNING quantity").bind(sid, id, qty, p.stock).first();
      if (!result) fail("Quantity exceeds available stock or the 10-item limit.", 409);
    } else await db.prepare("INSERT INTO cart (session,product_id,quantity) VALUES (?,?,?) ON CONFLICT(session,product_id) DO UPDATE SET quantity=excluded.quantity").bind(sid, id, qty).run();
    return state(env, sid);
  }
  if (path === "/api/wishlist") {
    if (data.action === "clear") await db.prepare("DELETE FROM wishlist WHERE session=?").bind(sid).run();
    else {
      const id = Number(data.id);
      if (!Number.isInteger(id) || !await db.prepare("SELECT id FROM products WHERE id=? AND active=1").bind(id).first()) fail("Product not found.", 404);
      if (data.saved === true) await db.prepare("INSERT INTO wishlist (session,product_id) VALUES (?,?) ON CONFLICT DO NOTHING").bind(sid, id).run();
      else await db.prepare("DELETE FROM wishlist WHERE session=? AND product_id=?").bind(sid, id).run();
    }
    return state(env, sid);
  }
  if (path === "/api/recent") {
    const id = Number(data.id);
    if (!Number.isInteger(id) || !await db.prepare("SELECT id FROM products WHERE id=? AND active=1").bind(id).first()) fail("Product not found.", 404);
    await db.prepare("INSERT INTO recent (session,product_id,viewed) VALUES (?,?,?) ON CONFLICT(session,product_id) DO UPDATE SET viewed=excluded.viewed").bind(sid, id, now()).run();
    return { ok: true };
  }
  if (path === "/api/checkout") return placeOrder(request, env, sid, data);
  if (path === "/api/newsletter") {
    await db.prepare("INSERT INTO newsletter (email,created,status) VALUES (?,?,?) ON CONFLICT(email) DO NOTHING").bind(email(data.email), now(), "new").run();
    return { ok: true, message: "Thank you. Your subscription has been recorded." };
  }
  if (path === "/api/chat-lead") {
    const name = clean(data.name, 255, true), mail = email(data.email), phone = clean(data.phone, 50), message = clean(data.message, 2e3, true);
    await db.prepare("INSERT INTO chat_leads (id,session,name,email,phone,message,product_id,created) VALUES (?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(), sid, name, mail, phone, message, Number.isInteger(data.product_id) ? data.product_id : null, now()).run();
    return { ok: true, message: "Your support enquiry has been saved." };
  }
  fail("Not found.", 404);
}

// html-text:/workspace/sites/digitron-computers/templates/home.html
var home_default = `








<section id="vsHero" class="vs-hero" data-autoplay="1" data-interval="6500">
    
    <article class="vs-slide is-active vs-slide1">
        <div class="vs-bg-video" aria-hidden="true"></div>

        <div class="vs-overlay"></div>
        <div class="vs-content">
            <h1 class="vs-title">
                <span class="vs-white">Build Smarter.</span>
                
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-secondary">Shop Faster.</span>
            </h1>
            <p class="vs-text">
                New, used, and custom PCs \u2014 curated parts, trusted picks, and a smooth shopping experience for serious builders.
            </p>
            <a href="/shop" class="vs-btn">Shop Components</a>
        </div>
        <div class="vs-social">
            <a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
            <a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
            <a href="#" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>
        </div>
    </article>

    
    <article class="vs-slide vs-slide2">
        <div class="vs-bg-video" aria-hidden="true"></div>

        <div class="vs-overlay"></div>
        <div class="vs-content">
            <h1 class="vs-title">
                <span class="vs-white">Next-Gen CPUs</span>
                
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-secondary">for Every Build</span>
            </h1>
            <p class="vs-text">
                Shop Intel & AMD processors for gaming, streaming, and productivity \u2014 high clocks, more cores, and smooth performance.
            </p>
            <a href="/shop?category=processors" class="vs-btn">Shop Processors</a>
        </div>
        <div class="vs-social">
            <a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
            <a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
            <a href="#" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>
        </div>
    </article>

    
    <article class="vs-slide vs-slide3">
        <div class="vs-bg-video" aria-hidden="true"></div>

        <div class="vs-overlay"></div>
        <div class="vs-content">
            <h1 class="vs-title">
                <span class="vs-white">Power Your Build with the</span>
                
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-secondary">Right GPU</span>
            </h1>
            <p class="vs-text">
                Shop NVIDIA RTX and AMD Radeon graphics cards \u2014 smooth gaming, faster rendering, and the performance your setup deserves.
            </p>
            <a href="/shop?category=graphics-cards" class="vs-btn">Shop Graphics Cards</a>
        </div>
        <div class="vs-social">
            <a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
            <a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
            <a href="#" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>
        </div>
    </article>

    
    <div class="vs-dots" aria-label="Slider dots"></div>
</section>



<section class="dc-showcase-section relative py-16 overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-[150px]"></div>
        <div class="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-secondary/5 rounded-full blur-[120px]"></div>
        <div class="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-16">

            
            <div class="lg:col-span-7 min-w-0 relative z-10">
                
                <div class="dc-poster-slider relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50" id="dcPosterSlider">
                    <div class="dc-poster-track relative w-full">
                        
                        <div class="dc-poster-slide is-active" data-index="0">
                            <img
                                src="/images/slide1.jpg"
                                alt="Showcase Poster"
                                class="dc-poster-image w-full h-auto block">
                        </div>
                        
                        <div class="dc-poster-slide " data-index="1">
                            <img
                                src="/images/slide2.jpg"
                                alt="Showcase Poster"
                                class="dc-poster-image w-full h-auto block">
                        </div>
                        
                        <div class="dc-poster-slide " data-index="2">
                            <img
                                src="/images/slide3.jpg"
                                alt="Showcase Poster"
                                class="dc-poster-image w-full h-auto block">
                        </div>
                        
                    </div>

                    
                    <button type="button" class="dc-poster-arrow prev absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-brand-accent hover:text-black hover:border-brand-accent transition-all z-10">
                        <i class="bi bi-chevron-left text-xl"></i>
                    </button>

                    <button type="button" class="dc-poster-arrow next absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-brand-accent hover:text-black hover:border-brand-accent transition-all z-10">
                        <i class="bi bi-chevron-right text-xl"></i>
                    </button>

                    <div class="dc-poster-dots absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        
                        <button class="w-2 h-2 rounded-full bg-white/30 transition-all w-8 bg-brand-accent" data-index="0"></button>
                        
                        <button class="w-2 h-2 rounded-full bg-white/30 transition-all " data-index="1"></button>
                        
                        <button class="w-2 h-2 rounded-full bg-white/30 transition-all " data-index="2"></button>
                        
                    </div>

                    <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                        <div class="dc-poster-progress h-full bg-brand-accent transition-all duration-300" style="width: 0%"></div>
                    </div>
                    
                </div>
            </div>

            
            

            <div class="lg:col-span-5 min-w-0 relative z-20">
                <div class="grid grid-cols-1 gap-4">
                    
                    

                    <a href="/shop?category=processors"
                        class="dc-promo-card group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] min-h-[154px] hover:border-brand-accent/50 transition-all duration-500 hover:-translate-y-1">
                        <div class="absolute inset-0 bg-gradient-to-br from-brand-accent/20 to-brand-secondary/10 opacity-100 transition-opacity duration-500"></div>

                        <div class="relative flex h-full items-center gap-4 p-6">
                            <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl transition-all duration-300 group-hover:scale-110 bg-brand-accent/10 text-brand-accent group-hover:bg-brand-accent group-hover:text-black">
                                <i class="bi bi-cpu-fill"></i>
                            </div>

                            <div class="min-w-0 flex-1">
                                <h4 class="text-xl font-bold text-white transition-colors group-hover:text-brand-accent">
                                    Processors
                                </h4>
                                <p class="mt-2 text-sm leading-6 text-gray-300">
                                    Explore live CPU listings from our current collection.
                                </p>
                            </div>

                            <i class="bi bi-arrow-right shrink-0 text-gray-400 transition-all group-hover:translate-x-2 group-hover:text-brand-accent"></i>
                        </div>
                    </a>
                    
                    

                    <a href="/shop?category=graphics-cards"
                        class="dc-promo-card group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] min-h-[154px] hover:border-brand-accent/50 transition-all duration-500 hover:-translate-y-1">
                        <div class="absolute inset-0 bg-gradient-to-br from-brand-accent/20 to-brand-secondary/10 opacity-100 transition-opacity duration-500"></div>

                        <div class="relative flex h-full items-center gap-4 p-6">
                            <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl transition-all duration-300 group-hover:scale-110 bg-brand-accent/10 text-brand-accent group-hover:bg-brand-accent group-hover:text-black">
                                <i class="bi bi-gpu-card"></i>
                            </div>

                            <div class="min-w-0 flex-1">
                                <h4 class="text-xl font-bold text-white transition-colors group-hover:text-brand-accent">
                                    Graphics Cards
                                </h4>
                                <p class="mt-2 text-sm leading-6 text-gray-300">
                                    Browse powerful GPUs for gaming and creator builds.
                                </p>
                            </div>

                            <i class="bi bi-arrow-right shrink-0 text-gray-400 transition-all group-hover:translate-x-2 group-hover:text-brand-accent"></i>
                        </div>
                    </a>
                    
                    

                    <a href="/shop?category=memory"
                        class="dc-promo-card group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] min-h-[154px] hover:border-brand-accent/50 transition-all duration-500 hover:-translate-y-1">
                        <div class="absolute inset-0 bg-gradient-to-br from-brand-accent/20 to-brand-secondary/10 opacity-100 transition-opacity duration-500"></div>

                        <div class="relative flex h-full items-center gap-4 p-6">
                            <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl transition-all duration-300 group-hover:scale-110 bg-brand-accent/10 text-brand-accent group-hover:bg-brand-accent group-hover:text-black">
                                <i class="bi bi-memory"></i>
                            </div>

                            <div class="min-w-0 flex-1">
                                <h4 class="text-xl font-bold text-white transition-colors group-hover:text-brand-accent">
                                    Memory
                                </h4>
                                <p class="mt-2 text-sm leading-6 text-gray-300">
                                    Find RAM and performance upgrades available right now.
                                </p>
                            </div>

                            <i class="bi bi-arrow-right shrink-0 text-gray-400 transition-all group-hover:translate-x-2 group-hover:text-brand-accent"></i>
                        </div>
                    </a>
                    
                </div>
            </div>
        </div>

        
        <div class="dc-categories-section relative mt-2">
            <div class="flex items-end justify-between mb-10">
                <div>
                    <span class="text-brand-accent text-sm font-bold uppercase tracking-[0.3em] mb-2 block">Browse</span>
                    <h2 class="text-4xl md:text-5xl font-display font-bold">
                        SHOP BY
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-secondary">CATEGORY</span>
                    </h2>
                </div>

                <a href="/shop" class="hidden md:inline-flex items-center gap-2 text-gray-400 hover:text-brand-accent transition-colors group">
                    View All Categories
                    <i class="bi bi-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </a>
            </div>

            <div class="dc-categories-orbit relative">
                <div class="absolute inset-0 pointer-events-none overflow-hidden">
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full"></div>
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full"></div>
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full"></div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10" id="dcCategoriesGrid">
                    

                    
                    

                    <a href="/shop?category=processors"
                        class="dc-orbit-category group relative flex flex-col items-center"
                        data-color="#00f0ff"
                        style="--orbit-color: #00f0ff">
                        <div class="dc-orbit-ring absolute inset-0 rounded-full border-2 border-dashed border-white/10 group-hover:border-[var(--orbit-color)]/30 group-hover:animate-spin-slow transition-all duration-500 orbit-speed-20"></div>

                        <div class="dc-orbit-glow absolute inset-4 rounded-full bg-[var(--orbit-color)]/0 group-hover:bg-[var(--orbit-color)]/20 blur-xl transition-all duration-500 group-hover:scale-150"></div>

                        <div class="dc-orbit-circle relative w-32 h-32 md:w-40 md:h-40 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-1 group-hover:scale-110 group-hover:border-[var(--orbit-color)]/50 transition-all duration-500 overflow-hidden">
                            <div class="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden relative">
                                <img src="/images/categories/processors.png" alt="Processors"
                                    class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 mix-blend-screen">
                                <div class="absolute inset-0 bg-gradient-to-t from-[var(--orbit-color)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        </div>

                        <div class="mt-6 text-center relative">
                            <h3 class="text-lg font-bold text-white group-hover:text-[var(--orbit-color)] transition-colors">Processors</h3>
                            <span class="text-xs text-gray-500 group-hover:text-gray-300 transition-colors flex items-center justify-center gap-1 mt-1">
                                Explore <i class="bi bi-arrow-right opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"></i>
                            </span>
                        </div>
                    </a>
                    
                    

                    <a href="/shop?category=graphics-cards"
                        class="dc-orbit-category group relative flex flex-col items-center"
                        data-color="#7000ff"
                        style="--orbit-color: #7000ff">
                        <div class="dc-orbit-ring absolute inset-0 rounded-full border-2 border-dashed border-white/10 group-hover:border-[var(--orbit-color)]/30 group-hover:animate-spin-slow transition-all duration-500 orbit-speed-25"></div>

                        <div class="dc-orbit-glow absolute inset-4 rounded-full bg-[var(--orbit-color)]/0 group-hover:bg-[var(--orbit-color)]/20 blur-xl transition-all duration-500 group-hover:scale-150"></div>

                        <div class="dc-orbit-circle relative w-32 h-32 md:w-40 md:h-40 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-1 group-hover:scale-110 group-hover:border-[var(--orbit-color)]/50 transition-all duration-500 overflow-hidden">
                            <div class="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden relative">
                                <img src="/images/categories/gpu.png" alt="Graphics Cards"
                                    class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 mix-blend-screen">
                                <div class="absolute inset-0 bg-gradient-to-t from-[var(--orbit-color)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        </div>

                        <div class="mt-6 text-center relative">
                            <h3 class="text-lg font-bold text-white group-hover:text-[var(--orbit-color)] transition-colors">Graphics Cards</h3>
                            <span class="text-xs text-gray-500 group-hover:text-gray-300 transition-colors flex items-center justify-center gap-1 mt-1">
                                Explore <i class="bi bi-arrow-right opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"></i>
                            </span>
                        </div>
                    </a>
                    
                    

                    <a href="/shop?category=memory"
                        class="dc-orbit-category group relative flex flex-col items-center"
                        data-color="#00ff88"
                        style="--orbit-color: #00ff88">
                        <div class="dc-orbit-ring absolute inset-0 rounded-full border-2 border-dashed border-white/10 group-hover:border-[var(--orbit-color)]/30 group-hover:animate-spin-slow transition-all duration-500 orbit-speed-30"></div>

                        <div class="dc-orbit-glow absolute inset-4 rounded-full bg-[var(--orbit-color)]/0 group-hover:bg-[var(--orbit-color)]/20 blur-xl transition-all duration-500 group-hover:scale-150"></div>

                        <div class="dc-orbit-circle relative w-32 h-32 md:w-40 md:h-40 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-1 group-hover:scale-110 group-hover:border-[var(--orbit-color)]/50 transition-all duration-500 overflow-hidden">
                            <div class="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden relative">
                                <img src="/images/categories/ram.png" alt="Memory"
                                    class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 mix-blend-screen">
                                <div class="absolute inset-0 bg-gradient-to-t from-[var(--orbit-color)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        </div>

                        <div class="mt-6 text-center relative">
                            <h3 class="text-lg font-bold text-white group-hover:text-[var(--orbit-color)] transition-colors">Memory</h3>
                            <span class="text-xs text-gray-500 group-hover:text-gray-300 transition-colors flex items-center justify-center gap-1 mt-1">
                                Explore <i class="bi bi-arrow-right opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"></i>
                            </span>
                        </div>
                    </a>
                    
                    

                    <a href="/shop?category=storage"
                        class="dc-orbit-category group relative flex flex-col items-center"
                        data-color="#ffaa00"
                        style="--orbit-color: #ffaa00">
                        <div class="dc-orbit-ring absolute inset-0 rounded-full border-2 border-dashed border-white/10 group-hover:border-[var(--orbit-color)]/30 group-hover:animate-spin-slow transition-all duration-500 orbit-speed-35"></div>

                        <div class="dc-orbit-glow absolute inset-4 rounded-full bg-[var(--orbit-color)]/0 group-hover:bg-[var(--orbit-color)]/20 blur-xl transition-all duration-500 group-hover:scale-150"></div>

                        <div class="dc-orbit-circle relative w-32 h-32 md:w-40 md:h-40 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-1 group-hover:scale-110 group-hover:border-[var(--orbit-color)]/50 transition-all duration-500 overflow-hidden">
                            <div class="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden relative">
                                <img src="/images/categories/ssd.png" alt="Storage"
                                    class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 mix-blend-screen">
                                <div class="absolute inset-0 bg-gradient-to-t from-[var(--orbit-color)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        </div>

                        <div class="mt-6 text-center relative">
                            <h3 class="text-lg font-bold text-white group-hover:text-[var(--orbit-color)] transition-colors">Storage</h3>
                            <span class="text-xs text-gray-500 group-hover:text-gray-300 transition-colors flex items-center justify-center gap-1 mt-1">
                                Explore <i class="bi bi-arrow-right opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"></i>
                            </span>
                        </div>
                    </a>
                    
                    

                    <a href="/shop?category=motherboards"
                        class="dc-orbit-category group relative flex flex-col items-center"
                        data-color="#ff2d55"
                        style="--orbit-color: #ff2d55">
                        <div class="dc-orbit-ring absolute inset-0 rounded-full border-2 border-dashed border-white/10 group-hover:border-[var(--orbit-color)]/30 group-hover:animate-spin-slow transition-all duration-500 orbit-speed-40"></div>

                        <div class="dc-orbit-glow absolute inset-4 rounded-full bg-[var(--orbit-color)]/0 group-hover:bg-[var(--orbit-color)]/20 blur-xl transition-all duration-500 group-hover:scale-150"></div>

                        <div class="dc-orbit-circle relative w-32 h-32 md:w-40 md:h-40 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-1 group-hover:scale-110 group-hover:border-[var(--orbit-color)]/50 transition-all duration-500 overflow-hidden">
                            <div class="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden relative">
                                <img src="/images/categories/motherboards.png" alt="Motherboards"
                                    class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 mix-blend-screen">
                                <div class="absolute inset-0 bg-gradient-to-t from-[var(--orbit-color)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        </div>

                        <div class="mt-6 text-center relative">
                            <h3 class="text-lg font-bold text-white group-hover:text-[var(--orbit-color)] transition-colors">Motherboards</h3>
                            <span class="text-xs text-gray-500 group-hover:text-gray-300 transition-colors flex items-center justify-center gap-1 mt-1">
                                Explore <i class="bi bi-arrow-right opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"></i>
                            </span>
                        </div>
                    </a>
                    
                    

                    <a href="/shop?category=power-supply"
                        class="dc-orbit-category group relative flex flex-col items-center"
                        data-color="#38bdf8"
                        style="--orbit-color: #38bdf8">
                        <div class="dc-orbit-ring absolute inset-0 rounded-full border-2 border-dashed border-white/10 group-hover:border-[var(--orbit-color)]/30 group-hover:animate-spin-slow transition-all duration-500 orbit-speed-45"></div>

                        <div class="dc-orbit-glow absolute inset-4 rounded-full bg-[var(--orbit-color)]/0 group-hover:bg-[var(--orbit-color)]/20 blur-xl transition-all duration-500 group-hover:scale-150"></div>

                        <div class="dc-orbit-circle relative w-32 h-32 md:w-40 md:h-40 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-1 group-hover:scale-110 group-hover:border-[var(--orbit-color)]/50 transition-all duration-500 overflow-hidden">
                            <div class="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden relative">
                                <img src="/images/categories/psu.png" alt="Power Supplies"
                                    class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 mix-blend-screen">
                                <div class="absolute inset-0 bg-gradient-to-t from-[var(--orbit-color)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        </div>

                        <div class="mt-6 text-center relative">
                            <h3 class="text-lg font-bold text-white group-hover:text-[var(--orbit-color)] transition-colors">Power Supplies</h3>
                            <span class="text-xs text-gray-500 group-hover:text-gray-300 transition-colors flex items-center justify-center gap-1 mt-1">
                                Explore <i class="bi bi-arrow-right opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"></i>
                            </span>
                        </div>
                    </a>
                    
                </div>

                <div class="mt-8 text-center md:hidden">
                    <a href="/shop" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white hover:border-brand-accent hover:text-brand-accent transition-colors">
                        View All Categories
                        <i class="bi bi-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>

        
        <div class="mt-16 glass-panel rounded-2xl p-6 border border-white/10">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                
                <div class="relative">
                    <div class="text-3xl font-display font-bold mb-1 text-white counter" data-target="8">
                        0
                    </div>
                    <div class="text-xs text-gray-500 uppercase tracking-wider">
                        Products in supplied catalog
                    </div>
                </div>
                
                <div class="relative">
                    <div class="text-3xl font-display font-bold mb-1 text-brand-accent counter" data-target="6">
                        0
                    </div>
                    <div class="text-xs text-gray-500 uppercase tracking-wider">
                        Categories
                    </div>
                </div>
                
                <div class="relative">
                    <div class="text-3xl font-display font-bold mb-1 text-brand-secondary counter" data-target="4">
                        0
                    </div>
                    <div class="text-xs text-gray-500 uppercase tracking-wider">
                        Named Brands
                    </div>
                </div>
                
                <div class="relative">
                    <div class="text-3xl font-display font-bold mb-1 text-white counter" data-target="7">
                        0
                    </div>
                    <div class="text-xs text-gray-500 uppercase tracking-wider">
                        UAE Emirates
                    </div>
                </div>
                
            </div>
        </div>
    </div>
</section>




<section class="catHeroWrap catHeroFull relative z-10 py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
            id="catHero"
            class="catHero catHeroFullInner"
            data-autoplay="1"
            data-interval="5200"
            data-shop-base="/shop"
            data-slides='[{&quot;cat&quot;:&quot;processors&quot;,&quot;kicker&quot;:&quot;Upgrade your build&quot;,&quot;title&quot;:&quot;Processors&quot;,&quot;name&quot;:&quot;Processors&quot;,&quot;desc&quot;:&quot;Explore our processors collection.&quot;,&quot;accent&quot;:&quot;#00f0ff&quot;,&quot;img&quot;:&quot;/images/categories/processors.png&quot;},{&quot;cat&quot;:&quot;graphics-cards&quot;,&quot;kicker&quot;:&quot;Upgrade your build&quot;,&quot;title&quot;:&quot;Graphics Cards&quot;,&quot;name&quot;:&quot;Graphics Cards&quot;,&quot;desc&quot;:&quot;Explore our graphics cards collection.&quot;,&quot;accent&quot;:&quot;#00f0ff&quot;,&quot;img&quot;:&quot;/images/categories/gpu.png&quot;},{&quot;cat&quot;:&quot;memory&quot;,&quot;kicker&quot;:&quot;Upgrade your build&quot;,&quot;title&quot;:&quot;Memory&quot;,&quot;name&quot;:&quot;Memory&quot;,&quot;desc&quot;:&quot;Explore our memory collection.&quot;,&quot;accent&quot;:&quot;#00f0ff&quot;,&quot;img&quot;:&quot;/images/categories/ram.png&quot;},{&quot;cat&quot;:&quot;storage&quot;,&quot;kicker&quot;:&quot;Upgrade your build&quot;,&quot;title&quot;:&quot;Storage&quot;,&quot;name&quot;:&quot;Storage&quot;,&quot;desc&quot;:&quot;Explore our storage collection.&quot;,&quot;accent&quot;:&quot;#00f0ff&quot;,&quot;img&quot;:&quot;/images/categories/ssd.png&quot;},{&quot;cat&quot;:&quot;motherboards&quot;,&quot;kicker&quot;:&quot;Upgrade your build&quot;,&quot;title&quot;:&quot;Motherboards&quot;,&quot;name&quot;:&quot;Motherboards&quot;,&quot;desc&quot;:&quot;Explore our motherboards collection.&quot;,&quot;accent&quot;:&quot;#00f0ff&quot;,&quot;img&quot;:&quot;/images/categories/motherboards.png&quot;},{&quot;cat&quot;:&quot;power-supply&quot;,&quot;kicker&quot;:&quot;Upgrade your build&quot;,&quot;title&quot;:&quot;Power Supplies&quot;,&quot;name&quot;:&quot;Power Supplies&quot;,&quot;desc&quot;:&quot;Explore our power supplies collection.&quot;,&quot;accent&quot;:&quot;#00f0ff&quot;,&quot;img&quot;:&quot;/images/categories/psu.png&quot;}]'>

            <div class="catHeroHead catHeroHeadOverlay">
                <div>
                    <span class="text-brand-accent text-sm font-bold uppercase tracking-[0.28em] block mb-2">
                        Upgrade Paths
                    </span>
                    <h2>Explore Performance Zones</h2>
                </div>

                <a href="/shop">View all categories</a>
            </div>

            <div class="catHeroStage"></div>

            <div class="catHeroNav">
                <button type="button" class="catPrev" aria-label="Previous">\u2039</button>
                <button type="button" class="catNext" aria-label="Next">\u203A</button>
            </div>

            <div class="catHeroDots" aria-label="Dots"></div>
        </div>
    </div>
</section>





<section id="builder" class="py-24 relative">
    
    <div class="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

    <div class="text-center mb-16 reveal-text">
        
        <h2 class="text-4xl md:text-5xl font-display font-bold mb-4">
                            CUSTOM <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-secondary">PC BUILDER</span>
                        </h2>
        <p class="text-gray-400 max-w-2xl mx-auto">Select your components and see your dream PC come to life. Choose your core components and request expert compatibility advice.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div class="lg:col-span-8 space-y-6">
            

            
            <div class="glass-panel rounded-xl p-6 component-category" data-category="cpu">
                <div class="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                    <h3 class="text-xl font-bold flex items-center gap-2">
                        <i class="bi bi-cpu text-brand-accent"></i> Processor
                    </h3>

                    <div class="flex items-center gap-2">
                        <button type="button" class="builder-nav builder-prev w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                            data-target="#cpuTrack">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                        <button type="button" class="builder-nav builder-next w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                            data-target="#cpuTrack">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>

                
                <div id="cpuTrack" class="builder-track flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2">
                    
                    

                    <div class="component-card min-w-[260px] md:min-w-[280px] snap-start bg-[#0f1115] p-4 rounded-lg border border-white/10 hover:border-white/20 transition relative cursor-pointer group"
                        data-payload='{&quot;id&quot;:2,&quot;name&quot;:&quot;Ryzen 7 7800X3D&quot;,&quot;slug&quot;:&quot;ryzen-7-7800x3d&quot;,&quot;price&quot;:1699,&quot;priceCents&quot;:169900,&quot;category&quot;:&quot;processors&quot;,&quot;condition&quot;:&quot;new&quot;,&quot;badge&quot;:&quot;bestseller&quot;,&quot;image&quot;:&quot;images/products/ryzen-7-7800x3d.png&quot;,&quot;brand&quot;:&quot;AMD&quot;,&quot;watts&quot;:120,&quot;stock&quot;:10,&quot;description&quot;:&quot;Contact Digitron for full specifications, compatibility and warranty details.&quot;,&quot;type&quot;:&quot;processors&quot;}'
                        onclick="selectComponentFromCard('cpu', this)">
                        <div class="h-32 bg-white/[0.03] border border-white/5 rounded mb-3 overflow-hidden relative">
                            <img src="/images/products/ryzen-7-7800x3d.png" class="w-full h-full object-contain p-3 opacity-80 group-hover:opacity-100 transition-opacity" alt="Ryzen 7 7800X3D">
                        </div>

                        <h4 class="font-bold text-sm truncate">Ryzen 7 7800X3D</h4>
                        <p class="text-xs text-gray-400 mt-1 line-clamp-1">\u2014</p>

                        <div class="mt-3 flex justify-between items-center">
                            <span class="text-brand-accent font-bold">AED 1,699</span>
                            <div class="w-2 h-2 rounded-full bg-gray-600 status-dot"></div>
                        </div>
                    </div>
                    
                    

                    <div class="component-card min-w-[260px] md:min-w-[280px] snap-start bg-[#0f1115] p-4 rounded-lg border border-white/10 hover:border-white/20 transition relative cursor-pointer group"
                        data-payload='{&quot;id&quot;:7,&quot;name&quot;:&quot;Intel Core i9-14900K&quot;,&quot;slug&quot;:&quot;intel-core-i9-14900k&quot;,&quot;price&quot;:1899,&quot;priceCents&quot;:189900,&quot;category&quot;:&quot;processors&quot;,&quot;condition&quot;:&quot;new&quot;,&quot;badge&quot;:&quot;hot&quot;,&quot;image&quot;:&quot;images/products/i9-14900k.png&quot;,&quot;brand&quot;:&quot;Intel&quot;,&quot;watts&quot;:125,&quot;stock&quot;:10,&quot;description&quot;:&quot;Contact Digitron for full specifications, compatibility and warranty details.&quot;,&quot;type&quot;:&quot;processors&quot;}'
                        onclick="selectComponentFromCard('cpu', this)">
                        <div class="h-32 bg-white/[0.03] border border-white/5 rounded mb-3 overflow-hidden relative">
                            <img src="/images/products/i9-14900k.png" class="w-full h-full object-contain p-3 opacity-80 group-hover:opacity-100 transition-opacity" alt="Intel Core i9-14900K">
                        </div>

                        <h4 class="font-bold text-sm truncate">Intel Core i9-14900K</h4>
                        <p class="text-xs text-gray-400 mt-1 line-clamp-1">\u2014</p>

                        <div class="mt-3 flex justify-between items-center">
                            <span class="text-brand-accent font-bold">AED 1,899</span>
                            <div class="w-2 h-2 rounded-full bg-gray-600 status-dot"></div>
                        </div>
                    </div>
                    
                </div>
                
            </div>

            
            <div class="glass-panel rounded-xl p-6 component-category" data-category="gpu">
                <div class="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                    <h3 class="text-xl font-bold flex items-center gap-2">
                        <i class="bi bi-gpu-card text-brand-secondary"></i> Graphics Card
                    </h3>

                    <div class="flex items-center gap-2">
                        <button type="button" class="builder-nav builder-prev w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                            data-target="#gpuTrack">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                        <button type="button" class="builder-nav builder-next w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                            data-target="#gpuTrack">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>

                
                <div id="gpuTrack"
                    class="builder-track flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2">
                    

                    

                    <div class="component-card min-w-[260px] md:min-w-[280px] snap-start bg-[#0f1115] p-4 rounded-lg border border-white/5 cursor-pointer group"
                        data-payload='{&quot;id&quot;:1,&quot;name&quot;:&quot;RTX 4070 Super&quot;,&quot;slug&quot;:&quot;rtx-4070-super&quot;,&quot;price&quot;:2799,&quot;priceCents&quot;:279900,&quot;category&quot;:&quot;graphics-cards&quot;,&quot;condition&quot;:&quot;new&quot;,&quot;badge&quot;:&quot;hot&quot;,&quot;image&quot;:&quot;images/products/rtx-4070-super.png&quot;,&quot;brand&quot;:&quot;NVIDIA&quot;,&quot;watts&quot;:220,&quot;stock&quot;:10,&quot;description&quot;:&quot;Contact Digitron for full specifications, compatibility and warranty details.&quot;,&quot;type&quot;:&quot;graphics-cards&quot;}'
                        onclick="selectComponentFromCard('gpu', this)">
                        <div class="h-32 bg-white/[0.03] border border-white/5 rounded mb-3 overflow-hidden relative">
                            <img src="/images/products/rtx-4070-super.png"
                                class="w-full h-full object-contain p-3 opacity-80 group-hover:opacity-100 transition-opacity"
                                alt="RTX 4070 Super">
                        </div>

                        <h4 class="font-bold text-sm truncate">RTX 4070 Super</h4>
                        <p class="text-xs text-gray-400 mt-1 line-clamp-1">\u2014</p>

                        <div class="mt-3 flex justify-between items-center">
                            <span class="text-brand-accent font-bold">AED 2,799</span>
                            <div class="w-2 h-2 rounded-full bg-gray-600 status-dot"></div>
                        </div>
                    </div>
                    

                    

                    <div class="component-card min-w-[260px] md:min-w-[280px] snap-start bg-[#0f1115] p-4 rounded-lg border border-white/5 cursor-pointer group"
                        data-payload='{&quot;id&quot;:5,&quot;name&quot;:&quot;Used GTX 1660 Super&quot;,&quot;slug&quot;:&quot;used-gtx-1660-super&quot;,&quot;price&quot;:499,&quot;priceCents&quot;:49900,&quot;category&quot;:&quot;graphics-cards&quot;,&quot;condition&quot;:&quot;used&quot;,&quot;badge&quot;:&quot;used&quot;,&quot;image&quot;:&quot;images/products/gtx-1660-super.png&quot;,&quot;brand&quot;:&quot;NVIDIA&quot;,&quot;watts&quot;:125,&quot;stock&quot;:10,&quot;description&quot;:&quot;Contact Digitron for full specifications, compatibility and warranty details.&quot;,&quot;type&quot;:&quot;graphics-cards&quot;}'
                        onclick="selectComponentFromCard('gpu', this)">
                        <div class="h-32 bg-white/[0.03] border border-white/5 rounded mb-3 overflow-hidden relative">
                            <img src="/images/products/gtx-1660-super.png"
                                class="w-full h-full object-contain p-3 opacity-80 group-hover:opacity-100 transition-opacity"
                                alt="Used GTX 1660 Super">
                        </div>

                        <h4 class="font-bold text-sm truncate">Used GTX 1660 Super</h4>
                        <p class="text-xs text-gray-400 mt-1 line-clamp-1">\u2014</p>

                        <div class="mt-3 flex justify-between items-center">
                            <span class="text-brand-accent font-bold">AED 499</span>
                            <div class="w-2 h-2 rounded-full bg-gray-600 status-dot"></div>
                        </div>
                    </div>
                    
                </div>
                
            </div>

            
            <div class="glass-panel rounded-xl p-6 component-category" data-category="ram">
                <div class="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                    <h3 class="text-xl font-bold flex items-center gap-2">
                        <i class="bi bi-memory text-brand-danger"></i> Memory
                    </h3>

                    <div class="flex items-center gap-2">
                        <button type="button" class="builder-nav builder-prev w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                            data-target="#ramTrack">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                        <button type="button" class="builder-nav builder-next w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                            data-target="#ramTrack">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>

                
                <div id="ramTrack"
                    class="builder-track flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2">
                    

                    

                    <div class="component-card min-w-[260px] md:min-w-[280px] snap-start bg-[#0f1115] p-4 rounded-lg border border-white/5 cursor-pointer group"
                        data-payload='{&quot;id&quot;:3,&quot;name&quot;:&quot;DDR5 32GB 6000MHz&quot;,&quot;slug&quot;:&quot;ddr5-32gb-6000mhz&quot;,&quot;price&quot;:489,&quot;priceCents&quot;:48900,&quot;category&quot;:&quot;memory&quot;,&quot;condition&quot;:&quot;new&quot;,&quot;badge&quot;:&quot;&quot;,&quot;image&quot;:&quot;images/products/ddr5-32gb.png&quot;,&quot;brand&quot;:&quot;&quot;,&quot;watts&quot;:0,&quot;stock&quot;:10,&quot;description&quot;:&quot;Contact Digitron for full specifications, compatibility and warranty details.&quot;,&quot;type&quot;:&quot;memory&quot;}'
                        onclick="selectComponentFromCard('ram', this)">
                        <div class="h-32 bg-white/[0.03] border border-white/5 rounded mb-3 overflow-hidden relative">
                            <img src="/images/products/ddr5-32gb.png"
                                class="w-full h-full object-contain p-3 opacity-80 group-hover:opacity-100 transition-opacity"
                                alt="DDR5 32GB 6000MHz">
                        </div>

                        <h4 class="font-bold text-sm truncate">DDR5 32GB 6000MHz</h4>
                        <p class="text-xs text-gray-400 mt-1 line-clamp-1">\u2014</p>

                        <div class="mt-3 flex justify-between items-center">
                            <span class="text-brand-accent font-bold">AED 489</span>
                            <div class="w-2 h-2 rounded-full bg-gray-600 status-dot"></div>
                        </div>
                    </div>
                    
                </div>
                
            </div>
        </div>

        
        <div class="lg:col-span-4">
            <div
                class="self-start glass-panel rounded-xl p-6 border-t-4 border-t-brand-accent shadow-2xl shadow-brand-accent/10"
                style="position: sticky; top: 112px;">
                <h3 class="text-2xl font-display font-bold mb-6 border-b border-white/10 pb-4">Build Summary</h3>

                <div id="build-list" class="space-y-3 mb-6 min-h-[150px]">
                    <div class="text-gray-500 text-sm italic text-center py-10">Select components to start building...</div>
                </div>

                <div class="mb-6">
                    <div class="flex justify-between text-xs uppercase tracking-widest mb-2">
                        <span class="text-gray-400">Build Selection</span>
                        <span class="text-brand-accent font-bold" id="fps-score">0 selected</span>
                    </div>
                    <div class="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div id="perf-bar" class="bg-gradient-to-r from-brand-secondary to-brand-accent h-2 rounded-full w-0 transition-all duration-500"></div>
                    </div>
                </div>

                <div class="flex justify-between items-center mb-6 p-3 bg-white/5 rounded-lg">
                    <div class="flex items-center gap-2 text-sm text-gray-300">
                        <i class="bi bi-lightning-charge-fill text-yellow-400"></i> CPU / GPU rated power
                    </div>
                    <div class="font-bold text-white"><span id="wattage">0</span>W</div>
                </div>

                <div class="flex justify-between items-end mb-6">
                    <span class="text-gray-400">Total Price</span>
                    <span class="text-3xl font-display font-bold text-white">AED <span id="total-price">0</span></span>
                </div>

                <button
                    id="builderAddToCartBtn"
                    type="button"
                    class="w-full bg-brand-accent hover:bg-white text-black font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
                    <span id="builderAddToCartText">Add to Cart</span>
                    <i class="bi bi-cart-check group-hover:translate-x-1 transition-transform"></i>
                </button>
            </div>
        </div>
    </div>
</section>


<section class="py-20">
    <h2 class="text-3xl font-display font-bold mb-12 text-center">TRENDING <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-secondary">NOW</span></h2>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-96 md:h-[500px]">
        <div class="lg:col-span-2 lg:row-span-2 relative group overflow-hidden rounded-2xl cursor-pointer border border-white/10">
            <img src="/images/categories/gpu.png" class="absolute inset-0 w-full h-full object-contain p-10 opacity-80 transition-transform duration-700 group-hover:scale-110" alt="GPUs">
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80"></div>
            <div class="absolute bottom-0 left-0 p-8">
                <h3 class="text-3xl font-bold mb-2">Graphics Cards</h3>
                <p class="text-gray-300 mb-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">RTX 40 Series & AMD RX 7000 Series available now.</p>
                <span class="text-brand-accent font-bold flex items-center gap-2">Shop Now <i class="bi bi-arrow-right"></i></span>
            </div>
        </div>

        <div class="relative group overflow-hidden rounded-2xl cursor-pointer border border-white/10">
            <img src="/images/categories/processors.png" class="absolute inset-0 w-full h-full object-contain p-10 opacity-80 transition-transform duration-700 group-hover:scale-110" alt="CPUs">
            <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
            <div class="absolute bottom-0 left-0 p-6">
                <h3 class="text-xl font-bold">Processors</h3>
            </div>
        </div>

        <div class="relative group overflow-hidden rounded-2xl cursor-pointer border border-white/10">
            <img src="/images/categories/motherboards.png" class="absolute inset-0 w-full h-full object-contain p-10 opacity-80 transition-transform duration-700 group-hover:scale-110" alt="Motherboards">
            <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
            <div class="absolute bottom-0 left-0 p-6">
                <h3 class="text-xl font-bold">Motherboards</h3>
            </div>
        </div>

        <div class="relative group overflow-hidden rounded-2xl cursor-pointer border border-white/10">
            <img src="/images/categories/ssd.png" class="absolute inset-0 w-full h-full object-contain p-10 opacity-80 transition-transform duration-700 group-hover:scale-110" alt="Peripherals">
            <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
            <div class="absolute bottom-0 left-0 p-6">
                <h3 class="text-xl font-bold">Peripherals</h3>
            </div>
        </div>

        <div class="relative group overflow-hidden rounded-2xl cursor-pointer border border-white/10">
            <img src="/images/categories/psu.png" class="absolute inset-0 w-full h-full object-contain p-10 opacity-80 transition-transform duration-700 group-hover:scale-110" alt="Cooling">
            <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
            <div class="absolute bottom-0 left-0 p-6">
                <h3 class="text-xl font-bold">Cooling</h3>
            </div>
        </div>
    </div>
</section>






<section class="py-20 relative overflow-hidden">
    
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-brand-accent/10 blur-[120px] rounded-full pointer-events-none"></div>
    <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-secondary/10 blur-[120px] rounded-full pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="glass-panel relative rounded-3xl border border-white/10 overflow-hidden">
            
            <div class="absolute inset-0 bg-grid-pattern opacity-[0.04] pointer-events-none"></div>
            
            <div class="absolute inset-x-0 -top-20 h-40 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

            <div class="relative p-8 md:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
                
                <div class="max-w-2xl">
                    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-accent/25 bg-brand-accent/10 mb-5">
                        <span class="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
                        <span class="text-brand-accent text-xs md:text-sm font-bold uppercase tracking-[0.25em]">
                            Ready to build?
                        </span>
                    </div>

                    <h3 class="text-3xl md:text-4xl font-display font-bold mb-2">
                        Get a custom quote <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-secondary">fast</span>
                    </h3>

                    <p class="text-gray-400 mt-3 text-base md:text-lg leading-relaxed">
                        Share your budget + use case (gaming, editing, streaming, office). We\u2019ll recommend the best parts and pricing\u2014no guesswork.
                    </p>

                    
                    <div class="mt-6 flex flex-wrap gap-3 text-sm text-gray-300">
                        <span class="px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
                            <i class="bi bi-clock-history text-brand-accent"></i> Fast response
                        </span>
                        <span class="px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
                            <i class="bi bi-shield-check text-brand-accent"></i> Expert checked
                        </span>
                        <span class="px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
                            <i class="bi bi-cpu text-brand-accent"></i> Compatibility ensured
                        </span>
                    </div>
                </div>

                
                <div class="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
                    <a href="/quote#quote-section"
                        class="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl
                    bg-gradient-to-r from-brand-accent to-brand-secondary text-black font-black
                    shadow-lg shadow-brand-accent/20 hover:shadow-xl hover:shadow-brand-accent/30 transition">
                        Contact Us
                        <i class="bi bi-arrow-right group-hover:translate-x-1 transition-transform"></i>
                    </a>

                    <a href="/shop"
                        class="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl
                    border border-white/20 bg-white/5 text-white font-bold
                    hover:bg-white/10 hover:border-brand-accent/50 hover:text-brand-accent transition">
                        Browse Store
                        <i class="bi bi-bag"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>

`;

// html-text:/workspace/sites/digitron-computers/templates/about.html
var about_default = `







<section class="relative h-screen min-h-[700px] overflow-hidden flex items-center justify-center">
    
    <div class="absolute inset-0 w-full h-full z-0">
        <div class="object-cover w-full h-full opacity-40 scale-110" aria-hidden="true"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-[#070A12]/30 via-[#070A12]/60 to-[#070A12]"></div>
    </div>

    
    <div class="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

    
    
    
    

    
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-accent/10 rounded-full blur-[150px] animate-pulse"></div>
    <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-secondary/10 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s;"></div>

    
    <div class="relative z-10 text-center px-4 max-w-5xl mx-auto parallax-hero">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 mb-8 animate-fade-in">
            <span class="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></span>
            <span class="text-brand-accent text-sm font-bold uppercase tracking-[0.2em]">Est. 2018 \u2022 Dubai, UAE</span>
        </div>

        <h1 class="text-5xl md:text-7xl lg:text-8xl font-display font-black mb-6 tracking-tight leading-none">
            WE ARE <br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent via-brand-secondary to-brand-accent animate-gradient">DIGITRON</span>
        </h1>

        <p class="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed mb-8">
            Fueling the PC Master Race in the UAE with premium hardware,
            expert builds, and uncompromising performance since 2018.
        </p>
    </div>

    
    <button type="button"
        class="absolute bottom-28 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 text-gray-300 hover:text-brand-accent transition-colors"
        onclick="scrollToStory()">
        <span class="text-xs uppercase tracking-widest">Discover Our Story</span>
        <span class="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-2">
            <span class="w-1 h-2 bg-current rounded-full animate-bounce"></span>
        </span>
    </button>

    
    <div class="absolute top-5 left-5 w-24 h-24 border-l-2 border-t-2 border-brand-accent/30"></div>
    <div class="absolute bottom-5 right-5 w-24 h-24 border-r-2 border-b-2 border-brand-accent/30"></div>
</section>


<section class="relative -mt-20 z-20 mb-16">
    <div class="glass-panel rounded-2xl mx-4 lg:mx-auto max-w-6xl border border-white/10 p-8 shadow-2xl shadow-brand-accent/5">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            

            
            <div class="text-center group">
                <div class="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-accent/20 transition-colors group-hover:scale-110 transform duration-300">
                    <i class="bi bi-pc-display text-3xl text-brand-accent"></i>
                </div>
                <div class="text-3xl md:text-4xl font-display font-bold text-white mb-1 counter-up" data-target="50,000+">50,000+</div>
                <div class="text-sm text-gray-400 uppercase tracking-wider">PCs Built</div>
            </div>
            
            <div class="text-center group">
                <div class="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-accent/20 transition-colors group-hover:scale-110 transform duration-300">
                    <i class="bi bi-people text-3xl text-brand-accent"></i>
                </div>
                <div class="text-3xl md:text-4xl font-display font-bold text-white mb-1 counter-up" data-target="25,000+">25,000+</div>
                <div class="text-sm text-gray-400 uppercase tracking-wider">Happy Customers</div>
            </div>
            
            <div class="text-center group">
                <div class="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-accent/20 transition-colors group-hover:scale-110 transform duration-300">
                    <i class="bi bi-calendar-check text-3xl text-brand-accent"></i>
                </div>
                <div class="text-3xl md:text-4xl font-display font-bold text-white mb-1 counter-up" data-target="6">6</div>
                <div class="text-sm text-gray-400 uppercase tracking-wider">Years Strong</div>
            </div>
            
            <div class="text-center group">
                <div class="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-accent/20 transition-colors group-hover:scale-110 transform duration-300">
                    <i class="bi bi-lightning-charge text-3xl text-brand-accent"></i>
                </div>
                <div class="text-3xl md:text-4xl font-display font-bold text-white mb-1 counter-up" data-target="24h">24h</div>
                <div class="text-sm text-gray-400 uppercase tracking-wider">Delivery Dubai</div>
            </div>
            
        </div>
    </div>
</section>


<section id="story" class="py-24 relative overflow-hidden">
    
    <div class="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-brand-accent/5 to-transparent pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16 reveal-text">
            <span class="text-brand-accent text-sm font-bold uppercase tracking-[0.3em] mb-4 block">Our Journey</span>
            <h2 class="text-4xl md:text-6xl font-display font-bold mb-6">BUILT FOR <span class="text-brand-secondary">GAMERS</span></h2>
            <p class="text-gray-400 max-w-2xl mx-auto text-lg">From a small garage startup to the UAE's premier PC hardware destination.</p>
        </div>

        
        <div class="relative">
            
            <div class="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-brand-accent via-brand-secondary to-transparent hidden md:block"></div>

            

            <div class="space-y-24">
                
                <div class="relative flex items-center  group">
                    
                    <div class="w-full md:w-1/2 md:pr-16">
                        <div class="glass-panel rounded-2xl p-6 border border-white/10 hover:border-brand-accent/30 transition-all duration-500 hover:-translate-y-2 md:text-right">
                            <div class="aspect-video rounded-xl overflow-hidden mb-6 relative">
                                <img src="/images/timeline-img5.jpg" alt="The Beginning"
                                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                                <div class="absolute inset-0 bg-gradient-to-t from-[#070A12]/80 to-transparent"></div>
                                <div class="absolute bottom-4 right-4">
                                    <span class="text-5xl font-display font-bold text-white/20">2018</span>
                                </div>
                            </div>
                            <div class="inline-block px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-sm font-bold mb-3">
                                2018
                            </div>
                            <h3 class="text-2xl font-bold text-white mb-3">The Beginning</h3>
                            <p class="text-gray-400 leading-relaxed">Digitron started in a small Dubai garage with a simple mission: make high-performance PCs accessible to every gamer in the UAE.</p>
                        </div>
                    </div>

                    
                    <div class="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-brand-accent border-4 border-[#070A12] hidden md:block z-10 group-hover:scale-150 transition-transform shadow-lg shadow-brand-accent/50">
                        <div class="absolute inset-0 rounded-full bg-brand-accent animate-ping opacity-50"></div>
                    </div>

                    
                    <div class="hidden md:block w-1/2"></div>
                </div>
                
                <div class="relative flex items-center md:flex-row-reverse group">
                    
                    <div class="w-full md:w-1/2 md:pl-16">
                        <div class="glass-panel rounded-2xl p-6 border border-white/10 hover:border-brand-accent/30 transition-all duration-500 hover:-translate-y-2 md:text-left">
                            <div class="aspect-video rounded-xl overflow-hidden mb-6 relative">
                                <img src="/images/timeline-img1.jpg" alt="First Milestone"
                                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                                <div class="absolute inset-0 bg-gradient-to-t from-[#070A12]/80 to-transparent"></div>
                                <div class="absolute bottom-4 left-4">
                                    <span class="text-5xl font-display font-bold text-white/20">2020</span>
                                </div>
                            </div>
                            <div class="inline-block px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-sm font-bold mb-3">
                                2020
                            </div>
                            <h3 class="text-2xl font-bold text-white mb-3">First Milestone</h3>
                            <p class="text-gray-400 leading-relaxed">Reached 5,000 custom builds. Expanded team to 15 enthusiasts. Launched same-day delivery in Dubai.</p>
                        </div>
                    </div>

                    
                    <div class="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-brand-accent border-4 border-[#070A12] hidden md:block z-10 group-hover:scale-150 transition-transform shadow-lg shadow-brand-accent/50">
                        <div class="absolute inset-0 rounded-full bg-brand-accent animate-ping opacity-50"></div>
                    </div>

                    
                    <div class="hidden md:block w-1/2"></div>
                </div>
                
                <div class="relative flex items-center  group">
                    
                    <div class="w-full md:w-1/2 md:pr-16">
                        <div class="glass-panel rounded-2xl p-6 border border-white/10 hover:border-brand-accent/30 transition-all duration-500 hover:-translate-y-2 md:text-right">
                            <div class="aspect-video rounded-xl overflow-hidden mb-6 relative">
                                <img src="/images/timeline-img3.jpg" alt="Going Premium"
                                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                                <div class="absolute inset-0 bg-gradient-to-t from-[#070A12]/80 to-transparent"></div>
                                <div class="absolute bottom-4 right-4">
                                    <span class="text-5xl font-display font-bold text-white/20">2022</span>
                                </div>
                            </div>
                            <div class="inline-block px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-sm font-bold mb-3">
                                2022
                            </div>
                            <h3 class="text-2xl font-bold text-white mb-3">Going Premium</h3>
                            <p class="text-gray-400 leading-relaxed">Became authorized reseller for NVIDIA, ASUS, MSI, and Corsair. Opened flagship showroom in Al Ain Centre.</p>
                        </div>
                    </div>

                    
                    <div class="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-brand-accent border-4 border-[#070A12] hidden md:block z-10 group-hover:scale-150 transition-transform shadow-lg shadow-brand-accent/50">
                        <div class="absolute inset-0 rounded-full bg-brand-accent animate-ping opacity-50"></div>
                    </div>

                    
                    <div class="hidden md:block w-1/2"></div>
                </div>
                
                <div class="relative flex items-center md:flex-row-reverse group">
                    
                    <div class="w-full md:w-1/2 md:pl-16">
                        <div class="glass-panel rounded-2xl p-6 border border-white/10 hover:border-brand-accent/30 transition-all duration-500 hover:-translate-y-2 md:text-left">
                            <div class="aspect-video rounded-xl overflow-hidden mb-6 relative">
                                <img src="/images/timeline-img4.jpg" alt="The Future"
                                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                                <div class="absolute inset-0 bg-gradient-to-t from-[#070A12]/80 to-transparent"></div>
                                <div class="absolute bottom-4 left-4">
                                    <span class="text-5xl font-display font-bold text-white/20">2024</span>
                                </div>
                            </div>
                            <div class="inline-block px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-sm font-bold mb-3">
                                2024
                            </div>
                            <h3 class="text-2xl font-bold text-white mb-3">The Future</h3>
                            <p class="text-gray-400 leading-relaxed">50,000+ builds completed. 24-hour delivery across UAE. AI-powered PC builder launched. Still obsessed with performance.</p>
                        </div>
                    </div>

                    
                    <div class="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-brand-accent border-4 border-[#070A12] hidden md:block z-10 group-hover:scale-150 transition-transform shadow-lg shadow-brand-accent/50">
                        <div class="absolute inset-0 rounded-full bg-brand-accent animate-ping opacity-50"></div>
                    </div>

                    
                    <div class="hidden md:block w-1/2"></div>
                </div>
                
            </div>
        </div>
    </div>
</section>


<section class="py-24 relative overflow-hidden isolate">
    
    <div class="absolute inset-0 z-0 pointer-events-none">
        <div class="w-full h-full object-cover opacity-40 scale-110" aria-hidden="true"></div>

        
        <div class="absolute inset-0 bg-gradient-to-b from-[#070A12]/80 via-[#070A12]/70 to-[#070A12]/85"></div>
    </div>

    
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
            <span class="text-brand-secondary text-sm font-bold uppercase tracking-[0.3em] mb-4 block">Why Choose Us</span>
            <h2 class="text-4xl md:text-6xl font-display font-bold mb-6">
                THE <span class="text-brand-accent">DIGITRON</span> DIFFERENCE
            </h2>
        </div>

        

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
                <div class="group relative rounded-2xl p-8 border border-white/12 bg-white/[0.06] backdrop-blur-xl
                            hover:border-brand-accent/50 transition-all duration-500 hover:-translate-y-3 overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br from-brand-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div class="relative w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <i class="bi bi-tools text-3xl text-brand-accent"></i>
                    </div>

                    <h3 class="relative text-xl font-bold text-white mb-3 group-hover:text-brand-accent transition-colors">
                        Expert Builds
                    </h3>
                    <p class="relative text-gray-300/80 leading-relaxed">Every PC is hand-assembled by certified technicians with 10+ years experience. Cable management perfection guaranteed.</p>

                    <div class="absolute top-4 right-4 text-6xl font-display font-bold text-white/5 group-hover:text-brand-accent/10 transition-colors">
                        01
                    </div>
                </div>
            
                <div class="group relative rounded-2xl p-8 border border-white/12 bg-white/[0.06] backdrop-blur-xl
                            hover:border-brand-secondary/50 transition-all duration-500 hover:-translate-y-3 overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br from-brand-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div class="relative w-16 h-16 rounded-2xl bg-brand-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <i class="bi bi-lightning-charge-fill text-3xl text-brand-secondary"></i>
                    </div>

                    <h3 class="relative text-xl font-bold text-white mb-3 group-hover:text-brand-secondary transition-colors">
                        Same-Day Delivery
                    </h3>
                    <p class="relative text-gray-300/80 leading-relaxed">In-stock items delivered within 24 hours across Dubai. Real-time tracking from our warehouse to your door.</p>

                    <div class="absolute top-4 right-4 text-6xl font-display font-bold text-white/5 group-hover:text-brand-secondary/10 transition-colors">
                        02
                    </div>
                </div>
            
                <div class="group relative rounded-2xl p-8 border border-white/12 bg-white/[0.06] backdrop-blur-xl
                            hover:border-brand-accent/50 transition-all duration-500 hover:-translate-y-3 overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br from-brand-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div class="relative w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <i class="bi bi-shield-check text-3xl text-brand-accent"></i>
                    </div>

                    <h3 class="relative text-xl font-bold text-white mb-3 group-hover:text-brand-accent transition-colors">
                        2-Year Warranty
                    </h3>
                    <p class="relative text-gray-300/80 leading-relaxed">Comprehensive coverage on all builds. Free troubleshooting, component replacement, and lifetime support.</p>

                    <div class="absolute top-4 right-4 text-6xl font-display font-bold text-white/5 group-hover:text-brand-accent/10 transition-colors">
                        03
                    </div>
                </div>
            
                <div class="group relative rounded-2xl p-8 border border-white/12 bg-white/[0.06] backdrop-blur-xl
                            hover:border-brand-accent/50 transition-all duration-500 hover:-translate-y-3 overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br from-brand-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div class="relative w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <i class="bi bi-cash-coin text-3xl text-brand-accent"></i>
                    </div>

                    <h3 class="relative text-xl font-bold text-white mb-3 group-hover:text-brand-accent transition-colors">
                        0% Installments
                    </h3>
                    <p class="relative text-gray-300/80 leading-relaxed">Spread your payments with Tabby or Tamara. No hidden fees, no interest, instant approval.</p>

                    <div class="absolute top-4 right-4 text-6xl font-display font-bold text-white/5 group-hover:text-brand-accent/10 transition-colors">
                        04
                    </div>
                </div>
            
                <div class="group relative rounded-2xl p-8 border border-white/12 bg-white/[0.06] backdrop-blur-xl
                            hover:border-brand-accent/50 transition-all duration-500 hover:-translate-y-3 overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br from-brand-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div class="relative w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <i class="bi bi-arrow-repeat text-3xl text-brand-accent"></i>
                    </div>

                    <h3 class="relative text-xl font-bold text-white mb-3 group-hover:text-brand-accent transition-colors">
                        Easy Returns
                    </h3>
                    <p class="relative text-gray-300/80 leading-relaxed">Changed your mind? 30-day hassle-free returns on unopened items. No questions asked.</p>

                    <div class="absolute top-4 right-4 text-6xl font-display font-bold text-white/5 group-hover:text-brand-accent/10 transition-colors">
                        05
                    </div>
                </div>
            
                <div class="group relative rounded-2xl p-8 border border-white/12 bg-white/[0.06] backdrop-blur-xl
                            hover:border-brand-accent/50 transition-all duration-500 hover:-translate-y-3 overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br from-brand-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div class="relative w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <i class="bi bi-headset text-3xl text-brand-accent"></i>
                    </div>

                    <h3 class="relative text-xl font-bold text-white mb-3 group-hover:text-brand-accent transition-colors">
                        24/7 Support
                    </h3>
                    <p class="relative text-gray-300/80 leading-relaxed">Real humans, not bots. WhatsApp, call, or visit our showroom. We speak English, Arabic, and Hindi.</p>

                    <div class="absolute top-4 right-4 text-6xl font-display font-bold text-white/5 group-hover:text-brand-accent/10 transition-colors">
                        06
                    </div>
                </div>
            
        </div>
    </div>
</section>


<section class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="glass-panel rounded-2xl border border-white/10 p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
                <span class="text-brand-accent text-sm font-bold uppercase tracking-[0.3em] block mb-2">Ready to build?</span>
                <h3 class="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                    Get a custom quote in minutes
                </h3>
                <p class="text-gray-400 max-w-2xl">
                    Tell us your budget + usage (gaming, editing, AI) and we\u2019ll recommend the perfect parts and price.
                </p>
            </div>

            <div class="flex gap-3">
                <a href="/quote#quote-section"
                    class="px-7 py-4 rounded-xl bg-brand-accent text-black font-bold hover:bg-white transition flex items-center gap-2">
                    Get a Quote <i class="bi bi-arrow-right"></i>
                </a>
                <a href="/shop"
                    class="px-7 py-4 rounded-xl border border-white/20 text-white font-bold hover:border-brand-accent hover:text-brand-accent transition">
                    Browse Store
                </a>
            </div>
        </div>
    </div>
</section>





<section id="showroom" class="py-24 relative overflow-hidden">
    <div class="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1920"
            alt="Showroom"
            class="w-full h-full object-cover opacity-20 parallax-bg-slow">
        <div class="absolute inset-0 bg-gradient-to-r from-[#070A12] via-[#070A12]/90 to-[#070A12]/70"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
            
            <div>
                <span class="text-brand-accent text-sm font-bold uppercase tracking-[0.3em] mb-4 block">Visit Us</span>
                <h2 class="text-4xl md:text-5xl font-display font-bold mb-6">EXPERIENCE THE <span class="text-brand-secondary">POWER</span></h2>
                <p class="text-gray-400 text-lg mb-8 leading-relaxed">
                    Step into our flagship showroom at Al Ain Centre. Test drive the latest GPUs,
                    feel the mechanical keyboards, and consult with our build experts in person.
                </p>

                <div class="space-y-6 mb-8">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
                            <i class="bi bi-geo-alt-fill text-xl"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-white mb-1">Flagship Showroom</h4>
                            <p class="text-gray-400">Victoria building<br>international city 2<br>Dubai, UAE</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary shrink-0">
                            <i class="bi bi-clock-fill text-xl"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-white mb-1">Opening Hours</h4>
                            <p class="text-gray-400">Saturday - Thursday: 10:00 AM - 10:00 PM<br>Friday: 2:00 PM - 10:00 PM</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400 shrink-0">
                            <i class="bi bi-whatsapp text-xl"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-white mb-1">Instant Support</h4>
                            <p class="text-gray-400">+971 50 124 0180<br>WhatsApp available 24/7</p>
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap gap-4">
                    <a href="#" class="px-6 py-3 rounded-xl bg-brand-accent text-black font-bold hover:bg-white transition-colors flex items-center gap-2">
                        <i class="bi bi-map-fill"></i> Get Directions
                    </a>
                    <a href="/quote" class="px-6 py-3 rounded-xl border border-white/20 text-white font-bold hover:border-brand-accent hover:text-brand-accent transition-colors flex items-center gap-2">
                        <i class="bi bi-headset"></i> Contact Us
                    </a>
                </div>
            </div>

            
            <div class="relative">
                <div class="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 glass-panel relative group">
                    <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800"
                        alt="Map"
                        class="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity">

                    
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div class="relative">
                            <div class="w-4 h-4 bg-brand-accent rounded-full animate-ping absolute"></div>
                            <div class="w-4 h-4 bg-brand-accent rounded-full relative shadow-lg shadow-brand-accent/50"></div>
                            <div class="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                <div class="glass-panel px-4 py-2 rounded-lg border border-brand-accent/30 text-sm font-bold text-white">
                                    Digitron HQ
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <div class="absolute bottom-4 right-4 flex gap-2">
                        <button class="w-10 h-10 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-brand-accent hover:text-black transition-colors">
                            <i class="bi bi-plus-lg"></i>
                        </button>
                        <button class="w-10 h-10 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-brand-accent hover:text-black transition-colors">
                            <i class="bi bi-dash-lg"></i>
                        </button>
                    </div>
                </div>

                
                <div class="absolute -bottom-6 -left-6 glass-panel rounded-xl p-4 border border-brand-accent/30 shadow-xl">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <i class="bi bi-check-circle-fill text-emerald-400 text-xl"></i>
                        </div>
                        <div>
                            <div class="text-sm font-bold text-white">Open Now</div>
                            <div class="text-xs text-gray-400">Closes 10:00 PM</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>


<section class="py-24 relative overflow-hidden">
    
    <div class="absolute inset-0 bg-gradient-to-br from-brand-accent/10 via-brand-secondary/10 to-transparent"></div>

    
    <div class="absolute top-0 left-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-[100px] animate-float"></div>
    <div class="absolute bottom-0 right-0 w-80 h-80 bg-brand-secondary/20 rounded-full blur-[120px] animate-float" style="animation-delay: 2s;"></div>

    <div class="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-4xl md:text-6xl font-display font-bold mb-6">READY TO <span class="text-brand-accent">BUILD</span>?</h2>
        <p class="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Whether you're chasing 240Hz in competitive FPS or rendering 8K video,
            we'll build the perfect machine for your mission.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/quote" class="group px-8 py-4 rounded-xl bg-brand-accent text-black font-bold text-lg hover:bg-white transition-all flex items-center gap-2 shadow-lg shadow-brand-accent/30">
                Start Building <i class="bi bi-cpu group-hover:rotate-12 transition-transform"></i>
            </a>
            <a href="/shop" class="px-8 py-4 rounded-xl border border-white/20 text-white font-bold text-lg hover:border-brand-accent hover:text-brand-accent transition-all flex items-center gap-2">
                Browse Store <i class="bi bi-arrow-right"></i>
            </a>
        </div>

        
        <div class="mt-12 flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div class="flex items-center gap-2 text-sm">
                <i class="bi bi-shield-check text-brand-accent"></i>
                <span>2-Year Warranty</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
                <i class="bi bi-truck text-brand-accent"></i>
                <span>Free Delivery</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
                <i class="bi bi-arrow-repeat text-brand-accent"></i>
                <span>30-Day Returns</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
                <i class="bi bi-headset text-brand-accent"></i>
                <span>24/7 Support</span>
            </div>
        </div>
    </div>
</section>

`;

// html-text:/workspace/sites/digitron-computers/templates/quote.html
var quote_default = `






<section class="relative h-[70vh] min-h-[600px] overflow-hidden flex items-center justify-center pt-28 pb-28">
  
  <div class="absolute inset-0 w-full h-full z-0">
    <div class="object-cover w-full h-full opacity-60 scale-110" aria-hidden="true"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-[#070A12]/15 via-[#070A12]/35 to-[#070A12]/55"></div>
  </div>

  
  <div class="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none"></div>

  
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    
  </div>

  
  <div class="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-accent/10 rounded-full blur-[150px] animate-pulse"></div>
  <div class="absolute bottom-1/3 right-1/4 w-80 h-80 bg-brand-secondary/10 rounded-full blur-[120px] animate-pulse" style="animation-delay: 1.5s;"></div>

  
  <div class="relative z-10 text-center px-4 max-w-5xl mx-auto parallax-hero">
    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 mb-6 animate-fade-in">
      <span class="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></span>
      <span class="text-brand-accent text-sm font-bold uppercase tracking-[0.2em]">24/7 Support Available</span>
    </div>

    <h1 class="text-5xl md:text-7xl font-display font-black mb-6 tracking-tight leading-none">
      LET'S <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent via-brand-secondary to-brand-accent animate-gradient">CONNECT</span>
    </h1>

    <p class="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed mb-8">
      Whether you need a custom quote, technical support, or just want to talk shop \u2014
      we're here for the UAE's PC enthusiasts.
    </p>

    
    <div class="flex flex-wrap items-center justify-center gap-4 mb-12">
      <a href="https://wa.me/971501240180" target="_blank" rel="noopener noreferrer" class="group px-6 py-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2">
        <i class="bi bi-whatsapp text-xl group-hover:scale-110 transition-transform"></i>
        WhatsApp Now
      </a>
      <a href="tel:+971501240180" class="group px-6 py-3 rounded-full bg-white/5 border border-white/20 text-white font-medium hover:bg-brand-accent hover:text-black hover:border-brand-accent transition-all flex items-center gap-2">
        <i class="bi bi-telephone-fill group-hover:rotate-12 transition-transform"></i>
        Call Us
      </a>
      <button onclick="scrollToQuote()" class="group px-6 py-3 rounded-full bg-brand-accent/20 border border-brand-accent/30 text-brand-accent font-medium hover:bg-brand-accent hover:text-black transition-all flex items-center gap-2">
        <i class="bi bi-chat-square-text-fill group-hover:scale-110 transition-transform"></i>
        Get Quote
      </button>
    </div>
  </div>

  
  <div class="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 hover:text-brand-accent transition-colors cursor-pointer" onclick="scrollToContact()">
    <span class="text-xs uppercase tracking-widest">Explore Options</span>
    <div class="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-2">
      <div class="w-1 h-2 bg-current rounded-full animate-bounce"></div>
    </div>
  </div>

  
  <div class="absolute top-5 left-5 w-32 h-32 border-l-2 border-t-2 border-brand-accent/20"></div>
  <div class="absolute bottom-5 right-5 w-32 h-32 border-r-2 border-b-2 border-brand-accent/20"></div>
</section>




<section id="contact-methods" class="relative z-20 -mt-10 md:-mt-14 pt-12 pb-20 scroll-mt-28">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      

      
      <a href="https://wa.me/971501240180"
        class="group glass-panel rounded-2xl p-6 border border-white/10 transition-all duration-500 hover:-translate-y-3 hover:shadow-xl hover:border-emerald-400/50 hover:shadow-emerald-500/20 relative overflow-hidden">
        
        <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div class="relative">
          <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <i class="bi bi-whatsapp text-2xl text-emerald-400"></i>
          </div>

          <h3 class="text-lg font-bold text-white mb-1">WhatsApp</h3>
          <div class="text-emerald-400 font-semibold mb-2">+971 50 124 0180</div>
          <p class="text-sm text-gray-400 mb-4">Fastest response time</p>

          <div class="flex items-center gap-2 text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
            Chat Now
            <i class="bi bi-arrow-right group-hover:translate-x-1 transition-transform"></i>
          </div>
        </div>
      </a>
      
      <a href="tel:+971501240180"
        class="group glass-panel rounded-2xl p-6 border border-white/10 transition-all duration-500 hover:-translate-y-3 hover:shadow-xl hover:border-brand-accent/50 hover:shadow-brand-accent/20 relative overflow-hidden">
        
        <div class="absolute inset-0 bg-gradient-to-br from-brand-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div class="relative">
          <div class="w-14 h-14 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <i class="bi bi-telephone-fill text-2xl text-brand-accent"></i>
          </div>

          <h3 class="text-lg font-bold text-white mb-1">Phone</h3>
          <div class="text-brand-accent font-semibold mb-2">+971 50 124 0180</div>
          <p class="text-sm text-gray-400 mb-4">Talk to our experts</p>

          <div class="flex items-center gap-2 text-sm font-medium text-white group-hover:text-brand-accent transition-colors">
            Call Us
            <i class="bi bi-arrow-right group-hover:translate-x-1 transition-transform"></i>
          </div>
        </div>
      </a>
      
      <a href="mailto:shuhabrahim@hotmail.com"
        class="group glass-panel rounded-2xl p-6 border border-white/10 transition-all duration-500 hover:-translate-y-3 hover:shadow-xl hover:border-brand-secondary/50 hover:shadow-brand-secondary/20 relative overflow-hidden">
        
        <div class="absolute inset-0 bg-gradient-to-br from-brand-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div class="relative">
          <div class="w-14 h-14 rounded-2xl bg-brand-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <i class="bi bi-envelope-fill text-2xl text-brand-secondary"></i>
          </div>

          <h3 class="text-lg font-bold text-white mb-1">Email</h3>
          <div class="text-brand-secondary font-semibold mb-2">shuhabrahim@hotmail.com</div>
          <p class="text-sm text-gray-400 mb-4">Detailed inquiries</p>

          <div class="flex items-center gap-2 text-sm font-medium text-white group-hover:text-brand-secondary transition-colors">
            Send Email
            <i class="bi bi-arrow-right group-hover:translate-x-1 transition-transform"></i>
          </div>
        </div>
      </a>
      
      <a href="/about#showroom"
        class="group glass-panel rounded-2xl p-6 border border-white/10 transition-all duration-500 hover:-translate-y-3 hover:shadow-xl hover:border-orange-400/50 hover:shadow-orange-500/20 relative overflow-hidden">
        
        <div class="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div class="relative">
          <div class="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <i class="bi bi-geo-alt-fill text-2xl text-orange-400"></i>
          </div>

          <h3 class="text-lg font-bold text-white mb-1">Visit Us</h3>
          <div class="text-orange-400 font-semibold mb-2">Dubai</div>
          <p class="text-sm text-gray-400 mb-4">See builds in person</p>

          <div class="flex items-center gap-2 text-sm font-medium text-white group-hover:text-orange-400 transition-colors">
            Get Directions
            <i class="bi bi-arrow-right group-hover:translate-x-1 transition-transform"></i>
          </div>
        </div>
      </a>
      
    </div>
  </div>
</section>


<section id="quote-section" class="py-24 relative overflow-hidden scroll-mt-28">
  
  <div class="absolute inset-0 z-0">
    <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-accent/5 to-transparent pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-brand-secondary/5 to-transparent pointer-events-none"></div>
  </div>

  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid lg:grid-cols-2 gap-12 items-start">
      
      <div class="lg:sticky lg:top-28 space-y-8">
        <div>
          <span class="text-brand-accent text-sm font-bold uppercase tracking-[0.3em] mb-4 block">Custom Builds</span>
          <h2 class="text-4xl md:text-5xl font-display font-bold mb-4">GET YOUR <span class="text-brand-secondary">QUOTE</span></h2>
          <p class="text-gray-400 text-lg leading-relaxed">
            Tell us your dream PC specs, budget, and timeline. Our build experts will craft
            the perfect configuration and send you a detailed quote within 2 hours.
          </p>
        </div>

        
        <div class="glass-panel rounded-2xl p-6 border border-white/10">
          <h3 class="font-bold text-white mb-4 flex items-center gap-2">
            <i class="bi bi-check-circle-fill text-brand-accent"></i>
            Why Request a Quote?
          </h3>
          <ul class="space-y-3">
            
            <li class="flex items-start gap-3 text-sm text-gray-400">
              <i class="bi bi-check-lg text-brand-accent mt-0.5"></i>
              <span>Personalized build recommendations</span>
            </li>
            
            <li class="flex items-start gap-3 text-sm text-gray-400">
              <i class="bi bi-check-lg text-brand-accent mt-0.5"></i>
              <span>Best price guarantee on components</span>
            </li>
            
            <li class="flex items-start gap-3 text-sm text-gray-400">
              <i class="bi bi-check-lg text-brand-accent mt-0.5"></i>
              <span>Compatibility checking by experts</span>
            </li>
            
            <li class="flex items-start gap-3 text-sm text-gray-400">
              <i class="bi bi-check-lg text-brand-accent mt-0.5"></i>
              <span>Flexible payment plans (0% installments)</span>
            </li>
            
            <li class="flex items-start gap-3 text-sm text-gray-400">
              <i class="bi bi-check-lg text-brand-accent mt-0.5"></i>
              <span>Priority support and faster delivery</span>
            </li>
            
          </ul>
        </div>

        
        <div class="space-y-3" x-data="{ open: null }">
          <h3 class="font-bold text-white mb-4">Common Questions</h3>

          

          
          <div class="glass-panel rounded-xl border border-white/10 overflow-hidden">
            <button @click="open === 0 ? open = null : open = 0"
              class="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
              <span class="font-medium text-white text-sm">How fast will I get my quote?</span>
              <i class="bi bi-chevron-down transition-transform" :class="open === 0 ? 'rotate-180' : ''"></i>
            </button>
            <div x-show="open === 0"
              x-transition:enter="transition ease-out duration-200"
              x-transition:enter-start="opacity-0 -translate-y-2"
              x-transition:enter-end="opacity-100 translate-y-0"
              x-transition:leave="transition ease-in duration-150"
              x-transition:leave-start="opacity-100 translate-y-0"
              x-transition:leave-end="opacity-0 -translate-y-2"
              class="px-5 pb-4">
              <p class="text-sm text-gray-400 leading-relaxed">Most quotes are delivered within 2 hours during business hours. Complex custom water-cooling builds may take up to 24 hours.</p>
            </div>
          </div>
          
          <div class="glass-panel rounded-xl border border-white/10 overflow-hidden">
            <button @click="open === 1 ? open = null : open = 1"
              class="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
              <span class="font-medium text-white text-sm">Is there any obligation?</span>
              <i class="bi bi-chevron-down transition-transform" :class="open === 1 ? 'rotate-180' : ''"></i>
            </button>
            <div x-show="open === 1"
              x-transition:enter="transition ease-out duration-200"
              x-transition:enter-start="opacity-0 -translate-y-2"
              x-transition:enter-end="opacity-100 translate-y-0"
              x-transition:leave="transition ease-in duration-150"
              x-transition:leave-start="opacity-100 translate-y-0"
              x-transition:leave-end="opacity-0 -translate-y-2"
              class="px-5 pb-4">
              <p class="text-sm text-gray-400 leading-relaxed">Absolutely not. Our quotes are completely free with no pressure to buy. We&#39;re here to help you plan your perfect build.</p>
            </div>
          </div>
          
          <div class="glass-panel rounded-xl border border-white/10 overflow-hidden">
            <button @click="open === 2 ? open = null : open = 2"
              class="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
              <span class="font-medium text-white text-sm">Can I modify the quote later?</span>
              <i class="bi bi-chevron-down transition-transform" :class="open === 2 ? 'rotate-180' : ''"></i>
            </button>
            <div x-show="open === 2"
              x-transition:enter="transition ease-out duration-200"
              x-transition:enter-start="opacity-0 -translate-y-2"
              x-transition:enter-end="opacity-100 translate-y-0"
              x-transition:leave="transition ease-in duration-150"
              x-transition:leave-start="opacity-100 translate-y-0"
              x-transition:leave-end="opacity-0 -translate-y-2"
              class="px-5 pb-4">
              <p class="text-sm text-gray-400 leading-relaxed">Yes! Quotes are flexible. Want to swap that RTX 4070 for a 4080? Just reply to your quote email or WhatsApp us.</p>
            </div>
          </div>
          
          <div class="glass-panel rounded-xl border border-white/10 overflow-hidden">
            <button @click="open === 3 ? open = null : open = 3"
              class="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
              <span class="font-medium text-white text-sm">Do you offer bulk discounts?</span>
              <i class="bi bi-chevron-down transition-transform" :class="open === 3 ? 'rotate-180' : ''"></i>
            </button>
            <div x-show="open === 3"
              x-transition:enter="transition ease-out duration-200"
              x-transition:enter-start="opacity-0 -translate-y-2"
              x-transition:enter-end="opacity-100 translate-y-0"
              x-transition:leave="transition ease-in duration-150"
              x-transition:leave-start="opacity-100 translate-y-0"
              x-transition:leave-end="opacity-0 -translate-y-2"
              class="px-5 pb-4">
              <p class="text-sm text-gray-400 leading-relaxed">Definitely. For orders over AED 10,000 or 5+ units, we provide custom business pricing. Select &quot;Bulk / Business&quot; in the form.</p>
            </div>
          </div>
          
        </div>

        
        <div class="flex flex-wrap items-center gap-6 pt-4">
          <div class="flex items-center gap-2 text-sm text-gray-400">
            <i class="bi bi-shield-check text-brand-accent text-lg"></i>
            <span>Secure Form</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-400">
            <i class="bi bi-clock-history text-brand-accent text-lg"></i>
            <span>2hr Response</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-400">
            <i class="bi bi-lock-fill text-brand-accent text-lg"></i>
            <span>Data Protected</span>
          </div>
        </div>
      </div>

      
      <div class="glass-panel rounded-3xl border border-white/10 p-6 md:p-10 relative overflow-hidden">
        
        <div class="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-accent to-brand-secondary flex items-center justify-center text-black text-2xl shadow-lg shadow-brand-accent/30">
            <i class="bi bi-calculator-fill"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-white">Build Your Quote</h3>
            <p class="text-sm text-gray-400">Step 1 of 1 \u2014 Tell us what you need</p>
          </div>
        </div>

        <form id="quoteForm" action="/api/quote" method="POST" class="space-y-6">
          

          
          <div class="space-y-4">
            <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-brand-accent/20 text-brand-accent text-xs flex items-center justify-center">1</span>
              Your Details
            </h4>

            <div class="grid md:grid-cols-2 gap-4">
              <div class="relative group">
                <input type="text" name="full_name" required
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none focus:border-brand-accent transition-all peer placeholder-transparent"
                  placeholder="Full Name" id="full_name">
                <label for="full_name" class="absolute left-4 top-3.5 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-brand-accent peer-focus:bg-[#0a0a0f] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#0a0a0f] peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">
                  Full Name *
                </label>
                <i class="bi bi-person absolute right-4 top-3.5 text-gray-500 peer-focus:text-brand-accent transition-colors"></i>
              </div>

              <div class="relative group">
                <input type="email" name="email" required
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none focus:border-brand-accent transition-all peer placeholder-transparent"
                  placeholder="Email" id="email">
                <label for="email" class="absolute left-4 top-3.5 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-brand-accent peer-focus:bg-[#0a0a0f] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#0a0a0f] peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">
                  Email Address *
                </label>
                <i class="bi bi-envelope absolute right-4 top-3.5 text-gray-500 peer-focus:text-brand-accent transition-colors"></i>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div class="relative group">
                <input type="tel" name="phone"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none focus:border-brand-accent transition-all peer placeholder-transparent"
                  placeholder="Phone" id="phone">
                <label for="phone" class="absolute left-4 top-3.5 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-brand-accent peer-focus:bg-[#0a0a0f] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#0a0a0f] peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">
                  Phone Number
                </label>
                <i class="bi bi-telephone absolute right-4 top-3.5 text-gray-500 peer-focus:text-brand-accent transition-colors"></i>
              </div>

              <div class="relative">
                <select name="area"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none focus:border-brand-accent transition-all appearance-none cursor-pointer">
                  <option value="" class="bg-[#0a0a0f]">Select Your Area</option>
                  <option value="dubai" class="bg-[#0a0a0f]">Dubai</option>
                  <option value="abu-dhabi" class="bg-[#0a0a0f]">Abu Dhabi</option>
                  <option value="sharjah" class="bg-[#0a0a0f]">Sharjah</option>
                  <option value="ajman" class="bg-[#0a0a0f]">Ajman</option>
                  <option value="rak" class="bg-[#0a0a0f]">Ras Al Khaimah</option>
                  <option value="fujairah" class="bg-[#0a0a0f]">Fujairah</option>
                  <option value="uaq" class="bg-[#0a0a0f]">Umm Al Quwain</option>
                  <option value="other" class="bg-[#0a0a0f]">Other UAE</option>
                </select>
                <i class="bi bi-geo-alt absolute right-4 top-3.5 text-gray-500 pointer-events-none"></i>
              </div>
            </div>
          </div>

          
          <div class="space-y-4">
            <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-brand-secondary/20 text-brand-secondary text-xs flex items-center justify-center">2</span>
              Build Requirements
            </h4>

            <div class="grid md:grid-cols-2 gap-4">
              
              <div class="relative">
                
                <i id="quoteTypeIcon"
                  class="bi bi-controller absolute left-4 top-3.5 text-gray-500 pointer-events-none"></i>

                <select id="quote_type" name="quote_type" required
                  class="pl-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none focus:border-brand-accent transition-all appearance-none cursor-pointer">
                  <option value="" class="bg-[#0a0a0f]">Quote Type *</option>
                  <option value="gaming-pc" class="bg-[#0a0a0f]">Gaming PC Build</option>
                  <option value="workstation" class="bg-[#0a0a0f]">Workstation / Creative</option>
                  <option value="streaming" class="bg-[#0a0a0f]">Streaming Setup</option>
                  <option value="part-request" class="bg-[#0a0a0f]">Specific Part Request</option>
                  <option value="pre-built" class="bg-[#0a0a0f]">Pre-Built PC</option>
                  <option value="upgrade" class="bg-[#0a0a0f]">PC Upgrade Service</option>
                  <option value="repair" class="bg-[#0a0a0f]">Repair / Troubleshooting</option>
                  <option value="bulk" class="bg-[#0a0a0f]">Bulk / Business Order</option>
                </select>

                
                <i class="bi bi-chevron-down absolute right-4 top-3.5 text-gray-500 pointer-events-none"></i>
              </div>

              
              <div class="relative group">
                <input type="number" name="budget" min="0" step="0.01"
                  class="no-spin w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 pr-14 text-white outline-none focus:border-brand-accent transition-all peer placeholder-transparent"
                  placeholder="Budget" id="budget">
                <label for="budget"
                  class="absolute left-4 top-3.5 text-gray-500 text-sm transition-all
                          peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-brand-accent
                          peer-focus:bg-[#0a0a0f] peer-focus:px-2
                          peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3
                          peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#0a0a0f]
                          peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">
                  Budget (AED)
                </label>
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">AED</span>
              </div>
            </div>

            
            <div class="space-y-2">
              <label class="text-sm text-gray-400">Primary Use Case (select all that apply)</label>
              <div class="flex flex-wrap gap-3">
                
                <label class="cursor-pointer inline-flex">
                  <input type="checkbox" name="use_case[]" value="4K Gaming" class="sr-only peer">
                  <span class="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 whitespace-nowrap
                                peer-checked:bg-brand-accent/20 peer-checked:text-brand-accent peer-checked:border-brand-accent/50
                                transition-all hover:bg-white/10">
                    4K Gaming
                  </span>
                </label>
                
                <label class="cursor-pointer inline-flex">
                  <input type="checkbox" name="use_case[]" value="Esports" class="sr-only peer">
                  <span class="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 whitespace-nowrap
                                peer-checked:bg-brand-accent/20 peer-checked:text-brand-accent peer-checked:border-brand-accent/50
                                transition-all hover:bg-white/10">
                    Esports
                  </span>
                </label>
                
                <label class="cursor-pointer inline-flex">
                  <input type="checkbox" name="use_case[]" value="Video Editing" class="sr-only peer">
                  <span class="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 whitespace-nowrap
                                peer-checked:bg-brand-accent/20 peer-checked:text-brand-accent peer-checked:border-brand-accent/50
                                transition-all hover:bg-white/10">
                    Video Editing
                  </span>
                </label>
                
                <label class="cursor-pointer inline-flex">
                  <input type="checkbox" name="use_case[]" value="3D Rendering" class="sr-only peer">
                  <span class="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 whitespace-nowrap
                                peer-checked:bg-brand-accent/20 peer-checked:text-brand-accent peer-checked:border-brand-accent/50
                                transition-all hover:bg-white/10">
                    3D Rendering
                  </span>
                </label>
                
                <label class="cursor-pointer inline-flex">
                  <input type="checkbox" name="use_case[]" value="Streaming" class="sr-only peer">
                  <span class="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 whitespace-nowrap
                                peer-checked:bg-brand-accent/20 peer-checked:text-brand-accent peer-checked:border-brand-accent/50
                                transition-all hover:bg-white/10">
                    Streaming
                  </span>
                </label>
                
                <label class="cursor-pointer inline-flex">
                  <input type="checkbox" name="use_case[]" value="Programming" class="sr-only peer">
                  <span class="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 whitespace-nowrap
                                peer-checked:bg-brand-accent/20 peer-checked:text-brand-accent peer-checked:border-brand-accent/50
                                transition-all hover:bg-white/10">
                    Programming
                  </span>
                </label>
                
                <label class="cursor-pointer inline-flex">
                  <input type="checkbox" name="use_case[]" value="Office Work" class="sr-only peer">
                  <span class="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 whitespace-nowrap
                                peer-checked:bg-brand-accent/20 peer-checked:text-brand-accent peer-checked:border-brand-accent/50
                                transition-all hover:bg-white/10">
                    Office Work
                  </span>
                </label>
                
                <label class="cursor-pointer inline-flex">
                  <input type="checkbox" name="use_case[]" value="VR Ready" class="sr-only peer">
                  <span class="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 whitespace-nowrap
                                peer-checked:bg-brand-accent/20 peer-checked:text-brand-accent peer-checked:border-brand-accent/50
                                transition-all hover:bg-white/10">
                    VR Ready
                  </span>
                </label>
                
              </div>
            </div>
          </div>

          
          <div class="space-y-4">
            <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center">3</span>
              Tell Us More
            </h4>

            <div class="relative">
              <textarea name="message" rows="5"
                class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none focus:border-brand-accent transition-all resize-none"
                placeholder="Describe your dream PC, specific components you want, or any questions..."></textarea>
              <div class="absolute bottom-3 right-3 text-xs text-gray-500">
                <span id="char-count">0</span>/500
              </div>
            </div>

            
            <div class="relative">
              <input type="file" name="attachments[]" multiple id="file-upload" class="sr-only" accept=".jpg,.jpeg,.png,.pdf,.txt">
              <label for="file-upload" class="flex items-center gap-3 p-4 rounded-xl border border-dashed border-white/20 bg-white/5 cursor-pointer hover:border-brand-accent/50 hover:bg-white/10 transition-all group">
                <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-brand-accent/20 transition-colors">
                  <i class="bi bi-cloud-arrow-up text-xl text-gray-400 group-hover:text-brand-accent"></i>
                </div>
                <div class="flex-1">
                  <div class="text-sm font-medium text-white">Attach files (optional)</div>
                  <div class="text-xs text-gray-500">Reference images, part lists, or inspiration \u2014 max 10MB</div>
                </div>
                <i class="bi bi-plus-lg text-gray-400"></i>
              </label>
              <div id="file-list" class="mt-2 space-y-1 hidden"></div>
            </div>
          </div>

          
          <div class="pt-4">
            <button type="submit" id="submit-btn"
              class="w-full group relative rounded-xl bg-gradient-to-r from-brand-accent to-brand-secondary text-black font-bold py-4 text-lg overflow-hidden shadow-lg shadow-brand-accent/30 hover:shadow-xl hover:shadow-brand-accent/40 transition-all">
              <span class="relative z-10 flex items-center justify-center gap-2">
                <span id="btn-text">Get My Quote</span>
                <i class="bi bi-arrow-right group-hover:translate-x-1 transition-transform" id="btn-icon"></i>
              </span>
              <div class="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>

            <p id="quoteMsg" class="mt-4 text-sm text-center hidden"></p>
          </div>

          
          <p class="text-xs text-gray-500 text-center">
            Your details and attachments are stored to respond to this request.
            We'll only use your info to respond to your quote request.
          </p>

          <input type="hidden" name="details[primary_use_case]" id="primary_use_case_hidden">
        </form>
      </div>
    </div>
  </div>
</section>


<section id="showroom" class="py-24 relative overflow-hidden scroll-mt-28">
  
  <div class="absolute inset-0 z-0">
    <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1920"
      alt="Showroom"
      class="w-full h-full object-cover opacity-20 parallax-bg-slow">
    <div class="absolute inset-0 bg-gradient-to-r from-[#070A12] via-[#070A12]/95 to-[#070A12]/80"></div>
  </div>

  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <span class="text-brand-secondary text-sm font-bold uppercase tracking-[0.3em] mb-4 block">Visit Us</span>
        <h2 class="text-4xl md:text-5xl font-display font-bold mb-6">EXPERIENCE THE <span class="text-brand-accent">POWER</span></h2>
        <p class="text-gray-400 text-lg mb-8 leading-relaxed">
          Step into our flagship showroom at Dubai. Test drive the latest GPUs,
          feel the mechanical keyboards, and consult with our build experts in person.
        </p>

        <div class="space-y-6 mb-8">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
              <i class="bi bi-geo-alt-fill text-xl"></i>
            </div>
            <div>
              <h4 class="font-bold text-white mb-1">Flagship Showroom</h4>
              <p class="text-gray-400">Victoria building, international city 2<br>Dubai, UAE</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary shrink-0">
              <i class="bi bi-clock-fill text-xl"></i>
            </div>
            <div>
              <h4 class="font-bold text-white mb-1">Opening Hours</h4>
              <p class="text-gray-400">Sat-Thu: 10AM - 10PM | Fri: 2PM - 10PM</p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-4">
          <a href="https://goo.gl/maps/xyz" target="_blank" rel="noopener noreferrer" class="px-6 py-3 rounded-xl bg-brand-accent text-black font-bold hover:bg-white transition-colors flex items-center gap-2">
            <i class="bi bi-map-fill"></i> Get Directions
          </a>
          
        </div>
      </div>

      <div class="relative">
        <div class="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 glass-panel relative group">
          <img src="https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800"
            alt="Digitron Showroom"
            class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105">

          
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div class="relative">
              <div class="w-6 h-6 bg-brand-accent rounded-full animate-ping absolute"></div>
              <div class="w-6 h-6 bg-brand-accent rounded-full relative shadow-lg shadow-brand-accent/50 flex items-center justify-center">
                <i class="bi bi-geo-alt-fill text-black text-sm"></i>
              </div>
            </div>
          </div>

          
          <div class="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center gap-2">
            <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Open Now
          </div>
        </div>

        
        <div class="absolute -bottom-6 -left-6 glass-panel rounded-xl p-4 border border-brand-accent/30 shadow-xl">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-brand-accent/20 flex items-center justify-center">
              <i class="bi bi-people-fill text-brand-accent text-xl"></i>
            </div>
            <div>
              <div class="text-lg font-bold text-white">50+</div>
              <div class="text-xs text-gray-400">Builds on Display</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
`;

// html-text:/workspace/sites/digitron-computers/templates/footer.html
var footer_default = `
<div class="py-10 bg-brand-accent text-black overflow-hidden relative -rotate-1 scale-105 border-y-4 border-black z-10">
    <div class="whitespace-nowrap animate-marquee flex gap-10 font-display font-bold text-2xl">
        <span>FREE DELIVERY IN DUBAI</span> <span>\u2022</span>
        <span>24/7 TECH SUPPORT</span> <span>\u2022</span>
        <span>0% INSTALLMENTS</span> <span>\u2022</span>
        <span>AUTHORIZED DEALER</span> <span>\u2022</span>
        <span>FREE DELIVERY IN DUBAI</span> <span>\u2022</span>
        <span>24/7 TECH SUPPORT</span> <span>\u2022</span>
        <span>0% INSTALLMENTS</span> <span>\u2022</span>
        <span>AUTHORIZED DEALER</span> <span>\u2022</span>
    </div>
</div>

<footer class="relative overflow-hidden">
    
    <div class="absolute inset-0 bg-[#030305]">
        
        <div class="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>

        
        <div class="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-[150px] animate-pulse"></div>
        <div class="absolute top-0 right-1/4 w-80 h-80 bg-brand-secondary/5 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s;"></div>

        
        <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-accent/50 to-transparent animate-shimmer"></div>
    </div>

    
    <div class="relative z-10">
        
        <div class="border-b border-white/5">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div class="flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div class="text-center lg:text-left">
                        <h3 class="text-2xl md:text-3xl font-display font-bold mb-2">
                            JOIN THE <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-secondary">MASTER RACE</span>
                        </h3>
                        <p class="text-gray-400">Get exclusive deals, new arrival alerts, and PC building tips.</p>
                    </div>

                    <form id="newsletterForm" action="/api/newsletter" method="POST" class="w-full max-w-md">
                        
                        <div class="flex gap-3">
                            <div class="relative flex-1">
                                <input name="email" type="email" required
                                    class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all"
                                    placeholder="Enter your email">
                                <i class="bi bi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                            </div>
                            <button type="submit"
                                class="group px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-accent to-brand-secondary text-black font-bold hover:shadow-lg hover:shadow-brand-accent/30 transition-all flex items-center gap-2">
                                <span>Subscribe</span>
                                <i class="bi bi-arrow-right group-hover:translate-x-1 transition-transform"></i>
                            </button>
                        </div>
                        <p id="newsletterMsg" class="mt-3 text-sm hidden"></p>
                    </form>
                </div>
            </div>
        </div>

        
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
                
                <div class="lg:col-span-4 space-y-6">
                    <div class="flex items-center gap-3 group">
                        <div class="relative">
                            <img src="/images/logo-cropped.png" alt="Digitron Computers UAE" class="h-14 w-auto object-contain relative z-10">
                            <div class="absolute inset-0 bg-brand-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div class="leading-tight">
                            <div class="font-display font-bold text-xl tracking-wider text-white group-hover:text-brand-accent transition-colors">DIGITRON</div>
                            <div class="text-[10px] text-white/50 font-bold tracking-[0.3em] uppercase">Computers UAE</div>
                        </div>
                    </div>

                    <p class="text-gray-400 text-sm leading-relaxed max-w-sm">
                        The UAE's premier destination for high-performance computing hardware.
                        From custom builds to enterprise solutions, we fuel the PC Master Race.
                    </p>

                    
                    <div class="space-y-3">
                        <a href="https://wa.me/971501240180" class="flex items-center gap-3 text-gray-400 hover:text-emerald-400 transition-colors group">
                            <div class="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                                <i class="bi bi-whatsapp text-lg"></i>
                            </div>
                            <div>
                                <div class="text-xs text-gray-500">WhatsApp</div>
                                <div class="text-sm font-medium">+971 50 124 0180</div>
                            </div>
                        </a>

                        <a href="tel:+971501240180" class="flex items-center gap-3 text-gray-400 hover:text-brand-accent transition-colors group">
                            <div class="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-accent/10 transition-colors">
                                <i class="bi bi-telephone text-lg"></i>
                            </div>
                            <div>
                                <div class="text-xs text-gray-500">Phone</div>
                                <div class="text-sm font-medium">+971 50 124 0180</div>
                            </div>
                        </a>

                        <div class="flex items-center gap-3 text-gray-400">
                            <div class="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                <i class="bi bi-geo-alt text-lg"></i>
                            </div>
                            <div>
                                <div class="text-xs text-gray-500">Showroom</div>
                                <div class="text-sm font-medium">Victoria building, international city 2, Dubai, UAE</div>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div class="lg:col-span-2">
                    <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                        Shop
                    </h4>
                    <ul class="space-y-3">
                        <li>
                            <a href="/shop" class="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                                <span class="w-0 group-hover:w-2 h-px bg-brand-accent transition-all"></span>
                                <span class="group-hover:translate-x-1 transition-transform">All Products</span>
                            </a>
                        </li>

                        <li>
                            <a href="/shop?category=graphics-cards" class="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                                <span class="w-0 group-hover:w-2 h-px bg-brand-accent transition-all"></span>
                                <span class="group-hover:translate-x-1 transition-transform">Graphics Cards</span>
                            </a>
                        </li>

                        <li>
                            <a href="/shop?category=processors" class="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                                <span class="w-0 group-hover:w-2 h-px bg-brand-accent transition-all"></span>
                                <span class="group-hover:translate-x-1 transition-transform">Processors</span>
                            </a>
                        </li>

                        <li>
                            <a href="/shop?category=memory" class="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                                <span class="w-0 group-hover:w-2 h-px bg-brand-accent transition-all"></span>
                                <span class="group-hover:translate-x-1 transition-transform">Memory</span>
                            </a>
                        </li>

                        <li>
                            <a href="/shop?category=storage" class="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                                <span class="w-0 group-hover:w-2 h-px bg-brand-accent transition-all"></span>
                                <span class="group-hover:translate-x-1 transition-transform">Storage</span>
                            </a>
                        </li>

                        <li>
                            <a href="/shop?category=motherboards" class="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                                <span class="w-0 group-hover:w-2 h-px bg-brand-accent transition-all"></span>
                                <span class="group-hover:translate-x-1 transition-transform">Motherboards</span>
                            </a>
                        </li>

                        <li>
                            <a href="/shop?category=power-supply" class="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                                <span class="w-0 group-hover:w-2 h-px bg-brand-accent transition-all"></span>
                                <span class="group-hover:translate-x-1 transition-transform">Power Supply</span>
                            </a>
                        </li>
                    </ul>
                </div>

                
                <div class="lg:col-span-2">
                    <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-brand-secondary"></span>
                        Support
                    </h4>
                    <ul class="space-y-3">
                        <li>
                            <a href="/quote" class="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                                <span class="w-0 group-hover:w-2 h-px bg-brand-secondary transition-all"></span>
                                <span class="group-hover:translate-x-1 transition-transform">Get a Quote</span>
                            </a>
                        </li>

                        <li>
                            <a href="/quote#quote-section" class="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                                <span class="w-0 group-hover:w-2 h-px bg-brand-secondary transition-all"></span>
                                <span class="group-hover:translate-x-1 transition-transform">PC Builder</span>
                            </a>
                        </li>

                        <li>
                            <a href="/quote" class="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                                <span class="w-0 group-hover:w-2 h-px bg-brand-secondary transition-all"></span>
                                <span class="group-hover:translate-x-1 transition-transform">Contact Us</span>
                            </a>
                        </li>
                    </ul>
                </div>

                
                <div class="lg:col-span-2">
                    <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Company
                    </h4>
                    <ul class="space-y-3">
                        <li>
                            <a href="/about" class="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                                <span class="w-0 group-hover:w-2 h-px bg-emerald-400 transition-all"></span>
                                <span class="group-hover:translate-x-1 transition-transform">About Us</span>
                            </a>
                        </li>

                        <li>
                            <a href="/" class="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                                <span class="w-0 group-hover:w-2 h-px bg-emerald-400 transition-all"></span>
                                <span class="group-hover:translate-x-1 transition-transform">Home</span>
                            </a>
                        </li>

                        <li>
                            <a href="/shop" class="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                                <span class="w-0 group-hover:w-2 h-px bg-emerald-400 transition-all"></span>
                                <span class="group-hover:translate-x-1 transition-transform">Shop</span>
                            </a>
                        </li>
                    </ul>
                </div>

                
                <div class="lg:col-span-2">
                    <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                        Connect
                    </h4>

                    
                    <div class="flex flex-wrap gap-3 mb-8">
                        

                        
                        <span  class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-pink-500 hover:bg-pink-500/10 hover:border-current transition-all group">
                            <i class="bi bi-instagram text-lg group-hover:scale-110 transition-transform"></i>
                        </span>
                        
                        <span  class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 hover:border-current transition-all group">
                            <i class="bi bi-facebook text-lg group-hover:scale-110 transition-transform"></i>
                        </span>
                        
                        <span  class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-current transition-all group">
                            <i class="bi bi-twitter-x text-lg group-hover:scale-110 transition-transform"></i>
                        </span>
                        
                        <span  class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 hover:border-current transition-all group">
                            <i class="bi bi-youtube text-lg group-hover:scale-110 transition-transform"></i>
                        </span>
                        
                        <span  class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 hover:border-current transition-all group">
                            <i class="bi bi-tiktok text-lg group-hover:scale-110 transition-transform"></i>
                        </span>
                        
                        <span  class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-indigo-400 hover:bg-indigo-400/10 hover:border-current transition-all group">
                            <i class="bi bi-discord text-lg group-hover:scale-110 transition-transform"></i>
                        </span>
                        
                    </div>

                    
                    <h5 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">We Accept</h5>
                    <div class="flex flex-wrap gap-2">
                        
                        <div class="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs flex items-center gap-1.5">
                            <i class="bi bi-credit-card"></i>
                            <span class="capitalize">Card</span>
                        </div>
                        
                        <div class="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs flex items-center gap-1.5">
                            <i class="bi bi-paypal"></i>
                            <span class="capitalize">paypal</span>
                        </div>
                        
                        <div class="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs flex items-center gap-1.5">
                            <i class="bi bi-apple"></i>
                            <span class="capitalize">apple</span>
                        </div>
                        
                        <div class="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs flex items-center gap-1.5">
                            <i class="bi bi-google"></i>
                            <span class="capitalize">google</span>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>

        
        <div class="border-t border-white/5">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div class="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
                        <span>&copy; 2026 Digitron Computers UAE. All rights reserved.</span>
                        <span  class="hover:text-white transition-colors">Privacy Policy</span>
                        <span  class="hover:text-white transition-colors">Terms of Service</span>
                        <span  class="hover:text-white transition-colors">Cookie Settings</span>
                    </div>

                    
                    <div class="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                        <span class="relative flex h-2 w-2">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span class="text-xs text-gray-400">Store Open \u2022 <span class="text-emerald-400">Online</span></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</footer>`;

// html-text:/workspace/sites/digitron-computers/templates/shop-hero.html
var shop_hero_default = '\n\n\n\n\n\n<section class="relative h-[60vh] min-h-[500px] overflow-hidden flex items-center justify-center">\n    \n    <div class="absolute inset-0 w-full h-full z-0">\n        <div class="object-cover w-full h-full opacity-60 scale-110" aria-hidden="true"></div>\n        <div class="absolute inset-0 bg-gradient-to-b from-[#070A12]/15 via-[#070A12]/35 to-[#070A12]/55"></div>\n    </div>\n\n    \n    <div class="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none"></div>\n\n    \n    <div class="relative z-10 text-center px-4 max-w-4xl mx-auto parallax-hero">\n        <div class="inline-block mb-4 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-brand-accent text-xs font-bold tracking-[0.2em] uppercase animate-pulse">\n            Premium Components\n        </div>\n        <h1 class="text-5xl md:text-7xl font-display font-black mb-6 tracking-tight">\n            SHOP\n            <span class="inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">\n                HARDWARE\n            </span>\n        </h1>\n\n        <p class="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light">\n            Curated selection of new, used, and refurbished components for serious builders in UAE.\n        </p>\n\n        \n        <div class="mt-10 flex justify-center gap-8 md:gap-16">\n            <div class="text-center">\n                <div class="text-3xl font-display font-bold text-white">8</div>\n                <div class="text-xs text-gray-500 uppercase tracking-widest mt-1">Products</div>\n            </div>\n            <div class="text-center">\n                <div class="text-3xl font-display font-bold text-white counter" data-target="24">0</div>\n                <div class="text-xs text-gray-500 uppercase tracking-widest mt-1">Hour Delivery</div>\n            </div>\n            <div class="text-center">\n                <div class="text-3xl font-display font-bold text-white counter" data-target="2">0</div>\n                <div class="text-xs text-gray-500 uppercase tracking-widest mt-1">Year Warranty</div>\n            </div>\n        </div>\n    </div>\n\n    \n    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">\n        <i class="bi bi-chevron-down text-brand-accent text-2xl"></i>\n    </div>\n</section>\n';

// lib/catalog.json
var catalog_default2 = {
  products: [
    {
      id: 1,
      name: "RTX 4070 Super",
      slug: "rtx-4070-super",
      price: 2799,
      priceCents: 279900,
      category: "graphics-cards",
      condition: "new",
      badge: "hot",
      image: "images/products/rtx-4070-super.png",
      brand: "NVIDIA",
      watts: 220,
      stock: 10,
      description: "Contact Digitron for full specifications, compatibility and warranty details."
    },
    {
      id: 2,
      name: "Ryzen 7 7800X3D",
      slug: "ryzen-7-7800x3d",
      price: 1699,
      priceCents: 169900,
      category: "processors",
      condition: "new",
      badge: "bestseller",
      image: "images/products/ryzen-7-7800x3d.png",
      brand: "AMD",
      watts: 120,
      stock: 10,
      description: "Contact Digitron for full specifications, compatibility and warranty details."
    },
    {
      id: 3,
      name: "DDR5 32GB 6000MHz",
      slug: "ddr5-32gb-6000mhz",
      price: 489,
      priceCents: 48900,
      category: "memory",
      condition: "new",
      badge: "",
      image: "images/products/ddr5-32gb.png",
      brand: "",
      watts: 0,
      stock: 10,
      description: "Contact Digitron for full specifications, compatibility and warranty details."
    },
    {
      id: 4,
      name: "NVMe SSD 1TB Gen4",
      slug: "nvme-ssd-1tb-gen4",
      price: 299,
      priceCents: 29900,
      category: "storage",
      condition: "new",
      badge: "sale",
      image: "images/products/nvme-1tb.png",
      brand: "",
      watts: 0,
      stock: 10,
      description: "Contact Digitron for full specifications, compatibility and warranty details."
    },
    {
      id: 5,
      name: "Used GTX 1660 Super",
      slug: "used-gtx-1660-super",
      price: 499,
      priceCents: 49900,
      category: "graphics-cards",
      condition: "used",
      badge: "used",
      image: "images/products/gtx-1660-super.png",
      brand: "NVIDIA",
      watts: 125,
      stock: 10,
      description: "Contact Digitron for full specifications, compatibility and warranty details."
    },
    {
      id: 6,
      name: "750W Gold PSU",
      slug: "750w-gold-psu",
      price: 349,
      priceCents: 34900,
      category: "power-supply",
      condition: "new",
      badge: "",
      image: "images/products/psu-750w.png",
      brand: "",
      watts: 0,
      stock: 10,
      description: "Contact Digitron for full specifications, compatibility and warranty details."
    },
    {
      id: 7,
      name: "Intel Core i9-14900K",
      slug: "intel-core-i9-14900k",
      price: 1899,
      priceCents: 189900,
      category: "processors",
      condition: "new",
      badge: "hot",
      image: "images/products/i9-14900k.png",
      brand: "Intel",
      watts: 125,
      stock: 10,
      description: "Contact Digitron for full specifications, compatibility and warranty details."
    },
    {
      id: 8,
      name: "ASUS ROG Motherboard",
      slug: "asus-rog-motherboard",
      price: 899,
      priceCents: 89900,
      category: "motherboards",
      condition: "new",
      badge: "",
      image: "images/products/asus-rog-mobo.png",
      brand: "ASUS",
      watts: 0,
      stock: 10,
      description: "Contact Digitron for full specifications, compatibility and warranty details."
    }
  ],
  categories: [
    {
      slug: "processors",
      name: "Processors",
      image: "images/categories/processors.png"
    },
    {
      slug: "graphics-cards",
      name: "Graphics Cards",
      image: "images/categories/gpu.png"
    },
    {
      slug: "memory",
      name: "Memory",
      image: "images/categories/ram.png"
    },
    {
      slug: "storage",
      name: "Storage",
      image: "images/categories/ssd.png"
    },
    {
      slug: "motherboards",
      name: "Motherboards",
      image: "images/categories/motherboards.png"
    },
    {
      slug: "power-supply",
      name: "Power Supplies",
      image: "images/categories/psu.png"
    }
  ]
};

// lib/pages.js
var escape = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var money = (c) => "AED " + (c / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
var icon = (n) => `<i class="bi bi-${n}" aria-hidden="true"></i>`;
var categories = catalog_default2.categories;
function card(p) {
  return `<article class="product-card group relative rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-brand-accent/50 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-accent/10 hover:-translate-y-2" data-product="${p.id}"><div class="card-image relative aspect-square overflow-hidden bg-gradient-to-br from-white/5 to-transparent"><a href="/product/${escape(p.slug)}" aria-label="${escape(p.name)}"><img src="/${escape(p.image)}" alt="${escape(p.name)}" class="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110" loading="lazy"></a><button class="wish-button" data-wish="${p.id}" aria-label="Save ${escape(p.name)} to wishlist" aria-pressed="false">${icon("heart")}</button><button type="button" class="card-add" data-add="${p.id}" ${p.stock < 1 ? "disabled" : ""}>${icon("cart-plus")} ${p.stock > 0 ? "Quick Add" : "Out of stock"}</button></div><div class="p-4"><span class="text-xs text-brand-accent uppercase tracking-wider">${escape(p.condition)}</span><h3 class="font-bold mt-2 mb-3"><a href="/product/${escape(p.slug)}">${escape(p.name)}</a></h3><div class="font-bold text-lg">${money(p.price_cents)}</div><p class="text-sm text-gray-400 mt-2">${p.stock > 0 ? p.stock + " available" : "Currently unavailable"}</p></div></article>`;
}
var header = `<a class="skip-link" href="#main">Skip to content</a><header id="siteHeader" class="fixed top-0 left-0 right-0 z-50"><div class="header-row px-4 py-4 sm:px-6"><a href="/" class="brand"><img src="/images/logo-cropped.png" alt="Digitron Computers UAE" class="brand-logo"><span class="brand-text"><span class="bt-main font-display font-bold">DIGITRON <span class="bt-sub text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-secondary">COMPUTERS UAE</span></span></span></a><nav class="store-actions" aria-label="Main navigation">${[["/about", "info-circle", "About"], ["/shop", "basket3", "Shop"], ["/quote", "headset", "Contact"]].map(([href, ic, title]) => `<a href="${href}" class="icon-btn" aria-label="${title}">${icon(ic)}<span class="icon-label">${title}</span></a>`).join("")}<button type="button" class="icon-btn" data-open="wishlistDialog" aria-label="Open wishlist">${icon("heart")}<span class="badge-count" data-wish-count>0</span></button><button type="button" class="icon-btn" data-open="cartDialog" aria-label="Open cart">${icon("cart3")}<span class="badge-count" data-cart-count>0</span></button><button type="button" class="icon-btn" data-open="menuDialog" aria-label="Open navigation menu">${icon("list")}</button></nav></div></header>`;
function dialog(id, title, body) {
  return `<dialog id="${id}" class="store-dialog" aria-labelledby="${id}Title"><div class="dialog-heading"><h2 id="${id}Title">${title}</h2><button type="button" data-close aria-label="Close ${title}">${icon("x-lg")}</button></div>${body}</dialog>`;
}
var dialogs = dialog("cartDialog", "Shopping Cart", "<div data-cart-content><p>Loading cart\u2026</p></div>") + dialog("wishlistDialog", "Your Wishlist", "<div data-wishlist-content><p>Loading wishlist\u2026</p></div>") + dialog("menuDialog", "Explore Digitron", `<nav class="menu-links"><a href="/">Home</a><a href="/shop">Shop all products</a><a href="/about">About us</a><a href="/quote">Contact & quotes</a><a href="/#builder">PC builder</a><a href="/cart">Shopping cart</a><a href="/wishlist">Wishlist</a><hr>${categories.map((c) => `<a href="/shop?category=${c.slug}">${c.name}</a>`).join("")}</nav><form action="/shop" class="mt-6"><label for="menuSearch">Search products</label><input id="menuSearch" name="q" type="search" placeholder="Search components" class="store-input"><button class="store-button mt-3">Search</button></form>`) + dialog("zoomDialog", "Product image", '<img id="zoomImage" alt="Product detail" class="w-full object-contain">');
var support = `<button class="dc-whatsapp-float" data-open="supportDialog" aria-label="Open support chat">${icon("whatsapp")}</button>${dialog("supportDialog", "Digitron Support", `<p class="text-gray-400 mb-4">Choose a topic for quick information, or leave an enquiry.</p><div class="support-chips">${["Delivery", "Warranty", "Custom PC", "Payment", "Location", "Stock"].map((t) => `<button type="button" data-topic="${t}">${t}</button>`).join("")}</div><div id="supportAnswer" class="mt-4" aria-live="polite"></div><a id="whatsappLink" href="https://wa.me/971501240180?text=Hello%20Digitron%20Computers" target="_blank" rel="noopener noreferrer" class="store-button mt-5">Continue on WhatsApp ${icon("whatsapp")}</a><form id="supportForm" class="mt-6 space-y-3"><label>Your name<input name="name" class="store-input" required maxlength="255" autocomplete="name"></label><label>Email<input type="email" name="email" class="store-input" required maxlength="254" autocomplete="email"></label><label>Phone (optional)<input type="tel" name="phone" class="store-input" maxlength="50" autocomplete="tel"></label><label>Your question<textarea name="message" class="store-input" required maxlength="2000"></textarea></label><button class="store-button" type="submit">Save enquiry</button><p class="form-status" role="status"></p></form>`)}`;
function shell(content, title = "Digitron Computers", page2 = "home", data = null) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Digitron Computers UAE \u2014 new and used components, custom PC builds and expert support."><title>${escape(title)}</title><link rel="icon" href="/images/icon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/repairs.css?v=20260914-alignment2"><script src="/store.js" defer></script></head><body class="text-white loaded" data-page="${page2}">${header}<main id="main">${content}</main>${footer_default}${dialogs}${support}<div id="dcToast" role="status" aria-live="polite" hidden></div><noscript><p class="noscript-note">Enable JavaScript to use the cart and forms. You can also contact us on <a href="https://wa.me/971501240180">WhatsApp</a>.</p></noscript>${data ? `<script type="application/json" id="pageData">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>` : ""}</body></html>`;
}
function shop(url, products2) {
  const q = (url.searchParams.get("q") || "").slice(0, 150), cat = url.searchParams.get("category") || url.pathname.split("/")[2] || "all", condition = url.searchParams.get("condition") || "", sort = url.searchParams.get("sort") || "featured", brand = url.searchParams.get("brand") || "";
  const min = Number(url.searchParams.get("min") || 0), max = Number(url.searchParams.get("max") || Infinity);
  let filtered = products2.filter((p) => (cat === "all" || p.category === cat) && (!condition || p.condition === condition) && (!brand || p.brand === brand) && p.price_cents >= min * 100 && p.price_cents <= max * 100 && p.name.toLowerCase().includes(q.toLowerCase()));
  if (sort === "price-asc") filtered.sort((a, b) => a.price_cents - b.price_cents);
  if (sort === "price-desc") filtered.sort((a, b) => b.price_cents - a.price_cents);
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  return shop_hero_default + `<section class="max-w-7xl mx-auto px-4 py-12"><div class="shop-toolbar"><p>${filtered.length} products</p><div class="category-pills"><a href="/shop" ${cat === "all" ? 'aria-current="page"' : ""}>All</a>${categories.map((c) => `<a href="/shop?category=${c.slug}" ${c.slug === cat ? 'aria-current="page"' : ""}>${c.name}</a>`).join("")}</div><button class="store-button secondary" id="viewToggle" aria-pressed="false">List view</button></div><div class="shop-layout"><aside class="glass-panel rounded-2xl p-5"><form action="/shop" id="filterForm" class="space-y-4"><h2 class="font-bold text-xl">Filter Products</h2><label>Search<input class="store-input" name="q" value="${escape(q)}" type="search"></label><label>Category<select name="category" class="store-input"><option value="all">All categories</option>${categories.map((c) => `<option value="${c.slug}" ${c.slug === cat ? "selected" : ""}>${c.name}</option>`).join("")}</select></label><label>Condition<select class="store-input" name="condition"><option value="">All conditions</option>${["new", "used", "refurbished"].map((c) => `<option ${c === condition ? "selected" : ""} value="${c}">${c}</option>`).join("")}</select></label><label>Brand<select name="brand" class="store-input"><option value="">All brands</option>${[...new Set(products2.map((p) => p.brand).filter(Boolean))].map((b) => `<option ${b === brand ? "selected" : ""}>${escape(b)}</option>`).join("")}</select></label><div class="grid grid-cols-2 gap-2"><label>Min AED<input class="store-input" type="number" name="min" min="0" step="0.01" value="${Number.isFinite(min) ? min : 0}"></label><label>Max AED<input class="store-input" type="number" name="max" min="0" step="0.01" value="${Number.isFinite(max) ? max : ""}"></label></div><label>Sort<select name="sort" class="store-input">${[["featured", "Featured"], ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"], ["name", "Name A\u2013Z"]].map(([s, n]) => `<option value="${s}" ${s === sort ? "selected" : ""}>${n}</option>`).join("")}</select></label><button class="store-button w-full">Apply filters</button><a href="/shop" class="block text-center text-gray-400">Clear filters</a></form></aside><div><div id="shopProducts" class="store-product-grid">${filtered.length ? filtered.map(card).join("") : '<div class="empty-state"><h2>No matching products</h2><p>Try changing your search or filters.</p><a class="store-button" href="/shop">View all products</a></div>'}</div></div></div></section>`;
}
function product(p, products2) {
  const cat = categories.find((c) => c.slug === p.category);
  return `<section class="relative min-h-screen pt-32 pb-12 overflow-hidden"><div class="absolute inset-0 bg-gradient-to-br from-brand-secondary/20 via-transparent to-brand-accent/10 pointer-events-none"></div><div class="max-w-7xl mx-auto px-4 relative"><nav class="text-sm text-gray-400 mb-8 flex gap-3 flex-wrap" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/shop">Shop</a> / <a href="/shop?category=${p.category}">${escape(cat?.name || p.category)}</a> / <span>${escape(p.name)}</span></nav><div class="grid gap-12 lg:grid-cols-2"><div><button id="main-gallery" data-zoom="/${escape(p.image)}" class="w-full relative aspect-square rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden group" aria-label="Enlarge product image"><img src="/${escape(p.image)}" alt="${escape(p.name)}" class="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"><span class="absolute bottom-4 right-4 bg-black/50 rounded-full px-3 py-2 text-sm">${icon("zoom-in")} Click to zoom</span></button></div><div class="space-y-6"><div class="text-brand-accent uppercase tracking-widest">${escape(p.condition)} \xB7 ${escape(p.brand || cat?.name || "Component")}</div><h1 class="font-display text-3xl md:text-5xl font-bold">${escape(p.name)}</h1><p class="text-gray-400">${escape(p.description)}</p><div class="text-4xl font-bold">${money(p.price_cents)}</div><p>Prices exclude checkout tax.</p><p class="text-brand-accent">${p.stock > 0 ? `${p.stock} available` : "Out of stock"}</p><div class="flex gap-3 flex-wrap"><label>Quantity<input id="productQty" class="store-input w-24" type="number" value="1" min="1" max="${Math.min(10, p.stock)}" ${p.stock < 1 ? "disabled" : ""}></label><button class="store-button self-end" data-add="${p.id}" data-product-qty ${p.stock < 1 ? "disabled" : ""}>${icon("cart-plus")} Add to Cart</button><button class="store-button secondary self-end" data-wish="${p.id}" aria-pressed="false">${icon("heart")} Wishlist</button></div><a href="/quote#quote-section" class="store-button secondary">Request a quote</a><div class="grid grid-cols-3 gap-3 text-sm border-t border-white/10 pt-6"><span>${icon("truck")} UAE Delivery</span><span>${icon("cash-coin")} Cash on Delivery</span><span>${icon("headset")} Expert Support</span></div><a href="https://wa.me/971501240180?text=${encodeURIComponent("Hello Digitron, I am interested in " + p.name + ". Please confirm specifications, stock and warranty.")}" target="_blank" rel="noopener noreferrer" class="text-brand-accent">${icon("whatsapp")} Ask about this product</a></div></div><div class="product-details glass-panel mt-12 p-6 rounded-2xl"><div class="detail-tabs" role="tablist" aria-label="Product information">${["Description", "Specifications", "Delivery & Warranty"].map((t, i) => `<button type="button" role="tab" id="tab-${i}" aria-selected="${i === 0}" aria-controls="panel-${i}" data-tab="${i}">${t}</button>`).join("")}</div><section role="tabpanel" id="panel-0" aria-labelledby="tab-0" class="pt-5">${escape(p.description)}</section><section role="tabpanel" id="panel-1" aria-labelledby="tab-1" class="pt-5" hidden><dl><dt>Product</dt><dd>${escape(p.name)}</dd><dt>Condition</dt><dd>${escape(p.condition)}</dd><dt>Category</dt><dd>${escape(cat?.name)}</dd></dl><p class="mt-4 text-gray-400">Full technical specifications were not included in the supplied catalog. Contact us before purchase to confirm compatibility.</p></section><section role="tabpanel" id="panel-2" aria-labelledby="tab-2" class="pt-5" hidden>Delivery is within the UAE. Shipping and tax are shown before order submission. Please confirm product-specific warranty terms with Digitron.</section></div><section class="mt-16"><h2 class="text-2xl font-display mb-6">Related Products</h2><div class="store-product-grid">${products2.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4).map(card).join("") || '<p>Explore more components in our <a href="/shop">shop</a>.</p>'}</div></section><section id="recentProducts" class="mt-12" hidden><h2 class="text-2xl font-display mb-6">Recently Viewed</h2><div class="store-product-grid"></div></section></div></section>`;
}
var field = (name, label, type = "text", max = 190) => `<label>${label}<input name="${name}" type="${type}" class="store-input" required maxlength="${max}" autocomplete="${{ full_name: "name", email: "email", phone: "tel", city: "address-level2" }[name] || "off"}"></label>`;
function checkout() {
  return `<section class="store-page"><div class="text-center mb-12"><p class="text-brand-accent uppercase tracking-widest">Guest Checkout</p><h1 class="font-display text-4xl md:text-6xl font-bold">CHECK<span class="text-brand-accent">OUT</span></h1><p class="text-gray-400 mt-4">Complete your shipping details and place your Cash on Delivery order.</p></div><form id="checkoutForm" class="checkout-grid"><div class="space-y-6"><div class="glass-panel rounded-2xl p-6"><nav class="flex justify-between mb-8 text-sm" aria-label="Checkout progress"><a href="/cart">1 \xB7 Cart</a><span aria-current="step" class="text-brand-accent">2 \xB7 Shipping</span><span>3 \xB7 Complete</span></nav><h2 class="text-xl font-bold mb-5">Shipping Details</h2><div class="grid md:grid-cols-2 gap-4">${field("full_name", "Full name")}${field("email", "Email address", "email", 254)}${field("phone", "Phone number", "tel", 50)}${field("city", "City / Emirate", "text", 100)}</div><label class="block mt-4">Full delivery address<textarea name="address" class="store-input" required maxlength="1000" rows="4" autocomplete="street-address"></textarea></label></div><div class="glass-panel rounded-2xl p-6"><h2 class="text-xl font-bold mb-5">Payment Method</h2><label class="flex gap-3 p-4 rounded-xl border border-brand-accent/30 bg-brand-accent/10"><input type="radio" name="payment_method" value="cash_on_delivery" checked>Cash on Delivery</label><p class="text-sm text-gray-400 mt-4">No online card payment is taken.</p></div></div><aside class="glass-panel rounded-2xl p-6 h-fit"><h2 class="text-xl font-bold mb-5">Order Summary</h2><div id="checkoutSummary"><p>Loading your cart\u2026</p></div><button class="store-button w-full mt-6" id="placeOrder" disabled>Place order</button><p class="form-status mt-4" role="status"></p></aside></form></section>`;
}
function page(url, products2) {
  const path = url.pathname;
  let content, title, pageName, data = null, status = 200;
  if (path === "/") {
    content = home_default;
    title = "Digitron Computers";
    pageName = "home";
  } else if (path === "/about") {
    content = about_default;
    title = "About Us | Digitron Computers";
    pageName = "about";
  } else if (path === "/quote") {
    content = quote_default;
    title = "Get a Quote | Digitron Computers";
    pageName = "quote";
  } else if (path === "/shop" || path.startsWith("/shop/")) {
    content = shop(url, products2);
    title = "Shop | Digitron Computers";
    pageName = "shop";
  } else if (path.startsWith("/product/")) {
    const p = products2.find((p2) => p2.slug === path.split("/")[2]);
    if (p) {
      content = product(p, products2);
      title = p.name + " | Digitron Computers";
      pageName = "product";
      data = p;
    }
  } else if (path === "/cart" || path === "/wishlist") {
    pageName = path.slice(1);
    title = (pageName === "cart" ? "Shopping Cart" : "Wishlist") + " | Digitron Computers";
    content = `<section class="store-page"><h1 class="font-display text-4xl font-bold mb-10">${pageName === "cart" ? "Shopping Cart" : "Your Wishlist"}</h1><div data-${pageName === "cart" ? "cart" : "wishlist"}-content><p>Loading\u2026</p></div><p class="text-sm text-gray-400 mt-6">Saved for this browser for 30 days. No account required.</p></section>`;
  } else if (path === "/checkout") {
    content = checkout();
    title = "Checkout | Digitron Computers";
    pageName = "checkout";
  } else if (path.startsWith("/checkout/complete/")) {
    content = '<section class="store-page"><div id="orderConfirmation" class="glass-panel rounded-2xl p-8"><p>Loading order confirmation\u2026</p></div></section>';
    title = "Order Confirmation | Digitron Computers";
    pageName = "complete";
    data = { id: path.split("/").at(-1) };
  }
  if (!content) {
    status = 404;
    content = '<section class="store-page empty-state"><h1>Page not found</h1><p>This page does not exist.</p><a href="/shop" class="store-button">Return to the shop</a></section>';
    title = "Page not found | Digitron Computers";
    pageName = "not-found";
  }
  return { html: shell(content, title, pageName, data), status };
}

// standalone-worker.js
var standalone_worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/index.html") return Response.redirect(new URL("/", url), 301);
    if (url.pathname.startsWith("/images/") || url.pathname.startsWith("/videos/") || ["/styles.css", "/repairs.css", "/store.js", "/robots.txt", "/favicon.ico"].includes(url.pathname)) return env.ASSETS.fetch(request);
    const headers = new Headers({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin", "X-Frame-Options": "DENY", "Permissions-Policy": "camera=(), microphone=(), geolocation=()" });
    try {
      await initialize(env);
      if (url.pathname.startsWith("/api/")) {
        const guest = await session(request, env);
        if (guest.cookie) headers.set("Set-Cookie", guest.cookie);
        const result2 = await api(request, env, guest.id);
        headers.set("Content-Type", "application/json; charset=utf-8");
        return new Response(JSON.stringify(result2), { headers });
      }
      if (!["GET", "HEAD"].includes(request.method)) return new Response("Method not allowed", { status: 405, headers });
      const result = page(url, await products(env));
      headers.set("Content-Type", "text/html; charset=utf-8");
      return new Response(request.method === "HEAD" ? null : result.html, { status: result.status, headers });
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 503, message = error instanceof HttpError ? error.message : "The store is temporarily unavailable. Please try again shortly.";
      headers.set("Content-Type", url.pathname.startsWith("/api/") ? "application/json; charset=utf-8" : "text/html; charset=utf-8");
      return new Response(url.pathname.startsWith("/api/") ? JSON.stringify({ ok: false, message }) : shell('<section class="store-page"><h1>Temporarily unavailable</h1><p>Please try again shortly or contact Digitron.</p><a href="https://wa.me/971501240180" class="store-button">WhatsApp</a></section>'), { status, headers });
    }
  }
};
export {
  standalone_worker_default as default
};
