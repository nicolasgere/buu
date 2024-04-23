import { pgTable, text, uuid, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox';
import {Static, t} from 'elysia'

const bucketConfigurationSchema = t.Object({
	public: t.Boolean()
})
export type BucketConfiguration = Static<typeof bucketConfigurationSchema>

export const buckets = pgTable("buckets", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull().unique(),
	configuration: json('json').$type<BucketConfiguration>().notNull().default({public: false})
});

const baseInsertSchema = createInsertSchema(buckets)
export const insertBucketSchema = t.Omit(baseInsertSchema, ['id']);

export const baseSelectSchema = createSelectSchema(buckets)
export const selectBucketSchema = t.Omit(baseSelectSchema, ['id']);
