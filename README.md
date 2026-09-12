# Digitron Computers — HTML, CSS and JavaScript conversion

## Open directly on your computer

Extract the entire ZIP, then double-click **index.html** in the top-level
Digitron-Computers folder. Keep `public/` and `local-preview.js` beside it.
Do not open `templates/home.html`: templates are server fragments, not pages.
See `START-HERE.txt` for details. The root HTML files provide local browsing;
real cart/wishlist persistence, checkout and form submissions need the backend
described below. Exact web fonts and Bootstrap icons need internet access.

This package contains a plain HTML/CSS/JavaScript storefront and a JavaScript Cloudflare Worker backend. PHP, Laravel, customer accounts and admin pages are not included. The prebuilt `worker.js` runs the storefront and API; it contains no React or Laravel runtime.

## Included

- Original home, about and quote layouts, original styling, images, background videos, hover effects and slideshows.
- Shop search, category/condition/brand/price filters and sorting; grid/list views; product pages, zoom and related products.
- Guest cart, wishlist and recent products saved on the server and associated with a random HttpOnly browser cookie (30 days). Clearing cookies loses access to that guest state; there is no cross-device account sync.
- Guest cash-on-delivery checkout, server-calculated prices and totals, inventory reservation, duplicate-order protection and private order confirmation/printing.
- Quote forms and up to 5 private attachments, 10MB per file; newsletter subscriptions; support enquiries and WhatsApp contact.
- Seed settings from the original: 5% tax and free shipping. Confirm these business settings before accepting real orders.

## Important before launch

The upload contained no live database export. Only the 8 products supplied in `ProductSeeder.php` were recoverable; the seed prices and starting quantity of 10 are preserved. These are NOT verified live stock figures. Replace them with your actual catalog and confirm prices/availability before public launch. Existing customers, historic orders, quotes and subscribers were not migrated because none were supplied.

Submissions are stored in D1 and attachments in a private R2 bucket. The original code did not send merchant/customer email notifications, and this conversion does not pretend to send them. With the admin removed, use your hosting account's database tools to read/export orders, quotes, subscribers and enquiries. An email integration can be added separately. Do not expose the database or attachments publicly.

The builder is a component selector, not a verified compatibility or FPS calculator: the supplied catalog has no sufficient motherboard/socket/performance metadata. Unfounded FPS/compatibility claims were corrected. Its CPU/GPU power display is a partial estimate, not a PSU sizing recommendation. Product-specific warranties/specifications must be confirmed with the shop. Card payments were not implemented in the original checkout; only cash on delivery is enabled.

The existing contact page's number `+971 50 124 0180` is used consistently instead of the original placeholder. Existing business copy, address, external imagery and claims remain from your source; please verify them. Social-profile URLs and policy documents were not supplied: placeholder social links have been made non-interactive rather than inventing destinations.

## Deploy to your Cloudflare account

This is NOT a static-only Cloudflare Pages upload: orders and uploads require the Worker, D1 and R2. It does not require PHP hosting.

1. Install Node.js 22.13+ (Node 24 recommended), extract this ZIP and open a terminal in its folder.
2. Run `npm install`, then `npx wrangler login` to authorize your own Cloudflare account.
3. Create your database: `npx wrangler d1 create digitron-store`.
4. Replace the placeholder `database_id` in `wrangler.jsonc` with the ID returned above. Keep the binding `DB`.
5. Create a private bucket: `npx wrangler r2 bucket create digitron-quotes`. Keep its binding `BUCKET`. If the name is already in use in your account, choose another and update `bucket_name`.
6. Initialize a NEW empty production database once with `npm run db:production`. Do not run this initial schema against a database that already contains these tables. Future schema changes must be separate migrations.
7. Run `npm run deploy`. No mail/payment credentials are needed for the supplied functionality. This publishes to your Cloudflare account, so check business details first.
8. Add your domain through the deployed Worker's custom-domain settings. Keep the API and storefront on the same origin.

Cloudflare resource usage may incur charges according to your account's plan. The package does not create or purchase resources until you run the deployment commands yourself.

## Local development

After `npm install`, run `npm run db:local` once, then `npm run dev`. Use the local URL Wrangler prints; opening HTML files directly is insufficient for the server features. Local D1/R2 data is separate from production. `npm test` runs the automated commerce checks entirely against temporary local data; it does not submit real orders.

## Where to edit

- `templates/home.html`, `about.html`, `quote.html`, `footer.html`, `shop-hero.html`: preserved HTML.
- `lib/pages.js`: shared layout and shop/product/cart/checkout HTML.
- `public/styles.css`: compiled original stylesheet. `public/repairs.css`: conversion/responsive/accessibility fixes; edit this for straightforward styling changes.
- `public/store.js`: browser interactions, guest cart, builder, forms and slideshows.
- `lib/api.js`: JavaScript backend; `lib/db.js`: database access; `drizzle/*.sql`: schema and stock-safety trigger.
- `lib/catalog.json`: initial catalog seed. Editing it does not overwrite products already in D1; existing records must be updated in your database.
- `public/images` and `public/videos`: original media. The two oversized hero videos have been recompressed to 720p while keeping their full duration.

After source changes run `npm run build` to regenerate `worker.js`, then deploy. Direct CSS/JS/media edits are included automatically as public assets. Do not ship your local `.wrangler` data, credentials, customer records or backups publicly.

## Reading submissions without an admin page

Use the Cloudflare dashboard's D1 console or `npx wrangler d1 execute DB --remote --command="SELECT id,full_name,total_cents,status,created FROM orders ORDER BY created DESC LIMIT 50"`. Amounts are stored as integer minor units (100 = AED 1). Other tables: `order_items`, `quotes`, `attachments`, `newsletter`, `chat_leads` and `settings`.

Attachment metadata records the private R2 `object_key`; retrieve it using your authenticated R2 tools, not a public bucket URL. There is intentionally no unauthenticated endpoint to list customer information or attachments. Back up the database and choose an appropriate retention schedule for guest state, expired rate-limit rows and customer records.

## Fixes and checks

- Removed the account/admin interfaces, login gates and frontend imports of admin scripts.
- Fixed an unclosed video element, missing category imagery, broken placeholder WhatsApp destination, quote budget restrictions and inconsistent message counter.
- Added server-side validation, same-origin write checks, rate limits, private upload storage and file signature/size checks.
- Used integer money amounts, transactional stock checks and idempotent orders. A failed order rolls back its inventory changes.
- Added dialog keyboard handling, accessible button labels, touch-accessible quick-add, video/slideshow pause controls and reduced-motion support.
- Added graceful failure states and disabled submission while requests are pending; no fake success messages.
- Automated tests cover these backend flows and local media references. A browser-based visual comparison has not been performed.

VIDEO-FREE EDITION
Video files and embedded video elements have been removed. Original sections,
text, images, styles and backend files remain. Video areas use their existing
backgrounds until replacement videos are chosen. Earlier downloaded ZIPs still
contain the original videos.
