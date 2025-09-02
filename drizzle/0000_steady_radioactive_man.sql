CREATE TABLE "authors" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"biography" text,
	"email" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "authors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"isbn" varchar(20) NOT NULL,
	"description" text,
	"publication_year" integer,
	"pages" integer,
	"price" numeric(10, 2),
	"copies_available" integer DEFAULT 0 NOT NULL,
	"total_copies" integer DEFAULT 0 NOT NULL,
	"author_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "books_isbn_unique" UNIQUE("isbn")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "loans" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"borrower_name" varchar(255) NOT NULL,
	"borrower_email" varchar(255) NOT NULL,
	"borrowed_at" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp NOT NULL,
	"returned_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "authors_first_name_idx" ON "authors" USING btree ("first_name");--> statement-breakpoint
CREATE INDEX "authors_last_name_idx" ON "authors" USING btree ("last_name");--> statement-breakpoint
CREATE INDEX "authors_email_idx" ON "authors" USING btree ("email");--> statement-breakpoint
CREATE INDEX "authors_is_active_idx" ON "authors" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "books_title_idx" ON "books" USING btree ("title");--> statement-breakpoint
CREATE INDEX "books_isbn_idx" ON "books" USING btree ("isbn");--> statement-breakpoint
CREATE INDEX "books_author_id_idx" ON "books" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "books_category_id_idx" ON "books" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "books_is_active_idx" ON "books" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "categories_name_idx" ON "categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "categories_is_active_idx" ON "categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "loans_book_id_idx" ON "loans" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "loans_borrower_email_idx" ON "loans" USING btree ("borrower_email");--> statement-breakpoint
CREATE INDEX "loans_due_date_idx" ON "loans" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "loans_is_active_idx" ON "loans" USING btree ("is_active");