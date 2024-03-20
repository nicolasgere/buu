import { pgTable, text, uuid, bigint, unique } from "drizzle-orm/pg-core";


export const blobs = pgTable("blobs", {
	id: uuid("id").primaryKey().defaultRandom(),
	directory: text("directory").notNull(),
	name: text("name").notNull(),
	extension: text("extension").notNull(),
	bucket_id: uuid("bucket_id").notNull(),
	content_size: bigint("content_size", { mode: 'number' }).notNull(),
}, (t) => ({
	unq: unique().on(t.bucket_id, t.directory, t.name, t.extension),
  }));
