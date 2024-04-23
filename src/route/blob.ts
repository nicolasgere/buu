import { Elysia, Static, t } from "elysia"
import { db } from "../database"
import { buckets, insertBucketSchema, selectBucketSchema } from "../database/schema/bucket"
import { DiskStorage } from '../storage/disk'
import { eq, and } from "drizzle-orm"
import { blobs } from "../database/schema/blob"
import os from 'os'
import { basename, extname } from 'path'
import { Authz } from "../authz"

function extractFromPath(originalPath: string): { directory: string, name: string, extension: string } {
    let extension = extname(originalPath)
    if(originalPath.startsWith('/')){
        originalPath = originalPath.slice(1)
    }
    return {
        directory: originalPath.replace(`/${basename(originalPath)}`, ''),
        name: basename(originalPath, extension),
        extension: extension.replace('.', '')

    }
}


export const blobRoute = new Elysia()
    .decorate("db", db)
    .decorate('actor', { anonymous: true })
    .decorate("storage", new DiskStorage(os.tmpdir()))
    .group('/buckets/:bucketName/blobs', (app) =>
        app
            .post('/upload', async ({ body, params, db, storage }) => {
                const [bucket] = await db.select().from(buckets).where(eq(buckets.name, params.bucketName)).limit(1)
                if (!bucket) {
                    throw new Error('Bucket not found')
                }
                const { directory, name, extension } = extractFromPath(body.path)
                const buffer = await body.file.arrayBuffer()
                // Check if blob already exists
                let [blob] = await db.select().from(blobs).where(and(eq(blobs.bucket_id, bucket.id), eq(blobs.extension, extension), eq(blobs.directory, directory), eq(blobs.name, name))).limit(1)
                if (!blob) {
                     [blob] = await db.insert(blobs).values({ bucket_id: bucket.id, directory, name, extension, content_size: buffer.byteLength }).returning()

                }
                await storage.upload(blob.id, buffer)
                  // remove bucket_id from response
                return { directory: blob.directory, name: blob.name, extension: blob.extension, content_size: blob.content_size}
            }, {
                body: t.Object({ path: t.String(), file: t.File({ minSize: 1, maxSize: 100000 }) }),
                params: t.Object({ bucketName: t.String() })
            })
            .get('/list', async ({ db, params }) => {
                const [bucket] = await db.select().from(buckets).where(eq(buckets.name, params.bucketName)).limit(1)
                if (!bucket) {
                    throw new Error('Bucket not found')
                }
                const blobList = await db.select().from(blobs).where(eq(blobs.bucket_id, bucket.id));
                console.log(blobList)
                return blobList;
            },{
                params: t.Object({ bucketName: t.String() })
            })
            .get('/*', async ({ actor, db, params, storage }) => {
                const [bucket] = await db.select().from(buckets).where(eq(buckets.name, params.bucketName)).limit(1)
                if (!bucket) {
                    throw new Error('Bucket not found')
                }
                Authz.can(actor, { name: 'blob_get' }, { configuration: bucket.configuration })

                const { directory, name, extension } = extractFromPath(params["*"])
                const [blob] = await db.select().from(blobs).where(and(eq(blobs.bucket_id, bucket.id), eq(blobs.extension, extension), eq(blobs.directory, directory), eq(blobs.name, name))).limit(1)
                if (!blob) {
                    throw new Error('Blob not found')
                }
                const file = await storage.get(blob.id)
                return file
            }, {
                params: t.Object({ '*': t.String(), bucketName: t.String() })
            })
    )
