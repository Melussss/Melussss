CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_id` text NOT NULL,
	`filename` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`object_key` text NOT NULL,
	FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cart` (
	`session` text NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	PRIMARY KEY(`session`, `product_id`)
);
--> statement-breakpoint
CREATE TABLE `chat_leads` (
	`id` text PRIMARY KEY NOT NULL,
	`session` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`message` text NOT NULL,
	`product_id` integer,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `newsletter` (
	`email` text PRIMARY KEY NOT NULL,
	`created` integer NOT NULL,
	`status` text DEFAULT 'new' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` text NOT NULL,
	`product_id` integer NOT NULL,
	`name` text NOT NULL,
	`quantity` integer NOT NULL,
	`price_cents` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`session` text NOT NULL,
	`request_key` text NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`city` text NOT NULL,
	`address` text NOT NULL,
	`subtotal_cents` integer NOT NULL,
	`tax_cents` integer NOT NULL,
	`shipping_cents` integer NOT NULL,
	`total_cents` integer NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`payment` text DEFAULT 'cash_on_delivery' NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_idempotency` ON `orders` (`session`,`request_key`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`price_cents` integer NOT NULL,
	`stock` integer NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`condition` text NOT NULL,
	`image` text NOT NULL,
	`brand` text DEFAULT '' NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`session` text NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`area` text NOT NULL,
	`quote_type` text NOT NULL,
	`budget` text,
	`message` text NOT NULL,
	`details` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recent` (
	`session` text NOT NULL,
	`product_id` integer NOT NULL,
	`viewed` integer NOT NULL,
	PRIMARY KEY(`session`, `product_id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wishlist` (
	`session` text NOT NULL,
	`product_id` integer NOT NULL,
	PRIMARY KEY(`session`, `product_id`)
);
--> statement-breakpoint
CREATE TRIGGER validate_order_stock BEFORE INSERT ON order_items
BEGIN
 SELECT CASE WHEN NEW.quantity < 1 OR NEW.quantity > 10 OR NEW.quantity != CAST(NEW.quantity AS INTEGER) THEN RAISE(ABORT, 'stock_invalid_quantity') END;
 SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM products WHERE id = NEW.product_id AND active = 1 AND stock >= NEW.quantity) THEN RAISE(ABORT, 'stock_unavailable') END;
 SELECT CASE WHEN NEW.price_cents != (SELECT price_cents FROM products WHERE id = NEW.product_id) THEN RAISE(ABORT, 'price_changed') END;
 SELECT CASE WHEN COALESCE((SELECT c.quantity FROM cart c JOIN orders o ON o.session=c.session WHERE o.id=NEW.order_id AND c.product_id=NEW.product_id),0) != NEW.quantity THEN RAISE(ABORT, 'cart_changed') END;
 UPDATE products SET stock = stock - NEW.quantity WHERE id = NEW.product_id;
END;
