import { Elysia, Static, t } from "elysia"
import { db } from "../database"
import { buckets, insertBucketSchema, selectBucketSchema } from "../database/schema/bucket"
import { eq } from "drizzle-orm"

export const bucketRoute = new Elysia()
    .decorate("db", db)
    .group('/buckets', (app) =>
        app
            .post('', async ({ body, db }): Promise<Static<typeof selectBucketSchema>> => {
                const regExp = new RegExp(/^[a-zA-Z0-9_-]+$/)
                if (!regExp.test(body.name)){
                    throw "name is not valid"
                }
                const name = body.name.toLocaleLowerCase()
                const [bucket] = await db.insert(buckets).values({ name }).returning();
                return { name: bucket.name, configuration: bucket.configuration };
            }, {
                response: selectBucketSchema,
                body: insertBucketSchema
            })
            .get('', async ({ db }) => {
                const bucketsList = await db.select({name: buckets.name}).from(buckets);
                return bucketsList;
            })
            .delete('/:name', async ({ db, params }) => {
                await db.delete(buckets).where(eq(buckets.name, params.name))
                return
            }, {params: t.Object(
                {
                    name: t.String()
                }
            )}
    )
)