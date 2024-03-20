import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox';
import {t} from 'elysia'

export const buckets = pgTable("buckets", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull().unique(),
});

const baseInsertSchema = createInsertSchema(buckets)
export const insertBucketSchema = t.Omit(baseInsertSchema, ['id']);

export const baseSelectSchema = createSelectSchema(buckets)
export const selectBucketSchema = t.Omit(baseSelectSchema, ['id']);
